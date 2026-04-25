import type { Metadata } from "next";

import BookingForm from "@/components/BookingForm";
import CTABand from "@/components/CTABand";
import ExtraServicesSection from "@/components/ExtraServicesSection";
import { SectionIntro } from "@/components/SectionIntro";

export const metadata: Metadata = {
  title: "Book a wash — Hyperdome",
  description: "Schedule your wash in under a minute.",
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
              description="Schedule online in under a minute. We'll be ready when you arrive."
              className="mb-10"
            />
            <BookingForm />
          </div>
          <ExtraServicesSection />
        </div>
      </section>
      <CTABand />
    </>
  );
}
