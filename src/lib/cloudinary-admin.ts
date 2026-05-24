import crypto from "node:crypto";

const CLOUD_NAME =
  process.env.CLOUDINARY_CLOUD_NAME ??
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
  "";
const API_KEY = process.env.CLOUDINARY_API_KEY ?? "";
const API_SECRET = process.env.CLOUDINARY_API_SECRET ?? "";

export const PRODUCTS_FOLDER = "products";

export function cloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && API_KEY && API_SECRET);
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
