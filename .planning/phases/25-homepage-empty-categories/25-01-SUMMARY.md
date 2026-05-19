---
phase: 25-homepage-empty-categories
plan: 01
subsystem: ui
tags: [nextjs, catalog, homepage, categories, vitest]

requires: []
provides:
  - Homepage CategoryGrid uses listCategoriesWithProductCounts + categoriesWithAvailableProducts (HOME-03)
  - Category DTO includes imagePublicId and imageAlt for homepage cards
  - Unit tests document filter order preservation and service DTO mapping
affects: [store-header, catalog-filters]

tech-stack:
  added: []
  patterns:
    - "Storefront surfaces fetch categories via catalog.service, not ad-hoc Prisma in UI"

key-files:
  created: []
  modified:
    - src/lib/catalog/categories.test.ts
    - src/server/services/catalog.service.ts
    - src/server/services/catalog.service.test.ts
    - src/components/home/category-grid.tsx

key-decisions:
  - "CategoryGrid returns null when no categories have available products (no empty section shell)"
  - "Image fields passed through listCategoriesWithProductCounts without extra DB query"

patterns-established:
  - "Homepage category grid mirrors StoreHeader data pipeline for HOME-03 parity"

requirements-completed: [HOME-03]

duration: 12min
completed: 2026-05-19
---

# Phase 25 Plan 01 Summary

**Homepage «Категорії» now hides empty categories and omits the whole section when nothing is in stock — same rules as the header nav.**

## Performance

- **Duration:** 12 min
- **Completed:** 2026-05-19
- **Tasks:** 3/3
- **Files modified:** 4

## Accomplishments

- Added `preserves input order after filtering` test for `categoriesWithAvailableProducts`
- Extended `listCategoriesWithProductCounts` DTO with `imagePublicId` and `imageAlt`; service test documents mapping
- Rewired `CategoryGrid` to storefront pipeline with early `return null` when filtered list is empty

## Task Commits

1. **Task 1: Document filter contract** - `7f3859a` (test)
2. **Task 2: Extend DTO and test** - `d073fc6` (feat)
3. **Task 3: Wire CategoryGrid** - `e177b0a` (feat)

## Files Created/Modified

- `src/lib/catalog/categories.test.ts` - Order preservation contract test
- `src/server/services/catalog.service.ts` - Image fields on category DTO
- `src/server/services/catalog.service.test.ts` - `listCategoriesWithProductCounts` test
- `src/components/home/category-grid.tsx` - Service pipeline + empty-section guard

## Verification

- `npm test -- --run src/lib/catalog/categories.test.ts src/server/services/catalog.service.test.ts` — pass
- `npm run build` — pass
- Full `npm test`: 1 pre-existing failure in `prisma/seed.test.ts` (`has out-of-stock demo products`) — DB state after purge (0 qty=0 products), unrelated to this plan

## Self-Check: PASSED

- [x] categories.test.ts order test added
- [x] catalog.service DTO includes image fields
- [x] CategoryGrid has no prisma import
- [x] Early return null when empty
- [x] Build green
