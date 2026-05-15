"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AUD } from "@/lib/products";
import { SHIPPING_FEE } from "@/lib/shipping";
import { useCart } from "@/components/cart/CartProvider";
import { QuantityStepper } from "@/components/cart/QuantityStepper";

export function CartDrawer() {
  const {
    lines,
    totals,
    isOpen,
    openCart,
    closeCart,
    setQty,
    removeItem,
  } = useCart();

  const isEmpty = lines.length === 0;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? openCart() : closeCart())}>
      <SheetContent
        side="right"
        aria-describedby={undefined}
        className="w-full gap-0 p-0 sm:max-w-md"
      >
        <div className="flex items-center gap-2.5 border-b border-line px-6 py-5">
          <ShoppingBag className="size-5 text-primary" />
          <SheetTitle className="text-xl">Your cart</SheetTitle>
          {!isEmpty && (
            <span className="ml-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {totals.count} {totals.count === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-pill border border-dashed border-line text-muted-foreground">
              <ShoppingBag className="size-6" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-serif text-2xl leading-tight tracking-tight text-foreground">
                Your cart is empty
              </h3>
              <p className="text-[14px] leading-relaxed text-muted-foreground">
                Browse the range we use in the bay every day.
              </p>
            </div>
            <Button asChild variant="outline" onClick={closeCart}>
              <Link href="/products">Shop products</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {lines.map(({ product, qty, lineTotal }) => (
                <li key={product.id} className="flex gap-4 py-5">
                  <Link
                    href={`/products/${product.id}`}
                    onClick={closeCart}
                    className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-[14px] border border-line bg-secondary"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/products/${product.id}`}
                        onClick={closeCart}
                        className="text-[15px] font-semibold leading-snug text-foreground transition-colors hover:text-primary"
                      >
                        {product.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        aria-label={`Remove ${product.name}`}
                        className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    {product.brand && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {product.brand}
                      </span>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                      <QuantityStepper
                        size="sm"
                        value={qty}
                        onChange={(next) => setQty(product.id, next)}
                      />
                      <span className="font-serif text-[20px] leading-none text-foreground tabular-nums">
                        {AUD.format(lineTotal)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-line bg-card/40 px-6 py-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[14px] text-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium tabular-nums">
                    {AUD.format(totals.subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[14px] text-foreground">
                  <span>Shipping</span>
                  <span className="font-medium tabular-nums">
                    {AUD.format(SHIPPING_FEE)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px] text-muted-foreground">
                  <span>Includes GST</span>
                  <span className="tabular-nums">
                    {AUD.format(totals.gstIncluded)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between border-t border-dashed border-line pt-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Total
                </span>
                <span className="font-serif text-[34px] leading-none text-primary tabular-nums">
                  {AUD.format(totals.total + SHIPPING_FEE)}
                </span>
              </div>

              <Button asChild size="lg" className="mt-5 w-full justify-center">
                <Link href="/products/checkout" onClick={closeCart}>
                  Checkout
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <button
                type="button"
                onClick={closeCart}
                className="mt-3 w-full text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
