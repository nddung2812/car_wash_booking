import { sql } from "drizzle-orm";

import { db, bookings } from "@/db";
import { sendBookingNotification } from "@/lib/email";

type BookingEmailInput = Parameters<typeof sendBookingNotification>[0];

export type DeliveryResult = {
  admin: boolean;
  customer: boolean;
};

/**
 * Sends both halves of a booking confirmation — the internal notification to
 * the business inbox and the customer's own copy — and records on the booking
 * row which ones landed.
 *
 * Three properties matter here:
 *
 *  1. It is always awaited by its callers. The original code fired the send
 *     un-awaited, so Vercel froze the function before the request reached
 *     EmailJS and four bookings went out silently unconfirmed.
 *  2. It never throws. A booking that is saved must stay saved even if email
 *     is completely down.
 *  3. A failure is persisted, not just logged. `admin_email_sent_at` /
 *     `customer_email_sent_at` stay null so the gap is visible in the database
 *     and `scripts/resend-booking-emails.ts --missing` can pick it up later.
 */
export async function deliverBookingEmails(
  bookingId: string,
  params: BookingEmailInput,
  /**
   * Which halves to send. The sweeper passes only the ones still missing so a
   * retry never re-sends a confirmation the customer already has.
   */
  only: { admin?: boolean; customer?: boolean } = { admin: true, customer: true },
): Promise<DeliveryResult> {
  const wantAdmin = only.admin !== false;
  const wantCustomer = only.customer !== false;

  const [adminOutcome, customerOutcome] = await Promise.allSettled([
    wantAdmin ? sendBookingNotification(params) : null,
    wantCustomer
      ? sendBookingNotification({ ...params, recipientOverride: params.email })
      : null,
  ]);

  // A half we deliberately skipped counts as already delivered, so the caller
  // sees the booking as complete rather than perpetually failing.
  const admin = wantAdmin
    ? adminOutcome.status === "fulfilled" && Boolean(adminOutcome.value?.ok)
    : true;
  const customer = wantCustomer
    ? customerOutcome.status === "fulfilled" && Boolean(customerOutcome.value?.ok)
    : true;

  if (!admin || !customer) {
    console.error(
      `[booking-notify] ${params.confirmationCode} incomplete — ` +
        `admin=${admin ? "sent" : "FAILED"} customer=${customer ? "sent" : "FAILED"}`,
    );
  }

  // Only stamp what succeeded, so a partial retry can fill in the rest.
  const now = new Date();
  const patch: Record<string, Date> = {};
  if (wantAdmin && admin) patch.adminEmailSentAt = now;
  if (wantCustomer && customer) patch.customerEmailSentAt = now;

  if (Object.keys(patch).length > 0) {
    try {
      await db
        .update(bookings)
        .set(patch)
        .where(sql`${bookings.id} = ${bookingId}`);
    } catch (err) {
      // The emails went out; failing to record that must not break the booking.
      console.error(
        `[booking-notify] could not record send state for ${params.confirmationCode}`,
        err,
      );
    }
  }

  return { admin, customer };
}
