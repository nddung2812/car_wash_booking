"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Banner } from "@/data/banners";

const AUTOPLAY_INTERVAL = 5500;
const RESUME_DELAY = 10000;

type Props = {
  banners: Banner[];
};

export default function BannerCarousel({ banners }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isAutoPlaying, banners.length]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const navigate = (index: number) => {
    const next = ((index % banners.length) + banners.length) % banners.length;
    if (next === currentSlide) return;
    setCurrentSlide(next);
    setIsAutoPlaying(false);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setIsAutoPlaying(true), RESUME_DELAY);
  };

  const stopAndPrevent = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const goToPrevious = (e: React.MouseEvent) => {
    stopAndPrevent(e);
    navigate(currentSlide - 1);
  };
  const goToNext = (e: React.MouseEvent) => {
    stopAndPrevent(e);
    navigate(currentSlide + 1);
  };

  return (
    <div className="relative h-[420px] w-full overflow-hidden sm:h-[460px] lg:h-[620px]">
      {banners.map((banner, index) => (
        <Link
          key={banner.id}
          href={banner.href}
          aria-label={banner.alt}
          aria-hidden={index !== currentSlide}
          tabIndex={index === currentSlide ? 0 : -1}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentSlide ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <Image
            src={banner.image}
            alt={banner.alt}
            fill
            className="object-cover"
            priority={banner.priority ?? index === 0}
            fetchPriority={index === 0 ? "high" : "low"}
            loading={index === 0 ? "eager" : "lazy"}
            sizes="100vw"
          />

          {banner.caption && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/50 px-6 text-center sm:px-10">
              <div className="max-w-lg sm:max-w-2xl lg:max-w-3xl">
                {banner.eyebrow && (
                  <span className="inline-flex items-center rounded-pill border border-white/25 bg-white/10 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/90 backdrop-blur-md sm:text-xs">
                    {banner.eyebrow}
                  </span>
                )}
                <p className="mt-4 font-serif text-3xl leading-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)] sm:mt-5 sm:text-5xl lg:text-6xl">
                  {banner.caption}
                </p>
              </div>
            </div>
          )}
        </Link>
      ))}

      <div className="pointer-events-none absolute right-5 top-5 z-10 rounded-pill border border-white/15 bg-black/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/75 backdrop-blur-md">
        {String(currentSlide + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}
      </div>

      <button
        type="button"
        onClick={goToPrevious}
        aria-label="Previous banner"
        className="absolute left-4 top-1/2 z-20 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white/85 backdrop-blur-md transition-colors hover:bg-black/60"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={goToNext}
        aria-label="Next banner"
        className="absolute right-4 top-1/2 z-20 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white/85 backdrop-blur-md transition-colors hover:bg-black/60"
      >
        <ChevronRight className="size-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
        {banners.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={(e) => {
              stopAndPrevent(e);
              navigate(index);
            }}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              index === currentSlide ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
