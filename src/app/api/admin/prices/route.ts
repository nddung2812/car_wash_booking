import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { db, servicePriceOverrides, extraPriceOverrides } from "@/db";
import { isCurrentUserAdmin } from "@/lib/auth";

const TIER = z.enum(["sedan", "wagon", "suv"]);

const overrideSchema = z.object({
  id: z.string().min(1),
  vehicleType: TIER,
  /** Pass `null` to clear the override (revert to static default). */
  price: z.number().nonnegative().nullable(),
});

const bodySchema = z.object({
  services: z.array(overrideSchema).default([]),
  extras: z.array(overrideSchema).default([]),
});

export async function PUT(req: Request) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  for (const o of parsed.data.services) {
    if (o.price === null) {
      await db
        .delete(servicePriceOverrides)
        .where(
          sql`${servicePriceOverrides.serviceId} = ${o.id} AND ${servicePriceOverrides.vehicleType} = ${o.vehicleType}`,
        );
    } else {
      await db
        .insert(servicePriceOverrides)
        .values({
          serviceId: o.id,
          vehicleType: o.vehicleType,
          price: o.price.toFixed(2),
        })
        .onConflictDoUpdate({
          target: [servicePriceOverrides.serviceId, servicePriceOverrides.vehicleType],
          set: { price: o.price.toFixed(2), updatedAt: new Date() },
        });
    }
  }

  for (const o of parsed.data.extras) {
    if (o.price === null) {
      await db
        .delete(extraPriceOverrides)
        .where(
          sql`${extraPriceOverrides.extraId} = ${o.id} AND ${extraPriceOverrides.vehicleType} = ${o.vehicleType}`,
        );
    } else {
      await db
        .insert(extraPriceOverrides)
        .values({
          extraId: o.id,
          vehicleType: o.vehicleType,
          price: o.price.toFixed(2),
        })
        .onConflictDoUpdate({
          target: [extraPriceOverrides.extraId, extraPriceOverrides.vehicleType],
          set: { price: o.price.toFixed(2), updatedAt: new Date() },
        });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const [svc, ext] = await Promise.all([
    db.select().from(servicePriceOverrides),
    db.select().from(extraPriceOverrides),
  ]);
  return NextResponse.json({ services: svc, extras: ext });
}
