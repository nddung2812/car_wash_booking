/**
 * Shared constants + helpers for the booking payment flow.
 *
 * Imported by both the client (BookingForm) and the server (bookings API,
 * reconciliation, webhook) so the amount shown to the customer and the amount
 * Stripe is asked for can never drift apart — same pattern as SHIPPING_FEE in
 * `src/lib/shipping.ts`.
 *
 * EmailJS template variable `{{payment_status}}` receives one of the
 * human-readable strings below.
 */

/**
 * Master switch for the deposit requirement. Flipping this to `false` restores
 * the old free "pay at collection" path on both the form and the API — the
 * one-line revert if deposits ever need to come off in a hurry.
 */
export const DEPOSIT_ENABLED = true;

/** Up-front part-payment, AUD, GST-inclusive. Comes off the final price. */
export const DEPOSIT_AMOUNT = 10;

/** Where customers go to cancel, reschedule, or ask for the deposit back. */
export const SUPPORT_EMAIL = "logancarwashsupport@gmail.com";

/**
 * `pay_on_collection` is retained for the historical rows booked before
 * deposits existed. It is no longer offered while DEPOSIT_ENABLED is true.
 */
export const PAYMENT_METHODS = [
  "pay_now",
  "deposit",
  "pay_on_collection",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** The methods the form offers and the API will accept. */
export const OFFERED_PAYMENT_METHODS = (
  DEPOSIT_ENABLED
    ? (["deposit", "pay_now"] as const)
    : (["pay_now", "pay_on_collection"] as const)
) satisfies readonly PaymentMethod[];

export const DEFAULT_PAYMENT_METHOD: PaymentMethod = DEPOSIT_ENABLED
  ? "deposit"
  : "pay_on_collection";

/* -------------------------------------------------------------------------- */
/*  payment_status column values                                               */
/* -------------------------------------------------------------------------- */

export const PAYMENT_STATUS_UNPAID = "unpaid";
export const PAY_NOW_PENDING_STATUS = "pending_payment";
export const PAYMENT_STATUS_DEPOSIT_PAID = "deposit_paid";
export const PAYMENT_STATUS_PAID = "paid";

/** A booking whose slot is secured — deposit taken or paid in full. */
export function isSettled(paymentStatus: string): boolean {
  return (
    paymentStatus === PAYMENT_STATUS_PAID ||
    paymentStatus === PAYMENT_STATUS_DEPOSIT_PAID
  );
}

/* -------------------------------------------------------------------------- */
/*  {{payment_status}} strings for the EmailJS booking template                */
/* -------------------------------------------------------------------------- */

export const PAY_AT_COLLECTION_STATUS = "Pay later - At collection";
export const PAY_NOW_PAID_STATUS = "PAID - Online";

export function depositPaidStatus(deposit: number, balance: number): string {
  return `DEPOSIT PAID - $${deposit.toFixed(2)} online · $${balance.toFixed(2)} due at collection`;
}

/* -------------------------------------------------------------------------- */
/*  Money                                                                      */
/* -------------------------------------------------------------------------- */

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * The deposit for a given job. Clamped to the total so an admin price override
 * below DEPOSIT_AMOUNT can never ask for more up-front than the wash costs.
 */
export function depositFor(total: number): number {
  return round2(Math.min(DEPOSIT_AMOUNT, Math.max(total, 0)));
}

/** What Stripe is charged at checkout for a given method. */
export function amountDueNow(method: PaymentMethod, total: number): number {
  if (method === "pay_now") return round2(total);
  if (method === "deposit") return depositFor(total);
  return 0;
}

/** What the customer still owes on arrival. */
export function balanceDue(total: number, amountPaid: number): number {
  return round2(Math.max(total - amountPaid, 0));
}

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === "string" &&
    (PAYMENT_METHODS as readonly string[]).includes(value)
  );
}

export function isOfferedPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === "string" &&
    (OFFERED_PAYMENT_METHODS as readonly string[]).includes(value)
  );
}
