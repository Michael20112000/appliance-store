---
phase: 50-cart-wishlist-drawers
verified: 2026-05-27T15:25:00Z
human_verified: 2026-05-27T15:50:00Z
status: verified
score: 13/13 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Open cart drawer from FAB and header icon — verify full-height right Sheet appears with current cart items and totals"
    expected: "Sheet slides in from the right, fills viewport height, displays cart line items with remove buttons and a subtotal; does NOT navigate to /koszyk"
    result: passed
  - test: "Open wishlist drawer from the heart icon — verify right Sheet appears with saved wishlist items"
    expected: "Sheet slides in from the right, shows saved product cards with ClearWishlistButton and WishlistGrid; does NOT navigate to /obrane"
    result: passed
  - test: "Close both drawers by clicking the backdrop (outside the Sheet)"
    expected: "Backdrop click triggers Sheet onOpenChange(false) which calls closeCart/closeWishlist and the Sheet disappears"
    result: passed
---

# Phase 50: Cart & Wishlist Drawers Verification Report

**Phase Goal:** Replace /koszyk and /obrane page navigation with in-page right-side drawer panels for cart and wishlist, controlled by a shared DrawerProvider context.
**Verified:** 2026-05-27T15:25:00Z
**Status:** verified (13/13 — human UAT passed 2026-05-27)
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

All truths are derived from ROADMAP.md Success Criteria plus PLAN frontmatter must_haves.

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Clicking the cart FAB or cart icon opens a drawer — browser does NOT navigate to /koszyk | VERIFIED | No `href="/koszyk"` found in storefront-fabs.tsx, cart-nav-link.tsx, guest-cart-nav-link.tsx, pdp-cart-fab.tsx. All replaced with `<button onClick={openCart}>`. openCart is wired to DrawerProvider setState. |
| 2 | Clicking the wishlist icon opens a drawer — browser does NOT navigate to /obrane | VERIFIED | No `href="/obrane"` in wishlist-nav-link.tsx. Replaced with `<button onClick={openWishlist}>`. |
| 3 | Cart drawer shows current cart contents and totals; user can remove items | VERIFIED (code) + HUMAN NEEDED (visual) | CartDrawerContent calls getCartAction() / resolveGuestCartAction(), renders CartLineItem with removeFromCartAction, CartSummary with subtotalKopiyky + itemCount. Data-flow is wired to real DB-backed service. Visual confirmation needs human. |
| 4 | Wishlist drawer shows saved items; user can remove items | VERIFIED (code) + HUMAN NEEDED (visual) | WishlistDrawerContent calls getWishlistAction() / resolveGuestWishlistProductsAction(), renders WishlistGrid + ClearWishlistButton. Data-flow verified to real service. Visual needs human. |
| 5 | Both drawers close when clicking the backdrop or explicit close button | VERIFIED (code) + HUMAN NEEDED (DOM) | onOpenChange triggers closeCart/closeWishlist. SheetClose buttons present with aria-labels. Backdrop handling is Sheet/Base UI Dialog internal — needs human verification. |
| 6 | DrawerProvider context exposes cartOpen, wishlistOpen, openCart, closeCart, openWishlist, closeWishlist | VERIFIED | drawer-context.tsx exports DrawerProvider + useDrawers. 6/6 context tests pass. |
| 7 | useDrawers() throws outside DrawerProvider | VERIFIED | Null-guard in useDrawers() throws "useDrawers must be used within DrawerProvider". Test DRWR-CTX-06 passes. |
| 8 | CartDrawer renders Sheet with side="right" controlled by DrawerProvider.cartOpen | VERIFIED | cart-drawer.tsx: `<Sheet open={cartOpen} ...><SheetContent side="right"`. 4/4 CART-DRW tests pass. |
| 9 | WishlistDrawer renders Sheet with side="right" controlled by DrawerProvider.wishlistOpen | VERIFIED | wishlist-drawer.tsx: `<Sheet open={wishlistOpen} ...><SheetContent side="right"`. 3/3 WLIST-DRW tests pass. |
| 10 | getCartAction() and getWishlistAction() are guarded by requireBuyer() | VERIFIED | Both server actions call `requireBuyer()` before service delegation. cart.actions.ts line 71-72; wishlist.actions.ts line 79-80. |
| 11 | DrawerProvider wraps ChatContext.Provider in the component tree | VERIFIED | chat-provider.tsx return: `<DrawerProvider>` is outermost JSX, wrapping ChatContext.Provider + CartDrawer + WishlistDrawer as siblings. Commits bcc5fe1. |
| 12 | StorefrontFabs + CartNavButton + CartNavLink + GuestCartNavLink + WishlistNavLink + PdpCartFab: all five entry points call openCart or openWishlist | VERIFIED | 6 files checked. All use useDrawers() and button elements. No href=/koszyk or /obrane remains. 23/23 tests pass across storefront-fabs, cart-nav-button, wishlist-nav-link test suites. |
| 13 | Full test suite for phase: 23 combined tests GREEN | VERIFIED | `npx vitest run src/components/layout/storefront-fabs.test.tsx src/components/cart/cart-nav-button.test.tsx src/components/wishlist/wishlist-nav-link.test.tsx` → 23/23 passed. |

**Score:** 11/13 truths fully code-verified (2 truths have code verified but need human for visual/DOM behaviour)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/drawers/drawer-context.tsx` | DrawerProvider + useDrawers hook | VERIFIED | Exports both; 6/6 context tests pass; mirrors ChatProvider pattern exactly |
| `src/components/cart/cart-drawer.tsx` | Sheet shell for cart | VERIFIED | "use client", useDrawers, Sheet side="right", SheetTitle "Кошик", onOpenChange closeCart |
| `src/components/cart/cart-drawer-content.tsx` | Auth+guest data loading | VERIFIED | getCartAction (auth), resolveGuestCartAction (guest), CART_CHANGED_EVENT listener, renders CartLineItem/GuestCartLineItem/CartSummary |
| `src/components/cart/cart-nav-button.tsx` | New client cart button | VERIFIED | "use client", useDrawers().openCart, renders button not anchor, Badge for count |
| `src/components/wishlist/wishlist-drawer.tsx` | Sheet shell for wishlist | VERIFIED | "use client", useDrawers, Sheet side="right", SheetTitle "Обране", onOpenChange closeWishlist |
| `src/components/wishlist/wishlist-drawer-content.tsx` | Auth+guest data loading for wishlist | VERIFIED | getWishlistAction (auth), resolveGuestWishlistProductsAction (guest), cancelled flag, WISHLIST_CHANGED_EVENT + storage listeners |
| `src/server/actions/cart.actions.ts` | getCartAction added | VERIFIED | `export async function getCartAction(): Promise<CartViewDto>` at line 70, requireBuyer() + getCartForUser |
| `src/server/actions/wishlist.actions.ts` | getWishlistAction added | VERIFIED | `export async function getWishlistAction(): Promise<WishlistViewDto>` at line 78, requireBuyer() + listWishlistForUser |
| `src/components/chat/chat-provider.tsx` | DrawerProvider wiring | VERIFIED | DrawerProvider imported from drawer-context; wraps ChatContext.Provider; CartDrawer + WishlistDrawer rendered as siblings to ChatPanel |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `cart-drawer.tsx` | `drawer-context` | useDrawers().cartOpen + closeCart | WIRED | import + destructuring confirmed; cartOpen controls Sheet open prop |
| `wishlist-drawer.tsx` | `drawer-context` | useDrawers().wishlistOpen + closeWishlist | WIRED | import + destructuring confirmed |
| `cart-drawer-content.tsx` | `cart.actions` | getCartAction() on drawer open | WIRED | import line 14; called at line 35 inside useEffect gated on cartOpen |
| `wishlist-drawer-content.tsx` | `wishlist.actions` | getWishlistAction() on drawer open | WIRED | import line 7; called at line 43 inside useEffect gated on wishlistOpen |
| `chat-provider.tsx` | `drawer-context` | DrawerProvider wrapping ChatContext.Provider | WIRED | line 27 import; line 543 JSX wrapping |
| `storefront-fabs.tsx` | `drawer-context` | useDrawers().openCart | WIRED | line 19 import; line 35 destructuring; line 72 onClick |
| `cart-nav-link.tsx` | `cart-nav-button.tsx` | renders CartNavButton with initialCount | WIRED | line 2 import; line 11 JSX render |
| `guest-cart-nav-link.tsx` | `drawer-context` | useDrawers().openCart | WIRED | import + button onClick confirmed |
| `wishlist-nav-link.tsx` | `drawer-context` | useDrawers().openWishlist | WIRED | import + button onClick confirmed; usePathname removed |
| `pdp-cart-fab.tsx` | `drawer-context` | useDrawers().openCart | WIRED | import + button onClick + aria-label="Відкрити кошик" confirmed |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `cart-drawer-content.tsx` | `cart: CartViewDto \| null` | `getCartAction()` → `getCartForUser(session.user.id)` (DB-backed) | Yes — real DB query via cart.service | FLOWING |
| `cart-drawer-content.tsx` | `cart` (guest branch) | `resolveGuestCartAction(productIds)` | Yes — resolves real products from DB by productId | FLOWING |
| `wishlist-drawer-content.tsx` | `lines: WishlistLineDto[]` | `getWishlistAction()` → `listWishlistForUser(session.user.id)` (DB-backed) | Yes — real DB query via wishlist.service | FLOWING |
| `wishlist-drawer-content.tsx` | `lines` (guest branch) | `resolveGuestWishlistProductsAction(productIds)` | Yes — resolves real products | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| drawer-context exports compile | `npx tsc --noEmit` (phase 50 files) | Zero errors in phase 50 files | PASS |
| DrawerProvider context: 6 unit tests | `npx vitest run src/lib/drawers/drawer-context.test.tsx` | 6/6 passed | PASS |
| CartDrawer: 4 unit tests | `npx vitest run src/components/cart/cart-drawer.test.tsx` | 4/4 passed | PASS |
| WishlistDrawer: 3 unit tests | `npx vitest run src/components/wishlist/wishlist-drawer.test.tsx` | 3/3 passed | PASS |
| Plan 05 integration: 23 tests | `npx vitest run storefront-fabs cart-nav-button wishlist-nav-link test files` | 23/23 passed | PASS |
| No /koszyk links remain | `grep href="/koszyk" in 4 converted files` | No output (no matches) | PASS |
| No /obrane links remain | `grep href="/obrane" in wishlist-nav-link.tsx` | No output (no matches) | PASS |

### Probe Execution

No probe scripts declared in PLANs for this phase. Step 7c: SKIPPED (no probe-*.sh files).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DRWR-01 | 50-01, 50-02, 50-03, 50-05 | Cart opens as full-height drawer from the right (FAB/cart icon no longer navigates to /koszyk) | SATISFIED | No href=/koszyk in any entry point; CartDrawer Sheet side="right" verified; openCart wired in all 4 entry points; CartDrawerContent loads real data |
| DRWR-02 | 50-01, 50-02, 50-04, 50-05 | Wishlist opens as full-height drawer from the right (heart icon no longer navigates to /obrane) | SATISFIED | No href=/obrane in wishlist-nav-link.tsx; WishlistDrawer Sheet side="right" verified; openWishlist wired; WishlistDrawerContent loads real data |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `cart-drawer-content.tsx` | 82 | `return null` | Info | Legitimate loading guard — `cart === null` only while initial load not yet started; loading state renders first; not a stub |

No TBD, FIXME, or XXX markers found in any phase 50 production files. No hardcoded empty returns that flow to rendering. No placeholder components detected.

### Human Verification Required

#### 1. Cart drawer opens with real data

**Test:** Log in as a buyer with items in cart. Click the cart FAB (bottom right) or the cart icon in the header. Observe the right side of the screen.
**Expected:** A full-height Sheet slides in from the right showing cart line items (title, price, remove button), a subtotal, and an item count. The URL does not change. No navigation occurs.
**Why human:** Unit tests mock the Sheet component and server actions; real rendering and data presence require a running browser.

#### 2. Wishlist drawer opens with real data

**Test:** Log in as a buyer (or as guest with wishlist items in localStorage). Click the heart icon in the header.
**Expected:** A full-height Sheet slides in from the right showing wishlist product cards and a "Clear wishlist" button. The URL does not change. No navigation to /obrane.
**Why human:** Same as above — Sheet and server action mocked in unit tests.

#### 3. Backdrop close behaviour

**Test:** Open either drawer. Click outside the Sheet (on the greyed backdrop area).
**Expected:** The drawer closes (Sheet onOpenChange receives false → closeCart/closeWishlist is called). No navigation. Drawer re-opens on next icon click.
**Why human:** Base UI Dialog backdrop handling is an internals behaviour not covered by unit tests (Sheet is mocked in tests).

---

## Gaps Summary

No blocking gaps found. All code artifacts exist, are substantive, are wired, and data flows through real server actions to real DB-backed services. All 12 documented commits exist in git history. TypeScript compiles cleanly for all phase 50 files (pre-existing TS errors in unrelated test files are not introduced by this phase).

The three human verification items cover visual rendering and Sheet backdrop DOM behaviour — standard end-of-phase human checks for UI phases.

---

_Verified: 2026-05-27T15:25:00Z_
_Verifier: Claude (gsd-verifier)_
