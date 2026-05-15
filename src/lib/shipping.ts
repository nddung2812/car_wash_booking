/**
 * Flat-rate shipping for the products store. Plain constants (no env) so the
 * client review page and the server checkout API stay in lock-step.
 */
export const SHIPPING_FEE = 14.95;
export const SHIPPING_FEE_CENTS = Math.round(SHIPPING_FEE * 100);
export const SHIPPING_LABEL = "Standard shipping (Australia-wide)";

/** ISO country codes Stripe will accept a shipping address for. */
export const SHIPPING_COUNTRIES = ["AU"] as const;

/** Indicative delivery window shown on Stripe's hosted checkout. */
export const SHIPPING_DELIVERY_DAYS = { min: 3, max: 7 } as const;
