import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getOrderById } from "@/db/queries";

export const metadata: Metadata = {
  title: "Order details",
  robots: { index: false, follow: false },
};

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function shortOrderRef(id: string) {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in?redirect_url=/account?tab=orders");

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();
  // Authorisation: only the buyer (or an admin, future) can see their order.
  if (order.userId !== user.id) notFound();

  const ref = shortOrderRef(order.id);
  const itemCount = order.items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <section className="py-10 lg:py-14">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/account?tab=orders"
          className="mb-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to orders
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Order #{ref}
            </span>
            <h1 className="font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
              ${Number(order.total).toFixed(2)}
            </h1>
            <span className="font-mono text-[12px] text-muted-foreground">
              Placed {dateFormatter.format(new Date(order.createdAt))}
            </span>
          </div>
          <span className="inline-flex w-fit items-center rounded-pill bg-brand-soft px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-primary ring-1 ring-primary/30">
            {order.status}
          </span>
        </div>

        {/* Items */}
        <div className="mt-6 overflow-hidden rounded-[14px] border border-line bg-card/40">
          <div className="flex items-center gap-2 border-b border-line bg-secondary/40 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <Package className="size-3.5" />
            Items · {itemCount}
          </div>
          <ul className="divide-y divide-line">
            {order.items.map((item, i) => (
              <li
                key={`${order.id}-${i}`}
                className="flex items-center justify-between gap-3 px-5 py-3.5"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium text-foreground">
                    {item.name}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    Qty {item.qty}
                  </span>
                </span>
                <span className="font-mono text-[14px] tabular-nums text-foreground">
                  ${item.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Totals + shipping */}
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-[14px] border border-line bg-card/40 p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Summary
            </span>
            <Row label="Subtotal" value={`$${Number(order.subtotal).toFixed(2)}`} />
            <Row label="GST included" value={`$${Number(order.gst).toFixed(2)}`} muted />
            <Row label="Shipping" value={`$${Number(order.shipping).toFixed(2)}`} />
            <div className="mt-1 flex items-end justify-between border-t border-dashed border-line pt-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Total
              </span>
              <span className="font-serif text-2xl leading-none text-primary tabular-nums">
                ${Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-[14px] border border-line bg-card/40 p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Delivery & contact
            </span>
            {order.shippingAddress ? (
              <DetailLine Icon={Truck} label="Shipping to" value={order.shippingAddress} />
            ) : (
              <DetailLine Icon={Truck} label="Shipping" value="Address on file" />
            )}
            {order.fullName && (
              <DetailLine Icon={MapPin} label="Recipient" value={order.fullName} />
            )}
            <DetailLine Icon={Mail} label="Email" value={order.email} />
            {order.phone && (
              <DetailLine Icon={Phone} label="Phone" value={order.phone} />
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/products">Shop again</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className={muted ? "text-muted-foreground" : "text-foreground"}>
        {label}
      </span>
      <span
        className={
          muted
            ? "font-mono tabular-nums text-muted-foreground"
            : "font-mono tabular-nums text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

function DetailLine({
  Icon,
  label,
  value,
}: {
  Icon: typeof Truck;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 text-[13px]">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-primary" />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        <span className="text-foreground break-words">{value}</span>
      </div>
    </div>
  );
}
