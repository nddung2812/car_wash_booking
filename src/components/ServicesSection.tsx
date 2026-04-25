import React from "react";
import { ArrowUpRight, Check } from "lucide-react";

import { services } from "@/data/services";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionIntro } from "@/components/SectionIntro";

const ServicesSection = () => {
  return (
    <div className="flex h-full flex-col">
      <SectionIntro
        kicker="01 — Packages"
        title="Pick the wash that fits the day."
        description="From a fast freshen-up to a full hand detail. Prices shown for sedans — selecting a larger vehicle in checkout adjusts the total."
        className="mb-10"
      />

      <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => {
          const featured = service.id === "super-sparkles";
          const features = service.description
            .split(/\.\s+|\.$/)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 4);

          return (
            <article
              key={service.id}
              className={cn(
                "lift relative flex flex-col gap-5 rounded-[20px] border bg-card-gradient p-6 shadow-soft",
                featured ? "border-primary/40 shadow-glow" : "border-line"
              )}
            >
              {featured && (
                <Badge className="absolute right-5 top-5">
                  Most booked
                </Badge>
              )}

              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  0{index + 1}
                </span>
              </div>

              <h3 className="font-serif text-[28px] leading-tight tracking-tight text-foreground">
                {service.name}
              </h3>

              <div className="flex items-baseline gap-2">
                <span className="font-serif text-[44px] leading-none text-primary">
                  ${service.pricing.sedan}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  / sedan
                </span>
              </div>

              <ul className="flex flex-col gap-2 border-t border-dashed border-line pt-4 text-[14px] text-foreground/80">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="leading-snug">{feature}.</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                <a
                  href={service.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Watch video
                  <ArrowUpRight className="size-3.5" />
                </a>
                <Button asChild size="sm" variant={featured ? "default" : "outline"}>
                  <a href="#booking">Choose</a>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-1.5 border-t border-line pt-4 font-mono text-[11px] uppercase tracking-[0.12em]">
                {[
                  { label: "Sedan", value: service.pricing.sedan },
                  { label: "Wagon", value: service.pricing.wagon },
                  { label: "4×4", value: service.pricing.suv },
                ].map((p) => (
                  <div
                    key={p.label}
                    className="flex flex-col items-center rounded-lg border border-line bg-card/40 px-2 py-2"
                  >
                    <span className="text-muted-foreground">{p.label}</span>
                    <span className="mt-1 text-[14px] font-semibold tracking-normal text-foreground">
                      ${p.value}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default ServicesSection;
