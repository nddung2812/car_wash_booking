import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Home as HomeIcon,
  MapPin,
  MessageCircle,
  Search,
  Sparkles as SparkleIcon,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Page not found — Hyperdome Car Wash",
  description:
    "The page you were looking for has rolled out of the bay. Browse our car wash services or book a slot at Hyperdome Car Wash, Logan QLD.",
  robots: { index: false, follow: false },
};

const QUICK_LINKS = [
  { href: "/bookings", label: "Book a wash", Icon: ArrowRight, primary: true as const },
  { href: "/services", label: "Services", Icon: SparkleIcon },
  { href: "/contact", label: "Locations", Icon: MapPin },
  { href: "/reviews", label: "Reviews", Icon: Star },
  { href: "/contact", label: "Contact", Icon: MessageCircle },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="border-b border-line py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Error 404 · Page not found
              </p>
              <h1
                className="mt-4 font-serif italic leading-[0.95] tracking-tight text-foreground"
                style={{ fontSize: "clamp(64px, 11vw, 140px)" }}
              >
                404
              </h1>
              <h2
                className="mt-2 font-serif italic leading-tight tracking-tight text-foreground"
                style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
              >
                Looks like this one{" "}
                <span className="not-italic">
                  <span className="yellow-highlight">drove off</span>.
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                The page you&rsquo;re after isn&rsquo;t at this URL. It may
                have moved, the link could be old, or there&rsquo;s a typo.
                Pick a quick detour below — we&rsquo;ll get you back on the
                shine.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/">
                    <HomeIcon className="size-4" />
                    Back to home
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/bookings">
                    Book a wash
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="grid size-12 place-items-center rounded-full border border-line bg-card/40 text-primary">
                  <Search className="size-5" />
                </div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Try one of these
                </p>
                <h3 className="font-serif text-2xl leading-tight text-foreground md:text-3xl">
                  Popular places to land.
                </h3>
              </div>

              <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {QUICK_LINKS.map(({ href, label, Icon, primary }) => (
                  <li key={href} className={primary ? "col-span-2 sm:col-span-1" : ""}>
                    <Link
                      href={href}
                      className="lift flex h-full flex-col items-start gap-2 rounded-2xl border border-line bg-card/40 p-4 text-left transition-colors hover:border-ink/40 hover:bg-secondary"
                    >
                      <Icon className="size-4 text-primary" />
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {primary ? "Top pick" : "Browse"}
                      </span>
                      <span className="text-[15px] font-medium text-foreground">
                        {label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
