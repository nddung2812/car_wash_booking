# SEO Audit Report — logancarwash.com.au
**Business:** Hyperdome Car Wash, Logan QLD  
**Audit date:** 2026-04-30 | **Site age:** ~6 days indexed  
**Auditors:** 5 specialist agents (technical, content, schema, sitemap, performance) + inline analysis

---

## SEO Health Score: 70 / 100

| Category | Weight | Score | Status |
|----------|--------|-------|--------|
| Technical SEO | 25% | 74 | ⚠️ Pass with issues |
| Content Quality / E-E-A-T | 25% | 71 | ⚠️ Pass with issues |
| On-Page SEO | 20% | 78 | ✅ Pass |
| Schema / Structured Data | 10% | 38 | 🔴 Needs work |
| Performance (CWV) | 10% | 71 | ⚠️ Needs Improvement |
| Images | 5% | 65 | ⚠️ Issues |
| AI Search Readiness | 5% | 74 | ⚠️ Good foundation |

**Weighted score:** 70 / 100 — "Needs Improvement"

---

## Executive Summary

The site has a strong foundation: clean Next.js 16 App Router architecture, correct HTTPS/HSTS config, well-written meta descriptions on every page, solid location content (~70–75% unique), a correctly configured robots.txt that explicitly allows all major AI crawlers, and a comprehensive JSON-LD schema layer in `src/lib/seo/jsonld.ts`. For a site only 6 days into Google's index, this is genuinely above average.

However, **five issues pose real risk** that goes beyond optimization into potential penalties:

1. **Fake reviews in structured data** — Review schema emits names (Sarah Johnson, Mike Chen, Emily Rodriguez…) and dates that predate the website's existence. Google may issue a manual action.
2. **Hardcoded opening hours schema is broken** — A string-split bug outputs `"opens": "08"` instead of `"08:30"`. Business hours show incorrectly in Search.
3. **Hardcoded AggregateRating** — Static `4.9 / 2,400 reviews` not connected to live data; if inaccurate, this is a guideline violation.
4. **H1 is inside a client component** — `BannerSlider.tsx` renders the H1 client-side; it is absent from the initial server-rendered HTML that Googlebot's first pass sees.
5. **No Privacy Policy** — A site collecting bookings and Clerk auth data has legal obligations under the Australian Privacy Act 1988; absence is also a QRG trustworthiness signal.

The other top quick win is a one-line fix: **add `/faq` to the sitemap**. The FAQ page carries FAQPage schema and is the highest-value featured-snippet / AI Overview target on the site — and Googlebot has no sitemap signal for it.

### Top 5 Quick Wins (under 1 hour each)
1. Fix the `openingHoursSpecification` key-split bug in `jsonld.ts` (1 line)
2. Add `/faq` to `sitemap.ts` (2 lines)
3. Remove the fake Review schema from `jsonld.ts`
4. Fix VideoObject `http://` → `https://` in `services.ts` (5 lines)
5. Fix broken `/locations` hrefs in `success.tsx` and `not-found.tsx` (2 lines)

---

## 1. Technical SEO — 74 / 100

### ✅ Passes
- robots.txt correctly allows all content, disallows `/api/`, `/dashboard`, `/sign-in`, `/sign-up`
- All AI crawlers explicitly allowed (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot)
- `sitemap.xml` declared in robots.txt ✓
- HTTPS enforced with full HSTS preload (`max-age=63072000; includeSubDomains; preload`)
- All security headers set: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy
- `X-Powered-By` removed
- Self-referencing canonical tags on every page
- `lang="en-AU"` on `<html>` element
- Correct `robots: { index: false }` on `/success` and `/account/bookings`
- URL structure: lowercase, hyphenated, semantic slugs throughout

### 🔴 Critical
**H1 inside client component (BannerSlider.tsx)**  
`BannerSlider.tsx` is `"use client"`. The `<h1>` renders client-side — absent from the initial SSR HTML Googlebot reads first. For a 6-day-old site, the first HTTP response is what gets indexed. The H1 text is static; it has no dependency on client state.  
**Fix:** Extract the `<h1>` into the server-side `page.tsx` and pass it as a prop overlay, or render it statically above the client BannerSlider component.  
**File:** `src/components/BannerSlider.tsx`, `src/app/(marketing)/page.tsx`

### 🟠 High
**`/faq` missing from sitemap**  
`/faq` is live, internally linked, has canonical, metadata, and FAQPage schema — but `sitemap.ts` has no entry for it.  
**Fix:** Add to `src/app/sitemap.ts`:
```ts
{ url: `${SITE_URL}/faq`, lastModified: "2026-04-30", changeFrequency: "monthly", priority: 0.8 }
```

**Broken `/locations` internal links**  
`success/page.tsx` and `not-found.tsx` link to `/locations` which returns a 404. No `/locations` index page exists.  
**Fix:** Change `href="/locations"` → `href="/contact"` in both files.

**Services page title has duplicate "Logan QLD"**  
Rendered title: `"Car Wash & Detailing Services — Logan QLD | Hyperdome Car Wash Logan QLD"` (75 chars, will be truncated).  
**Fix:** Change `src/app/(marketing)/services/page.tsx` title to `"Car Wash & Detailing Services"` — the template appends `| Hyperdome Car Wash Logan QLD` automatically.

### 🟡 Medium
**Sitemap `lastModified: now`**  
Every request regenerates all lastmod timestamps as the current time, meaning Google sees all 7 pages as "just modified" on every crawl. This trains Google to ignore the field.  
**Fix:** Use hardcoded date strings (`"2026-04-30"`) and update manually on real content changes.

**`changeFrequency` and `priority` in sitemap**  
Google ignores both fields. They add XML noise with no crawl benefit.  
**Fix:** Remove both fields from all entries.

### 🟢 Low
- Add `/success` and `/account` to `robots.ts` disallow list as defence-in-depth
- Consider `Content-Security-Policy-Report-Only` header (GTM + Clerk make a strict CSP complex)
- `Host:` directive in robots.txt is non-standard (harmless but unnecessary)

---

## 2. Content Quality / E-E-A-T — 71 / 100

### E-E-A-T Breakdown
| Signal | Score | Notes |
|--------|-------|-------|
| Experience | 58/100 | Strong operational specifics; weak on staff identity and real review sourcing |
| Expertise | 72/100 | Trade-accurate terminology, pricing, FAQ; no named author or certifications |
| Authoritativeness | 62/100 | ABN present, Google Maps, schema `sameAs`; no press/awards |
| Trustworthiness | 68/100 | Consistent NAP, HTTPS, canonicals; no Privacy Policy, no contact form |

### 🔴 Critical
**Hardcoded testimonials appear fabricated**  
`ReviewsSection.tsx` and `jsonld.ts` contain 6 reviews with Western-pattern names (Sarah Johnson, Mike Chen, Emily Rodriguez, David Thompson, Lisa Martinez, James Wilson) and relative dates. Review schema dates predate the website's indexed existence. This is the most damaging E-E-A-T signal on the site.  
**Fix:** Remove the `reviewsLd()` call from the homepage schema immediately. Replace the hardcoded testimonials with real Google reviews (embed or API) or anonymised genuine reviews with accurate dates.  
**Files:** `src/lib/seo/jsonld.ts` lines 253–290, `src/components/ReviewsSection.tsx`

### 🟠 High
**No Privacy Policy**  
A site collecting name, email, vehicle details via Clerk auth and booking form has obligations under the Australian Privacy Act 1988. Absence is also a QRG trustworthiness deduction.  
**Fix:** Create `src/app/(marketing)/privacy/page.tsx` with an Australian-compliant privacy policy and link from the footer.

**`/reviews` page is near-duplicate of homepage**  
~60 words of unique prose; entire body is the same `ReviewsSection` component used on the homepage. Google's thin/duplicate content signals will suppress this page.  
**Fix:** Either add substantial unique content to `/reviews` (stats, themed summaries, verified review embed) or redirect `/reviews` → `/#reviews` and remove the page.

### 🟡 Medium
- Add supporting paragraph for the "92% water reclaimed" claim — it appears in the hero stats with no explanation anywhere on the site
- Add visible social media links (Facebook, Instagram exist in `SOCIAL_LINKS` in `business.ts` but appear nowhere in the UI — header or footer)
- Update footer copyright from © 2024 → © 2026 (`src/components/SiteFooter.tsx`)
- Expand contact page — ~80 words of unique content, no contact form, no email. Add a `mailto:` link at minimum
- Consider `display: optional` for Instrument Serif to prevent CLS from font swap on the large H1 headline

### 🟢 Low
- Service image alt text is generic (`${service.name} — car wash service`) — write unique descriptive alt text per image (`src/components/ServicesSection.tsx` line 52)
- Pre-open 2–3 FAQ accordion items (most important pricing/timing ones) for better passage-level indexing
- Trim `/services` meta description from 176 chars to under 158 to avoid SERP truncation

---

## 3. On-Page SEO — 78 / 100

### Meta Descriptions (all present ✅)
All 7 pages have unique, keyword-rich meta descriptions in code. The WebFetch extractor missed them — confirmed by reading source files.

| Page | Meta Description | Length | Status |
|------|-----------------|--------|--------|
| / | "Professional car wash in Logan QLD…" | 155 chars | ✅ |
| /services | "Compare Hyperdome Car Wash packages…" | 176 chars | ⚠️ Too long |
| /locations/shailer-park | "Hyperdome Car Wash on Mandew St…" | 165 chars | ✅ |
| /locations/loganholme | "Hyperdome Car Wash on 2 Leda Dr…" | 172 chars | ✅ |
| /faq | "Frequently asked questions about Hyperdome…" | 136 chars | ✅ |
| /contact | "Contact Hyperdome Car Wash in Logan QLD…" | 124 chars | ✅ |
| /reviews | Present | 152 chars | ✅ |

### Title Tags
| Page | Rendered Title | Chars | Status |
|------|---------------|-------|--------|
| / | "Hyperdome Car Wash Logan QLD — Hand-Finished Detailing & Same-Day Bookings" | 74 | ✅ |
| /services | "Car Wash & Detailing Services — Logan QLD \| Hyperdome Car Wash Logan QLD" | 75 | ⚠️ Duplicate location |
| /locations/shailer-park | "Car Wash Shailer Park — Hyperdome Shopping Centre QLD 4128 \| Hyperdome Car Wash Logan QLD" | 90 | ⚠️ Long |
| /locations/loganholme | "Car Wash Loganholme — Hyperdome Shopping Centre QLD 4129 \| Hyperdome Car Wash Logan QLD" | 88 | ⚠️ Long |
| /faq | "FAQ — Hyperdome Car Wash, Logan QLD \| Hyperdome Car Wash Logan QLD" | 67 | ⚠️ Weak anchor |
| /contact | "Contact — Shailer Park & Loganholme QLD \| Hyperdome Car Wash Logan QLD" | 70 | ✅ |

### Internal Linking
- Booking deep links with service params (`/bookings?service=sparkles` etc.) — excellent ✅
- `/faq` linked only from footer — low link equity for high-value page
- `/reviews` has lowest sitemap priority (0.6) despite having 2,400 Google reviews as its core value
- No `/locations` index exists; `/contact` serves as the de facto hub — breadcrumbs mismatch this

### AI Search Readiness — 74 / 100
- robots.txt explicitly allows all major AI bots ✅
- `llms.txt` exists in public/ ✅
- FAQ page has clean Q&A structure — high passage citability ✅
- Pricing table is highly citable ($40 Sparkles, $60 Super Sparkles, etc.) ✅
- "92% water reclaimed" stat lacks supporting explanation — uncitable bare claim
- No schema → AI can't extract structured entity relationships (partially fixed by existing schema)

---

## 4. Schema / Structured Data — 38 / 100

Schema infrastructure exists and is well-architected (`src/lib/seo/jsonld.ts`). However several bugs and violations pull the score down severely.

### Schema Coverage by Page
| Page | Schema Types | Status |
|------|-------------|--------|
| All pages (layout) | Organization, WebSite | ⚠️ Issues |
| / | LocalBusiness×2, OfferCatalog, BreadcrumbList, Review×6 | 🔴 Fake reviews |
| /services | OfferCatalog×2, Service×5, VideoObject×5, BreadcrumbList | 🔴 HTTP URLs |
| /locations/* | LocalBusiness, BreadcrumbList | 🔴 Hours bug |
| /faq | FAQPage, BreadcrumbList | ✅ Correct |
| /contact | LocalBusiness×2, BreadcrumbList | 🔴 Hours bug |
| /bookings | None | ⚠️ Missing |
| /reviews | Review×6 | 🔴 Fake reviews |

### 🔴 Critical Bugs

**1. `openingHoursSpecification` key-split bug** (`jsonld.ts` line 39)  
```ts
const [opens, closes] = key.split("-"); // key = "08:30-17:00"
// Produces: opens="08", closes="30" ← WRONG
```
Fix: use `|` as separator:
```ts
const key = `${opens}|${closes}`;
// Then: const [opens, closes] = key.split("|"); // correct
```

**2. Fake Review schema** (`jsonld.ts` lines 253–290)  
Western-pattern names with dates predating site launch. Violates Google's review guidelines. Remove `reviewsLd()` entirely from all pages.

**3. `VideoObject` uses HTTP YouTube URLs** (`services.ts`)  
`http://youtu.be/6tRqXG0OUqA` — Google requires HTTPS. Two services share the same video URL (sparkles + super-sparkles).  
Fix: `https://www.youtube.com/embed/{VIDEO_ID}` and ensure each service has a unique valid video.

**4. `WebSite` SearchAction points to non-functional endpoint**  
`/services?q={search_term_string}` — the services page has no search functionality. Submitting via Google's Sitelinks Search Box returns the same static page regardless of query.  
Fix: Remove `potentialAction` from `websiteLd()` until a real search endpoint exists.

### 🟠 High

**5. `"CarWash"` is not a valid Schema.org type**  
`["LocalBusiness", "AutomotiveBusiness", "CarWash"]` — `CarWash` doesn't exist in Schema.org vocabulary. Will generate validator warnings.  
Fix: Change to `["LocalBusiness", "AutomotiveBusiness"]`.

**6. Hardcoded `AggregateRating`**  
Static `ratingValue: "4.9", reviewCount: "2400"` not connected to live data. If stale, this is a guideline violation.  
Fix: Either connect to Google Business Profile API or remove `aggregateRating` until it can be populated accurately.

**7. `Organization` missing postal address**  
Google uses this for Knowledge Panel. Both `LocalBusiness` branches have addresses but the parent `Organization` does not.

### 🟡 Medium
- Add `ReserveAction` `potentialAction` to both LocalBusiness blocks → enables "Book" action links in local knowledge cards
- Add BreadcrumbList to `/bookings` page (only public page with no schema)
- Fix `offerCount: 3` in `serviceLd()` — only 2 `PriceSpecification` items are emitted
- Fix homepage BreadcrumbList (single-item breadcrumb provides no navigational context)
- Fix breadcrumb middle item on location pages: `{ name: "Locations", url: "/contact" }` is semantically wrong

---

## 5. Performance / Core Web Vitals — 71 / 100

*Note: CrUX field data unavailable until ~28 days of traffic. These are source-code estimates.*

| Metric | Estimated | Threshold | Status |
|--------|-----------|-----------|--------|
| TTFB | 20–80ms | <800ms | ✅ Good |
| LCP | 2.4–3.2s | ≤2.5s | ⚠️ Borderline |
| INP | 80–150ms | ≤200ms | ✅ Good |
| CLS | 0.08–0.18 | ≤0.1 | ⚠️ At risk |

### 🔴 Critical — LCP
Hero image (`banner1.webp`) is inside `BannerSlider.tsx` (`"use client"`). The browser must parse and execute the JavaScript bundle before it can discover and fetch the image — no `<link rel="preload">` is emitted in the `<head>`. On mid-range mobile this adds 400–800ms.  
**Fix:** Extract the first slide image into a server component or add an explicit preload in the marketing layout head.

### 🟠 High — CLS
Three fonts with `display: swap` (Poppins 7 weights, Instrument Serif, JetBrains Mono). Instrument Serif on the large H1 headline (`clamp(48px, 7.2vw, 96px)`) is the primary CLS risk — system serif fallback metrics differ significantly.  
**Fix:** Change Instrument Serif to `display: "optional"` in `src/app/layout.tsx` — eliminates reflow by showing blank rather than a mismatched fallback at a display-only size.

### 🟡 Medium
- Add `<link rel="preconnect" href="https://res.cloudinary.com" />` to reduce first-image DNS+TCP latency (~100–200ms)
- Move Unsplash service images to self-hosted Cloudinary assets (eliminates double CDN hop)
- Manifest icon size mismatch: `sparklesLogo.png` is 260×213px (non-square) but declared as `192x192` and `512x512` in `manifest.ts`

### 🟢 Low
- BannerSlider arrow buttons are `size-9` (36px) — below 44px touch target minimum. Change to `size-12` (48px) in `BannerSlider.tsx`
- Confirm GTM is not double-firing GA (both `gtm.js` and `gtag/js` loaded simultaneously)
- Clerk JS (~200kB gzipped) loads on all pages including pure marketing pages; consider conditional loading for unauthenticated visitors

---

## 6. Images — 65 / 100

| Issue | Severity | File |
|-------|----------|------|
| Service card alt text all generic (`${name} — car wash service`) | Medium | `ServicesSection.tsx:52` |
| Service images from Unsplash via Cloudinary fetch (double hop, external dependency) | Medium | `src/data/services.ts` |
| `sparklesLogo.png` is 260×213 (non-square) used as favicon source | Low | `public/sparklesLogo.png` |
| Manifest declares 192×192 and 512×512 but image is only 260×213 | Low | `src/app/manifest.ts` |
| `SparklesLogo` component sets `priority` unconditionally (not needed if not in critical path) | Low | `src/components/SparklesLogo.tsx` |

---

## 7. Sitemap — 61 / 100

| Check | Result |
|-------|--------|
| URL count | ✅ 7 URLs (under 50k limit) |
| XML validity | ✅ Pass |
| /faq missing | 🟠 HIGH |
| lastmod is always `new Date()` | 🟡 Medium |
| changeFrequency present | 🟢 Low (Google ignores it) |
| priority present | 🟢 Low (Google ignores it) |
| Location page quality gates | ✅ Pass (2 pages, well below 30-page threshold) |
| robots.txt alignment | ✅ Pass |

---

## Key Files Reference

| File | Issues |
|------|--------|
| `src/lib/seo/jsonld.ts` | Hours bug (line 39), fake reviews (lines 253–290), SearchAction, CarWash type, AggregateRating, VideoObject thumbnails |
| `src/data/services.ts` | HTTP videoUrl values, duplicate sparkles/super-sparkles videoUrl |
| `src/app/sitemap.ts` | Missing /faq entry, `new Date()` lastmod |
| `src/components/BannerSlider.tsx` | H1 in client component, arrow button size-9 |
| `src/components/ReviewsSection.tsx` | Hardcoded testimonials |
| `src/components/SiteFooter.tsx` | No social links, stale © 2024 |
| `src/app/(marketing)/services/page.tsx` | Title duplication ("Logan QLD" twice) |
| `src/app/(marketing)/locations/*/page.tsx` | Breadcrumb middle item points to /contact |
| `src/app/(marketing)/success/page.tsx` | href="/locations" → 404 |
| `src/app/not-found.tsx` | href="/locations" → 404 |
| `src/app/layout.tsx` | Instrument Serif display:swap → display:optional |
