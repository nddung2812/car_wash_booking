type LoaderArgs = { src: string; width: number; quality?: number };

const FALLBACK_SITE_URL = "https://logancarwash.com.au";

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: LoaderArgs): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || FALLBACK_SITE_URL;

  if (!cloud || process.env.NODE_ENV === "development") {
    return src;
  }

  const absoluteSrc = src.startsWith("http")
    ? src
    : `${siteUrl}${src.startsWith("/") ? "" : "/"}${src}`;

  const params = [
    "f_auto",
    "c_limit",
    `w_${width}`,
    `q_${quality ?? "auto"}`,
    "dpr_auto",
  ].join(",");

  return `https://res.cloudinary.com/${cloud}/image/fetch/${params}/${encodeURIComponent(
    absoluteSrc
  )}`;
}
