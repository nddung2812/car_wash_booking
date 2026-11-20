import Link from "next/link";
import { ArrowUpRight, Tag } from "lucide-react";

import PromoGate from "@/components/PromoGate";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMergedServices } from "@/lib/pricing";
import { NOVEMBER_PROMO, isNovemberPromoBookable } from "@/lib/booking-discount";

/**
 * November special, shown under the price cards. Takes itself down: it
 * renders nothing once the last eligible wash date can no longer be booked
 * (see PromoGate for how that holds on cached pages too).
 */
export default async function NovemberPromoStrip({ className }: { className?: string }) {
  const initialLive = isNovemberPromoBookable();
  if (!initialLive) return null;

  const services = await getMergedServices();
  const service = services.find((s) => NOVEMBER_PROMO.serviceIds.includes(s.id));
  if (!service) return null;

  const off = (price: number) => Math.max(price - NOVEMBER_PROMO.amount, 0);
  const prices = [
    ["Sedan", service.pricing.sedan],
    ["Wagon", service.pricing.wagon],
    ["SUV / 4×4", service.pricing.suv],
  ] as const;

  return (
    <PromoGate initialLive={initialLive}>
      <aside
        aria-label={NOVEMBER_PROMO.name}
        className={cn(
          "flex flex-col gap-5 rounded-[20px] border border-destructive/40 bg-destructive/5 p-5 shadow-soft sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8",
          className,
        )}
      >
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-destructive text-white">
            <Tag className="size-5" />
          </span>
          <div className="flex flex-col gap-1.5">
            {/* The end date is the condition of the offer, so it leads. */}
            <span className="w-fit rounded-md bg-destructive px-2.5 py-1 font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-white">
              {NOVEMBER_PROMO.name} · Washes up to {NOVEMBER_PROMO.lastDateLabel}
            </span>
            <p className="font-serif text-2xl leading-tight tracking-tight text-foreground sm:text-3xl">
              ${NOVEMBER_PROMO.amount} off {service.name}.
            </p>
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-[14px] leading-relaxed text-foreground">
              {prices.map(([label, price]) => (
                <span key={label} className="whitespace-nowrap tabular-nums">
                  {label}{" "}
                  <span className="text-muted-foreground line-through">
                    <span className="sr-only">was </span>${price}
                  </span>{" "}
                  <span className="font-semibold">
                    <span className="sr-only">now </span>${off(price)}
                  </span>
                </span>
              ))}
            </p>
            <p className="max-w-xl text-[14px] leading-relaxed text-muted-foreground">
              Book online for any day up to {NOVEMBER_PROMO.lastDateLabel} and
              the discount comes off automatically. Seniors &amp; pensioners
              can add their Wednesday &amp; Thursday discount on top.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
          <Button asChild className="bg-destructive text-white hover:bg-destructive/90">
            <Link href={`/book-car-wash-online?service=${service.id}`}>
              Book with ${NOVEMBER_PROMO.amount} off
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      </aside>
    </PromoGate>
  );
}
