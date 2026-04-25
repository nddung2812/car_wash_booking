import { ArrowRight, Calendar, Car, Droplet, MapPin, Phone, Shield, Sparkles, Sprout } from "lucide-react";

import Header from "@/components/Header";
import BannerSlider from "@/components/BannerSlider";
import BookingForm from "@/components/BookingForm";
import ReviewsSection from "@/components/ReviewsSection";
import ServicesSection from "@/components/ServicesSection";
import ExtraServicesSection from "@/components/ExtraServicesSection";
import { Button } from "@/components/ui/button";
import { IconPill } from "@/components/ui/icon-pill";
import { ChromeBrand } from "@/components/visuals/ChromeBrand";
import { Marquee } from "@/components/visuals/Marquee";
import { SectionIntro } from "@/components/SectionIntro";
import { services } from "@/data/services";

const tickerItems = [
  "★ 4.9 Google rating",
  "Hand-finished detailing",
  "92% water reclaimed",
  "Eco-friendly chemistry",
  "Same-day bookings",
  "Members save 10%",
];

const howItWorks = [
  { icon: Calendar, label: "Pick a service", body: "Choose a wash or detail in under a minute." },
  { icon: Car, label: "Tell us the car", body: "Vehicle size sets the right time and price." },
  { icon: Sparkles, label: "Drop in", body: "Drive in — we'll take it from there." },
  { icon: Droplet, label: "Drive out shining", body: "Hand-finished, inspected, ready to go." },
];

const locations = [
  {
    name: "Shailer Park",
    id: "location-shailer-park",
    address: "Hyperdome Shopping Centre",
    line2: "Carpark Basement — Mandew St",
    region: "Shailer Park QLD 4128",
  },
  {
    name: "Loganholme",
    id: "location-loganholme",
    address: "Hyperdome Shopping Centre",
    line2: "Carpark Basement — 2 Leda Dr",
    region: "Loganholme QLD 4129",
  },
];

const businessHours: Array<[string, string]> = [
  ["Monday", "8:30 AM — 5:00 PM"],
  ["Tuesday", "9:00 AM — 5:00 PM"],
  ["Wednesday", "8:30 AM — 5:00 PM"],
  ["Thursday", "8:30 AM — 5:00 PM"],
  ["Friday", "8:30 AM — 5:00 PM"],
  ["Saturday", "8:30 AM — 5:00 PM"],
  ["Sunday", "9:00 AM — 5:00 PM"],
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero */}
        <BannerSlider />

        {/* Marquee */}
        <Marquee items={tickerItems} />

        {/* Services + add-ons */}
        <section id="services" className="py-20 lg:py-24">
          <div className="container mx-auto flex flex-col gap-20 px-4 sm:px-6 lg:px-8">
            <ServicesSection />
            <ExtraServicesSection />
          </div>
        </section>

        {/* How it works */}
        <section className="bg-secondary/40 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <SectionIntro
              kicker="03 — How it works"
              title="Four steps. One sparkling drive away."
              className="mb-12"
            />
            <ol className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {howItWorks.map((step, i) => {
                const Icon = step.icon;
                return (
                  <li
                    key={step.label}
                    className="lift relative flex flex-col gap-4 rounded-[20px] border border-line bg-card-gradient p-6 shadow-soft"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <IconPill>
                        <Icon className="size-4" />
                      </IconPill>
                    </div>
                    <h3 className="font-serif text-2xl leading-tight tracking-tight text-foreground">
                      {step.label}
                    </h3>
                    <p className="text-[14px] leading-relaxed text-muted-foreground">{step.body}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Booking */}
        <section id="booking" className="py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <SectionIntro
              kicker="04 — Book a wash"
              title="Pick a time that fits."
              description="Schedule online in under a minute. We'll be ready when you arrive."
              className="mb-10"
            />
            <BookingForm />
          </div>
        </section>

        {/* Reviews */}
        <section id="reviews">
          <ReviewsSection />
        </section>

        {/* Big CTA band */}
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
                  <a href="#booking">
                    Start booking
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-background/20 bg-transparent text-background hover:border-background/40 hover:bg-background/10"
                >
                  <a href="#contact">Visit us</a>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Shield, label: "No-lock-in", body: "Cancel from your phone, anytime." },
                { icon: Sprout, label: "Eco-grade", body: "92% water reclaimed on every wash." },
                { icon: Sparkles, label: "Hand-finished", body: "Detail-first, machine-second." },
                { icon: Droplet, label: "Showroom-fresh", body: "Inspection before you drive away." },
              ].map((c) => {
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

        {/* Contact / locations */}
        <section id="contact" className="bg-background py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <SectionIntro
              kicker="05 — Locations"
              title="Two locations. Open seven days."
              className="mb-12"
            />

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr]">
              <div className="flex flex-col gap-5">
                {locations.map((loc) => (
                  <article
                    key={loc.name}
                    id={loc.id}
                    className="lift flex scroll-mt-24 flex-col gap-3 rounded-[20px] border border-line bg-card-gradient p-6 shadow-soft"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-[28px] leading-tight tracking-tight text-foreground">
                        {loc.name}
                      </h3>
                      <IconPill>
                        <MapPin className="size-4" />
                      </IconPill>
                    </div>
                    <p className="text-[15px] text-muted-foreground">
                      {loc.address}
                      <br />
                      {loc.line2}
                      <br />
                      {loc.region}
                    </p>
                  </article>
                ))}

                <article className="rounded-[20px] border border-line bg-card-gradient p-6 shadow-soft">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-[24px] leading-tight tracking-tight text-foreground">
                      Reach us
                    </h3>
                    <IconPill>
                      <Phone className="size-4" />
                    </IconPill>
                  </div>
                  <a
                    href="tel:0738060358"
                    className="mt-3 inline-block font-serif text-3xl text-foreground"
                  >
                    (07) 3806 0358
                  </a>
                  <ul className="mt-5 grid grid-cols-1 gap-1.5 border-t border-dashed border-line pt-4 text-[14px]">
                    {businessHours.map(([day, hours]) => (
                      <li key={day} className="flex items-baseline justify-between gap-3">
                        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                          {day}
                        </span>
                        <span className="font-mono text-[12px] text-foreground tabular-nums">{hours}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>

              <div className="relative h-72 overflow-hidden rounded-[20px] border border-line shadow-soft lg:h-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3533.887531633727!2d153.16938207546565!3d-27.658951176210298!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b91423b28b00705%3A0x41c1806fafd6115d!2sSparkles%20Car%20Wash!5e0!3m2!1sen!2sau!4v1753526071902!5m2!1sen!2sau"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Hyperdome locations"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-foreground py-16 text-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <ChromeBrand size={40} />
                <span className="font-serif text-2xl tracking-tight">Hyperdome</span>
              </div>
              <p className="mt-5 max-w-md text-[14px] leading-relaxed text-background/65">
                Professional car wash and hand-finished detailing — eco-grade chemistry,
                state-of-the-art equipment, and a finish that gets compliments.
              </p>
            </div>

            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/55">
                Wash
              </h4>
              <ul className="mt-4 flex flex-col gap-1.5 text-[14px] text-background/85">
                {services.map((service) => (
                  <li key={service.id}>{service.name}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/55">
                Visit
              </h4>
              <ul className="mt-4 flex flex-col gap-1.5 text-[14px] text-background/85">
                <li><a href="#services" className="hover:text-background">Services</a></li>
                <li><a href="#booking" className="hover:text-background">Book a wash</a></li>
                <li><a href="#reviews" className="hover:text-background">Reviews</a></li>
                <li><a href="#contact" className="hover:text-background">Locations</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-background/15 pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-background/55 md:flex-row md:items-center">
            <p>© 2024 Hyperdome · ABN 50 162 253 072</p>
            <p>Hand-finished. Showroom-fresh. Every drive.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
