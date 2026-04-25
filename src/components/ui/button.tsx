import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40 aria-invalid:ring-destructive/30 aria-invalid:border-destructive overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-cta hover:brightness-110 active:translate-y-px",
        destructive:
          "bg-destructive text-white shadow-cta hover:brightness-110 focus-visible:ring-destructive/30",
        outline:
          "border border-line-2 bg-transparent text-ink hover:bg-secondary hover:border-ink/40",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-cream-3",
        ghost:
          "text-ink hover:bg-secondary",
        link:
          "text-primary underline-offset-4 hover:underline rounded-none px-0",
      },
      size: {
        default: "h-11 px-5 has-[>svg]:px-4",
        sm: "h-9 px-4 has-[>svg]:px-3 text-[13px]",
        lg: "h-12 px-7 has-[>svg]:px-5 text-[15px]",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
