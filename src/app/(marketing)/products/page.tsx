import type { Metadata } from "next";

import CTABand from "@/components/CTABand";
import ProductsSection from "@/components/ProductsSection";

export const metadata: Metadata = {
  title: "Car Care Products",
  description:
    "Shop the car care products we use in the bay every day — shampoos, microfibre towels, spray wax, interior cleaners and ceramic coating kits.",
  alternates: { canonical: "/products" },
  openGraph: {
    url: "/products",
    title: "Car Care Products | Hyperdome Car Wash",
    description:
      "Shop the car care products we use in the bay every day — shampoos, microfibre towels, spray wax, interior cleaners and ceramic coating kits.",
  },
};

export default function ProductsPage() {
  return (
    <>
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ProductsSection />
        </div>
      </section>

      <CTABand />
    </>
  );
}
