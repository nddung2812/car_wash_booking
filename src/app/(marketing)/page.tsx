import type { Metadata } from "next";
import { Suspense } from "react";

import BannerSlider from "@/components/BannerSlider";
import BookingForm from "@/components/BookingForm";
import CTABand from "@/components/CTABand";
import ExtraServicesSection from "@/components/ExtraServicesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import LocationsSection from "@/components/LocationsSection";
import ReviewsSection from "@/components/ReviewsSection";
import { SectionIntro } from "@/components/SectionIntro";
import ServicesSection from "@/components/ServicesSection";
import { Marquee } from "@/components/visuals/Marquee";
import JsonLd from "@/components/seo/JsonLd";
import {
  allLocationsLd,
  breadcrumbLd,
  faqPageLd,
  offerCatalogLd,
  reviewsLd,
  type FaqItem,
} from "@/lib/seo/jsonld";

const FAQ_QUESTIONS: FaqItem[] = [
  {
    q: "How long does a car wash take at Hyperdome?",
    a: "The Sparkles Wash takes 30 minutes; Super Sparkles takes 45 minutes; Mini Detail takes 90 minutes; Interior Detail takes 2–3 hours; and the Full Detail takes 4–5 hours. Same-day turnaround is available for all packages when you drop before 11 AM.",
  },
  {
    q: "Do you wash 4×4s and SUVs?",
    a: "Yes. Both locations accept sedans, wagons, SUVs and 4×4s. The Loganholme bay on Leda Drive has higher clearance and is recommended for 4×4s with roof racks, bull bars or canopies. Pricing adjusts automatically by vehicle size when you book online.",
  },
  {
    q: "How much does a car wash cost in Logan QLD?",
    a: "Prices start from $40 (sedan) for a Sparkles Wash and go up to $430 (4×4) for a Full Detail with engine-bay cleaning and hand polish. Common packages: Super Sparkles from $60, Mini Detail from $70, Interior Detail from $250.",
  },
  {
    q: "Can I book a car wash online the same day?",
    a: "Yes — same-day slots are available through the online booking form at logancarwash.com.au/bookings. Select your vehicle type and preferred service to see live availability at both the Shailer Park and Loganholme bays.",
  },
  {
    q: "Where is Hyperdome Car Wash located?",
    a: "Hyperdome Car Wash operates two bays inside Hyperdome Shopping Centre in Logan QLD: Mandew St, Shailer Park QLD 4128 (western side, near the Pacific Motorway Bryants Road exit) and 2 Leda Dr, Loganholme QLD 4129 (eastern side, ideal for Beenleigh and east Logan residents).",
  },
  {
    q: "Is Hyperdome Car Wash eco-friendly?",
    a: "Yes — 92% of water used in each wash is reclaimed and recycled on site through a closed-loop water-recovery system. We also use eco-grade chemistry that is safe for paintwork, drains and the environment.",
  },
  {
    q: "What is included in a Full Detail?",
    a: "The Full Detail (from $350 for a sedan, 4–5 hours) includes everything in the Mini Detail — bug & tar removal, vinyl dressing, spray-on wax — plus engine-bay detailing, upholstery detail, door seals cleaned, boot shampoo, and a complete hand polish inside and out.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Hyperdome Car Wash accepts cash, credit card, EFTPOS, Apple Pay and Google Pay. Payment is made at the location when you collect your vehicle.",
  },
];

export const metadata: Metadata = {
  title: {
    absolute:
      "Hyperdome Car Wash Logan QLD — Hand-Finished Detailing & Same-Day Bookings",
  },
  description:
    "Professional car wash in Logan QLD. Hyperdome Car Wash offers hand-finished detailing, eco-grade chemistry and same-day bookings at two locations inside Hyperdome Shopping Centre.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title:
      "Hyperdome Car Wash Logan QLD — Hand-Finished Detailing & Same-Day Bookings",
    description:
      "Professional car wash in Logan QLD with hand-finished detailing, eco-grade chemistry and same-day bookings at two Hyperdome Shopping Centre locations.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Hyperdome Car Wash — Professional car wash in Logan QLD" }],
  },
};

const tickerItems = [
  "★ 4.9 Google rating",
  "Hand-finished detailing",
  "92% water reclaimed",
  "Eco-friendly chemistry",
  "Same-day bookings",
  "Members save 10%",
];

export default function Home() {
  return (
    <>
      {/* Hero (visible <h1> lives inside BannerSlider) */}
      <BannerSlider />

      {/* Marquee */}
      <Marquee items={tickerItems} />

      {/* Services + add-ons */}
      <section id="services" className="py-20 lg:py-24">
        <div className="container mx-auto flex flex-col gap-20 px-4 sm:px-6 lg:px-8">
          <ServicesSection />
          <ExtraServicesSection />
        </div>
      </section>

      {/* How it works */}
      <HowItWorksSection />

      {/* FAQ */}
      <section id="faq" className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            FAQ
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
            Frequently asked questions about Hyperdome Car Wash
          </h2>
          <dl className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {FAQ_QUESTIONS.map(({ q, a }) => (
              <div key={q} className="rounded-[20px] border border-line bg-card-gradient p-6 shadow-soft">
                <dt className="font-medium text-foreground text-[15px]">{q}</dt>
                <dd className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Booking */}
      <section id="booking" className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionIntro
            kicker="04 — Book a wash"
            title="Pick a time that fits."
            description="Schedule online in under a minute. We'll be ready when you arrive."
            className="mb-10"
          />
          <Suspense fallback={null}>
            <BookingForm />
          </Suspense>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews">
        <ReviewsSection />
      </section>

      {/* Big CTA band */}
      <CTABand />

      {/* Contact / locations */}
      <LocationsSection />

      <JsonLd id="ld-home-breadcrumb" data={breadcrumbLd([{ name: "Home", url: "/" }])} />
      <JsonLd id="ld-home-locations" data={allLocationsLd()} />
      <JsonLd id="ld-home-offers" data={offerCatalogLd()} />
      <JsonLd id="ld-home-faq" data={faqPageLd(FAQ_QUESTIONS)} />
      <JsonLd id="ld-home-reviews" data={reviewsLd()} />
    </>
  );
}
