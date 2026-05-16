"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { BeforeAfterPair } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

const AUTOPLAY_INTERVAL = 7000;
const RESUME_DELAY = 12000;
const SWIPE_THRESHOLD = 48;

type Props = {
  pairs: BeforeAfterPair[];
};

export default function BeforeAfterCarousel({ pairs }: Props) {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);

  const count = pairs.length;
  const hasMultiple = count > 1;

  useEffect(() => {
    if (!isAutoPlaying || !hasMultiple) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % count);
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isAutoPlaying, hasMultiple, count]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const navigate = (index: number) => {
    if (!hasMultiple) return;
    const next = ((index % count) + count) % count;
    setCurrent(next);
    setIsAutoPlaying(false);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(
      () => setIsAutoPlaying(true),
      RESUME_DELAY,
    );
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      navigate(current + (delta < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative"
      role="group"
      aria-roledescription="carousel"
      aria-label="Full detail before and after gallery"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") navigate(current - 1);
        if (e.key === "ArrowRight") navigate(current + 1);
      }}
      tabIndex={0}
    >
      <div
        className="overflow-hidden rounded-[20px] border border-line bg-card-gradient shadow-soft"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {pairs.map((pair, index) => (
            <div
              key={pair.id}
              className="w-full shrink-0"
              aria-hidden={index !== current}
            >
              <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2">
                <Frame
                  src={pair.beforeUrl}
                  alt={`${pair.label} — before the full detail`}
                  badge="Before"
                  tone="muted"
                  ratio={pair.beforeRatio}
                  eager={index === 0}
                />
                <Frame
                  src={pair.afterUrl}
                  alt={`${pair.label} — after the full detail`}
                  badge="After"
                  tone="brand"
                  ratio={pair.afterRatio}
                  eager={index === 0}
                />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Full Detail
                </span>
                <span className="truncate font-serif text-base italic text-foreground">
                  {pair.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={() => navigate(current - 1)}
            aria-label="Previous before and after"
            className="absolute left-3 top-[calc(50%-28px)] z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/45 text-white/90 backdrop-blur-md transition-colors hover:bg-black/65"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => navigate(current + 1)}
            aria-label="Next before and after"
            className="absolute right-3 top-[calc(50%-28px)] z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/45 text-white/90 backdrop-blur-md transition-colors hover:bg-black/65"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="mt-5 flex items-center justify-center gap-1.5">
            {pairs.map((pair, index) => (
              <button
                key={pair.id}
                type="button"
                onClick={() => navigate(index)}
                aria-label={`Go to ${pair.label}`}
                aria-current={index === current}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === current
                    ? "w-6 bg-foreground"
                    : "w-1.5 bg-foreground/25 hover:bg-foreground/50",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Frame({
  src,
  alt,
  badge,
  tone,
  ratio,
  eager,
}: {
  src: string;
  alt: string;
  badge: string;
  tone: "muted" | "brand";
  ratio: number;
  eager: boolean;
}) {
  return (
    // Mobile: the box matches the image's real proportions, so the whole
    // (uncropped) photo shows at full height. Desktop (sm+): a tidy 4:3 so
    // before/after sit level side-by-side.
    <figure
      className="relative aspect-[var(--ar)] overflow-hidden bg-muted sm:aspect-[4/3]"
      style={{ "--ar": String(ratio) } as React.CSSProperties}
    >
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        sizes="(min-width: 640px) 50vw, 100vw"
        className="object-cover"
        loading={eager ? "eager" : "lazy"}
      />
      <figcaption
        className={cn(
          "absolute left-3 top-3 rounded-pill px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white backdrop-blur-md",
          tone === "brand" ? "bg-primary/80" : "bg-black/55",
        )}
      >
        {badge}
      </figcaption>
    </figure>
  );
}
