import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listBannerRows } from "@/lib/banners";
import { isCanvaConnected, canvaConfigured } from "@/lib/canva/tokens";
import BannerStudio from "@/components/admin/BannerStudio";

export const dynamic = "force-dynamic";

export default async function BannersPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string }>;
}) {
  await requireAdmin();
  const { connected } = await searchParams;
  const [banners, configured, linked] = await Promise.all([
    listBannerRows(),
    Promise.resolve(canvaConfigured()),
    isCanvaConnected(),
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-serif text-2xl tracking-tight text-foreground">
          Banner Studio
        </h1>
        <p className="text-[13px] text-muted-foreground">
          Describe a promo banner and the assistant designs it in Canva, stores
          it, and lets you publish it to the homepage.
        </p>
      </header>

      {connected === "1" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-800">
          Canva account connected. You can generate banners now.
        </div>
      )}

      {!configured ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
          Canva isn&apos;t configured. Set <code>CANVA_CLIENT_ID</code> and{" "}
          <code>CANVA_CLIENT_SECRET</code> (plus{" "}
          <code>CANVA_OAUTH_REDIRECT_URI</code> and{" "}
          <code>AI_GATEWAY_API_KEY</code>) to enable the studio.
        </div>
      ) : !linked ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3 text-[13px] text-foreground">
          <span>
            Canva account isn&apos;t connected yet. Authorise the shared account
            once to start generating banners.
          </span>
          <Link
            href="/api/admin/canva/connect"
            className="rounded-pill bg-primary px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground"
          >
            Connect Canva
          </Link>
        </div>
      ) : null}

      <BannerStudio initial={banners} />
    </div>
  );
}
