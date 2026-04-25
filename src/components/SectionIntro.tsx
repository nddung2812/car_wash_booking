import * as React from "react";

import { cn } from "@/lib/utils";

interface SectionIntroProps {
  kicker?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  size?: "lg" | "md";
  level?: 2 | 3;
  className?: string;
}

const SIZE_CLAMP: Record<NonNullable<SectionIntroProps["size"]>, string> = {
  lg: "clamp(36px, 5vw, 72px)",
  md: "clamp(28px, 3.4vw, 44px)",
};

export function SectionIntro({
  kicker,
  title,
  description,
  size = "lg",
  level = 2,
  className,
}: SectionIntroProps) {
  const Heading = level === 3 ? "h3" : "h2";
  return (
    <header className={cn("flex flex-col gap-3", className)}>
      {kicker && (
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {kicker}
        </span>
      )}
      <Heading
        className="font-serif italic leading-[1] tracking-tight text-foreground"
        style={{ fontSize: SIZE_CLAMP[size] }}
      >
        {title}
      </Heading>
      {description && (
        <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </header>
  );
}

export default SectionIntro;
