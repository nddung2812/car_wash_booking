import type { Metadata } from "next";
import Link from "next/link";

import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbLd } from "@/lib/seo/jsonld";
import { BUSINESS_NAME, BUSINESS_PHONE_DISPLAY, SITE_URL } from "@/lib/seo/business";

export const metadata: Metadata = {
  title: "Data Deletion Request",
  description:
    "How to request deletion of your personal data from Hyperdome Car Wash, including what information we hold, what we delete, and our response timeline.",
  alternates: { canonical: "/data-deletion" },
};

const LAST_UPDATED = "5 May 2026";

export default function DataDeletionPage() {
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
            Data Deletion Request
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            You can ask {BUSINESS_NAME} to delete the personal information we
            hold about you at any time. This page explains what we store, how
            to submit a request, and what happens next.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose prose-neutral mx-auto max-w-3xl text-[15px] leading-relaxed text-foreground">
            <h2 className="mt-8 font-serif text-2xl leading-tight md:text-3xl">
              1. What data we hold
            </h2>
            <p className="mt-3 text-muted-foreground">
              Depending on how you have used our website, we may hold the
              following personal information about you:
            </p>
            <ul className="mt-3 list-disc pl-5 text-muted-foreground">
              <li>Your name, email address and phone number.</li>
              <li>Vehicle details provided when making a booking.</li>
              <li>Booking history (date, location, services, pricing).</li>
              <li>
                If you created an account, an authentication record from our
                sign-in provider (Clerk).
              </li>
            </ul>

            <h2 className="mt-8 font-serif text-2xl leading-tight md:text-3xl">
              2. How to submit a deletion request
            </h2>
            <p className="mt-3 text-muted-foreground">
              To request deletion of your data, please contact us by phone or
              through our{" "}
              <Link
                href="/contact"
                className="underline underline-offset-4 hover:text-foreground"
              >
                contact page
              </Link>{" "}
              and include the following details:
            </p>
            <ul className="mt-3 list-disc pl-5 text-muted-foreground">
              <li>Your full name.</li>
              <li>The email address used when making your booking or creating your account.</li>
              <li>A brief description of what you would like deleted.</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              You can also call us on {BUSINESS_PHONE_DISPLAY} during business
              hours.
            </p>

            <h2 className="mt-8 font-serif text-2xl leading-tight md:text-3xl">
              3. What we delete
            </h2>
            <p className="mt-3 text-muted-foreground">
              Upon a verified request we will permanently delete:
            </p>
            <ul className="mt-3 list-disc pl-5 text-muted-foreground">
              <li>Your account record (name, email, authentication identifiers).</li>
              <li>All booking records associated with your account or email address.</li>
            </ul>

            <h2 className="mt-8 font-serif text-2xl leading-tight md:text-3xl">
              4. What we retain
            </h2>
            <p className="mt-3 text-muted-foreground">
              We may retain certain information where required by law. Under
              Australian Tax Office (ATO) guidelines, we are obliged to keep
              financial transaction records for a minimum of five years.
              Anonymised or aggregated data that cannot identify you is not
              subject to deletion.
            </p>

            <h2 className="mt-8 font-serif text-2xl leading-tight md:text-3xl">
              5. Response timeline
            </h2>
            <p className="mt-3 text-muted-foreground">
              We will acknowledge your request within 5 business days and
              complete the deletion within 30 days. If we need additional
              information to verify your identity, we will contact you
              promptly.
            </p>

            <h2 className="mt-8 font-serif text-2xl leading-tight md:text-3xl">
              6. Contact us
            </h2>
            <p className="mt-3 text-muted-foreground">
              For data deletion requests or any privacy questions, please call{" "}
              {BUSINESS_PHONE_DISPLAY} or visit our{" "}
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
        id="ld-data-deletion-breadcrumb"
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Data Deletion Request", url: "/data-deletion" },
        ])}
      />
      <JsonLd
        id="ld-data-deletion-webpage"
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Data Deletion Request",
          url: `${SITE_URL}/data-deletion`,
          dateModified: "2026-05-05",
          inLanguage: "en-AU",
        }}
      />
    </>
  );
}
