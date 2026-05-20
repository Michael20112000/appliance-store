# Phase 30: Similar products & footer layout - Pattern Map

**Mapped:** 2026-05-20  
**Files analyzed:** 7 (6 modify + 1 optional create)  
**Analogs found:** 7 / 7

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/server/services/catalog.service.ts` | service | CRUD (tiered read) | `listPublicProducts` in same file | exact |
| `src/server/services/catalog.service.test.ts` | test | transform | `buildPublicProductWhere` + `getCatalogPriceBounds` describes | exact |
| `src/types/catalog.ts` | model (types) | transform | `listCategoriesWithProductCounts` category shape | role-match |
| `src/app/(storefront)/tovar/[slug]/page.tsx` | route (RSC) | request-response | `katalog/[slug]/page.tsx` | exact |
| `src/components/layout/store-footer.tsx` | component (server) | request-response | self (layout refactor) | exact |
| `src/components/catalog/similar-products-section.tsx` | component (optional) | request-response | `hero-section.tsx` | role-match |
| `src/components/catalog/product-grid.tsx` | component | — | reuse only | exact (no change) |
| `src/components/catalog/product-card.tsx` | component | — | reuse only | exact (no change) |

## Pattern Assignments

### `src/server/services/catalog.service.ts` (service, tiered CRUD read)

**Analog:** `listPublicProducts` + `buildPublicProductWhere` + `mapToCard` in same file

**Imports / module layout** (lines 1-20):

```typescript
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type {
  CatalogFilters,
  PaginatedProducts,
  PublicProductCard,
  PublicProductDetail,
} from "@/types/catalog";
```

**`cardInclude` — reuse for similar queries** (lines 13-20):

```typescript
const cardInclude = {
  category: { select: { name: true, slug: true } },
  images: {
    orderBy: { sortOrder: "asc" as const },
    take: 5,
    select: { cloudinaryPublicId: true, alt: true },
  },
} satisfies Prisma.ProductInclude;
```

→ Extend category select to `{ id: true, name: true, slug: true }` in `cardInclude` and `getPublicProductBySlug` include (keeps `mapToCard` DTO aligned).

**Price band filter — reuse via `buildPublicProductWhere`** (lines 31-50):

```typescript
export function buildPublicProductWhere(
  input: CatalogFilters & { categoryId?: string },
): Prisma.ProductWhereInput {
  const filters = catalogFiltersSchema.parse(input);

  return {
    quantity: { gte: 1 },
    ...(input.categoryId && { categoryId: input.categoryId }),
    ...(filters.minPrice != null || filters.maxPrice != null
      ? {
          price: {
            ...(filters.minPrice != null && { gte: filters.minPrice }),
            ...(filters.maxPrice != null && { lte: filters.maxPrice }),
          },
        }
      : {}),
    // ...
  };
}
```

**List query pattern — copy for each tier pool** (lines 101-136):

```typescript
export async function listPublicProducts(options: {
  categoryId?: string;
  filters?: CatalogFilters;
  page?: number;
  pageSize?: number;
  sort?: SortKey;
}): Promise<PaginatedProducts<PublicProductCard>> {
  const where = buildPublicProductWhere({
    ...options.filters,
    categoryId: options.categoryId,
  });

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: cardInclude,
      orderBy: orderByForSort(options.sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: items.map(mapToCard),
    // ...
  };
}
```

**New helpers — placement after `buildPublicProductWhere` / before `listPublicProducts`:**

1. **`similarPriceBandKopiyky(priceKop, 20 | 40)`** — pure export (test target). Mirror kopiyky math style from `getCatalogPriceBounds` (lines 254-256): `Math.floor` / `Math.ceil` on kopiyky, not UAH.

2. **`listSimilarPublicProducts({ productId, categoryId, price, limit?: 4 })`** — tiered `findMany`:
   - Compose `where` as spread: `{ ...buildPublicProductWhere({ categoryId, minPrice, maxPrice }), id: { not: productId } }` (exclude self inline — do not extend `buildPublicProductWhere` for catalog pages).
   - Pool A: ±20% bands; Pool B: ±40% if `|merged| < limit`; Pool C: category-only, `take: 50` discretion.
   - Merge unique by `id`, Fisher–Yates shuffle in Node, `slice(0, limit)`, `items.map(mapToCard)`.
   - Return `[]` when empty (PDP hides section).

**`getPublicProductBySlug` — add `category.id`** (lines 138-179):

```typescript
include: {
  category: { select: { name: true, slug: true } },
  // → add id: true
},
```

---

### `src/server/services/catalog.service.test.ts` (test, transform)

**Analog:** existing `buildPublicProductWhere` + `admin-order.service.test.ts` pure-function describes

**Mock setup — extend, do not replace** (lines 1-24):

```typescript
vi.mock("@/lib/db", () => ({
  prisma: {
    category: { findMany: vi.fn() },
    product: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));
```

**Pure helper tests — copy `buildPublicProductWhere` style** (lines 63-84):

```typescript
describe("buildPublicProductWhere", () => {
  it("applies brand and price filters", () => {
    const where = buildPublicProductWhere({
      brand: "Samsung",
      minPrice: 100_00,
      maxPrice: 500_00,
    });
    expect(where.price).toEqual({ gte: 100_00, lte: 500_00 });
  });
});
```

→ Add `describe("similarPriceBandKopiyky")` with 20% and 40% cases (e.g. `100_00` → floor/ceil bounds per CONTEXT D-09/D-11).

**Pure math analog — `computeTotalPages`** (`admin-order.service.test.ts` lines 142-149):

```typescript
describe("computeTotalPages", () => {
  it("ceil-divides total by page size", () => {
    expect(computeTotalPages(25, 10)).toBe(3);
  });
});
```

**Async list with chained `findMany` — copy `getOrderFilterCounts` pattern** (`admin-order.service.test.ts` lines 152-159):

```typescript
vi.mocked(prisma.order.count)
  .mockResolvedValueOnce(100)
  .mockResolvedValueOnce(81);
```

→ For `listSimilarPublicProducts`: chain `mockResolvedValueOnce` per tier (sparse → widen → category fill), assert `where` includes `id: { not: productId }` and `categoryId`.

**Kopiyky conversion tests elsewhere:** `src/lib/catalog/search-params.test.ts` lines 28-70 (`parsersToFilters` min/max kopiyky) — reference for numeric literals style (`1_300_000`).

---

### `src/types/catalog.ts` (model, transform)

**Analog:** `listCategoriesWithProductCounts` return shape (`catalog.service.ts` lines 218-224)

**Category with `id` already used server-side:**

```typescript
categories: categories.map((category) => ({
  id: category.id,
  slug: category.slug,
  name: category.name,
  // ...
})),
```

**Extend public card type** (lines 16-26):

```typescript
export type PublicProductCard = {
  id: string;
  // ...
  category: { name: string; slug: string };
  // → category: { id: string; name: string; slug: string };
};
```

`PublicProductDetail` extends `PublicProductCard` — inherits `category.id` automatically.

---

### `src/app/(storefront)/tovar/[slug]/page.tsx` (route RSC, request-response)

**Analog:** `src/app/(storefront)/katalog/[slug]/page.tsx`

**Session + wishlist Set** (`katalog/[slug]/page.tsx` lines 71-74):

```typescript
const session = await auth.api.getSession({ headers: await headers() });
const wishlistedProductIds = session?.user
  ? new Set(await getWishlistedProductIds(session.user.id))
  : undefined;
```

**Parallel data fetch** (`katalog/[slug]/page.tsx` lines 76-79):

```typescript
const [categoryCounts, priceBounds, result] = await Promise.all([
  listCategoriesWithProductCounts(),
  getCatalogPriceBounds(category.id),
  listPublicProducts({ categoryId: category.id, /* ... */ }),
]);
```

**PDP wiring — after `getPublicProductBySlug`, inside existing `max-w-6xl` wrapper:**

1. `Promise.all` (or sequential if product required first): `listSimilarPublicProducts({ productId: product.id, categoryId: product.category.id, price: product.price, limit: 4 })` + `getWishlistedProductIds` when `session?.user`.
2. Render similar block **after** `md:grid-cols-2` grid (lines 85-136), **before** closing `</div>` of container — not inside right column (D-01).

**Conditional section markup** (from RESEARCH; match PDP heading rhythm):

```tsx
{similar.length > 0 ? (
  <section className="mt-16 border-t border-border pt-12">
    <h2 className="text-2xl font-semibold tracking-tight">Схожі товари</h2>
    <div className="mt-6">
      <ProductGrid
        products={similar}
        hasSession={Boolean(session?.user)}
        wishlistedProductIds={wishlistedProductIds}
      />
    </div>
  </section>
) : null}
```

**Imports to add:** `ProductGrid`, `listSimilarPublicProducts`, `getWishlistedProductIds`.

**Keep existing PDP patterns:** `auth` + `headers`, per-product `isProductInCart` / `isProductInWishlist`, `PdpCartFab` outside container (lines 138-141).

---

### `src/components/layout/store-footer.tsx` (server component, request-response)

**Analog:** current file (layout-only refactor per D-18); regression baseline Phase 26 (`26-CONTEXT.md` D-21 — superseded on desktop by FOOT-05)

**Data fetch — unchanged** (lines 12-18):

```typescript
const contacts = await getPublicStoreContacts();
const primaryAddress = contacts.addresses[0];
const mapEmbedSrc = primaryAddress
  ? addressMapEmbedSrc(primaryAddress)
  : null;
```

**Target grid — single DOM, Tailwind `order-*`** (replace lines 23-99):

| Block | Mobile `order` | Desktop column |
|-------|----------------|----------------|
| Contacts lists | `order-1` | Right (`md:order-2`), top |
| `CallbackRequestForm` | `order-2` | Right (`md:order-2`), below contacts |
| Map iframe only | `order-3` | Left (`md:order-1`), `md:row-span-2` |

```tsx
<div className="grid gap-8 md:grid-cols-2 md:gap-12">
  <div className="order-3 md:order-1 md:row-span-2">
    {/* map iframe only */}
  </div>
  <div className="order-1 md:order-2 space-y-6 text-sm">
    {/* phones, emails, addresses — move from today’s col1 */}
  </div>
  <div className="order-2 md:order-2">
    <CallbackRequestForm />
  </div>
</div>
```

**Map iframe — taller desktop left column** (today lines 87-95):

```tsx
className="h-40 w-full rounded-md border border-border md:min-h-[280px] md:h-full"
```

Keep `loading="lazy"`, `referrerPolicy="no-referrer-when-downgrade"`, `title="Карта магазину"`.

**© row — centered desktop** (lines 101-103):

```tsx
<p className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground md:text-center">
  © {year} Техніка б/у Львів
</p>
```

**Do not change:** `uaPhoneTelHref`, `formatUaPhoneDisplay`, `addressExternalMapUrl`, `CallbackRequestForm` props/behavior.

---

### `src/components/catalog/similar-products-section.tsx` (optional component, request-response)

**Analog:** `src/components/home/hero-section.tsx` (presentational section wrapper)

**Section shell** (`hero-section.tsx` lines 7-9):

```tsx
export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 md:items-center">
```

**Similar section — server component props:**

```tsx
type SimilarProductsSectionProps = {
  products: PublicProductCard[];
  hasSession?: boolean;
  wishlistedProductIds?: Set<string>;
};

export function SimilarProductsSection({ products, hasSession, wishlistedProductIds }: SimilarProductsSectionProps) {
  if (products.length === 0) return null;
  return (
    <section className="mt-16 border-t border-border pt-12">
      <h2 className="text-2xl font-semibold tracking-tight">Схожі товари</h2>
      <div className="mt-6">
        <ProductGrid products={products} hasSession={hasSession} wishlistedProductIds={wishlistedProductIds} />
      </div>
    </section>
  );
}
```

Extract only if PDP markup exceeds ~15 lines; otherwise inline in `page.tsx` (planner discretion).

---

### Reuse only (no modifications expected)

**`src/components/catalog/product-grid.tsx`** — locked grid (lines 21-31):

```tsx
<div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
  {products.map((product) => (
    <ProductCard
      key={product.id}
      product={product}
      hasSession={hasSession}
      initialInWishlist={wishlistedProductIds?.has(product.id) ?? false}
    />
  ))}
</div>
```

**`src/components/catalog/product-card.tsx`** — Phase 29 full card + wishlist overlay; no new variant.

---

## Shared Patterns

### Public catalog in-stock filter
**Source:** `buildPublicProductWhere` / `buildCatalogContextWhere`  
**Apply to:** `listSimilarPublicProducts` all tiers  

```typescript
quantity: { gte: 1 },
```

### Card DTO mapping
**Source:** `mapToCard` (lines 67-86)  
**Apply to:** final similar list  

```typescript
return {
  id: product.id,
  title: product.title,
  slug: product.slug,
  brand: product.brand,
  price: product.price,
  condition: product.condition,
  category: product.category,
  previewImages,
  image,
};
```

### RSC auth + wishlist on catalog surfaces
**Source:** `katalog/page.tsx` + `katalog/[slug]/page.tsx`  
**Apply to:** PDP similar grid  

```typescript
const session = await auth.api.getSession({ headers: await headers() });
const wishlistedProductIds = session?.user
  ? new Set(await getWishlistedProductIds(session.user.id))
  : undefined;
// ProductGrid: hasSession={Boolean(session?.user)} wishlistedProductIds={wishlistedProductIds}
```

### Server-only random order (no hydration shuffle)
**Source:** none in codebase — new in-memory shuffle in `listSimilarPublicProducts` only  
**Apply to:** merged candidate array before `slice`  
**Avoid:** client `Math.random`, Prisma `orderBy` random, re-shuffle on hydration (D-10).

### Footer contact + map helpers
**Source:** `store-footer.tsx` + `@/lib/catalog/store-map` + `getPublicStoreContacts`  
**Apply to:** layout refactor only — same imports and helpers.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| — | — | — | All phase files have codebase matches |

**New patterns (document for planner, not “no analog”):**

| Pattern | Notes |
|---------|--------|
| Tiered pool merge + unique by `id` | No existing service does multi-query merge; structure follows `listPublicProducts` per tier |
| Fisher–Yates shuffle | No prior random product ordering; implement locally in `catalog.service.ts` |

---

## Metadata

**Analog search scope:** `src/server/services/catalog.service.ts`, `catalog.service.test.ts`, `src/types/catalog.ts`, `src/app/(storefront)/tovar/`, `src/app/(storefront)/katalog/`, `src/components/layout/store-footer.tsx`, `src/components/catalog/product-grid.tsx`, `src/components/home/hero-section.tsx`, `src/lib/catalog/search-params.test.ts`, `admin-order.service.test.ts`  
**Files scanned:** ~15  
**Pattern extraction date:** 2026-05-20
