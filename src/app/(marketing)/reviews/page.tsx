import type { Metadata } from "next";

import CTABand from "@/components/CTABand";
import ReviewsSection from "@/components/ReviewsSection";

export const metadata: Metadata = {
  title: "Reviews — Hyperdome",
  description: "What customers say about Hyperdome car wash and detailing.",
};

export default function ReviewsPage() {
  return (
    <>
      <ReviewsSection />
      <CTABand />
    </>
  );
}
