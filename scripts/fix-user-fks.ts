/**
 * One-shot:
 *  1. Switch bookings/orders FKs to ON UPDATE CASCADE so we can re-key
 *     users.id without breaking child rows.
 *  2. Re-key the existing user from the old Clerk id (passed in argv[2]) to
 *     the new one (argv[3]) — historical bookings/orders cascade across.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/fix-user-fks.ts <oldClerkId> <newClerkId>
 *
 * Or with no args, only the FK migration runs.
 */
import { sql } from "drizzle-orm";
import { db, users } from "../src/db";

async function main() {
  console.log("→ Dropping and recreating FKs with ON UPDATE CASCADE…");
  await db.execute(sql`
    ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_user_id_users_id_fk;
  `);
  await db.execute(sql`
    ALTER TABLE bookings
      ADD CONSTRAINT bookings_user_id_users_id_fk
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE SET NULL ON UPDATE CASCADE;
  `);
  await db.execute(sql`
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_users_id_fk;
  `);
  await db.execute(sql`
    ALTER TABLE orders
      ADD CONSTRAINT orders_user_id_users_id_fk
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE SET NULL ON UPDATE CASCADE;
  `);
  console.log("✓ FKs updated");

  const oldId = process.argv[2];
  const newId = process.argv[3];
  if (!oldId || !newId) {
    console.log("\nNo re-key args supplied — skipping users.id update.");
    return;
  }

  const existing = await db
    .select()
    .from(users)
    .where(sql`${users.id} = ${oldId}`)
    .limit(1);
  if (existing.length === 0) {
    console.log(`× No user found with id ${oldId} — nothing to re-key.`);
    return;
  }

  await db
    .update(users)
    .set({ id: newId })
    .where(sql`${users.id} = ${oldId}`);
  console.log(`✓ Re-keyed user ${oldId} → ${newId} (children cascaded).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
