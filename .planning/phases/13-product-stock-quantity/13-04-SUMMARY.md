---
phase: 13-product-stock-quantity
plan: 04
subsystem: ui
tags: [admin, playwright, product-form, quantity, e2e]

requires:
  - phase: 13-product-stock-quantity
    plan: 02
    provides: checkout stock decrement and purchasability
  - phase: 13-product-stock-quantity
    plan: 03
    provides: admin Zod quantity validation and persistence
provides:
  - Admin form field Кількість with create default 1
  - Admin products table non-sortable Кількість column
  - E2E coverage for admin quantity visibility and post-checkout stock
affects: []

tech-stack:
  added: []
  patterns:
    - "Admin quantity UI only; storefront has no product.quantity in catalog/PDP JSX"
    - "E2E admin list rows use role=link from clickable-table-row pattern"

key-files:
  created: []
  modified:
    - src/components/admin/product-form.tsx
    - src/components/admin/admin-products-table.tsx
    - src/app/(admin)/admin/tovary/[id]/page.tsx
    - e2e/admin-products.spec.ts
    - e2e/checkout.spec.ts
    - e2e/helpers/catalog.ts
    - prisma/seed-products.ts

key-decisions:
  - "E2E asserts admin list via getByRole('link') matching clickable row pattern"
  - "Cart helper waits for «уже в кошику» state instead of enabled add button"

patterns-established:
  - "Quantity column between Ціна and Статус without AdminSortableTableHeader"

requirements-completed: [ADM-PRD-03]

duration: 25min
completed: 2026-05-18
---

# Phase 13 Plan 04: Admin Quantity UI & E2E Summary

**Admin form and products table expose integer stock (Кількість); Playwright verifies create/list/checkout decrement while storefront catalog and PDP stay quantity-free.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-05-18T18:30:00Z
- **Completed:** 2026-05-18T18:55:00Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- `ProductForm` captures quantity beside price (create min 1, edit min 0, default 1)
- `AdminProductsTable` shows plain «Кількість» column between price and status (no sort)
- Edit page passes `product.quantity` into form defaultValues
- E2E: admin create with quantity 2 visible in list; checkout reduces quantity 2→1 on edit form
- Storefront regression: no `product.quantity` in `src/components/catalog` TSX

## Task Commits

Each task was committed atomically:

1. **Task 1: Product form quantity field** - `661af31` (feat)
2. **Task 2: Admin table Кількість column (no sort)** - `504d45a` (feat)
3. **Task 3: E2E admin quantity + storefront regression + checkout stock** - `3fa4dcf` (test)

## Files Created/Modified

- `src/components/admin/product-form.tsx` - Кількість input, defaultValues, create helper copy
- `src/app/(admin)/admin/tovary/[id]/page.tsx` - `quantity: product.quantity` in defaultValues
- `src/components/admin/admin-products-table.tsx` - `AdminProductListItem.quantity`, plain header/cell
- `e2e/admin-products.spec.ts` - fill Кількість, assert edit form and list link row
- `e2e/checkout.spec.ts` - new stock decrement test with admin+buyer contexts
- `e2e/helpers/catalog.ts` - in-cart and header cart badge assertions
- `prisma/seed-products.ts` - delete orphan cart items before orphan product cleanup

## Decisions Made

- Reused existing `upsertProductSchema` / actions without client-side type hacks
- E2E list assertion uses `role="link"` rows from Phase 12 clickable-table pattern

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] E2E helpers aligned with in-cart and clickable-row UI**
- **Found during:** Task 3 (Playwright run)
- **Issue:** `addCurrentProductToCart` expected add button to stay enabled; PDP shows disabled «У кошику». Admin list `getByRole('row')` failed after rows became `role="link"`.
- **Fix:** Assert «уже в кошику» + header `Кошик, N товар` link; use `getByRole('link', { name: title })` on admin list.
- **Files modified:** `e2e/helpers/catalog.ts`, `e2e/admin-products.spec.ts`
- **Verification:** `npm run test:e2e -- e2e/admin-products.spec.ts e2e/checkout.spec.ts` — 3 passed
- **Committed in:** `3fa4dcf`

**2. [Rule 3 - Blocking] Seed clears cart lines before orphan product delete**
- **Found during:** Task 3 (e2e globalSetup re-seed after checkout test)
- **Issue:** `product.deleteMany` failed with `CartItem_productId_fkey` when E2E products remained in carts.
- **Fix:** `cartItem.deleteMany` for orphan products before `product.deleteMany`.
- **Files modified:** `prisma/seed-products.ts`
- **Verification:** seed + e2e suite pass
- **Committed in:** `3fa4dcf`

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Test infrastructure only; no storefront or admin UI scope creep.

## Issues Encountered

- Initial e2e run blocked by conflicting `next dev` process — resolved by stopping stale PID before Playwright webServer start.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 13 complete for ADM-PRD-03: admin visibility + backend stock from plans 01–03
- Optional follow-up: `getPublicProductBySlug` quantity guard noted in 13-02 summary (direct slug edge case)

---
*Phase: 13-product-stock-quantity*
*Completed: 2026-05-18*

## Self-Check: PASSED

- FOUND: src/components/admin/product-form.tsx
- FOUND: src/components/admin/admin-products-table.tsx
- FOUND: commit 661af31
- FOUND: commit 504d45a
- FOUND: commit 3fa4dcf
