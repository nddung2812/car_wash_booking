import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Phone, Clock, Car } from "lucide-react";

import { Button } from "@/components/ui/button";
import CTABand from "@/components/CTABand";
import JsonLd from "@/components/seo/JsonLd";
import {
  BUSINESS_PHONE_DISPLAY,
  LOCATION_BY_SLUG,
  OPENING_HOURS,
} from "@/lib/seo/business";
import { breadcrumbLd, localBusinessLd } from "@/lib/seo/jsonld";

const location = LOCATION_BY_SLUG["shailer-park"];

export const metadata: Metadata = {
  title: "Car Wash Shailer Park — Hyperdome Shopping Centre QLD 4128",
  description:
    "Hyperdome Car Wash on Mandew St, Shailer Park QLD 4128 — hand-finished car wash and detailing inside Hyperdome Shopping Centre's basement carpark. Same-day bookings, sedans to 4×4s, open 7 days.",
  alternates: { canonical: "/locations/shailer-park" },
  openGraph: {
    url: "/locations/shailer-park",
    title: "Car Wash Shailer Park QLD — Hyperdome Shopping Centre",
    description:
      "Professional hand-finished car wash on the Mandew St side of Hyperdome Shopping Centre, Shailer Park QLD 4128. Open seven days.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Hyperdome Car Wash — Professional car wash in Logan QLD" }],
  },
};

export default function ShailerParkPage() {
  return (
    <>
      <section className="border-b border-line py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <span>Locations</span>
            <span className="mx-2">/</span>
            <span className="text-foreground">Shailer Park</span>
          </nav>

          <h1 className="mt-6 font-serif text-4xl leading-tight tracking-tight text-foreground md:text-6xl">
            Car wash in Shailer Park, QLD 4128
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
            Hyperdome Car Wash on the Mandew Street side of Hyperdome Shopping
            Centre is the closest professional car wash for residents of
            Shailer Park, Cornubia, Tanah Merah and Daisy Hill. Drive into the
            basement carpark, drop the keys with our team, and pick up a
            hand-finished, showroom-fresh car while you shop or grab a coffee
            upstairs.
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
            <Button asChild size="lg" variant="ghost">
              <a href="tel:+61738060358">
                <Phone className="size-4" />
                {BUSINESS_PHONE_DISPLAY}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto grid grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-8">
          <div className="flex flex-col gap-6 text-[15px] leading-relaxed text-foreground/85">
            <h2 className="font-serif text-3xl leading-tight tracking-tight text-foreground">
              Why locals book Shailer Park
            </h2>
            <p>
              Shailer Park sits on the western edge of Hyperdome Shopping
              Centre with quick access from the Pacific Motorway via the
              Bryants Road exit. Our Mandew Street bay handles roughly half of
              the centre's daily wash traffic — it's the closer entry for
              anyone coming north from Beenleigh or south from Springwood, and
              the easier carpark to reach if you live around Daisy Hill or
              Cornubia.
            </p>
            <p>
              We hand-wash every vehicle here using the same eco-grade
              chemistry and ceramic-grade chemistry as our Loganholme bay — no
              automated tunnels, no harsh recirculated water, and no rush. The
              Shailer Park bay specialises in <strong>quick turnaround</strong>{" "}
              washes during weekday lunch breaks: the 30-minute Sparkles Wash
              and 45-minute Super Sparkles run on a half-hour cadence so you
              can drop, shop and drive away on schedule.
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight tracking-tight text-foreground">
              Driving here from the M1
            </h2>
            <p>
              From the Pacific Motorway northbound, take exit 30 (Bryants
              Road), turn right onto Bryants Road and continue 600 metres to
              Mandew Street. The Hyperdome basement entrance is signposted on
              your right; follow the ramp down, then look for the Hyperdome
              Car Wash bay near the centre's western lift core.
            </p>
            <p>
              From Logan Hyperdome bus interchange the bay is a 3-minute walk —
              ideal if you're combining a wash with a movie at Limelight Cinema
              or a meal in the food court.
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight tracking-tight text-foreground">
              Vehicles we wash here
            </h2>
            <p>
              Sedans, hatches, station wagons, SUVs and dual-cab utes all fit
              the Shailer Park bay. For oversized 4×4s with rooftop tents or
              tradie ladder racks, we recommend our Loganholme bay on{" "}
              <Link href="/locations/loganholme" className="underline">
                Leda Drive
              </Link>{" "}
              which has higher clearance.
            </p>
            <p>
              Add-ons available at this location include hand polish, paint
              protection, dog hair removal, leather treatment and Slipstream
              weather-shield — see the full{" "}
              <Link href="/services" className="underline">
                services menu
              </Link>{" "}
              for pricing.
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
                <Phone className="size-3.5" />
                Phone
              </div>
              <a
                href="tel:+61738060358"
                className="mt-3 inline-block font-serif text-2xl text-foreground"
              >
                {BUSINESS_PHONE_DISPLAY}
              </a>
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
                Shailer Park · Cornubia · Tanah Merah · Daisy Hill · Rochedale
                South · Underwood · Springwood
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
                title="Map — Hyperdome Car Wash Shailer Park"
              />
            </div>
          </aside>
        </div>
      </section>

      <CTABand />

      <JsonLd
        id="ld-shailer-park-breadcrumb"
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Locations", url: "/contact" },
          { name: "Shailer Park", url: "/locations/shailer-park" },
        ])}
      />
      <JsonLd id="ld-shailer-park-localbusiness" data={localBusinessLd(location)} />
    </>
  );
}

function formatHour(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:${String(m).padStart(2, "0")} ${ampm}`;
}

