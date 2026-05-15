"use client";

import { useEffect, useRef } from "react";

import { useCart } from "@/components/cart/CartProvider";

/**
 * Empties the cart once a Stripe order completes. Runs only after the
 * provider has hydrated so it doesn't race the localStorage read.
 */
export function ClearCartOnMount() {
  const { clear, hydrated } = useCart();
  const done = useRef(false);

  useEffect(() => {
    if (hydrated && !done.current) {
      done.current = true;
      clear();
    }
  }, [hydrated, clear]);

  return null;
}
