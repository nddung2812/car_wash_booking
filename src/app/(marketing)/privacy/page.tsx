import type { Metadata } from "next";
import Link from "next/link";

import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbLd } from "@/lib/seo/jsonld";
import { BUSINESS_NAME, BUSINESS_PHONE_DISPLAY, SITE_URL } from "@/lib/seo/business";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Hyperdome Car Wash collects, uses, stores and protects your personal information when you book a car wash, contact us or use logancarwash.com.au.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "30 April 2026";

export default function PrivacyPage() {
  return (
    <>
      <section className="border-b border-line py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Last updated · {LAST_UPDATED}
          </p>
          <h1
            className="mt-3 font-serif italic leading-tight tracking-tight text-foreground"
            style={{ fontSize: "clamp(40px, 6vw, 72px)" }}
          >
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            How {BUSINESS_NAME} collects, uses, stores and protects your personal
            information. This policy is governed by the Australian Privacy Act
            1988 (Cth) and the Australian Privacy Principles.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose prose-neutral mx-auto max-w-3xl text-[15px] leading-relaxed text-foreground">
            <h2 className="mt-8 font-serif text-2xl leading-tight md:text-3xl">
              1. Who we are
            </h2>
            <p className="mt-3 text-muted-foreground">
              {BUSINESS_NAME} (ABN 50 162 253 072) operates two locations inside
              Hyperdome Shopping Centre, Logan QLD. References to &ldquo;we&rdquo;,
              &ldquo;us&rdquo; and &ldquo;our&rdquo; in this policy mean{" "}
              {BUSINESS_NAME}.
            </p>

            <h2 className="mt-8 font-serif text-2xl leading-tight md:text-3xl">
              2. Information we collect
            </h2>
            <p className="mt-3 text-muted-foreground">
              When you book a car wash through our website we collect:
            </p>
            <ul className="mt-3 list-disc pl-5 text-muted-foreground">
              <li>Your name, email address and phone number.</li>
              <li>Vehicle details (type and any add-ons selected).</li>
              <li>Booking date, time, location and pricing information.</li>
              <li>
                If you create an account, an authentication identifier from our
                sign-in provider (Clerk).
              </li>
              <li>
                Anonymous analytics data (page views, referrers, device type)
                via Google Analytics.
              </li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              We do not collect or store payment card numbers on our servers.
              Payments are taken in person at the bay.
            </p>

            <h2 className="mt-8 font-serif text-2xl leading-tight md:text-3xl">
              3. How we use your information
            </h2>
            <ul className="mt-3 list-disc pl-5 text-muted-foreground">
              <li>To confirm and manage your booking.</li>
              <li>
                To send you a booking confirmation email and contact you about
                your appointment.
              </li>
              <li>
                To improve our website and services using aggregated analytics.
              </li>
              <li>To meet our legal and tax record-keeping obligations.</li>
            </ul>

            <h2 className="mt-8 font-serif text-2xl leading-tight md:text-3xl">
              4. Sharing your information
            </h2>
            <p className="mt-3 text-muted-foreground">
              We share limited personal information only with service providers
              who help us run the website and deliver bookings:
            </p>
            <ul className="mt-3 list-disc pl-5 text-muted-foreground">
              <li>Neon (database hosting) — stores booking and account records.</li>
              <li>Clerk (authentication) — manages sign-in if you create an account.</li>
              <li>EmailJS (email delivery) — sends booking confirmation emails.</li>
              <li>Vercel (hosting) — serves the website.</li>
              <li>Google Analytics — provides anonymised usage statistics.</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              We never sell your personal information.
            </p>

            <h2 className="mt-8 font-serif text-2xl leading-tight md:text-3xl">
              5. Data security
            </h2>
            <p className="mt-3 text-muted-foreground">
              We use HTTPS across the entire site, restrict admin access by
              email, and store data with reputable cloud providers. While no
              system is perfectly secure, we take reasonable steps to protect
              your information from misuse, loss and unauthorised access.
            </p>

            <h2 className="mt-8 font-serif text-2xl leading-tight md:text-3xl">
              6. Your rights
            </h2>
            <p className="mt-3 text-muted-foreground">
              You can ask us to access, correct or delete your personal
              information at any time. To make a request, or to raise a privacy
              concern, contact us using the details below.
            </p>

            <h2 className="mt-8 font-serif text-2xl leading-tight md:text-3xl">
              7. Cookies
            </h2>
            <p className="mt-3 text-muted-foreground">
              We use a small number of cookies to keep you signed in and to
              measure anonymous traffic. You can disable cookies in your
              browser; some features (such as account sign-in) may not work as
              expected if you do.
            </p>

            <h2 className="mt-8 font-serif text-2xl leading-tight md:text-3xl">
              8. Changes to this policy
            </h2>
            <p className="mt-3 text-muted-foreground">
              We may update this policy from time to time. The &ldquo;last
              updated&rdquo; date at the top of this page reflects the most
              recent revision.
            </p>

            <h2 className="mt-8 font-serif text-2xl leading-tight md:text-3xl">
              9. Contact us
            </h2>
            <p className="mt-3 text-muted-foreground">
              For privacy enquiries, please call {BUSINESS_PHONE_DISPLAY} or
              visit our{" "}
              <Link
                href="/contact"
                className="underline underline-offset-4 hover:text-foreground"
              >
                contact page
              </Link>
              .
            </p>
          </article>
        </div>
      </section>

      <JsonLd
        id="ld-privacy-breadcrumb"
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Privacy Policy", url: "/privacy" },
        ])}
      />
      <JsonLd
        id="ld-privacy-webpage"
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Privacy Policy",
          url: `${SITE_URL}/privacy`,
          dateModified: "2026-04-30",
          inLanguage: "en-AU",
        }}
      />
    </>
  );
}
