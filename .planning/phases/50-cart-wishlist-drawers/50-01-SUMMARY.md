---
phase: 50-cart-wishlist-drawers
plan: "01"
subsystem: test-stubs
tags:
  - tdd
  - red-phase
  - wave-1
  - cart
  - wishlist
  - drawers
dependency_graph:
  requires: []
  provides:
    - src/lib/drawers/drawer-context.test.tsx
    - src/components/cart/cart-nav-button.test.tsx
    - src/components/cart/cart-drawer.test.tsx
    - src/components/wishlist/wishlist-nav-link.test.tsx
    - src/components/wishlist/wishlist-drawer.test.tsx
  affects:
    - src/components/layout/storefront-fabs.test.tsx
tech_stack:
  added: []
  patterns:
    - "TDD RED phase: test stubs that import non-existent modules"
    - "vi.mock for @/lib/drawers/drawer-context across all consumer tests"
    - "Sheet mock pattern via Base UI Dialog for drawer tests"
key_files:
  created:
    - src/lib/drawers/drawer-context.test.tsx
    - src/components/cart/cart-nav-button.test.tsx
    - src/components/cart/cart-drawer.test.tsx
    - src/components/wishlist/wishlist-nav-link.test.tsx
    - src/components/wishlist/wishlist-drawer.test.tsx
  modified:
    - src/components/layout/storefront-fabs.test.tsx
decisions:
  - "Sheet mock uses React.createElement directly to avoid JSX transform dependency in mock factory"
  - "wishlist-nav-link.test.tsx written fresh (no prior version existed) — tests new button behavior"
  - "storefront-fabs.test.tsx: both FAB-01-a and FAB-01-b updated in one commit; other tests untouched"
metrics:
  duration: "2m"
  completed_date: "2026-05-27T11:05:29Z"
  tasks_completed: 3
  tasks_total: 3
  files_created: 5
  files_modified: 1
---

# Phase 50 Plan 01: Wave 0 TDD Test Stubs Summary

**One-liner:** Six failing test files establish the RED TDD baseline for DrawerProvider context, CartNavButton, CartDrawer, WishlistNavLink, WishlistDrawer, and updated StorefrontFabs FAB assertions.

## What Was Built

This plan creates the Wave 0 TDD baseline — 5 new test files and 1 updated test file, all in RED state (non-zero exit). No production code was written. Plans 02–05 will make these tests green by implementing the actual components.

### Test Files Created

| File | Tests | Status |
|------|-------|--------|
| `src/lib/drawers/drawer-context.test.tsx` | 6 (DRWR-CTX-01 through DRWR-CTX-06) | RED |
| `src/components/cart/cart-nav-button.test.tsx` | 6 (CART-NAV-01 through CART-NAV-06) | RED |
| `src/components/cart/cart-drawer.test.tsx` | 4 (CART-DRW-01 through CART-DRW-04) | RED |
| `src/components/wishlist/wishlist-nav-link.test.tsx` | 4 (WLIST-NAV-01 through WLIST-NAV-04) | RED |
| `src/components/wishlist/wishlist-drawer.test.tsx` | 3 (WLIST-DRW-01 through WLIST-DRW-03) | RED |

### Test File Modified

| File | Changes | FAB-01-a/FAB-01-b Status | FAB-01-c through FAB-04-d Status |
|------|---------|--------------------------|----------------------------------|
| `src/components/layout/storefront-fabs.test.tsx` | Added `useDrawers` mock + import; updated FAB-01-a (link→button assertion), FAB-01-b (href→openCart assertion) | RED | Pending (will green once drawer-context module exists) |

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | d10dfba | DrawerProvider context test stub (DRWR-CTX-01..06) |
| Task 2 | 670c3d4 | CartNavButton, CartDrawer, WishlistNavLink, WishlistDrawer test stubs |
| Task 3 | c34b923 | storefront-fabs FAB-01-a/FAB-01-b updated to button/openCart assertions |

## Verification

All 5 new test files exit non-zero (import-level failure: `@/lib/drawers/drawer-context` module does not yet exist). This is the expected RED state.

`storefront-fabs.test.tsx` exits non-zero (RED) — `@/lib/drawers/drawer-context` module not yet implemented.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — this plan only creates test files, not production code.

## Threat Flags

None — this plan creates only test stubs. No production code, auth surface, or user data flows were introduced.

## Self-Check: PASSED

Files verified present:
- src/lib/drawers/drawer-context.test.tsx: FOUND
- src/components/cart/cart-nav-button.test.tsx: FOUND
- src/components/cart/cart-drawer.test.tsx: FOUND
- src/components/wishlist/wishlist-nav-link.test.tsx: FOUND
- src/components/wishlist/wishlist-drawer.test.tsx: FOUND
- src/components/layout/storefront-fabs.test.tsx: FOUND (modified)

Commits verified:
- d10dfba: FOUND
- 670c3d4: FOUND
- c34b923: FOUND
