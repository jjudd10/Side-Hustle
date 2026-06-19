# Home in Time — Project Context

This document is the authoritative reference for LLMs and developers working on this codebase. Read it before making changes. It covers the site's purpose, architecture, design system, file conventions, and every major integration.

---

## Purpose

**Home in Time** (`homeintime.cc`) is a two-sided marketplace for residential architectural floorplans. Two types of users interact with the platform:

- **Buyers** browse, filter, and purchase floorplan packages (PDFs, CAD files, prints) through a Stripe-powered checkout.
- **Creators** (independent designers/architects) register, connect Stripe, upload their plans, and receive 90% of each sale automatically via Stripe Connect transfers.

The platform's aesthetic is **premium and editorial** — warm parchment tones, serif headings, restrained gold accents. Every UI decision should reinforce a sense of curated luxury, not generic e-commerce.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| Styling | Tailwind CSS 3 + co-located CSS modules |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (email/password) |
| Payments | Stripe Checkout (embedded) + Stripe Connect |
| File Storage | Cloudflare R2 (S3-compatible) |
| Email | Resend API |
| Image optimization | `next/image` + Sharp |
| Animation | GSAP |
| Analytics | Vercel Analytics |
| Deployment | Vercel |

---

## Repository Structure

```
Draft - v1/
├── app/                        # All Next.js routes (App Router)
│   ├── layout.tsx              # Root layout — header, footer, NavigationLoader
│   ├── page.tsx                # Root redirect → /home
│   ├── global.css              # Global CSS variables, typography, shared utility classes
│   ├── loading.tsx / loading.css
│   │
│   ├── home/                   # Marketing homepage
│   │   ├── page.tsx
│   │   ├── HeroParallax.tsx    # GSAP parallax hero (Client Component)
│   │   └── home.css
│   │
│   ├── gallery/                # Full plan catalog with filters
│   │   ├── page.tsx            # Server Component — fetches plans
│   │   ├── GalleryClient.tsx   # Client Component — filtering UI
│   │   └── gallery.css
│   │
│   ├── plans/[slug]/           # Individual plan detail
│   │   ├── page.tsx            # Server Component, ISR (revalidate 60s)
│   │   ├── PlanOptionsCard.tsx # Client Component — option selection + checkout
│   │   └── plan.css
│   │
│   ├── about/page.tsx
│   ├── consultation/page.tsx
│   ├── animation/page.tsx      # Scratch/demo page
│   │
│   ├── (styles)/[style]/page.tsx  # Dynamic style pages: /modern, /traditional, /luxury
│   │
│   ├── product/[id]/page.tsx   # Alternate product detail format
│   │
│   ├── checkout/               # Stripe Embedded Checkout
│   │   ├── page.tsx
│   │   ├── EmbeddedCheckout.tsx
│   │   ├── CheckoutForm.tsx
│   │   ├── checkout.css
│   │   └── success/page.tsx    # Post-purchase confirmation
│   │
│   ├── orders/[orderId]/page.tsx  # Order detail / download page
│   │
│   ├── creator/                # Protected creator portal (auth required)
│   │   ├── layout.tsx          # Creator shell layout
│   │   ├── creator.css         # Creator portal design tokens
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Stats, plan list, profile
│   │   │   └── ProfileSettingsForm.tsx
│   │   ├── plans/
│   │   │   ├── new/page.tsx          # Multi-step plan submission form
│   │   │   └── [id]/edit/page.tsx    # 4-step plan edit wizard
│   │   └── stripe-connect/page.tsx   # Stripe Connect onboarding
│   │
│   ├── components/             # App-level components (not shared with pages/)
│   │   ├── NavigationLoader.tsx
│   │   └── LogoTraceLoader.tsx
│   │
│   └── api/                    # API Route Handlers
│       ├── create-checkout-session/route.ts
│       ├── create-payment-intent/route.ts
│       ├── webhooks/stripe/route.ts      # Stripe webhook → deliver files + transfer
│       ├── r2-upload-url/route.ts        # Signed upload URL (public images)
│       ├── r2-upload-private/route.ts    # Signed upload URL (private PDFs/CADs)
│       ├── thumbnails/[filename]/route.ts # Proxy for legacy thumbnail images
│       └── creator/
│           ├── profile/route.ts          # POST/PATCH creator profile
│           ├── plans/
│           │   ├── route.ts              # POST create plan
│           │   └── [id]/route.ts         # PUT update plan
│           ├── logout/route.ts
│           ├── stripe-connect/route.ts
│           └── stripe-connect/return/route.ts
│
├── components/                 # Shared UI components
│   ├── navigation.tsx          # Mobile-aware site nav
│   ├── hero-section.tsx        # Marketing hero with CTAs
│   ├── product-card.tsx        # Reusable plan card
│   └── style-section.tsx       # Style showcase sections
│
├── lib/                        # Shared utilities and service clients
│   ├── planRepository.ts       # Data access layer + TypeScript types
│   ├── content.ts              # Static content (styleHighlights, products, styleDetails)
│   ├── supabaseClient.ts       # Legacy basic client (anon key only)
│   ├── supabaseServerClient.ts # Server clients: getSupabaseServerClient(), getSupabaseServiceClient()
│   ├── supabaseBrowserClient.ts# Browser client for Client Components
│   ├── r2Client.ts             # R2 upload/download signed URL helpers
│   └── resend.ts               # sendPurchaseEmail()
│
├── data/
│   └── BlueprintAsset.png
│
├── middleware.ts               # Auth guard for /creator/* routes
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
└── .env.local                  # Secret keys (never commit)
```

### Where to put new files

| What you're adding | Where it goes |
|---|---|
| New public page | `app/<page-name>/page.tsx` |
| Page-scoped styles | `app/<page-name>/<page-name>.css` (co-locate with the page) |
| New API endpoint | `app/api/<resource>/route.ts` |
| Protected creator page | `app/creator/<page-name>/page.tsx` |
| Reusable UI component | `components/<component-name>.tsx` |
| Service client / utility | `lib/<service-name>.ts` |
| Static content / copy | `lib/content.ts` (extend existing exports) |
| New TypeScript types | `lib/planRepository.ts` (domain types) or co-locate in the file that owns them |

---

## Design System

### Color Palette

All CSS custom properties are defined in `app/global.css` and are the canonical source of truth. **Do not hard-code hex values inline** — always use these variables.

```css
--bg:         #f7f0e2   /* Page background — warm parchment */
--panel:      #afaa90   /* Secondary surface tone */
--text:        #3e3e3e   /* Primary body text */
--muted:       #6a5c57   /* Secondary/caption text */
--brand:       #c7a07a   /* Primary brand warm tan */
--brand-600:   #e2ceb1   /* Lighter brand tone, used for gradients and active states */
--border:      #cec8bd   /* Dividers, card outlines */
--footer-bg:   #efe2cf   /* Footer background — matches the bottom of the body gradient */
```

The Tailwind config extends these with a `primary` brown scale, `secondary` grey scale, and `accent` metals:
- `accent.gold` = `#d4af37`
- `accent.bronze` = `#cd7f32`
- `accent.copper` = `#b87333`

The body gradient fades from `#f3e8d8` at the top through `var(--bg)` and resolves to `var(--footer-bg)` at the bottom so pages feel continuous with the footer.

### Typography

| Role | Font | Usage |
|---|---|---|
| Headings (h1–h6) | Libre Baskerville (serif) | Page titles, card headings, section labels |
| Body / UI | Inter (sans-serif) | All other text, form labels, captions |

Both fonts are loaded via Google Fonts in `global.css`. `Crimson Text` is defined in `tailwind.config.js` but the site currently uses **Libre Baskerville** via the `global.css` font-face rules — trust `global.css` as the active source.

Key typographic conventions:
- `h1` on content pages: ~1.9–2.4rem, no top margin when paired with an eyebrow
- `.eyebrow`: uppercase, `letter-spacing: 0.25em`, `font-size: 0.8rem`, `color: var(--muted)` — used above every major heading
- `.muted`: utility class, `color: var(--muted)`
- Body text: 1rem, color `var(--text)`

### Spacing & Layout

- **Max content width**: 1200px, enforced by `.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }`
- **Section vertical padding**: 48–80px top/bottom as a general guide; match surrounding pages visually
- **Cards and panels**: `border-radius: 10px–16px`, `border: 1px solid var(--border)`, light white or `rgba(255,255,255,0.55)` backgrounds
- **Main content bottom padding**: 64px (set on `main` in `global.css`)

### Buttons

```css
.btn           /* base — pill shape, border-radius: 999px */
.btn-primary   /* brand gradient fill, light text */
.btn-secondary /* border only, no fill */
```

In the creator portal, use `.cp-btn` and `.cp-btn-outline` (defined in `creator.css`).

### Chips

For multi-select filter UIs:
```css
.chip-group   /* flex container */
.chip         /* individual pill */
.chip.is-active  /* selected state — brand border + brand-600 background */
```

### Shared Utility Classes

| Class | Purpose |
|---|---|
| `.container` | Max-width wrapper for all sections |
| `.eyebrow` | Uppercase label above headings |
| `.muted` | Secondary text color |
| `.btn`, `.btn-primary`, `.btn-secondary` | CTA buttons |
| `.chip`, `.chip-group`, `.chip.is-active` | Filter chip buttons |
| `.sr-only` | Accessibility — visually hidden labels |

### Tailwind Utilities (custom)

| Token | Value |
|---|---|
| `bg-gradient-luxury` | `linear-gradient(135deg, #1a1a1a, #2d2d2d)` |
| `bg-gradient-gold` | `linear-gradient(135deg, #d4af37, #b87333)` |
| `shadow-luxury` | Soft multi-layer box shadow |
| `shadow-luxury-lg` | Larger soft shadow |

---

## How to Design a New Page

Follow this checklist whenever adding a new page so it stays visually consistent.

1. **Use the `.container` class** for your content wrapper — never set custom max-widths.
2. **Start sections with an `.eyebrow`** followed by a serif `<h2>` or `<h1>`. This is the standard page opening pattern site-wide.
3. **Use CSS custom properties** for all colors (`var(--brand)`, `var(--text)`, etc.). Never hard-code hex values.
4. **Co-locate page CSS** in the same directory as the page: `app/my-page/my-page.css`. Import it at the top of the page component: `import './my-page.css'`.
5. **Server Components by default** — only add `'use client'` if the component requires browser APIs, event handlers, or React state.
6. **Graceful empty states** — if data comes from Supabase and might be absent, show a human-readable placeholder (see `planRepository.ts` for the `formatStat` pattern).
7. **Typography hierarchy**: one `<h1>` per page, use `<h2>` for sections, `<h3>` for cards/panels.
8. **Images** — always use `next/image` with explicit `width`/`height` or `fill` + `sizes` prop for responsive images.
9. **Creator portal pages** use a separate layout (`app/creator/layout.tsx`) and CSS (`creator.css`) with `cp-` prefixed class names. Do not mix public-site classes into creator pages.
10. **No dark background pages** — the site uses a warm parchment background throughout. Avoid introducing dark-mode or inverted-color sections unless they are small accent blocks.

---

## Supabase Database

### Connection Pattern

Three Supabase clients exist for different contexts:

| File | Client | When to use |
|---|---|---|
| `lib/supabaseServerClient.ts` | `getSupabaseServerClient()` | Server Components that need auth context (reads the session cookie) |
| `lib/supabaseServerClient.ts` | `getSupabaseServiceClient()` | API routes and server actions that need admin access (bypasses RLS) |
| `lib/supabaseBrowserClient.ts` | `createBrowserClient()` | Client Components that need Supabase (auth state, real-time) |
| `lib/supabaseClient.ts` | `getSupabaseClient()` | Legacy — only used by `planRepository.ts` for public plan queries |

**Never use the service role key in Client Components or client-side code.**

### Tables

#### `floorplan`

The core product table. Key columns:

| Column | Type | Notes |
|---|---|---|
| `id` | int | Primary key |
| `slug` | text | URL-safe identifier, used in `/plans/[slug]` |
| `id_code` | text | Display code shown as eyebrow (e.g., "HIT-001") |
| `title` | text | Plan display name |
| `beds` | int | Bedroom count |
| `baths` | int | Bathroom count |
| `area` | int | Square footage |
| `intro` | text | Long description (double-newline separated paragraphs) |
| `thumbnail` | text | Either a full R2 URL (starts with `http`) or a legacy filename routed through `/api/thumbnails/` |
| `hero_img` | text | Full R2 URL for the hero image |
| `second_img`, `third_img`, `fourth_img` | text | Gallery image URLs |
| `price_cents` | int | Price in cents (e.g., 50000 = $500) |
| `status` | text | `pending` / `approved` / `rejected` — only `approved` or `null` records appear publicly |
| `creator_id` | uuid | Foreign key → `creators.id` |
| `file_paths` | jsonb | Map of file type to R2 private object key (e.g., `{ "pdf": "plans/hit001.pdf" }`) |

#### `creators`

One row per registered creator.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Matches `auth.users.id` |
| `display_name` | text | Shown in dashboard greeting and public attribution |
| `bio` | text | Creator bio |
| `stripe_account_id` | text | Stripe Connect account ID (`acct_...`) |
| `stripe_onboarding_complete` | bool | Whether the creator has finished Stripe Connect setup |

#### `purchases`

One row per completed Stripe checkout.

| Column | Type | Notes |
|---|---|---|
| `id` | int | Primary key |
| `customer_email` | text | Buyer email from Stripe |
| `customer_id` | text | Optional (if buyer has a Supabase account) |
| `plan_id` | int | FK → `floorplan.id` |
| `stripe_session_id` | text | Used for idempotency — duplicate webhooks are ignored |
| `stripe_payment_intent` | text | Stripe PaymentIntent ID |
| `amount_paid` | int | Amount in cents |

### Plan Visibility Rule

`getPlans()` and `getPlanSlugs()` filter with `.or('status.eq.approved,status.is.null')` — plans with no status set are treated as approved (backwards compatibility for early plans). New plans from creators always start as `pending`.

---

## Stripe Integration

### Checkout Flow

1. Buyer selects options in `PlanOptionsCard.tsx` (Client Component on `/plans/[slug]`)
2. POST to `/api/create-checkout-session` with `{ planSlug, selectedOptionsByGroup }`
3. Server computes the total server-side (add-on prices are defined in `planRepository.ts`, not trusted from the client)
4. Returns `{ clientSecret }` from a Stripe Checkout Session (`ui_mode: 'embedded_page'`)
5. Browser redirects to `/checkout` where the Stripe Embedded Checkout form renders
6. On success, Stripe redirects to `/checkout/success?session_id=...`

### Webhook

`/api/webhooks/stripe/route.ts` handles `checkout.session.completed`:

1. Validates the Stripe signature
2. Checks idempotency (skips if `stripe_session_id` already in `purchases`)
3. Looks up the plan and its `file_paths`
4. Generates signed Cloudflare R2 download URLs (24-hour expiry)
5. Sends the buyer a delivery email via Resend
6. Inserts a row into `purchases`
7. Transfers 80% of the sale to the creator's Stripe Connect account

The `planId` passed in `metadata` at checkout session creation must match the `id` column in `floorplan`, not the `slug`. Keep these consistent.

### Stripe Connect (Creator Payouts)

- Creators initiate onboarding at `/creator/stripe-connect`
- `/api/creator/stripe-connect/route.ts` creates a Stripe Account and Account Link
- After completion, Stripe redirects to `/api/creator/stripe-connect/return` which sets `stripe_onboarding_complete = true` in Supabase
- Payout split is 80% creator / 20% platform — set in the webhook handler

---

## Cloudflare R2 (File Storage)

Two buckets:

| Bucket | Env var | Contents | Access |
|---|---|---|---|
| Public images | `R2_PUBLIC_BUCKET` | Plan thumbnails, hero images | Public CDN via `images.homeintime.cc` |
| Private files | `R2_PRIVATE_BUCKET` | PDFs, CAD files | Signed URLs only, 24-hour expiry |

Key functions in `lib/r2Client.ts`:
- `generateSignedDownloadUrl(bucket, key, expiresInSeconds)` — creates a presigned GET URL
- `PRIVATE_BUCKET()` — returns the private bucket name from env

Upload endpoints:
- `/api/r2-upload-url` — returns a signed PUT URL for uploading public images (used by creator plan forms)
- `/api/r2-upload-private` — returns a signed PUT URL for uploading private deliverable files

Images stored in the public bucket are served via the custom domain `images.homeintime.cc`. Full URLs starting with `http` are stored directly in the `thumbnail` / `hero_img` columns.

---

## Resend (Email Delivery)

`lib/resend.ts` exports `sendPurchaseEmail(to, planTitle, downloadLinks)`.

- Triggered inside the Stripe webhook after a successful purchase
- `RESEND_FROM_EMAIL` is `orders@homeintime.cc`
- The email contains titled download links pointing to the signed R2 URLs

When adding new email types, add new functions to `lib/resend.ts`. Do not inline email-sending logic in route handlers.

---

## Authentication & Route Protection

Supabase Auth handles creator accounts. `middleware.ts` runs on all routes:

- `/creator/*` routes (except `/creator/login` and `/creator/signup`) redirect unauthenticated users to `/creator/login`
- Authenticated users visiting `/creator/login` or `/creator/signup` are redirected to `/creator/dashboard`

The middleware uses `createServerClient` from `@supabase/ssr` and reads/writes auth cookies on each request.

Public routes have no auth requirement. Buyers do not need accounts.

---

## Creator Portal

The creator portal is a sub-application living at `/creator/*` with its own layout (`app/creator/layout.tsx`) and stylesheet (`app/creator/creator.css`).

CSS class naming convention inside the portal uses a `cp-` prefix:
- `.cp-dash` — dashboard root container
- `.cp-stat-card`, `.cp-stat-grid` — analytics stat blocks
- `.cp-table`, `.cp-table-wrap` — plan listing table
- `.cp-badge`, `.cp-badge-pending`, `.cp-badge-approved`, `.cp-badge-rejected` — status badges
- `.cp-btn`, `.cp-btn-outline` — creator portal buttons
- `.cp-alert`, `.cp-alert-warn`, `.cp-alert-success` — flash banners
- `.cp-eyebrow`, `.cp-section-label` — typographic utilities

Plan submission is a multi-step wizard at `/creator/plans/new`. Editing is a 4-step wizard at `/creator/plans/[id]/edit`. Both forms upload files directly to R2 via the signed URL endpoints before POSTing plan metadata to the Supabase API routes.

Plan lifecycle: `pending` → (admin review) → `approved` or `rejected`. Only `approved` plans appear on the public site.

---

## TypeScript Types (lib/planRepository.ts)

| Type | Description |
|---|---|
| `PlanRecord` | Raw Supabase row shape from the `floorplan` table |
| `Plan` | Transformed presentation object consumed by UI components |
| `PlanImage` | `{ src: string; alt: string }` |
| `PlanInfoBlock` | `{ title, body?, list? }` — powers the info card grid on plan detail pages |
| `PlanOptionGroup` | Group of purchase options (e.g., "Delivery", "Modifications") |
| `PlanOption` | Single option with label and price adjustment |

`mapPlan(row: PlanRecord): Plan` is the single function that transforms raw DB rows into UI-ready objects. All formatting logic (currency, stat labels, image URL normalization) lives here.

---

## Environment Variables

```
# Supabase
SUPABASE_URL                    # Server-side Supabase URL
SUPABASE_ANON_KEY               # Anon key (read-only public access)
SUPABASE_SERVICE_ROLE_KEY       # Service role key (admin, server-only, never expose)
SUPABASE_PLANS_TABLE            # Table name override (defaults to "plans", currently "floorplan")
NEXT_PUBLIC_SUPABASE_URL        # Browser-accessible Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Browser-accessible anon key

# Stripe
STRIPE_SECRET_KEY               # sk_live_... (server only)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  # pk_live_... (browser safe)
STRIPE_WEBHOOK_SECRET           # whsec_... (webhook signature verification)

# Cloudflare R2
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_ACCOUNT_ID
R2_PUBLIC_BUCKET                # Public image bucket name
R2_PUBLIC_URL                   # CDN domain: images.homeintime.cc
R2_PRIVATE_BUCKET               # Private deliverable bucket name

# Resend
RESEND_API_KEY
RESEND_FROM_EMAIL               # orders@homeintime.cc
```

All `NEXT_PUBLIC_` variables are bundled into the browser. All others are server-only. Never log or expose service role keys, Stripe secret keys, or R2 secret access keys.

---

## Key Conventions

- **No `'use client'` by default** — Server Components are the default. Add the directive only when necessary.
- **`export const dynamic = 'force-dynamic'`** on pages that require fresh auth sessions (creator dashboard). Plan detail pages use `export const revalidate = 60` for ISR.
- **Price storage**: always in cents as integers in the database (`price_cents`). Convert to dollars only at display time.
- **Slugs** are lowercase hyphenated strings matching the URL: `/plans/the-caroline`.
- **Image URLs**: R2 public images are full `https://` URLs stored in DB columns. Legacy thumbnails are filenames routed through `/api/thumbnails/[filename]`. The `toThumbnailImage()` function in `planRepository.ts` handles both cases.
- **Creator API routes** use the service role client (`getSupabaseServiceClient()`) for writes, never the anon client.
- **Stripe webhook must use `runtime = 'nodejs'`** — the raw body read requires Node.js runtime, not Edge.
- **Co-located CSS files** — each route segment that has unique styles gets its own `.css` file in the same directory, imported at the top of `page.tsx`.
- **`lib/content.ts`** holds all static marketing copy (style highlights, product descriptions). Keep copy out of JSX files.
