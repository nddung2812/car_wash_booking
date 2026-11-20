"use client";

import { useSyncExternalStore, type ReactNode } from "react";

import { isNovemberPromoBookable } from "@/lib/booking-discount";

const subscribe = () => () => {};

/**
 * Shows `children` while the November special can still be booked, and
 * `fallback` once it can't.
 *
 * The marketing pages are cached, so HTML rendered during the promotion can
 * still be served after it ends. The server decides `initialLive` at render
 * time; this re-checks against the visitor's own clock on load, so stale
 * HTML never keeps advertising a discount the booking form no longer gives.
 */
export default function PromoGate({
  initialLive,
  children,
  fallback = null,
}: {
  initialLive: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const live = useSyncExternalStore(
    subscribe,
    () => isNovemberPromoBookable(),
    () => initialLive,
  );
  return <>{live ? children : fallback}</>;
}
