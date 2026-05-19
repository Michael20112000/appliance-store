# Phase 25: Homepage empty categories - Pattern Map

**Mapped:** 2026-05-19
**Files analyzed:** 4 (create/modify) + 1 optional discretion
**Analogs found:** 4 / 4

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/home/category-grid.tsx` | component | CRUD (read) + conditional render | `src/components/layout/store-header.tsx` (data) + self (card UI) | exact (pipeline) + partial (UI) |
| `src/server/services/catalog.service.ts` | service | CRUD | `listCategoriesWithProductCounts` in same file | exact |
| `src/lib/catalog/categories.test.ts` | test | transform | `src/lib/catalog/categories.test.ts` (extend) | exact |
| `src/server/services/catalog.service.test.ts` | test | CRUD | `src/server/services/catalog.service.test.ts` | exact |
| `src/app/(storefront)/page.tsx` | route | request-response | — (no change) | N/A |

**Optional discretion (not required):** shared `getStorefrontCategories()` — no existing helper; inline two-line pipeline in `CategoryGrid` matches `StoreHeader` (YAGNI per RESEARCH).

## Pattern Assignments

### `src/components/home/category-grid.tsx` (component, CRUD + conditional render)

**Primary analog (data pipeline):** `src/components/layout/store-header.tsx`

**Secondary analog (card markup — keep unchanged):** current `src/components/home/category-grid.tsx`

**Imports pattern — target after change** (mirror header + keep card imports):

```typescript
import Link from "next/link";
import { categoriesWithAvailableProducts } from "@/lib/catalog/categories";
import { categoryImageAlt } from "@/lib/catalog/category-image-alt";
import { OptimizedImage } from "@/components/media/optimized-image";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listCategoriesWithProductCounts } from "@/server/services/catalog.service";
```

Remove: `import { prisma } from "@/lib/db";`

**Storefront category pipeline** (from `store-header.tsx` lines 4-18):

```4:18:src/components/layout/store-header.tsx
import { categoriesWithAvailableProducts } from "@/lib/catalog/categories";
import { listCategoriesWithProductCounts } from "@/server/services/catalog.service";
// ...
export async function StoreHeader() {
  const session = await auth.api.getSession({ headers: await headers() });
  const { categories: categoriesWithCounts } =
    await listCategoriesWithProductCounts();
  const availableCategories =
    categoriesWithAvailableProducts(categoriesWithCounts);
```

**RSC empty-section guard** (apply in `CategoryGrid` before any `<section>` — no exact home analog; pattern from RESEARCH + client `ActiveFilterChips`):

```typescript
const { categories: categoriesWithCounts } =
  await listCategoriesWithProductCounts();
const categories = categoriesWithAvailableProducts(categoriesWithCounts);

if (categories.length === 0) return null;
```

Reference for conditional `return null` in components (`active-filter-chips.tsx` lines 59-61):

```59:61:src/components/catalog/active-filter-chips.tsx
  if (!hasFilters) {
    return null;
  }
```

**Card UI to preserve unchanged** (`category-grid.tsx` lines 17-52 — only move guard above this block):

```17:52:src/components/home/category-grid.tsx
  return (
    <section id="kategorii" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="mb-6 text-2xl font-semibold">Категорії</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((category) => {
          const imageAlt =
            category.imageAlt?.trim() || categoryImageAlt(category.name);
          // ... OptimizedImage, Card, Link to /katalog/{slug}
```

Keep section/card markup verbatim (D-06/D-07); only swap data source and add early `return null`.

**Anti-pattern to remove** (current divergence, lines 12-15):

```12:15:src/components/home/category-grid.tsx
export async function CategoryGrid() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });
```

Sort order is preserved via `listCategories()` → filter (D-03); do not re-sort after filter.

---

### `src/server/services/catalog.service.ts` (service, CRUD)

**Analog:** `listCategoriesWithProductCounts` in same file (lines 180-218)

**Catalog visibility where** (do not change — D-02):

```22:28:src/server/services/catalog.service.ts
export function buildCatalogContextWhere(
  categoryId?: string,
): Prisma.ProductWhereInput {
  return {
    quantity: { gte: 1 },
    ...(categoryId && { categoryId }),
  };
}
```

**Counts aggregation** (used by pipeline):

```184:201:src/server/services/catalog.service.ts
export async function getCatalogCategoryCounts(): Promise<{
  total: number;
  byCategoryId: Record<string, number>;
}> {
  const [total, grouped] = await Promise.all([
    prisma.product.count({ where: buildCatalogContextWhere() }),
    prisma.product.groupBy({
      by: ["categoryId"],
      where: buildCatalogContextWhere(),
      _count: { _all: true },
    }),
  ]);
  // ...
}
```

**Current map — extend with image fields** (lines 204-218):

```204:218:src/server/services/catalog.service.ts
export async function listCategoriesWithProductCounts() {
  const [categories, counts] = await Promise.all([
    listCategories(),
    getCatalogCategoryCounts(),
  ]);

  return {
    totalProductCount: counts.total,
    categories: categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      productCount: counts.byCategoryId[category.id] ?? 0,
    })),
  };
}
```

**Target map shape** (add fields; no extra query — `listCategories()` already returns full rows):

```typescript
categories: categories.map((category) => ({
  id: category.id,
  slug: category.slug,
  name: category.name,
  imagePublicId: category.imagePublicId,
  imageAlt: category.imageAlt,
  productCount: counts.byCategoryId[category.id] ?? 0,
})),
```

**Caller pattern** (catalog page passes unfiltered list; client filters — homepage/header filter server-side):

```49:74:src/app/(storefront)/katalog/page.tsx
  const [categoryCounts, brands, priceBounds, result] = await Promise.all([
    listCategoriesWithProductCounts(),
    // ...
  ]);
  // ...
        <CatalogFilters
          brands={brands}
          categories={categoryCounts.categories}
          totalProductCount={categoryCounts.totalProductCount}
```

Catalog sidebar filters client-side (`catalog-filters.tsx` line 101):

```101:101:src/components/catalog/catalog-filters.tsx
  const visibleCategories = categoriesWithAvailableProducts(categories);
```

Homepage should filter in the **server** component (like header), not pass all categories to a client child.

---

### `src/lib/catalog/categories.test.ts` (test, transform)

**Analog:** existing file — extend same `describe` block

**Test structure** (lines 1-16):

```1:16:src/lib/catalog/categories.test.ts
import { describe, expect, it } from "vitest";
import { categoriesWithAvailableProducts } from "./categories";

describe("categoriesWithAvailableProducts", () => {
  it("keeps categories with productCount > 0", () => {
    const input = [
      { slug: "a", productCount: 2 },
      { slug: "b", productCount: 0 },
      { slug: "c", productCount: 1 },
    ];
    expect(categoriesWithAvailableProducts(input)).toEqual([
      { slug: "a", productCount: 2 },
      { slug: "c", productCount: 1 },
    ]);
  });
});
```

**Add case for D-03** (filter preserves relative order when middle item empty):

```typescript
it("preserves input order after filtering", () => {
  const input = [
    { slug: "first", productCount: 1 },
    { slug: "empty", productCount: 0 },
    { slug: "last", productCount: 3 },
  ];
  expect(categoriesWithAvailableProducts(input).map((c) => c.slug)).toEqual([
    "first",
    "last",
  ]);
});
```

**Filter implementation under test** (`categories.ts` lines 1-6):

```1:6:src/lib/catalog/categories.ts
export function categoriesWithAvailableProducts<
  T extends { productCount: number },
>(categories: T[]): T[] {
  return categories.filter((category) => category.productCount > 0);
}
```

---

### `src/server/services/catalog.service.test.ts` (test, CRUD) — optional Wave 0

**Analog:** existing `describe` blocks with `vi.mock("@/lib/db")` (lines 1-17, 64-77)

**Mock setup pattern**:

```1:17:src/server/services/catalog.service.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
import {
  buildCatalogContextWhere,
  buildPublicProductWhere,
  getCatalogPriceBounds,
  getDistinctBrands,
} from "./catalog.service";

vi.mock("@/lib/db", () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));
```

**`buildCatalogContextWhere` tests** (documents count semantics for HOME-03):

```64:76:src/server/services/catalog.service.test.ts
describe("buildCatalogContextWhere", () => {
  it("scopes to in-stock products globally", () => {
    expect(buildCatalogContextWhere()).toEqual({
      quantity: { gte: 1 },
    });
  });

  it("scopes to in-stock products in a category", () => {
    expect(buildCatalogContextWhere("cat-phones")).toEqual({
      quantity: { gte: 1 },
      categoryId: "cat-phones",
    });
  });
});
```

**Optional new describe** — mock `listCategories` + `getCatalogCategoryCounts` via `vi.spyOn` on module exports, or extend prisma mock with `category.findMany`, `product.count`, `product.groupBy`; assert returned DTO includes `imagePublicId`, `imageAlt`, and `productCount` from `byCategoryId`.

**Quick run** (from RESEARCH):

```bash
npm test -- --run src/lib/catalog/categories.test.ts src/server/services/catalog.service.test.ts
npm run build
```

---

## Shared Patterns

### Storefront category pipeline (service → pure filter)

**Source:** `src/components/layout/store-header.tsx` (lines 15-18)  
**Apply to:** `CategoryGrid` (server); already used in `StoreHeader`; catalog uses filter in `CatalogFiltersPanel`

```typescript
const { categories: categoriesWithCounts } =
  await listCategoriesWithProductCounts();
const availableCategories =
  categoriesWithAvailableProducts(categoriesWithCounts);
```

### Pure “has products” filter

**Source:** `src/lib/catalog/categories.ts`  
**Apply to:** Any UI listing categories for storefront (header, homepage, catalog sidebar)

```typescript
return categories.filter((category) => category.productCount > 0);
```

### Category image alt fallback

**Source:** `src/lib/catalog/category-image-alt.ts`  
**Apply to:** `CategoryGrid` card loop (unchanged)

```1:4:src/lib/catalog/category-image-alt.ts
export function categoryImageAlt(categoryName: string): string {
  return `${categoryName} — б/у техніка, Львів`;
}
```

### Service layer over Prisma in RSC

**Source:** project constraint + `store-header.tsx`  
**Apply to:** Remove direct `prisma` from `category-grid.tsx`; use `catalog.service` only.

### No new business rules

**Source:** `buildCatalogContextWhere` — `quantity: { gte: 1 }` only  
**Apply to:** Do not add Product `status`/publish filters in this phase (RESEARCH Pitfall 2).

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `getStorefrontCategories()` (optional helper) | utility | CRUD | Not in codebase; duplicate 2 lines unless header + grid refactored together |
| RSC `return null` for empty homepage section | component | conditional render | No other home server components hide whole sections; use header pipeline + `ActiveFilterChips` null pattern |

## Files Explicitly Out of Scope

| File | Reason |
|------|--------|
| `src/app/(storefront)/page.tsx` | Only renders `<CategoryGrid />`; no data logic (RESEARCH) |
| `src/components/catalog/catalog-filters.tsx` | Already filters; client-side only |
| `src/components/layout/store-mobile-nav.tsx` | FOOT-04 counts deferred to Phase 26 |

## Metadata

**Analog search scope:** `src/components/home/`, `src/components/layout/`, `src/components/catalog/`, `src/server/services/`, `src/lib/catalog/`, `src/app/(storefront)/`  
**Files scanned:** ~12  
**Pattern extraction date:** 2026-05-19

## PATTERN MAPPING COMPLETE

**Phase:** 25 - Homepage empty categories  
**Files classified:** 4 (+ 1 optional helper)  
**Analogs found:** 4 / 4

### Coverage
- Files with exact analog: 4
- Files with role-match analog: 0
- Files with no analog: 1 (optional helper only)

### Key Patterns Identified
- Homepage must use `listCategoriesWithProductCounts` → `categoriesWithAvailableProducts`, same as `StoreHeader`.
- Guard with `if (categories.length === 0) return null` before `<section id="kategorii">`.
- Extend `listCategoriesWithProductCounts` map with `imagePublicId` and `imageAlt` so card UI stays unchanged.
- Tests: extend `categories.test.ts` for order preservation; optional service test for DTO map.

### File Created
`.planning/phases/25-homepage-empty-categories/25-PATTERNS.md`

### Ready for Planning
Pattern mapping complete. Planner can reference analog patterns in PLAN.md files.
