import emailjs from "@emailjs/nodejs";

type BookingEmailParams = {
  confirmationCode: string;
  serviceId: string;
  serviceName: string;
  vehicleType: string;
  location: string;
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  notes?: string | null;
  extras: { name: string; price: number }[];
  subtotal: number;
  gst: number;
  total: number;
};

function resolveRecipient(): string | null {
  const explicit = process.env.BOOKING_NOTIFICATION_EMAIL?.trim();
  if (explicit) return explicit;
  const admin = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)[0];
  return admin ?? null;
}

export async function sendBookingNotification(params: BookingEmailParams) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    console.warn("[email] EmailJS env vars missing — skipping notification");
    return { ok: false as const, reason: "missing-config" };
  }

  const recipient = resolveRecipient();
  const submittedAt = new Date().toLocaleString("en-AU", {
    timeZone: "Australia/Brisbane",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const extrasFormatted = params.extras.length
    ? params.extras.map((e) => `${e.name} ($${e.price.toFixed(2)})`).join(", ")
    : "—";

  const templateParams = {
    confirmation_code: params.confirmationCode,
    service_id: params.serviceId,
    service_name: params.serviceName,
    vehicle_type: params.vehicleType,
    location: params.location,
    booking_date: params.date,
    booking_time: params.time,
    first_name: params.firstName,
    last_name: params.lastName,
    full_name: `${params.firstName} ${params.lastName}`.trim(),
    email: params.email,
    to_email: recipient ?? params.email,
    reply_to: params.email,
    phone: params.phone,
    address: params.address,
    notes: params.notes?.trim() ? params.notes : "—",
    extras: extrasFormatted,
    subtotal: params.subtotal.toFixed(2),
    gst: params.gst.toFixed(2),
    total: params.total.toFixed(2),
    currency: "AUD",
    submitted_at: submittedAt,
  };

  try {
    await emailjs.send(serviceId, templateId, templateParams, {
      publicKey,
      privateKey,
    });
    return { ok: true as const };
  } catch (err) {
    console.error("[email] EmailJS send failed", err);
    return { ok: false as const, reason: "send-failed", error: err };
  }
}

/* -------------------------------------------------------------------------- */
/*  Products store — customer order confirmation.                              */
/*  Separate from the booking notification above; reuses the same EmailJS      */
/*  service/keys but its own template (template_zq9r66g).                      */
/* -------------------------------------------------------------------------- */

type OrderEmailParams = {
  orderReference: string;
  customerName: string | null;
  customerEmail: string;
  items: { name: string; qty: number; amount: number }[];
  subtotal: number;
  gst: number;
  shipping: number;
  shippingAddress: string | null;
  total: number;
};

export async function sendOrderConfirmation(params: OrderEmailParams) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId =
    process.env.EMAILJS_ORDER_TEMPLATE_ID?.trim() || "template_zq9r66g";
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !publicKey || !privateKey) {
    console.warn("[email] EmailJS env vars missing — skipping order email");
    return { ok: false as const, reason: "missing-config" };
  }

  const storeReplyTo = resolveRecipient() ?? params.customerEmail;

  const orderedAt = new Date().toLocaleString("en-AU", {
    timeZone: "Australia/Brisbane",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const itemsText = params.items
    .map(
      (i) => `${i.name} × ${i.qty} — $${i.amount.toFixed(2)} AUD`
    )
    .join("\n");

  const templateParams = {
    order_reference: params.orderReference,
    full_name: params.customerName?.trim() || "there",
    email: params.customerEmail,
    to_email: params.customerEmail,
    reply_to: storeReplyTo,
    items: itemsText,
    item_count: String(
      params.items.reduce((sum, i) => sum + i.qty, 0)
    ),
    subtotal: params.subtotal.toFixed(2),
    gst: params.gst.toFixed(2),
    shipping: params.shipping.toFixed(2),
    shipping_address: params.shippingAddress?.trim() || "—",
    total: params.total.toFixed(2),
    currency: "AUD",
    order_date: orderedAt,
    pickup_locations: "Shailer Park or Loganholme",
  };

  try {
    await emailjs.send(serviceId, templateId, templateParams, {
      publicKey,
      privateKey,
    });
    return { ok: true as const };
  } catch (err) {
    console.error("[email] order confirmation send failed", err);
    return { ok: false as const, reason: "send-failed", error: err };
  }
}
