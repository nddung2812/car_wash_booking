import { headers } from "next/headers";
import { Webhook } from "svix";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

type ClerkEmail = { id: string; email_address: string };
type ClerkPhone = { id: string; phone_number: string };
type ClerkUserData = {
  id: string;
  email_addresses: ClerkEmail[];
  primary_email_address_id: string | null;
  phone_numbers: ClerkPhone[];
  primary_phone_number_id: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
};
type ClerkEvent =
  | { type: "user.created" | "user.updated"; data: ClerkUserData }
  | { type: "user.deleted"; data: { id: string } }
  | { type: string; data: unknown };

function primaryEmail(data: ClerkUserData): string | null {
  const primary = data.email_addresses.find((e) => e.id === data.primary_email_address_id);
  return primary?.email_address ?? data.email_addresses[0]?.email_address ?? null;
}

function primaryPhone(data: ClerkUserData): string | null {
  const primary = data.phone_numbers?.find((p) => p.id === data.primary_phone_number_id);
  return primary?.phone_number ?? data.phone_numbers?.[0]?.phone_number ?? null;
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("CLERK_WEBHOOK_SECRET not configured", { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(secret);
  let evt: ClerkEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkEvent;
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const data = evt.data as ClerkUserData;
    const email = primaryEmail(data);
    if (!email) {
      return new Response("User has no email", { status: 400 });
    }
    const phone = primaryPhone(data);
    await db
      .insert(users)
      .values({
        id: data.id,
        email,
        phone,
        firstName: data.first_name,
        lastName: data.last_name,
        imageUrl: data.image_url,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email,
          phone,
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url,
          updatedAt: new Date(),
        },
      });
  } else if (evt.type === "user.deleted") {
    const data = evt.data as { id: string };
    await db.delete(users).where(eq(users.id, data.id));
  }

  return new Response("ok", { status: 200 });
}
