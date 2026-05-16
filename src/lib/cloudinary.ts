// Server-only helper: lists the "before-after" Cloudinary folder and pairs
// images into before/after sets for the Full Detail showcase carousel.
//
// Two ways to organise uploads (both case-insensitive; "-"/"_"/space accepted):
//
//   1. One subfolder per slide (recommended) — put a "before" image and an
//      "after" image inside before-after/<slide>/ :
//        before-after/slide-1/before-1.jpg
//        before-after/slide-1/after-1.jpg
//      The slide label is derived from the subfolder name ("Slide 1").
//
//   2. Flat pair — two files directly in before-after/ sharing a base name
//      with a before/after token:
//        before-after/mercedes-c200-before.jpg
//        before-after/mercedes-c200-after.jpg
//
// In both cases the image whose name contains "before" is the before shot and
// "after" the after shot. Unpaired files are ignored. New uploads appear
// within ~1h (ISR revalidate) without a redeploy.

export const BEFORE_AFTER_FOLDER = "before-after";

export type BeforeAfterPair = {
  id: string;
  label: string;
  beforeUrl: string;
  afterUrl: string;
  // Natural width/height ratio of each source image, so mobile can show the
  // full uncropped image at its real proportions.
  beforeRatio: number;
  afterRatio: number;
};

type CloudinaryResource = {
  public_id: string;
  secure_url: string;
  display_name?: string;
  filename?: string;
  folder?: string;
  asset_folder?: string;
  width?: number;
  height?: number;
};

const CLOUD =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  "";
const API_KEY = process.env.CLOUDINARY_API_KEY || "";
const API_SECRET = process.env.CLOUDINARY_API_SECRET || "";

// Baked-in delivery transform. Optimised + capped so we never ship a huge
// image: f_auto (AVIF/WebP), q_auto (auto quality), c_limit + w/h 1400 scales
// DOWN only — no upscaling, no crop (full height kept), and neither dimension
// can exceed 1400px (well under 4K). No dpr_auto on purpose: it would multiply
// 1400 by the device pixel ratio and reintroduce 4K-class downloads.
const DELIVERY_TX = "f_auto,q_auto,c_limit,w_1400,h_1400";

function withTransform(secureUrl: string): string {
  return secureUrl.replace("/upload/", `/upload/${DELIVERY_TX}/`);
}

function rawName(r: CloudinaryResource): string {
  return (
    r.display_name ||
    r.filename ||
    r.public_id.split("/").pop() ||
    r.public_id
  ).trim();
}

// Detects which half of the pair a filename is. Matches "before"/"after"
// anywhere in the name (before-1, 1-after, mercedes-before, …).
function detectPhase(name: string): "before" | "after" | null {
  const hasBefore = /before/i.test(name);
  const hasAfter = /after/i.test(name);
  if (hasBefore === hasAfter) return null; // neither, or ambiguous (both)
  return hasBefore ? "before" : "after";
}

// Folder path of a resource relative to before-after/ ("" if it sits directly
// in before-after). Works for both classic (path in public_id) and dynamic
// (asset_folder) folder modes.
function relativeFolder(r: CloudinaryResource): string {
  let path = r.asset_folder || r.folder || "";
  if (!path && r.public_id.includes("/")) {
    path = r.public_id.slice(0, r.public_id.lastIndexOf("/"));
  }
  path = path.replace(/^\/+|\/+$/g, "");
  if (path === BEFORE_AFTER_FOLDER) return "";
  if (path.startsWith(`${BEFORE_AFTER_FOLDER}/`)) {
    return path.slice(BEFORE_AFTER_FOLDER.length + 1);
  }
  return path; // dynamic folders sometimes report the path without the prefix
}

function humanize(key: string): string {
  const cleaned = key
    .replace(/[/_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "Full detail";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export async function getBeforeAfterPairs(): Promise<BeforeAfterPair[]> {
  if (!CLOUD || !API_KEY || !API_SECRET) return [];

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD}/resources/search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64"),
        },
        body: JSON.stringify({
          // Match the folder itself and any subfolder, in either folder mode.
          // Unquoted `:` glob is required for subfolder matching; `display_name`
          // is returned by default (it is not a valid `with_field` option).
          expression:
            `(asset_folder:${BEFORE_AFTER_FOLDER}/* OR folder:${BEFORE_AFTER_FOLDER}/*` +
            ` OR asset_folder=${BEFORE_AFTER_FOLDER} OR folder=${BEFORE_AFTER_FOLDER})` +
            ` AND resource_type:image`,
          max_results: 100,
          sort_by: [{ public_id: "asc" }],
        }),
        // 60s ISR: new Cloudinary uploads surface within a minute (one Admin
        // API call/min at most — well within rate limits — shared across pages).
        next: { revalidate: 60 },
      },
    );

    if (!res.ok) return [];

    const data = (await res.json()) as { resources?: CloudinaryResource[] };
    const resources = data.resources ?? [];

    type Shot = { url: string; ratio: number };
    const groups = new Map<
      string,
      { label: string; before?: Shot; after?: Shot }
    >();

    for (const r of resources) {
      const name = rawName(r);
      const phase = detectPhase(name);
      if (!phase) continue;

      const sub = relativeFolder(r);
      // Subfolder → that subfolder is the slide. Flat file → group by the
      // base name with the before/after token stripped out.
      const key = sub
        ? sub.toLowerCase()
        : name
            .replace(/(^|[\s_-])(before|after)([\s_-]|$)/i, "$1$3")
            .replace(/[\s_-]+$/g, "")
            .replace(/^[\s_-]+/g, "")
            .toLowerCase() || name.toLowerCase();

      const ratio =
        r.width && r.height ? r.width / r.height : 4 / 3;
      const group = groups.get(key) ?? { label: humanize(key) };
      group[phase] = { url: withTransform(r.secure_url), ratio };
      groups.set(key, group);
    }

    const pairs: BeforeAfterPair[] = [];
    for (const [key, g] of groups) {
      if (g.before && g.after) {
        pairs.push({
          id: key,
          label: g.label,
          beforeUrl: g.before.url,
          afterUrl: g.after.url,
          beforeRatio: g.before.ratio,
          afterRatio: g.after.ratio,
        });
      }
    }

    // Natural sort so slide-2 comes before slide-10.
    return pairs.sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { numeric: true }),
    );
  } catch {
    return [];
  }
}
