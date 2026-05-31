import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isCurrentUserAdmin } from "@/lib/auth";
import { getBannerRow, setBannerLive } from "@/lib/banners";

export async function POST(
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
  if (banner.status !== "ready") {
    return NextResponse.json(
      { error: "Only a ready banner can be set live." },
      { status: 409 },
    );
  }

  const row = await setBannerLive(id, banner.slot);
  // Public homepage reads the live banner — refresh it.
  revalidatePath("/");
  revalidatePath("/", "layout");
  return NextResponse.json({ banner: row });
}