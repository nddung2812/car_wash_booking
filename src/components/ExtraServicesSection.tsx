import React from "react";
import { Plus } from "lucide-react";

import { extraServices } from "@/data/services";
import { SectionIntro } from "@/components/SectionIntro";

const ExtraServicesSection = () => {
  return (
    <div className="flex h-full flex-col">
      <SectionIntro
        kicker="02 — Add-ons"
        title="A little extra love."
        description="Optional add-ons that pair with any package. Add them at checkout — your final price updates live."
        className="mb-10"
      />

      <div className="rounded-[20px] border border-line bg-card-gradient p-2 shadow-soft">
        <div className="hidden grid-cols-[1fr_repeat(3,minmax(64px,84px))] items-center gap-x-4 border-b border-dashed border-line px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:grid">
          <span>Service</span>
          <span className="text-right">Sedan</span>
          <span className="text-right">Wagon</span>
          <span className="text-right">4×4</span>
        </div>

        <ul className="flex flex-col divide-y divide-line/60 sm:divide-y-0">
          {extraServices.map((service) => {
            const prices: Array<[string, number]> = [
              ["Sedan", service.pricing.sedan],
              ["Wagon", service.pricing.wagon],
              ["4×4", service.pricing.suv],
            ];
            return (
              <li
                id={service.id}
                key={service.id}
                className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-secondary/60 sm:grid sm:grid-cols-[1fr_repeat(3,minmax(64px,84px))] sm:items-center sm:gap-x-4 sm:gap-y-0"
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-pill border border-line bg-card text-primary"
                  >
                    <Plus className="size-3" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-medium text-foreground">
                      {service.name}
                    </span>
                    {service.description && (
                      <span className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        {service.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:contents">
                  {prices.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-baseline justify-between gap-1.5 rounded-lg border border-line bg-card/40 px-2 py-1.5 sm:block sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:text-right"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:hidden">
                        {label}
                      </span>
                      <span className="font-mono text-[14px] tabular-nums text-foreground">
                        ${value}
                      </span>
                    </div>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6 flex flex-col gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <p>* Excessively dirty vehicles may incur extra charges</p>
        <p>** Prices are indicative and vary slightly between stores</p>
        <p>*** Call ahead to confirm availability and pricing</p>
      </div>
    </div>
  );
};

export default ExtraServicesSection;
