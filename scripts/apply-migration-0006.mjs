#!/usr/bin/env node
/**
 * One-shot applier for migration 0006 (additive: two new columns on
 * `bookings` for the seniors & pensioner discount). Safe to run before the
 * code that uses them is deployed — the previous code never references the
 * columns, and both have a default / are nullable.
 *
 *   node --env-file=.env.local scripts/apply-migration-0006.mjs
 *
 * Idempotent: re-running skips columns that already exist.
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL not set");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = resolve(
  __dirname,
  "..",
  "src",
  "db",
  "migrations",
  "0006_mysterious_ezekiel_stane.sql",
);
const statements = readFileSync(sqlPath, "utf-8")
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

const sql = neon(url);

console.log(`→ Applying ${statements.length} statements from 0006…`);
for (const [i, stmt] of statements.entries()) {
  const label = stmt.split("\n")[0].slice(0, 80);
  try {
    await sql.query(stmt);
    console.log(`  ✓ [${i + 1}/${statements.length}] ${label}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("already exists")) {
      console.log(`  ↷ [${i + 1}/${statements.length}] skipped (exists): ${label}`);
      continue;
    }
    console.error(`  ✗ [${i + 1}/${statements.length}] ${label}`);
    console.error(`     ${msg}`);
    process.exit(1);
  }
}

const cols = await sql.query(
  "select column_name, data_type, column_default, is_nullable from information_schema.columns where table_name = 'bookings' and column_name in ('discount_amount','discount_type') order by column_name",
);
console.table(cols);
const [{ n, discounted }] = await sql.query(
  "select count(*)::int as n, count(*) filter (where discount_amount <> 0)::int as discounted from bookings",
);
console.log(`✓ Migration 0006 applied — ${n} existing bookings, ${discounted} with a discount`);
