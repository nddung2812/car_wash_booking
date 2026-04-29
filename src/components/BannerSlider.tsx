import { ArrowRight, Sparkles as SparkleIcon, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import BannerCarousel from "@/components/BannerCarousel";

export default function BannerSlider() {
  return (
    <section className="relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 py-12 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:py-20">
          {/* Left — copy (server-rendered for SEO) */}
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
              A Logan car wash that{" "}
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

          {/* Right — visual carousel (client) */}
          <BannerCarousel />
        </div>
      </div>
    </section>
  );
}
