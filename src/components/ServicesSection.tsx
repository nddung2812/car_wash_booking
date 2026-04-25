import React from "react";
import Image from "next/image";
import { ArrowUpRight, Check, Clock, PlayCircle } from "lucide-react";

import { services } from "@/data/services";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionIntro } from "@/components/SectionIntro";

type Tier = "featured" | "top" | "standard";

const tierFor = (id: string): Tier =>
  id === "super-sparkles" ? "featured" : id === "full-detail" ? "top" : "standard";

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
          const tier = tierFor(service.id);
          const features = service.description
            .split(/\.\s+|\.$/)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 4);

          return (
            <article
              key={service.id}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-[20px] border bg-card-gradient shadow-none transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-glow",
                tier === "featured" && "border-primary/40 hover:border-primary/60",
                tier === "top" && "border-line-2",
                tier === "standard" && "border-line hover:border-line-2"
              )}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
                <Image
                  src={service.image}
                  alt={`${service.name} — car wash service`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent",
                    tier === "featured" &&
                      "bg-gradient-to-t from-[#0A1F5C]/65 via-[#0A1F5C]/10 to-transparent"
                  )}
                />

                <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-pill border border-white/40 bg-white/85 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-foreground backdrop-blur">
                    <Clock className="size-3" />
                    {service.duration}
                  </span>
                  {tier === "featured" && <Badge>Most booked</Badge>}
                  {tier === "top" && (
                    <Badge
                      variant="outline"
                      className="border-white/60 bg-white/85 text-foreground"
                    >
                      Top tier
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-6">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  0{index + 1} — Package
                </span>

                <div className="flex flex-col gap-1.5">
                  <h3 className="font-serif text-[28px] leading-tight tracking-tight text-foreground">
                    {service.name}
                  </h3>
                  <p className="text-[14px] leading-snug text-muted-foreground">
                    {service.tagline}
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    From
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-[48px] leading-none text-primary">
                      ${service.pricing.sedan}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      / sedan
                    </span>
                  </div>
                </div>

                <ul className="flex flex-col gap-2 border-t border-dashed border-line pt-4 text-[14px] text-foreground/85">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="leading-snug">{feature}.</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  <span>
                    <span className="text-foreground">Sedan</span> ${service.pricing.sedan}
                  </span>
                  <span aria-hidden>·</span>
                  <span>
                    <span className="text-foreground">Wagon</span> ${service.pricing.wagon}
                  </span>
                  <span aria-hidden>·</span>
                  <span>
                    <span className="text-foreground">4×4</span> ${service.pricing.suv}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <Button asChild variant={tier === "featured" ? "default" : "outline"}>
                    <a href="#booking">
                      Choose this wash
                      <ArrowUpRight className="size-4" />
                    </a>
                  </Button>
                  <a
                    href={service.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <PlayCircle className="size-3.5" />
                    Video
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default ServicesSection;
