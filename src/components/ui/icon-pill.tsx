import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const iconPillVariants = cva("grid place-items-center rounded-pill", {
  variants: {
    variant: {
      brand: "bg-brand-soft text-primary",
      secondary: "bg-secondary text-foreground/70",
      primary: "bg-primary text-primary-foreground",
      outline: "border border-line bg-card text-primary",
      glass: "border border-white/20 bg-black/40 text-white/85 backdrop-blur-md",
    },
    size: {
      sm: "size-6",
      md: "size-9",
      lg: "size-11",
    },
  },
  defaultVariants: { variant: "brand", size: "md" },
});

export interface IconPillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof iconPillVariants> {
  asChild?: boolean;
}

export function IconPill({
  className,
  variant,
  size,
  asChild,
  ...props
}: IconPillProps) {
  const Comp = asChild ? Slot : "span";
  return <Comp className={cn(iconPillVariants({ variant, size }), className)} {...props} />;
}

export { iconPillVariants };
