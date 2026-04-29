import type { Metadata } from "next";

import CTABand from "@/components/CTABand";
import ReviewsSection from "@/components/ReviewsSection";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Reviews — Hyperdome Car Wash, Logan QLD",
  description:
    "See why Logan locals book Hyperdome Car Wash. Customer testimonials from Shailer Park and Loganholme — hand-finished detailing, eco-grade chemistry and same-day online bookings.",
  alternates: { canonical: "/reviews" },
  openGraph: {
    url: "/reviews",
    title: "Hyperdome Car Wash Reviews — Logan QLD",
    description:
      "Customer reviews of Hyperdome Car Wash at Hyperdome Shopping Centre, Logan QLD — Shailer Park and Loganholme bays.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Hyperdome Car Wash — Professional car wash in Logan QLD" }],
  },
};

export default function ReviewsPage() {
  return (
    <>
      <section className="border-b border-line py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Reviews · Logan QLD
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-foreground md:text-5xl">
            Hyperdome Car Wash reviews — Logan QLD
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Hyperdome Car Wash has hand-finished tens of thousands of cars at
            Hyperdome Shopping Centre across Shailer Park (4128) and
            Loganholme (4129). Read what local drivers think of our wash and
            detailing service, then{" "}
            <a className="underline" href="/bookings">
              book online
            </a>{" "}
            in under a minute.
          </p>
        </div>
      </section>
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
