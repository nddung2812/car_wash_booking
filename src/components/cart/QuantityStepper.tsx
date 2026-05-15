"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

type QuantityStepperProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  size = "md",
  label = "Quantity",
}: QuantityStepperProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  const btn =
    "inline-flex items-center justify-center text-foreground/70 transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40";
  const dims = size === "sm" ? "size-7" : "size-9";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-pill border border-line bg-card/60",
        size === "sm" ? "gap-0.5 px-1" : "gap-1 px-1.5"
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={cn(btn, dims)}
      >
        <Minus className={size === "sm" ? "size-3.5" : "size-4"} />
      </button>
      <span
        aria-live="polite"
        className={cn(
          "min-w-6 text-center font-mono tabular-nums text-foreground",
          size === "sm" ? "text-[13px]" : "text-[15px]"
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={cn(btn, dims)}
      >
        <Plus className={size === "sm" ? "size-3.5" : "size-4"} />
      </button>
    </div>
  );
}
