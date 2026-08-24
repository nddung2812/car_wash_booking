#!/usr/bin/env node
/**
 * Bulk-transition bookings from `pending` to `confirmed`.
 *
 * Backs up the affected rows to a timestamped JSON file BEFORE writing, so the
 * change can be rolled back with `--rollback <backup.json>`.
 *
 *   node scripts/confirm-pending-bookings.mjs --dry-run     # show what would change
 *   node scripts/confirm-pending-bookings.mjs               # apply
 *   node scripts/confirm-pending-bookings.mjs --rollback backups/<file>.json
 *
 * Only touches rows where status = 'pending'. Never modifies payment_status,
 * totals, or any customer field.
 */
import { neon } from "@neondatabase/serverless";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const rollbackIdx = args.indexOf("--rollback");
const rollbackFile = rollbackIdx !== -1 ? args[rollbackIdx + 1] : null;

const TARGET = "confirmed";
const FROM = "pending";

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error("DATABASE_URL not set and .env.local not found");
  }
  const match = fs.readFileSync(envPath, "utf8").match(/^DATABASE_URL=(.*)$/m);
  if (!match) throw new Error("DATABASE_URL not found in .env.local");
  return match[1].trim().replace(/^["']|["']$/g, "");
}

const sql = neon(loadDatabaseUrl());

async function rollback(file) {
  const rows = JSON.parse(fs.readFileSync(file, "utf8"));
  console.log(`Restoring ${rows.length} bookings from ${file}…`);
  let n = 0;
  for (const row of rows) {
    await sql`update bookings set status = ${row.status}::booking_status,
              updated_at = ${row.updated_at} where id = ${row.id}`;
    n += 1;
  }
  console.log(`Restored ${n} rows.`);
}

async function main() {
  if (rollbackFile) return rollback(rollbackFile);

  const rows = await sql`
    select id, confirmation_code, date, time, service_name,
           first_name, last_name, total, status, payment_status, updated_at
    from bookings where status = ${FROM} order by date`;

  if (rows.length === 0) {
    console.log(`No bookings with status '${FROM}'. Nothing to do.`);
    return;
  }

  console.log(`${rows.length} booking(s) with status '${FROM}':\n`);
  for (const r of rows) {
    console.log(
      `  ${r.date}  ${r.confirmation_code}  ` +
        `${`${r.first_name} ${r.last_name}`.padEnd(20)} ` +
        `${r.service_name.padEnd(22)} $${r.total}`,
    );
  }
  const sum = rows.reduce((a, r) => a + Number(r.total), 0);
  console.log(`\n  Combined value: $${sum.toFixed(2)}`);

  if (dryRun) {
    console.log(`\n[dry run] Would set status '${FROM}' -> '${TARGET}'. No changes made.`);
    return;
  }

  // Back up before mutating so this is reversible.
  const dir = path.resolve(process.cwd(), "backups");
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backup = path.join(dir, `bookings-status-${stamp}.json`);
  fs.writeFileSync(backup, JSON.stringify(rows, null, 2));
  console.log(`\nBackup written: ${backup}`);

  const updated = await sql`
    update bookings set status = ${TARGET}::booking_status, updated_at = now()
    where status = ${FROM}
    returning confirmation_code`;
  console.log(`Updated ${updated.length} booking(s) -> '${TARGET}'.`);

  const after = await sql`
    select status, count(*)::int as n, coalesce(sum(total), 0)::float as revenue
    from bookings group by status order by n desc`;
  console.table(after);
  console.log(`\nRollback with:\n  node scripts/confirm-pending-bookings.mjs --rollback ${backup}`);
}

main().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
