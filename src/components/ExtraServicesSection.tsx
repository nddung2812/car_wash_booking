import React from "react";
import { Star } from "lucide-react";

import { type ExtraService } from "@/data/services";
import { SectionIntro } from "@/components/SectionIntro";
import { getMergedExtras } from "@/lib/pricing";

const CERAMIC_ID = "ceramic-paint-protection";

function PriceTag({ extra }: { extra: ExtraService }) {
  const { pricing, priceNote = "flat" } = extra;
  if (priceNote === "quote") {
    return (
      <span className="inline-flex items-center rounded-pill bg-secondary px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
        Quote
      </span>
    );
  }
  if (priceNote === "from") {
    return (
      <span className="whitespace-nowrap font-mono text-[13px] tabular-nums text-foreground">
        <span className="text-muted-foreground">from </span>${pricing.sedan}
      </span>
    );
  }
  if (priceNote === "tiered") {
    return (
      <span className="whitespace-nowrap font-mono text-[12px] tabular-nums text-foreground sm:text-[13px]">
        <span className="text-foreground">${pricing.sedan}</span>
        <span className="px-0.5 text-muted-foreground">/</span>
        <span className="text-foreground">${pricing.wagon}</span>
        <span className="px-0.5 text-muted-foreground">/</span>
        <span className="text-foreground">${pricing.suv}</span>
      </span>
    );
  }
  return (
    <span className="whitespace-nowrap font-mono text-[13px] tabular-nums text-foreground">
      ${pricing.sedan}
    </span>
  );
}

const ExtraServicesSection = async () => {
  const extraServices = await getMergedExtras();
  const ceramic = extraServices.find((e) => e.id === CERAMIC_ID);
  const items = extraServices.filter((e) => e.id !== CERAMIC_ID);

  return (
    <div className="flex h-full flex-col">
      <SectionIntro
        kicker="02 — Add-ons"
        title="A little extra love."
        description="Optional add-ons that pair with any package. Add them at checkout — your final price updates live."
        className="mb-10"
      />

      <div className="overflow-hidden rounded-[20px] border border-line bg-card-gradient shadow-soft">
        <header className="flex items-baseline justify-between gap-3 border-b border-primary-foreground/15 bg-primary px-5 py-3">
          <h3 className="font-serif text-xl uppercase leading-tight tracking-tight text-primary-foreground sm:text-2xl">
            Extra Services
          </h3>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-primary-foreground/70 sm:inline">
            Sedan · Wagon · SUV/4×4
          </span>
        </header>

        <ul className="grid grid-cols-1 sm:grid-cols-2 sm:[&>li:nth-child(odd)]:border-r sm:[&>li:nth-child(odd)]:border-line">
          {items.map((extra) => (
            <li
              key={extra.id}
              id={extra.id}
              className="flex items-start justify-between gap-4 px-4 py-3"
            >
              <div className="flex min-w-0 items-start gap-2">
                <Star
                  className="mt-1 size-3 shrink-0 fill-yellow text-yellow-ink"
                  strokeWidth={1.5}
                />
                <div className="flex min-w-0 flex-col">
                  <span className="text-[14px] leading-snug text-foreground">
                    {extra.name}
                  </span>
                  {extra.description && (
                    <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {extra.description}
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0 pt-0.5">
                <PriceTag extra={extra} />
              </div>
            </li>
          ))}
        </ul>

        {ceramic && (
          <div className="flex flex-col items-center gap-1 border-t border-ink/10 bg-yellow px-5 py-4 text-center sm:flex-row sm:justify-center sm:gap-3">
            <span className="font-serif text-lg uppercase tracking-tight text-ink sm:text-xl">
              Ceramic Paint Protection
            </span>
            <span aria-hidden className="hidden text-ink/40 sm:inline">
              ·
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/70">
              from{" "}
              <span className="font-serif text-2xl normal-case tracking-normal text-destructive sm:text-3xl">
                ${ceramic.pricing.sedan}
              </span>
            </span>
          </div>
        )}
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
