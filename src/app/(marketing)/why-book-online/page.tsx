import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Clock,
  MailCheck,
  MoonStar,
  Phone,
  Receipt,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import CTABand from "@/components/CTABand";
import JsonLd from "@/components/seo/JsonLd";
import { BUSINESS_PHONE, BUSINESS_PHONE_DISPLAY } from "@/lib/seo/business";
import { breadcrumbLd, faqPageLd, type FaqItem } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Why Book Online — Skip the Queue",
  description:
    "Why book your car wash online at Hyperdome Logan? Skip the queue, see fixed pricing upfront, and lock in your slot 24/7. Professional hand wash & detailing — instant confirmation, open 7 days.",
  alternates: { canonical: "/why-book-online" },
  openGraph: {
    url: "/why-book-online",
    title: "Book Car Wash Online — Hyperdome Logan QLD",
    description:
      "Skip the queue at Hyperdome Car Wash Logan. Book your professional hand wash or detail online in 60 seconds — instant confirmation, fixed pricing, open 7 days.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Hyperdome Car Wash — Professional car wash in Logan QLD",
      },
    ],
  },
};

const reasons = [
  {
    icon: Clock,
    kicker: "01 / 05",
    title: "Skip the queue at Hyperdome",
    body: "Saturday mornings in the Hyperdome basement carpark fill fast. Online slots are reserved the moment you submit — no idling behind three other cars hoping the bay opens up. Walk in, hand over the keys, walk out.",
    linkLabel: "See available times",
    linkHref: "/book-car-wash-online",
  },
  {
    icon: Receipt,
    kicker: "02 / 05",
    title: "See your full price before you arrive",
    body: "Pick your wash, vehicle size and add-ons; the form shows the exact total — including 10% GST — before you confirm. No counter surprises, no \"actually it's a bit more for SUVs.\"",
    linkLabel: "Compare packages",
    linkHref: "/services",
  },
  {
    icon: MoonStar,
    kicker: "03 / 05",
    title: "Book 24/7 — even outside trading hours",
    body: "The booking system never closes. Lock in tomorrow's wash at midnight tonight, on the train home, or while the kids are at training. Drive-in only works inside trading hours.",
    linkLabel: "Book now",
    linkHref: "/book-car-wash-online",
  },
  {
    icon: MailCheck,
    kicker: "04 / 05",
    title: "Instant confirmation you can prove",
    body: "Every online booking gets a unique confirmation code (e.g. LCW-05/05/2026-001) emailed straight to you. Reference it on arrival, forward it to the family, or reply to it if you need to reschedule.",
    linkLabel: "How it works",
    linkHref: "/services",
  },
  {
    icon: CalendarCheck,
    kicker: "05 / 05",
    title: "Lock in peak Loganholme & Shailer Park slots",
    body: "Weekend mornings and end-of-month detail slots fill days ahead. Booking online holds your spot the second you submit; walk-ins get whatever the booked queue leaves behind.",
    linkLabel: "Pick your location",
    linkHref: "/locations/loganholme",
  },
];

const comparison = [
  { label: "Wait time", online: "Reserved slot", drivein: "Queue luck" },
  { label: "Pricing", online: "Fixed total upfront", drivein: "Quoted at counter" },
  { label: "Hours", online: "24/7 booking", drivein: "Trading hours only" },
  { label: "Confirmation", online: "Emailed code", drivein: "Verbal only" },
  { label: "Peak slots", online: "Held for you", drivein: "First-come" },
];

const faqs: FaqItem[] = [
  {
    q: "How long does it take to book a car wash online?",
    a: "Around 60 seconds. The form walks you through service, vehicle, add-ons, and time slot in four short steps. You'll have a confirmation code in your inbox before you've finished your coffee.",
  },
  {
    q: "Can I book a same-day car wash in Logan?",
    a: "Yes. Same-day slots show in real time on the booking form. If a Loganholme bay is full for today, the form will surface the next open slot at Shailer Park automatically.",
  },
  {
    q: "Do I pay online or in person?",
    a: "In person, on the day. Online booking just reserves your slot — no card details required. We accept cash, EFTPOS, credit card, Apple Pay and Google Pay at both locations.",
  },
  {
    q: "Can I cancel or reschedule my online booking?",
    a: "Yes. Reply to your confirmation email or call us on (07) 3806 0358 with your LCW-… code and we'll move your slot — no fees if you give us reasonable notice.",
  },
  {
    q: "Should I book Loganholme or Shailer Park?",
    a: "Loganholme (2 Leda Dr) is the higher-clearance bay built for 4×4s, dual-cab utes and longer detail jobs. Shailer Park (Mandew St) is faster for short-cycle washes. Both run the same chemistry and the same hours.",
  },
];

export default function WhyBookOnlinePage() {
  return (
    <>
      <section className="border-b border-line py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Why book online</span>
          </nav>

          <h1 className="mt-6 font-serif text-4xl leading-tight tracking-tight text-foreground md:text-6xl">
            Book your Hyperdome car wash online — skip the queue
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
            Driving into a busy Hyperdome basement on a Saturday and hoping for
            an open bay is a coin flip. Booking online is the professional way
            to get a wash in Logan: a reserved slot, transparent pricing, and a
            confirmation code in your inbox before you leave the house.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/book-car-wash-online">
                Book a wash
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/services">See packages & pricing</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <a href={`tel:${BUSINESS_PHONE}`}>
                <Phone className="size-4" />
                {BUSINESS_PHONE_DISPLAY}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              The case for booking online
            </span>
            <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-foreground md:text-5xl">
              5 reasons to book online instead of driving in
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              We&rsquo;ve run the Hyperdome bays for years and watched the
              same friction points trip up walk-in customers. Here&rsquo;s
              what changes when you book ahead.
            </p>
          </div>

          <ol className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
            {reasons.map((r) => {
              const Icon = r.icon;
              return (
                <li key={r.kicker} className="list-none">
                  <article className="flex h-full flex-col rounded-[20px] border border-line bg-card-gradient p-6 shadow-soft">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {r.kicker}
                      </span>
                      <Icon
                        className="size-5 text-foreground/70"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="mt-4 font-serif text-2xl leading-tight tracking-tight text-foreground">
                      {r.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
                      {r.body}
                    </p>
                    <Link
                      href={r.linkHref}
                      className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground hover:underline"
                    >
                      {r.linkLabel}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="border-y border-line bg-secondary/30 py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              At a glance
            </span>
            <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
              Online booking vs drive-in
            </h2>
          </div>

          <div className="mt-10 overflow-hidden rounded-[20px] border border-line bg-background shadow-soft">
            <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-line bg-foreground/[0.03]">
              <div className="px-5 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Compare
              </div>
              <div className="border-l border-line px-5 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
                Online booking
              </div>
              <div className="border-l border-line px-5 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Drive-in
              </div>
            </div>
            {comparison.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-[1fr_1fr_1fr] ${
                  i < comparison.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <div className="px-5 py-4 text-[14px] font-medium text-foreground">
                  {row.label}
                </div>
                <div className="flex items-start gap-2 border-l border-line px-5 py-4 text-[14px] text-foreground/85">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{row.online}</span>
                </div>
                <div className="flex items-start gap-2 border-l border-line px-5 py-4 text-[14px] text-muted-foreground">
                  <X
                    className="mt-0.5 size-4 shrink-0 text-foreground/40"
                    aria-hidden="true"
                  />
                  <span>{row.drivein}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto grid grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:px-8">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Common questions
            </span>
            <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
              Booking your Hyperdome car wash online
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Quick answers from the team that runs both Hyperdome bays. Still
              not sure?{" "}
              <a
                href={`tel:${BUSINESS_PHONE}`}
                className="text-foreground underline"
              >
                Call us
              </a>{" "}
              or{" "}
              <Link href="/contact" className="text-foreground underline">
                visit the contact page
              </Link>
              .
            </p>
          </div>

          <dl className="flex flex-col gap-5">
            {faqs.map((item) => (
              <div
                key={item.q}
                className="rounded-[20px] border border-line bg-card-gradient p-6 shadow-soft"
              >
                <dt className="font-serif text-xl leading-tight text-foreground">
                  {item.q}
                </dt>
                <dd className="mt-3 text-[15px] leading-relaxed text-foreground/85">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <CTABand />

      <JsonLd
        id="ld-why-book-breadcrumb"
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Why Book Online", url: "/why-book-online" },
        ])}
      />
      <JsonLd id="ld-why-book-faq" data={faqPageLd(faqs)} />
    </>
  );
}
