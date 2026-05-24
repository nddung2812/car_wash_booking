import type { Metadata } from "next";
import { Suspense } from "react";

import BannerSlider from "@/components/BannerSlider";
import BeforeAfterSection from "@/components/BeforeAfterSection";
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
  offerCatalogLd,
} from "@/lib/seo/jsonld";
import { getMergedPricing } from "@/lib/pricing";

export const metadata: Metadata = {
  title: {
    absolute: "Hyperdome Car Wash — Hand-Finished Detailing in Logan QLD",
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
];

export default async function Home() {
  const pricing = await getMergedPricing();
  return (
    <>
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

      {/* Full Detail before & after */}
      <BeforeAfterSection />

      {/* How it works */}
      <HowItWorksSection />

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
            <BookingForm
              services={pricing.services}
              extraServices={pricing.extras}
            />
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
      <LocationsSection showPhones={false} />

      <JsonLd id="ld-home-breadcrumb" data={breadcrumbLd([{ name: "Home", url: "/" }])} />
      <JsonLd id="ld-home-locations" data={allLocationsLd()} />
      <JsonLd id="ld-home-offers" data={offerCatalogLd()} />
    </>
  );
}
