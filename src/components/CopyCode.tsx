"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  value: string;
  /** Visual style — inline for table rows, prominent for confirmation hero. */
  variant?: "inline" | "prominent";
  label?: string;
};

export default function CopyCode({ value, variant = "inline", label }: Props) {
  const [copied, setCopied] = useState(false);

  const onCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — silently no-op */
    }
  };

  if (variant === "prominent") {
    return (
      <button
        type="button"
        onClick={onCopy}
        aria-label={`Copy confirmation code ${value}`}
        className="group inline-flex items-center gap-2 rounded-pill border border-line bg-card/60 px-3 py-1.5 font-mono text-[12px] tabular-nums text-foreground transition-colors hover:border-primary hover:bg-secondary"
      >
        <span>{value}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em]",
            copied ? "text-primary" : "text-muted-foreground",
          )}
        >
          {copied ? (
            <>
              <Check className="size-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-3" /> Copy
            </>
          )}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={label ?? `Copy ${value}`}
      title={copied ? "Copied" : "Copy"}
      className="inline-flex items-center gap-1.5 font-mono text-[11px] tabular-nums text-muted-foreground transition-colors hover:text-foreground sm:text-[12px]"
    >
      <span>{value}</span>
      {copied ? (
        <Check className="size-3 text-primary" />
      ) : (
        <Copy className="size-3 opacity-60" />
      )}
    </button>
  );
}
