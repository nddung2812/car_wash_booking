/**
 * Shared constants + helpers for the booking payment flow.
 *
 * EmailJS template variable `{{payment_status}}` receives one of the
 * three human-readable strings below.
 */

export const PAYMENT_METHODS = ["pay_now", "pay_on_collection"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAY_AT_COLLECTION_STATUS = "Pay later - At collection";
export const PAY_NOW_PAID_STATUS = "PAID - Online";
export const PAY_NOW_PENDING_STATUS = "pending_payment";

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === "string" &&
    (PAYMENT_METHODS as readonly string[]).includes(value)
  );
}
