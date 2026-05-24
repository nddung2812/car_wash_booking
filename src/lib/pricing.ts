import { cache } from "react";
import {
  db,
  servicePriceOverrides,
  extraPriceOverrides,
} from "@/db";
import {
  services as staticServices,
  extraServices as staticExtras,
  type Service,
  type ExtraService,
} from "@/data/services";

type Tier = "sedan" | "wagon" | "suv";
const TIERS: Tier[] = ["sedan", "wagon", "suv"];

function tryConnect<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!process.env.DATABASE_URL) return Promise.resolve(fallback);
  return fn().catch((err) => {
    console.error("[pricing] override load failed:", err);
    return fallback;
  });
}

function applyOverrides<T extends { pricing: Record<Tier, number> }>(
  defaults: T[],
  overrides: Map<string, Partial<Record<Tier, number>>>,
  idOf: (item: T) => string,
): T[] {
  return defaults.map((item) => {
    const o = overrides.get(idOf(item));
    if (!o) return item;
    return {
      ...item,
      pricing: {
        sedan: o.sedan ?? item.pricing.sedan,
        wagon: o.wagon ?? item.pricing.wagon,
        suv: o.suv ?? item.pricing.suv,
      },
    };
  });
}

/** Loads service price overrides and returns the full service catalogue with
 *  overrides applied (definitions still come from `src/data/services.ts`). */
export const getMergedServices = cache(async (): Promise<Service[]> => {
  const rows = await tryConnect(
    () => db.select().from(servicePriceOverrides),
    [] as Array<{ serviceId: string; vehicleType: string; price: string }>,
  );
  const map = new Map<string, Partial<Record<Tier, number>>>();
  for (const r of rows) {
    const tier = r.vehicleType as Tier;
    if (!TIERS.includes(tier)) continue;
    const slot = map.get(r.serviceId) ?? {};
    slot[tier] = Number(r.price);
    map.set(r.serviceId, slot);
  }
  return applyOverrides(staticServices, map, (s) => s.id);
});

/** Loads extra-service price overrides applied to the static catalogue. */
export const getMergedExtras = cache(async (): Promise<ExtraService[]> => {
  const rows = await tryConnect(
    () => db.select().from(extraPriceOverrides),
    [] as Array<{ extraId: string; vehicleType: string; price: string }>,
  );
  const map = new Map<string, Partial<Record<Tier, number>>>();
  for (const r of rows) {
    const tier = r.vehicleType as Tier;
    if (!TIERS.includes(tier)) continue;
    const slot = map.get(r.extraId) ?? {};
    slot[tier] = Number(r.price);
    map.set(r.extraId, slot);
  }
  return applyOverrides(staticExtras, map, (e) => e.id);
});

/** Both catalogues in one round-trip (still cached per request). */
export async function getMergedPricing(): Promise<{
  services: Service[];
  extras: ExtraService[];
}> {
  const [services, extras] = await Promise.all([
    getMergedServices(),
    getMergedExtras(),
  ]);
  return { services, extras };
}
