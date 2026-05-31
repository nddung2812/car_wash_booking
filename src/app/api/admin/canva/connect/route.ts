import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { isCurrentUserAdmin } from "@/lib/auth";
import { canvaConfigured } from "@/lib/canva/tokens";

/**
 * One-time Canva Connect OAuth seeding — STEP 1 (authorize).
 *
 * Run this once, signed in as an admin, to authorise the single shared Canva
 * account. It builds a PKCE (S256) authorize URL, stashes the verifier + state
 * in short-lived httpOnly cookies, and redirects to Canva. The callback route
 * completes the exchange and stores the first (rotating) refresh token.
 */

const AUTHORIZE_URL = "https://www.canva.com/api/oauth/authorize";
const SCOPES = [
  "design:meta:read",
  "design:content:write",
  "asset:read",
  "asset:write",
  "brandtemplate:meta:read",
  "brandtemplate:content:read",
].join(" ");

const base64url = (buf: Buffer) =>
  buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

export async function GET() {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!canvaConfigured()) {
    return NextResponse.json(
      { error: "Set CANVA_CLIENT_ID and CANVA_CLIENT_SECRET first." },
      { status: 503 },
    );
  }
  const redirectUri = process.env.CANVA_OAUTH_REDIRECT_URI;
  if (!redirectUri) {
    return NextResponse.json(
      { error: "Set CANVA_OAUTH_REDIRECT_URI." },
      { status: 503 },
    );
  }

  const verifier = base64url(crypto.randomBytes(96));
  const challenge = base64url(
    crypto.createHash("sha256").update(verifier).digest(),
  );
  const state = base64url(crypto.randomBytes(24));

  const jar = await cookies();
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
  };
  jar.set("canva_pkce_verifier", verifier, cookieOpts);
  jar.set("canva_oauth_state", state, cookieOpts);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.CANVA_CLIENT_ID!,
    redirect_uri: redirectUri,
    scope: SCOPES,
    code_challenge: challenge,
    code_challenge_method: "S256",
    state,
  });

  return NextResponse.redirect(`${AUTHORIZE_URL}?${params.toString()}`);
}
