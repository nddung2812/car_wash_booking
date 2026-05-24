#!/usr/bin/env node
/**
 * One-shot applier for migration 0002 (additive: new tables + FK rebuilds with
 * identical semantics). Uses the same neon HTTP driver the app uses so it
 * works without DATABASE_URL_UNPOOLED.
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
  "0002_overconfident_ezekiel.sql",
);
const raw = readFileSync(sqlPath, "utf-8");

// drizzle-kit separates statements with --> statement-breakpoint
const statements = raw
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

const sql = neon(url);

console.log(`→ Applying ${statements.length} statements from 0002…`);
for (const [i, stmt] of statements.entries()) {
  const label = stmt.split("\n")[0].slice(0, 80);
  try {
    await sql.query(stmt);
    console.log(`  ✓ [${i + 1}/${statements.length}] ${label}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Tolerate "already exists" for re-runs.
    if (msg.includes("already exists")) {
      console.log(`  ↷ [${i + 1}/${statements.length}] skipped (exists): ${label}`);
      continue;
    }
    console.error(`  ✗ [${i + 1}/${statements.length}] ${label}`);
    console.error(`     ${msg}`);
    process.exit(1);
  }
}
console.log("✓ Migration 0002 applied");
