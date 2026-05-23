/**
 * One-shot: attach orphan orders (userId IS NULL) to their owning users row
 * via email match. Safe to re-run.
 */
import { isNull, sql } from "drizzle-orm";
import { db, orders, users } from "../src/db";

async function main() {
  const orphans = await db
    .select({ id: orders.id, email: orders.email })
    .from(orders)
    .where(isNull(orders.userId));

  console.log(`Found ${orphans.length} orphan orders`);
  let linked = 0;

  for (const o of orphans) {
    const match = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`lower(${users.email}) = lower(${o.email})`)
      .limit(1);
    if (match.length === 0) {
      console.log(`  · ${o.id} — no user found for ${o.email}`);
      continue;
    }
    await db
      .update(orders)
      .set({ userId: match[0].id })
      .where(sql`${orders.id} = ${o.id}`);
    console.log(`  ✓ ${o.id} → ${match[0].id} (${o.email})`);
    linked++;
  }

  console.log(`\nLinked ${linked}/${orphans.length} orders`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
