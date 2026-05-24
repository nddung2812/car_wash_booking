import { NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import {
  cloudinaryConfigured,
  PRODUCTS_FOLDER,
  signUpload,
} from "@/lib/cloudinary-admin";

export async function POST() {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!cloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary credentials are not configured on the server." },
      { status: 503 },
    );
  }
  const sig = signUpload({ folder: PRODUCTS_FOLDER });
  return NextResponse.json(sig);
}
