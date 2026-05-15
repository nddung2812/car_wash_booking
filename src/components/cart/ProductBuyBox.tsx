"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import { QuantityStepper } from "@/components/cart/QuantityStepper";

type ProductBuyBoxProps = {
  productId: string;
  inStock: boolean;
};

export function ProductBuyBox({ productId, inStock }: ProductBuyBoxProps) {
  const { addItem, closeCart } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);

  if (!inStock) {
    return (
      <Button
        size="lg"
        variant="outline"
        disabled
        aria-disabled="true"
        className="w-full cursor-not-allowed justify-center opacity-70 sm:w-auto"
      >
        Sold out — ask in-store
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Quantity
        </span>
        <QuantityStepper value={qty} onChange={setQty} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="justify-center sm:flex-1"
          onClick={() => {
            addItem(productId, qty);
          }}
        >
          <ShoppingBag className="size-4" />
          Add {qty > 1 ? `${qty} ` : ""}to cart
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="justify-center sm:flex-1"
          onClick={() => {
            addItem(productId, qty);
            // addItem auto-opens the drawer; close it as we leave for checkout.
            closeCart();
            router.push("/products/checkout");
          }}
        >
          <Zap className="size-4" />
          Buy it now
        </Button>
      </div>
    </div>
  );
}
