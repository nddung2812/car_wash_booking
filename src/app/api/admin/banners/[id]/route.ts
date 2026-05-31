import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isCurrentUserAdmin } from "@/lib/auth";
import { getBannerRow, deleteBanner } from "@/lib/banners";
import { destroyAsset } from "@/lib/cloudinary-admin";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;

  const banner = await getBannerRow(id);
  if (!banner) {
    return NextResponse.json({ error: "Banner not found" }, { status: 404 });
  }

  if (banner.cloudinaryPublicId) {
    try {
      await destroyAsset(banner.cloudinaryPublicId);
    } catch (err) {
      // Best-effort: still drop the row even if Cloudinary cleanup fails.
      console.error("[admin/banners DELETE] Cloudinary destroy failed:", err);
    }
  }

  await deleteBanner(id);
  if (banner.isLive) {
    revalidatePath("/");
    revalidatePath("/", "layout");
  }
  return NextResponse.json({ ok: true });
}