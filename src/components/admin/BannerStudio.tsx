"use client";

import { useCallback, useState } from "react";
import BannerChat from "./BannerChat";
import BannerGrid from "./BannerGrid";
import type { BannerRow } from "@/db";

/**
 * Client shell for the banner studio. Holds the banner list so the chat can
 * trigger a refresh when a new banner is generated, and the grid can refresh
 * itself after set-live / delete — without a full page reload.
 */
export default function BannerStudio({ initial }: { initial: BannerRow[] }) {
  const [banners, setBanners] = useState<BannerRow[]>(initial);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/banners", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { banners: BannerRow[] };
      setBanners(data.banners);
    } catch {
      /* keep the current list on transient failure */
    }
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="lg:h-[600px]">
        <BannerChat onGenerated={refresh} />
      </div>
      <BannerGrid banners={banners} onChange={refresh} />
    </div>
  );
}
