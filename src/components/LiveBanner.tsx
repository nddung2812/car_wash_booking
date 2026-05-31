import Image from "next/image";
import Link from "next/link";
import { getLiveBanner, DEFAULT_SLOT } from "@/lib/banners";

/**
 * Public promo banner — renders the admin's chosen live banner (generated in
 * the Canva banner studio) above the static hero slider. Returns null when no
 * banner is live, so the homepage falls back to the existing <BannerSlider />.
 */
export default async function LiveBanner({ slot = DEFAULT_SLOT }: { slot?: string }) {
  const banner = await getLiveBanner(slot);
  if (!banner?.cloudinaryUrl) return null;

  const width = banner.width ?? 1200;
  const height = banner.height ?? 628;
  const href = banner.href || "#booking";

  return (
    <section className="container mx-auto px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8">
      <Link
        href={href}
        aria-label={banner.altText ?? "Promotion"}
        className="block overflow-hidden rounded-2xl border border-line"
      >
        <Image
          src={banner.cloudinaryUrl}
          alt={banner.altText ?? "Promotion"}
          width={width}
          height={height}
          className="h-auto w-full"
          sizes="(min-width: 1024px) 1100px, 100vw"
          priority
        />
      </Link>
    </section>
  );
}
