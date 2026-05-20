---
phase: 30-similar-products-footer-layout
plan: 01
subsystem: api
tags: [nextjs, prisma, vitest, pdp, catalog]

requires:
  - phase: 29-product-cards-pdp-core-ux
    provides: ProductCard, ProductGrid, wishlist on catalog cards
provides:
  - similarPriceBandKopiyky and listSimilarPublicProducts in catalog.service
  - category.id on PublicProductCard and PDP detail
  - SimilarProductsSection on PDP below main grid
affects:
  - 30-similar-products-footer-layout (plan 02 footer — independent)

tech-stack:
  added: []
  patterns:
    - "Tiered similar-product pool merge (±20% → ±40% → category take 50) with Fisher–Yates shuffle per request"
    - "PDP parallel fetch: similar products + wishlist Set like catalog pages"

key-files:
  created:
    - src/components/catalog/similar-products-section.tsx
  modified:
    - src/types/catalog.ts
    - src/server/services/catalog.service.ts
    - src/server/services/catalog.service.test.ts
    - src/app/(storefront)/tovar/[slug]/page.tsx
    - src/components/wishlist/wishlist-cabinet-preview.tsx
    - src/components/wishlist/wishlist-grid.tsx
    - src/lib/catalog/metadata.test.ts

key-decisions:
  - "Exclude productId inline in listSimilarPublicProducts where clauses — buildPublicProductWhere signature unchanged for catalog pages"
  - "SimilarProductsSection returns null when pool empty — no empty heading per D-12"

patterns-established:
  - "Server-side similar selection: progressive Prisma tiers, merge unique by id, shuffle once, slice(0, 4), mapToCard"

requirements-completed: [PDP-07]

duration: 25min
completed: 2026-05-20
---

# Phase 30 Plan 01: Similar products on PDP Summary

**Server-side «Схожі товари» on PDP: category-scoped price bands with ±20%/±40% fallbacks, Fisher–Yates shuffle, up to four ProductCards with wishlist when logged in.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-05-20T15:12:00Z
- **Completed:** 2026-05-20T15:17:30Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- `similarPriceBandKopiyky` and `listSimilarPublicProducts` with tiered queries reusing `buildPublicProductWhere`, `cardInclude`, `mapToCard`
- `PublicProductCard.category` includes `id`; PDP and card selects return it for D-06
- PDP fetches similar + wishlist in parallel; `SimilarProductsSection` renders below `md:grid-cols-2` grid inside `max-w-6xl`, hidden when zero candidates
- Vitest coverage for band math, exclude-self where clauses, and tier merge behavior

## Task Commits

Each task was committed atomically:

1. **Task 1: category.id + similar query helpers** - `f0f2d3d` (feat)
2. **Task 2: Vitest for similar bands and list** - `dc942c7` (test)
3. **Task 3: PDP wire similar section** - `dc999d9` (feat)

## Files Created/Modified

- `src/server/services/catalog.service.ts` - Band helper, tiered `listSimilarPublicProducts`, category `id` in selects
- `src/types/catalog.ts` - `category.id` on `PublicProductCard`
- `src/server/services/catalog.service.test.ts` - Band and similar list tests
- `src/components/catalog/similar-products-section.tsx` - Section shell + `ProductGrid`
- `src/app/(storefront)/tovar/[slug]/page.tsx` - Parallel fetch and conditional render
- `src/components/wishlist/wishlist-cabinet-preview.tsx`, `wishlist-grid.tsx` - Stub category `id` for type compatibility
- `src/lib/catalog/metadata.test.ts` - Fixture category `id`

## Decisions Made

- Inline `id: { not: productId }` in similar queries rather than extending `buildPublicProductWhere` (YAGNI for catalog filters)
- In-memory Fisher–Yates on merged pool (≤50 rows on category-only tier) per RESEARCH — no Prisma random order

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Extended category type broke wishlist/metadata fixtures**
- **Found during:** Task 1 (`npm run build`)
- **Issue:** `PublicProductCard.category` now requires `id`; wishlist preview/grid and metadata test used `{ name, slug }` only
- **Fix:** Added `id: ""` or `id: "cat-pralni"` to stub/fixture objects
- **Files modified:** `wishlist-cabinet-preview.tsx`, `wishlist-grid.tsx`, `metadata.test.ts`
- **Verification:** `npm run build` green
- **Committed in:** `f0f2d3d` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Type alignment only; no behavior change outside similar/PDP scope.

## Issues Encountered

- Full `npm test` fails on `prisma/seed.test.ts` (sparse local DB: 2 in-stock products vs ≥80 expected) — pre-existing environment, not introduced by this plan. Plan verification: `catalog.service.test.ts` + `npm run build` pass.
- Worktree initially on `main`; execution continued on `worktree-agent-30-02-footer-layout` (parallel wave branch with plan 02 footer commits below plan 01 work).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- PDP-07 similar section ready for manual UAT on `/tovar/[slug]` (stocked category, sparse category hide)
- Plan 02 (FOOT-05 footer layout) can proceed independently on same phase branch

## Self-Check: PASSED

- FOUND: src/components/catalog/similar-products-section.tsx
- FOUND: src/server/services/catalog.service.ts (listSimilarPublicProducts)
- FOUND: commit f0f2d3d
- FOUND: commit dc942c7
- FOUND: commit dc999d9

---
*Phase: 30-similar-products-footer-layout*
*Completed: 2026-05-20*
