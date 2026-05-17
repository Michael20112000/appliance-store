# Phase 7 — Pattern Map

## Files to modify

| Role | Path | Closest analog |
|------|------|----------------|
| URL parsers | `src/lib/catalog/search-params.ts` | existing file — extend tests only |
| Catalog service | `src/server/services/catalog.service.ts` | `listPublicProducts` where builder |
| Filters UI | `src/components/catalog/catalog-filters.tsx` | admin forms with shadcn inputs |
| Toolbar | `src/components/catalog/catalog-toolbar.tsx` | badge patterns in `product-card.tsx` |
| Global catalog RSC | `src/app/(storefront)/katalog/page.tsx` | current parallel fetch pattern |
| Category RSC | `src/app/(storefront)/katalog/[slug]/page.tsx` | same |

## Code excerpts

### nuqs + UA keys (keep)

```typescript
export const catalogUrlKeys = {
  cinaVid: "cina-vid",
  cinaDo: "cina-do",
  storinka: "сторінка",
  // ...
};
```

### Page data fetch (extend)

```typescript
const [categories, brands, priceBounds, result] = await Promise.all([
  listCategories(),
  getDistinctBrands(category?.id),
  getCatalogPriceBounds(category?.id),
  listPublicProducts({ categoryId: category?.id, filters, ... }),
]);
```

### Service where (unchanged)

```typescript
price: {
  ...(filters.minPrice != null && { gte: filters.minPrice }),
  ...(filters.maxPrice != null && { lte: filters.maxPrice }),
}
```
