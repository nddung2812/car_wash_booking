// Creates a folder in Cloudinary via the Admin API.
// Usage: node scripts/cloudinary-create-folder.mjs [folder-name]
// Reads CLOUDINARY_* credentials from .env.local. Idempotent.

import { config } from "dotenv";

config({ path: ".env.local" });

const cloud =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const key = process.env.CLOUDINARY_API_KEY;
const secret = process.env.CLOUDINARY_API_SECRET;
const folder = process.argv[2] || "before-after";

if (!cloud || !key || !secret) {
  console.error(
    "Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in .env.local",
  );
  process.exit(1);
}

const auth = "Basic " + Buffer.from(`${key}:${secret}`).toString("base64");

const res = await fetch(
  `https://api.cloudinary.com/v1_1/${cloud}/folders/${encodeURIComponent(folder)}`,
  { method: "POST", headers: { Authorization: auth } },
);

const body = await res.json().catch(() => ({}));

if (res.ok) {
  console.log(`✓ Cloudinary folder ready: "${folder}" (cloud: ${cloud})`);
} else if (
  res.status === 409 ||
  /exist/i.test(body?.error?.message || "")
) {
  console.log(`✓ Folder "${folder}" already exists — nothing to do.`);
} else {
  console.error(`✗ Failed (${res.status}):`, JSON.stringify(body));
  process.exit(1);
}
