/**
 * One-off apology to customers whose booking confirmation never sent.
 *
 * Between 28/08 and 01/09/2026 four bookings were saved successfully but the
 * EmailJS request was never made — the notification is fired un-awaited in
 * `POST /api/bookings`, so Vercel froze the function before the request left.
 * This sends those customers a personalised apology with their booking details.
 *
 *   # preview (default — sends nothing)
 *   npx tsx --env-file=.env.local scripts/send-booking-apology.ts LCW-01/09/2026-001
 *
 *   # actually send
 *   npx tsx --env-file=.env.local scripts/send-booking-apology.ts LCW-01/09/2026-001 --send
 *
 * Read-only against the database.
 */
import { getBookingByCode } from "../src/db/queries";
import { sendCustomerMessage } from "../src/lib/email";
import { getMergedExtras } from "../src/lib/pricing";
import { getExtraPrice } from "../src/data/services";
import { LOCATIONS } from "../src/lib/seo/business";

const argv = process.argv.slice(2);
const send = argv.includes("--send");
const codes = argv.filter((a) => a.startsWith("LCW-"));

if (codes.length === 0) {
  console.error("Pass at least one confirmation code, e.g. LCW-01/09/2026-001");
  process.exit(1);
}

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : dateFormatter.format(d);
}

async function main() {
  console.log(`${send ? "SENDING" : "DRY RUN (no email sent — add --send)"}\n`);

  for (const code of codes) {
    const booking = await getBookingByCode(code);
    if (!booking) {
      console.error(`✗ ${code} — not found`);
      continue;
    }

    const extraCatalogue = await getMergedExtras();
    const extras = (booking.extras ?? [])
      .map((id) => extraCatalogue.find((e) => e.id === id))
      .filter((e): e is NonNullable<typeof e> => Boolean(e))
      .map((e) => `${e.name} ($${getExtraPrice(e, booking.vehicleType).toFixed(2)})`);

    const locationName =
      LOCATIONS.find((l) => l.slug === booking.location)?.addressLocality ??
      booking.location;

    const payLabel =
      booking.paymentStatus === "paid" ? "Paid online" : "Pay at collection";

    const subject = `Sorry we missed your booking confirmation — ${booking.confirmationCode}`;

    const message = [
      `Hi ${booking.firstName},`,
      ``,
      `We owe you an apology. A technical fault in our email system meant the`,
      `confirmation for your booking never reached you. Your booking came`,
      `through fine and has been in our system the whole time — it was only the`,
      `confirmation email that failed to send.`,
      ``,
      `Here are your details:`,
      ``,
      `  Reference:  ${booking.confirmationCode}`,
      `  Service:    ${booking.serviceName} — ${booking.vehicleType}`,
      extras.length ? `  Extras:     ${extras.join(", ")}` : null,
      `  When:       ${formatDate(booking.date)} at ${booking.time}`,
      `  Where:      ${locationName}`,
      `  Total:      $${Number(booking.total).toFixed(2)} AUD (${payLabel})`,
      ``,
      `Nothing has changed and there's nothing you need to do — just come in as`,
      `planned. If any of the details above look wrong, reply to this email and`,
      `we'll sort it out straight away.`,
      ``,
      `Sorry again for leaving you without a confirmation.`,
      ``,
      `Logan Car Wash Support`,
    ]
      .filter((line) => line !== null)
      .join("\n");

    console.log(`── ${code} → ${booking.email}`);
    console.log(`   Subject: ${subject}\n`);
    console.log(message.replace(/^/gm, "   "));
    console.log("");

    if (!send) continue;

    const result = await sendCustomerMessage({
      toEmail: booking.email,
      subject,
      message,
    });
    console.log(result.ok ? "   ✓ sent\n" : `   ✗ failed: ${result.reason}\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
