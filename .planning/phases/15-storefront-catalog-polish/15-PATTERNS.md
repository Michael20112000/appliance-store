# Phase 15 Pattern Map

**Phase:** 15-storefront-catalog-polish  
**Generated:** 2026-05-18

## File → Analog → Excerpt

### `src/server/services/catalog.service.ts`

| Role | Analog | Pattern |
|------|--------|---------|
| Availability where | Phase 13 | `buildCatalogContextWhere` with `quantity: { gte: 1 }` |
| Category counts | Existing | `listCategoriesWithProductCounts()` |

```typescript
export function buildCatalogContextWhere(categoryId?: string): Prisma.ProductWhereInput {
  return {
    status: PUBLIC_STATUS,
    quantity: { gte: 1 },
    ...(categoryId && { categoryId }),
  };
}
```

### `src/components/admin/products-list-pagination.tsx` → new `catalog-list-pagination.tsx`

| Role | Analog | Pattern |
|------|--------|---------|
| Thin wrapper | `ProductsListPagination` | Passes `hrefFor` into `AdminListPagination` |

```typescript
return (
  <AdminListPagination
    page={page}
    pageSize={pageSize}
    totalPages={totalPages}
    hrefFor={({ page: nextPage, pageSize: nextPageSize }) =>
      adminProductsUrl({ page: nextPage, pageSize: nextPageSize, ... })
    }
  />
);
```

Storefront variant: `useQueryStates(catalogParsers)` + `createSerializer` or manual query string for `hrefFor`; `showPageSizeSelector={false}`; fixed `pageSize={16}`.

### `src/components/catalog/catalog-filters.tsx`

| Role | Analog | Pattern |
|------|--------|---------|
| URL reset on filter | `catalog-toolbar.tsx` | `setParams({ ..., storinka: 1 })` |
| Chips | `active-filter-chips.tsx` | nuqs client |

Replace label helper with Badge inline (see `src/components/ui/badge.tsx`).

### `src/components/layout/store-header.tsx`

| Role | Analog | Pattern |
|------|--------|---------|
| Server data | `CategoryGrid` (today raw Prisma) | Move to catalog service with counts |
| Nav links | Current `categories.slice(0, 4)` | Filter `productCount > 0` then slice |

### `src/app/(storefront)/katalog/page.tsx`

| Role | Analog | Pattern |
|------|--------|---------|
| Listing | Same file | `listPublicProducts({ page, pageSize })` |
| Page size | Admin list pages | Explicit `pageSize` arg (today hardcoded 24) |

### `src/components/catalog/catalog-brand-param-guard.tsx`

| Role | Analog | Pattern |
|------|--------|---------|
| nuqs replace | Phase 07 | `setParams(..., { history: 'replace' })` for invalid URL state |

Use same pattern for OOB `storinka` clamp in `CatalogListPagination`.

### Tests

| Role | Analog | Pattern |
|------|--------|---------|
| Service unit | `catalog.service.test.ts` | `buildCatalogContextWhere` tests |
| E2E URL | `e2e/catalog-filters-url.spec.ts` | `page.goto('/katalog?...')` |

## PATTERN MAPPING COMPLETE
