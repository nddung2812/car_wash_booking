"use client";

import { useEffect } from "react";

import { useCart } from "@/components/cart/CartProvider";

/**
 * Empties the cart once a Stripe order completes. Waits for hydration so it
 * doesn't race the localStorage read; `clear()` is idempotent.
 */
export function ClearCartOnMount() {
  const { clear, hydrated } = useCart();

  useEffect(() => {
    if (hydrated) clear();
  }, [hydrated, clear]);

  return null;
}
