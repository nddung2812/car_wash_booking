# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Dev server (Next.js + Turbopack)
npm run build      # Production build
npm run lint       # ESLint (next/core-web-vitals)

npm run db:generate  # Generate Drizzle migrations from schema changes
npm run db:push      # Push schema to Neon (use in dev; prefer migrations in prod)
npm run db:studio    # Open Drizzle Studio at localhost:4983
npm run db:seed      # Seed sample bookings for local dev
```

No test suite is configured.

## Architecture

**Stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind · Radix UI · Drizzle ORM · Neon Postgres · Clerk auth

### Routing

All public pages live under `src/app/(marketing)/` (route group, no URL effect). Remaining top-level routes are `dashboard/` (admin), `sign-in/`, and `sign-up/`.

Dynamic segments: `/locations/[city]` — only `loganholme` and `shailer-park` are valid values.

Path alias `@/*` → `src/*`.

### API Routes (`src/app/api/`)

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/bookings` | Public |
| GET | `/api/bookings` | Admin |
| GET | `/api/bookings/[id]` | Public (UUID) |
| PATCH | `/api/bookings/[id]` | Admin |
| POST | `/api/webhooks/clerk` | Svix-signed |

Admin authorisation is email-based: Clerk user email must appear in the `ADMIN_EMAILS` env var (comma-separated).

### Database (`src/db/`)

Drizzle ORM over Neon serverless HTTP driver (`@neondatabase/serverless`). Client is lazily initialized via Proxy in `src/db/index.ts` to avoid connection errors in serverless cold starts.

Two tables: **users** (synced from Clerk via webhook) and **bookings**. Confirmation codes are server-generated as `LCW-DD/MM/YYYY-###`. Pricing (subtotal, 10% GST, total) is always calculated server-side in the POST route, never trusted from the client.

Query helpers for dashboard aggregations live in `src/db/queries.ts`. Mock cost/profit data comes from `src/data/mock-dashboard.ts` (live revenue data is real; cost data is static mock).

### Auth (`src/proxy.ts`)

Clerk middleware protects `/dashboard(.*)`. `<ClerkProvider>` in the root layout redirects after sign-in/sign-up to `/account/bookings`. Webhook at `/api/webhooks/clerk` keeps the local `users` table in sync.

### Booking Flow

1. `BookingForm.tsx` (client) — multi-step form using React Hook Form + Zod, steps: service → add-ons → schedule → customer details
2. `POST /api/bookings` — validates, calculates price, generates confirmation code, saves to DB, fires EmailJS notification
3. Redirect to `/success?code=LCW-…`

### External Services

- **EmailJS** — booking notification emails (`src/lib/email.ts`)
- **Cloudinary** — image CDN via custom Next.js image loader (`src/lib/cloudinary-loader.ts`)
- **Google Analytics (G-HC6GZB3ETP) + GTM** — `trackGenerateLead()` fires on booking completion

### Component Conventions

- Server components fetch data directly from DB and pass it as props
- Client components (`"use client"`) handle interactivity and call API routes via `fetch()`
- Shared UI primitives from Radix UI live in `src/components/ui/`
- Static catalogue data (services, vehicle types, time slots, extras) lives in `src/data/services.ts`

### Environment Variables

Required: `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `ADMIN_EMAILS`

Optional: `DATABASE_URL_UNPOOLED` (migrations), `EMAILJS_*` (notifications), `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `BOOKING_NOTIFICATION_EMAIL`, `STRIPE_SECRET_KEY` (products store card checkout — without it `/products/checkout` degrades gracefully with a "payments not configured" message), `EMAILJS_ORDER_TEMPLATE_ID` (order-confirmation template, defaults to `template_zq9r66g`), `STRIPE_WEBHOOK_SECRET` (enables the `/api/products/stripe-webhook` fallback for closed-tab orders)

### Products Store (`/products`)

Separate from the booking flow. Catalogue is static in `src/data/products.json`. Cart is client-side: `CartProvider` (localStorage-backed via `useSyncExternalStore`, mounted in the **root** layout so `useCart` is safe everywhere `Header` renders, incl. the 404 page) → `useCart()`. The cart is surfaced via a fixed bottom-right `FloatingCart` (hidden when empty, drawer open, or on the checkout pages), not the header. Routes: `/products` (listing, filters collapse on mobile), `/products/[slug]` (SSG detail pages, slug = product `id`), `/products/checkout` (review + pay), `/products/order-success` (Stripe session confirmation, clears cart). `POST /api/products/checkout` re-prices every line server-side from the catalogue (never trusts the client) and creates a Stripe Checkout Session.

**Shipping:** flat-rate, Australia-only. Constants live in `src/lib/shipping.ts` (`SHIPPING_FEE` = 14.95) and are shared by the server checkout API and the client review page/cart so totals stay in lock-step. The checkout session sets `shipping_address_collection` (AU) + a single `shipping_rate_data` flat option; Stripe collects the delivery address on its hosted page. The success page and confirmation email show the shipping address and fee.

**Order confirmation email:** on confirmed payment, `sendOrderConfirmation()` in `src/lib/email.ts` (a *separate* function — the booking email is untouched) sends the customer EmailJS template `template_zq9r66g`. `deliverOrderConfirmation()` (`src/lib/order-confirmation.ts`) is the idempotent orchestrator: it only sends when `payment_status === "paid"` and records a `order_confirmation_sent` flag on the Stripe PaymentIntent metadata so refreshes / duplicate webhooks never re-send. Triggered from the `/products/order-success` render (works with just `STRIPE_SECRET_KEY`) and, if configured, the `/api/products/stripe-webhook` endpoint (covers buyers who close the tab).

### Before/After Gallery (Full Detail)

`BeforeAfterSection` (server) → `BeforeAfterCarousel` (client, side-by-side pair per slide, stacks on mobile) renders on the homepage and `/services`. Images come from the **`before-after` Cloudinary folder** — `getBeforeAfterPairs()` in `src/lib/cloudinary.ts` lists it via the Admin Search API (server-only `CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET`/`CLOUDINARY_CLOUD_NAME`), ISR-cached for 1h. The account is **dynamic-folder mode** (assets keyed by `asset_folder`, `public_id` randomised, `display_name` = original filename — returned by default, `with_field` is *not* a valid option here; the search expression must use the unquoted `:` glob, e.g. `asset_folder:before-after/*`). Pairing: **one subfolder per slide** (recommended) — `before-after/<slide>/` containing one file whose name contains `before` and one containing `after` (e.g. `before-after/slide-1/before-1.jpg` + `after-1.jpg`); slide label derived from the subfolder name. Flat fallback: two files directly in `before-after/` sharing a base name with a before/after token. Unpaired files ignored. Delivery URLs bake in `f_auto,q_auto,c_limit,w_1400,h_1400` (modern format, auto quality, scale-down only, no crop, neither dimension > 1400px so never a 4K download — no `dpr_auto` on purpose) and use `next/image unoptimized` to bypass the global fetch loader. Each pair carries the source `beforeRatio`/`afterRatio`; the carousel shows the full uncropped image at its natural ratio on mobile and a fixed 4:3 side-by-side on desktop (`sm:`). Empty folder → section renders `null` in production, dev placeholder otherwise. Folder (re)created with `node scripts/cloudinary-create-folder.mjs [name]`.
