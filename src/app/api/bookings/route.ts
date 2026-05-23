import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";
import Stripe from "stripe";
import { z } from "zod";
import { db, bookings } from "@/db";
import { ensureUserRow } from "@/lib/users";
import { listBookings } from "@/db/queries";
import {
  services,
  extraServices,
  getExtraPrice,
  type ExtraService,
} from "@/data/services";
import { LOCATIONS, SITE_URL } from "@/lib/seo/business";
import { sendBookingNotification } from "@/lib/email";
import {
  PAY_AT_COLLECTION_STATUS,
  PAY_NOW_PENDING_STATUS,
} from "@/lib/booking-payment";

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
  paymentMethod: z.enum(["pay_now", "pay_on_collection"]),
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

  // If a logged-in user isn't in the users table yet (webhook missed, or
  // Clerk re-issued the id for an existing email), sync/re-key them now so
  // the FK below holds.
  let linkedUserId: string | null = null;
  if (userId) {
    const clerkUser = await currentUser();
    if (clerkUser) {
      const primaryEmail =
        clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
          ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? null;
      const ok = await ensureUserRow({
        clerkUserId: clerkUser.id,
        email: primaryEmail,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      });
      if (ok) linkedUserId = clerkUser.id;
    }
  }

  const code = await genCode();
  const isPayNow = data.paymentMethod === "pay_now";

  const [row] = await db
    .insert(bookings)
    .values({
      confirmationCode: code,
      userId: linkedUserId,
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
      paymentMethod: data.paymentMethod,
      paymentStatus: isPayNow ? PAY_NOW_PENDING_STATUS : "unpaid",
    })
    .returning();

  const locationName =
    LOCATIONS.find((l) => l.slug === data.location)?.addressLocality ??
    data.location;

  // Pay-at-collection: confirm immediately and email now.
  if (!isPayNow) {
    void sendBookingNotification({
      confirmationCode: code,
      serviceId: data.service,
      serviceName: pricing.svc.name,
      vehicleType: data.vehicleType,
      location: locationName,
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
      paymentStatus: PAY_AT_COLLECTION_STATUS,
    });

    return NextResponse.json(
      { booking: row, redirectUrl: `/success?code=${encodeURIComponent(code)}` },
      { status: 201 }
    );
  }

  // Pay-now: create a Stripe Checkout Session. Email is deferred until the
  // success page reconciles the payment.
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return NextResponse.json(
      {
        error:
          "Online payment isn't configured yet. Please choose pay at collection.",
      },
      { status: 503 }
    );
  }

  const origin =
    req.headers.get("origin")?.replace(/\/$/, "") ??
    (req.headers.get("host")
      ? `${req.headers.get("host")!.startsWith("localhost") ? "http" : "https"}://${req.headers.get("host")}`
      : SITE_URL);

  const stripe = new Stripe(stripeSecret);

  const extrasLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    pricing.extraObjs.map((e) => ({
      quantity: 1,
      price_data: {
        currency: "aud",
        unit_amount: Math.round(getExtraPrice(e, data.vehicleType) * 100),
        product_data: {
          name: `Extra: ${e.name}`,
        },
      },
    }));

  const serviceBasePrice = +(pricing.total - pricing.extraObjs.reduce(
    (s, e) => s + getExtraPrice(e, data.vehicleType),
    0,
  )).toFixed(2);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/success?code=${encodeURIComponent(code)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book-car-wash-online?canceled=1&code=${encodeURIComponent(code)}`,
      customer_email: data.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "aud",
            unit_amount: Math.round(serviceBasePrice * 100),
            product_data: {
              name: `${pricing.svc.name} — ${data.vehicleType}`,
              description: `Booking ${code} · ${data.date} ${data.time} · ${locationName}`,
            },
          },
        },
        ...extrasLineItems,
      ],
      submit_type: "pay",
      metadata: {
        source: "car_wash_booking",
        booking_code: code,
        booking_id: row.id,
        full_name: `${data.firstName} ${data.lastName}`.trim(),
      },
      payment_intent_data: {
        metadata: {
          source: "car_wash_booking",
          booking_code: code,
          booking_id: row.id,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not start checkout. Please try again." },
        { status: 502 }
      );
    }

    await db
      .update(bookings)
      .set({ stripeSessionId: session.id })
      .where(sql`${bookings.id} = ${row.id}`);

    return NextResponse.json(
      { booking: row, checkoutUrl: session.url },
      { status: 201 }
    );
  } catch (err) {
    console.error("[bookings] Stripe error:", err);
    return NextResponse.json(
      { error: "Payment provider error. Please try again in a moment." },
      { status: 502 }
    );
  }
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
