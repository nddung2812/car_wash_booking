import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import {
  ArrowRight,
  CalendarPlus,
  ChevronRight,
  ShoppingBag,
  Sparkles as SparkleIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { listBookingsByUser, listOrdersByUser } from "@/db/queries";
import { services } from "@/data/services";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Account",
  description:
    "View your car wash bookings and product orders at Hyperdome Car Wash.",
  alternates: { canonical: "/account" },
  robots: { index: false, follow: false },
};

type Tab = "bookings" | "orders";

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatBookingDate(iso: string | null | undefined, time: string | null) {
  if (!iso) return time ?? "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return time ?? iso;
  return time ? `${dateFormatter.format(d)} · ${time}` : dateFormatter.format(d);
}

function titleCaseVehicle(v: string | null | undefined) {
  if (!v) return "—";
  if (v.toLowerCase() === "4x4") return "4×4";
  return v.charAt(0).toUpperCase() + v.slice(1);
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-secondary text-foreground/70 ring-line",
  confirmed: "bg-brand-soft text-primary ring-primary/30",
  completed: "bg-primary/10 text-primary ring-primary/30",
  cancelled: "bg-destructive/10 text-destructive ring-destructive/30",
};

const PAYMENT_STYLES: Record<string, string> = {
  paid: "bg-brand-soft text-primary ring-primary/30",
  unpaid: "bg-secondary text-foreground/70 ring-line",
  pending_payment: "bg-yellow-soft/40 text-yellow-ink ring-line",
};

function paymentPill(method: string, status: string) {
  if (status === "paid") return { label: "Paid online", className: PAYMENT_STYLES.paid };
  if (method === "pay_now")
    return { label: "Awaiting payment", className: PAYMENT_STYLES.pending_payment };
  return { label: "Pay at collection", className: PAYMENT_STYLES.unpaid };
}

function shortOrderRef(id: string) {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in?redirect_url=/account");

  const { tab: tabParam } = await searchParams;
  const activeTab: Tab = tabParam === "orders" ? "orders" : "bookings";

  const [bookingRows, orderRows] = await Promise.all([
    listBookingsByUser(user.id),
    listOrdersByUser(user.id),
  ]);

  const greeting = user.firstName?.trim() || "there";

  return (
    <section className="py-10 lg:py-14">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              My account
            </p>
            <h1 className="font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
              Hi {greeting}.
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/products">
                <ShoppingBag className="size-3.5" />
                Shop
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/book-car-wash-online">
                <CalendarPlus className="size-3.5" />
                Book a wash
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-line">
          <TabLink
            href="/account?tab=bookings"
            active={activeTab === "bookings"}
            label="Bookings"
            count={bookingRows.length}
            tone="brand"
          />
          <TabLink
            href="/account?tab=orders"
            active={activeTab === "orders"}
            label="Orders"
            count={orderRows.length}
            tone="amber"
          />
        </div>

        {/* List */}
        <div className="mt-5 overflow-hidden rounded-[14px] border border-line bg-card/40">
          {activeTab === "bookings" ? (
            bookingRows.length === 0 ? (
              <EmptyRow
                Icon={SparkleIcon}
                title="No bookings yet"
                description="Your wash bookings will appear here."
                cta={{ href: "/book-car-wash-online", label: "Book a wash" }}
              />
            ) : (
              <ul className="divide-y divide-line">
                {/* desktop header */}
                <li className="hidden grid-cols-[140px_1fr_auto_auto_auto_auto] items-center gap-4 bg-secondary/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:grid sm:px-5">
                  <span>Date</span>
                  <span>Service</span>
                  <span>Code</span>
                  <span>Payment</span>
                  <span>Status</span>
                  <span className="justify-self-end">Total</span>
                </li>
                {bookingRows.map((row) => {
                  const serviceName =
                    row.serviceName ??
                    services.find((s) => s.id === row.serviceId)?.name ??
                    "Wash";
                  const pay = paymentPill(row.paymentMethod, row.paymentStatus);
                  return (
                    <li key={row.id}>
                      <Link
                        href={`/success?code=${encodeURIComponent(row.confirmationCode)}`}
                        className="group grid grid-cols-1 gap-2 px-4 py-3.5 transition-colors hover:bg-secondary/40 sm:grid-cols-[140px_1fr_auto_auto_auto_auto] sm:items-center sm:gap-4 sm:px-5"
                      >
                        <span className="font-mono text-[12px] tabular-nums text-foreground sm:text-[13px]">
                          {formatBookingDate(row.date, row.time)}
                        </span>
                        <span className="flex flex-col gap-0.5 text-foreground">
                          <span className="text-[14px] font-medium leading-tight">
                            {serviceName}
                          </span>
                          <span className="text-[12px] text-muted-foreground">
                            {titleCaseVehicle(row.vehicleType)}
                          </span>
                        </span>
                        <span className="font-mono text-[11px] tabular-nums text-muted-foreground sm:text-[12px]">
                          {row.confirmationCode}
                        </span>
                        <Pill className={pay.className}>{pay.label}</Pill>
                        <Pill
                          className={
                            STATUS_STYLES[row.status] ?? STATUS_STYLES.pending
                          }
                        >
                          {row.status}
                        </Pill>
                        <span className="flex items-center justify-end gap-1.5 font-mono text-[14px] font-semibold tabular-nums text-foreground">
                          ${Number(row.total).toFixed(2)}
                          <ChevronRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )
          ) : orderRows.length === 0 ? (
            <EmptyRow
              Icon={ShoppingBag}
              title="No orders yet"
              description="Your product purchases will appear here."
              cta={{ href: "/products", label: "Browse products" }}
            />
          ) : (
            <ul className="divide-y divide-line">
              <li className="hidden grid-cols-[120px_1fr_auto_auto_auto] items-center gap-4 bg-secondary/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:grid sm:px-5">
                <span>Date</span>
                <span>Items</span>
                <span>Order</span>
                <span>Status</span>
                <span className="justify-self-end">Total</span>
              </li>
              {orderRows.map((order) => {
                const ref = shortOrderRef(order.id);
                const itemCount = order.items.reduce(
                  (sum, i) => sum + i.qty,
                  0,
                );
                const summary =
                  order.items.length === 0
                    ? "—"
                    : order.items.length === 1
                      ? `${order.items[0].name} × ${order.items[0].qty}`
                      : `${order.items[0].name} +${order.items.length - 1} more`;
                return (
                  <li key={order.id}>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="group grid grid-cols-1 gap-2 px-4 py-3.5 transition-colors hover:bg-secondary/40 sm:grid-cols-[120px_1fr_auto_auto_auto] sm:items-center sm:gap-4 sm:px-5"
                    >
                      <span className="font-mono text-[12px] tabular-nums text-foreground sm:text-[13px]">
                        {dateFormatter.format(new Date(order.createdAt))}
                      </span>
                      <span className="flex flex-col gap-0.5 text-foreground">
                        <span className="text-[14px] font-medium leading-tight line-clamp-1">
                          {summary}
                        </span>
                        <span className="text-[12px] text-muted-foreground">
                          {itemCount} {itemCount === 1 ? "item" : "items"}
                        </span>
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-muted-foreground sm:text-[12px]">
                        #{ref}
                      </span>
                      <Pill className={PAYMENT_STYLES.paid}>{order.status}</Pill>
                      <span className="flex items-center justify-end gap-1.5 font-mono text-[14px] font-semibold tabular-nums text-foreground">
                        ${Number(order.total).toFixed(2)}
                        <ChevronRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

const TAB_TONES = {
  brand: {
    border: "border-[var(--brand)]",
    text: "text-[var(--brand-ink)]",
    pillActive: "bg-[var(--brand)] text-white",
    hover: "hover:text-[var(--brand-ink)]",
  },
  amber: {
    border: "border-[#E0B500]",
    text: "text-[var(--yellow-ink)]",
    pillActive: "bg-[#E0B500] text-[var(--yellow-ink)]",
    hover: "hover:text-[var(--yellow-ink)]",
  },
} as const;

function TabLink({
  href,
  active,
  label,
  count,
  tone,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
  tone: keyof typeof TAB_TONES;
}) {
  const t = TAB_TONES[tone];
  return (
    <Link
      href={href}
      className={cn(
        "relative -mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors",
        active
          ? cn(t.border, t.text)
          : cn("border-transparent text-muted-foreground", t.hover),
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-pill px-1.5 py-0.5 font-sans text-[10px] tabular-nums",
          active ? t.pillActive : "bg-secondary text-muted-foreground",
        )}
      >
        {count}
      </span>
    </Link>
  );
}

function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-pill px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ring-1",
        className,
      )}
    >
      {children}
    </span>
  );
}

function EmptyRow({
  Icon,
  title,
  description,
  cta,
}: {
  Icon: typeof SparkleIcon;
  title: string;
  description: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
      <div className="grid size-11 place-items-center rounded-pill bg-brand-soft text-primary">
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-serif text-xl leading-tight tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-[13px] text-muted-foreground">{description}</p>
      </div>
      <Button asChild size="sm">
        <Link href={cta.href}>
          {cta.label}
          <ArrowRight className="size-3.5" />
        </Link>
      </Button>
    </div>
  );
}
