import { Clock, MapPin, Phone } from "lucide-react";

import { SectionIntro } from "@/components/SectionIntro";
import { IconPill } from "@/components/ui/icon-pill";
import { LOCATION_BY_SLUG } from "@/lib/seo/business";

const locations = [
  {
    slug: "shailer-park",
    name: "Shailer Park",
    address: "Hyperdome Shopping Centre",
    line2: "Carpark Basement — Mandew St",
    region: "Shailer Park QLD 4128",
  },
  {
    slug: "loganholme",
    name: "Loganholme",
    address: "Hyperdome Shopping Centre",
    line2: "Carpark Basement — 2 Leda Dr",
    region: "Loganholme QLD 4129",
  },
] as const;

type LocationsSectionProps = { showPhones?: boolean };

const businessHours: Array<[string, string]> = [
  ["Monday", "8:30 AM — 4:00 PM"],
  ["Tuesday", "9:00 AM — 4:00 PM"],
  ["Wednesday", "8:30 AM — 4:00 PM"],
  ["Thursday", "8:30 AM — 4:00 PM"],
  ["Friday", "8:30 AM — 4:00 PM"],
  ["Saturday", "8:30 AM — 4:00 PM"],
  ["Sunday", "9:00 AM — 4:00 PM"],
];

export default function LocationsSection({ showPhones = true }: LocationsSectionProps) {
  return (
    <section id="contact" className="bg-background py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionIntro
          kicker="05 — Locations"
          title="Two locations. Open 7 days."
          className="mb-12"
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {locations.map((loc) => (
            <article
              key={loc.slug}
              className="lift flex flex-col gap-4 rounded-[20px] border border-line bg-card-gradient p-6 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-[28px] leading-tight tracking-tight text-foreground">
                  {loc.name}
                </h3>
                <IconPill>
                  <MapPin className="size-4" />
                </IconPill>
              </div>
              <p className="text-[15px] text-muted-foreground">
                {loc.address}
                <br />
                {loc.line2}
                <br />
                {loc.region}
              </p>
              {showPhones && (
                <a
                  href={LOCATION_BY_SLUG[loc.slug].phoneTel}
                  className="inline-flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.12em] text-foreground transition-colors hover:text-primary"
                >
                  <Phone className="size-3.5 text-muted-foreground" />
                  {LOCATION_BY_SLUG[loc.slug].phoneDisplay}
                </a>
              )}
              <div className="relative mt-1 h-64 overflow-hidden rounded-[14px] border border-line">
                <iframe
                  src={LOCATION_BY_SLUG[loc.slug].mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map — Hyperdome Car Wash ${loc.name}`}
                />
              </div>
            </article>
          ))}
        </div>

        <article className="mt-6 rounded-[20px] border border-line bg-card-gradient p-6 shadow-soft lg:p-8">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-[24px] leading-tight tracking-tight text-foreground">
              Open 7 days
            </h3>
            <IconPill>
              <Clock className="size-4" />
            </IconPill>
          </div>
          <ul className="mt-6 flex flex-col">
            {businessHours.map(([day, hours]) => (
              <li
                key={day}
                className="flex items-baseline justify-between gap-3 border-b border-dashed border-line/60 py-2.5 last:border-b-0"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {day}
                </span>
                <span className="font-mono text-[13px] text-foreground tabular-nums">
                  {hours}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
