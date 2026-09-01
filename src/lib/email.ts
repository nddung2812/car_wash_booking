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
  paymentStatus: string;
  /** Send to this address instead of the admin/notification inbox. */
  recipientOverride?: string | null;
};

/** Display name customers see in their inbox. EmailJS template "From Name"
 *  must be set to {{from_name}} for this to take effect. */
const BUSINESS_FROM_NAME = "Logan Car Wash Support";

/**
 * EmailJS can transiently 5xx. Three attempts with a short backoff before we
 * give up — the caller then records the failure so it can be retried later.
 */
async function sendWithRetry(
  serviceId: string,
  templateId: string,
  templateParams: Record<string, unknown>,
  keys: { publicKey: string; privateKey: string },
  label: string,
) {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await emailjs.send(serviceId, templateId, templateParams, keys);
      if (attempt > 1) {
        console.log(`[email] ${label} sent on attempt ${attempt}`);
      }
      return { ok: true as const };
    } catch (err) {
      lastErr = err;
      console.error(`[email] ${label} attempt ${attempt}/3 failed`, err);
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 400));
      }
    }
  }
  return { ok: false as const, reason: "send-failed" as const, error: lastErr };
}

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

  // A recipientOverride means this is customer-facing: the business becomes
  // the sender/reply-to. Without it we keep the original internal-notification
  // behaviour (to the admin inbox, reply-to the customer).
  const businessInbox = resolveRecipient();
  const customerFacing = Boolean(params.recipientOverride?.trim());
  const recipient = params.recipientOverride?.trim() || businessInbox;
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
    reserved_date: params.date,
    reserved_time: params.time,
    first_name: params.firstName,
    last_name: params.lastName,
    full_name: `${params.firstName} ${params.lastName}`.trim(),
    email: params.email,
    to_email: recipient ?? params.email,
    from_name: BUSINESS_FROM_NAME,
    reply_to: customerFacing ? (businessInbox ?? params.email) : params.email,
    phone: params.phone,
    address: params.address,
    notes: params.notes?.trim() ? params.notes : "—",
    extras: extrasFormatted,
    subtotal: params.subtotal.toFixed(2),
    gst: params.gst.toFixed(2),
    total: params.total.toFixed(2),
    currency: "AUD",
    submitted_at: submittedAt,
    payment_status: params.paymentStatus,
  };

  return sendWithRetry(
    serviceId,
    templateId,
    templateParams,
    { publicKey, privateKey },
    `booking ${params.confirmationCode} → ${recipient ?? params.email}`,
  );
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

  return sendWithRetry(
    serviceId,
    templateId,
    templateParams,
    { publicKey, privateKey },
    `order ${params.orderReference} → ${params.customerEmail}`,
  );
}

/* -------------------------------------------------------------------------- */
/*  Generic one-off customer message.                                          */
/*  Plain subject + body, for service notices and apologies. Uses its own      */
/*  EmailJS template (EMAILJS_MESSAGE_TEMPLATE_ID) with just five variables:   */
/*  {{to_email}} {{from_name}} {{reply_to}} {{subject}} {{message}}            */
/* -------------------------------------------------------------------------- */

type CustomerMessageParams = {
  toEmail: string;
  subject: string;
  message: string;
};

export async function sendCustomerMessage(params: CustomerMessageParams) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_MESSAGE_TEMPLATE_ID?.trim();
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !publicKey || !privateKey) {
    console.warn("[email] EmailJS env vars missing — skipping customer message");
    return { ok: false as const, reason: "missing-config" };
  }
  if (!templateId) {
    console.warn("[email] EMAILJS_MESSAGE_TEMPLATE_ID not set");
    return { ok: false as const, reason: "missing-template" };
  }

  return sendWithRetry(
    serviceId,
    templateId,
    {
      to_email: params.toEmail,
      from_name: BUSINESS_FROM_NAME,
      reply_to: resolveRecipient() ?? params.toEmail,
      subject: params.subject,
      message: params.message,
    },
    { publicKey, privateKey },
    `message → ${params.toEmail}`,
  );
}
