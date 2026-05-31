import crypto from "node:crypto";

const CLOUD_NAME =
  process.env.CLOUDINARY_CLOUD_NAME ??
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
  "";
const API_KEY = process.env.CLOUDINARY_API_KEY ?? "";
const API_SECRET = process.env.CLOUDINARY_API_SECRET ?? "";

export const PRODUCTS_FOLDER = "products";
export const BANNERS_FOLDER = "banners";

export function cloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && API_KEY && API_SECRET);
}

/**
 * Server-side upload of a *remote* image URL into our Cloudinary bucket.
 * Cloudinary fetches the URL itself (passed as `file`), so this is how we
 * make an ephemeral Canva export URL (valid ~24h) permanent. Signed the same
 * way as `signUpload`/`destroyAsset`: sha1 of the alphabetically-sorted
 * `k=v&…` of all signed params (excluding `file`/`api_key`) + the API secret.
 */
export async function uploadRemoteImage(params: {
  url: string;
  folder?: string;
  publicId?: string;
}): Promise<{ url: string; publicId: string; width: number; height: number }> {
  if (!cloudinaryConfigured()) {
    throw new Error("Cloudinary admin credentials are not configured");
  }
  const folder = params.folder ?? BANNERS_FOLDER;
  const timestamp = Math.floor(Date.now() / 1000);

  const toSign: Record<string, string | number> = { folder, timestamp };
  if (params.publicId) toSign.public_id = params.publicId;

  const sorted = Object.keys(toSign)
    .sort()
    .map((k) => `${k}=${toSign[k]}`)
    .join("&");
  const signature = crypto
    .createHash("sha1")
    .update(sorted + API_SECRET)
    .digest("hex");

  const body = new URLSearchParams({
    file: params.url,
    folder,
    timestamp: String(timestamp),
    api_key: API_KEY,
    signature,
  });
  if (params.publicId) body.set("public_id", params.publicId);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary remote upload failed (${res.status}): ${text}`);
  }
  const j = (await res.json()) as {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
  };
  return {
    url: j.secure_url,
    publicId: j.public_id,
    width: j.width,
    height: j.height,
  };
}

/**
 * Sign a Cloudinary upload request. The browser uploads the file bytes
 * directly to Cloudinary using these parameters — no file ever traverses
 * Vercel's function. Cloudinary requires the signature to be over an
 * alphabetically-sorted, ampersand-joined `k=v` string of all params
 * (except `file` / `api_key`), followed by the API secret.
 */
export function signUpload(params: {
  folder: string;
  publicId?: string;
}): {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  publicId?: string;
  signature: string;
} {
  if (!cloudinaryConfigured()) {
    throw new Error("Cloudinary admin credentials are not configured");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const toSign: Record<string, string | number> = {
    folder: params.folder,
    timestamp,
  };
  if (params.publicId) toSign.public_id = params.publicId;

  const sorted = Object.keys(toSign)
    .sort()
    .map((k) => `${k}=${toSign[k]}`)
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(sorted + API_SECRET)
    .digest("hex");

  return {
    cloudName: CLOUD_NAME,
    apiKey: API_KEY,
    timestamp,
    folder: params.folder,
    publicId: params.publicId,
    signature,
  };
}

/**
 * Best-effort extraction of a Cloudinary `public_id` from a delivery URL,
 * for legacy/seeded records that store only the URL. Returns null for any
 * URL that isn't on our own Cloudinary upload bucket.
 *
 * Handles both:
 *   res.cloudinary.com/<cloud>/image/upload/v123/folder/name.webp     → folder/name
 *   res.cloudinary.com/<cloud>/image/upload/name_abc123.jpg            → name_abc123
 *   res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto/v123/x.png   → x  (strips transform)
 */
export function publicIdFromUrl(url: string): string | null {
  if (!CLOUD_NAME) return null;
  const m = url.match(
    new RegExp(
      `^https://res\\.cloudinary\\.com/${CLOUD_NAME}/image/upload/(.+)$`,
    ),
  );
  if (!m) return null;
  let rest = m[1];
  // Strip leading transformation segment if present.
  rest = rest.replace(/^[a-z]_[^/]+(?:,[a-z]_[^/]+)*\//, "");
  // Strip version segment (v123456789/).
  rest = rest.replace(/^v\d+\//, "");
  // Strip file extension.
  rest = rest.replace(/\.[a-z0-9]+$/i, "");
  return rest || null;
}

/** Delete an uploaded asset via the Cloudinary Admin API. */
export async function destroyAsset(publicId: string): Promise<void> {
  if (!cloudinaryConfigured()) {
    throw new Error("Cloudinary admin credentials are not configured");
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const sorted = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(sorted + API_SECRET)
    .digest("hex");

  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: API_KEY,
    signature,
  });

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
    {
      method: "POST",
      body,
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary destroy failed (${res.status}): ${text}`);
  }
}
