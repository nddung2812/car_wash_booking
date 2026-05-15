"use client";

import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";

import { AUD } from "@/lib/products";
import { useCart } from "@/components/cart/CartProvider";

export function FloatingCart() {
  const { totals, hydrated, isOpen, openCart } = useCart();
  const pathname = usePathname();
  const count = totals.count;

  // Already inside the cart funnel — the page itself is the cart here.
  const onCheckoutFlow =
    pathname === "/products/checkout" ||
    pathname === "/products/order-success";

  // Only surfaces once there's something in the cart, and never on top of
  // the open drawer or the checkout pages.
  if (!hydrated || count === 0 || isOpen || onCheckoutFlow) return null;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open cart — ${count} item${count === 1 ? "" : "s"}, ${AUD.format(
        totals.total
      )}`}
      className="group fixed bottom-5 right-5 z-40 inline-flex h-12 items-center gap-3 rounded-pill bg-primary pl-4 pr-5 text-primary-foreground shadow-cta transition-[transform,filter] duration-200 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40 sm:bottom-7 sm:right-7"
      style={{
        marginBottom: "env(safe-area-inset-bottom)",
        marginRight: "env(safe-area-inset-right)",
      }}
    >
      <ShoppingBag className="size-[18px]" />
      <span className="inline-flex min-w-[20px] items-center justify-center rounded-pill bg-primary-foreground/20 px-1.5 py-0.5 font-mono text-[11px] font-semibold leading-none tabular-nums">
        {count > 99 ? "99+" : count}
      </span>
      <span
        aria-hidden="true"
        className="h-5 w-px bg-primary-foreground/25"
      />
      <span className="text-[15px] font-semibold tabular-nums">
        {AUD.format(totals.total)}
      </span>
    </button>
  );
}
