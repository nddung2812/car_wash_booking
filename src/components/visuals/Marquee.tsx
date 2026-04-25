import * as React from "react"

import { cn } from "@/lib/utils"

type MarqueeProps = {
  items: React.ReactNode[]
  /** Animation duration in seconds. Lower = faster. */
  duration?: number
  className?: string
  /** Separator rendered between items. Defaults to a small filled dot. */
  separator?: React.ReactNode
}

const DefaultSeparator = (
  <span
    aria-hidden="true"
    className="mx-6 inline-block size-2 rounded-full bg-primary"
    style={{ boxShadow: "0 0 8px rgba(30,94,255,0.45)" }}
  />
)

export function Marquee({
  items,
  duration = 40,
  className,
  separator = DefaultSeparator,
}: MarqueeProps) {
  // Render the items twice so the translateX(-50%) loop is seamless.
  const sequence = (
    <span className="flex shrink-0 items-center whitespace-nowrap">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-foreground/70">
            {item}
          </span>
          {separator}
        </React.Fragment>
      ))}
    </span>
  )

  return (
    <div
      className={cn(
        "group relative w-full overflow-hidden border-y border-line bg-secondary/60 py-4",
        className
      )}
      aria-hidden="true"
    >
      <div
        className="flex w-max items-center"
        style={{ animation: `ticker ${duration}s linear infinite` }}
      >
        {sequence}
        {sequence}
      </div>
    </div>
  )
}

export default Marquee
