"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";

type AddToCartButtonProps = {
  productId: string;
  qty?: number;
  inStock?: boolean;
  label?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
  /** Stop the click bubbling to a parent link (used on listing cards). */
  stopPropagation?: boolean;
};

export function AddToCartButton({
  productId,
  qty = 1,
  inStock = true,
  label = "Add to cart",
  variant = "default",
  size = "default",
  className,
  stopPropagation = false,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!inStock) {
    return (
      <Button
        type="button"
        variant="outline"
        size={size}
        disabled
        aria-disabled="true"
        className={cn("cursor-not-allowed opacity-70", className)}
      >
        Sold out
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={(e) => {
        if (stopPropagation) {
          e.preventDefault();
          e.stopPropagation();
        }
        addItem(productId, qty);
        setAdded(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setAdded(false), 1600);
      }}
    >
      {added ? (
        <>
          <Check className="size-4" />
          Added
        </>
      ) : (
        <>
          <ShoppingBag className="size-4" />
          {label}
        </>
      )}
    </Button>
  );
}
