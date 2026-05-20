---
phase: 29-product-cards-pdp-core-ux
plan: 01
subsystem: ui
tags: [nextjs, react, catalog, cloudinary, vitest, card-hover]

requires: []
provides:
  - PublicProductCard.previewImages (up to 5 from list query)
  - ProductCardImageStack desktop hover crossfade
  - mapToCard export and unit tests
affects:
  - 29-02 (PDP lightbox — independent)
  - 29-03 (PDP cart FAB — independent)

tech-stack:
  added: []
  patterns:
    - "List cards: previewImages[] + image first-element compat"
    - "Client image stack with matchMedia gates for hover, md+, reduced-motion"

key-files:
  created:
    - src/components/catalog/product-card-image-stack.tsx
  modified:
    - src/types/catalog.ts
    - src/server/services/catalog.service.ts
    - src/components/catalog/product-card.tsx
    - src/components/wishlist/wishlist-grid.tsx
    - src/components/wishlist/wishlist-cabinet-preview.tsx
    - src/server/services/catalog.service.test.ts
    - src/lib/catalog/metadata.test.ts

key-decisions:
  - "previewImages field name (not images[]) to avoid clash with PublicProductDetail.images"
  - "Exported mapToCard for direct Vitest coverage of mapper behavior"

patterns-established:
  - "ProductCardImageStack: 3s interval, opacity-300 crossfade, reset on mouseleave"
  - "Wishlist adapters: previewImages = single image array when image present"

requirements-completed: [CARD-01]

duration: 25min
completed: 2026-05-20
---

# Phase 29 Plan 01: Product Card Preview Images Summary

**Catalog list cards load up to five preview images with a desktop-only hover crossfade stack; mobile and reduced-motion stay on the first image.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-05-20T14:32:00Z
- **Completed:** 2026-05-20T14:38:00Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Extended `PublicProductCard` with `previewImages` and `cardInclude` `take: 5`
- Added `ProductCardImageStack` client component with 3s hover rotation on md+ fine pointer
- Updated wishlist `toPublicProductCard` mappers and Vitest for `mapToCard` preview length

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend PublicProductCard and catalog mapper** - `0aba248` (feat)
2. **Task 2: ProductCardImageStack hover crossfade** - `7923f7d` (feat)
3. **Task 3: Wishlist mappers + tests** - `5ea254d` (feat)

## Files Created/Modified

- `src/components/catalog/product-card-image-stack.tsx` - Layered crossfade stack with hover timer gates
- `src/types/catalog.ts` - `PublicProductCardImage`, `previewImages` on card type
- `src/server/services/catalog.service.ts` - `take: 5`, `mapToCard` preview mapping, PDP detail `previewImages`
- `src/components/catalog/product-card.tsx` - Wires stack; `ConditionBadge` `z-10`
- `src/components/wishlist/wishlist-grid.tsx` - `previewImages` from wishlist line image
- `src/components/wishlist/wishlist-cabinet-preview.tsx` - Same adapter pattern
- `src/server/services/catalog.service.test.ts` - `mapToCard` previewImages tests

## Decisions Made

- Used `previewImages` on the card type to keep `PublicProductDetail.images` (with `sortOrder`) unchanged
- Exported `mapToCard` for focused unit tests (D-21)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] TypeScript compat for new `previewImages` field**
- **Found during:** Task 1 (build verification)
- **Issue:** Wishlist mappers and `metadata.test` fixture lacked required `previewImages`
- **Fix:** Set `previewImages: line.image ? [line.image] : []` in wishlist helpers; added `previewImages: []` to metadata test product
- **Files modified:** `wishlist-grid.tsx`, `wishlist-cabinet-preview.tsx`, `metadata.test.ts`
- **Verification:** `npm run build` passes
- **Committed in:** `5ea254d` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required for compile after type extension; aligned with Task 3 wishlist scope.

## Issues Encountered

- **Full `npm test`:** 3 failures in `prisma/seed.test.ts` (incomplete local seed data: 2 in-stock products vs ≥80 expected). Out of scope for this plan. `src/server/services/catalog.service.test.ts` — 16/16 pass.
- **Build:** Transient `.next` ENOENT while `npm run dev` was active; clean rebuild succeeded.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- CARD-01 data + UI ready for manual UAT (desktop hover, mobile static, reduced motion)
- Plans 29-02 / 29-03 can proceed independently (lightbox, PDP cart FAB)

## Self-Check: PASSED

- FOUND: `src/components/catalog/product-card-image-stack.tsx`
- FOUND: `src/types/catalog.ts`
- FOUND: commits `0aba248`, `7923f7d`, `5ea254d`

---
*Phase: 29-product-cards-pdp-core-ux*
*Completed: 2026-05-20*
