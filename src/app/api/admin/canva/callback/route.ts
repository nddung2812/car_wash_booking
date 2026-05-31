import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isCurrentUserAdmin } from "@/lib/auth";
import { canvaConfigured, storeInitialTokens } from "@/lib/canva/tokens";

/**
 * One-time Canva Connect OAuth seeding — STEP 2 (callback).
 *
 * Validates the state, exchanges the authorization code (+ PKCE verifier) for
 * the first access/refresh token pair, and stores it in the `canva_oauth`
 * singleton row. From here on, the token manager rotates it automatically.
 */

const TOKEN_URL = "https://api.canva.com/rest/v1/oauth/token";

type CanvaTokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
};

const fail = (msg: string, status = 400) =>
  new NextResponse(
    `Canva connection failed: ${msg}\n\nRetry at /api/admin/canva/connect.`,
    { status, headers: { "Content-Type": "text/plain" } },
  );

export async function GET(req: Request) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!canvaConfigured()) return fail("Canva client env not set.", 503);

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");
  if (oauthError) return fail(oauthError);
  if (!code || !returnedState) return fail("Missing code or state.");

  const jar = await cookies();
  const verifier = jar.get("canva_pkce_verifier")?.value;
  const savedState = jar.get("canva_oauth_state")?.value;
  if (!verifier || !savedState) return fail("Missing PKCE cookies (expired?).");
  if (returnedState !== savedState) return fail("State mismatch.");

  const redirectUri = process.env.CANVA_OAUTH_REDIRECT_URI;
  if (!redirectUri) return fail("CANVA_OAUTH_REDIRECT_URI not set.", 503);

  const basic = Buffer.from(
    `${process.env.CANVA_CLIENT_ID}:${process.env.CANVA_CLIENT_SECRET}`,
  ).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      code_verifier: verifier,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return fail(`token exchange ${res.status}: ${text}`, 502);
  }

  const data = (await res.json()) as CanvaTokenResponse;
  await storeInitialTokens({
    refreshToken: data.refresh_token,
    accessToken: data.access_token,
    expiresInSeconds: data.expires_in,
  });

  // Clear the one-time PKCE cookies.
  jar.delete("canva_pkce_verifier");
  jar.delete("canva_oauth_state");

  return NextResponse.redirect(
    new URL("/hyperdome-dashboard/banners?connected=1", req.url),
  );
}
