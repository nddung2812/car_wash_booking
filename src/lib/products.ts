import { products, type Product } from "@/data/products";

/**
 * Product `id` doubles as the URL slug (e.g. "slip-stream-60") — slugs are
 * already kebab-cased and unique in products.json, so no separate field is
 * needed for the /products/[slug] route.
 */
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.id === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

/**
 * Up to `limit` other products, preferring the same category, used for the
 * "You might also like" rail on the detail page.
 */
export function getRelatedProducts(product: Product, limit = 3): Product[] {
  const sameCategory = products.filter(
    (p) => p.id !== product.id && p.category === product.category
  );
  const others = products.filter(
    (p) => p.id !== product.id && p.category !== product.category
  );
  return [...sameCategory, ...others].slice(0, limit);
}

export const AUD = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

/** Prices in products.json are GST-inclusive; this is the embedded GST share. */
export function gstComponent(grossTotal: number): number {
  return grossTotal - grossTotal / 1.1;
}
