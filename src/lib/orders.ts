import type Stripe from "stripe";

import { db, orders, type OrderLineItem } from "@/db";
import { gstComponent } from "@/lib/products";
import {
  formatShippingAddress,
  getShippingAmount,
} from "@/lib/stripe-session";
import { ensureUserRow } from "@/lib/users";

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Idempotently writes a paid Stripe Checkout session to the `orders` table.
 * Safe to call from multiple paths (success page + webhook) — the unique
 * index on `stripe_session_id` keeps duplicates out via ON CONFLICT.
 *
 * Caller must pass a session that's already been retrieved with
 * line_items + payment_intent expanded.
 */
export async function recordOrderFromSession(
  session: Stripe.Checkout.Session
): Promise<{ inserted: boolean }> {
  if (session.payment_status !== "paid") return { inserted: false };

  const totalCents = session.amount_total ?? 0;
  if (totalCents <= 0) return { inserted: false };

  const total = totalCents / 100;
  const shipping = getShippingAmount(session);
  // Prices are GST-inclusive; only the goods portion carries GST.
  const goods = round2(total - shipping);
  const gst = round2(gstComponent(goods));
  const subtotal = round2(goods - gst);

  const items: OrderLineItem[] =
    session.line_items?.data.map((li) => {
      const productMeta =
        li.price?.product && typeof li.price.product !== "string"
          ? "metadata" in li.price.product
            ? li.price.product.metadata ?? {}
            : {}
          : {};
      return {
        name: li.description ?? "Item",
        qty: li.quantity ?? 1,
        amount: (li.amount_total ?? 0) / 100,
        productId: productMeta.product_id ?? null,
      };
    }) ?? [];

  const shippingAddr = formatShippingAddress(session);
  const clerkUserId = session.metadata?.clerk_user_id ?? null;

  const pi = session.payment_intent;
  const paymentIntentId = typeof pi === "string" ? pi : pi?.id ?? null;

  const email =
    session.customer_details?.email ?? session.customer_email ?? null;
  const fullName =
    session.metadata?.full_name?.trim() ||
    shippingAddr?.name ||
    session.customer_details?.name?.trim() ||
    null;

  // Backfill the users row if the Clerk webhook never synced this user,
  // otherwise the FK insert below blows up.
  const [first, ...rest] = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  const linkUser = clerkUserId
    ? await ensureUserRow({
        clerkUserId,
        email,
        firstName: first ?? null,
        lastName: rest.length ? rest.join(" ") : null,
      })
    : false;

  await db
    .insert(orders)
    .values({
      userId: linkUser ? clerkUserId : null,
      stripeSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
      email: email ?? "unknown",
      fullName,
      phone: session.customer_details?.phone ?? null,
      shippingAddress: shippingAddr?.text ?? null,
      items,
      subtotal: subtotal.toFixed(2),
      gst: gst.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
      currency: (session.currency ?? "aud").toUpperCase(),
      status: "paid",
    })
    .onConflictDoNothing({ target: orders.stripeSessionId });

  return { inserted: true };
}
