import type { Metadata } from "next";
import Link from "next/link";
import Stripe from "stripe";
import { ArrowRight, CheckCircle2, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AUD } from "@/lib/products";
import {
  deliverOrderConfirmation,
  formatShippingAddress,
  getShippingAmount,
  shortRef,
} from "@/lib/order-confirmation";
import { ClearCartOnMount } from "@/components/cart/ClearCartOnMount";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Thanks for your order — your car care products are on their way.",
  alternates: { canonical: "/products/order-success" },
  robots: { index: false, follow: false },
};

type OrderLine = { name: string; qty: number; amount: number };

type OrderSummary = {
  reference: string | null;
  email: string | null;
  total: number | null;
  shipping: number;
  shippingName: string | null;
  shippingAddress: string | null;
  paid: boolean;
  lines: OrderLine[];
};

async function loadOrder(sessionId: string | undefined): Promise<OrderSummary | null> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret || !sessionId) return null;

  // Fire the idempotent confirmation email and reuse the session it already
  // retrieved — avoids a second sessions.retrieve round-trip per page load.
  const { session } = await deliverOrderConfirmation(
    new Stripe(secret),
    sessionId
  );
  if (!session) return null;

  const lines: OrderLine[] =
    session.line_items?.data.map((li) => ({
      name: li.description ?? "Item",
      qty: li.quantity ?? 1,
      amount: (li.amount_total ?? 0) / 100,
    })) ?? [];

  const shippingAddr = formatShippingAddress(session);

  return {
    reference: shortRef(session.id),
    email: session.customer_details?.email ?? null,
    total: session.amount_total != null ? session.amount_total / 100 : null,
    shipping: getShippingAmount(session),
    shippingName: shippingAddr?.name ?? null,
    shippingAddress: shippingAddr?.text ?? null,
    paid: session.payment_status === "paid",
    lines,
  };
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const order = await loadOrder(session_id);

  return (
    <>
      <ClearCartOnMount />

      <section className="py-16 lg:py-24">
        <div className="container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex size-16 items-center justify-center rounded-pill bg-brand-soft text-primary">
              <CheckCircle2 className="size-8" />
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Order confirmed
            </span>
            <h1 className="font-serif text-[44px] leading-[1.05] tracking-tight text-foreground lg:text-[56px]">
              Thanks{order?.email ? ", you're all set" : " for your order"}.
            </h1>
            <p className="max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              {order?.paid
                ? "Your payment went through and your order is being packed for shipping. We've emailed your receipt."
                : "Your order has been received and is being packed for shipping. We've emailed your receipt."}
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-5 rounded-[20px] border border-line bg-card-gradient p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-line pb-5">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Order reference
                </span>
                <span className="font-mono text-[15px] text-foreground">
                  {order?.reference ?? "Confirmed"}
                </span>
              </div>
              {order?.email && (
                <div className="flex flex-col gap-1 sm:items-end">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    Receipt sent to
                  </span>
                  <span className="text-[15px] text-foreground">
                    {order.email}
                  </span>
                </div>
              )}
            </div>

            {order && order.lines.length > 0 && (
              <ul className="flex flex-col gap-3">
                {order.lines.map((line, i) => (
                  <li
                    key={`${line.name}-${i}`}
                    className="flex items-center justify-between gap-3 text-[14px]"
                  >
                    <span className="text-foreground">
                      {line.name}
                      <span className="ml-2 text-muted-foreground">
                        × {line.qty}
                      </span>
                    </span>
                    <span className="tabular-nums text-foreground">
                      {AUD.format(line.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {order && (
              <div className="flex flex-col gap-2 border-t border-dashed border-line pt-5 text-[14px]">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="tabular-nums">
                    {AUD.format(order.shipping)}
                  </span>
                </div>
                {order.total != null && (
                  <div className="mt-1 flex items-end justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      Total paid
                    </span>
                    <span className="font-serif text-[34px] leading-none text-primary tabular-nums">
                      {AUD.format(order.total)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2 rounded-[16px] bg-secondary/60 p-5 text-[14px] text-foreground/85">
              <span className="inline-flex items-center gap-2 font-semibold">
                <Truck className="size-4 text-primary" />
                Shipping to
              </span>
              {order?.shippingAddress ? (
                <p className="leading-relaxed text-muted-foreground">
                  {order.shippingName && (
                    <span className="block text-foreground">
                      {order.shippingName}
                    </span>
                  )}
                  {order.shippingAddress}
                </p>
              ) : (
                <p className="leading-relaxed text-muted-foreground">
                  We&rsquo;ve got your delivery address — your order is being
                  packed.
                </p>
              )}
              <p className="pt-1 text-[13px] text-muted-foreground">
                Dispatched within 1–2 business days · estimated delivery 3–7
                business days Australia-wide. Tracking follows by email.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="justify-center">
              <Link href="/products">
                Keep shopping
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="justify-center">
              <Link href="/book-car-wash-online">Book a wash</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
