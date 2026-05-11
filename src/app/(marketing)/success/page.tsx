import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  Home as HomeIcon,
  MapPin,
  MessageCircle,
  Shield,
  Sparkles as SparkleIcon,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getBookingByCode } from "@/db/queries";
import { services } from "@/data/services";

export const metadata: Metadata = {
  title: "Booking Confirmed",
  description:
    "Your Logan QLD car wash is locked in. We've emailed your confirmation — see you soon at Hyperdome Car Wash.",
  alternates: { canonical: "/success" },
  robots: { index: false, follow: false },
};

const fullDateFormatter = new Intl.DateTimeFormat("en-AU", {
  weekday: "short",
  day: "numeric",
  month: "short",
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

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const booking = code ? await getBookingByCode(code) : null;

  const serviceName =
    booking?.serviceName ??
    services.find((s) => s.id === booking?.serviceId)?.name ??
    null;
  const whenLabel =
    booking && booking.date
      ? `${formatDate(booking.date) ?? booking.date} · ${booking.time}`
      : null;
  const vehicleLabel = titleCaseVehicle(booking?.vehicleType);
  const totalLabel = booking?.total ? `$${Number(booking.total).toFixed(2)}` : null;

  return (
    <>
      <section className="border-b border-line py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {booking
              ? `Booking confirmed · ${booking.confirmationCode}`
              : "Booking confirmed"}
          </p>
          <h1
            className="mt-3 font-serif italic leading-tight tracking-tight text-foreground"
            style={{ fontSize: "clamp(40px, 6vw, 72px)" }}
          >
            See you{" "}
            <span className="not-italic">
              <span className="yellow-highlight">soon</span>.
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {booking
              ? "We've emailed your confirmation. Roll in a couple of minutes early — kettle's on."
              : "Thanks for booking with Hyperdome Car Wash. We've emailed your confirmation with all the details — keep it handy and we'll see you at your slot."}
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-3xl">
            <div className="relative flex flex-col items-center gap-6 rounded-[28px] border border-line bg-card-gradient p-8 text-center shadow-soft-lg sm:p-12">
              <div className="relative grid size-20 place-items-center rounded-full bg-primary text-primary-foreground glow-accent">
                <Check className="size-9" strokeWidth={2.5} />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full"
                  style={{
                    animation: "pulseRing 2.4s ease-out infinite",
                    border: "2px solid var(--brand)",
                  }}
                />
              </div>

              {booking ? (
                <div className="grid w-full grid-cols-1 gap-4 rounded-[20px] border border-dashed border-line p-5 text-left sm:grid-cols-2">
                  {serviceName && (
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        Service
                      </span>
                      <span className="font-serif text-2xl leading-tight">
                        {serviceName}
                      </span>
                    </div>
                  )}
                  {whenLabel && (
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        When
                      </span>
                      <span className="text-[15px] text-foreground">{whenLabel}</span>
                    </div>
                  )}
                  {vehicleLabel && (
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        Vehicle
                      </span>
                      <span className="text-[15px] text-foreground">
                        {vehicleLabel}
                      </span>
                    </div>
                  )}
                  {totalLabel && (
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        Total
                      </span>
                      <span className="font-serif text-2xl leading-tight text-primary">
                        {totalLabel}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="max-w-md text-[15px] text-muted-foreground">
                  Your confirmation email has the service, time and total. If
                  it hasn&rsquo;t arrived in a few minutes, check your spam
                  folder or get in touch.
                </p>
              )}

              <ul className="mt-2 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  {
                    Icon: Clock,
                    label: "Arrive on time",
                    body: "Spot held 15 min past your slot.",
                  },
                  {
                    Icon: Shield,
                    label: "Free cancel",
                    body: "Reschedule from your phone.",
                  },
                  {
                    Icon: SparkleIcon,
                    label: "Love it guarantee",
                    body: "Not perfect? We make it right.",
                  },
                ].map(({ Icon, label, body }) => (
                  <li
                    key={label}
                    className="flex flex-col items-start gap-1 rounded-2xl border border-line bg-card/40 p-4 text-left"
                  >
                    <Icon className="size-4 text-primary" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {label}
                    </span>
                    <span className="text-[14px] text-foreground">{body}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Keep exploring
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
              Plenty more on the menu.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Browse extras, read what locals say, or find your nearest bay.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/bookings">
                  Book another wash
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/">
                  <HomeIcon className="size-4" />
                  Back to home
                </Link>
              </Button>
            </div>

            <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { href: "/services", label: "Services", Icon: SparkleIcon },
                { href: "/contact#reviews", label: "Reviews", Icon: Star },
                { href: "/contact", label: "Contact", Icon: MessageCircle },
                { href: "/contact#contact", label: "Locations", Icon: MapPin },
              ].map(({ href, label, Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="lift flex h-full flex-col items-start gap-2 rounded-2xl border border-line bg-card/40 p-4 text-left transition-colors hover:border-ink/40 hover:bg-secondary"
                  >
                    <Icon className="size-4 text-primary" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      Browse
                    </span>
                    <span className="text-[15px] font-medium text-foreground">
                      {label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
