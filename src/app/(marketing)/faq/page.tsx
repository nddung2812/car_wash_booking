import type { Metadata } from "next";

import CTABand from "@/components/CTABand";
import JsonLd from "@/components/seo/JsonLd";
import { SectionIntro } from "@/components/SectionIntro";
import { breadcrumbLd, faqPageLd, type FaqItem } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Hyperdome Car Wash — services, locations, booking, pricing, vehicle types, and opening hours at Shailer Park and Loganholme.",
  alternates: { canonical: "/faq" },
  openGraph: {
    url: "/faq",
    title: "FAQ — Hyperdome Car Wash Logan QLD",
    description:
      "Answers to common questions about Hyperdome Car Wash — booking, pricing, vehicle types, locations and hours.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Hyperdome Car Wash — Professional car wash in Logan QLD" }],
  },
};

const faqs: FaqItem[] = [
  {
    q: "How long does a wash take?",
    a: "A Sparkles Wash takes around 30 minutes. Super Sparkles runs 45–60 minutes. Mini Detail is 1.5–2 hours, Interior Detail 2–3 hours, and a Full Detail with engine bay and polish takes 4–5 hours. Drop-off before 11 AM for same-day pickup on detail packages.",
  },
  {
    q: "Do I need to book in advance?",
    a: "Booking is recommended, especially on weekends and for detail packages, but walk-ins are welcome for Sparkles and Super Sparkles if bays are available. Use the online booking form for the fastest experience.",
  },
  {
    q: "What's the difference between Sparkles Wash and Super Sparkles?",
    a: "Sparkles Wash is our express hand wash — exterior, wheels, windows and a quick interior wipe. Super Sparkles adds a deeper interior vacuum, dashboard and door-card clean, and a hand-dry finish. Both run on a short-cycle cadence so you can drop, shop and return on schedule.",
  },
  {
    q: "What vehicle types do you wash?",
    a: "We wash sedans, hatches, wagons, SUVs, dual-cab utes and vans. The Loganholme bay has higher clearance and handles 4×4s with bull bars, rooftop tents and ladder racks. Pricing adjusts by vehicle size in checkout.",
  },
  {
    q: "Where are you located?",
    a: "We have two bays inside Hyperdome Shopping Centre, Logan QLD. Shailer Park (Mandew St entrance) suits customers from Cornubia, Daisy Hill and Springwood. Loganholme (Leda Dr entrance) is the closer bay for Beenleigh, Eagleby and east Logan.",
  },
  {
    q: "What are your opening hours?",
    a: "We are open seven days. Monday, Wednesday–Saturday 8:30 AM – 4:00 PM. Tuesday and Sunday 9:00 AM – 4:00 PM. Hours are the same at both locations.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept cash, credit and debit cards, EFTPOS, Apple Pay and Google Pay at both locations.",
  },
  {
    q: "Can I wait while my car is being washed?",
    a: "Yes — the shopping centre has a food court, cinema and coffee shops a short walk from both bays. For express washes you're welcome to wait nearby. For detail packages (2–5 hours) we recommend shopping or running errands and returning at your pickup time.",
  },
  {
    q: "Do you offer add-on services?",
    a: "Yes. Popular add-ons include hand polish, paint protection film, dog hair removal, leather conditioning, engine bay clean and Slipstream weather-shield coating. You can select add-ons when booking online or ask our team on the day.",
  },
  {
    q: "How do I cancel or reschedule a booking?",
    a: "Log in to your account and review your bookings on the 'My account' page (or call the relevant location directly — Shailer Park on (07) 3801 1988 or Loganholme on (07) 3806 0358) to cancel or reschedule.",
  },
];

export default function FaqPage() {
  return (
    <>
      <section className="border-b border-line py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            FAQ
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-foreground md:text-5xl">
            Frequently asked questions
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Everything you need to know about booking, pricing, locations and what to expect at Hyperdome Car Wash.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <dl className="flex flex-col divide-y divide-line">
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
        id="ld-faq-breadcrumb"
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: "FAQ", url: "/faq" },
        ])}
      />
      <JsonLd id="ld-faq-page" data={faqPageLd(faqs)} />
    </>
  );
}
