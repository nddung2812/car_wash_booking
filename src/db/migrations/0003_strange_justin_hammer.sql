CREATE TYPE "public"."banner_status" AS ENUM('generating', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prompt" text NOT NULL,
	"canva_design_id" text,
	"cloudinary_url" text,
	"cloudinary_public_id" text,
	"width" integer,
	"height" integer,
	"alt_text" text,
	"href" text DEFAULT '#booking' NOT NULL,
	"status" "banner_status" DEFAULT 'generating' NOT NULL,
	"is_live" boolean DEFAULT false NOT NULL,
	"slot" text DEFAULT 'homepage-hero' NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "canva_oauth" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"refresh_token" text NOT NULL,
	"access_token" text,
	"access_token_expires_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "banners_live_idx" ON "banners" USING btree ("slot","is_live");--> statement-breakpoint
CREATE INDEX "banners_created_at_idx" ON "banners" USING btree ("created_at");