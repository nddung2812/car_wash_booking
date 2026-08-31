ALTER TABLE "bookings" ADD COLUMN "stripe_payment_intent_id" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "deposit_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "amount_paid" numeric(10, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
-- Backfill: pay-now bookings were always asked for the full amount at checkout.
UPDATE "bookings" SET "deposit_amount" = "total" WHERE "payment_method" = 'pay_now';--> statement-breakpoint
-- Backfill: anything already settled has had its full total captured.
UPDATE "bookings" SET "amount_paid" = "total" WHERE "payment_status" = 'paid';
