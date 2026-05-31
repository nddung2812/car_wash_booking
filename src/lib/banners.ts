import { cache } from "react";
import { and, desc, eq } from "drizzle-orm";
import { db, banners, type BannerRow, type NewBannerRow } from "@/db";

export const DEFAULT_SLOT = "homepage-hero";

/** All banners, newest first — for the admin grid. */
export async function listBannerRows(): Promise<BannerRow[]> {
  return db.select().from(banners).orderBy(desc(banners.createdAt));
}

export async function getBannerRow(id: string): Promise<BannerRow | undefined> {
  const rows = await db.select().from(banners).where(eq(banners.id, id));
  return rows[0];
}

export async function insertBanner(values: NewBannerRow): Promise<BannerRow> {
  const [row] = await db.insert(banners).values(values).returning();
  return row;
}

export async function updateBanner(
  id: string,
  values: Partial<NewBannerRow>,
): Promise<BannerRow | undefined> {
  const [row] = await db
    .update(banners)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(banners.id, id))
    .returning();
  return row;
}

export async function deleteBanner(id: string): Promise<BannerRow | undefined> {
  const [row] = await db.delete(banners).where(eq(banners.id, id)).returning();
  return row;
}

/**
 * Make one banner live in its slot, exclusively. Clears any other live banner
 * in the same slot first so the public site only ever shows one. Best-effort
 * two-statement flip (Neon HTTP driver has no interactive transactions; the
 * window is tiny and admin-only).
 */
export async function setBannerLive(
  id: string,
  slot = DEFAULT_SLOT,
): Promise<BannerRow | undefined> {
  await db
    .update(banners)
    .set({ isLive: false, updatedAt: new Date() })
    .where(and(eq(banners.slot, slot), eq(banners.isLive, true)));
  const [row] = await db
    .update(banners)
    .set({ isLive: true, slot, updatedAt: new Date() })
    .where(eq(banners.id, id))
    .returning();
  return row;
}

export async function clearLiveBanner(slot = DEFAULT_SLOT): Promise<void> {
  await db
    .update(banners)
    .set({ isLive: false, updatedAt: new Date() })
    .where(and(eq(banners.slot, slot), eq(banners.isLive, true)));
}

/**
 * The live, ready banner for a slot (or null). Request-deduped and resilient:
 * any DB failure falls back to null so the public homepage never breaks — the
 * caller renders the existing static slider instead.
 */
export const getLiveBanner = cache(
  async (slot = DEFAULT_SLOT): Promise<BannerRow | null> => {
    if (!process.env.DATABASE_URL) return null;
    try {
      const rows = await db
        .select()
        .from(banners)
        .where(
          and(
            eq(banners.slot, slot),
            eq(banners.isLive, true),
            eq(banners.status, "ready"),
          ),
        )
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      console.error("[banners] live read failed, falling back:", err);
      return null;
    }
  },
);