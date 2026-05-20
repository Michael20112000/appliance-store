---
phase: 29-product-cards-pdp-core-ux
plan: 03
subsystem: ui
tags: [nextjs, react, cart, pdp, fab, lucide]

requires:
  - phase: 29-01
    provides: Product card / gallery baseline on catalog
  - phase: 29-02
    provides: PDP lightbox Embla tuning
provides:
  - AddToCartButton in-cart «Вже в кошику» + icon-only trash (max two controls)
  - PdpCartFab on PDP only, stacked above ChatFab
affects:
  - phase-30-similar-products

tech-stack:
  added: []
  patterns:
    - "PDP cart navigation via PdpCartFab only (no inline go-to-cart link)"
    - "Guest FAB count: getPendingItemCount + CART_CHANGED_EVENT"
    - "Session FAB count: getCartItemCount server prop + router.refresh after cart actions"

key-files:
  created:
    - src/components/cart/pdp-cart-fab.tsx
  modified:
    - src/components/cart/add-to-cart-button.tsx
    - src/app/(storefront)/tovar/[slug]/page.tsx

key-decisions:
  - "In-cart row: flex items-center gap-2 with disabled secondary + size-icon trash"
  - "FAB z-[59] at bottom-[5.75rem] clears ChatFab z-[60] at bottom-6"

patterns-established:
  - "PdpCartFab: null when count < 1; badge 9+ cap mirrors nav links"

requirements-completed: [PDP-06]

duration: 18min
completed: 2026-05-20
---

# Phase 29 Plan 03: PDP Cart Controls + FAB Summary

**PDP in-cart state shows «Вже в кошику» with icon-only remove; a PDP-only cart FAB above chat links to /koszyk when count ≥ 1.**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-05-20T14:40:00Z
- **Completed:** 2026-05-20T14:43:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Refactored `AddToCartButton` in-cart branch: «Вже в кошику» + `Trash2` icon button; removed «Перейти до кошика»
- Added `PdpCartFab` with guest pending-storage sync and session `initialCount`
- Wired FAB on `tovar/[slug]/page.tsx` via `getCartItemCount` for signed-in users

## Task Commits

Each task was committed atomically:

1. **Task 1: AddToCartButton in-cart layout** - `1c0a675` (feat)
2. **Task 2: PdpCartFab component** - `fb68103` (feat)
3. **Task 3: Wire PDP page + phase gate** - `e62801e` (feat)

## Files Created/Modified

- `src/components/cart/pdp-cart-fab.tsx` - Fixed cart FAB above chat with badge
- `src/components/cart/add-to-cart-button.tsx` - Two-control in-cart layout per D-10–D-13
- `src/app/(storefront)/tovar/[slug]/page.tsx` - `cartCount` + `PdpCartFab` mount

## Decisions Made

None - followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `npm test` reports 3 failures in `prisma/seed.test.ts` only (under-seeded local DB). All other 47 test files / 259 tests pass; `npm run build` succeeds.

## Manual UAT Checklist

From `29-UI-SPEC.md` — verify on a running dev server (`npm run dev`):

1. **Desktop card hover:** Card with 3+ photos — hover → immediate first image, then ~3s crossfade (Plan 01).
2. **Mobile card:** Card shows first image only, no cycle (Plan 01).
3. **Reduced motion:** With OS reduced-motion on, card image stays static (Plan 01).
4. **PDP lightbox:** On phone, open gallery lightbox — swipe and release without jerk snap-back (Plan 02).
5. **PDP in-cart row:** Add to cart → «Вже в кошику» + trash icon; no «Перейти до кошика» inline.
6. **PDP cart FAB:** When cart count ≥ 1, cart FAB appears above chat FAB; tap navigates to `/koszyk`; badge shows count (9+ when > 9).
7. **Guest path:** Logged out — add/remove updates FAB badge via pending cart without full page reload.
8. **Session path:** Logged in — add/remove refreshes count on FAB after `router.refresh()`.
9. **Chat unchanged:** Global `ChatFab` and PDP `OpenChatButton` still work; no edits to `chat-fab.tsx`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- PDP-06 (D-10–D-22) implemented in code; manual UAT above recommended before phase sign-off.
- Phase 30 (similar products) can proceed independently.

## Self-Check: PASSED

- FOUND: src/components/cart/pdp-cart-fab.tsx
- FOUND: src/components/cart/add-to-cart-button.tsx (no «Перейти до кошика»)
- FOUND: src/app/(storefront)/tovar/[slug]/page.tsx
- FOUND: commit 1c0a675
- FOUND: commit fb68103
- FOUND: commit e62801e

---
*Phase: 29-product-cards-pdp-core-ux*
*Completed: 2026-05-20*
