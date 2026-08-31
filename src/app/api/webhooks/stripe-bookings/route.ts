import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sql } from "drizzle-orm";

import { db, bookings } from "@/db";
import { reconcileBookingPayment } from "@/lib/booking-confirmation";
import { PAY_NOW_PENDING_STATUS } from "@/lib/booking-payment";

// Stripe needs the raw, unparsed body to verify the signature.
export const dynamic = "force-dynamic";

/** Set on every booking Checkout Session in `POST /api/bookings`. */
const BOOKING_SOURCE = "car_wash_booking";

/**
 * Booking payments safety net.
 *
 * The `/success` page is still the primary confirmation path; this covers the
 * customer who pays and then closes the tab before being redirected back —
 * without it their booking stays `pending_payment` forever and the shop never
 * hears about a wash that has been paid for.
 *
 * Deliberately separate from the products webhook: this endpoint has its own
 * signing secret, and it ignores any session that isn't a booking, so store
 * orders delivered here pass straight through untouched.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_BOOKING_WEBHOOK_SECRET;

  if (!secret || !webhookSecret) {
    // Not configured — the success page still reconciles and emails.
    return NextResponse.json({ received: true, handled: false });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const stripe = new Stripe(secret);
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error("[stripe-bookings] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded" &&
    event.type !== "checkout.session.expired"
  ) {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Not ours — most likely a products-store order. Leave it alone.
  if (session.metadata?.source !== BOOKING_SOURCE) {
    return NextResponse.json({ received: true, skipped: "not-a-booking" });
  }

  const code = session.metadata?.booking_code;
  if (!code) {
    console.error("[stripe-bookings] booking session missing booking_code", session.id);
    return NextResponse.json({ received: true, skipped: "no-code" });
  }

  if (event.type === "checkout.session.expired") {
    // Customer never finished paying. Release the row rather than leaving a
    // pending_payment booking on the books. Guarded on the status so a race
    // with a late `completed` delivery can't cancel a paid booking.
    await db
      .update(bookings)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(
        sql`${bookings.confirmationCode} = ${code} and ${bookings.paymentStatus} = ${PAY_NOW_PENDING_STATUS}`
      );
    return NextResponse.json({ received: true, result: "expired" });
  }

  // Shares the idempotency flag with the success page, so whichever arrives
  // second is a no-op.
  const result = await reconcileBookingPayment(code, session.id);
  return NextResponse.json({ received: true, result });
}
