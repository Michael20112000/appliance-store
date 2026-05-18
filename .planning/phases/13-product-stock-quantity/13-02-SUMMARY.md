---
phase: 13-product-stock-quantity
plan: 02
subsystem: api
tags: [prisma, stock, checkout, cart, catalog, vitest]

requires:
  - phase: 13-01
    provides: Product.quantity column on schema
provides:
  - isProductPurchasable helper for status + quantity checks
  - reserveProductUnitForCheckout with atomic decrement and conditional SOLD
  - Cart/catalog/wishlist guards hiding or rejecting zero-stock AVAILABLE listings
affects: [13-03, 13-04, checkout, catalog]

tech-stack:
  added: []
  patterns:
    - "Purchasability: status AVAILABLE AND quantity >= 1"
    - "Checkout: decrement quantity in transaction; SOLD only when quantity hits 0"

key-files:
  created:
    - src/server/services/product-availability.ts
    - src/server/services/product-availability.test.ts
  modified:
    - src/server/services/order.service.ts
    - src/server/services/order.service.test.ts
    - src/server/services/cart.service.ts
    - src/server/services/cart.service.test.ts
    - src/server/services/catalog.service.ts
    - src/server/services/catalog.service.test.ts
    - src/server/services/wishlist.service.ts

key-decisions:
  - "Colocated reserveProductUnitForCheckout in order.service.ts per plan"
  - "P2025 from Prisma update maps to PRODUCT_UNAVAILABLE (unchanged error string)"
  - "No quantity in cart/catalog DTOs per D-13-13"

patterns-established:
  - "Public catalog where clauses include quantity: { gte: 1 } alongside AVAILABLE"
  - "Checkout reserves one unit per cart line via decrement, not blanket updateMany SOLD"

requirements-completed: []

duration: 18min
completed: 2026-05-18
---

# Phase 13 Plan 02: Checkout Stock & Purchasability Summary

**Atomic checkout decrements `Product.quantity` with conditional SOLD; cart, catalog, and wishlist reject or hide zero-stock AVAILABLE listings without exposing quantity on storefront.**

## Performance

- **Duration:** 18 min
- **Started:** 2026-05-18T17:58:00Z
- **Completed:** 2026-05-18T18:01:30Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- `isProductPurchasable` centralizes status + quantity guard (D-13-06)
- `reserveProductUnitForCheckout` decrements stock atomically; SOLD only when quantity reaches 0 (D-13-04–05, T-13-01)
- Cart prunes stale lines, blocks add at quantity 0; catalog context/listing queries exclude ghost AVAILABLE+0
- Wishlist add requires `quantity >= 1`
- Vitest coverage for purchasability, catalog where builders, and three `reserveProductUnitForCheckout` paths

## Task Commits

Each task was committed atomically:

1. **Task 1: Purchasability helper + cart/catalog/wishlist guards** - `7cbf4fb` (feat)
2. **Task 2: Checkout decrement and conditional SOLD** - `ed82df3` (feat)
3. **Task 3: Unit tests for reserveProductUnitForCheckout** - `08214f7` (test)

## Files Created/Modified

- `src/server/services/product-availability.ts` - `isProductPurchasable(status, quantity)`
- `src/server/services/order.service.ts` - `reserveProductUnitForCheckout`, updated `createOrderFromCart` loop
- `src/server/services/cart.service.ts` - mapLine prune, addToCart where, `canAddProductToCart(status, quantity)`
- `src/server/services/catalog.service.ts` - `quantity: { gte: 1 }` on public/context where builders
- `src/server/services/wishlist.service.ts` - stock guard on add
- `*.test.ts` - extended/added Vitest for above behavior

## Decisions Made

- Kept `PRODUCT_UNAVAILABLE` error string unchanged for existing client handling
- Did not restore quantity on order cancel (out of scope per plan)
- Skipped `requirements.mark-complete` for ADM-PRD-03 — admin UI visibility remains for plan 13-04

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None

## Next Phase Readiness

- Plan 13-04 can wire admin quantity display and e2e checkout stock scenarios
- `getPublicProductBySlug` still filters status only (not in plan 02 scope); PDP for quantity-0 AVAILABLE is unreachable via catalog but direct slug access possible until addressed

---
*Phase: 13-product-stock-quantity*
*Completed: 2026-05-18*

## Self-Check: PASSED

- FOUND: src/server/services/product-availability.ts
- FOUND: src/server/services/order.service.ts (reserveProductUnitForCheckout)
- FOUND: commit 7cbf4fb
- FOUND: commit ed82df3
- FOUND: commit 08214f7
