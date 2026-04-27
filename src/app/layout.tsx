import type { Metadata, Viewport } from "next";
import { Poppins, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";

import JsonLd from "@/components/seo/JsonLd";
import {
  BUSINESS_DESCRIPTION,
  BUSINESS_NAME,
  SITE_URL,
} from "@/lib/seo/business";
import { organizationLd, websiteLd } from "@/lib/seo/jsonld";

import "./globals.css";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#F7F5F1",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BUSINESS_NAME} — Professional Car Wash in Logan QLD`,
    template: `%s | ${BUSINESS_NAME} Logan QLD`,
  },
  description: BUSINESS_DESCRIPTION,
  applicationName: BUSINESS_NAME,
  authors: [{ name: BUSINESS_NAME, url: SITE_URL }],
  creator: BUSINESS_NAME,
  publisher: BUSINESS_NAME,
  category: "business",
  keywords: [
    "car wash Logan",
    "car wash Logan QLD",
    "car wash Shailer Park",
    "car wash Loganholme",
    "Hyperdome car wash",
    "car detailing Logan",
    "professional car wash Logan",
    "hand car wash Logan",
    "interior detailing Logan",
    "ceramic car wash Logan",
    "eco-friendly car wash Logan",
    "car wash Hyperdome Shopping Centre",
    "same-day car wash Logan",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: SITE_URL,
    siteName: BUSINESS_NAME,
    title: `${BUSINESS_NAME} — Professional Car Wash in Logan QLD`,
    description: BUSINESS_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Hyperdome Car Wash — Professional car wash in Logan QLD",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS_NAME} — Logan QLD`,
    description: BUSINESS_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <body
        className={`${poppins.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ClerkProvider afterSignOutUrl="/">{children}</ClerkProvider>

        <JsonLd id="ld-organization" data={organizationLd()} />
        <JsonLd id="ld-website" data={websiteLd()} />

        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5LQ2LKF6"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <Script id="google-tag-manager" strategy="lazyOnload">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5LQ2LKF6');`}
        </Script>

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HC6GZB3ETP"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HC6GZB3ETP');
          `}
        </Script>
      </body>
    </html>
  );
}
