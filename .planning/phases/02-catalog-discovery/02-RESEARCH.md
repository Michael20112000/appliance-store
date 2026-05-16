# Phase 2: Catalog & Discovery - Research

**Researched:** 2026-05-17
**Domain:** Prisma catalog schema, Next.js 16 App Router listing/filters/SEO, PostgreSQL search v1, nuqs URL state
**Confidence:** HIGH (stack + codebase verified) / MEDIUM (exact URL param naming, seed image strategy)

## Summary

Phase 2 turns Phase 1 category stubs into a **read-only storefront catalog**: add `Product` + `ProductImage` to Prisma, seed demo inventory (admin CRUD is Phase 4), list products on `/katalog` and `/katalog/[slug]`, open PDP at `/tovar/[slug]`, sync filters to the URL with **nuqs**, hide `SOLD` items (CAT-07), and ship **generateMetadata** + JSON-LD (`Product`, `LocalBusiness` for Lviv).

The codebase already has: 8 seeded categories, `/katalog/[slug]` stub pages, `OptimizedImage` (Cloudinary delivery), Ukrainian `lang="uk"`, Vitest + Playwright, Prisma 7.8 + Neon. **Not yet installed:** `nuqs`, `schema-dts`. **No Product model.**

**Primary recommendation:** Extend existing `/katalog/[slug]` for category-scoped listing; add `/katalog` for cross-category browse; use `/tovar/[slug]` for PDP (avoids slug collision with categories). Use **nuqs** with `createSearchParamsCache` on the server + `useQueryStates({ shallow: false })` on the filter bar so shareable URLs re-render RSC with filtered Prisma queries. Use **Prisma `contains` + `mode: 'insensitive'`** for v1 text search; defer Meilisearch and `fullTextSearchPostgres` preview. Store price as **integer kopiyky**; `ProductStatus` enum `AVAILABLE | SOLD | DRAFT`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Product persistence & indexes | Database / Prisma | — | Source of truth for catalog, filters, sold state |
| Catalog list + filter query building | API / Backend (`server/services/catalog.service.ts`) | — | Business rules: public scope, filter composition, pagination |
| Category + catalog pages (HTML) | Frontend Server (RSC) | — | SEO requires server-rendered lists and metadata |
| Filter UI + URL updates | Browser (Client, nuqs) | Frontend Server | Interactive controls; server re-fetch via `shallow: false` |
| Product detail + gallery | Frontend Server (RSC) | CDN (Cloudinary) | PDP metadata + JSON-LD; images via `OptimizedImage` |
| Text search (v1) | Database (Postgres ILIKE via Prisma) | — | No separate search service until DISC-02 |
| SEO metadata & JSON-LD | Frontend Server (`generateMetadata`, RSC `<script>`) | — | Must not live in client components |
| Demo product seed | Build/ops (`prisma/seed.ts`) | — | Phase 2 read path only; Phase 4 adds admin writes |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Prisma** | **7.8.0** (installed) | ORM, migrations, typed queries | Project mandate; Category model exists |
| **PostgreSQL / Neon** | 16+ | Storage + indexes for filters | Already wired via `@prisma/adapter-neon` |
| **Next.js App Router** | **16.2.6** (installed) | RSC pages, `searchParams`, `generateMetadata` | Phase 1 scaffold; async `searchParams` Promise API |
| **nuqs** | **2.8.9** [VERIFIED: npm registry] | URL-synced filters (CAT-06) | Type-safe parsers + server `createSearchParamsCache` [CITED: nuqs.dev/docs/server-side] |
| **schema-dts** | **2.0.0** [VERIFIED: npm registry] | Typed JSON-LD | Recommended by Next.js JSON-LD guide [CITED: nextjs.org/docs/app/guides/json-ld] |
| **next-cloudinary** | **6.17.5** (installed) | Product images on cards/PDP | `OptimizedImage` already wraps `CldImage` |
| **slugify** | **1.6.6** (installed) | UA slugs for products | Same pattern as category seed |
| **Zod** | **4.4.3** (installed) | Validate filter bounds / seed data | Shared with future admin |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **shadcn/ui** | installed | ProductCard, FilterBar, Badge, Pagination | UI hint: yes |
| **Vitest** | **4.1.6** | Unit tests for query builders | Nyquist validation |
| **Playwright** | **1.60.0** | E2E catalog browse + URL filters | Extend `e2e/public-browse.spec.ts` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| **nuqs** | Native `searchParams` only in RSC | Works for read-only pages; worse DX for interactive filter UI and typed parsers |
| **Prisma ILIKE** | `fullTextSearchPostgres` preview | FTS needs preview flag + migration; overkill for &lt;500 SKUs [CITED: prisma.io full-text search] |
| **Prisma ILIKE** | Meilisearch (v2 DISC-02) | Correct deferral per REQUIREMENTS |
| **`/tovar/[slug]`** | `/katalog/[category]/[product]` | Nested URL is SEO-nice but conflicts with current `/katalog/[slug]` = category; two-segment category path is a breaking change |
| **`ProductImage` relation** | `images Json` | Relation matches Phase 4 multi-image admin; sortOrder + alt per row |

**Installation (Phase 2):**

```bash
npm install nuqs@2.8.9 schema-dts@2.0.0
```

**Version verification (2026-05-17):** `npm view nuqs version` → 2.8.9; `npm view schema-dts version` → 2.0.0.

## Package Legitimacy Audit

> slopcheck unavailable at research time — all new packages tagged **[ASSUMED]** for planner `checkpoint:human-verify` before install.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| nuqs | npm | mature | high | github.com/47ng/nuqs | unavailable | Approved with human-verify checkpoint |
| schema-dts | npm | mature | moderate | github.com/google/schema-dts | unavailable | Approved with human-verify checkpoint |

**Packages removed due to slopcheck [SLOP] verdict:** none (slopcheck not run)

**Packages flagged as suspicious [SUS]:** none

**postinstall scripts:** not checked (slopcheck/npm scripts skipped); neither package is known for risky postinstall — verify at install time.

## Architecture Patterns

### System Architecture Diagram

```
                    ┌─────────────────────────────────────┐
                    │  Browser: FilterBar (client nuqs)   │
                    │  updates ?q&brand&min&max&stan&cursor │
                    └──────────────────┬──────────────────┘
                                       │ shallow: false → navigation
                                       ▼
┌──────────────┐   searchParams    ┌──────────────────────────────────────┐
│ GET /katalog │ ────────────────► │ RSC Page (storefront)                 │
│ GET /katalog/[cat]               │  await searchParamsCache.parse()      │
│ GET /tovar/[slug]                │  catalogService.list / getBySlug      │
└──────────────┘                   └──────────────┬───────────────────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    ▼                             ▼                             ▼
            ┌───────────────┐            ┌────────────────┐            ┌──────────────┐
            │ catalog.service│            │ generateMetadata│            │ JSON-LD script│
            │ buildWhere()   │            │ title/desc/OG   │            │ Product /     │
            │ cursor page    │            │                 │            │ LocalBusiness │
            └───────┬───────┘            └────────────────┘            └──────────────┘
                    │
                    ▼
            ┌───────────────┐         ┌──────────────────┐
            │ Prisma → Neon  │         │ Cloudinary CDN    │
            │ Product, Image │         │ (public_id only)  │
            └───────────────┘         └──────────────────┘
```

### Recommended Project Structure

```
src/
├── app/(storefront)/
│   ├── layout.tsx              # add NuqsAdapter (or root layout)
│   ├── katalog/
│   │   ├── page.tsx            # all products + filters (NEW)
│   │   └── [slug]/page.tsx     # category listing (REPLACE stub)
│   └── tovar/
│       └── [slug]/page.tsx     # PDP (NEW)
├── components/storefront/
│   ├── product-card.tsx
│   ├── product-grid.tsx
│   ├── catalog-filter-bar.tsx  # 'use client' + nuqs
│   ├── product-gallery.tsx
│   └── json-ld.tsx             # server-safe script helper
├── lib/catalog/
│   ├── search-params.ts        # parsers + createSearchParamsCache
│   └── format.ts               # UAH display, condition labels UA
├── server/
│   ├── services/catalog.service.ts
│   └── validators/product.ts   # enums, filter schema
└── types/catalog.ts

prisma/
├── schema.prisma               # Product, ProductImage, enums
├── seed.ts                     # extend: demo products
└── seed-products.ts            # optional split for clarity

app/sitemap.ts                  # categories + AVAILABLE products (NEW)
```

### Pattern 1: Public catalog scope in one service function

**What:** `listPublicProducts({ categorySlug?, filters, cursor })` always applies `status: AVAILABLE` (CAT-07). Admin Phase 4 adds `listAllProducts` with `DRAFT`/`SOLD`.

**When to use:** Every storefront list and search query.

**Example:**

```typescript
// server/services/catalog.service.ts
const PUBLIC_STATUS = "AVAILABLE" as const;

export function buildPublicProductWhere(
  input: CatalogFilters & { categoryId?: string },
): Prisma.ProductWhereInput {
  return {
    status: PUBLIC_STATUS,
    ...(input.categoryId && { categoryId: input.categoryId }),
    ...(input.brand && { brand: input.brand }),
    ...(input.condition && { condition: input.condition }),
    ...(input.minPrice != null || input.maxPrice != null
      ? {
          price: {
            ...(input.minPrice != null && { gte: input.minPrice }),
            ...(input.maxPrice != null && { lte: input.maxPrice }),
          },
        }
      : {}),
    ...(input.q
      ? {
          OR: [
            { title: { contains: input.q, mode: "insensitive" } },
            { description: { contains: input.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}
```

### Pattern 2: nuqs shared parsers (server + client)

**What:** Single parser map in `lib/catalog/search-params.ts`; `createSearchParamsCache` for RSC pages; `useQueryStates` in filter bar with `shallow: false` so Prisma re-runs on filter change [CITED: nuqs.dev/docs/server-side, Context7 /47ng/nuqs].

**When to use:** `/katalog` and `/katalog/[slug]` (category slug stays in path; filters in query).

**Example:**

```typescript
// lib/catalog/search-params.ts
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const catalogParsers = {
  q: parseAsString.withDefault(""),
  brand: parseAsString,
  min: parseAsInteger, // UAH whole units → convert to kopiyky in service
  max: parseAsInteger,
  stan: parseAsStringEnum(["LIKE_NEW", "GOOD", "FAIR"] as const),
  cursor: parseAsString,
};

export const catalogSearchParamsCache = createSearchParamsCache(catalogParsers);
```

```tsx
// app/(storefront)/layout.tsx — add inside <body>
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function StorefrontLayout({ children }) {
  return <NuqsAdapter>{children}</NuqsAdapter>;
}
```

### Pattern 3: Cursor pagination (not offset)

**What:** `findMany({ take: 24, cursor, skip: cursor ? 1 : 0, orderBy: { createdAt: "desc" } })` with `cursor` in URL.

**When to use:** Catalog grids (CAT-01 scale); avoid `skip` for deep pages [CITED: .planning/research/PITFALLS.md].

### Pattern 4: PDP sold handling

**What:** `getPublicProductBySlug` returns null for `SOLD` and `DRAFT` → `notFound()`. Optional: allow direct `/tovar/x` for `SOLD` with `noindex` + «Продано» banner — **recommend 404** for v1 to match CAT-07 strictly and simplify sitemap.

### Pattern 5: JSON-LD in Server Components only

**What:** `<script type="application/ld+json">` with `JSON.stringify(data).replace(/</g, "\\u003c")` [CITED: nextjs.org/docs/app/guides/json-ld]. `LocalBusiness` on home (or root layout once); `Product` + `Offer` on PDP.

**Anti-Patterns to Avoid**

- **Client-only catalog:** kills SEO (PITFALLS.md) — all list/PDP content in RSC.
- **Filtering in client after fetch-all:** breaks at scale; filter in Prisma `where`.
- **Float UAH prices:** use integer kopiyky (ARCHITECTURE.md, PITFALLS.md).
- **Indexing filter permutations:** set `robots: { index: false }` on heavy query-only views OR canonical to `/katalog/[slug]` without query when only pagination differs.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL filter state | Custom `history.pushState` | **nuqs** | Typed parsers, SSR cache, shareable links |
| Search engine (v1) | Meilisearch / Elasticsearch | **Postgres ILIKE** via Prisma | Single-store SKU count; DISC-02 defers Meilisearch |
| JSON-LD types | Untyped objects | **schema-dts** | Compile-time checks for Product/LocalBusiness |
| Image CDN URLs | Manual URL building | **next-cloudinary** `OptimizedImage` | Already in Phase 1 |
| Pagination math | Ad-hoc page numbers only | **Cursor** + optional «load more» | Stable performance as catalog grows |

## Prisma Product Schema (recommended)

Aligns with ARCHITECTURE.md + phase requirements; uses **`status`** instead of separate `isPublished` + sold flag.

```prisma
enum ProductCondition {
  LIKE_NEW  // UI: «Відмінний»
  GOOD      // UI: «Добрий»
  FAIR      // UI: «Задовільний»
}

enum ProductStatus {
  AVAILABLE  // public catalog (CAT-01, CAT-07)
  SOLD       // hidden from lists; excluded from sitemap
  DRAFT      // Phase 4 admin only; hidden from public
}

model Product {
  id          String           @id @default(cuid())
  title       String
  slug        String           @unique
  description String?
  brand       String
  price       Int              // kopiyky (UAH * 100)
  condition   ProductCondition
  status      ProductStatus    @default(DRAFT)
  categoryId  String
  category    Category         @relation(fields: [categoryId], references: [id])
  images      ProductImage[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@index([status, categoryId])
  @@index([status, brand])
  @@index([status, price])
  @@index([status, condition])
  @@index([status, createdAt])
}

model ProductImage {
  id                 String  @id @default(cuid())
  productId          String
  product            Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  cloudinaryPublicId String
  alt                String?
  sortOrder          Int     @default(0)
  width              Int?
  height             Int?

  @@index([productId, sortOrder])
}

// Category — add relation:
model Category {
  // ...existing fields...
  products Product[]
}
```

**Phase 2 seed:** set `status: AVAILABLE` for demo rows; add 1–2 `SOLD` rows for CAT-07 tests.

**Indexes rationale:** All filter columns include `status` prefix so partial public queries use composite indexes (PITFALLS.md N+1/scan prevention).

## URL Design

| Route | Purpose | Notes |
|-------|---------|-------|
| `/katalog` | All categories, filters in query | CAT-05 cross-category |
| `/katalog/[slug]` | Single category listing | **Existing** stub; `slug` = category slug |
| `/tovar/[slug]` | Product detail | **New**; `slug` = product slug; no collision with categories |

**Query params (CAT-06):** `q`, `brand`, `min`, `max`, `stan`, `cursor` (short keys optional via nuqs `urlKeys`).

**Do not** use `/katalog/[category]/[product]` without migrating category routes — current `[slug]` is occupied by categories.

## Search Strategy (v1)

| Approach | Verdict | Notes |
|----------|---------|-------|
| Prisma `contains` + `mode: 'insensitive'` | **Use** | CAT-04; simple OR on title + description |
| PostgreSQL `fullTextSearchPostgres` | **Defer** | Preview feature + migration overhead [CITED: prisma.io/docs full-text search] |
| Meilisearch | **Defer** | DISC-02 / REQUIREMENTS v2 |

**Minimum query length:** 2 characters in UI to avoid full table scan on single letter (planner discretion).

## Pagination Strategy

- **Page size:** 24 products (grid 2×2 mobile, 4 cols desktop).
- **Mechanism:** Cursor on `id` or `(createdAt, id)`; expose `cursor` in URL via nuqs.
- **Empty state:** Ukrainian copy + link to clear filters.

## Hide Sold Products (CAT-07)

- **List/search:** `where: { status: "AVAILABLE" }` in `catalog.service` only — never duplicate in pages.
- **PDP:** `notFound()` for non-AVAILABLE.
- **Sitemap:** include only `AVAILABLE` products [CITED: PITFALLS.md].
- **Phase 3 prep:** unique used units — `status` already supports atomic `SOLD` update at checkout (PITFALLS double-sale).

## SEO (SEO-01, SEO-02)

### generateMetadata

| Page | title | description |
|------|-------|-------------|
| `/katalog` | Каталог б/у техніки \| … | Dynamic or static UA |
| `/katalog/[slug]` | `{category.name} — б/у техніка Львів` | From `Category.description` or template |
| `/tovar/[slug]` | `{product.title} — {brand}` | First 155 chars of description |

Use async `generateMetadata({ params })` with `await params` [CITED: Next.js v16.1.6 generateMetadata].

**Filter pages:** If `searchParams` has filters, prefer `robots: { index: false, follow: true }` OR `alternates.canonical` to path without query — prevents thin duplicate URLs (PITFALLS.md).

### JSON-LD

| Type | Where | Key fields |
|------|-------|------------|
| **LocalBusiness** | Home (or storefront layout once) | `name`, `address` (Lviv), `areaServed`, `telephone` (placeholder OK Phase 2) |
| **Product** | PDP | `name`, `image`, `description`, `brand`, `offers` (price UAH, `availability`), `itemCondition`: `https://schema.org/UsedCondition` [CITED: schema.org, Google product docs] |

Render in **Server Component** with XSS-safe stringify [CITED: nextjs.org/docs/app/guides/json-ld].

### sitemap.ts (Phase 2 scope)

- Static: `/`, `/katalog`
- Dynamic: all categories, all `AVAILABLE` product `/tovar/[slug]`
- Exclude: `SOLD`, `DRAFT`, `/admin`, auth pages

`robots.ts` can disallow `/admin` (if not already global).

## Seed Strategy (Phase 2 demo data)

**Goal:** Realistic catalog without Phase 4 admin.

1. **Extend `prisma/seed.ts`** (or `prisma/seed-products.ts` imported from main).
2. **Volume:** 3–4 `AVAILABLE` products per category (~24–32 items) + **2 `SOLD`** + **1 `DRAFT`** for tests.
3. **Images:** Reuse Phase 1 approach — fixed `cloudinaryPublicId` list from env `SEED_CLOUDINARY_PUBLIC_IDS` or hardcode demo IDs documented in `.env.example` (same cloud as `CLOUDINARY_CLOUD_NAME`).
4. **Data variety:** Multiple brands, price spread (500–25000 UAH), all three conditions.
5. **Slugs:** `slugify(title, { locale: 'uk', strict: true })` + suffix on collision.
6. **Idempotent:** `upsert` by `slug` like categories.

**Do not** require admin upload in Phase 2 (D-16 Phase 1: signed upload is Phase 4).

## Server Components Data Fetching

```tsx
// app/(storefront)/katalog/[slug]/page.tsx
export default async function CategoryCatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const filters = await catalogSearchParamsCache.parse(searchParams);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { items, nextCursor } = await listPublicProducts({
    categoryId: category.id,
    filters,
  });

  return (
    <>
      <CatalogFilterBar /> {/* client; reads same parsers */}
      <ProductGrid products={items} />
    </>
  );
}
```

**N+1 prevention:** Single query with `include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } }` for card thumbnails.

**Caching:** Phase 2 can use default dynamic rendering (searchParams opts into dynamic [CITED: Next.js page.md]). Phase 4 admin edits → `revalidateTag('products')` (document tag names in service).

## Common Pitfalls

### Pitfall 1: Category route vs product slug collision

**What goes wrong:** Product at `/katalog/bosch-fridge` interpreted as category.  
**How to avoid:** Keep categories under `/katalog/[slug]`, products under `/tovar/[slug]`.

### Pitfall 2: Filters without server re-render

**What goes wrong:** nuqs default `shallow: true` updates URL but list stays stale.  
**How to avoid:** `useQueryStates(parsers, { shallow: false })` on catalog filter bar [CITED: nuqs README shallow option].

### Pitfall 3: Sold items in sitemap or lists

**What goes wrong:** GSC indexes unavailable products (CAT-07, PITFALLS local SEO).  
**How to avoid:** Central `AVAILABLE` guard in service + sitemap query.

### Pitfall 4: Client JSON-LD

**What goes wrong:** Duplicate or missing rich results.  
**How to avoid:** Server-only script tags (PITFALLS.md).

### Pitfall 5: Forgetting `await searchParams` / `await params`

**What goes wrong:** Runtime errors on Next 16.  
**How to avoid:** Promise API everywhere [CITED: Next.js v16 upgrade guide].

## Code Examples

### generateMetadata (product)

```typescript
// Source: https://github.com/vercel/next.js/blob/v16.1.6/docs/01-app/03-api-reference/04-functions/generate-metadata.mdx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) return { title: "Товар не знайдено" };

  return {
    title: `${product.title} — ${product.brand}`,
    description: product.description?.slice(0, 155),
    openGraph: {
      locale: "uk_UA",
      images: product.images[0]
        ? [{ url: cloudinaryUrl(product.images[0].cloudinaryPublicId) }]
        : [],
    },
  };
}
```

### JSON-LD Product (used)

```tsx
// Source: https://nextjs.org/docs/app/guides/json-ld
import type { Product, WithContext } from "schema-dts";

const jsonLd: WithContext<Product> = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.title,
  description: product.description ?? undefined,
  image: imageUrls,
  brand: { "@type": "Brand", name: product.brand },
  offers: {
    "@type": "Offer",
    price: (product.price / 100).toFixed(2),
    priceCurrency: "UAH",
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/UsedCondition",
  },
};

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
  }}
/>;
```

### Playwright smoke (extend existing)

```typescript
// Extend e2e/public-browse.spec.ts pattern
test("catalog filters sync to URL and hide sold", async ({ page }) => {
  await page.goto("/katalog/pralni-mashyny?stan=GOOD");
  await expect(page).toHaveURL(/stan=GOOD/);
  await expect(page.getByText("Продано")).toHaveCount(0);
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Sync `searchParams` in pages | `searchParams: Promise<...>` | Next.js 15+ | Must await in Phase 2 pages |
| `isPublished` boolean only | `ProductStatus` enum | Phase 2 recommendation | Clear sold/draft/available |
| Offset-only pagination | Cursor + optional page | Prisma/Next best practice | Planner uses cursor in URL |

**Deprecated/outdated:**

- Meilisearch for v1 — explicit defer to DISC-02
- Client-side catalog filtering — anti-pattern per project research

## Vertical MVP Slices (recommended plan order)

Phase mode is **mvp** — ship thin end-to-end slices, not horizontal layers only.

| Slice | Delivers | Requirements | Depends on |
|-------|----------|--------------|------------|
| **02-01 Data foundation** | Prisma Product/Image, migration, `catalog.service`, seed products | Enables all CAT-* | Phase 1 Category |
| **02-02 Category grid** | Replace `/katalog/[slug]` stub with ProductCard grid | CAT-01, CAT-03, CAT-07 | 02-01 |
| **02-03 Product PDP** | `/tovar/[slug]`, gallery, condition, brand, price | CAT-02 | 02-01 |
| **02-04 URL filters** | nuqs + FilterBar + `/katalog` global list | CAT-05, CAT-06 | 02-02 |
| **02-05 Text search** | `q` param + ILIKE | CAT-04 | 02-04 |
| **02-06 SEO package** | `generateMetadata`, JSON-LD, `sitemap.ts` | SEO-01, SEO-02 | 02-02, 02-03 |

**Parallelization:** 02-03 can run parallel to 02-02 after 02-01. 02-06 can start metadata on category pages as soon as 02-02 lands.

**Demo gate:** After 02-01, `npm run dev` + seed shows products in DB; after 02-02, buyer sees cards without admin UI.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `/tovar/[slug]` for PDP (not nested under category) | URL Design | User wanted nested URLs — would require route migration |
| A2 | `notFound()` for SOLD PDPs | PDP pattern | Stakeholder may want «Продано» page with noindex instead |
| A3 | Price filter URL uses whole UAH (`min`/`max`) | nuqs parsers | Kopiyky in URL would be user-unfriendly |
| A4 | Seed uses pre-uploaded Cloudinary public IDs | Seed | Without IDs, cards show broken images until manual upload |
| A5 | `nuqs` + `schema-dts` safe without slopcheck | Package audit | Rare supply-chain risk — human-verify at install |

## Open Questions

1. **Store NAP for LocalBusiness**
   - What we know: Footer has placeholder contacts from Phase 1.
   - What's unclear: Real address/phone for JSON-LD.
   - Recommendation: Use env `STORE_ADDRESS`, `STORE_PHONE` with Lviv defaults in seed/docs; planner adds to `.env.example`.

2. **PDP for sold items — 404 vs «Продано»**
   - Recommendation: 404 for strict CAT-07; revisit in Phase 6 polish if marketing wants sold pages.

3. **Global `/katalog` vs category-only browse**
   - Recommendation: Both — `/katalog` for «всі товари», category pages for SEO landing.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Next, Prisma | ✓ | v24.14.0 | — |
| npm | install nuqs | ✓ | (project default) | — |
| Prisma CLI | migrate, seed | ✓ | 7.8.0 | — |
| PostgreSQL/Neon | Product data | ✓ (Phase 1) | — | docker compose per Phase 1 |
| Cloudinary | Product images | ✓ (env) | — | Placeholder SVG if missing public_id |
| psql | optional debug | ✓ | homebrew | — |
| slopcheck | package audit | ✗ | — | Human-verify installs |

**Missing dependencies with no fallback:** none blocking Phase 2.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 + Playwright 1.60.0 |
| Config file | `vitest.config.ts`, `playwright.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test && npm run test:e2e` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CAT-01 | List shows photo, price, brand, condition | e2e | `npx playwright test e2e/catalog-list.spec.ts` | ❌ Wave 0 |
| CAT-02 | PDP description, gallery, condition | e2e | `npx playwright test e2e/product-pdp.spec.ts` | ❌ Wave 0 |
| CAT-03 | Category scoping | e2e | `npx playwright test e2e/catalog-category.spec.ts` | ❌ Wave 0 |
| CAT-04 | Text search | unit + e2e | `npm test -- src/server/services/catalog.service.test.ts` | ❌ Wave 0 |
| CAT-05 | Filters brand/price/condition | unit | `npm test -- src/lib/catalog/search-params.test.ts` | ❌ Wave 0 |
| CAT-06 | Filters in URL | e2e | `npx playwright test e2e/catalog-filters-url.spec.ts` | ❌ Wave 0 |
| CAT-07 | Sold hidden | unit + e2e | `npm test -- catalog.service` + e2e sold fixture | ❌ Wave 0 |
| SEO-01 | Unique meta title/description | e2e or unit | metadata helper test / playwright `page.title()` | ❌ Wave 0 |
| SEO-02 | JSON-LD present | e2e | `expect(page.locator('script[type="application/ld+json"]'))` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test` (unit for touched modules)
- **Per wave merge:** `npm run test:e2e` (catalog specs)
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] Install `nuqs`, `schema-dts`; add `NuqsAdapter` to storefront layout
- [ ] `src/server/services/catalog.service.ts` + unit tests
- [ ] `src/lib/catalog/search-params.ts` + parser tests
- [ ] `e2e/catalog-*.spec.ts` (replace/extend `public-browse.spec.ts`)
- [ ] Product factories or seed fixtures for SOLD/AVAILABLE in tests
- [ ] `app/sitemap.ts` + optional metadata test helper

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | no | Public catalog (AUTH-01) |
| V3 Session Management | no | Read-only phase |
| V4 Access Control | no | No admin writes in Phase 2 |
| V5 Input Validation | yes | nuqs parsers + Zod for filter bounds (price min/max, enum condition) |
| V6 Cryptography | no | — |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| SQL injection via `q` | Tampering | Prisma parameterized queries only |
| Unbounded `take` / DoS | Denial of service | Cap `take` at 24 server-side |
| XSS in JSON-LD | Tampering | Escape `<` in `JSON.stringify` output |
| Mass assignment on future admin | Elevation | Out of scope Phase 2; Zod allowlists in Phase 4 |

## Project Constraints (from .cursor/rules/)

- **Next.js:** Read `node_modules/next/dist/docs/` before writing framework code; APIs may differ from training data (AGENTS.md).
- **Stack locked:** Next 16 App Router, Prisma 7, Neon, Better Auth, shadcn, Cloudinary, Ukrainian-only UI (gsd.mdc / PROJECT.md).
- **Phase 1 decisions carry forward:** Light theme only (D-01–04), `/katalog/[slug]` category stubs (D-12), Cloudinary delivery via `OptimizedImage` (D-14), no signed upload until Phase 4 (D-16).

## Inherited Constraints (no Phase 2 CONTEXT.md)

> `/gsd-discuss-phase` was not run for Phase 2. Planner should treat **PROJECT.md**, **REQUIREMENTS.md**, **ROADMAP Phase 2**, and **`.planning/research/*`** as locked scope. Run discuss-phase if product wants explicit URL/SEO decisions locked before PLAN.

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CAT-01 | List with photo, price, brand, condition | Product + ProductImage schema; ProductCard; `listPublicProducts` with thumbnail include |
| CAT-02 | PDP with description, gallery, condition | `/tovar/[slug]`; ProductGallery; full images ordered by sortOrder |
| CAT-03 | Browse by categories (8 + dynamic) | Extend `/katalog/[slug]`; Category.products relation |
| CAT-04 | Text search name/description | `q` + Prisma ILIKE OR on title/description |
| CAT-05 | Filter category, brand, price, condition | `buildPublicProductWhere`; nuqs parsers; category from path |
| CAT-06 | Filters in shareable URL | nuqs `catalogParsers` + `shallow: false` |
| CAT-07 | Sold not in public catalog | `ProductStatus.SOLD`; service guard; sitemap exclude |
| SEO-01 | Unique meta per category/product | `generateMetadata` on category + PDP pages |
| SEO-02 | JSON-LD Product + LocalBusiness Lviv | schema-dts; home LocalBusiness; PDP Product UsedCondition |

</phase_requirements>

## Sources

### Primary (HIGH confidence)

- [Context7 /47ng/nuqs] — `createSearchParamsCache`, `shallow: false`, server loaders
- [Context7 /vercel/next.js v16.1.6] — async `searchParams`, `generateMetadata`, filtering example
- [nextjs.org/docs/app/guides/json-ld](https://nextjs.org/docs/app/guides/json-ld) — JSON-LD script + schema-dts
- [nextjs.org/docs app page searchParams](https://nextjs.org/docs/app/api-reference/file-conventions/page) — dynamic rendering, filtering
- [nuqs.dev/docs/server-side](https://nuqs.dev/docs/server-side) — loaders and cache
- [prisma.io full-text search](https://www.prisma.io/docs/orm/prisma-client/queries/full-text-search) — defer FTS preview
- Codebase: `prisma/schema.prisma`, `src/app/(storefront)/katalog/[slug]/page.tsx`, `package.json`, Phase 1 seed

### Secondary (MEDIUM confidence)

- `.planning/research/STACK.md`, `ARCHITECTURE.md`, `PITFALLS.md` — project-level patterns
- [Google product structured data](https://developers.google.com/search/docs/appearance/structured-data/product) — merchant/snippet eligibility

### Tertiary (LOW confidence)

- WebSearch nuqs Next adapter summary — cross-checked with nuqs.dev

## Metadata

**Confidence breakdown:**

- Standard stack: **HIGH** — versions verified via npm + installed deps
- Architecture: **HIGH** — matches existing routes and research docs
- Pitfalls: **HIGH** — PITFALLS.md + codebase alignment
- Seed image strategy: **MEDIUM** — depends on Cloudinary assets available to team

**Research date:** 2026-05-17  
**Valid until:** 2026-06-17 (30 days — stable stack)
