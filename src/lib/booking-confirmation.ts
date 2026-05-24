import Stripe from "stripe";
import { sql } from "drizzle-orm";

import { db, bookings } from "@/db";
import { getBookingByCode } from "@/db/queries";
import { sendBookingNotification } from "@/lib/email";
import { LOCATIONS } from "@/lib/seo/business";
import {
  extraServices,
  getExtraPrice,
  services,
} from "@/data/services";
import { PAY_NOW_PAID_STATUS } from "@/lib/booking-payment";

const SENT_FLAG = "booking_email_sent";

export type ReconcileResult =
  | "sent"
  | "already-sent"
  | "unpaid"
  | "amount-mismatch"
  | "email-failed"
  | "not-found"
  | "not-configured"
  | "error";

/**
 * Verifies a Stripe Checkout session for a pay-now booking. On success, marks
 * the booking paid and fires the EmailJS notification with
 * `payment_status="Already Paid"`. Idempotent via a PaymentIntent metadata
 * flag — refreshing the success page never re-sends.
 */
export async function reconcileBookingPayment(
  code: string,
  sessionId: string
): Promise<ReconcileResult> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return "not-configured";

  const booking = await getBookingByCode(code);
  if (!booking) return "not-found";

  // Already reconciled in a prior request — DB is the fast path.
  if (booking.paymentStatus === "paid") return "already-sent";

  try {
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (session.payment_status !== "paid") return "unpaid";

    // Defence-in-depth: ensure what Stripe charged matches the price we
    // calculated server-side at booking time. A mismatch means either a
    // catalogue change mid-flight or session tampering — refuse to confirm.
    const expectedCents = Math.round(Number(booking.total) * 100);
    const actualCents = session.amount_total ?? 0;
    if (expectedCents !== actualCents) {
      console.error(
        `[booking-confirmation] amount mismatch for ${booking.confirmationCode}: expected ${expectedCents}, got ${actualCents}`,
      );
      return "amount-mismatch";
    }

    const pi = session.payment_intent;
    const piId = typeof pi === "string" ? pi : pi?.id;
    const piMeta = pi && typeof pi !== "string" ? pi.metadata ?? {} : {};

    if (piMeta[SENT_FLAG] === "true") {
      // Backfill DB if Stripe says we already sent.
      await db
        .update(bookings)
        .set({ paymentStatus: "paid" })
        .where(sql`${bookings.id} = ${booking.id}`);
      return "already-sent";
    }

    const svc = services.find((s) => s.id === booking.serviceId);
    const extras = (booking.extras ?? [])
      .map((id) => extraServices.find((e) => e.id === id))
      .filter((e): e is NonNullable<typeof e> => Boolean(e))
      .map((e) => ({
        name: e.name,
        price: getExtraPrice(e, booking.vehicleType),
      }));

    const locationName =
      LOCATIONS.find((l) => l.slug === booking.location)?.addressLocality ??
      booking.location;

    const emailed = await sendBookingNotification({
      confirmationCode: booking.confirmationCode,
      serviceId: booking.serviceId,
      serviceName: booking.serviceName ?? svc?.name ?? booking.serviceId,
      vehicleType: booking.vehicleType,
      location: locationName,
      date: booking.date,
      time: booking.time,
      firstName: booking.firstName,
      lastName: booking.lastName,
      email: booking.email,
      phone: booking.phone,
      address: booking.address,
      notes: booking.notes,
      extras,
      subtotal: Number(booking.subtotal),
      gst: Number(booking.gst),
      total: Number(booking.total),
      paymentStatus: PAY_NOW_PAID_STATUS,
    });

    if (!emailed.ok) return "email-failed";

    await db
      .update(bookings)
      .set({ paymentStatus: "paid", status: "confirmed" })
      .where(sql`${bookings.id} = ${booking.id}`);

    if (piId) {
      await stripe.paymentIntents.update(piId, {
        metadata: { ...piMeta, [SENT_FLAG]: "true" },
      });
    }

    return "sent";
  } catch (err) {
    console.error("[booking-confirmation] reconcile failed", err);
    return "error";
  }
}
