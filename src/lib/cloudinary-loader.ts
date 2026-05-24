type LoaderArgs = { src: string; width: number; quality?: number };

const FALLBACK_SITE_URL = "https://logancarwash.com.au";

const TRANSFORM_PARAMS = (width: number, quality: number | "auto") =>
  ["f_auto", "c_limit", `w_${width}`, `q_${quality}`, "dpr_auto"].join(",");

/**
 * Match URLs already on our own Cloudinary upload bucket. Those need inline
 * path-based transformations — wrapping them in /image/fetch/ would route
 * the request back through Cloudinary's external-fetch proxy, which 4xxs
 * (Cloudinary refuses to fetch URLs from its own domain by default).
 */
function ownCloudinaryUploadUrl(
  src: string,
  cloud: string,
): { prefix: string; rest: string } | null {
  const re = new RegExp(
    `^(https://res\\.cloudinary\\.com/${cloud}/image/upload/)(.+)$`,
  );
  const m = src.match(re);
  if (!m) return null;
  return { prefix: m[1], rest: m[2] };
}

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

  const params = TRANSFORM_PARAMS(width, quality ?? "auto");

  // Case 1: already on our Cloudinary — transform inline on the upload path.
  const own = ownCloudinaryUploadUrl(src, cloud);
  if (own) {
    // Strip any existing transformation segment so params don't stack on
    // re-renders. A path segment is a transformation iff it's a comma-joined
    // list of `x_…` tokens (matches Cloudinary's well-known param syntax).
    const rest = own.rest.replace(/^[a-z]_[^/]+(?:,[a-z]_[^/]+)*\//, "");
    return `${own.prefix}${params}/${rest}`;
  }

  // Case 2: external URL — proxy through Cloudinary fetch.
  const absoluteSrc = src.startsWith("http")
    ? src
    : `${siteUrl}${src.startsWith("/") ? "" : "/"}${src}`;

  return `https://res.cloudinary.com/${cloud}/image/fetch/${params}/${encodeURIComponent(
    absoluteSrc,
  )}`;
}
