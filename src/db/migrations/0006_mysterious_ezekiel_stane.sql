ALTER TABLE "bookings" ADD COLUMN "discount_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "discount_type" text;