# Phase 15 Research: Storefront Catalog Polish

**Researched:** 2026-05-18  
**Phase:** 15-storefront-catalog-polish  
**Requirements:** CAT-04, CAT-05, CAT-06

## Summary

Phase 15 is a **storefront polish pass** on existing catalog infrastructure from Phases 02, 07, and 13. Counts and availability already flow through `buildCatalogContextWhere()` (`AVAILABLE` + `quantity >= 1`). Work is UI filtering, Badge presentation, and pagination wiring — no schema changes.

**Primary recommendation:** Add `CATALOG_PAGE_SIZE = 16` and a shared `categoriesWithAvailableProducts()` filter in `catalog.service.ts`; reuse `listCategoriesWithProductCounts()` everywhere navigation needs counts; extend `AdminListPagination` with `showPageSizeSelector={false}` for storefront; add client `CatalogListPagination` for nuqs clamp + href building.

---

## Standard Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Counts / filters | `catalog.service.ts` | `[VERIFIED: codebase]` — `listCategoriesWithProductCounts`, `buildCatalogContextWhere` |
| URL state | nuqs `catalogParsers` / `storinka` | `[VERIFIED: codebase]` — `src/lib/catalog/search-params.ts` |
| Pagination UI | `AdminListPagination` | `[VERIFIED: codebase]` — used by admin products/orders |
| Badge | shadcn `Badge` | `[VERIFIED: codebase]` — `src/components/ui/badge.tsx` exists |
| Tests | Vitest + Playwright | `[VERIFIED: codebase]` — `catalog.service.test.ts`, `e2e/catalog-*.spec.ts` |

---

## Architecture Patterns

### 1. Single source for “available product” (D-15-01)

```typescript
// catalog.service.ts — already correct
buildCatalogContextWhere(categoryId?) => { status: AVAILABLE, quantity: { gte: 1 }, ... }
```

`listCategoriesWithProductCounts()` maps all categories with `productCount` from `getCatalogCategoryCounts()`. **Do not** duplicate count logic in components.

### 2. Filter empty categories (D-15-02…D-15-05)

```typescript
// Proposed helper in catalog.service.ts
export function categoriesWithAvailableProducts<T extends { productCount: number }>(
  categories: T[],
): T[] {
  return categories.filter((c) => c.productCount > 0);
}
```

| Consumer | Current | Change |
|----------|---------|--------|
| `store-header.tsx` | `prisma.category.findMany` + `slice(0,4)` | Fetch counts → filter → `slice(0,4)` |
| `category-grid.tsx` | all categories from Prisma | `listCategoriesWithProductCounts()` → filter → map |
| `catalog-filters.tsx` | all categories in props | Filter in component OR server passes filtered list |
| `store-mobile-nav.tsx` | all categories | Filtered list from header parent |

Header needs **async server** data with counts — replace raw Prisma with `listCategoriesWithProductCounts()` + filter + slice.

### 3. Badge instead of em dash (D-15-06…D-15-09)

Replace `formatCategoryLabel` in `catalog-filters.tsx`:

```tsx
<span className="flex items-center gap-2">
  {name}
  <Badge variant="secondary">{count}</Badge>
</span>
```

Header/mobile: optional small Badge next to link text (same variant).

### 4. Pagination 16 + nuqs (D-15-10…D-15-15)

| Item | Current | Target |
|------|---------|--------|
| `DEFAULT_PAGE_SIZE` | 24 | Keep for generic default; export `CATALOG_PAGE_SIZE = 16` for storefront pages |
| `katalog/page.tsx` | `pageSize: 24` | `CATALOG_PAGE_SIZE` |
| `katalog/[slug]/page.tsx` | `pageSize: 24` | same |
| Pagination UI | none | `CatalogListPagination` client below grid |

**AdminListPagination constraint:** Includes «Рядків на сторінці» selector tied to `ADMIN_PAGE_SIZES`. Storefront needs fixed 16 per D-15-10.

**Recommendation [VERIFIED: codebase]:** Add optional prop:

```typescript
showPageSizeSelector?: boolean; // default true
```

When `false`, render only page indicator + `Pagination` controls (D-15-11 reuse without admin page-size UX).

**Clamp (D-15-14):** Client component after server fetch:

```typescript
const totalPages = computeTotalPages(result.total, CATALOG_PAGE_SIZE);
const safePage = Math.min(Math.max(1, parsed.storinka), totalPages);
useEffect(() => {
  if (parsed.storinka !== safePage) {
    void setParams({ storinka: safePage }, { history: "replace" });
  }
}, [...]);
```

Pass `safePage` to `listPublicProducts` on server — **or** clamp in page before query: `page: Math.min(parsed.storinka, computeTotalPages(...))` to avoid empty grid flash. Prefer **server clamp** in page.tsx + client sync for URL consistency.

### 5. Empty category deep link (D-15-16)

`[slug]/page.tsx` already returns 200 with empty state when category exists but `result.total === 0`. No `notFound()` for zero products — only for unknown slug. **No change required** beyond ensuring `notFound()` only when `getCategoryBySlug` returns null.

### 6. Sitemap (discretion)

`src/app/sitemap.ts` uses `listCategories()` (all categories). Simple hook: switch to `listCategoriesWithProductCounts()` + filter `productCount > 0` — ~5 lines, aligns with CAT-04. `[VERIFIED: codebase]`

---

## Validation Architecture

| Requirement | Automated | Manual |
|-------------|-----------|--------|
| CAT-04 empty categories hidden | Vitest helper; e2e: seeded empty category absent from sidebar | Header + homepage visual |
| CAT-05 Badge | Component render / e2e locator `badge` | Sidebar visual |
| CAT-06 pagination 16 | Vitest `CATALOG_PAGE_SIZE`; e2e URL `сторінка=2` | Compare with admin pagination |
| storinka clamp | Vitest or e2e OOB URL | — |
| D-15-16 empty category 200 | e2e status + body | — |

**Nyquist commands:**

- `npm run test -- src/server/services/catalog.service.test.ts`
- `npx playwright test e2e/catalog-pagination.spec.ts` (new)
- `npm run build`

---

## File Change Map

| File | Change |
|------|--------|
| `src/server/services/catalog.service.ts` | `CATALOG_PAGE_SIZE`, `categoriesWithAvailableProducts` |
| `src/server/services/catalog.service.test.ts` | Helper tests |
| `src/components/layout/store-header.tsx` | Counted nav categories |
| `src/components/home/category-grid.tsx` | Filter empty |
| `src/components/layout/store-mobile-nav.tsx` | Filtered props + optional Badge |
| `src/components/catalog/catalog-filters.tsx` | Badge, filter categories |
| `src/components/admin/admin-list-pagination.tsx` | `showPageSizeSelector` |
| `src/components/catalog/catalog-list-pagination.tsx` | **new** — nuqs + AdminListPagination |
| `src/lib/catalog/catalog-url.ts` | **new** — `catalogPageHref(pathname, params)` |
| `src/app/(storefront)/katalog/page.tsx` | pageSize 16, clamp, pagination |
| `src/app/(storefront)/katalog/[slug]/page.tsx` | same |
| `src/app/sitemap.ts` | optional non-empty categories |
| `e2e/catalog-pagination.spec.ts` | **new** |

---

## Pitfalls

1. **Header slice before filter** — `slice(0,4)` on all categories shows empty slots; must filter first. `[VERIFIED: CONTEXT D-15-02]`
2. **Double fetch** — Header and homepage both need counts; acceptable; consider single call per page only.
3. **AdminListPagination page size row** — Without `showPageSizeSelector={false}`, storefront shows 10/20/50 admin sizes. `[HIGH risk]`
4. **Hydration mismatch on clamp** — Server and client must use same clamped page for product list.
5. **Mobile nav types** — Extend `MobileNavCategory` with optional `productCount` for Badge.

---

## Project Constraints (from AGENTS.md)

- Read `node_modules/next/dist/docs/` before Next.js API changes — this phase uses existing App Router patterns only.

---

## RESEARCH COMPLETE
