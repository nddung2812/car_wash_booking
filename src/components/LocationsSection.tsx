import { MapPin, Phone } from "lucide-react";

import { SectionIntro } from "@/components/SectionIntro";
import { IconPill } from "@/components/ui/icon-pill";

const locations = [
  {
    name: "Shailer Park",
    address: "Hyperdome Shopping Centre",
    line2: "Carpark Basement — Mandew St",
    region: "Shailer Park QLD 4128",
  },
  {
    name: "Loganholme",
    address: "Hyperdome Shopping Centre",
    line2: "Carpark Basement — 2 Leda Dr",
    region: "Loganholme QLD 4129",
  },
];

const businessHours: Array<[string, string]> = [
  ["Monday", "8:30 AM — 5:00 PM"],
  ["Tuesday", "9:00 AM — 5:00 PM"],
  ["Wednesday", "8:30 AM — 5:00 PM"],
  ["Thursday", "8:30 AM — 5:00 PM"],
  ["Friday", "8:30 AM — 5:00 PM"],
  ["Saturday", "8:30 AM — 5:00 PM"],
  ["Sunday", "9:00 AM — 5:00 PM"],
];

export default function LocationsSection() {
  return (
    <section id="contact" className="bg-background py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionIntro
          kicker="05 — Locations"
          title="Two locations. Open seven days."
          className="mb-12"
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="flex flex-col gap-5">
            {locations.map((loc) => (
              <article
                key={loc.name}
                className="lift flex flex-col gap-3 rounded-[20px] border border-line bg-card-gradient p-6 shadow-soft"
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
              </article>
            ))}

            <article className="rounded-[20px] border border-line bg-card-gradient p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-[24px] leading-tight tracking-tight text-foreground">
                  Reach us
                </h3>
                <IconPill>
                  <Phone className="size-4" />
                </IconPill>
              </div>
              <a
                href="tel:0738060358"
                className="mt-3 inline-block font-serif text-3xl text-foreground"
              >
                (07) 3806 0358
              </a>
              <ul className="mt-5 grid grid-cols-1 gap-1.5 border-t border-dashed border-line pt-4 text-[14px]">
                {businessHours.map(([day, hours]) => (
                  <li key={day} className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {day}
                    </span>
                    <span className="font-mono text-[12px] text-foreground tabular-nums">{hours}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <div className="relative h-72 overflow-hidden rounded-[20px] border border-line shadow-soft lg:h-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3533.887531633727!2d153.16938207546565!3d-27.658951176210298!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b91423b28b00705%3A0x41c1806fafd6115d!2sSparkles%20Car%20Wash!5e0!3m2!1sen!2sau!4v1753526071902!5m2!1sen!2sau"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Hyperdome locations"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
