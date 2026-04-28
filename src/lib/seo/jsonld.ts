import { services, extraServices } from "@/data/services";
import {
  AREA_SERVED,
  BUSINESS_DESCRIPTION,
  BUSINESS_LEGAL_NAME,
  BUSINESS_NAME,
  BUSINESS_PHONE,
  BUSINESS_PRICE_RANGE,
  LOCATIONS,
  Location,
  OPENING_HOURS,
  SITE_URL,
  SOCIAL_LINKS,
} from "./business";

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const LOGO_URL = `${SITE_URL}/sparklesLogo.png`;

const dayMap: Record<string, string> = {
  Monday: "Mo",
  Tuesday: "Tu",
  Wednesday: "We",
  Thursday: "Th",
  Friday: "Fr",
  Saturday: "Sa",
  Sunday: "Su",
};

function openingHoursSpecification() {
  const groups = new Map<string, string[]>();
  for (const { day, opens, closes } of OPENING_HOURS) {
    const key = `${opens}-${closes}`;
    const arr = groups.get(key) ?? [];
    arr.push(dayMap[day]);
    groups.set(key, arr);
  }
  return Array.from(groups.entries()).map(([key, days]) => {
    const [opens, closes] = key.split("-");
    return {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days.map((d) => `https://schema.org/${dayName(d)}`),
      opens,
      closes,
    };
  });
}

function dayName(short: string): string {
  return {
    Mo: "Monday",
    Tu: "Tuesday",
    We: "Wednesday",
    Th: "Thursday",
    Fr: "Friday",
    Sa: "Saturday",
    Su: "Sunday",
  }[short] as string;
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: BUSINESS_NAME,
    legalName: BUSINESS_LEGAL_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: LOGO_URL,
      width: 512,
      height: 512,
    },
    image: LOGO_URL,
    description: BUSINESS_DESCRIPTION,
    telephone: BUSINESS_PHONE,
    sameAs: [SOCIAL_LINKS.google, SOCIAL_LINKS.facebook, SOCIAL_LINKS.instagram],
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: BUSINESS_NAME,
    description: BUSINESS_DESCRIPTION,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-AU",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/services?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

const AGGREGATE_RATING = {
  "@type": "AggregateRating",
  ratingValue: "4.9",
  reviewCount: "2400",
  bestRating: "5",
  worstRating: "1",
};

export function localBusinessLd(location: Location) {
  const url = `${SITE_URL}/locations/${location.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "AutomotiveBusiness", "CarWash"],
    "@id": `${url}#localbusiness`,
    name: location.name,
    description: `${location.name} — professional hand-finished car wash and detailing inside Hyperdome Shopping Centre, ${location.addressLocality} QLD.`,
    url,
    image: LOGO_URL,
    logo: LOGO_URL,
    telephone: location.phone,
    priceRange: BUSINESS_PRICE_RANGE,
    currenciesAccepted: "AUD",
    paymentAccepted: "Cash, Credit Card, EFTPOS, Apple Pay, Google Pay",
    parentOrganization: { "@id": ORG_ID },
    aggregateRating: AGGREGATE_RATING,
    address: {
      "@type": "PostalAddress",
      streetAddress: location.streetAddress,
      addressLocality: location.addressLocality,
      addressRegion: "QLD",
      postalCode: location.postalCode,
      addressCountry: "AU",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: location.geo.latitude,
      longitude: location.geo.longitude,
    },
    hasMap: location.mapUrl,
    areaServed: AREA_SERVED.map((name) => ({ "@type": "City", name })),
    openingHoursSpecification: openingHoursSpecification(),
    sameAs: [SOCIAL_LINKS.google, SOCIAL_LINKS.facebook, SOCIAL_LINKS.instagram],
  };
}

export function allLocationsLd() {
  return LOCATIONS.map(localBusinessLd);
}

export function breadcrumbLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

function priceSpec(min: number, max: number) {
  return [
    {
      "@type": "PriceSpecification",
      price: min,
      priceCurrency: "AUD",
      description: "Sedan",
    },
    {
      "@type": "PriceSpecification",
      price: max,
      priceCurrency: "AUD",
      description: "4×4 / SUV",
    },
  ];
}

export function serviceLd(svc: (typeof services)[number]) {
  const url = `${SITE_URL}/services#${svc.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": url,
    name: svc.name,
    serviceType: "Car wash and detailing",
    description: svc.description,
    provider: { "@id": ORG_ID },
    areaServed: AREA_SERVED.map((name) => ({ "@type": "City", name })),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "AUD",
      lowPrice: svc.pricing.sedan,
      highPrice: svc.pricing.suv,
      offerCount: 3,
      priceSpecification: priceSpec(svc.pricing.sedan, svc.pricing.suv),
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/bookings`,
    },
  };
}

export function offerCatalogLd() {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Car Wash Packages — Hyperdome Logan QLD",
    url: `${SITE_URL}/services`,
    provider: { "@id": ORG_ID },
    itemListElement: services.map((svc, i) => ({
      "@type": "Offer",
      position: i + 1,
      itemOffered: {
        "@type": "Service",
        name: svc.name,
        description: svc.tagline,
        url: `${SITE_URL}/services#${svc.id}`,
      },
      priceCurrency: "AUD",
      price: svc.pricing.sedan,
      priceSpecification: priceSpec(svc.pricing.sedan, svc.pricing.suv),
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/bookings`,
    })),
  };
}

export function extrasOfferCatalogLd() {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Add-on Services — Hyperdome Logan QLD",
    url: `${SITE_URL}/services#extras`,
    provider: { "@id": ORG_ID },
    itemListElement: extraServices.map((svc, i) => ({
      "@type": "Offer",
      position: i + 1,
      itemOffered: {
        "@type": "Service",
        name: svc.name,
        description: svc.description ?? svc.name,
      },
      priceCurrency: "AUD",
      price: svc.pricing.sedan,
      availability: "https://schema.org/InStock",
    })),
  };
}

const REVIEW_DATA = [
  {
    name: "Sarah Johnson",
    rating: 5,
    date: "2026-04-25",
    body: "Absolutely amazing service! My car looks brand new. The staff was professional and the facility was spotless. Will definitely be coming back!",
  },
  {
    name: "Mike Chen",
    rating: 5,
    date: "2026-04-20",
    body: "Best car wash in town. They pay attention to every detail and the pricing is reasonable. My BMW has never looked better.",
  },
  {
    name: "Emily Rodriguez",
    rating: 4,
    date: "2026-04-13",
    body: "Quick and efficient service. Perfect for when you need a fast clean. The online booking made it super convenient.",
  },
  {
    name: "David Thompson",
    rating: 5,
    date: "2026-04-06",
    body: "Outstanding customer service and quality. They treated my truck with care and the results exceeded my expectations.",
  },
  {
    name: "Lisa Martinez",
    rating: 5,
    date: "2026-03-27",
    body: "Professional team and excellent results. My car interior and exterior look fantastic. The eco-friendly products are a great bonus.",
  },
  {
    name: "James Wilson",
    rating: 4,
    date: "2026-03-27",
    body: "Great value for money. Clean facility, friendly staff, and my car came out sparkling clean. Will be back for sure.",
  },
];

export function reviewsLd() {
  return REVIEW_DATA.map((r) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    author: { "@type": "Person", name: r.name },
    reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    reviewBody: r.body,
    datePublished: r.date,
    itemReviewed: { "@id": ORG_ID },
  }));
}

export type FaqItem = { q: string; a: string };

export function faqPageLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function videoObjectLd(svc: (typeof services)[number]) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `${svc.name} — Hyperdome Car Wash Logan QLD`,
    description: svc.description,
    thumbnailUrl: svc.image,
    embedUrl: svc.videoUrl,
    uploadDate: "2024-01-01",
    publisher: { "@id": ORG_ID },
  };
}
