import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { z } from "zod";

import { getProductById } from "@/lib/products";
import { SITE_URL } from "@/lib/seo/business";
import {
  SHIPPING_COUNTRIES,
  SHIPPING_DELIVERY_DAYS,
  SHIPPING_FEE_CENTS,
  SHIPPING_LABEL,
} from "@/lib/shipping";

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        qty: z.number().int().positive().max(20),
      })
    )
    .min(1)
    .max(50),
});

function resolveOrigin(req: Request): string {
  const origin = req.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");
  const host = req.headers.get("host");
  if (host) {
    const proto = host.startsWith("localhost") ? "http" : "https";
    return `${proto}://${host}`;
  }
  return SITE_URL;
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      {
        error:
          "Payments aren't configured yet. Add STRIPE_SECRET_KEY to enable card checkout.",
      },
      { status: 503 }
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Your cart could not be read. Please try again." },
      { status: 400 }
    );
  }

  // Never trust client pricing — resolve every line against the catalogue.
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const item of parsed.data.items) {
    const product = getProductById(item.id);
    if (!product) {
      return NextResponse.json(
        { error: "One of the items is no longer available." },
        { status: 409 }
      );
    }
    if (!product.inStock) {
      return NextResponse.json(
        { error: `${product.name} is currently sold out.` },
        { status: 409 }
      );
    }
    lineItems.push({
      quantity: item.qty,
      price_data: {
        currency: "aud",
        unit_amount: Math.round(product.price * 100),
        product_data: {
          name: product.name,
          description: product.tagline,
          images: [product.image],
          metadata: { product_id: product.id, sku: product.sku ?? product.id },
        },
      },
    });
  }

  const origin = resolveOrigin(req);
  const stripe = new Stripe(secret);

  // Reuse Clerk profile if signed in — but guests can still check out.
  const clerkUser = await currentUser().catch(() => null);
  const clerkEmail = clerkUser
    ? clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      null
    : null;
  const clerkFullName = clerkUser
    ? [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() || clerkUser.fullName?.trim() || null
    : null;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/products/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/products/checkout?canceled=1`,
      billing_address_collection: "auto",
      phone_number_collection: { enabled: true },
      shipping_address_collection: {
        allowed_countries: [...SHIPPING_COUNTRIES],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: SHIPPING_LABEL,
            fixed_amount: { amount: SHIPPING_FEE_CENTS, currency: "aud" },
            delivery_estimate: {
              minimum: { unit: "business_day", value: SHIPPING_DELIVERY_DAYS.min },
              maximum: { unit: "business_day", value: SHIPPING_DELIVERY_DAYS.max },
            },
          },
        },
      ],
      automatic_tax: { enabled: false },
      submit_type: "pay",
      // Prefill the email for signed-in customers (Stripe still collects it
      // from guests on the hosted page).
      ...(clerkEmail ? { customer_email: clerkEmail } : {}),
      metadata: {
        source: "products_store",
        item_count: String(
          parsed.data.items.reduce((sum, i) => sum + i.qty, 0)
        ),
        ...(clerkFullName ? { full_name: clerkFullName } : {}),
        ...(clerkUser ? { clerk_user_id: clerkUser.id } : {}),
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not start checkout. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[products/checkout] Stripe error:", err);
    return NextResponse.json(
      { error: "Payment provider error. Please try again in a moment." },
      { status: 502 }
    );
  }
}
