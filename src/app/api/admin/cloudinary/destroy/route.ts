import { NextResponse } from "next/server";
import { z } from "zod";
import { isCurrentUserAdmin } from "@/lib/auth";
import { destroyAsset } from "@/lib/cloudinary-admin";

const bodySchema = z.object({ publicId: z.string().min(1) });

export async function POST(req: Request) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  try {
    await destroyAsset(parsed.data.publicId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/cloudinary/destroy]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Destroy failed" },
      { status: 502 },
    );
  }
}
