import type Stripe from "stripe";

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

export function shortRef(sessionId: string): string {
  return sessionId.replace(/^cs_(test_|live_)?/, "").slice(0, 12).toUpperCase();
}
