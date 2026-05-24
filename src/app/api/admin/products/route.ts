import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { asc } from "drizzle-orm";
import { z } from "zod";
import { db, products } from "@/db";
import { isCurrentUserAdmin } from "@/lib/auth";

const CATEGORY = z.enum(["wash", "interior", "wax-polish", "accessories"]);
const BADGE = z.enum(["Best seller", "New", "Staff pick"]);

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().nullable().optional(),
});

const createSchema = z.object({
  id: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Use kebab-case slug only"),
  name: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  category: CATEGORY,
  features: z.array(z.string()).default([]),
  images: z.array(imageSchema).default([]),
  badge: BADGE.optional().nullable(),
  brand: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  sourceUrl: z.string().url().optional().nullable(),
  inStock: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function GET() {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const rows = await db
    .select()
    .from(products)
    .orderBy(asc(products.sortOrder), asc(products.name));
  return NextResponse.json({ products: rows });
}

export async function POST(req: Request) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const d = parsed.data;
  try {
    const [row] = await db
      .insert(products)
      .values({
        id: d.id,
        name: d.name,
        tagline: d.tagline,
        description: d.description,
        price: d.price.toFixed(2),
        category: d.category,
        features: d.features,
        images: d.images,
        badge: d.badge ?? null,
        brand: d.brand ?? null,
        sku: d.sku ?? null,
        sourceUrl: d.sourceUrl ?? null,
        inStock: d.inStock,
        sortOrder: d.sortOrder,
      })
      .returning();
    revalidatePath("/products");
    revalidatePath(`/products/${row.id}`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/", "layout");
    return NextResponse.json({ product: row }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Insert failed";
    if (msg.includes("duplicate key")) {
      return NextResponse.json(
        { error: `A product with id "${d.id}" already exists.` },
        { status: 409 },
      );
    }
    console.error("[admin/products POST]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
