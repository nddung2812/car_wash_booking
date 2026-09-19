import { desc, eq, like, sql } from "drizzle-orm";
import { db, bookings, orders } from "./index";

/**
 * A calendar month as `YYYY-MM`, e.g. "2026-09". Scopes a dashboard query to
 * the bookings *reserved* in that month (`bookings.date`, the column the table
 * labels "Reserved Date"), not the ones created in it. `undefined` = all time.
 */
export type BookingMonth = string;

/** Prefix-match the text `YYYY-MM-DD` date column; uses `bookings_date_idx`. */
function inMonth(month?: BookingMonth) {
  return month ? like(bookings.date, `${month}-%`) : undefined;
}

export async function listBookings(limit = 50, month?: BookingMonth) {
  return db
    .select()
    .from(bookings)
    .where(inMonth(month))
    .orderBy(desc(bookings.createdAt))
    .limit(limit);
}

/**
 * Every month that has at least one booking, newest first, with its count —
 * the option list for the dashboard's month filter. Rows whose `date` is not a
 * `YYYY-MM-…` string are skipped rather than grouped into a junk bucket.
 */
export async function listBookingMonths() {
  return db
    .select({
      month: sql<string>`substring(${bookings.date} from 1 for 7)`,
      count: sql<number>`count(*)::int`,
    })
    .from(bookings)
    .where(sql`${bookings.date} ~ '^[0-9]{4}-[0-9]{2}'`)
    .groupBy(sql`substring(${bookings.date} from 1 for 7)`)
    .orderBy(desc(sql`substring(${bookings.date} from 1 for 7)`));
}

export async function listBookingsByUser(userId: string, limit = 50) {
  return db
    .select()
    .from(bookings)
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.createdAt))
    .limit(limit);
}

export async function getLatestBookingByUser(userId: string) {
  const rows = await db
    .select({ phone: bookings.phone, address: bookings.address })
    .from(bookings)
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function getBookingByCode(code: string) {
  const rows = await db.select().from(bookings).where(sql`${bookings.confirmationCode} = ${code}`);
  return rows[0] ?? null;
}

export async function getBookingStats(month?: BookingMonth) {
  const rows = await db
    .select({
      total: sql<number>`count(*)::int`,
      completed: sql<number>`count(*) filter (where ${bookings.status} = 'completed')::int`,
      pending: sql<number>`count(*) filter (where ${bookings.status} = 'pending')::int`,
      // Revenue counts confirmed and completed bookings. Filtering on
      // 'completed' alone reported $0 against 33 real bookings, because the
      // workflow leaves rows at 'confirmed' and nothing ever promotes them.
      revenue: sql<string>`coalesce(sum(${bookings.total}) filter (where ${bookings.status} in ('confirmed', 'completed')), 0)`,
    })
    .from(bookings)
    .where(inMonth(month));
  return rows[0];
}

export async function getServicePopularity(month?: BookingMonth) {
  return db
    .select({
      label: bookings.serviceName,
      value: sql<number>`count(*)::int`,
    })
    .from(bookings)
    .where(inMonth(month))
    .groupBy(bookings.serviceName)
    .orderBy(desc(sql`count(*)`));
}

export async function listOrdersByUser(userId: string, limit = 50) {
  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

export async function getOrderById(id: string) {
  const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getVehicleDistribution(month?: BookingMonth) {
  return db
    .select({
      label: bookings.vehicleType,
      value: sql<number>`count(*)::int`,
    })
    .from(bookings)
    .where(inMonth(month))
    .groupBy(bookings.vehicleType)
    .orderBy(desc(sql`count(*)`));
}
