"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Loader2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/** Must stay in sync with the `booking_status` pgEnum and the PATCH route's Zod schema. */
export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "border-line bg-secondary text-foreground",
  confirmed: "border-transparent bg-brand-soft text-primary",
  completed: "border-transparent bg-emerald-500/15 text-emerald-700",
  cancelled: "border-transparent bg-destructive/15 text-destructive",
};

function label(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function BookingStatusSelect({
  bookingId,
  status,
  confirmationCode,
}: {
  bookingId: string;
  status: BookingStatus;
  confirmationCode?: string;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<BookingStatus>(status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [, startTransition] = useTransition();

  async function update(next: BookingStatus) {
    if (next === current || saving) return;

    const previous = current;
    setCurrent(next); // optimistic
    setSaving(true);
    setError(null);
    setJustSaved(false);

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.error ??
            (res.status === 403
              ? "Not authorised"
              : `Update failed (${res.status})`),
        );
      }

      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      // Re-fetch the server component so the metric cards and charts above
      // reflect the new status too, not just this row.
      startTransition(() => router.refresh());
    } catch (err) {
      setCurrent(previous); // revert — the DB never changed
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-flex">
        <select
          aria-label={
            confirmationCode
              ? `Status for booking ${confirmationCode}`
              : "Booking status"
          }
          value={current}
          disabled={saving}
          onChange={(e) => update(e.target.value as BookingStatus)}
          className={cn(
            "appearance-none rounded-pill border py-1 pl-2.5 pr-7 font-mono text-[11px] uppercase tracking-[0.1em]",
            "cursor-pointer transition-[background-color,box-shadow] focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "disabled:cursor-wait disabled:opacity-70",
            STATUS_STYLES[current],
          )}
        >
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s} className="font-sans normal-case">
              {label(s)}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          {saving ? (
            <Loader2 className="size-3 animate-spin" aria-hidden />
          ) : (
            <ChevronDown className="size-3 opacity-60" aria-hidden />
          )}
        </span>
      </div>

      {justSaved && (
        <Check
          className="size-3.5 text-emerald-600"
          role="status"
          aria-label="Saved"
        />
      )}

      {error && (
        <span
          role="alert"
          title={error}
          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-destructive"
        >
          <TriangleAlert className="size-3 shrink-0" aria-hidden />
          {error}
        </span>
      )}
    </div>
  );
}
