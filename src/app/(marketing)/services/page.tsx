import type { Metadata } from "next";

import CTABand from "@/components/CTABand";
import ExtraServicesSection from "@/components/ExtraServicesSection";
import ServicesSection from "@/components/ServicesSection";

export const metadata: Metadata = {
  title: "Services — Hyperdome",
  description:
    "Hand-finished detailing, eco-grade chemistry, and a full menu of wash packages and add-ons.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="py-20 lg:py-24">
        <div className="container mx-auto flex flex-col gap-20 px-4 sm:px-6 lg:px-8">
          <ServicesSection />
          <ExtraServicesSection />
        </div>
      </section>
      <CTABand />
    </>
  );
}
