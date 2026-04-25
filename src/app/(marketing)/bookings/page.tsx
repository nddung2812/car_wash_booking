import type { Metadata } from "next";
import { Suspense } from "react";

import BookingForm from "@/components/BookingForm";
import CTABand from "@/components/CTABand";
import ExtraServicesSection from "@/components/ExtraServicesSection";
import { SectionIntro } from "@/components/SectionIntro";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Book a Car Wash Online — Logan QLD",
  description:
    "Book a professional car wash at Hyperdome Logan QLD in under a minute. Same-day slots available at Shailer Park and Loganholme — pick your package, vehicle type and time.",
  alternates: { canonical: "/bookings" },
  robots: { index: true, follow: true },
  openGraph: {
    url: "/bookings",
    title: "Book a Car Wash Online — Hyperdome Logan QLD",
    description:
      "Same-day car wash bookings at Hyperdome Shopping Centre, Logan QLD. Sedans, wagons and 4×4s welcome — confirm a slot in under a minute.",
  },
};

export default function BookingsPage() {
  return (
    <>
      <section className="py-20 lg:py-24">
        <div className="container mx-auto flex flex-col gap-20 px-4 sm:px-6 lg:px-8">
          <div>
            <SectionIntro
              kicker="Book a wash"
              title="Pick a time that fits."
              description="Schedule a hand-finished wash at Hyperdome Car Wash, Logan QLD in under a minute — same-day slots open at both Shailer Park and Loganholme."
              className="mb-10"
            />
            <Suspense fallback={null}>
              <BookingForm />
            </Suspense>
          </div>
          <ExtraServicesSection />
        </div>
      </section>
      <CTABand />

      <JsonLd
        id="ld-bookings-breadcrumb"
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Book a wash", url: "/bookings" },
        ])}
      />
    </>
  );
}
