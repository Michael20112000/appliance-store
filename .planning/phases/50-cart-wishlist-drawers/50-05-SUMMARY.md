---
phase: 50-cart-wishlist-drawers
plan: "05"
subsystem: drawers-wiring
tags:
  - tdd
  - green-phase
  - wave-4
  - cart
  - wishlist
  - drawers
  - integration
dependency_graph:
  requires:
    - 50-03
    - 50-04
  provides:
    - DrawerProvider wiring in src/components/chat/chat-provider.tsx
    - src/components/cart/cart-nav-button.tsx
  affects:
    - All pages using CartNavLink, GuestCartNavLink, WishlistNavLink, PdpCartFab, StorefrontFabs
tech_stack:
  added: []
  patterns:
    - "DrawerProvider wraps ChatContext.Provider — makes DrawerContext available to all children and siblings"
    - "Link-to-button conversion: replace next/link with button type=button onClick=openCart/openWishlist"
    - "RSC wrapper pattern: CartNavLink fetches count, renders CartNavButton (client component)"
key_files:
  created:
    - src/components/cart/cart-nav-button.tsx
  modified:
    - src/components/chat/chat-provider.tsx
    - src/components/layout/storefront-fabs.tsx
    - src/components/cart/cart-nav-link.tsx
    - src/components/cart/guest-cart-nav-link.tsx
    - src/components/wishlist/wishlist-nav-link.tsx
    - src/components/cart/pdp-cart-fab.tsx
decisions:
  - "DrawerProvider wraps ChatContext.Provider (not vice versa) — ensures StorefrontFabs (inside ChatContext tree) and page children (containing PdpCartFab) can both useDrawers()"
  - "CartNavButton is a separate client component from CartNavLink RSC — clean RSC/client boundary"
  - "WishlistNavLink usePathname and aria-current removed entirely — no page-level state needed when drawer replaces navigation"
  - "PdpCartFab aria-label changed from Перейти до кошика to Відкрити кошик — reflects new action semantics"
metrics:
  duration: "8m"
  completed_date: "2026-05-27T15:09:47Z"
  tasks_completed: 3
  tasks_total: 3
  files_created: 1
  files_modified: 6
---

# Phase 50 Plan 05: Integration Wiring Summary

**One-liner:** DrawerProvider wired into ChatProvider wrapping CartDrawer+WishlistDrawer; all five Link-to-href navigation entries (StorefrontFabs cart FAB, CartNavLink, GuestCartNavLink, WishlistNavLink, PdpCartFab) converted to button elements calling openCart/openWishlist from useDrawers; all 23 tests GREEN.

## What Was Built

This plan delivers the final user-visible behavior of the cart/wishlist drawer phase — clicking cart or wishlist entry points opens the drawer instead of navigating to /koszyk or /obrane.

### Task 1: DrawerProvider wiring into ChatProvider

Modified `src/components/chat/chat-provider.tsx` to wrap the existing return with `DrawerProvider` as the outermost JSX element, and render `CartDrawer` and `WishlistDrawer` as siblings to `ChatPanel` inside `ChatContext.Provider`.

This placement ensures DrawerContext is available to:
- `StorefrontFabs` (rendered inside ChatContext.Provider tree)
- Page `{children}` (which includes PdpCartFab on PDP pages)
- Any future consumer of `useDrawers()`

### Task 2: StorefrontFabs + CartNavButton + CartNavLink

- **storefront-fabs.tsx**: Removed `import Link from "next/link"`, added `useDrawers` import and destructuring, replaced cart `<Link href="/koszyk">` with `<button type="button" onClick={openCart}>` (identical className, aria-label, badge child).
- **cart-nav-button.tsx** (NEW): "use client" component with `CartNavButtonProps = { initialCount: number }`, renders button with `useDrawers().openCart`, ShoppingCart icon, optional Badge.
- **cart-nav-link.tsx**: Converted RSC wrapper — removes Link rendering, fetches count via `getCartItemCount(userId)`, returns `<CartNavButton initialCount={count} />`.

### Task 3: GuestCartNavLink, WishlistNavLink, PdpCartFab

- **guest-cart-nav-link.tsx**: Added `useDrawers`, replaced `<Link href="/koszyk">` with `<button type="button" onClick={openCart}>`. Kept all `useEffect`, `CART_CHANGED_EVENT`, badge logic unchanged.
- **wishlist-nav-link.tsx**: Added `useDrawers`, replaced `<Link href="/obrane" aria-current={...}>` with `<button type="button" onClick={openWishlist}>`. Removed `usePathname` import and usage (no longer needed — no aria-current on button). Kept all event listeners and badge logic.
- **pdp-cart-fab.tsx**: Added `useDrawers`, replaced `<Link href="/koszyk" aria-label="Перейти до кошика">` with `<button type="button" aria-label="Відкрити кошик" onClick={openCart}>`. Kept `if (count < 1) return null` guard and all event listeners.

### Files Summary

| File | Change | Key Exports |
|------|--------|-------------|
| `src/components/chat/chat-provider.tsx` | Modified | `ChatProvider` (now with DrawerProvider) |
| `src/components/cart/cart-nav-button.tsx` | Created | `CartNavButton` |
| `src/components/cart/cart-nav-link.tsx` | Modified | `CartNavLink` (RSC wrapper) |
| `src/components/layout/storefront-fabs.tsx` | Modified | `StorefrontFabs` |
| `src/components/cart/guest-cart-nav-link.tsx` | Modified | `GuestCartNavLink` |
| `src/components/wishlist/wishlist-nav-link.tsx` | Modified | `WishlistNavLink` |
| `src/components/cart/pdp-cart-fab.tsx` | Modified | `PdpCartFab` |

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | bcc5fe1 | feat(50-05): wire DrawerProvider into ChatProvider with CartDrawer + WishlistDrawer |
| Task 2 | 53e01f8 | feat(50-05): convert StorefrontFabs cart FAB to button + create CartNavButton + update CartNavLink |
| Task 3 | ed215b0 | feat(50-05): convert GuestCartNavLink, WishlistNavLink, PdpCartFab to drawer-open buttons |

## Verification

- `npx vitest run src/components/layout/storefront-fabs.test.tsx` — 13/13 tests GREEN (FAB-01-a and FAB-01-b now GREEN)
- `npx vitest run src/components/cart/cart-nav-button.test.tsx` — 6/6 tests GREEN (CART-NAV-01..06)
- `npx vitest run src/components/wishlist/wishlist-nav-link.test.tsx` — 4/4 tests GREEN (WLIST-NAV-01..04)
- All 3 test files combined: 23/23 tests GREEN
- `npx tsc --noEmit` — zero errors for all modified files
- `grep "DrawerProvider" src/components/chat/chat-provider.tsx` — matched
- No `href="/koszyk"` in storefront-fabs.tsx, cart-nav-link.tsx, guest-cart-nav-link.tsx, pdp-cart-fab.tsx
- No `href="/obrane"` in wishlist-nav-link.tsx
- No `usePathname` in wishlist-nav-link.tsx

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all button onClick handlers wire to real `useDrawers()` context functions from DrawerProvider.

## Threat Flags

No new security surface beyond the plan's threat model:
- T-50-05-03 (Spoofing, buttons without type="button"): mitigated — all converted buttons explicitly set `type="button"` preventing accidental form submission
- T-50-05-01, T-50-05-02, T-50-05-04, T-50-05-SC: accepted per plan

## Self-Check: PASSED

Files verified present:
- src/components/chat/chat-provider.tsx: FOUND (modified)
- src/components/cart/cart-nav-button.tsx: FOUND (created)
- src/components/cart/cart-nav-link.tsx: FOUND (modified)
- src/components/layout/storefront-fabs.tsx: FOUND (modified)
- src/components/cart/guest-cart-nav-link.tsx: FOUND (modified)
- src/components/wishlist/wishlist-nav-link.tsx: FOUND (modified)
- src/components/cart/pdp-cart-fab.tsx: FOUND (modified)

Commits verified:
- bcc5fe1: FOUND
- 53e01f8: FOUND
- ed215b0: FOUND
