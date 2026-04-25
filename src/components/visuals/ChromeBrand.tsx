import * as React from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"

type ChromeBrandProps = {
  size?: number
  className?: string
  /** Override mark contents — default is the Hyperdome sparkles logo */
  children?: React.ReactNode
}

const LOGO_ASPECT_RATIO = 213 / 260

export function ChromeBrand({ size = 36, className, children }: ChromeBrandProps) {
  const inner = Math.round(size * 0.62)
  return (
    <span
      className={cn(
        "relative inline-grid place-items-center rounded-full chrome-brand-bg overflow-hidden",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.18),inset_0_1px_0_rgba(255,255,255,0.45),0_6px_14px_-6px_rgba(30,94,255,0.45)]",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {children ?? (
        <Image
          src="/sparklesLogo.png"
          alt=""
          width={inner}
          height={Math.round(inner * LOGO_ASPECT_RATIO)}
          className="object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
          priority
        />
      )}
    </span>
  )
}

export default ChromeBrand
