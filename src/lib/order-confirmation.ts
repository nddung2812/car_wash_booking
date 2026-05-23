import type Stripe from "stripe";

import { sendOrderConfirmation } from "@/lib/email";
import { gstComponent } from "@/lib/products";
import { recordOrderFromSession } from "@/lib/orders";
import {
  formatShippingAddress,
  getShippingAmount,
  shortRef,
} from "@/lib/stripe-session";

export { formatShippingAddress, getShippingAmount, shortRef };

const SENT_FLAG = "order_confirmation_sent";

export type DeliveryResult =
  | "sent"
  | "already-sent"
  | "unpaid"
  | "email-failed"
  | "error";

export type DeliveryOutcome = {
  result: DeliveryResult;
  /** The expanded session, so callers can render it without re-fetching. */
  session: Stripe.Checkout.Session | null;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Sends the customer order-confirmation email exactly once for a Stripe
 * Checkout session. Idempotency is tracked on the PaymentIntent's metadata,
 * so refreshing the success page or a duplicate webhook never re-sends.
 *
 * Returns the expanded session so the caller (success page) can render the
 * summary without a second `sessions.retrieve` round-trip.
 */
export async function deliverOrderConfirmation(
  stripe: Stripe,
  sessionId: string
): Promise<DeliveryOutcome> {
  let session: Stripe.Checkout.Session | null = null;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: [
        "line_items",
        "line_items.data.price.product",
        "payment_intent",
      ],
    });

    if (session.payment_status !== "paid") return { result: "unpaid", session };

    // Persist the order before doing anything else — even if the email step
    // fails, the customer's purchase is captured for their account page.
    // ON CONFLICT keeps this idempotent across webhook + success page calls.
    await recordOrderFromSession(session).catch((err) => {
      console.error("[order-confirmation] failed to persist order", err);
    });

    const pi = session.payment_intent;
    const paymentIntentId = typeof pi === "string" ? pi : pi?.id;
    const existingMeta =
      pi && typeof pi !== "string" ? pi.metadata ?? {} : {};

    if (existingMeta[SENT_FLAG] === "true") {
      return { result: "already-sent", session };
    }

    const items =
      session.line_items?.data.map((li) => ({
        name: li.description ?? "Item",
        qty: li.quantity ?? 1,
        amount: (li.amount_total ?? 0) / 100,
      })) ?? [];

    const total =
      session.amount_total != null ? session.amount_total / 100 : 0;
    // Prices are GST-inclusive.
    const gst = round2(gstComponent(total));
    const subtotal = round2(total - gst);

    const shippingAddress = formatShippingAddress(session);

    // Prefer the Clerk profile name passed at checkout, then the name the
    // guest typed on Stripe's hosted page.
    const fullName =
      session.metadata?.full_name?.trim() ||
      shippingAddress?.name ||
      session.customer_details?.name?.trim() ||
      null;

    const emailed = await sendOrderConfirmation({
      orderReference: shortRef(session.id),
      customerName: fullName,
      customerEmail:
        session.customer_details?.email ?? session.customer_email ?? "",
      items,
      subtotal,
      gst,
      shipping: getShippingAmount(session),
      shippingAddress: shippingAddress?.text ?? null,
      total,
    });

    if (!emailed.ok) return { result: "email-failed", session };

    if (paymentIntentId) {
      await stripe.paymentIntents.update(paymentIntentId, {
        metadata: { ...existingMeta, [SENT_FLAG]: "true" },
      });
    }

    return { result: "sent", session };
  } catch (err) {
    console.error("[order-confirmation] delivery failed", err);
    return { result: "error", session };
  }
}
