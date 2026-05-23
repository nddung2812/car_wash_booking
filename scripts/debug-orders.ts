import { sql } from "drizzle-orm";
import { db, orders, users } from "../src/db";

async function main() {
  const all = await db
    .select({
      id: orders.id,
      userId: orders.userId,
      email: orders.email,
      total: orders.total,
      stripeSessionId: orders.stripeSessionId,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .orderBy(sql`${orders.createdAt} desc`)
    .limit(10);

  console.log("\nORDERS (last 10):");
  console.table(all);

  const u = await db.select().from(users);
  console.log("\nUSERS:");
  console.table(u);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
