"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Tier = "sedan" | "wagon" | "suv";
const TIERS: Tier[] = ["sedan", "wagon", "suv"];
const TIER_LABEL: Record<Tier, string> = {
  sedan: "Sedan",
  wagon: "Wagon",
  suv: "SUV / 4×4",
};

type Row = {
  id: string;
  name: string;
  defaults: Record<Tier, number>;
  overrides: Partial<Record<Tier, number>>;
};

type Props = {
  services: Row[];
  extras: Row[];
};

type Cell = { id: string; tier: Tier; value: string };

function buildState(rows: Row[]): Record<string, Record<Tier, string>> {
  const out: Record<string, Record<Tier, string>> = {};
  for (const r of rows) {
    out[r.id] = {
      sedan: r.overrides.sedan?.toString() ?? "",
      wagon: r.overrides.wagon?.toString() ?? "",
      suv: r.overrides.suv?.toString() ?? "",
    };
  }
  return out;
}

function diffCells(
  rows: Row[],
  state: Record<string, Record<Tier, string>>,
): Cell[] {
  const out: Cell[] = [];
  for (const r of rows) {
    for (const t of TIERS) {
      const orig = r.overrides[t]?.toString() ?? "";
      const next = state[r.id]?.[t] ?? "";
      if (orig !== next) out.push({ id: r.id, tier: t, value: next });
    }
  }
  return out;
}

export function PriceEditor({ services, extras }: Props) {
  const router = useRouter();
  const [svcState, setSvcState] = useState(() => buildState(services));
  const [extState, setExtState] = useState(() => buildState(extras));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const svcChanges = useMemo(() => diffCells(services, svcState), [services, svcState]);
  const extChanges = useMemo(() => diffCells(extras, extState), [extras, extState]);
  const dirty = svcChanges.length + extChanges.length;

  async function save() {
    setSaving(true);
    setMsg(null);
    const toPayload = (cells: Cell[]) =>
      cells.map((c) => ({
        id: c.id,
        vehicleType: c.tier,
        price: c.value.trim() === "" ? null : Number(c.value),
      }));
    try {
      const res = await fetch("/api/admin/prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          services: toPayload(svcChanges),
          extras: toPayload(extChanges),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Save failed");
      }
      setMsg("Saved");
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function Table({
    rows,
    state,
    setState,
    title,
  }: {
    rows: Row[];
    state: Record<string, Record<Tier, string>>;
    setState: React.Dispatch<
      React.SetStateAction<Record<string, Record<Tier, string>>>
    >;
    title: string;
  }) {
    return (
      <div className="overflow-x-auto rounded-lg border border-line bg-card">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-line bg-secondary/30 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3" colSpan={2}>
                {title}
              </th>
              {TIERS.map((t) => (
                <th key={t} className="px-4 py-3 text-right">
                  {TIER_LABEL[t]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0">
                <td className="w-1/3 px-4 py-2 font-medium text-foreground">
                  {r.name}
                </td>
                <td className="px-4 py-2 font-mono text-[11px] text-muted-foreground">
                  {r.id}
                </td>
                {TIERS.map((t) => {
                  const overridden = (state[r.id]?.[t] ?? "") !== "";
                  return (
                    <td key={t} className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          ${r.defaults[t]}
                        </span>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="—"
                          value={state[r.id]?.[t] ?? ""}
                          onChange={(e) =>
                            setState((s) => ({
                              ...s,
                              [r.id]: { ...s[r.id], [t]: e.target.value },
                            }))
                          }
                          className={
                            "w-24 rounded-md border bg-card px-2 py-1 text-right text-[13px] tabular-nums focus:border-primary focus:outline-none " +
                            (overridden ? "border-primary" : "border-line")
                          }
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Table
        rows={services}
        state={svcState}
        setState={setSvcState}
        title="Services (per vehicle tier)"
      />
      <Table
        rows={extras}
        state={extState}
        setState={setExtState}
        title="Extras (per vehicle tier)"
      />

      <div className="sticky bottom-4 z-10 flex items-center gap-3 self-start rounded-full border border-line bg-card px-4 py-2 shadow-soft">
        <button
          type="button"
          disabled={dirty === 0 || saving}
          onClick={save}
          className="rounded-md bg-primary px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-primary-foreground hover:opacity-90 disabled:opacity-40"
        >
          {saving ? "Saving…" : `Save ${dirty || ""} change${dirty === 1 ? "" : "s"}`}
        </button>
        {msg && (
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {msg}
          </span>
        )}
        <span className="font-mono text-[11px] text-muted-foreground">
          Empty cell = use default
        </span>
      </div>
    </div>
  );
}
