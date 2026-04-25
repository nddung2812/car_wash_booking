"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type SparklesProps = {
  count?: number
  className?: string
  /** Color of the sparkle dot. Defaults to brand. */
  color?: string
  /** Size range in px [min, max]. */
  size?: [number, number]
}

type Particle = {
  id: number
  top: string
  left: string
  delay: string
  duration: string
  size: number
}

function makeParticles(count: number, [minSize, maxSize]: [number, number]): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: `${Math.random() * 90 + 5}%`,
    left: `${Math.random() * 90 + 5}%`,
    delay: `${(Math.random() * 8).toFixed(2)}s`,
    duration: `${(6 + Math.random() * 6).toFixed(2)}s`,
    size: minSize + Math.round(Math.random() * (maxSize - minSize)),
  }))
}

export function Sparkles({
  count = 14,
  className,
  color = "var(--brand)",
  size = [3, 7],
}: SparklesProps) {
  const [minSize, maxSize] = size
  // Generate once on the client to avoid hydration mismatch from Math.random.
  const [particles, setParticles] = React.useState<Particle[]>([])
  React.useEffect(() => {
    setParticles(makeParticles(count, [minSize, maxSize]))
  }, [count, minSize, maxSize])

  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            background: color,
            boxShadow: `0 0 ${p.size * 2}px ${color}`,
            animation: `sparkle ${p.duration} ease-in-out ${p.delay} infinite`,
          }}
        />
      ))}
    </span>
  )
}

export default Sparkles
