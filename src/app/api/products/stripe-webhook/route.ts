import { NextResponse } from "next/server";
import Stripe from "stripe";

import { deliverOrderConfirmation } from "@/lib/order-confirmation";

// Stripe needs the raw, unparsed body to verify the signature.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !webhookSecret) {
    // Webhook not configured — the success page still sends the email.
    return NextResponse.json({ received: true, handled: false });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const stripe = new Stripe(secret);
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const { result } = await deliverOrderConfirmation(stripe, session.id);
    return NextResponse.json({ received: true, result });
  }

  return NextResponse.json({ received: true });
}
