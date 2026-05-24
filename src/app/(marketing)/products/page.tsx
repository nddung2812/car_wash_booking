import type { Metadata } from "next";

import CTABand from "@/components/CTABand";
import ProductsSection from "@/components/ProductsSection";
import { listProducts } from "@/lib/products";

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

export default async function ProductsPage() {
  const products = await listProducts();
  return (
    <>
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-10 max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Shop · Car care products
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-foreground md:text-5xl">
              Car care products we use in the bay
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              The same shampoos, microfibre towels, spray wax, interior cleaners
              and ceramic coating kits our detailers reach for every day.
              Shipped Australia-wide for a flat rate.
            </p>
          </header>
          <ProductsSection products={products} />
        </div>
      </section>

      <CTABand />
    </>
  );
}
