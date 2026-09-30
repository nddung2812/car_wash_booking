"use client";

import { CalendarRange, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MetricCard from "./MetricCard";

export interface MonthSummary {
  /** `YYYY-MM`. */
  month: string;
  /** Axis label, e.g. "Sep 26". */
  shortLabel: string;
  /** Full label, e.g. "September 2026". */
  label: string;
  /** Set when the period isn't the plain calendar month, e.g. "24 Aug – 30 Sep". */
  period?: string;
  count: number;
  amount: number;
}

const money = (n: number) =>
  n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Whole-dollar figure for bar labels: $2,515. */
const dollars = (n: number) => `$${Math.round(n).toLocaleString("en-AU")}`;

/** Compact axis figure: $500, $1k, $2.5k. */
const compact = (n: number) =>
  n >= 1000 ? `$${Number((n / 1000).toFixed(1))}k` : `$${Math.round(n)}`;

/** Round a gridline step up to 1 / 2 / 2.5 / 5 × 10^n so the axis reads cleanly. */
function niceStep(raw: number) {
  if (raw <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const f = raw / pow;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * pow;
}

const GRID_LINES = 4;

export default function MonthlySummary({ months }: { months: MonthSummary[] }) {
  const totalCount = months.reduce((n, m) => n + m.count, 0);
  const totalAmount = months.reduce((n, m) => n + m.amount, 0);
  const avgPerBooking = totalCount > 0 ? totalAmount / totalCount : 0;

  const step = niceStep(Math.max(...months.map((m) => m.amount), 0) / GRID_LINES);
  const axisMax = step * GRID_LINES;
  const ticks = Array.from({ length: GRID_LINES + 1 }, (_, i) => step * (GRID_LINES - i));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-0.5">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Summary
        </p>
        <h2 className="font-serif text-2xl leading-none tracking-tight text-foreground">
          Bookings by month
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard title="Bookings, all time" value={totalCount} icon={CalendarRange} />
        <MetricCard
          title="Booking value, all time"
          value={`$${Math.round(totalAmount).toLocaleString("en-AU")}`}
          icon={DollarSign}
          color="bg-emerald-500/15 text-emerald-700"
        />
        <MetricCard
          title="Avg / booking"
          value={`$${money(avgPerBooking)}`}
          icon={TrendingUp}
          color="bg-yellow-soft text-yellow-ink"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly bookings</CardTitle>
          <p className="font-mono text-[11px] text-muted-foreground">
            Bar height is booking value; the count sits under each month. Grouped
            by billing period, using the date each booking was submitted;
            cancelled bookings excluded. Bookings made 24–31 Aug 2026 count
            towards September.
          </p>
        </CardHeader>
        <CardContent>
          {months.length === 0 ? (
            <p className="py-12 text-center font-mono text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
              No bookings yet.
            </p>
          ) : (
            <div className="flex gap-2">
              {/* Y axis */}
              <div className="relative mt-6 h-64 w-10 shrink-0">
                {ticks.map((t, i) => (
                  <span
                    key={t}
                    className="absolute right-0 -translate-y-1/2 font-mono text-[10px] tabular-nums text-muted-foreground"
                    style={{ top: `${(i / GRID_LINES) * 100}%` }}
                  >
                    {compact(t)}
                  </span>
                ))}
              </div>

              <div className="min-w-0 flex-1 overflow-x-auto">
                <div
                  className="relative pt-6"
                  style={{ minWidth: `${months.length * 56}px` }}
                >
                  {/* Gridlines */}
                  <div className="pointer-events-none absolute inset-x-0 top-6 h-64">
                    {ticks.map((t, i) => (
                      <div
                        key={t}
                        className={`absolute inset-x-0 border-t ${
                          i === GRID_LINES ? "border-foreground/30" : "border-line/60"
                        }`}
                        style={{ top: `${(i / GRID_LINES) * 100}%` }}
                      />
                    ))}
                  </div>

                  <div className="relative flex">
                    {months.map((m) => (
                      <div
                        key={m.month}
                        tabIndex={0}
                        aria-label={`${m.label}${m.period ? ` (${m.period})` : ""}: ${m.count} ${
                          m.count === 1 ? "booking" : "bookings"
                        }, $${money(m.amount)}`}
                        className="group flex min-w-[56px] flex-1 flex-col items-center outline-none"
                      >
                        {/* Plot column — the whole column is the hover target */}
                        <div className="relative flex h-64 w-full items-end justify-center px-1.5 sm:px-3">
                          <div
                            className="relative w-full max-w-12 rounded-t-[4px] bg-primary transition-opacity group-hover:opacity-80 group-focus-visible:opacity-80"
                            style={{ height: `${axisMax > 0 ? (m.amount / axisMax) * 100 : 0}%` }}
                          >
                            <span className="absolute inset-x-0 -top-5 text-center font-mono text-[10px] tabular-nums text-foreground">
                              {m.amount > 0 ? dollars(m.amount) : ""}
                            </span>
                          </div>

                          {/* Tooltip */}
                          <div className="pointer-events-none absolute left-1/2 top-2 z-10 hidden w-max -translate-x-1/2 rounded-lg border border-line bg-background px-3 py-2 shadow-soft group-hover:block group-focus-visible:block">
                            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                              {m.label}
                            </p>
                            {m.period && (
                              <p className="font-mono text-[10px] text-muted-foreground">
                                {m.period}
                              </p>
                            )}
                            <p className="font-mono text-[13px] tabular-nums text-foreground">
                              ${money(m.amount)}
                            </p>
                            <p className="font-mono text-[11px] text-muted-foreground">
                              {m.count} {m.count === 1 ? "booking" : "bookings"}
                            </p>
                          </div>
                        </div>

                        {/* X labels */}
                        <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                          {m.shortLabel}
                        </span>
                        <span className="whitespace-nowrap font-mono text-[11px] tabular-nums text-foreground">
                          {m.count} <span className="hidden text-muted-foreground sm:inline">{m.count === 1 ? "booking" : "bookings"}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {months.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>By month</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="py-2 pr-4 font-normal">Month</th>
                  <th className="py-2 pr-4 text-right font-normal">Bookings</th>
                  <th className="py-2 pr-4 text-right font-normal">Amount</th>
                  <th className="py-2 text-right font-normal">Avg / booking</th>
                </tr>
              </thead>
              <tbody>
                {[...months].reverse().map((m) => (
                  <tr key={m.month} className="border-b border-line/60">
                    <td className="py-2 pr-4">
                      {m.label}
                      {m.period && (
                        <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                          {m.period}
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono tabular-nums">{m.count}</td>
                    <td className="py-2 pr-4 text-right font-mono tabular-nums">
                      ${money(m.amount)}
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums text-muted-foreground">
                      {m.count > 0 ? `$${money(m.amount / m.count)}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-mono tabular-nums">
                  <td className="pt-3 pr-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Total
                  </td>
                  <td className="pt-3 pr-4 text-right">{totalCount}</td>
                  <td className="pt-3 pr-4 text-right">${money(totalAmount)}</td>
                  <td className="pt-3 text-right text-muted-foreground">
                    {totalCount > 0 ? `$${money(totalAmount / totalCount)}` : "—"}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
