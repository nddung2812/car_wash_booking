import type { Metadata } from "next";

import BeforeAfterSection from "@/components/BeforeAfterSection";
import CTABand from "@/components/CTABand";
import ExtraServicesSection from "@/components/ExtraServicesSection";
import ServicesSection from "@/components/ServicesSection";
import JsonLd from "@/components/seo/JsonLd";
import { services } from "@/data/services";
import {
  breadcrumbLd,
  extrasOfferCatalogLd,
  offerCatalogLd,
  serviceLd,
  videoObjectLd,
} from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Car Wash & Detailing Services",
  description:
    "Compare Hyperdome Car Wash packages in Logan QLD — hand wash from $40, interior detail, full detail with hand polish, plus add-ons like ceramic protection, leather treatment and engine bay detailing.",
  alternates: { canonical: "/services" },
  openGraph: {
    url: "/services",
    title: "Car Wash & Detailing Services — Hyperdome Logan QLD",
    description:
      "Hand-finished car wash and detailing packages in Logan QLD. Sparkles, Super Sparkles, Mini Detail, Interior Detail and Full Detail — pricing for sedans, wagons and 4×4s.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Hyperdome Car Wash — Professional car wash in Logan QLD" }],
  },
};

export default function ServicesPage() {
  return (
    <>
      <section className="py-20 lg:py-24">
        <div className="container mx-auto flex flex-col gap-8 px-4 sm:px-6 lg:px-8">
          <header className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Logan QLD · Shailer Park · Loganholme
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-foreground md:text-5xl">
              Car wash &amp; detailing in Logan QLD
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Every Hyperdome Car Wash package is hand-finished by trained
              detailers using eco-grade chemistry. Pick a fast freshen-up or a
              full multi-hour detail — pricing scales with vehicle size and you
              can add ceramic protection, leather treatment or engine-bay
              detailing at checkout.
            </p>
          </header>
        </div>
        <div className="container mx-auto mt-12 flex flex-col gap-20 px-4 sm:px-6 lg:px-8">
          <ServicesSection />
          <ExtraServicesSection />
        </div>
      </section>

      <BeforeAfterSection />

      <CTABand />

      <JsonLd
        id="ld-services-breadcrumb"
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
        ])}
      />
      <JsonLd id="ld-services-offers" data={offerCatalogLd()} />
      <JsonLd id="ld-services-extras" data={extrasOfferCatalogLd()} />
      {services.map((svc) => (
        <JsonLd key={svc.id} id={`ld-service-${svc.id}`} data={serviceLd(svc)} />
      ))}
      {services.map((svc) => (
        <JsonLd key={`vid-${svc.id}`} id={`ld-video-${svc.id}`} data={videoObjectLd(svc)} />
      ))}
    </>
  );
}
