import { eq, and } from "drizzle-orm";
import { db, canvaOauth, type CanvaOauthRow } from "@/db";

/**
 * Canva Connect OAuth token management for the single shared business account.
 *
 * The dominant risk here is refresh-token ROTATION: every successful refresh
 * returns a brand-new refresh token and invalidates the old one. Using a
 * refresh token twice revokes the entire chain ("refresh token used twice").
 * Defences:
 *   1. The rotating token lives in the DB (`canva_oauth`, singleton id=1), not
 *      env — env can't be rewritten at runtime on serverless.
 *   2. An in-process single-flight promise collapses concurrent refreshes in
 *      the same instance into one Canva call.
 *   3. The new tokens are written with a conditional UPDATE guarded on the old
 *      refresh token, so only one writer wins; a loser re-reads the row.
 *
 * Cross-instance races (two cold serverless instances refreshing at once)
 * can't be fully prevented without a distributed lock; for the admin-only,
 * low-concurrency banner use case they are rare and self-heal on re-seed.
 */

const TOKEN_URL = "https://api.canva.com/rest/v1/oauth/token";
const SINGLETON_ID = 1;
/** Refresh slightly before the real expiry to avoid edge-of-expiry failures. */
const EXPIRY_SKEW_MS = 60_000;

const CLIENT_ID = process.env.CANVA_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.CANVA_CLIENT_SECRET ?? "";

export function canvaConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

let refreshInFlight: Promise<string> | null = null;

async function readRow(): Promise<CanvaOauthRow | undefined> {
  const rows = await db
    .select()
    .from(canvaOauth)
    .where(eq(canvaOauth.id, SINGLETON_ID));
  return rows[0];
}

type CanvaTokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
};

/**
 * Exchange the current refresh token for a new access token, persisting the
 * rotated refresh token. Guarded so it runs at most once concurrently per
 * instance. Returns a valid access token.
 */
async function refreshAccessToken(oldRefreshToken: string): Promise<string> {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: oldRefreshToken,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    // A loser of a cross-instance race lands here ("refresh token used twice"):
    // re-read the row — a sibling may have already written a fresh access token.
    const current = await readRow();
    if (
      current?.accessToken &&
      current.refreshToken !== oldRefreshToken &&
      current.accessTokenExpiresAt &&
      current.accessTokenExpiresAt.getTime() - EXPIRY_SKEW_MS > Date.now()
    ) {
      return current.accessToken;
    }
    throw new Error(
      `Canva token refresh failed (${res.status}): ${text}. ` +
        `Re-seed the Canva connection at /api/admin/canva/connect.`,
    );
  }

  const data = (await res.json()) as CanvaTokenResponse;
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  // Conditional write: only the holder of the old refresh token wins.
  const updated = await db
    .update(canvaOauth)
    .set({
      refreshToken: data.refresh_token,
      accessToken: data.access_token,
      accessTokenExpiresAt: expiresAt,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(canvaOauth.id, SINGLETON_ID),
        eq(canvaOauth.refreshToken, oldRefreshToken),
      ),
    )
    .returning();

  if (updated.length === 0) {
    // Someone rotated underneath us; trust whatever is now persisted.
    const current = await readRow();
    if (current?.accessToken) return current.accessToken;
  }
  return data.access_token;
}

/**
 * Return a valid Canva Connect access token for the shared account, refreshing
 * (and rotating the stored refresh token) when the cached one is near expiry.
 * Throws a clear, actionable error if the account hasn't been connected yet.
 */
export async function getValidAccessToken(): Promise<string> {
  if (!canvaConfigured()) {
    throw new Error(
      "Canva is not configured. Set CANVA_CLIENT_ID and CANVA_CLIENT_SECRET.",
    );
  }

  const row = await readRow();
  if (!row) {
    throw new Error(
      "Canva account is not connected yet. Visit /api/admin/canva/connect once " +
        "(signed in as an admin) to authorise the shared Canva account.",
    );
  }

  const fresh =
    row.accessToken &&
    row.accessTokenExpiresAt &&
    row.accessTokenExpiresAt.getTime() - EXPIRY_SKEW_MS > Date.now();
  if (fresh) return row.accessToken!;

  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken(row.refreshToken).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

/** Seed/replace the singleton row after a successful OAuth code exchange. */
export async function storeInitialTokens(params: {
  refreshToken: string;
  accessToken: string;
  expiresInSeconds: number;
}): Promise<void> {
  const expiresAt = new Date(Date.now() + params.expiresInSeconds * 1000);
  await db
    .insert(canvaOauth)
    .values({
      id: SINGLETON_ID,
      refreshToken: params.refreshToken,
      accessToken: params.accessToken,
      accessTokenExpiresAt: expiresAt,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: canvaOauth.id,
      set: {
        refreshToken: params.refreshToken,
        accessToken: params.accessToken,
        accessTokenExpiresAt: expiresAt,
        updatedAt: new Date(),
      },
    });
}

export async function isCanvaConnected(): Promise<boolean> {
  if (!canvaConfigured() || !process.env.DATABASE_URL) return false;
  try {
    return Boolean(await readRow());
  } catch {
    return false;
  }
}