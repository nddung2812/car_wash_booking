import type { Metadata } from "next";

import CTABand from "@/components/CTABand";
import ReviewsSection from "@/components/ReviewsSection";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Customer Reviews",
  description:
    "Read what Logan locals say about Hyperdome Car Wash — hand-finished detailing, friendly service and showroom-fresh results across our Shailer Park and Loganholme locations.",
  alternates: { canonical: "/reviews" },
  openGraph: {
    url: "/reviews",
    title: "Customer Reviews — Hyperdome Car Wash Logan QLD",
    description:
      "Reviews and customer stories from drivers who book Hyperdome Car Wash at Hyperdome Shopping Centre, Logan QLD.",
  },
};

export default function ReviewsPage() {
  return (
    <>
      <ReviewsSection />
      <CTABand />

      <JsonLd
        id="ld-reviews-breadcrumb"
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Reviews", url: "/reviews" },
        ])}
      />
    </>
  );
}
