import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";
import Stripe from "stripe";
import { z } from "zod";
import { db, bookings } from "@/db";
import { ensureUserRow } from "@/lib/users";
import { listBookings } from "@/db/queries";
import { getExtraPrice, type ExtraService } from "@/data/services";
import { getMergedPricing } from "@/lib/pricing";
import { LOCATIONS, SITE_URL } from "@/lib/seo/business";
import { sendBookingNotification } from "@/lib/email";
import {
  OFFERED_PAYMENT_METHODS,
  PAY_AT_COLLECTION_STATUS,
  PAY_NOW_PENDING_STATUS,
  PAYMENT_STATUS_UNPAID,
  SUPPORT_EMAIL,
  amountDueNow,
  balanceDue,
  type PaymentMethod,
} from "@/lib/booking-payment";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isValidAuPhone } from "@/lib/phone";
import { isAdminEmail } from "@/lib/auth";

const bodySchema = z.object({
  service: z.string().min(1),
  location: z.string().min(1),
  vehicleType: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z
    .string()
    .min(10)
    .refine(isValidAuPhone, "Enter a valid Australian phone number"),
  address: z.string().min(5),
  notes: z.string().optional(),
  extras: z.array(z.string()).default([]),
  // Only the currently-offered methods are accepted. While deposits are on,
  // this is what stops a crafted request from booking a slot for free.
  paymentMethod: z.enum(
    OFFERED_PAYMENT_METHODS as readonly [PaymentMethod, ...PaymentMethod[]],
  ),
});

// Lock checkout redirect URLs to the configured site URL in production so
// a spoofed Host/Origin header can't redirect a paying customer elsewhere.
function getCheckoutOrigin(req: Request): string {
  if (process.env.NODE_ENV === "production") return SITE_URL;
  const origin = req.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");
  const host = req.headers.get("host");
  if (host) {
    const proto = host.startsWith("localhost") ? "http" : "https";
    return `${proto}://${host}`;
  }
  return SITE_URL;
}

async function priceFor(serviceId: string, vehicleType: string, extras: string[]) {
  const { services, extras: extrasCatalogue } = await getMergedPricing();
  const svc = services.find((s) => s.id === serviceId);
  if (!svc) return null;

  const extraObjs: ExtraService[] = [];
  for (const id of extras) {
    const found = extrasCatalogue.find((e) => e.id === id);
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

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`bookings:${ip}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const pricing = await priceFor(data.service, data.vehicleType, data.extras);
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
  // Both "pay now" and "deposit" take money up front — they differ only in how
  // much. Anything else settles entirely at collection.
  const dueNow = amountDueNow(data.paymentMethod, pricing.total);
  const needsCheckout = dueNow > 0;
  const isDeposit = data.paymentMethod === "deposit";
  const balanceAtCollection = balanceDue(pricing.total, dueNow);

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
      paymentStatus: needsCheckout ? PAY_NOW_PENDING_STATUS : PAYMENT_STATUS_UNPAID,
      depositAmount: dueNow.toFixed(2),
      amountPaid: "0.00",
    })
    .returning();

  const locationName =
    LOCATIONS.find((l) => l.slug === data.location)?.addressLocality ??
    data.location;

  // Pay-at-collection: confirm immediately and email now. Only reachable with
  // DEPOSIT_ENABLED off — the zod enum rejects the method otherwise.
  if (!needsCheckout) {
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

  // Deposit / pay-now: create a Stripe Checkout Session. Email is deferred
  // until the payment is reconciled (success page, or the booking webhook if
  // the customer closes the tab).

  // Leaves no stranded pending_payment row behind when checkout can't start.
  // Cancelled rather than deleted: genCode() derives the daily sequence from
  // count(*), so removing a row would collide the next code with an existing one.
  const abandon = () =>
    db
      .update(bookings)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(sql`${bookings.id} = ${row.id}`);

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    await abandon();
    return NextResponse.json(
      {
        error: `Card payment isn't available right now. Please call us or email ${SUPPORT_EMAIL} and we'll book you in.`,
      },
      { status: 503 }
    );
  }

  const origin = getCheckoutOrigin(req);

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

  // A deposit is one line for the part-payment; paying in full itemises the
  // wash and each extra the way it always has.
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = isDeposit
    ? [
        {
          quantity: 1,
          price_data: {
            currency: "aud",
            unit_amount: Math.round(dueNow * 100),
            product_data: {
              name: `Booking deposit — ${pricing.svc.name}`,
              description: `${code} · ${data.date} ${data.time} · ${locationName} · $${balanceAtCollection.toFixed(2)} balance due at collection`,
            },
          },
        },
      ]
    : [
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
      ];

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/success?code=${encodeURIComponent(code)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book-car-wash-online?canceled=1&code=${encodeURIComponent(code)}`,
      customer_email: data.email,
      line_items: lineItems,
      submit_type: "pay",
      // Abandoned checkouts expire instead of holding a pending_payment row
      // open forever; the booking webhook cancels the row when they do.
      // Stripe requires at least 30 minutes — 35 leaves clock-skew headroom.
      expires_at: Math.floor(Date.now() / 1000) + 35 * 60,
      metadata: {
        source: "car_wash_booking",
        booking_code: code,
        booking_id: row.id,
        full_name: `${data.firstName} ${data.lastName}`.trim(),
        payment_kind: data.paymentMethod,
        amount_due_now_cents: String(Math.round(dueNow * 100)),
        booking_total_cents: String(Math.round(pricing.total * 100)),
      },
      payment_intent_data: {
        metadata: {
          source: "car_wash_booking",
          booking_code: code,
          booking_id: row.id,
          payment_kind: data.paymentMethod,
        },
      },
    });

    if (!session.url) {
      await abandon();
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
    await abandon().catch(() => {});
    return NextResponse.json(
      { error: "Payment provider error. Please try again in a moment." },
      { status: 502 }
    );
  }
}

export async function GET() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!isAdminEmail(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const rows = await listBookings(200);
  return NextResponse.json({ bookings: rows });
}
