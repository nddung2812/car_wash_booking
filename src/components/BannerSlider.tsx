"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles as SparkleIcon, Star, Clock, Droplet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChromeBrand } from "@/components/visuals/ChromeBrand";

const banners = [
  {
    id: 1,
    image: "/banner1.webp",
    alt: "Hyperdome Car Wash detailer hand-finishing a sedan in the Logan QLD bay",
  },
  {
    id: 2,
    image: "/banner2.jpg",
    alt: "Interior detail in progress at Hyperdome Car Wash, Logan QLD",
  },
  {
    id: 3,
    image: "/banner3.jpeg",
    alt: "Showroom-fresh finish on a 4×4 after a Full Detail at Hyperdome Car Wash, Loganholme",
  },
];

const AUTOPLAY_INTERVAL = 5500;
const RESUME_DELAY = 10000;

const droplets = [
  { left: "12%", delay: "0s",   duration: "3.6s" },
  { left: "34%", delay: "0.8s", duration: "4.2s" },
  { left: "58%", delay: "1.6s", duration: "3.8s" },
  { left: "82%", delay: "2.4s", duration: "4.6s" },
];

const stats = [
  { icon: Droplet, label: "Water reclaimed", value: "92%" },
  { icon: Clock,   label: "Avg wash",        value: "38 min" },
  { icon: Star,    label: "Rating",          value: "4.9 · 2.4k" },
];

export default function BannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

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

  const goToPrevious = () => navigate(currentSlide - 1);
  const goToNext = () => navigate(currentSlide + 1);

  return (
    <section className="relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 py-12 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:py-20">
          {/* Left — copy */}
          <div className="relative">
            <span className="relative z-10 inline-flex items-center gap-2 rounded-pill border border-line bg-card/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/70 backdrop-blur">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/70 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              Now booking today
            </span>

            <h1
              className="relative z-10 mt-6 font-serif italic leading-[0.95] tracking-[-0.02em] text-foreground"
              style={{ fontSize: "clamp(48px, 7.2vw, 96px)" }}
            >
              A carwash that{" "}
              <span className="not-italic">
                <span className="yellow-highlight">shines</span>
              </span>{" "}
              on every detail.
            </h1>

            <p className="relative z-10 mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Precision hand-finishing. Ceramic-grade chemistry. Book a wash in under a minute and drive
              out with a car that looks faster than it is.
            </p>

            <div className="relative z-10 mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <a href="#booking">
                  Book a wash
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#services">See packages</a>
              </Button>
            </div>

            <div className="relative z-10 mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <SparkleIcon className="size-3.5 text-primary" />
                Hand-finished, every time
              </span>
              <span className="inline-flex items-center gap-2">
                <Star className="size-3.5 fill-yellow text-yellow" />
                4.9 · 2.4k Google reviews
              </span>
            </div>
          </div>

          {/* Right — visual panel */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] border border-line shadow-soft-lg lg:aspect-[5/6]">
            {/* Rotating background images */}
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  fill
                  className="object-cover brightness-110 contrast-105 saturate-125"
                  priority={index === 0}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ))}

            {/* Bright wash overlay (radial bokeh + grid + droplets) */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(80% 55% at 78% 16%, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.18) 34%, transparent 66%), radial-gradient(120% 80% at 30% 20%, rgba(30,94,255,0.28) 0%, transparent 60%), radial-gradient(80% 60% at 80% 80%, rgba(255,214,52,0.30) 0%, transparent 65%), linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(14,14,12,0.36) 100%)",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute -right-20 top-8 h-44 w-80 rotate-[-18deg] rounded-full bg-white/35 blur-3xl"
            />
            <div aria-hidden="true" className="grid-scan absolute inset-0 opacity-35" />

            {/* Falling droplets */}
            <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
              {droplets.map((d, i) => (
                <span
                  key={i}
                  className="absolute top-0 size-2 rounded-full bg-white/70"
                  style={{
                    left: d.left,
                    boxShadow: "0 0 12px rgba(255,255,255,0.55)",
                    animation: `drop ${d.duration} ease-in ${d.delay} infinite`,
                  }}
                />
              ))}
            </div>

            {/* Chrome label top-left */}
            <div className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-pill border border-white/20 bg-black/40 px-3 py-1.5 backdrop-blur-md">
              <ChromeBrand size={20} />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/85">
                Hyperdome · Est. 2024
              </span>
            </div>

            {/* Slide counter top-right */}
            <div className="absolute right-5 top-5 z-10 rounded-pill border border-white/15 bg-black/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/75 backdrop-blur-md">
              {String(currentSlide + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}
            </div>

            {/* Caption + stat chips */}
            <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-4 p-6">
              <p className="font-serif italic text-white/90" style={{ fontSize: "clamp(20px, 2.4vw, 28px)" }}>
                Hand-finished. Showroom-fresh. Every drive.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {stats.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.label}
                      className="rounded-2xl border border-white/15 bg-white/8 p-3 backdrop-blur-md"
                    >
                      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">
                        <Icon className="size-3" />
                        {s.label}
                      </span>
                      <span className="mt-1.5 block font-serif text-lg leading-none text-white">
                        {s.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Arrows */}
            <button
              onClick={goToPrevious}
              aria-label="Previous"
              className="absolute left-4 top-1/2 z-20 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white/85 backdrop-blur-md transition-colors hover:bg-black/60"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={goToNext}
              aria-label="Next"
              className="absolute right-4 top-1/2 z-20 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white/85 backdrop-blur-md transition-colors hover:bg-black/60"
            >
              <ChevronRight className="size-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => navigate(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentSlide ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
