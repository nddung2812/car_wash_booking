import Link from "next/link";
import { ArrowRight, Droplet, Shield, Sparkles, Sprout } from "lucide-react";

import { Button } from "@/components/ui/button";

const cards = [
  { icon: Shield, label: "No-lock-in", body: "Cancel from your phone, anytime." },
  { icon: Sprout, label: "Eco-grade", body: "92% water reclaimed on every wash." },
  { icon: Sparkles, label: "Hand-finished", body: "Detail-first, machine-second." },
  { icon: Droplet, label: "Showroom-fresh", body: "Inspection before you drive away." },
];

export default function CTABand() {
  return (
    <section className="relative overflow-hidden bg-foreground text-background">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 20% 30%, rgba(30,94,255,0.55) 0%, transparent 60%), radial-gradient(70% 50% at 90% 80%, rgba(255,214,52,0.18) 0%, transparent 65%)",
        }}
      />
      <div aria-hidden="true" className="grid-scan absolute inset-0 opacity-50" />
      <div className="container relative mx-auto grid grid-cols-1 items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8 lg:py-28">
        <div className="flex flex-col gap-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/60">
            Ready when you are
          </span>
          <h2
            className="font-serif italic leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(40px, 6vw, 84px)" }}
          >
            Your car is ready when{" "}
            <span className="not-italic">
              <span className="yellow-highlight text-background">you are</span>.
            </span>
          </h2>
          <p className="max-w-xl text-[15px] leading-relaxed text-background/70">
            Pick a time, drop in, drive out. No phone calls, no awkward queues — just a clean car
            and a calmer commute.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/book-car-wash-online">
                Start booking
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-background/20 bg-transparent text-background hover:border-background/40 hover:bg-background/10"
            >
              <Link href="/contact">Visit us</Link>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="rounded-2xl border border-background/15 bg-background/8 p-5 backdrop-blur-md"
              >
                <Icon className="size-5 text-background/85" />
                <p className="mt-3 font-serif text-xl leading-tight">{c.label}</p>
                <p className="mt-1 text-[13px] text-background/65">{c.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
