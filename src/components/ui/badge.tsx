import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-pill border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-[color,box-shadow,background-color] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand-soft text-primary [a&]:hover:bg-brand-soft/80",
        secondary:
          "border-line bg-secondary text-foreground [a&]:hover:bg-cream-3",
        destructive:
          "border-transparent bg-destructive/15 text-destructive [a&]:hover:bg-destructive/20",
        outline:
          "border-line-2 bg-transparent text-foreground [a&]:hover:bg-secondary",
        yellow:
          "border-transparent bg-yellow-soft text-yellow-ink [a&]:hover:bg-yellow-soft/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
