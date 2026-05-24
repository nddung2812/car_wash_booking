import { NextResponse } from "next/server";
import { z } from "zod";
import { isCurrentUserAdmin } from "@/lib/auth";
import { destroyAsset, publicIdFromUrl } from "@/lib/cloudinary-admin";

const bodySchema = z
  .object({
    publicId: z.string().min(1).optional(),
    url: z.string().url().optional(),
  })
  .refine((b) => b.publicId || b.url, {
    message: "publicId or url required",
  });

export async function POST(req: Request) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const publicId =
    parsed.data.publicId ??
    (parsed.data.url ? publicIdFromUrl(parsed.data.url) : null);
  if (!publicId) {
    return NextResponse.json(
      { error: "Could not derive Cloudinary public_id" },
      { status: 400 },
    );
  }
  try {
    await destroyAsset(publicId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/cloudinary/destroy]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Destroy failed" },
      { status: 502 },
    );
  }
}
