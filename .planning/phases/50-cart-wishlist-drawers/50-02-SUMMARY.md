---
phase: 50-cart-wishlist-drawers
plan: "02"
subsystem: drawers
tags:
  - tdd
  - green-phase
  - wave-2
  - cart
  - wishlist
  - drawers
  - context
  - server-actions
dependency_graph:
  requires:
    - 50-01
  provides:
    - src/lib/drawers/drawer-context.tsx
    - getCartAction in src/server/actions/cart.actions.ts
    - getWishlistAction in src/server/actions/wishlist.actions.ts
  affects:
    - src/components/cart/cart-drawer-content.tsx (plans 03)
    - src/components/wishlist/wishlist-drawer-content.tsx (plan 04)
    - src/components/layout/storefront-fabs.tsx (plan 05)
tech_stack:
  added: []
  patterns:
    - "React context with createContext + null-guard hook (mirrors ChatProvider pattern)"
    - "useMemo value object for stable context reference"
    - "Server action read pattern: requireBuyer() + service call, no revalidatePath"
key_files:
  created:
    - src/lib/drawers/drawer-context.tsx
  modified:
    - src/server/actions/cart.actions.ts
    - src/server/actions/wishlist.actions.ts
decisions:
  - "Plain useState (not useQueryStates/nuqs) — no URL-reflected drawer state per research decision"
  - "Inline arrow functions in useMemo value (no useCallback) — sufficient for this context shape"
  - "DrawerProvider renders children only — CartDrawer/WishlistDrawer wiring deferred to plan 05"
  - "getCartAction and getWishlistAction are read-only: no revalidatePath, no Zod input validation"
metrics:
  duration: "3m"
  completed_date: "2026-05-27T11:09:22Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 2
---

# Phase 50 Plan 02: DrawerProvider Context and Server Actions Summary

**One-liner:** DrawerProvider React context with useState-based open/close state and two thin server action reads (getCartAction, getWishlistAction) guarded by requireBuyer().

## What Was Built

This plan implements the foundational layer for the cart/wishlist drawer phase. Two additions:

1. **`src/lib/drawers/drawer-context.tsx`** — New React context file providing `DrawerProvider` component and `useDrawers()` hook. State: `cartOpen` and `wishlistOpen` booleans, independently controlled via `openCart`, `closeCart`, `openWishlist`, `closeWishlist`. Pattern mirrors `ChatProvider` exactly (createContext null-guard, useMemo value).

2. **Server action additions** — `getCartAction(): Promise<CartViewDto>` in `cart.actions.ts` and `getWishlistAction(): Promise<WishlistViewDto>` in `wishlist.actions.ts`. Both delegate to existing service functions after `requireBuyer()` authentication.

### Files Changed

| File | Change | Key Exports Added |
|------|--------|-------------------|
| `src/lib/drawers/drawer-context.tsx` | Created | `DrawerProvider`, `useDrawers` |
| `src/server/actions/cart.actions.ts` | Modified | `getCartAction` |
| `src/server/actions/wishlist.actions.ts` | Modified | `getWishlistAction` |

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | ed0cd7a | DrawerProvider context and useDrawers hook |
| Task 2 | 629d77c | getCartAction and getWishlistAction server actions |

## Verification

- `npx vitest run src/lib/drawers/drawer-context.test.tsx` — 6/6 tests GREEN (DRWR-CTX-01..06)
- `npx tsc --noEmit` — zero errors in cart.actions.ts and wishlist.actions.ts
- `grep "getCartAction"` in cart.actions.ts — matched
- `grep "getWishlistAction"` in wishlist.actions.ts — matched

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — no placeholder data or hardcoded empty values in production code.

## Threat Flags

No new security surface beyond what the plan's threat model covers:
- T-50-02-01 (Elevation of Privilege, getCartAction): mitigated — `requireBuyer()` enforced
- T-50-02-02 (Elevation of Privilege, getWishlistAction): mitigated — `requireBuyer()` enforced
- T-50-02-03, T-50-02-04: accepted per plan

## Self-Check: PASSED

Files verified present:
- src/lib/drawers/drawer-context.tsx: FOUND
- src/server/actions/cart.actions.ts: FOUND (modified)
- src/server/actions/wishlist.actions.ts: FOUND (modified)

Commits verified:
- ed0cd7a: FOUND
- 629d77c: FOUND
