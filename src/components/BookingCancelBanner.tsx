"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, X } from "lucide-react";

export default function BookingCancelBanner() {
  const params = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;
  if (params.get("canceled") !== "1") return null;

  const code = params.get("code");

  return (
    <div
      role="alert"
      className="mb-8 flex items-start gap-3 rounded-[14px] border border-yellow-ink/30 bg-yellow-soft/30 p-4 sm:p-5"
    >
      <AlertCircle className="mt-0.5 size-5 shrink-0 text-yellow-ink" />
      <div className="flex flex-col gap-1 text-[14px] text-foreground">
        <p className="font-semibold">Payment was cancelled.</p>
        <p className="text-muted-foreground">
          {code ? (
            <>
              Your booking{" "}
              <span className="font-mono text-foreground">{code}</span> is held.
              Finish payment by re-submitting below, or switch to{" "}
              <span className="font-medium text-foreground">
                pay at collection
              </span>{" "}
              and we&rsquo;ll settle when you arrive.
            </>
          ) : (
            <>
              No payment was taken. You can try again or switch to{" "}
              <span className="font-medium text-foreground">
                pay at collection
              </span>
              .
            </>
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="ml-auto rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
