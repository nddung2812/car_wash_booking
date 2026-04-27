import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { db, bookings } from "@/db";
import { listBookings } from "@/db/queries";
import { services } from "@/data/services";
import { sendBookingNotification } from "@/lib/email";

const bodySchema = z.object({
  service: z.string().min(1),
  vehicleType: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(5),
  notes: z.string().optional(),
});

function priceFor(serviceId: string, vehicleType: string) {
  const svc = services.find((s) => s.id === serviceId);
  if (!svc) return null;
  const v = vehicleType.toLowerCase();
  const subtotal =
    v.includes("suv") || v.includes("4x4")
      ? svc.pricing.suv
      : v.includes("wagon")
        ? svc.pricing.wagon
        : svc.pricing.sedan;
  const gst = +(subtotal * 0.1).toFixed(2);
  const total = +(subtotal + gst).toFixed(2);
  return { svc, subtotal, gst, total };
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
  const pricing = priceFor(data.service, data.vehicleType);
  if (!pricing) {
    return NextResponse.json({ error: "Unknown service" }, { status: 400 });
  }

  const { userId } = await auth();
  const code = await genCode();

  const [row] = await db
    .insert(bookings)
    .values({
      confirmationCode: code,
      userId: userId ?? null,
      serviceId: data.service,
      serviceName: pricing.svc.name,
      vehicleType: data.vehicleType,
      date: data.date,
      time: data.time,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      notes: data.notes ?? null,
      extras: [],
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
    date: data.date,
    time: data.time,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    address: data.address,
    notes: data.notes ?? null,
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
