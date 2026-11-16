import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarCheck, IdCard, MousePointerClick } from "lucide-react";

import { Button } from "@/components/ui/button";
import CTABand from "@/components/CTABand";
import JsonLd from "@/components/seo/JsonLd";
import { getMergedServices } from "@/lib/pricing";
import { breadcrumbLd, faqPageLd, seniorsOfferLd, type FaqItem } from "@/lib/seo/jsonld";
import { DEPOSIT_AMOUNT, SUPPORT_EMAIL } from "@/lib/booking-payment";
import {
  SENIOR_DISCOUNT_AMOUNT,
  SENIOR_DISCOUNT_CARD_NOTICE,
  SENIOR_DISCOUNT_CARDS_LABEL,
  SENIOR_DISCOUNT_DAYS_LABEL,
  SENIOR_DISCOUNT_ENABLED,
  SENIOR_DISCOUNT_QUERY,
  SENIOR_DISCOUNT_SURCHARGE_NOTICE,
} from "@/lib/booking-discount";

const BOOK_HREF = `/book-car-wash-online?${SENIOR_DISCOUNT_QUERY}=1`;

export const metadata: Metadata = {
  title: "Seniors & Pensioner Car Wash Discount",
  description: `Seniors and pensioners save $${SENIOR_DISCOUNT_AMOUNT} on any car wash or detail at Hyperdome Car Wash, Logan QLD — every ${SENIOR_DISCOUNT_DAYS_LABEL}, all year. Book online and show your card at collection.`,
  alternates: { canonical: "/seniors-discount" },
  openGraph: {
    url: "/seniors-discount",
    title: `Seniors & Pensioner Discount — $${SENIOR_DISCOUNT_AMOUNT} Off Any Car Wash in Logan QLD`,
    description: `$${SENIOR_DISCOUNT_AMOUNT} off any wash or detail for Seniors Card and Pensioner Concession Card holders, every ${SENIOR_DISCOUNT_DAYS_LABEL} at Hyperdome Car Wash.`,
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

const steps = [
  {
    Icon: CalendarCheck,
    title: `Pick a ${SENIOR_DISCOUNT_DAYS_LABEL}`,
    body: "Choose your wash, vehicle size and a Wednesday or Thursday time slot. Eligible days are marked in the booking form.",
  },
  {
    Icon: MousePointerClick,
    title: "Tick the seniors box",
    body: `At the last step, tick “I hold a ${SENIOR_DISCOUNT_CARDS_LABEL}”. $${SENIOR_DISCOUNT_AMOUNT} comes straight off the price before you pay.`,
  },
  {
    Icon: IdCard,
    title: "Bring your card",
    body: SENIOR_DISCOUNT_CARD_NOTICE,
  },
];

const faqs: FaqItem[] = [
  {
    q: "Who can get the seniors and pensioner discount?",
    a: `Anyone who holds a ${SENIOR_DISCOUNT_CARDS_LABEL}. ${SENIOR_DISCOUNT_CARD_NOTICE}`,
  },
  {
    q: "Which days does the discount apply?",
    a: `Every ${SENIOR_DISCOUNT_DAYS_LABEL}, all year round, at both our Shailer Park and Loganholme bays. It goes by the day your wash is booked for, not the day you make the booking.`,
  },
  {
    q: "Does it apply to every service?",
    a: `Yes. $${SENIOR_DISCOUNT_AMOUNT} comes off any wash or detail package, for any vehicle size — one discount per booking. Add-on extras are charged at their normal price. ${SENIOR_DISCOUNT_SURCHARGE_NOTICE}`,
  },
  {
    q: "How does it work with the deposit?",
    a: `The same way as any booking. You can pay the $${DEPOSIT_AMOUNT} deposit online and the balance on the day, or pay in full online — either way the $${SENIOR_DISCOUNT_AMOUNT} discount is already taken off the total.`,
  },
  {
    q: "What if I forget my card?",
    a: `We may ask to see it when you collect your car. If you can't show a ${SENIOR_DISCOUNT_CARDS_LABEL}, the $${SENIOR_DISCOUNT_AMOUNT} discount is added back and settled at collection.`,
  },
  {
    q: "Can I get the discount on another day?",
    a: `The offer runs on ${SENIOR_DISCOUNT_DAYS_LABEL} only. If you need to move a discounted booking to another day, email ${SUPPORT_EMAIL} with your booking code and we'll sort it out.`,
  },
];

export default async function SeniorsDiscountPage() {
  // Switching the offer off in booking-discount.ts takes the page down with it.
  if (!SENIOR_DISCOUNT_ENABLED) notFound();

  const services = await getMergedServices();
  const off = (price: number) => Math.max(price - SENIOR_DISCOUNT_AMOUNT, 0);

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
            <span className="text-foreground">Seniors discount</span>
          </nav>

          <h1 className="mt-6 max-w-4xl font-serif text-4xl leading-tight tracking-tight text-foreground md:text-6xl">
            Seniors &amp; pensioners save ${SENIOR_DISCOUNT_AMOUNT} on any car
            wash — every {SENIOR_DISCOUNT_DAYS_LABEL}
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
            Hold a {SENIOR_DISCOUNT_CARDS_LABEL}? Take ${SENIOR_DISCOUNT_AMOUNT}{" "}
            off any hand wash or detail at Hyperdome Car Wash in Logan QLD. The
            offer runs all year at both our Shailer Park and Loganholme bays —
            book online, tick the seniors box, and bring your card.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href={BOOK_HREF}>
                Book with the discount
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/services">See all packages</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            How to claim it
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
            Three steps, under a minute.
          </h2>
          <ol className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {steps.map(({ Icon, title, body }, i) => (
              <li
                key={title}
                className="flex flex-col gap-3 rounded-[20px] border border-line bg-card-gradient p-6 shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-full bg-yellow text-yellow-ink">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    0{i + 1} / 03
                  </span>
                </div>
                <h3 className="font-serif text-2xl leading-tight tracking-tight text-foreground">
                  {title}
                </h3>
                <p className="text-[14px] leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-line py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {SENIOR_DISCOUNT_DAYS_LABEL} prices
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
            What you&rsquo;ll pay with the discount.
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Prices include GST. Regular price shown underneath.
          </p>

          {/* `relative` keeps the header's sr-only label inside this scroll box;
              without it the label widens the whole page on phones. */}
          <div className="relative mt-8 overflow-x-auto rounded-[20px] border border-line bg-card-gradient shadow-soft">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-line font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  <th scope="col" className="px-5 py-4 font-normal">Package</th>
                  <th scope="col" className="px-5 py-4 font-normal">Sedan</th>
                  <th scope="col" className="px-5 py-4 font-normal">Wagon</th>
                  <th scope="col" className="px-5 py-4 font-normal">SUV / 4×4</th>
                  <th scope="col" className="px-5 py-4 font-normal">
                    <span className="sr-only">Book</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {services.map((svc) => (
                  <tr key={svc.id} className="border-b border-line/60 last:border-0">
                    <th scope="row" className="px-5 py-4 font-normal">
                      <span className="font-serif text-xl leading-tight tracking-tight text-foreground">
                        {svc.name}
                      </span>
                      <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {svc.duration}
                      </span>
                    </th>
                    {([svc.pricing.sedan, svc.pricing.wagon, svc.pricing.suv] as const).map(
                      (price, i) => (
                        <td key={i} className="px-5 py-4 tabular-nums">
                          <span className="font-serif text-2xl leading-none text-foreground">
                            ${off(price)}
                          </span>
                          <span className="mt-1 block font-mono text-[11px] text-muted-foreground line-through">
                            ${price}
                          </span>
                        </td>
                      ),
                    )}
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/book-car-wash-online?service=${svc.id}&${SENIOR_DISCOUNT_QUERY}=1`}
                        className="inline-flex items-center gap-1 whitespace-nowrap text-[14px] font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Book
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-6 flex max-w-3xl flex-col gap-2 text-[14px] leading-relaxed text-muted-foreground">
            <li>
              Valid for bookings on a {SENIOR_DISCOUNT_DAYS_LABEL}, all year,
              at both locations. One discount per booking.
            </li>
            <li>
              The discount comes off the wash or detail package. Add-on extras
              are charged at their normal price.
            </li>
            <li>{SENIOR_DISCOUNT_CARD_NOTICE}</li>
            <li>{SENIOR_DISCOUNT_SURCHARGE_NOTICE}</li>
          </ul>
        </div>
      </section>

      <section className="border-t border-line py-16 lg:py-20">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
            Seniors discount questions
          </h2>
          <dl className="mt-6 flex flex-col divide-y divide-line">
            {faqs.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <dt className="font-serif text-[18px] leading-snug tracking-tight text-foreground">
                    {item.q}
                  </dt>
                  <span
                    aria-hidden="true"
                    className="flex size-6 shrink-0 items-center justify-center rounded-full border border-line text-muted-foreground transition-transform duration-300 group-open:rotate-45"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <dd className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                  {item.a}
                </dd>
              </details>
            ))}
          </dl>
        </div>
      </section>

      <CTABand />

      <JsonLd
        id="ld-seniors-breadcrumb"
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Seniors discount", url: "/seniors-discount" },
        ])}
      />
      <JsonLd id="ld-seniors-faq" data={faqPageLd(faqs)} />
      <JsonLd id="ld-seniors-offer" data={seniorsOfferLd()} />
    </>
  );
}
