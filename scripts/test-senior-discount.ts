/**
 * Checks the seniors & pensioner discount rules — pure maths, no database, no
 * Stripe, no email. Safe to run any time:
 *
 *   npx tsx scripts/test-senior-discount.ts
 *
 * Exits non-zero if any check fails.
 */
import assert from "node:assert/strict";

import {
  SENIOR_DISCOUNT_AMOUNT,
  isSeniorDiscountDay,
  priceBooking,
  seniorDiscountEmailNote,
  seniorDiscountFor,
  weekdayOfIsoDate,
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

console.log("Weekday detection");
check("known dates map to the right weekday", () => {
  assert.equal(weekdayOfIsoDate("2026-11-16"), 1); // Monday
  assert.equal(weekdayOfIsoDate("2026-11-18"), 3); // Wednesday
  assert.equal(weekdayOfIsoDate("2026-11-19"), 4); // Thursday
  assert.equal(weekdayOfIsoDate("2026-11-22"), 0); // Sunday
  assert.equal(weekdayOfIsoDate("2028-02-29"), 2); // leap day, Tuesday
});
check("every day of 2027 agrees with an independent calculation", () => {
  // Zeller-style reference, deliberately not using Date.
  const ref = (y: number, m: number, d: number) => {
    const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
    const yy = m < 3 ? y - 1 : y;
    return (yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) + t[m - 1] + d) % 7;
  };
  const dim = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let eligible = 0;
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= dim[m - 1]; d++) {
      const iso = `2027-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const wd = ref(2027, m, d);
      assert.equal(weekdayOfIsoDate(iso), wd, iso);
      assert.equal(isSeniorDiscountDay(iso), wd === 3 || wd === 4, iso);
      if (isSeniorDiscountDay(iso)) eligible += 1;
    }
  }
  assert.equal(eligible, 104); // 52 Wednesdays + 52 Thursdays in 2027
});
check("the weekday does not depend on the machine's timezone", () => {
  const before = process.env.TZ;
  for (const tz of ["Australia/Brisbane", "UTC", "America/Los_Angeles", "Pacific/Kiritimati"]) {
    process.env.TZ = tz;
    assert.equal(weekdayOfIsoDate("2026-11-18"), 3, tz);
    assert.equal(isSeniorDiscountDay("2026-11-18"), true, tz);
    assert.equal(isSeniorDiscountDay("2026-11-17"), false, tz);
    assert.equal(isSeniorDiscountDay("2026-11-20"), false, tz);
  }
  process.env.TZ = before;
});
check("malformed or impossible dates are never eligible", () => {
  for (const bad of ["", "tomorrow", "2026-13-01", "2026-02-31", "18/11/2026", "2026-11-18T00:00:00Z", null, undefined]) {
    assert.equal(weekdayOfIsoDate(bad as string), null, String(bad));
    assert.equal(isSeniorDiscountDay(bad as string), false, String(bad));
  }
});

console.log("Discount amount");
check("needs both the claim and an eligible day", () => {
  assert.equal(seniorDiscountFor({ claimed: true, date: "2026-11-18", servicePrice: 40 }), 10);
  assert.equal(seniorDiscountFor({ claimed: true, date: "2026-11-19", servicePrice: 40 }), 10);
  assert.equal(seniorDiscountFor({ claimed: false, date: "2026-11-18", servicePrice: 40 }), 0);
  assert.equal(seniorDiscountFor({ claimed: true, date: "2026-11-20", servicePrice: 40 }), 0);
  assert.equal(seniorDiscountFor({ claimed: undefined, date: "2026-11-18", servicePrice: 40 }), 0);
});
check("never exceeds the wash price", () => {
  assert.equal(seniorDiscountFor({ claimed: true, date: "2026-11-18", servicePrice: 6 }), 6);
  assert.equal(seniorDiscountFor({ claimed: true, date: "2026-11-18", servicePrice: 0 }), 0);
  assert.equal(seniorDiscountFor({ claimed: true, date: "2026-11-18", servicePrice: -5 }), 0);
  assert.equal(seniorDiscountFor({ claimed: true, date: "2026-11-18", servicePrice: NaN }), 0);
});

console.log("Booking totals");
check("without a discount, totals match the previous formula exactly", () => {
  for (const svc of services) {
    for (const price of Object.values(svc.pricing)) {
      for (const extras of [0, 25, 55, 105, 599]) {
        const old = (() => {
          const total = +(price + extras).toFixed(2);
          const gst = +(total / 11).toFixed(2);
          const subtotal = +(total - gst).toFixed(2);
          return { subtotal, gst, total };
        })();
        const now = priceBooking({ servicePrice: price, extrasTotal: extras, seniorClaimed: false, date: "2026-11-18" });
        assert.deepEqual({ subtotal: now.subtotal, gst: now.gst, total: now.total }, old);
        assert.equal(now.discount, 0);
        assert.equal(now.serviceCharge, price);
      }
    }
  }
});
check("with the discount, every catalogue price drops by exactly $10 and extras don't", () => {
  for (const svc of services) {
    for (const price of Object.values(svc.pricing)) {
      for (const extras of [0, 25, 105]) {
        const p = priceBooking({ servicePrice: price, extrasTotal: extras, seniorClaimed: true, date: "2026-11-19" });
        assert.equal(p.discount, SENIOR_DISCOUNT_AMOUNT);
        assert.equal(p.serviceCharge, price - 10);
        assert.equal(p.total, price - 10 + extras);
        // GST is 1/11th of what is actually charged, and the parts add up.
        assert.equal(p.gst, Math.round((p.total / 11) * 100) / 100);
        assert.equal(Math.round((p.subtotal + p.gst) * 100), Math.round(p.total * 100));
      }
    }
  }
});
check("worked example: Exterior Wash sedan, Wednesday", () => {
  const p = priceBooking({ servicePrice: 40, extrasTotal: 0, seniorClaimed: true, date: "2026-11-18" });
  assert.deepEqual(p, { serviceCharge: 30, discount: 10, subtotal: 27.27, gst: 2.73, total: 30 });
});

console.log("What the customer pays");
check("deposit: $10 now, balance is $10 lower", () => {
  const p = priceBooking({ servicePrice: 70, extrasTotal: 25, seniorClaimed: true, date: "2026-11-18" });
  assert.equal(p.total, 85);
  const due = amountDueNow("deposit", p.total);
  assert.equal(due, 10);
  assert.equal(balanceDue(p.total, due), 75);
});
check("pay in full: charged the discounted total, nothing on the day", () => {
  const p = priceBooking({ servicePrice: 70, extrasTotal: 25, seniorClaimed: true, date: "2026-11-18" });
  const due = amountDueNow("pay_now", p.total);
  assert.equal(due, 85);
  assert.equal(balanceDue(p.total, due), 0);
});
check("pay in full: Stripe line items add up to the charge, to the cent", () => {
  for (const svc of services) {
    for (const price of Object.values(svc.pricing)) {
      const extras = [25, 55, 15];
      const p = priceBooking({ servicePrice: price, extrasTotal: 95, seniorClaimed: true, date: "2026-11-19" });
      const lineCents = Math.round(p.serviceCharge * 100) + extras.reduce((s, e) => s + Math.round(e * 100), 0);
      assert.equal(lineCents, Math.round(amountDueNow("pay_now", p.total) * 100));
    }
  }
});
check("a wash cheaper than the discount can't over-charge or go negative", () => {
  const p = priceBooking({ servicePrice: 8, extrasTotal: 25, seniorClaimed: true, date: "2026-11-18" });
  assert.equal(p.discount, 8);
  assert.equal(p.serviceCharge, 0);
  assert.equal(p.total, 25);
  assert.equal(amountDueNow("deposit", p.total), 10);
});

console.log("Email notes");
check("no discount leaves the notes exactly as before", () => {
  assert.equal(bookingEmailNotes("Pet hair in the back", 0), "Pet hair in the back");
  assert.equal(bookingEmailNotes("", 0), "—");
  assert.equal(bookingEmailNotes(null, undefined), "—");
  assert.equal(bookingEmailNotes("   ", 0), "—");
});
check("a discount adds the card reminder, keeping the customer's notes", () => {
  const note = seniorDiscountEmailNote(10);
  assert.match(note, /\$10\.00 off applied/);
  assert.match(note, /may ask to see your Seniors Card or Pensioner Concession Card at collection/);
  assert.equal(bookingEmailNotes(null, 10), note);
  assert.equal(bookingEmailNotes("Pet hair", 10), `Pet hair | ${note}`);
});

console.log(process.exitCode ? "\nFAILED" : `\nAll ${passed} checks passed`);
