import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, products, type ProductImage } from "@/db";
import { isCurrentUserAdmin } from "@/lib/auth";
import { destroyAsset } from "@/lib/cloudinary-admin";

const CATEGORY = z.enum(["wash", "interior", "wax-polish", "accessories"]);
const BADGE = z.enum(["Best seller", "New", "Staff pick"]);

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().nullable().optional(),
});

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  tagline: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().nonnegative().optional(),
  category: CATEGORY.optional(),
  features: z.array(z.string()).optional(),
  images: z.array(imageSchema).optional(),
  badge: BADGE.optional().nullable(),
  brand: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  sourceUrl: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .nullable(),
  inStock: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (d.name !== undefined) update.name = d.name;
  if (d.tagline !== undefined) update.tagline = d.tagline;
  if (d.description !== undefined) update.description = d.description;
  if (d.price !== undefined) update.price = d.price.toFixed(2);
  if (d.category !== undefined) update.category = d.category;
  if (d.features !== undefined) update.features = d.features;
  if (d.images !== undefined) update.images = d.images;
  if (d.badge !== undefined) update.badge = d.badge ?? null;
  if (d.brand !== undefined) update.brand = d.brand ?? null;
  if (d.sku !== undefined) update.sku = d.sku ?? null;
  if (d.sourceUrl !== undefined)
    update.sourceUrl = d.sourceUrl ? d.sourceUrl : null;
  if (d.inStock !== undefined) update.inStock = d.inStock;
  if (d.sortOrder !== undefined) update.sortOrder = d.sortOrder;

  const [row] = await db
    .update(products)
    .set(update)
    .where(eq(products.id, id))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  revalidatePath("/products");
  revalidatePath(`/products/${row.id}`);
  revalidatePath("/", "layout");
  return NextResponse.json({ product: row });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const [row] = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Best-effort cleanup of associated Cloudinary assets. Failure here
  // shouldn't block the DB delete that already succeeded.
  const images = (row.images ?? []) as ProductImage[];
  for (const img of images) {
    if (!img.publicId) continue;
    try {
      await destroyAsset(img.publicId);
    } catch (err) {
      console.warn("[admin/products DELETE] cloudinary destroy:", img.publicId, err);
    }
  }
  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
