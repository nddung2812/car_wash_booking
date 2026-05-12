import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { db, bookings, users } from "@/db";
import { listBookings } from "@/db/queries";
import {
  services,
  extraServices,
  getExtraPrice,
  type ExtraService,
} from "@/data/services";
import { sendBookingNotification } from "@/lib/email";

const bodySchema = z.object({
  service: z.string().min(1),
  location: z.string().min(1),
  vehicleType: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(5),
  notes: z.string().optional(),
  extras: z.array(z.string()).default([]),
});

function priceFor(serviceId: string, vehicleType: string, extras: string[]) {
  const svc = services.find((s) => s.id === serviceId);
  if (!svc) return null;

  const extraObjs: ExtraService[] = [];
  for (const id of extras) {
    const found = extraServices.find((e) => e.id === id);
    if (!found) return null;
    extraObjs.push(found);
  }

  const v = vehicleType.toLowerCase();
  const servicePrice =
    v.includes("suv") || v.includes("4x4")
      ? svc.pricing.suv
      : v.includes("wagon")
        ? svc.pricing.wagon
        : svc.pricing.sedan;
  const extrasSubtotal = extraObjs.reduce(
    (sum, e) => sum + getExtraPrice(e, vehicleType),
    0,
  );
  const total = +(servicePrice + extrasSubtotal).toFixed(2);
  const gst = +(total / 11).toFixed(2);
  const subtotal = +(total - gst).toFixed(2);
  return { svc, extraObjs, subtotal, gst, total };
}

async function genCode() {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Brisbane",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date());
  const dd = parts.find((p) => p.type === "day")!.value;
  const mm = parts.find((p) => p.type === "month")!.value;
  const yyyy = parts.find((p) => p.type === "year")!.value;
  const prefix = `LCW-${dd}/${mm}/${yyyy}-`;

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .where(sql`${bookings.confirmationCode} LIKE ${prefix + "%"}`);

  const next = (row?.count ?? 0) + 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

function isAdmin(email: string | null | undefined) {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const pricing = priceFor(data.service, data.vehicleType, data.extras);
  if (!pricing) {
    return NextResponse.json({ error: "Unknown service or extra" }, { status: 400 });
  }

  const { userId } = await auth();

  // If a logged-in user isn't in the users table yet (webhook missed), sync them now
  if (userId) {
    const clerkUser = await currentUser();
    if (clerkUser) {
      const primaryEmail =
        clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
          ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? null;
      if (primaryEmail) {
        await db
          .insert(users)
          .values({
            id: clerkUser.id,
            email: primaryEmail,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            imageUrl: clerkUser.imageUrl,
          })
          .onConflictDoNothing();
      }
    }
  }

  const code = await genCode();

  const [row] = await db
    .insert(bookings)
    .values({
      confirmationCode: code,
      userId: userId ?? null,
      serviceId: data.service,
      serviceName: pricing.svc.name,
      vehicleType: data.vehicleType,
      location: data.location,
      date: data.date,
      time: data.time,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      notes: data.notes ?? null,
      extras: data.extras,
      subtotal: pricing.subtotal.toFixed(2),
      gst: pricing.gst.toFixed(2),
      total: pricing.total.toFixed(2),
      status: "pending",
    })
    .returning();

  void sendBookingNotification({
    confirmationCode: code,
    serviceId: data.service,
    serviceName: pricing.svc.name,
    vehicleType: data.vehicleType,
    location: data.location,
    date: data.date,
    time: data.time,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    address: data.address,
    notes: data.notes ?? null,
    extras: pricing.extraObjs.map((e) => ({
      name: e.name,
      price: getExtraPrice(e, data.vehicleType),
    })),
    subtotal: pricing.subtotal,
    gst: pricing.gst,
    total: pricing.total,
  });

  return NextResponse.json({ booking: row }, { status: 201 });
}

export async function GET() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!isAdmin(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const rows = await listBookings(200);
  return NextResponse.json({ bookings: rows });
}
