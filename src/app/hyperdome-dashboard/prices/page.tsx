import { db, servicePriceOverrides, extraPriceOverrides } from "@/db";
import { services as staticServices, extraServices as staticExtras } from "@/data/services";
import { PriceEditor } from "@/components/admin/PriceEditor";

export const dynamic = "force-dynamic";

type Tier = "sedan" | "wagon" | "suv";

export default async function AdminPricesPage() {
  const [svcRows, extRows] = await Promise.all([
    db.select().from(servicePriceOverrides),
    db.select().from(extraPriceOverrides),
  ]);

  const svcOverrides: Record<string, Partial<Record<Tier, number>>> = {};
  for (const r of svcRows) {
    const tier = r.vehicleType as Tier;
    if (!["sedan", "wagon", "suv"].includes(tier)) continue;
    svcOverrides[r.serviceId] = svcOverrides[r.serviceId] ?? {};
    svcOverrides[r.serviceId][tier] = Number(r.price);
  }
  const extOverrides: Record<string, Partial<Record<Tier, number>>> = {};
  for (const r of extRows) {
    const tier = r.vehicleType as Tier;
    if (!["sedan", "wagon", "suv"].includes(tier)) continue;
    extOverrides[r.extraId] = extOverrides[r.extraId] ?? {};
    extOverrides[r.extraId][tier] = Number(r.price);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-foreground">
          Booking prices
        </h1>
        <p className="text-[13px] text-muted-foreground">
          Override the base service & add-on prices. Empty cells use the value
          in <code className="rounded bg-secondary px-1 py-0.5 font-mono text-[12px]">src/data/services.ts</code>.
        </p>
      </div>

      <PriceEditor
        services={staticServices.map((s) => ({
          id: s.id,
          name: s.name,
          defaults: s.pricing,
          overrides: svcOverrides[s.id] ?? {},
        }))}
        extras={staticExtras.map((e) => ({
          id: e.id,
          name: e.name,
          defaults: e.pricing,
          overrides: extOverrides[e.id] ?? {},
        }))}
      />
    </div>
  );
}
