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

Dynamic segments: `/locations/[city]` — only `loganholme` and `shailer-park` are valid values. `/account/orders/[id]` — order UUID, auth-gated to the buyer.

Path alias `@/*` → `src/*`.

### API Routes (`src/app/api/`)

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/bookings` | Public |
| GET | `/api/bookings` | Admin |
| GET | `/api/bookings/[id]` | Public (UUID) |
| PATCH | `/api/bookings/[id]` | Admin |
| POST | `/api/webhooks/clerk` | Svix-signed |
| POST | `/api/products/checkout` | Public |
| POST | `/api/products/stripe-webhook` | Stripe-signed |

Admin authorisation is email-based: Clerk user email must appear in the `ADMIN_EMAILS` env var (comma-separated).

### Database (`src/db/`)

Drizzle ORM over Neon serverless HTTP driver (`@neondatabase/serverless`). Client is lazily initialized via Proxy in `src/db/index.ts` to avoid connection errors in serverless cold starts.

Three tables:

- **users** — synced from Clerk via webhook. Carries `stripe_customer_id` (set on first products checkout) so future Stripe sessions reuse the same Customer and auto-prefill name/email/phone/shipping. FKs on bookings/orders use `ON UPDATE CASCADE` so `ensureUserRow` can safely re-key a stale user id without orphaning historical rows.
- **bookings** — confirmation codes are server-generated as `LCW-DD/MM/YYYY-###`. Pricing (subtotal, 10% GST, total) is always calculated server-side in the POST route, never trusted from the client. Includes `payment_method` (`pay_now` / `pay_on_collection`), `payment_status` (`unpaid` / `pending_payment` / `paid`), and `stripe_session_id` for pay-now bookings.
- **orders** — every paid products-store checkout, unique on `stripe_session_id` (idempotent insert via `ON CONFLICT DO NOTHING`). Items stored as JSONB (`{ name, qty, amount, productId }[]`). Records `email`, `full_name`, `phone`, `shipping_address`, totals breakdown, `stripe_payment_intent_id`.

Query helpers for dashboard aggregations live in `src/db/queries.ts` (also `listOrdersByUser`, `getOrderById`). Mock cost/profit data comes from `src/data/mock-dashboard.ts` (live revenue data is real; cost data is static mock).

`src/lib/users.ts → ensureUserRow()` is the canonical helper for guaranteeing a `users` row exists before FK-linking. Handles three cases: already linked / fresh insert / email collision with a stale Clerk id → re-key (cascades to children). Used by `/api/bookings` POST and `recordOrderFromSession`.

### Auth (`src/proxy.ts`)

Clerk middleware protects `/dashboard(.*)`. `<ClerkProvider>` in the root layout redirects after sign-in/sign-up to `/account`. Webhook at `/api/webhooks/clerk` keeps the local `users` table in sync.

### Booking Flow

1. `BookingForm.tsx` (client) — multi-step form using React Hook Form + Zod, steps: service → schedule + add-ons → customer details + **payment method** (pay now / pay at collection)
2. `POST /api/bookings` — validates, calculates price, generates confirmation code, saves booking with chosen payment method
   - **Pay at collection** → fires EmailJS immediately with `{{payment_status}} = "Pay later - At collection"`, returns `redirectUrl: /success?code=…`
   - **Pay now** → saves booking as `pending_payment`, creates a Stripe Checkout Session (one line item for service + one per extra, customer_email prefilled), returns `checkoutUrl`. Email is **not** sent yet.
3. Stripe redirects pay-now customers to `/success?code=…&session_id=…`. `reconcileBookingPayment()` (`src/lib/booking-confirmation.ts`) verifies the session, marks the booking `paid`/`confirmed`, fires EmailJS with `{{payment_status}} = "PAID - Online"`. Idempotent via a `booking_email_sent` flag on the PaymentIntent metadata (same pattern as products `deliverOrderConfirmation`).
4. Constants for the two payment-status strings live in `src/lib/booking-payment.ts` (`PAY_AT_COLLECTION_STATUS`, `PAY_NOW_PAID_STATUS`). Both flows share `sendBookingNotification()` in `src/lib/email.ts`; the EmailJS booking template must include the `{{payment_status}}` variable.

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

Optional: `DATABASE_URL_UNPOOLED` (migrations), `EMAILJS_*` (notifications — EmailJS booking template must include `{{payment_status}}` for online / at-collection labeling), `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `BOOKING_NOTIFICATION_EMAIL`, `STRIPE_SECRET_KEY` (powers **both** products-store card checkout **and** the booking "pay now" option — without it the booking form's pay-now branch returns a 503 and `/products/checkout` shows a "payments not configured" message), `EMAILJS_ORDER_TEMPLATE_ID` (products order-confirmation template, defaults to `template_zq9r66g`), `STRIPE_WEBHOOK_SECRET` (enables the `/api/products/stripe-webhook` fallback for closed-tab orders — bookings rely on the `/success` page reconciliation, no separate webhook yet)

### Products Store (`/products`)

Separate from the booking flow. Catalogue is static in `src/data/products.json`. Cart is client-side: `CartProvider` (localStorage-backed via `useSyncExternalStore`, mounted in the **root** layout so `useCart` is safe everywhere `Header` renders, incl. the 404 page) → `useCart()`. The cart is surfaced via a fixed bottom-right `FloatingCart` (hidden when empty, drawer open, or on the checkout pages), not the header. Routes: `/products` (listing, filters collapse on mobile), `/products/[slug]` (SSG detail pages, slug = product `id`), `/products/checkout` (review + pay), `/products/order-success` (Stripe session confirmation, clears cart). `POST /api/products/checkout` re-prices every line server-side from the catalogue (never trusts the client) and creates a Stripe Checkout Session. Signed-in buyers get a persistent Stripe Customer via `getOrCreateStripeCustomer()` (`src/lib/stripe-customer.ts`) — Stripe Checkout then auto-prefills name/email/phone/shipping from prior orders. Guests still check out with just `customer_email`.

**Order persistence:** every paid session is written to the `orders` table via `recordOrderFromSession()` (`src/lib/orders.ts`), called from inside `deliverOrderConfirmation()` so both the success page and webhook paths trigger it. Unique index on `stripe_session_id` keeps it idempotent. The Clerk userId comes from `session.metadata.clerk_user_id`; `ensureUserRow()` backfills the `users` row first so the FK holds even if the Clerk webhook missed the user or the account was recreated.

**Shipping:** flat-rate, Australia-only. Constants live in `src/lib/shipping.ts` (`SHIPPING_FEE` = 14.95) and are shared by the server checkout API and the client review page/cart so totals stay in lock-step. The checkout session sets `shipping_address_collection` (AU) + a single `shipping_rate_data` flat option; Stripe collects the delivery address on its hosted page. The success page and confirmation email show the shipping address and fee.

**Order confirmation email:** on confirmed payment, `sendOrderConfirmation()` in `src/lib/email.ts` (a *separate* function — the booking email is untouched) sends the customer EmailJS template `template_zq9r66g`. `deliverOrderConfirmation()` (`src/lib/order-confirmation.ts`) is the idempotent orchestrator: it only sends when `payment_status === "paid"` and records a `order_confirmation_sent` flag on the Stripe PaymentIntent metadata so refreshes / duplicate webhooks never re-send. Triggered from the `/products/order-success` render (works with just `STRIPE_SECRET_KEY`) and, if configured, the `/api/products/stripe-webhook` endpoint (covers buyers who close the tab).

### Account Dashboard (`/account`)

Customer-facing dashboard for signed-in users. Single page (`src/app/(marketing)/account/page.tsx`) with a Shopify-style tabbed compact list — **Bookings** (brand blue) and **Orders** (amber). Tab state is URL-driven via `?tab=bookings|orders` so it's shareable and survives reloads. Each row is one click-line: date · summary · ref · status pills · total · chevron. Bookings link to `/success?code=…` (existing detail). Orders link to `/account/orders/[id]` — auth-gated detail page that 404s if `order.userId !== currentUser.id`. Old `/account/bookings` redirects to `/account`. Clerk's `signInFallbackRedirectUrl` / `signUpFallbackRedirectUrl` point at `/account`.

### Before/After Gallery (Full Detail)

`BeforeAfterSection` (server) → `BeforeAfterCarousel` (client, side-by-side pair per slide, stacks on mobile) renders on the homepage and `/services`. Images come from the **`before-after` Cloudinary folder** — `getBeforeAfterPairs()` in `src/lib/cloudinary.ts` lists it via the Admin Search API (server-only `CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET`/`CLOUDINARY_CLOUD_NAME`), ISR-cached for 1h. The account is **dynamic-folder mode** (assets keyed by `asset_folder`, `public_id` randomised, `display_name` = original filename — returned by default, `with_field` is *not* a valid option here; the search expression must use the unquoted `:` glob, e.g. `asset_folder:before-after/*`). Pairing: **one subfolder per slide** (recommended) — `before-after/<slide>/` containing one file whose name contains `before` and one containing `after` (e.g. `before-after/slide-1/before-1.jpg` + `after-1.jpg`); slide label derived from the subfolder name. Flat fallback: two files directly in `before-after/` sharing a base name with a before/after token. Unpaired files ignored. Delivery URLs bake in `f_auto,q_auto,c_limit,w_1400,h_1400` (modern format, auto quality, scale-down only, no crop, neither dimension > 1400px so never a 4K download — no `dpr_auto` on purpose) and use `next/image unoptimized` to bypass the global fetch loader. Each pair carries the source `beforeRatio`/`afterRatio`; the carousel shows the full uncropped image at its natural ratio on mobile and a fixed 4:3 side-by-side on desktop (`sm:`). Empty folder → section renders `null` in production, dev placeholder otherwise. Folder (re)created with `node scripts/cloudinary-create-folder.mjs [name]`.
