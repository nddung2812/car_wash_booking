/**
 * Seniors & pensioner discount — shared rules.
 *
 * Imported by both the client (BookingForm, marketing pages) and the server
 * (bookings API, emails) so the price a customer is shown and the price they
 * are charged can never drift apart — same pattern as `booking-payment.ts`.
 *
 * The discount is self-declared at booking: the customer ticks a box, the
 * price drops, and staff may ask to see the card at collection. Nothing is
 * verified online.
 */

/**
 * Master switch. Flip to `false` and the tick box disappears from the form,
 * the API rejects the claim, and the promo copy stops rendering. One-line
 * revert, requires a redeploy.
 */
export const SENIOR_DISCOUNT_ENABLED = true;

/** Dollars off, GST-inclusive. Comes off the wash itself, never the add-ons. */
export const SENIOR_DISCOUNT_AMOUNT = 10;

/** JS weekday numbers the offer runs on: 3 = Wednesday, 4 = Thursday. */
export const SENIOR_DISCOUNT_WEEKDAYS: readonly number[] = [3, 4];

/** Value stored in `bookings.discount_type`. */
export const SENIOR_DISCOUNT_TYPE = "senior";

/** Query string that opens the booking form with the box already ticked. */
export const SENIOR_DISCOUNT_QUERY = "senior";

/* -------------------------------------------------------------------------- */
/*  Copy — one place, so the form, emails and promo pages all say the same     */
/* -------------------------------------------------------------------------- */

export const SENIOR_DISCOUNT_NAME = "Seniors & pensioner discount";
export const SENIOR_DISCOUNT_DAYS_LABEL = "Wednesday & Thursday";
export const SENIOR_DISCOUNT_DAYS_SHORT = "Wed & Thu";
export const SENIOR_DISCOUNT_CARDS_LABEL =
  "Seniors Card or Pensioner Concession Card";
export const SENIOR_DISCOUNT_CARD_NOTICE =
  "We may ask to see your Seniors Card or Pensioner Concession Card at collection.";
export const SENIOR_DISCOUNT_SURCHARGE_NOTICE =
  "Surcharges may apply, for example for excessively dirty vehicles.";

/* -------------------------------------------------------------------------- */
/*  Rules                                                                      */
/* -------------------------------------------------------------------------- */

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Weekday (0 = Sunday … 6 = Saturday) of a `YYYY-MM-DD` booking date, or null
 * if the string isn't a real calendar date.
 *
 * Read straight off the calendar date in UTC, so it doesn't matter what
 * timezone the browser or the Vercel function happens to be in — a booking
 * for Wednesday is a Wednesday everywhere.
 */
export function weekdayOfIsoDate(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const d = new Date(Date.UTC(year, month - 1, day));
  // Reject overflow dates like 2026-02-31, which Date silently rolls forward.
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    return null;
  }
  return d.getUTCDay();
}

/** Is this booking date a day the offer runs on? */
export function isSeniorDiscountDay(isoDate: string | null | undefined): boolean {
  if (!SENIOR_DISCOUNT_ENABLED) return false;
  const weekday = weekdayOfIsoDate(isoDate);
  return weekday !== null && SENIOR_DISCOUNT_WEEKDAYS.includes(weekday);
}

/**
 * Dollars off for a booking. Zero unless the customer claimed it AND the
 * booking falls on an eligible day. Clamped to the wash price so an admin
 * price override below the discount can never produce a negative total.
 */
export function seniorDiscountFor(input: {
  claimed: boolean | null | undefined;
  date: string | null | undefined;
  servicePrice: number;
}): number {
  if (!input.claimed) return 0;
  if (!isSeniorDiscountDay(input.date)) return 0;
  const price = Number.isFinite(input.servicePrice) ? input.servicePrice : 0;
  return round2(Math.min(SENIOR_DISCOUNT_AMOUNT, Math.max(price, 0)));
}

/**
 * Totals for a booking, GST-inclusive. The single piece of money maths behind
 * both the form's summary panel and the API's stored/charged amounts.
 */
export function priceBooking(input: {
  servicePrice: number;
  extrasTotal: number;
  seniorClaimed?: boolean | null;
  date?: string | null;
}): {
  /** Wash price after the discount — what the wash line item is charged at. */
  serviceCharge: number;
  discount: number;
  subtotal: number;
  gst: number;
  total: number;
} {
  const discount = seniorDiscountFor({
    claimed: input.seniorClaimed,
    date: input.date,
    servicePrice: input.servicePrice,
  });
  const serviceCharge = round2(input.servicePrice - discount);
  const total = round2(serviceCharge + input.extrasTotal);
  const gst = round2(total / 11);
  const subtotal = round2(total - gst);
  return { serviceCharge, discount, subtotal, gst, total };
}

/**
 * The line added to the notes of a booking email when the discount applied.
 * Reads correctly in both the business copy (a prompt to check the card) and
 * the customer copy (a reminder to bring it).
 */
export function seniorDiscountEmailNote(discount: number): string {
  return `${SENIOR_DISCOUNT_NAME.toUpperCase()}: $${discount.toFixed(2)} off applied. ${SENIOR_DISCOUNT_CARD_NOTICE}`;
}
