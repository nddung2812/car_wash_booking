# Hyperdome Car Wash Booking

Hyperdome Car Wash Booking is a Next.js app for browsing car wash services, booking appointments online, and reviewing booking activity in an authenticated admin dashboard.

The app combines a marketing landing page, Clerk authentication, a multi-step booking form, Neon Postgres storage through Drizzle ORM, and admin-only dashboard pages for booking and analytics workflows.

## Features

- Responsive landing page with hero imagery, service cards, add-on service pricing, reviews, business hours, locations, and embedded map.
- Multi-step booking flow for service, vehicle type, date, time, and customer contact details.
- Dynamic pricing based on selected service and vehicle type, including GST calculation.
- Public booking creation API backed by Postgres.
- Clerk sign-in and sign-up pages.
- Clerk webhook endpoint that syncs user records into the database.
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
    api/
      bookings/              Booking API routes
      webhooks/clerk/        Clerk user sync webhook
    dashboard/               Admin dashboard page
    sign-in/                 Clerk sign-in route
    sign-up/                 Clerk sign-up route
    layout.tsx               Root layout, fonts, ClerkProvider
    page.tsx                 Public landing and booking page
  components/
    dashboard/               Dashboard tables, charts, analytics, CMS widgets
    ui/                      Shared UI primitives
    visuals/                 Brand and motion components
    BookingForm.tsx          Public booking form
    Header.tsx               Site header and auth controls
  data/
    services.ts              Service catalogue, vehicle types, time slots
    mock-dashboard.ts        Seed and mock analytics data
  db/
    index.ts                 Lazy Neon/Drizzle database client
    queries.ts               Dashboard and booking query helpers
    schema.ts                Users/bookings schema and types
    seed.ts                  Development seed script
  lib/
    utils.ts                 Shared utility helpers
  proxy.ts                   Clerk route protection
```

## Routes

| Route | File | Description |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | Public landing page and booking flow |
| `/dashboard` | `src/app/dashboard/page.tsx` | Admin-only dashboard |
| `/sign-in/[[...sign-in]]` | `src/app/sign-in/[[...sign-in]]/page.tsx` | Clerk sign-in page |
| `/sign-up/[[...sign-up]]` | `src/app/sign-up/[[...sign-up]]/page.tsx` | Clerk sign-up page |

## API Routes

| Method and path | File | Access | Description |
| --- | --- | --- | --- |
| `POST /api/bookings` | `src/app/api/bookings/route.ts` | Public | Validates booking input, calculates service pricing, stores a pending booking, and returns the created booking. |
| `GET /api/bookings` | `src/app/api/bookings/route.ts` | Admin | Lists recent bookings for dashboard/API use. |
| `GET /api/bookings/[id]` | `src/app/api/bookings/[id]/route.ts` | Public by DB UUID | Returns a booking row by database UUID. |
| `PATCH /api/bookings/[id]` | `src/app/api/bookings/[id]/route.ts` | Admin | Updates booking status to `pending`, `confirmed`, `completed`, or `cancelled`. |
| `POST /api/webhooks/clerk` | `src/app/api/webhooks/clerk/route.ts` | Svix verified | Handles Clerk `user.created`, `user.updated`, and `user.deleted` events. |

## Database

The database layer uses Neon serverless Postgres with Drizzle's HTTP driver.

Main files:

- `src/db/index.ts` creates a lazy database client from `DATABASE_URL`.
- `src/db/schema.ts` defines the `users` and `bookings` tables.
- `src/db/queries.ts` contains dashboard query helpers.
- `src/db/seed.ts` inserts sample bookings from `src/data/mock-dashboard.ts`.
- `drizzle.config.ts` loads `.env.local`, reads `DATABASE_URL`, and writes generated migrations to `src/db/migrations`.

### Tables

`users`

- Stores Clerk user IDs, email, first name, last name, image URL, and timestamps.
- Synced by the Clerk webhook.

`bookings`

- Stores confirmation code, optional Clerk user ID, selected service, vehicle type, date, time, customer contact fields, extras, subtotal, GST, total, status, and timestamps.
- Includes indexes for `userId`, `date`, and `createdAt`.
- Status values are `pending`, `confirmed`, `completed`, and `cancelled`.

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
DATABASE_URL="postgresql://..."

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

ADMIN_EMAILS="owner@example.com,manager@example.com"
```

| Variable | Required | Used by | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | Drizzle, Neon client, seed script | Postgres connection string. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk frontend/runtime | Public Clerk browser key. |
| `CLERK_SECRET_KEY` | Yes | Clerk server runtime | Server-side Clerk API key. |
| `CLERK_WEBHOOK_SECRET` | For webhook | Clerk webhook route | Verifies Svix webhook signatures. |
| `ADMIN_EMAILS` | For admin access | Dashboard and admin APIs | Comma-separated allowlist of admin email addresses. |

Depending on your Clerk setup, you may also configure Clerk redirect URLs such as `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL`.

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
2. The customer selects a vehicle type, date, and time slot.
3. If the customer is signed in, Clerk profile data can prefill name and email fields.
4. The form validates input with Zod and React Hook Form.
5. `POST /api/bookings` recalculates trusted pricing on the server.
6. A pending booking is inserted into Postgres with a generated `HD-xxxxx` confirmation code.
7. The UI displays the confirmation code and selected booking summary.

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

- Extra services are displayed in the UI from `src/data/services.ts`, but the current booking submission stores `extras: []`.
- Dashboard customer analytics use live booking aggregates, while cost analytics use mock data from `src/data/mock-dashboard.ts`.
- The booking success UI mentions an emailed confirmation, but there is no email provider integration in the current code.
- `GET /api/bookings/[id]` currently looks up a booking by database UUID, not by the `HD-xxxxx` confirmation code.
- `src/proxy.ts` uses the Next.js proxy convention for route protection rather than a legacy `middleware.ts` file.

## License

No license file is currently included in this repository. Add one before distributing or open-sourcing the project.
