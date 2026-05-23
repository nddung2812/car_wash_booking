# Hyperdome Car Wash Booking

Hyperdome Car Wash Booking is a Next.js app for booking car wash appointments, buying car-care products, and reviewing booking + order activity in an authenticated admin dashboard.

The app combines a marketing landing page, Clerk authentication, a multi-step booking form with optional online payment, a Stripe-powered products store, a customer "My account" dashboard for past bookings and orders, Neon Postgres storage through Drizzle ORM, and admin-only dashboard pages for booking and analytics workflows.

## Features

- Responsive landing page with hero imagery, service cards, add-on service pricing, reviews, business hours, locations, and embedded map.
- Multi-step booking flow for service, vehicle type, date, time, customer contact details, and **payment method** (pay now via Stripe or pay at collection).
- Dynamic pricing based on selected service and vehicle type, including GST calculation.
- Public booking creation API backed by Postgres, with Stripe Checkout integration for the pay-now path.
- Products store with cart, Stripe Checkout, Cloudinary imagery, flat-rate Australia shipping, and idempotent order persistence.
- Customer "My account" dashboard (`/account`) — Shopify-style tabbed compact view of past bookings and orders, with per-order detail page.
- Per-Clerk-user Stripe Customer so checkout auto-prefills name / email / phone / shipping for repeat buyers.
- EmailJS booking notification (variable `{{payment_status}}` toggles between "PAID - Online" and "Pay later - At collection") and EmailJS order confirmation (separate template) — both idempotent so refreshes never double-send.
- Clerk sign-in and sign-up pages; webhook endpoint that syncs user records into the database.
- Admin dashboard protected by Clerk and an `ADMIN_EMAILS` allowlist.
- Dashboard booking table, customer analytics, service popularity, vehicle distribution, and cost/profit views.
- Drizzle schema, database push, studio, and seed scripts.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI runtime | React 19, TypeScript |
| Styling | Tailwind CSS 3, tailwindcss-animate |
| Components | Radix UI primitives, shadcn-style local components |
| Forms | React Hook Form, Zod, drizzle-zod |
| Auth | Clerk for Next.js |
| Database | Neon serverless Postgres |
| ORM | Drizzle ORM and Drizzle Kit |
| Icons | Lucide React |
| Tooling | ESLint, tsx |

## Project Structure

```text
src/
  app/
    (marketing)/             Public route group (landing, services, account, products…)
      account/               Customer dashboard — bookings + orders tabs, /account/orders/[id] detail
      products/              Catalogue, /products/[slug], checkout, order-success
      success/               Booking confirmation page (also reconciles Stripe pay-now bookings)
    api/
      bookings/              Booking API routes (POST also creates Stripe sessions for pay-now)
      products/checkout/     Stripe Checkout session creation
      products/stripe-webhook/  Stripe webhook fallback for closed-tab orders
      webhooks/clerk/        Clerk user sync webhook
    dashboard/               Admin dashboard page
    sign-in/, sign-up/       Clerk auth routes
    layout.tsx               Root layout, fonts, ClerkProvider, CartProvider
  components/
    dashboard/               Dashboard tables, charts, analytics, CMS widgets
    cart/                    Cart provider, drawer, floating widget, stepper
    ui/                      Shared UI primitives
    visuals/                 Brand and motion components
    BookingForm.tsx          Public booking form (steps + payment method)
    Header.tsx               Site header and auth controls
  data/
    services.ts              Service catalogue, vehicle types, time slots
    products.json            Static product catalogue
    mock-dashboard.ts        Seed and mock analytics data
  db/
    index.ts                 Lazy Neon/Drizzle database client
    queries.ts               Dashboard, booking, and order query helpers
    schema.ts                users / bookings / orders schema and types
    migrations/              Generated Drizzle SQL
    seed.ts                  Development seed script
  lib/
    booking-payment.ts       Payment-method constants and payment_status strings
    booking-confirmation.ts  Idempotent reconcile-on-success for pay-now bookings
    order-confirmation.ts    Idempotent reconcile + emit for products orders
    orders.ts                recordOrderFromSession (persists paid Stripe sessions)
    stripe-customer.ts       getOrCreateStripeCustomer per Clerk user
    stripe-session.ts        Shared Stripe Session helpers (shipping, address, ref)
    users.ts                 ensureUserRow — FK-safe user backfill / re-key
    email.ts                 EmailJS booking + order send helpers
    utils.ts                 Shared utility helpers
  proxy.ts                   Clerk route protection
scripts/
  backfill-orders.ts         One-shot: attach orphan orders to users by email
  fix-user-fks.ts            One-shot: set ON UPDATE CASCADE on FKs and re-key user ids
  debug-orders.ts            Dump recent orders + users for inspection
  test-email.ts              Smoke test for the booking EmailJS template
```

## Routes

| Route | File | Description |
| --- | --- | --- |
| `/` | `src/app/(marketing)/page.tsx` | Public landing page |
| `/book-car-wash-online` | `src/app/(marketing)/book-car-wash-online/page.tsx` | Multi-step booking form |
| `/success` | `src/app/(marketing)/success/page.tsx` | Booking confirmation (also reconciles pay-now Stripe sessions) |
| `/account` | `src/app/(marketing)/account/page.tsx` | Customer dashboard with Bookings + Orders tabs (signed-in) |
| `/account/orders/[id]` | `src/app/(marketing)/account/orders/[id]/page.tsx` | Order detail (signed-in, owner-only) |
| `/account/bookings` | `src/app/(marketing)/account/bookings/page.tsx` | Legacy URL — redirects to `/account` |
| `/products` | `src/app/(marketing)/products/page.tsx` | Products catalogue |
| `/products/[slug]` | `src/app/(marketing)/products/[slug]/page.tsx` | SSG product detail |
| `/products/checkout` | `src/app/(marketing)/products/checkout/page.tsx` | Cart review + pay |
| `/products/order-success` | `src/app/(marketing)/products/order-success/page.tsx` | Stripe order confirmation + clears cart |
| `/dashboard` | `src/app/dashboard/page.tsx` | Admin-only dashboard |
| `/sign-in/[[...sign-in]]` | `src/app/sign-in/[[...sign-in]]/page.tsx` | Clerk sign-in page |
| `/sign-up/[[...sign-up]]` | `src/app/sign-up/[[...sign-up]]/page.tsx` | Clerk sign-up page |

## API Routes

| Method and path | File | Access | Description |
| --- | --- | --- | --- |
| `POST /api/bookings` | `src/app/api/bookings/route.ts` | Public | Validates input, server-side prices, saves booking. For `pay_on_collection` sends EmailJS immediately and returns a redirect URL. For `pay_now` creates a Stripe Checkout Session and returns `checkoutUrl`. |
| `GET /api/bookings` | `src/app/api/bookings/route.ts` | Admin | Lists recent bookings for dashboard/API use. |
| `GET /api/bookings/[id]` | `src/app/api/bookings/[id]/route.ts` | Public by DB UUID | Returns a booking row by database UUID. |
| `PATCH /api/bookings/[id]` | `src/app/api/bookings/[id]/route.ts` | Admin | Updates booking status to `pending`, `confirmed`, `completed`, or `cancelled`. |
| `POST /api/products/checkout` | `src/app/api/products/checkout/route.ts` | Public | Re-prices the cart server-side, attaches a persistent Stripe Customer for signed-in users, returns a Stripe Checkout Session URL. |
| `POST /api/products/stripe-webhook` | `src/app/api/products/stripe-webhook/route.ts` | Stripe-signed | Idempotent fallback that fires order email + persists order if the customer closes the success tab. |
| `POST /api/webhooks/clerk` | `src/app/api/webhooks/clerk/route.ts` | Svix verified | Handles Clerk `user.created`, `user.updated`, and `user.deleted` events. |

## Database

The database layer uses Neon serverless Postgres with Drizzle's HTTP driver.

Main files:

- `src/db/index.ts` creates a lazy database client from `DATABASE_URL`.
- `src/db/schema.ts` defines the `users`, `bookings`, and `orders` tables.
- `src/db/queries.ts` contains dashboard, booking, and order query helpers.
- `src/db/seed.ts` inserts sample bookings from `src/data/mock-dashboard.ts`.
- `drizzle.config.ts` loads `.env.local`, reads `DATABASE_URL`, and writes generated migrations to `src/db/migrations`.

### Tables

`users`

- Clerk user ID (PK), email (unique), first/last name, phone, image URL, `stripeCustomerId`, timestamps.
- Synced by the Clerk webhook. Also backfilled / re-keyed on demand by `ensureUserRow()` (see `src/lib/users.ts`) when bookings or orders need a FK target.

`bookings`

- Confirmation code (`LCW-DD/MM/YYYY-###`), optional Clerk user ID, selected service, vehicle type, date, time, customer contact fields, extras, subtotal, GST, total, `status`, **`paymentMethod`** (`pay_now` / `pay_on_collection`), **`paymentStatus`** (`unpaid` / `pending_payment` / `paid`), **`stripeSessionId`**, and timestamps.
- Indexes for `userId`, `date`, and `createdAt`.
- Status values are `pending`, `confirmed`, `completed`, and `cancelled`.

`orders`

- Generated UUID, optional Clerk user ID, **`stripeSessionId`** (unique), `stripePaymentIntentId`, email, full name, phone, shipping address, items (JSONB: `{ name, qty, amount, productId }[]`), subtotal, GST, shipping, total, currency, status, created-at.
- Inserted by `recordOrderFromSession()` from inside `deliverOrderConfirmation` — runs idempotently from both the success page and the Stripe webhook.
- Indexes for `userId` and `createdAt`.

Both `bookings.userId` and `orders.userId` use `ON DELETE SET NULL ON UPDATE CASCADE` so we can safely re-key a stale `users.id` (e.g. when Clerk recreates an account for the same email) without orphaning history.

## Authentication And Admin Access

Clerk wraps the app in `src/app/layout.tsx` through `ClerkProvider`.

Route protection is handled in `src/proxy.ts`. The `/dashboard` route requires a signed-in Clerk user. Admin authorisation is checked separately by comparing the signed-in user's primary email address against the comma-separated `ADMIN_EMAILS` environment variable.

Admin checks currently exist in:

- `src/app/dashboard/page.tsx`
- `src/app/api/bookings/route.ts` for `GET`
- `src/app/api/bookings/[id]/route.ts` for `PATCH`

## Environment Variables

Create a `.env.local` file for local development. Do not commit real secrets.

```bash
# --- Required ---
DATABASE_URL="postgresql://..."

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

ADMIN_EMAILS="owner@example.com,manager@example.com"

# --- Optional: Stripe (powers booking "pay now" AND products store) ---
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."           # Enables /api/products/stripe-webhook fallback

# --- Optional: EmailJS notifications ---
EMAILJS_SERVICE_ID="service_..."
EMAILJS_TEMPLATE_ID="template_..."          # Booking template — must include {{payment_status}}
EMAILJS_ORDER_TEMPLATE_ID="template_zq9r66g"  # Products order template (defaults to template_zq9r66g)
EMAILJS_PUBLIC_KEY="..."
EMAILJS_PRIVATE_KEY="..."
BOOKING_NOTIFICATION_EMAIL="ops@example.com"

# --- Optional: Cloudinary (image CDN, before/after gallery) ---
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# --- Optional: Drizzle migrations against a non-pooled URL ---
DATABASE_URL_UNPOOLED="postgresql://..."
```

| Variable | Required | Used by | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | Drizzle, Neon client, seed script | Postgres connection string. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk frontend/runtime | Public Clerk browser key. |
| `CLERK_SECRET_KEY` | Yes | Clerk server runtime | Server-side Clerk API key. |
| `CLERK_WEBHOOK_SECRET` | For webhook | Clerk webhook route | Verifies Svix webhook signatures. |
| `ADMIN_EMAILS` | For admin access | Dashboard and admin APIs | Comma-separated allowlist of admin email addresses. |
| `STRIPE_SECRET_KEY` | For pay-now flows | Booking POST, products checkout, success-page reconciliation | Enables the booking "pay now" option and the products store. Without it the pay-now branch returns 503 and `/products/checkout` shows a "payments not configured" message. |
| `STRIPE_WEBHOOK_SECRET` | Recommended in prod | `/api/products/stripe-webhook` | Stripe signature verification. Without it the webhook is a no-op and we rely on the success-page reconciliation only. |
| `EMAILJS_SERVICE_ID` / `EMAILJS_TEMPLATE_ID` / `EMAILJS_PUBLIC_KEY` / `EMAILJS_PRIVATE_KEY` | For booking emails | `sendBookingNotification` | EmailJS booking template must include the `{{payment_status}}` variable. |
| `EMAILJS_ORDER_TEMPLATE_ID` | Optional | `sendOrderConfirmation` | Products store order template id (defaults to `template_zq9r66g`). |
| `BOOKING_NOTIFICATION_EMAIL` | Optional | Booking emails | Where booking notifications are sent. Defaults to the first `ADMIN_EMAILS` entry, then the customer. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Optional | Image loader | Cloudinary cloud name for the custom `next/image` loader. |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` / `CLOUDINARY_CLOUD_NAME` | For before/after gallery | `lib/cloudinary.ts` | Server-only credentials for the Admin Search API. |
| `DATABASE_URL_UNPOOLED` | Optional | Drizzle migrations | Use a non-pooled URL for `drizzle-kit` operations. |

Depending on your Clerk setup, you may also configure Clerk redirect URLs such as `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL`. The post-sign-in / post-sign-up fallback is `/account`.

## Local Development

### Prerequisites

- Node.js 20 or newer recommended.
- npm.
- A Neon Postgres database or compatible PostgreSQL connection string.
- A Clerk application for authentication.

### Setup

```bash
npm install
```

Create `.env.local` with the required environment variables.

Push the Drizzle schema to your database:

```bash
npm run db:push
```

Optionally seed sample bookings:

```bash
npm run db:seed
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Starts the Next.js development server with Turbopack. |
| `npm run build` | Builds the production app. |
| `npm run start` | Starts the production Next.js server after a build. |
| `npm run lint` | Runs ESLint across the project. |
| `npm run db:generate` | Generates Drizzle migration files from schema changes. |
| `npm run db:push` | Pushes the current Drizzle schema to the configured database. |
| `npm run db:studio` | Opens Drizzle Studio for database inspection. |
| `npm run db:seed` | Seeds sample booking rows using `.env.local`. |

## Booking Flow

1. A customer selects a service from `src/data/services.ts`.
2. The customer selects a vehicle type, date, time slot, and optional add-ons.
3. The customer fills contact details (name, email, phone, address) and picks a **payment method**: pay now (Stripe) or pay at collection. Signed-in customers get name/email/phone/address prefilled from Clerk and their most recent booking.
4. The form validates input with Zod and React Hook Form.
5. `POST /api/bookings` recalculates trusted pricing on the server, generates an `LCW-DD/MM/YYYY-###` confirmation code, and inserts the booking with the chosen payment method.
   - **Pay at collection** → fires the EmailJS booking notification immediately with `{{payment_status}} = "Pay later - At collection"` and returns a redirect URL to `/success?code=…`.
   - **Pay now** → saves the booking as `pending_payment`, creates a Stripe Checkout Session (one line item per service + each extra), and returns the `checkoutUrl`. EmailJS is **not** sent yet.
6. Stripe redirects pay-now customers back to `/success?code=…&session_id=…`. `reconcileBookingPayment()` verifies the session, marks the booking `paid`/`confirmed`, and fires EmailJS with `{{payment_status}} = "PAID - Online"`. Idempotent via a `booking_email_sent` flag on the PaymentIntent metadata.
7. The `/success` page shows the confirmation code and booking summary.

## Customer Account Dashboard

`/account` is a single Shopify-style page with tabbed compact lists:

- **Bookings** tab (brand blue) — `/account?tab=bookings` (default). Click a row → `/success?code=…`.
- **Orders** tab (amber) — `/account?tab=orders`. Click a row → `/account/orders/[id]` detail page, auth-gated to the buyer.

Empty states for each tab. The old `/account/bookings` URL redirects to `/account`.

## Admin Dashboard

The dashboard is server-rendered with `dynamic = "force-dynamic"` so it reads fresh booking data. It loads:

- Recent bookings through `listBookings`.
- Total booking count and revenue through `getBookingStats`.
- Service popularity through `getServicePopularity`.
- Vehicle distribution through `getVehicleDistribution`.
- Mock cost and profit data from `src/data/mock-dashboard.ts`.

Users must be signed in and listed in `ADMIN_EMAILS` to access `/dashboard`.

## Deployment Notes

This is a standard Next.js app and can be deployed to Vercel or another Node-compatible host.

Before deploying:

- Add production values for all required environment variables.
- Ensure `DATABASE_URL` points to a reachable production Postgres database.
- Run `npm run db:push` or apply generated migrations against production intentionally.
- Configure the Clerk webhook endpoint as `https://your-domain.com/api/webhooks/clerk`.
- Store the webhook signing secret as `CLERK_WEBHOOK_SECRET`.
- Add the production admin email addresses to `ADMIN_EMAILS`.

Build and start locally with:

```bash
npm run build
npm run start
```

## Known Notes

- Dashboard customer analytics use live booking aggregates, while cost analytics use mock data from `src/data/mock-dashboard.ts`.
- Booking confirmation codes are `LCW-DD/MM/YYYY-###`. `GET /api/bookings/[id]` looks up by database UUID, not by confirmation code; the `/success` page uses `getBookingByCode()` instead.
- Booking notifications go to `BOOKING_NOTIFICATION_EMAIL` (or the first `ADMIN_EMAILS` entry) — they're internal-ops notifications, not yet a customer-facing booking receipt.
- There is **no booking Stripe webhook** — pay-now bookings rely on the `/success` page reconciliation. If a customer pays but never lands on the success page, the email won't fire. (Products store has the webhook fallback.)
- `src/proxy.ts` uses the Next.js proxy convention for route protection rather than a legacy `middleware.ts` file.

## License

No license file is currently included in this repository. Add one before distributing or open-sourcing the project.
