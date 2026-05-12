import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Clock, Car } from "lucide-react";

import { Button } from "@/components/ui/button";
import CTABand from "@/components/CTABand";
import JsonLd from "@/components/seo/JsonLd";
import { LOCATION_BY_SLUG, OPENING_HOURS } from "@/lib/seo/business";
import { breadcrumbLd, localBusinessLd } from "@/lib/seo/jsonld";

const location = LOCATION_BY_SLUG["loganholme"];

export const metadata: Metadata = {
  title: "Car Wash Loganholme QLD 4129",
  description:
    "Hyperdome Car Wash on 2 Leda Dr, Loganholme QLD 4129 — full-service hand car wash and detailing inside the Loganholme side of Hyperdome Shopping Centre. Higher clearance for 4×4s. Same-day bookings, open 7 days.",
  alternates: { canonical: "/locations/loganholme" },
  openGraph: {
    url: "/locations/loganholme",
    title: "Car Wash Loganholme QLD — Hyperdome Shopping Centre",
    description:
      "Hand-finished car wash on the Leda Drive side of Hyperdome Shopping Centre, Loganholme QLD 4129. Higher clearance for 4×4s. Open seven days.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Hyperdome Car Wash — Professional car wash in Logan QLD" }],
  },
};

export default function LoganholmePage() {
  return (
    <>
      <section className="border-b border-line py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <span>Locations</span>
            <span className="mx-2">/</span>
            <span className="text-foreground">Loganholme</span>
          </nav>

          <h1 className="mt-6 font-serif text-4xl leading-tight tracking-tight text-foreground md:text-6xl">
            Car wash in Loganholme, QLD 4129
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
            Hyperdome Car Wash on Leda Drive sits on the eastern, Loganholme
            side of Hyperdome Shopping Centre — the easiest entry if you're
            arriving from Beenleigh, Bethania, Carbrook or anywhere east of
            the Pacific Motorway. This is also our higher-clearance bay,
            built to fit 4×4s with roof racks, dual-cab utes with canopies
            and family SUVs other indoor washes can't accommodate.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/bookings">
                Book this location
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={location.directionsUrl} target="_blank" rel="noopener">
                Get directions
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto grid grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-8">
          <div className="flex flex-col gap-6 text-[15px] leading-relaxed text-foreground/85">
            <h2 className="font-serif text-3xl leading-tight tracking-tight text-foreground">
              The detailing destination for Logan east
            </h2>
            <p>
              Loganholme is the bay regulars choose for the longer detail
              jobs — Mini Detail, Interior Detail and our flagship Full
              Detail with engine-bay cleaning and hand polish. The 4–5 hour
              workflow runs comfortably here because the Leda Drive side has
              an extra polishing area and dedicated upholstery shampoo
              station that the Shailer Park bay doesn't.
            </p>
            <p>
              If you're picking the car up the same day, drop it before 11 AM
              and we'll have it ready by mid-afternoon. Wait-while-you-go
              washes (Sparkles and Super Sparkles) are still available; the
              detailing rooms run in parallel so neither queue blocks the
              other.
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight tracking-tight text-foreground">
              Driving here from Beenleigh & east Logan
            </h2>
            <p>
              From the Pacific Motorway southbound, take exit 30 (Bryants
              Road), at the roundabout follow signs for Hyperdome / Leda
              Drive and continue past the cinema entry. The basement carpark
              ramp is on your left after the Coles drop-off zone. Park near
              the eastern lift core — the car-wash bay is signposted from
              the underside of the cinema block.
            </p>
            <p>
              Coming from Beenleigh, Eagleby or Mount Warren Park? Take
              Logan River Road across the river and turn left at Leda
              Drive — it's a five-minute drive door to door.
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight tracking-tight text-foreground">
              Big vehicles welcome
            </h2>
            <p>
              The Loganholme bay was sized for tradies and families with
              big rigs. We routinely handle 4×4s with bull bars and rooftop
              tents, dual-cab utes with tonneau covers, vans up to 2.4m
              tall, and seven-seat SUVs. Pricing reflects vehicle size — see
              the live quote on the{" "}
              <Link href="/bookings" className="underline">
                booking form
              </Link>
              .
            </p>
            <p>
              For a quick freshen-up only, our{" "}
              <Link href="/locations/shailer-park" className="underline">
                Shailer Park bay
              </Link>{" "}
              on the western side handles short-cycle washes faster — same
              hours, same chemistry, slightly different layout.
            </p>
          </div>

          <aside className="flex flex-col gap-5">
            <article className="rounded-[20px] border border-line bg-card-gradient p-6 shadow-soft">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                <MapPin className="size-3.5" />
                Address
              </div>
              <p className="mt-3 text-[15px] text-foreground/85">
                {location.streetAddress}
                <br />
                {location.addressLocality} QLD {location.postalCode}
              </p>
            </article>

            <article className="rounded-[20px] border border-line bg-card-gradient p-6 shadow-soft">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                <Clock className="size-3.5" />
                Hours
              </div>
              <ul className="mt-3 grid grid-cols-1 gap-1.5 text-[14px]">
                {OPENING_HOURS.map((h) => (
                  <li key={h.day} className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {h.day}
                    </span>
                    <span className="font-mono text-[12px] text-foreground tabular-nums">
                      {formatHour(h.opens)} — {formatHour(h.closes)}
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-[20px] border border-line bg-card-gradient p-6 shadow-soft">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                <Car className="size-3.5" />
                Areas served
              </div>
              <p className="mt-3 text-[14px] text-foreground/85">
                Loganholme · Beenleigh · Eagleby · Bethania · Carbrook · Mount
                Warren Park · Tanah Merah
              </p>
            </article>

            <div className="relative h-72 overflow-hidden rounded-[20px] border border-line shadow-soft">
              <iframe
                src={location.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Map — Hyperdome Car Wash Loganholme"
              />
            </div>
          </aside>
        </div>
      </section>

      <CTABand />

      <JsonLd
        id="ld-loganholme-breadcrumb"
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
          { name: "Loganholme", url: "/locations/loganholme" },
        ])}
      />
      <JsonLd id="ld-loganholme-localbusiness" data={localBusinessLd(location)} />
    </>
  );
}

function formatHour(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:${String(m).padStart(2, "0")} ${ampm}`;
}

