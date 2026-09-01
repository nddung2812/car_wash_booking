/**
 * Booking-email backfill and safety net.
 *
 * Two modes:
 *
 *   --missing   Sweep for bookings whose confirmation never landed — i.e.
 *               admin_email_sent_at or customer_email_sent_at is still null.
 *               This is the guarantee: if EmailJS is down when someone books,
 *               the gap is recorded on the row and this picks it up later.
 *               Idempotent — a successful send stamps the row, so re-running
 *               skips it.
 *
 *   <codes>     Re-send specific bookings by confirmation code.
 *
 * Always previews first; nothing sends without --send.
 *
 *   npx tsx --env-file=.env.local scripts/resend-booking-emails.ts --missing
 *   npx tsx --env-file=.env.local scripts/resend-booking-emails.ts --missing --send
 *   npx tsx --env-file=.env.local scripts/resend-booking-emails.ts LCW-01/09/2026-001 --send --to customer
 *
 * Safety rail: bookings whose date has already passed are skipped unless you
 * pass --include-past. Confirming a wash that happened last week only confuses
 * the customer.
 */
import { and, gte, isNull, or, sql } from "drizzle-orm";

import { db, bookings } from "../src/db";
import { getBookingByCode } from "../src/db/queries";
import { deliverBookingEmails } from "../src/lib/booking-notify";
import { sendBookingNotification } from "../src/lib/email";
import { getMergedExtras } from "../src/lib/pricing";
import { getExtraPrice } from "../src/data/services";
import { LOCATIONS } from "../src/lib/seo/business";
import {
  PAY_AT_COLLECTION_STATUS,
  PAY_NOW_PAID_STATUS,
} from "../src/lib/booking-payment";

const argv = process.argv.slice(2);
const send = argv.includes("--send");
const missing = argv.includes("--missing");
const includePast = argv.includes("--include-past");
const codes = argv.filter((a) => a.startsWith("LCW-"));

const daysIdx = argv.indexOf("--days");
const days = daysIdx !== -1 ? Number(argv[daysIdx + 1]) : 7;

const toIdx = argv.indexOf("--to");
const target = toIdx !== -1 ? argv[toIdx + 1] : "both";

if (!["customer", "business", "both"].includes(target)) {
  console.error(`--to must be customer, business or both (got "${target}")`);
  process.exit(1);
}
if (!missing && codes.length === 0) {
  console.error("Pass --missing, or one or more codes e.g. LCW-01/09/2026-001");
  process.exit(1);
}
if (Number.isNaN(days) || days <= 0) {
  console.error(`--days must be a positive number (got "${argv[daysIdx + 1]}")`);
  process.exit(1);
}

type Booking = NonNullable<Awaited<ReturnType<typeof getBookingByCode>>>;

async function emailParams(booking: Booking) {
  const extraCatalogue = await getMergedExtras();
  const extras = (booking.extras ?? [])
    .map((id) => extraCatalogue.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))
    .map((e) => ({
      name: e.name,
      price: getExtraPrice(e, booking.vehicleType),
    }));

  return {
    confirmationCode: booking.confirmationCode,
    serviceId: booking.serviceId,
    serviceName: booking.serviceName ?? booking.serviceId,
    vehicleType: booking.vehicleType,
    location:
      LOCATIONS.find((l) => l.slug === booking.location)?.addressLocality ??
      booking.location,
    date: booking.date,
    time: booking.time,
    firstName: booking.firstName,
    lastName: booking.lastName,
    email: booking.email,
    phone: booking.phone,
    address: booking.address,
    notes: booking.notes,
    extras,
    subtotal: Number(booking.subtotal),
    gst: Number(booking.gst),
    total: Number(booking.total),
    paymentStatus:
      booking.paymentStatus === "paid"
        ? PAY_NOW_PAID_STATUS
        : PAY_AT_COLLECTION_STATUS,
  };
}

// Brisbane, not UTC — at 9am local the UTC date is still yesterday, which
// would treat a past booking as upcoming.
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Australia/Brisbane",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

async function collect(): Promise<Booking[]> {
  if (!missing) {
    const found: Booking[] = [];
    for (const code of codes) {
      const b = await getBookingByCode(code);
      if (!b) console.error(`✗ ${code} — not found`);
      else found.push(b);
    }
    return found;
  }

  const cutoff = new Date(Date.now() - days * 86_400_000);
  return db
    .select()
    .from(bookings)
    .where(
      and(
        gte(bookings.createdAt, cutoff),
        or(
          isNull(bookings.adminEmailSentAt),
          isNull(bookings.customerEmailSentAt),
        ),
        // A pay-now booking that was never paid should not be confirmed.
        sql`${bookings.paymentStatus} <> 'pending_payment'`,
      ),
    ) as unknown as Promise<Booking[]>;
}

async function main() {
  const rows = await collect();
  const scope = missing
    ? `unsent confirmations from the last ${days} day(s)`
    : `${codes.length} booking(s) by code`;

  console.log(
    `${send ? "SENDING" : "DRY RUN (nothing sent — add --send)"} · ${scope} · recipients: ${target}\n`,
  );

  if (rows.length === 0) {
    console.log("Nothing to do — every booking in scope has its emails.");
    return;
  }

  let sent = 0;
  let skipped = 0;

  for (const booking of rows) {
    const past = booking.date < today;
    const flags = [
      booking.adminEmailSentAt ? null : "admin missing",
      booking.customerEmailSentAt ? null : "customer missing",
    ].filter(Boolean);

    console.log(
      `${booking.confirmationCode}  ${booking.firstName} ${booking.lastName}  ` +
        `${booking.date} ${booking.time}  ${booking.serviceName} $${booking.total}` +
        (flags.length ? `  [${flags.join(", ")}]` : ""),
    );

    // A past date only bars the customer copy — telling the business about a
    // booking it was never notified of is still useful after the fact.
    const wantAdmin = !booking.adminEmailSentAt;
    const wantCustomer =
      !booking.customerEmailSentAt && (!past || includePast);

    if (past && !booking.customerEmailSentAt && !includePast) {
      console.log(
        "   ↳ customer copy withheld — booking date has passed (--include-past to override)",
      );
    }
    if (!wantAdmin && !wantCustomer) {
      console.log("   ↳ nothing left to send\n");
      skipped += 1;
      continue;
    }
    console.log(
      `   → ${[wantAdmin ? "business inbox" : null, wantCustomer ? booking.email : null].filter(Boolean).join(" + ")}\n`,
    );

    if (!send) continue;

    const params = await emailParams(booking);

    if (target === "both") {
      // Only fill the gaps — never re-send a half the row says already landed.
      const result = await deliverBookingEmails(booking.id, params, {
        admin: wantAdmin,
        customer: wantCustomer,
      });
      console.log(
        `   admin=${result.admin ? "✓" : "✗"} customer=${result.customer ? "✓" : "✗"}\n`,
      );
      if (result.admin && result.customer) sent += 1;
    } else {
      const result = await sendBookingNotification({
        ...params,
        recipientOverride: target === "customer" ? booking.email : null,
      });
      console.log(result.ok ? "   ✓ sent\n" : `   ✗ failed: ${result.reason}\n`);
      if (result.ok) sent += 1;
    }
  }

  if (send) {
    console.log(`Done — ${sent} sent, ${skipped} skipped.`);
  } else {
    console.log(`${rows.length - skipped} would send, ${skipped} skipped.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
