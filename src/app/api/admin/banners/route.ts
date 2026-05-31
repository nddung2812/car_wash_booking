import { NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import { listBannerRows } from "@/lib/banners";

export async function GET() {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const banners = await listBannerRows();
  return NextResponse.json({ banners });
}