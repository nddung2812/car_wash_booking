import Stripe from "stripe";
import { sql } from "drizzle-orm";

import { db, bookings } from "@/db";
import { getBookingByCode } from "@/db/queries";
import { sendBookingNotification } from "@/lib/email";
import { LOCATIONS } from "@/lib/seo/business";
import { getMergedExtras } from "@/lib/pricing";
import {
  getExtraPrice,
  services,
} from "@/data/services";
import {
  PAY_NOW_PAID_STATUS,
  PAYMENT_STATUS_DEPOSIT_PAID,
  PAYMENT_STATUS_PAID,
  balanceDue,
  depositPaidStatus,
  isSettled,
} from "@/lib/booking-payment";

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
 * Verifies a Stripe Checkout session for a booking that pays up front — either
 * the full amount or a deposit. On success, records what was captured, marks
 * the booking confirmed and fires the EmailJS notification. Idempotent via a
 * PaymentIntent metadata flag, so refreshing the success page and a webhook
 * delivery for the same session never double-send.
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
  if (isSettled(booking.paymentStatus)) return "already-sent";

  try {
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (session.payment_status !== "paid") return "unpaid";

    // Defence-in-depth: ensure what Stripe charged matches the amount we asked
    // for server-side at booking time — the deposit for a deposit booking, the
    // full total for a pay-now one. A mismatch means either a catalogue change
    // mid-flight or session tampering, so refuse to confirm.
    // (`depositAmount` falls back to total for rows written before the column.)
    const isDeposit = booking.paymentMethod === "deposit";
    const askedFor = Number(booking.depositAmount) || Number(booking.total);
    const expectedCents = Math.round(askedFor * 100);
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

    const amountPaid = Math.round(actualCents) / 100;
    const balance = balanceDue(Number(booking.total), amountPaid);
    const settled = {
      paymentStatus: isDeposit
        ? PAYMENT_STATUS_DEPOSIT_PAID
        : PAYMENT_STATUS_PAID,
      amountPaid: amountPaid.toFixed(2),
      stripePaymentIntentId: piId ?? null,
    };

    if (piMeta[SENT_FLAG] === "true") {
      // Backfill DB if Stripe says we already sent.
      await db
        .update(bookings)
        .set(settled)
        .where(sql`${bookings.id} = ${booking.id}`);
      return "already-sent";
    }

    const svc = services.find((s) => s.id === booking.serviceId);
    const extraCatalogue = await getMergedExtras();
    const extras = (booking.extras ?? [])
      .map((id) => extraCatalogue.find((e) => e.id === id))
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
      paymentStatus: isDeposit
        ? depositPaidStatus(amountPaid, balance)
        : PAY_NOW_PAID_STATUS,
      amountPaid,
      balanceDue: balance,
    });

    if (!emailed.ok) return "email-failed";

    await db
      .update(bookings)
      .set({ ...settled, status: "confirmed", updatedAt: new Date() })
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
