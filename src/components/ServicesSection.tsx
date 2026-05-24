import React from "react";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SectionIntro } from "@/components/SectionIntro";
import { getMergedServices } from "@/lib/pricing";

const ServicesSection = async () => {
  const services = await getMergedServices();
  return (
    <div className="flex h-full flex-col">
      <SectionIntro
        kicker="01 — Packages"
        title="Pick the wash that fits the day."
        description="From a fast freshen-up to a full hand detail. Prices shown for sedan, station wagon and 4×4/SUV — pick your vehicle in checkout."
        className="mb-10"
      />

      <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2">
        {services.map((service, index) => {
          const isLast = index === services.length - 1;
          return (
            <article
              id={service.id}
              key={service.id}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-[20px] border border-line bg-card-gradient shadow-soft transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-glow",
                service.bestValue && "border-line-2",
                isLast && "sm:col-span-2",
              )}
            >
              {service.bestValue && (
                <span
                  aria-label={`Best value — save $${service.savings ?? 20}`}
                  className="absolute -right-2 top-4 z-10 -rotate-3 rounded-md bg-destructive px-2.5 py-1 text-center font-mono text-[10px] uppercase leading-tight tracking-[0.14em] text-white shadow-soft sm:-right-3 sm:top-6 sm:-rotate-6 sm:px-3 sm:py-1.5"
                >
                  Best value
                  <br />
                  Save ${service.savings ?? 20}
                </span>
              )}

              {service.promo && (
                <span
                  aria-label={
                    service.promo.ariaLabel ??
                    `${service.promo.line1} ${service.promo.line2}`
                  }
                  className="absolute -right-2 top-4 z-10 -rotate-3 rounded-md bg-destructive px-2.5 py-1 text-center font-mono text-[10px] uppercase leading-tight tracking-[0.14em] text-white shadow-soft sm:-right-3 sm:top-6 sm:-rotate-6 sm:px-3 sm:py-1.5"
                >
                  {service.promo.line1}
                  <br />
                  {service.promo.line2}
                </span>
              )}

              <header className="border-b border-primary-foreground/15 bg-primary px-5 py-3">
                <h3 className="font-serif text-xl uppercase leading-tight tracking-tight text-primary-foreground sm:text-2xl">
                  {service.name}
                </h3>
              </header>

              <div className="flex flex-1 flex-col gap-3 p-5">
                {service.subtitle && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {service.subtitle}
                  </span>
                )}
                <ul className="flex flex-col gap-2 text-[14px] leading-snug text-foreground/85">
                  {service.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5">
                      <Star
                        className="mt-1 size-3.5 shrink-0 fill-yellow text-yellow-ink"
                        strokeWidth={1.5}
                      />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-3 divide-x divide-line border-t border-line">
                {(
                  [
                    ["Sedan", "Sedan", service.pricing.sedan],
                    ["Station Wagon", "Wagon", service.pricing.wagon],
                    ["SUV / 4×4", "4×4", service.pricing.suv],
                  ] as const
                ).map(([fullLabel, shortLabel, value]) => (
                  <div key={fullLabel} className="px-3 py-3 text-center">
                    <div className="font-serif text-[26px] leading-none text-ink tabular-nums sm:text-[28px]">
                      ${value}
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      <span className="sm:hidden">{shortLabel}</span>
                      <span className="hidden sm:inline">{fullLabel}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-line p-4">
                <Button
                  asChild
                  className="w-full bg-yellow text-yellow-ink hover:bg-yellow-2"
                >
                  <Link href={`/book-car-wash-online?service=${service.id}`}>
                    Book this wash
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default ServicesSection;
