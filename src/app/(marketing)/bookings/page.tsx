import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";

import BookingForm from "@/components/BookingForm";
import CTABand from "@/components/CTABand";
import { SectionIntro } from "@/components/SectionIntro";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbLd } from "@/lib/seo/jsonld";
import { getLatestBookingByUser } from "@/db/queries";

export const metadata: Metadata = {
  title: "Book a Car Wash Online",
  description:
    "Book a car wash online in Logan QLD at Hyperdome Car Wash. Same-day slots at Shailer Park & Loganholme — pick your package, vehicle type and time in under a minute.",
  alternates: { canonical: "/bookings" },
  robots: { index: true, follow: true },
  openGraph: {
    url: "/bookings",
    title: "Book a Car Wash Online in Logan QLD — Hyperdome",
    description:
      "Same-day car wash bookings at Hyperdome Shopping Centre, Logan QLD. Sedans, wagons and 4×4s welcome — confirm a slot in under a minute.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Hyperdome Car Wash — Professional car wash in Logan QLD" }],
  },
};

export default async function BookingsPage() {
  const { userId } = await auth();
  const last = userId ? await getLatestBookingByUser(userId) : null;
  const initialValues = last
    ? { phone: last.phone, address: last.address }
    : undefined;

  return (
    <>
      <section className="border-b border-line py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Online booking · Logan QLD
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-foreground md:text-5xl">
            Book a car wash online in Logan QLD
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Reserve a hand-finished car wash at Hyperdome Car Wash in under a
            minute. Same-day online booking is open at both our Shailer Park
            and Loganholme bays inside Hyperdome Shopping Centre — pick a
            package, choose a time, and pay when you arrive.
          </p>
        </div>
      </section>
      <section className="py-20 lg:py-24">
        <div className="container mx-auto flex flex-col gap-20 px-4 sm:px-6 lg:px-8">
          <div>
            <SectionIntro
              kicker="Book a wash"
              title="Pick a time that fits."
              description="Schedule a hand-finished wash at Hyperdome Car Wash, Logan QLD in under a minute — same-day slots open at both Shailer Park and Loganholme."
              className="mb-10"
            />
            <Suspense fallback={null}>
              <BookingForm initialValues={initialValues} />
            </Suspense>
          </div>
        </div>
      </section>
      <CTABand />

      <JsonLd
        id="ld-bookings-breadcrumb"
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Book a wash", url: "/bookings" },
        ])}
      />
    </>
  );
}
