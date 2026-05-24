/**
 * One-time (idempotent) seed of the products table from the static catalogue
 * in `src/data/products.json`. Subsequent runs upsert by id.
 *
 * Usage:  npm run db:seed:products
 */
import { db, products as productsTable } from ".";
import { products as catalogue } from "@/data/products";
import { sql } from "drizzle-orm";

async function main() {
  console.log(`[seed-products] seeding ${catalogue.length} products…`);

  for (let i = 0; i < catalogue.length; i++) {
    const p = catalogue[i];
    await db
      .insert(productsTable)
      .values({
        id: p.id,
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        price: p.price.toFixed(2),
        category: p.category,
        features: p.features,
        images: p.image ? [{ url: p.image, publicId: null }] : [],
        badge: p.badge ?? null,
        brand: p.brand ?? null,
        sku: p.sku ?? null,
        sourceUrl: p.sourceUrl ?? null,
        inStock: p.inStock,
        sortOrder: i * 10,
      })
      .onConflictDoUpdate({
        target: productsTable.id,
        set: {
          // Update everything except images — preserves admin-uploaded images
          // on re-seed. To force-reset images, clear the row first in studio.
          name: sql`excluded.name`,
          tagline: sql`excluded.tagline`,
          description: sql`excluded.description`,
          price: sql`excluded.price`,
          category: sql`excluded.category`,
          features: sql`excluded.features`,
          badge: sql`excluded.badge`,
          brand: sql`excluded.brand`,
          sku: sql`excluded.sku`,
          sourceUrl: sql`excluded.source_url`,
          inStock: sql`excluded.in_stock`,
          updatedAt: sql`now()`,
        },
      });
    console.log(`  ✓ ${p.id}`);
  }

  console.log("[seed-products] done");
}

main().catch((err) => {
  console.error("[seed-products] failed:", err);
  process.exit(1);
});
