/**
 * Checks the November special's rules — pure maths, no database, no Stripe,
 * no email. Safe to run any time:
 *
 *   npx tsx scripts/test-november-promo.ts
 *
 * Exits non-zero if any check fails.
 */
import assert from "node:assert/strict";

import {
  NOVEMBER_PROMO,
  brisbaneTodayIso,
  discountEmailNote,
  discountParts,
  isNovemberPromoBookable,
  isNovemberPromoDate,
  novemberPromoFor,
  priceBooking,
  seniorPartOf,
} from "../src/lib/booking-discount";
import { amountDueNow, balanceDue } from "../src/lib/booking-payment";
import { bookingEmailNotes } from "../src/lib/email";
import { services } from "../src/data/services";

let passed = 0;
function check(name: string, fn: () => void) {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err instanceof Error ? err.message : err}`);
    process.exitCode = 1;
  }
}

const POLISH = "mini-detail";
const polish = services.find((s) => s.id === POLISH)!;

console.log("The offer as agreed");
check("it is $25 off Detail & Hand Polish, last wash date 1 December 2026", () => {
  assert.equal(NOVEMBER_PROMO.amount, 25);
  assert.deepEqual([...NOVEMBER_PROMO.serviceIds], [POLISH]);
  assert.equal(NOVEMBER_PROMO.lastDate, "2026-12-01");
  assert.equal(polish.name, "Detail & Hand Polish");
});
check("sedan 95 → 70, wagon 110 → 85, SUV 120 → 95", () => {
  const price = (servicePrice: number) =>
    priceBooking({ servicePrice, extrasTotal: 0, date: "2026-11-25", serviceId: POLISH }).total;
  assert.equal(price(polish.pricing.sedan), 70);
  assert.equal(price(polish.pricing.wagon), 85);
  assert.equal(price(polish.pricing.suv), 95);
});

console.log("The end date");
check("1 December is the last eligible wash date; 2 December is full price", () => {
  assert.equal(isNovemberPromoDate("2026-11-30"), true);
  assert.equal(isNovemberPromoDate("2026-12-01"), true);
  assert.equal(isNovemberPromoDate("2026-12-02"), false);
  assert.equal(isNovemberPromoDate("2027-11-15"), false);
  assert.equal(isNovemberPromoDate("2026-10-31"), false);
});
check("a wash on 2 December is charged the regular price with no discount recorded", () => {
  const p = priceBooking({ servicePrice: 95, extrasTotal: 25, date: "2026-12-02", serviceId: POLISH });
  assert.equal(p.total, 120);
  assert.equal(p.discount, 0);
  assert.equal(p.discountType, null);
});
check("junk dates never qualify", () => {
  for (const bad of ["", "tomorrow", "2026-11-31", "2026-13-01", "26-11-20", null, undefined]) {
    assert.equal(isNovemberPromoDate(bad as string), false, String(bad));
  }
});
check("the result is the same in every timezone", () => {
  const original = process.env.TZ;
  for (const tz of ["Australia/Brisbane", "UTC", "America/Los_Angeles", "Pacific/Kiritimati"]) {
    process.env.TZ = tz;
    assert.equal(isNovemberPromoDate("2026-12-01"), true, tz);
    assert.equal(isNovemberPromoDate("2026-12-02"), false, tz);
  }
  process.env.TZ = original;
});

console.log("Taking itself down");
check("promo copy shows through 30 November and is gone on 1 December", () => {
  // Earliest bookable day is tomorrow, so 30 Nov is the last day anyone can
  // still book an eligible wash.
  assert.equal(isNovemberPromoBookable("2026-11-20"), true);
  assert.equal(isNovemberPromoBookable("2026-11-30"), true);
  assert.equal(isNovemberPromoBookable("2026-12-01"), false);
  assert.equal(isNovemberPromoBookable("2027-01-15"), false);
});
check("'today' is Brisbane's date, not the server's UTC date", () => {
  // 20:00 UTC on 30 Nov is already 06:00 on 1 Dec in Brisbane.
  assert.equal(brisbaneTodayIso(new Date("2026-11-30T20:00:00Z")), "2026-12-01");
  assert.equal(brisbaneTodayIso(new Date("2026-11-30T13:59:00Z")), "2026-11-30");
  assert.equal(isNovemberPromoBookable(brisbaneTodayIso(new Date("2026-11-30T13:59:00Z"))), true);
  assert.equal(isNovemberPromoBookable(brisbaneTodayIso(new Date("2026-11-30T14:00:00Z"))), false);
});

console.log("Only the one package");
check("no other wash gets the discount, on any vehicle size", () => {
  for (const svc of services) {
    if (svc.id === POLISH) continue;
    for (const price of Object.values(svc.pricing)) {
      const p = priceBooking({ servicePrice: price, extrasTotal: 0, date: "2026-11-25", serviceId: svc.id });
      assert.equal(p.total, price, svc.id);
      assert.equal(p.promoDiscount, 0, svc.id);
    }
  }
});
check("without a service id nothing comes off", () => {
  assert.equal(novemberPromoFor({ serviceId: undefined, date: "2026-11-25", servicePrice: 95 }), 0);
  assert.equal(priceBooking({ servicePrice: 95, extrasTotal: 0, date: "2026-11-25" }).total, 95);
});
check("extras are never discounted", () => {
  const p = priceBooking({ servicePrice: 95, extrasTotal: 80, date: "2026-11-25", serviceId: POLISH });
  assert.equal(p.serviceCharge, 70);
  assert.equal(p.total, 150);
});

console.log("Stacking with the seniors discount");
check("a senior on a Wednesday gets both: sedan 95 → 60", () => {
  const p = priceBooking({ servicePrice: 95, extrasTotal: 0, seniorClaimed: true, date: "2026-11-25", serviceId: POLISH });
  assert.equal(p.promoDiscount, 25);
  assert.equal(p.seniorDiscount, 10);
  assert.equal(p.discount, 35);
  assert.equal(p.total, 60);
  assert.equal(p.discountType, "november+senior");
});
check("a senior on a Friday gets the promo only", () => {
  const p = priceBooking({ servicePrice: 95, extrasTotal: 0, seniorClaimed: true, date: "2026-11-27", serviceId: POLISH });
  assert.equal(p.discount, 25);
  assert.equal(p.discountType, "november");
});
check("after the promo ends a senior still gets their $10", () => {
  const p = priceBooking({ servicePrice: 95, extrasTotal: 0, seniorClaimed: true, date: "2026-12-02", serviceId: POLISH });
  assert.equal(p.discount, 10);
  assert.equal(p.discountType, "senior");
});
check("the two together can't take a cheap wash below zero", () => {
  const p = priceBooking({ servicePrice: 30, extrasTotal: 25, seniorClaimed: true, date: "2026-11-25", serviceId: POLISH });
  assert.equal(p.promoDiscount, 25);
  assert.equal(p.seniorDiscount, 5);
  assert.equal(p.serviceCharge, 0);
  assert.equal(p.total, 25);
});

console.log("What the customer pays");
check("deposit: $10 now, the rest on the day", () => {
  const p = priceBooking({ servicePrice: 95, extrasTotal: 0, date: "2026-11-25", serviceId: POLISH });
  const due = amountDueNow("deposit", p.total);
  assert.equal(due, 10);
  assert.equal(balanceDue(p.total, due), 60);
});
check("pay in full: Stripe line items add up to the charge, to the cent", () => {
  for (const price of Object.values(polish.pricing)) {
    for (const senior of [false, true]) {
      const extras = [25, 55, 15];
      const p = priceBooking({ servicePrice: price, extrasTotal: 95, seniorClaimed: senior, date: "2026-11-25", serviceId: POLISH });
      const lineCents = Math.round(p.serviceCharge * 100) + extras.reduce((s, e) => s + Math.round(e * 100), 0);
      assert.equal(lineCents, Math.round(amountDueNow("pay_now", p.total) * 100));
      assert.equal(Math.round((p.subtotal + p.gst) * 100), Math.round(p.total * 100));
    }
  }
});

console.log("Reading a stored booking back");
check("the stored amount splits back into the offers it came from", () => {
  assert.deepEqual(discountParts(25, "november").map((p) => [p.type, p.amount]), [["november", 25]]);
  assert.deepEqual(discountParts(35, "november+senior").map((p) => [p.type, p.amount]), [["november", 25], ["senior", 10]]);
  assert.deepEqual(discountParts(10, "senior").map((p) => [p.type, p.amount]), [["senior", 10]]);
  assert.deepEqual(discountParts(0, null), []);
});
check("rows saved before the type was recorded still read as seniors", () => {
  assert.deepEqual(discountParts(10, null).map((p) => [p.type, p.amount]), [["senior", 10]]);
  assert.equal(seniorPartOf(10, null), 10);
});
check("staff are only told to check a card when the seniors discount applied", () => {
  assert.equal(seniorPartOf(25, "november"), 0);
  assert.equal(seniorPartOf(35, "november+senior"), 10);
  assert.doesNotMatch(discountEmailNote(25, "november"), /card/i);
  assert.match(discountEmailNote(35, "november+senior"), /NOVEMBER SPECIAL: \$25\.00 off applied\./);
  assert.match(discountEmailNote(35, "november+senior"), /\$10\.00 off applied\. We may ask to see/);
});
check("email notes keep the customer's own notes and stay unchanged with no discount", () => {
  assert.equal(bookingEmailNotes("Pet hair", 25, "november"), "Pet hair | NOVEMBER SPECIAL: $25.00 off applied.");
  assert.equal(bookingEmailNotes(null, 0, null), "—");
  assert.equal(bookingEmailNotes("Pet hair", 0, null), "Pet hair");
});

console.log(process.exitCode ? "\nFAILED" : `\nAll ${passed} checks passed`);
