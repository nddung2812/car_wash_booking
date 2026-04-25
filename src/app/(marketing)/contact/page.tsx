import type { Metadata } from "next";

import CTABand from "@/components/CTABand";
import LocationsSection from "@/components/LocationsSection";

export const metadata: Metadata = {
  title: "Contact — Hyperdome",
  description: "Find Hyperdome at our two Hyperdome Shopping Centre locations.",
};

export default function ContactPage() {
  return (
    <>
      <LocationsSection />
      <CTABand />
    </>
  );
}
