import Link from "next/link";
import { Facebook } from "lucide-react";

import { ChromeBrand } from "@/components/visuals/ChromeBrand";
import { services } from "@/data/services";
import { SOCIAL_LINKS } from "@/lib/seo/business";

export default function SiteFooter() {
  return (
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
            <div className="mt-6 flex items-center gap-3">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Hyperdome Car Wash on Facebook"
                className="grid size-9 place-items-center rounded-full border border-background/15 text-background/75 transition-colors hover:border-background/40 hover:text-background"
              >
                <Facebook className="size-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/55">
              Wash
            </h4>
            <ul className="mt-4 flex flex-col gap-1.5 text-[14px] text-background/85">
              {services.map((service) => (
                <li key={service.id}>
                  <Link href={`/services#${service.id}`} className="hover:text-background">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/55">
              Visit
            </h4>
            <ul className="mt-4 flex flex-col gap-1.5 text-[14px] text-background/85">
              <li><Link href="/services" className="hover:text-background">Services</Link></li>
              <li><Link href="/bookings" className="hover:text-background">Book a wash</Link></li>
              <li><Link href="/contact#reviews" className="hover:text-background">Reviews</Link></li>
              <li><Link href="/contact" className="hover:text-background">Locations</Link></li>
              <li><Link href="/faq" className="hover:text-background">FAQ</Link></li>
              <li><Link href="/privacy" className="hover:text-background">Privacy</Link></li>
              <li><Link href="/data-deletion" className="hover:text-background">Data Deletion</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-background/15 pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-background/55 md:flex-row md:items-center">
          <p>© 2026 Hyperdome · ABN 50 162 253 072</p>
          <p>Hand-finished. Showroom-fresh. Every drive.</p>
        </div>
      </div>
    </footer>
  );
}
