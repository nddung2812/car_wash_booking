"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarRange, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MonthOption {
  /** `YYYY-MM` — what goes in the `?month=` param. */
  value: string;
  /** Human label, e.g. "September 2026". Formatted server-side. */
  label: string;
  count: number;
}

/**
 * Explicit opt-out value for `?month=`. The default view is the current month,
 * so an *absent* param can't mean "all time" — it has to be spelled out.
 */
export const ALL_TIME = "all";

export default function MonthFilter({
  months,
  active,
}: {
  months: MonthOption[];
  active: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", value);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  const total = months.reduce((sum, m) => sum + m.count, 0);

  return (
    <div className="flex items-center gap-2">
      <CalendarRange className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="relative inline-flex">
        <select
          aria-label="Filter bookings by month"
          value={active ?? ALL_TIME}
          disabled={pending}
          onChange={(e) => select(e.target.value)}
          className={cn(
            "appearance-none rounded-pill border border-line bg-background py-1.5 pl-3 pr-8",
            "font-mono text-[11px] uppercase tracking-[0.12em] text-foreground",
            "cursor-pointer transition-[background-color,box-shadow] focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "disabled:cursor-wait disabled:opacity-70",
          )}
        >
          <option value={ALL_TIME} className="font-sans normal-case">
            All time ({total})
          </option>
          {months.map((m) => (
            <option key={m.value} value={m.value} className="font-sans normal-case">
              {m.label} ({m.count})
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <ChevronDown className="size-3.5 opacity-60" aria-hidden />
          )}
        </span>
      </div>
    </div>
  );
}
