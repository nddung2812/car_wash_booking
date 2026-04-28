import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import {
  ArrowRight,
  Calendar as CalendarIcon,
  Car,
  Clock,
  Sparkles as SparkleIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { listBookingsByUser } from "@/db/queries";
import { services } from "@/data/services";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My bookings — Hyperdome Car Wash",
  description:
    "View your upcoming and past car wash bookings at Hyperdome Car Wash, Logan QLD.",
  alternates: { canonical: "/account/bookings" },
  robots: { index: false, follow: false },
};

const fullDateFormatter = new Intl.DateTimeFormat("en-AU", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return fullDateFormatter.format(d);
}

function titleCaseVehicle(v: string | null | undefined) {
  if (!v) return null;
  if (v.toLowerCase() === "4x4") return "4×4";
  return v.charAt(0).toUpperCase() + v.slice(1);
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-secondary text-foreground/70 border-line",
  confirmed: "bg-brand-soft text-primary border-primary/30",
  completed: "bg-primary text-primary-foreground border-primary",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

export default async function MyBookingsPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in?redirect_url=/account/bookings");
  }

  const rows = await listBookingsByUser(user.id);

  return (
    <>
      <section className="border-b border-line py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Your account · Bookings
          </p>
          <h1
            className="mt-3 font-serif italic leading-tight tracking-tight text-foreground"
            style={{ fontSize: "clamp(40px, 6vw, 72px)" }}
          >
            My{" "}
            <span className="not-italic">
              <span className="yellow-highlight">bookings</span>.
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {rows.length > 0
              ? `${rows.length} ${rows.length === 1 ? "wash" : "washes"} on the books — newest first. Tap any one to see the full confirmation.`
              : "Looks like you haven't booked a wash with us yet. Let's fix that."}
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {rows.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="mx-auto flex max-w-3xl flex-col gap-4">
              {rows.map((row) => {
                const serviceName =
                  row.serviceName ??
                  services.find((s) => s.id === row.serviceId)?.name ??
                  "Wash";
                const whenLabel = row.date
                  ? `${formatDate(row.date) ?? row.date} · ${row.time}`
                  : row.time;
                const vehicleLabel = titleCaseVehicle(row.vehicleType) ?? "—";
                const totalLabel = row.total
                  ? `$${Number(row.total).toFixed(2)}`
                  : null;
                const statusClass =
                  STATUS_STYLES[row.status] ?? STATUS_STYLES.pending;
                return (
                  <li key={row.id}>
                    <Link
                      href={`/success?code=${encodeURIComponent(row.confirmationCode)}`}
                      className="lift group flex flex-col gap-5 rounded-[20px] border border-line bg-card-gradient p-5 shadow-soft transition-all hover:border-line-2 hover:shadow-soft-lg sm:p-6"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            Confirmation
                          </span>
                          <span className="font-mono text-[14px] tabular-nums text-foreground">
                            {row.confirmationCode}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-pill border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em]",
                            statusClass,
                          )}
                        >
                          {row.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4 border-t border-dashed border-line pt-5 sm:grid-cols-2">
                        <div className="flex items-start gap-3">
                          <SparkleIcon className="mt-0.5 size-4 text-primary" />
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                              Service
                            </span>
                            <span className="font-serif text-xl leading-tight tracking-tight text-foreground">
                              {serviceName}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Car className="mt-0.5 size-4 text-primary" />
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                              Vehicle
                            </span>
                            <span className="text-[15px] text-foreground">
                              {vehicleLabel}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CalendarIcon className="mt-0.5 size-4 text-primary" />
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                              When
                            </span>
                            <span className="text-[15px] text-foreground">
                              {whenLabel}
                            </span>
                          </div>
                        </div>
                        {totalLabel && (
                          <div className="flex items-start gap-3">
                            <Clock className="mt-0.5 size-4 text-primary" />
                            <div className="flex flex-col gap-0.5">
                              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                Total
                              </span>
                              <span className="font-serif text-xl leading-tight tracking-tight text-primary">
                                {totalLabel}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors group-hover:text-foreground">
                        View details
                        <ArrowRight className="size-3.5" />
                      </div>
                    </Link>
                  </li>
                );
              })}

              <li className="mt-2 flex justify-center">
                <Button asChild size="lg">
                  <Link href="/bookings">
                    Book another wash
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </li>
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

function EmptyState() {
  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="relative flex flex-col items-center gap-6 rounded-[28px] border border-line bg-card-gradient p-8 text-center shadow-soft-lg sm:p-12">
        <div className="relative grid size-20 place-items-center rounded-full bg-primary text-primary-foreground glow-accent">
          <SparkleIcon className="size-9" strokeWidth={2} />
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Empty garage
          </p>
          <h2
            className="font-serif italic leading-tight tracking-tight text-foreground"
            style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
          >
            No bookings{" "}
            <span className="not-italic">
              <span className="yellow-highlight">yet</span>.
            </span>
          </h2>
          <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Book your first wash and it&rsquo;ll show up here, with the
            confirmation code, time and total all in one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/bookings">
              Make your first booking
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/services">Browse services</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
