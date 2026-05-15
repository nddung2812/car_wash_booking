import type Stripe from "stripe";

import { sendOrderConfirmation } from "@/lib/email";
import { gstComponent } from "@/lib/products";

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

export function shortRef(sessionId: string): string {
  return sessionId.replace(/^cs_(test_|live_)?/, "").slice(0, 12).toUpperCase();
}

type ShippingDetailsLike = {
  name?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
} | null;

export function getShippingAmount(session: Stripe.Checkout.Session): number {
  const cents =
    session.shipping_cost?.amount_total ??
    session.total_details?.amount_shipping ??
    0;
  return cents / 100;
}

/**
 * Tolerates both the newer `collected_information.shipping_details` and the
 * legacy `shipping_details` shapes across Stripe API versions.
 */
export function formatShippingAddress(
  session: Stripe.Checkout.Session
): { name: string | null; text: string } | null {
  const s = session as Stripe.Checkout.Session & {
    collected_information?: { shipping_details?: ShippingDetailsLike } | null;
    shipping_details?: ShippingDetailsLike;
  };
  const details: ShippingDetailsLike =
    s.collected_information?.shipping_details ?? s.shipping_details ?? null;

  const addr = details?.address;
  if (!addr) return null;

  const text = [
    addr.line1,
    addr.line2,
    [addr.city, addr.state, addr.postal_code].filter(Boolean).join(" "),
    addr.country,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");

  if (!text) return null;
  return { name: details?.name?.trim() || null, text };
}

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
      expand: ["line_items", "payment_intent"],
    });

    if (session.payment_status !== "paid") return { result: "unpaid", session };

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
