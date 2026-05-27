---
phase: 50-cart-wishlist-drawers
plan: "03"
subsystem: cart-drawer
tags:
  - tdd
  - green-phase
  - wave-3
  - cart
  - drawers
dependency_graph:
  requires:
    - 50-02
  provides:
    - src/components/cart/cart-drawer.tsx
    - src/components/cart/cart-drawer-content.tsx
  affects:
    - src/components/layout/storefront-fabs.tsx (plan 05)
tech_stack:
  added: []
  patterns:
    - "Controlled Sheet with useDrawers() hook (cartOpen/closeCart)"
    - "Auth vs guest cart loading branch inside drawer content"
    - "CART_CHANGED_EVENT listener for guest cart sync while drawer open"
key_files:
  created:
    - src/components/cart/cart-drawer.tsx
    - src/components/cart/cart-drawer-content.tsx
  modified: []
decisions:
  - "CartDrawer hasSession prop is optional (default false) — tests call render(<CartDrawer />) without props"
  - "CartSummary receives both subtotalKopiyky and itemCount — component requires both props"
  - "Guest CART_CHANGED_EVENT listener is attached inside useEffect gated on cartOpen; cleanup removes listener"
  - "loading state initializes to true to avoid flash of null before first load"
metrics:
  duration: "4m"
  completed_date: "2026-05-27T14:13:10Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 0
---

# Phase 50 Plan 03: CartDrawer and CartDrawerContent Summary

**One-liner:** CartDrawer Sheet shell controlled by DrawerProvider with CartDrawerContent handling auth/guest data loading via getCartAction and resolveGuestCartAction, all 4 CART-DRW tests GREEN.

## What Was Built

This plan implements the full cart drawer UI in two components:

1. **`src/components/cart/cart-drawer.tsx`** — "use client" Sheet wrapper. Reads `cartOpen` and `closeCart` from `useDrawers()`. Renders `Sheet open={cartOpen} onOpenChange={(open) => { if (!open) closeCart(); }}` with `SheetContent side="right" showCloseButton={false}`. SheetHeader contains SheetTitle "Кошик" and SheetClose with aria-label. Body div hosts CartDrawerContent.

2. **`src/components/cart/cart-drawer-content.tsx`** — "use client" data loading component. Auth branch: `getCartAction()` on drawer open. Guest branch: `resolveGuestCartAction(productIds)` + `CART_CHANGED_EVENT` listener while open. Renders loading state, error Alert, CartEmpty (empty cart), or CartLineItem/GuestCartLineItem list + CartSummary.

### Files Created

| File | Exports | Key Behavior |
|------|---------|--------------|
| `src/components/cart/cart-drawer.tsx` | `CartDrawer` | Sheet shell; closeCart on onOpenChange(false) |
| `src/components/cart/cart-drawer-content.tsx` | `CartDrawerContent` | Auth+guest load; CART_CHANGED_EVENT listener |

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | 42a3775 | CartDrawer shell component |
| Task 2 | 4306249 | CartDrawerContent auth and guest data loading |

## Verification

- `npx vitest run src/components/cart/cart-drawer.test.tsx` — 4/4 tests GREEN (CART-DRW-01..04)
- `npx tsc --noEmit` — zero errors in cart-drawer.tsx or cart-drawer-content.tsx
- `grep "getCartAction"` in cart-drawer-content.tsx — matched (auth branch)
- `grep "CART_CHANGED_EVENT"` in cart-drawer-content.tsx — matched (guest listener)

## Deviations from Plan

**1. [Rule 2 - Missing prop] CartDrawer hasSession made optional**
- **Found during:** Task 1 (reading test file)
- **Issue:** Test calls `render(<CartDrawer />)` without hasSession prop; plan specifies `hasSession: boolean` as required
- **Fix:** Changed prop type to `hasSession?: boolean` with default `false` — TypeScript-safe and tests pass
- **Files modified:** src/components/cart/cart-drawer.tsx

**2. [Rule 1 - Bug] CartSummary requires itemCount prop**
- **Found during:** Task 2 (reading CartSummary interface)
- **Issue:** Plan specified `CartSummary subtotalKopiyky={cart.subtotalKopiyky}` but the component requires both `subtotalKopiyky` and `itemCount`
- **Fix:** Added `itemCount={cart.items.length}` to CartSummary calls in both auth and guest branches

## Known Stubs

None — all data loading is wired to real server actions (getCartAction, resolveGuestCartAction).

## Threat Flags

No new security surface beyond what the plan's threat model covers:
- T-50-03-01 (Elevation of Privilege, getCartAction): mitigated — requireBuyer() in getCartAction enforced (added in plan 02)
- T-50-03-03 (Input Validation, resolveGuestCartAction productIds): mitigated — Zod validation in action unchanged
- T-50-03-02, T-50-03-04, T-50-03-SC: accepted per plan

## Self-Check: PASSED

Files verified present:
- src/components/cart/cart-drawer.tsx: FOUND
- src/components/cart/cart-drawer-content.tsx: FOUND

Commits verified:
- 42a3775: FOUND
- 4306249: FOUND
