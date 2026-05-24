import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { db, products as productsTable, type ProductRow, type ProductImage } from "@/db";
import {
  type Product,
  type ProductCategory,
  type ProductBadge,
  products as staticProducts,
} from "@/data/products";

const VALID_CATEGORIES: ProductCategory[] = [
  "wash",
  "interior",
  "wax-polish",
  "accessories",
];
const VALID_BADGES: ProductBadge[] = ["Best seller", "New", "Staff pick"];

function rowToProduct(row: ProductRow): Product {
  const images = (row.images ?? []) as ProductImage[];
  const primary = images[0]?.url ?? "";
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    price: Number(row.price),
    category: (VALID_CATEGORIES.includes(row.category as ProductCategory)
      ? row.category
      : "accessories") as ProductCategory,
    features: (row.features ?? []) as string[],
    image: primary,
    badge: row.badge && VALID_BADGES.includes(row.badge as ProductBadge)
      ? (row.badge as ProductBadge)
      : undefined,
    inStock: row.inStock,
    brand: row.brand ?? undefined,
    sku: row.sku ?? undefined,
    sourceUrl: row.sourceUrl ?? undefined,
  };
}

async function loadFromDb(): Promise<Product[] | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const rows = await db
      .select()
      .from(productsTable)
      .orderBy(asc(productsTable.sortOrder), asc(productsTable.name));
    return rows.map(rowToProduct);
  } catch (err) {
    console.error("[products] DB read failed, falling back to static:", err);
    return null;
  }
}

/**
 * Source-of-truth product catalogue. DB-backed (table seeded from
 * `src/data/products.json`); falls back to the static catalogue when the DB
 * is unreachable so the public site never goes blank.
 */
export const listProducts = cache(async (): Promise<Product[]> => {
  const fromDb = await loadFromDb();
  if (fromDb && fromDb.length > 0) return fromDb;
  return staticProducts;
});

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const all = await listProducts();
  return all.find((p) => p.id === slug);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  return getProductBySlug(id);
}

export async function getRelatedProducts(
  product: Product,
  limit = 3,
): Promise<Product[]> {
  const all = await listProducts();
  const sameCategory = all.filter(
    (p) => p.id !== product.id && p.category === product.category,
  );
  const others = all.filter(
    (p) => p.id !== product.id && p.category !== product.category,
  );
  return [...sameCategory, ...others].slice(0, limit);
}

/**
 * Direct row access (incl. image publicIds) for the admin surface — does NOT
 * map to the trimmed public `Product` shape.
 */
export async function listProductRows(): Promise<ProductRow[]> {
  return db
    .select()
    .from(productsTable)
    .orderBy(asc(productsTable.sortOrder), asc(productsTable.name));
}

export async function getProductRow(id: string): Promise<ProductRow | undefined> {
  const rows = await db.select().from(productsTable).where(eq(productsTable.id, id));
  return rows[0];
}

export const AUD = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

/** Prices are GST-inclusive; this is the embedded GST share. */
export function gstComponent(grossTotal: number): number {
  return grossTotal - grossTotal / 1.1;
}
