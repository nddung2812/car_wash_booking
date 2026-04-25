import { desc, sql } from "drizzle-orm";
import { db, bookings } from "./index";

export async function listBookings(limit = 50) {
  return db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(limit);
}

export async function getBookingByCode(code: string) {
  const rows = await db.select().from(bookings).where(sql`${bookings.confirmationCode} = ${code}`);
  return rows[0] ?? null;
}

export async function getBookingStats() {
  const rows = await db
    .select({
      total: sql<number>`count(*)::int`,
      completed: sql<number>`count(*) filter (where ${bookings.status} = 'completed')::int`,
      pending: sql<number>`count(*) filter (where ${bookings.status} = 'pending')::int`,
      revenue: sql<string>`coalesce(sum(${bookings.total}) filter (where ${bookings.status} = 'completed'), 0)`,
    })
    .from(bookings);
  return rows[0];
}

export async function getServicePopularity() {
  return db
    .select({
      label: bookings.serviceName,
      value: sql<number>`count(*)::int`,
    })
    .from(bookings)
    .groupBy(bookings.serviceName)
    .orderBy(desc(sql`count(*)`));
}

export async function getVehicleDistribution() {
  return db
    .select({
      label: bookings.vehicleType,
      value: sql<number>`count(*)::int`,
    })
    .from(bookings)
    .groupBy(bookings.vehicleType)
    .orderBy(desc(sql`count(*)`));
}
