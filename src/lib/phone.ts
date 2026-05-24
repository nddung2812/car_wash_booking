/**
 * AU phone number validation. Accepts +61 / 61 / 0 prefixes followed by an
 * area code of 2, 3, 4, 7, or 8 and 8 trailing digits — covers mobiles (04…)
 * and landlines. Spaces, dashes and parens are stripped before matching.
 */
export const AU_PHONE_PATTERN = /^(?:\+?61|0)[2-478]\d{8}$/;

export function normalizeAuPhone(input: string): string {
  return input.replace(/[\s()\-.]/g, "");
}

export function isValidAuPhone(input: string): boolean {
  return AU_PHONE_PATTERN.test(normalizeAuPhone(input));
}
