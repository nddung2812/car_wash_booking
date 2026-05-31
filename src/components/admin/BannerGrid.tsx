"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { BannerRow } from "@/db";

const STATUS_STYLES: Record<BannerRow["status"], string> = {
  ready: "bg-emerald-100 text-emerald-700",
  generating: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

export default function BannerGrid({
  banners,
  onChange,
}: {
  banners: BannerRow[];
  onChange: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const setLive = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/banners/${id}/live`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      onChange();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to set live");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this banner? This removes it from Cloudinary too.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      onChange();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setBusyId(null);
    }
  };

  if (banners.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line p-8 text-center text-[13px] text-muted-foreground">
        No banners yet. Generate one in the studio to get started.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {banners.map((b) => (
        <div
          key={b.id}
          className="flex flex-col overflow-hidden rounded-2xl border border-line bg-card"
        >
          <div className="relative aspect-[1200/628] w-full bg-background">
            {b.cloudinaryUrl ? (
              <Image
                src={b.cloudinaryUrl}
                alt={b.altText ?? b.prompt}
                fill
                className="object-cover"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
            ) : (
              <div className="grid h-full place-items-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {b.status === "failed" ? "Render failed" : "Generating…"}
              </div>
            )}
            {b.isLive && (
              <span className="absolute left-3 top-3 rounded-pill bg-primary px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary-foreground">
                Live
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="line-clamp-2 text-[13px] text-foreground">{b.prompt}</p>
              <span
                className={`shrink-0 rounded-pill px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${STATUS_STYLES[b.status]}`}
              >
                {b.status}
              </span>
            </div>

            <div className="mt-auto flex items-center gap-2">
              <Button
                size="sm"
                variant={b.isLive ? "secondary" : "default"}
                disabled={b.status !== "ready" || b.isLive || busyId === b.id}
                onClick={() => setLive(b.id)}
              >
                {b.isLive ? "Live now" : "Set live"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={busyId === b.id}
                onClick={() => remove(b.id)}
                className="text-destructive hover:text-destructive"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
