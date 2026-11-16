import Link from "next/link";
import { ArrowUpRight, BadgePercent } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SENIOR_DISCOUNT_AMOUNT,
  SENIOR_DISCOUNT_DAYS_LABEL,
  SENIOR_DISCOUNT_ENABLED,
  SENIOR_DISCOUNT_QUERY,
  SENIOR_DISCOUNT_SURCHARGE_NOTICE,
} from "@/lib/booking-discount";

/**
 * Seniors & pensioner offer, shown under the price cards. Renders nothing when
 * the offer is switched off in booking-discount.ts, so the promo can never
 * advertise a discount the booking form no longer gives.
 */
export default function SeniorsOfferStrip({
  className,
  showDetailsLink = true,
}: {
  className?: string;
  /** Hide the "How it works" link on the offer's own page. */
  showDetailsLink?: boolean;
}) {
  if (!SENIOR_DISCOUNT_ENABLED) return null;

  return (
    <aside
      aria-label="Seniors and pensioner discount"
      className={cn(
        "flex flex-col gap-5 rounded-[20px] border border-yellow bg-yellow-soft p-5 shadow-soft sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-yellow text-yellow-ink">
          <BadgePercent className="size-5" />
        </span>
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            All year · Every {SENIOR_DISCOUNT_DAYS_LABEL}
          </span>
          <p className="font-serif text-2xl leading-tight tracking-tight text-foreground sm:text-3xl">
            Seniors &amp; pensioners save ${SENIOR_DISCOUNT_AMOUNT} on any wash.
          </p>
          <p className="max-w-xl text-[14px] leading-relaxed text-muted-foreground">
            Tick the seniors box when you book online and show your card at
            collection. {SENIOR_DISCOUNT_SURCHARGE_NOTICE}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
        <Button asChild className="bg-yellow text-yellow-ink hover:bg-yellow-2">
          <Link href={`/book-car-wash-online?${SENIOR_DISCOUNT_QUERY}=1`}>
            Book with the discount
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
        {showDetailsLink && (
          <Button asChild variant="outline">
            <Link href="/seniors-discount">How it works</Link>
          </Button>
        )}
      </div>
    </aside>
  );
}
