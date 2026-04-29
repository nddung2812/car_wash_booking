import type { MetadataRoute } from "next";
import { LOCATIONS, SITE_URL } from "@/lib/seo/business";

const LAST_MODIFIED = "2026-04-30";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: LAST_MODIFIED },
    { url: `${SITE_URL}/services`, lastModified: LAST_MODIFIED },
    { url: `${SITE_URL}/bookings`, lastModified: LAST_MODIFIED },
    { url: `${SITE_URL}/contact`, lastModified: LAST_MODIFIED },
    { url: `${SITE_URL}/reviews`, lastModified: LAST_MODIFIED },
    { url: `${SITE_URL}/faq`, lastModified: LAST_MODIFIED },
    { url: `${SITE_URL}/privacy`, lastModified: LAST_MODIFIED },
  ];

  for (const loc of LOCATIONS) {
    entries.push({
      url: `${SITE_URL}/locations/${loc.slug}`,
      lastModified: LAST_MODIFIED,
    });
  }

  return entries;
}
