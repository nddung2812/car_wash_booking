import type { MetadataRoute } from "next";
import { LOCATIONS, SITE_URL } from "@/lib/seo/business";
import { listProducts } from "@/lib/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/services`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/book-car-wash-online`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/contact`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/faq`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/why-book-online`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/data-deletion`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/products`, lastModified, changeFrequency: "weekly", priority: 0.8 },
  ];

  for (const loc of LOCATIONS) {
    entries.push({
      url: `${SITE_URL}/locations/${loc.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  const products = await listProducts();
  for (const product of products) {
    entries.push({
      url: `${SITE_URL}/products/${product.id}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return entries;
}
