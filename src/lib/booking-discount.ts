/**
 * Booking discounts — shared rules. Two offers live here: the standing
 * seniors & pensioner discount, and the dated November special further down.
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
/*  November special — a dated promotion that ends by itself                   */
/* -------------------------------------------------------------------------- */

/**
 * $25 off Detail & Hand Polish (sedan $95 → $70, wagon $110 → $85,
 * SUV $120 → $95) for washes booked for a date up to and including
 * `lastDate`.
 *
 * Eligibility hangs off the **wash date**, never off today's date. Customers
 * can only book future dates, so once `lastDate` has passed there is nothing
 * left to pick and the offer is over — nobody has to remember to switch it
 * off, and no deploy is needed on the day. It stacks with the seniors
 * discount (a senior booking a Wed/Thu gets both).
 *
 * To run another dated promo, change these values. To kill this one early,
 * set `lastDate` to a date in the past.
 */
export const NOVEMBER_PROMO = {
  /** Value stored in `bookings.discount_type`. */
  type: "november",
  name: "November special",
  /** Dollars off the wash, GST-inclusive. */
  amount: 25,
  /** Service ids from `src/data/services.ts` the offer applies to. */
  serviceIds: ["mini-detail"] as readonly string[],
  /** First and last eligible WASH dates, inclusive, `YYYY-MM-DD`. */
  firstDate: "2026-11-01",
  lastDate: "2026-12-01",
  /** How the cut-off is written for customers. */
  lastDateLabel: "Tuesday 1 December",
  lastDateShort: "1 Dec",
} as const;

/* -------------------------------------------------------------------------- */
/*  Rules                                                                      */
/* -------------------------------------------------------------------------- */

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Today's calendar date in Brisbane as `YYYY-MM-DD`. The shop's clock, not
 * the server's: Vercel runs in UTC, where it is still "yesterday" until 10am
 * Brisbane time.
 */
export function brisbaneTodayIso(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Brisbane",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

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

/** Is this wash date inside the November special's window? */
export function isNovemberPromoDate(isoDate: string | null | undefined): boolean {
  const date = isoDate?.trim() ?? "";
  // weekdayOfIsoDate doubles as the "is this a real calendar date" check.
  if (weekdayOfIsoDate(date) === null) return false;
  // Same-format ISO dates sort correctly as plain strings.
  return date >= NOVEMBER_PROMO.firstDate && date <= NOVEMBER_PROMO.lastDate;
}

/** Does the November special cover this wash package? */
export function isNovemberPromoService(serviceId: string | null | undefined): boolean {
  return !!serviceId && NOVEMBER_PROMO.serviceIds.includes(serviceId);
}

/**
 * Can a customer still book the November special today? Drives the promo
 * copy only — never the price. The earliest bookable day is tomorrow, so the
 * last day anyone can book an eligible wash is the day before `lastDate`.
 */
export function isNovemberPromoBookable(todayIso: string = brisbaneTodayIso()): boolean {
  return todayIso < NOVEMBER_PROMO.lastDate;
}

/**
 * Dollars off from the November special. Zero unless the package is covered
 * AND the wash date is inside the window. Clamped to the wash price.
 */
export function novemberPromoFor(input: {
  serviceId: string | null | undefined;
  date: string | null | undefined;
  servicePrice: number;
}): number {
  if (!isNovemberPromoService(input.serviceId)) return 0;
  if (!isNovemberPromoDate(input.date)) return 0;
  const price = Number.isFinite(input.servicePrice) ? input.servicePrice : 0;
  return round2(Math.min(NOVEMBER_PROMO.amount, Math.max(price, 0)));
}

/**
 * Totals for a booking, GST-inclusive. The single piece of money maths behind
 * both the form's summary panel and the API's stored/charged amounts.
 *
 * The two offers stack: the November special comes off first, then the
 * seniors discount off what is left, so together they can never take the
 * wash below zero.
 */
export function priceBooking(input: {
  servicePrice: number;
  extrasTotal: number;
  seniorClaimed?: boolean | null;
  date?: string | null;
  /** Needed for the November special; omit it and only seniors can apply. */
  serviceId?: string | null;
}): {
  /** Wash price after the discounts — what the wash line item is charged at. */
  serviceCharge: number;
  /** Everything that came off, promo + seniors. */
  discount: number;
  promoDiscount: number;
  seniorDiscount: number;
  /** Value for `bookings.discount_type`; null when nothing applied. */
  discountType: string | null;
  subtotal: number;
  gst: number;
  total: number;
} {
  const promoDiscount = novemberPromoFor({
    serviceId: input.serviceId,
    date: input.date,
    servicePrice: input.servicePrice,
  });
  const seniorDiscount = seniorDiscountFor({
    claimed: input.seniorClaimed,
    date: input.date,
    servicePrice: input.servicePrice - promoDiscount,
  });
  const discount = round2(promoDiscount + seniorDiscount);
  const discountType =
    [promoDiscount > 0 && NOVEMBER_PROMO.type, seniorDiscount > 0 && SENIOR_DISCOUNT_TYPE]
      .filter(Boolean)
      .join("+") || null;
  const serviceCharge = round2(input.servicePrice - discount);
  const total = round2(serviceCharge + input.extrasTotal);
  const gst = round2(total / 11);
  const subtotal = round2(total - gst);
  return {
    serviceCharge,
    discount,
    promoDiscount,
    seniorDiscount,
    discountType,
    subtotal,
    gst,
    total,
  };
}

/**
 * Splits a stored `discount_amount` back into the offers it came from, using
 * `discount_type` ("senior", "november" or "november+senior"). A null type
 * with a discount is a row from before the type was recorded: seniors.
 */
export function discountParts(
  amount: number | null | undefined,
  type: string | null | undefined,
): { type: string; name: string; amount: number }[] {
  const total = Number.isFinite(amount) ? Math.max(Number(amount), 0) : 0;
  if (total <= 0) return [];
  const types = (type ?? SENIOR_DISCOUNT_TYPE).split("+");
  const hasPromo = types.includes(NOVEMBER_PROMO.type);
  const hasSenior = types.includes(SENIOR_DISCOUNT_TYPE);
  const promo = hasPromo
    ? hasSenior
      ? round2(Math.min(NOVEMBER_PROMO.amount, total))
      : total
    : 0;
  const senior = hasSenior ? round2(total - promo) : 0;
  const parts: { type: string; name: string; amount: number }[] = [];
  if (promo > 0) {
    parts.push({ type: NOVEMBER_PROMO.type, name: NOVEMBER_PROMO.name, amount: promo });
  }
  if (senior > 0) {
    parts.push({ type: SENIOR_DISCOUNT_TYPE, name: SENIOR_DISCOUNT_NAME, amount: senior });
  }
  // An unrecognised type still shows up rather than vanishing.
  if (parts.length === 0) parts.push({ type: type ?? "", name: "Discount", amount: total });
  return parts;
}

/** The seniors share of a stored discount — the part staff check a card for. */
export function seniorPartOf(
  amount: number | null | undefined,
  type: string | null | undefined,
): number {
  return (
    discountParts(amount, type).find((p) => p.type === SENIOR_DISCOUNT_TYPE)?.amount ?? 0
  );
}

/**
 * The line added to the notes of a booking email when the discount applied.
 * Reads correctly in both the business copy (a prompt to check the card) and
 * the customer copy (a reminder to bring it).
 */
export function seniorDiscountEmailNote(discount: number): string {
  return `${SENIOR_DISCOUNT_NAME.toUpperCase()}: $${discount.toFixed(2)} off applied. ${SENIOR_DISCOUNT_CARD_NOTICE}`;
}

/**
 * Everything the notes of a booking email say about discounts: one segment
 * per offer that applied. Empty when nothing came off.
 */
export function discountEmailNote(
  amount: number | null | undefined,
  type: string | null | undefined,
): string {
  return discountParts(amount, type)
    .map((part) =>
      part.type === SENIOR_DISCOUNT_TYPE
        ? seniorDiscountEmailNote(part.amount)
        : `${part.name.toUpperCase()}: $${part.amount.toFixed(2)} off applied.`,
    )
    .join(" | ");
}
