# SEO Action Plan — logancarwash.com.au
**Generated:** 2026-04-30 | **Overall Score:** 70 / 100

---

## 🔴 Critical — Fix immediately (risk of penalty or broken functionality)

### C1. Fix `openingHoursSpecification` key-split bug
**File:** `src/lib/seo/jsonld.ts` line 39  
**Impact:** Business hours show as `"opens": "08"` instead of `"08:30"` in Google Search  
**Fix:** Change the separator used to build the hours key from `-` to `|`

### C2. Remove fake Review schema
**Files:** `src/lib/seo/jsonld.ts` (lines 253–290), `src/components/ReviewsSection.tsx`  
**Impact:** Review schema for non-genuine reviews = potential Google manual action  
**Fix:** Delete `reviewsLd()` call from all pages. Replace testimonials with real Google reviews or remove them

### C3. Move H1 out of BannerSlider (client component)
**File:** `src/components/BannerSlider.tsx`, `src/app/(marketing)/page.tsx`  
**Impact:** H1 not in initial server-rendered HTML — Googlebot's first pass misses it  
**Fix:** Render the H1 statically in `page.tsx` as a server component; the text is static

### C4. Fix or remove hardcoded AggregateRating
**File:** `src/lib/seo/jsonld.ts` lines 103–109  
**Impact:** Static `4.9 / 2,400` not connected to live data = structured data guideline violation  
**Fix:** Connect to Google Business Profile API, or remove `aggregateRating` until dynamic

---

## 🟠 High — Fix within 1 week

### H1. Add `/faq` to sitemap
**File:** `src/app/sitemap.ts`  
**Fix:** Add one entry:
```ts
{ url: `${SITE_URL}/faq`, lastModified: "2026-04-30" }
```

### H2. Fix VideoObject HTTP → HTTPS + duplicate URLs
**File:** `src/data/services.ts`  
**Fix:** Change all `http://youtu.be/` to `https://www.youtube.com/embed/`. Assign unique video to each service.

### H3. Remove broken SearchAction from WebSite schema
**File:** `src/lib/seo/jsonld.ts`  
**Fix:** Remove `potentialAction` from `websiteLd()` — `/services?q=` is not a functional search endpoint

### H4. Remove `"CarWash"` from @type array
**File:** `src/lib/seo/jsonld.ts` line 113  
**Fix:** Change to `["LocalBusiness", "AutomotiveBusiness"]` — `CarWash` is not a valid Schema.org type

### H5. Add Privacy Policy page
**Impact:** Required under Australian Privacy Act 1988; QRG trustworthiness signal  
**Fix:** Create `src/app/(marketing)/privacy/page.tsx` and link from footer

### H6. Fix broken `/locations` hrefs → 404
**Files:** `src/app/(marketing)/success/page.tsx`, `src/app/not-found.tsx`  
**Fix:** Change `href="/locations"` → `href="/contact"` in both files

### H7. Fix LCP: hero image behind JS execution gate
**File:** `src/components/BannerSlider.tsx`, `src/app/(marketing)/layout.tsx`  
**Fix (quick):** Add `<link rel="preload" as="image" href="/banner1.webp" fetchPriority="high" />` to the marketing layout  
**Fix (proper):** Extract first slide image into a server-rendered component so Next.js emits the preload hint automatically

---

## 🟡 Medium — Fix within 1 month

### M1. Fix sitemap `lastModified` strategy
**File:** `src/app/sitemap.ts`  
**Fix:** Replace `const now = new Date()` with hardcoded date strings (`"2026-04-30"`). Update manually on real content changes. Remove `changeFrequency` and `priority` fields (Google ignores both).

### M2. Fix services page title duplication
**File:** `src/app/(marketing)/services/page.tsx`  
**Fix:** Change `title: "Car Wash & Detailing Services — Logan QLD"` → `title: "Car Wash & Detailing Services"` (template appends brand + location automatically)

### M3. Fix breadcrumb middle item on location pages
**Files:** `src/app/(marketing)/locations/loganholme/page.tsx`, `src/app/(marketing)/locations/shailer-park/page.tsx`  
**Fix:** Change `{ name: "Locations", url: "/contact" }` → `{ name: "Contact", url: "/contact" }` to match the actual destination page title

### M4. Fix CLS: Instrument Serif font swap on H1
**File:** `src/app/layout.tsx`  
**Fix:** Change `display: "swap"` → `display: "optional"` for `Instrument_Serif` — eliminates reflow; blank renders better than mismatched system serif at display sizes

### M5. Add `preconnect` for Cloudinary
**File:** `src/app/(marketing)/layout.tsx`  
**Fix:** Add `<link rel="preconnect" href="https://res.cloudinary.com" />` to reduce first-image connection overhead

### M6. Differentiate `/reviews` page content
**File:** `src/app/(marketing)/reviews/page.tsx`  
**Fix:** Add unique content (review summary stats, themed breakdown, Google review embed) or redirect to `/#reviews` and remove the page

### M7. Update footer copyright year
**File:** `src/components/SiteFooter.tsx`  
**Fix:** Change `© 2024` → `© 2026`

### M8. Add visible social media links
**File:** `src/components/SiteFooter.tsx`  
**Fix:** Surface `SOCIAL_LINKS` from `business.ts` as visible anchor elements in the footer (Facebook, Instagram already exist in schema `sameAs` but nowhere in the UI)

### M9. Expand "92% water reclaimed" claim
**Impact:** Bare stat with no explanation — uncitable by AI systems, unverifiable by raters  
**Fix:** Add one paragraph on the homepage or services page explaining the water reclamation process

### M10. Add `Organization` postal address
**File:** `src/lib/seo/jsonld.ts`  
**Fix:** Add `address` property to `organizationLd()` using Loganholme as the primary/registered address

### M11. Add `ReserveAction` to both LocalBusiness blocks
**File:** `src/lib/seo/jsonld.ts`  
**Fix:** Add `potentialAction: { "@type": "ReserveAction", target: "https://logancarwash.com.au/bookings" }` to both LocalBusiness entities — enables "Book" action in local knowledge cards

### M12. Add BreadcrumbList to `/bookings` page
**File:** `src/app/(marketing)/bookings/page.tsx`  
**Fix:** Only public marketing page with zero schema

---

## 🟢 Low — Backlog

### L1. Fix BannerSlider arrow button touch targets
**File:** `src/components/BannerSlider.tsx`  
**Fix:** Change arrow buttons from `size-9` (36px) → `size-12` (48px) to meet touch target guidelines

### L2. Write unique image alt text for service cards
**File:** `src/components/ServicesSection.tsx` line 52  
**Fix:** Replace `${service.name} — car wash service` with descriptive alt text for each image

### L3. Move service images to self-hosted Cloudinary
**File:** `src/data/services.ts`  
**Fix:** Replace Unsplash URLs with uploaded Cloudinary assets — eliminates double CDN hop and external dependency

### L4. Fix manifest icon sizes
**File:** `src/app/manifest.ts`, `public/sparklesLogo.png`  
**Fix:** Either create a properly squared 512×512 icon or update the manifest to declare actual dimensions (260×213). The current mismatch causes distorted PWA home screen icons.

### L5. Fix `offerCount` in `serviceLd()`
**File:** `src/lib/seo/jsonld.ts`  
**Fix:** Change hardcoded `offerCount: 3` to `2` to match the actual number of PriceSpecification items, or add a wagon tier to make it accurate

### L6. Trim `/services` meta description
**File:** `src/app/(marketing)/services/page.tsx`  
**Fix:** Reduce from 176 chars to under 158 to avoid SERP truncation

### L7. Add contact form or mailto link to `/contact`
**File:** `src/app/(marketing)/contact/page.tsx`  
**Fix:** Add at minimum a visible `mailto:` email address. The page currently has no way to contact the business except by phone.

### L8. Add `/success` and `/account` to robots.txt disallow
**File:** `src/app/robots.ts`  
**Fix:** Add to disallow array for defence-in-depth

### L9. Upgrade FAQ title tag
**File:** `src/app/(marketing)/faq/page.tsx`  
**Fix:** Change `title: "FAQ — Hyperdome Car Wash, Logan QLD"` to something more descriptive like `"Car Wash FAQs — Pricing, Booking & Services"`

### L10. Verify meta descriptions render in live HTTP response
**Action:** Run `curl -s https://logancarwash.com.au/services | grep -i "description"` to confirm server-rendered metadata is present in the initial HTML

---

## Summary by Effort vs Impact

| Fix | Effort | Impact |
|-----|--------|--------|
| C2: Remove fake reviews | Low | 🔴 Critical |
| C1: Fix hours schema bug | Low (1 line) | 🔴 Critical |
| H1: Add /faq to sitemap | Low (2 lines) | 🟠 High |
| H6: Fix /locations 404 hrefs | Low (2 lines) | 🟠 High |
| H3: Remove broken SearchAction | Low (delete) | 🟠 High |
| H4: Remove "CarWash" @type | Low (1 line) | 🟠 High |
| H2: Fix VideoObject HTTP→HTTPS | Low (5 lines) | 🟠 High |
| M7: Update copyright year | Low (1 char) | 🟢 Low effort / visible |
| M1: Fix sitemap lastModified | Low | 🟡 Medium |
| M2: Fix title duplication | Low (1 line) | 🟡 Medium |
| C3: Move H1 to server component | Medium | 🔴 Critical |
| C4: Fix AggregateRating | Medium | 🔴 Critical |
| H7: Fix LCP preload | Medium | 🟠 High |
| H5: Add Privacy Policy | Medium | 🟠 High |
| M4: Instrument Serif display:optional | Low (1 word) | 🟡 Medium |
| M8: Add social links to footer | Low | 🟡 Medium |
