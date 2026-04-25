import type { Metadata } from "next";

import CTABand from "@/components/CTABand";
import LocationsSection from "@/components/LocationsSection";
import JsonLd from "@/components/seo/JsonLd";
import { allLocationsLd, breadcrumbLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Contact — Shailer Park & Loganholme QLD",
  description:
    "Contact Hyperdome Car Wash in Logan QLD — phone (07) 3806 0358. Two locations inside Hyperdome Shopping Centre at Shailer Park and Loganholme. Open seven days a week.",
  alternates: { canonical: "/contact" },
  openGraph: {
    url: "/contact",
    title: "Contact Hyperdome Car Wash — Logan QLD",
    description:
      "Call (07) 3806 0358 or visit Hyperdome Car Wash at Shailer Park or Loganholme. Open seven days, same-day bookings available.",
  },
};

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-line py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Contact
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-foreground md:text-5xl">
            Hyperdome Car Wash, Logan QLD
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Hyperdome Car Wash operates two professional car-wash and detailing
            bays inside Hyperdome Shopping Centre, Logan QLD — one on the
            Shailer Park side and one on the Loganholme side. Call{" "}
            <a className="underline" href="tel:+61738060358">
              (07) 3806 0358
            </a>
            , book online, or drive in seven days a week.
          </p>
        </div>
      </section>

      <LocationsSection />
      <CTABand />

      <JsonLd
        id="ld-contact-breadcrumb"
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
        ])}
      />
      <JsonLd id="ld-contact-locations" data={allLocationsLd()} />
    </>
  );
}
