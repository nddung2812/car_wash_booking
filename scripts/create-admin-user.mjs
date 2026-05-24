#!/usr/bin/env node
/**
 * One-time (idempotent) bootstrap of an admin Clerk user.
 *
 * Required env vars (never commit values — pass via shell or .env.local):
 *   CLERK_SECRET_KEY            — Clerk backend secret (sk_test_… / sk_live_…)
 *   ADMIN_BOOTSTRAP_EMAIL       — e.g. hyperdome-admin@lcw.internal
 *   ADMIN_BOOTSTRAP_PASSWORD    — initial password (Clerk policy applies)
 *
 * After creating the user, add ADMIN_BOOTSTRAP_EMAIL to the comma-separated
 * `ADMIN_EMAILS` env var on Vercel so the email is treated as an admin.
 *
 * Run locally:
 *   npm run admin:create
 *
 * Run against prod (one-off, from your machine):
 *   CLERK_SECRET_KEY=sk_live_… \
 *   ADMIN_BOOTSTRAP_EMAIL=hyperdome-admin@lcw.internal \
 *   ADMIN_BOOTSTRAP_PASSWORD='your-strong-password' \
 *   node scripts/create-admin-user.mjs
 */

import { createClerkClient } from "@clerk/backend";

function need(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`✗ Missing required env: ${name}`);
    process.exit(1);
  }
  return v;
}

const secretKey = need("CLERK_SECRET_KEY");
const email = need("ADMIN_BOOTSTRAP_EMAIL");
const password = need("ADMIN_BOOTSTRAP_PASSWORD");

const clerk = createClerkClient({ secretKey });

console.log(`→ Checking for existing user with email: ${email}`);

const existing = await clerk.users.getUserList({ emailAddress: [email] });

if (existing.totalCount > 0) {
  const u = existing.data[0];
  console.log(`✓ User already exists — id: ${u.id}`);
  console.log("  (No password change applied — use Clerk dashboard to reset.)");
  console.log(
    `\nNext step: ensure ${email} is in the ADMIN_EMAILS env var on Vercel.`,
  );
  process.exit(0);
}

console.log("→ Creating new Clerk user…");

const created = await clerk.users.createUser({
  emailAddress: [email],
  password,
  skipPasswordChecks: false,
  skipPasswordRequirement: false,
});

console.log(`✓ Created Clerk user id: ${created.id}`);
console.log(
  `\nNext step: add "${email}" to the ADMIN_EMAILS env var on Vercel,`,
);
console.log("then redeploy so the new value is picked up.");
