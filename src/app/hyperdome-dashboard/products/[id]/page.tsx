import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductRow } from "@/lib/products";
import { ProductForm } from "@/components/admin/ProductForm";
import type { ProductImage } from "@/db";

export const dynamic = "force-dynamic";

type ValidBadge = "Best seller" | "New" | "Staff pick";
const VALID_BADGES: ValidBadge[] = ["Best seller", "New", "Staff pick"];

type ValidCategory = "wash" | "interior" | "wax-polish" | "accessories";
const VALID_CATEGORIES: ValidCategory[] = [
  "wash",
  "interior",
  "wax-polish",
  "accessories",
];

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getProductRow(id);
  if (!row) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/hyperdome-dashboard/products"
        className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
      >
        ← Back to products
      </Link>
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-foreground">
          {row.name}
        </h1>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {row.id}
        </p>
      </div>
      <ProductForm
        mode="edit"
        initial={{
          id: row.id,
          name: row.name,
          tagline: row.tagline,
          description: row.description,
          price: Number(row.price),
          category: VALID_CATEGORIES.includes(row.category as ValidCategory)
            ? (row.category as ValidCategory)
            : "accessories",
          features: (row.features ?? []) as string[],
          images: (row.images ?? []) as ProductImage[],
          badge:
            row.badge && VALID_BADGES.includes(row.badge as ValidBadge)
              ? (row.badge as ValidBadge)
              : null,
          brand: row.brand ?? "",
          sku: row.sku ?? "",
          sourceUrl: row.sourceUrl ?? "",
          inStock: row.inStock,
          sortOrder: row.sortOrder,
        }}
      />
    </div>
  );
}
