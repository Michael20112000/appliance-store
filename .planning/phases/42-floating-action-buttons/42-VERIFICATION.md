---
phase: 42-floating-action-buttons
verified: 2026-05-23T13:38:00Z
status: human_needed
score: 14/14 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Both FABs visible on storefront pages"
    expected: "Two circular buttons visible at bottom-left on all storefront pages (e.g. http://localhost:3000). Lower button has shopping cart icon; upper button has phone icon."
    why_human: "Visual rendering and layout position cannot be verified by grep or test runner"
  - test: "Cart FAB visible when cart is empty"
    expected: "After emptying the cart, returning to homepage still shows the cart FAB at bottom-left"
    why_human: "Requires browser interaction to confirm no visual disappearance at count=0"
  - test: "Callback FAB opens dialog with store phone and form"
    expected: "Clicking the phone icon FAB opens a dialog titled 'Зв'яжіться з нами' containing the store phone number and a callback form"
    why_human: "Requires browser interaction to test dialog open/close and real database phone data rendering"
  - test: "FABs absent on admin pages"
    expected: "Navigating to http://localhost:3000/admin (any admin page) shows no floating buttons"
    why_human: "Visual confirmation of route group isolation in the browser"
  - test: "Dialog closes on X button and Esc key"
    expected: "Clicking the X button or pressing Escape closes the callback dialog"
    why_human: "Keyboard/mouse interaction behavior requires browser testing"
---

# Phase 42: Floating Action Buttons Verification Report

**Phase Goal:** Deliver two floating action buttons (FABs) on every storefront page: a persistent cart FAB and a callback FAB that opens a dialog with store phone numbers and a callback request form.
**Verified:** 2026-05-23T13:38:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Cart FAB renders on screen even when cart count is 0 | VERIFIED | No early-return guard in storefront-fabs.tsx; FAB-01-a test passes (9/9 tests green) |
| 2 | Cart FAB always links to /koszyk | VERIFIED | `href="/koszyk"` at line 68 of storefront-fabs.tsx; FAB-01-b test passes |
| 3 | Cart FAB shows a badge only when count > 0 | VERIFIED | `{cartCount > 0 && <Badge>}` at line 76; FAB-01-c test: `queryByText("0")` returns null |
| 4 | Cart FAB badge shows '9+' when count exceeds 9 | VERIFIED | `cartCount > 9 ? "9+" : String(cartCount)` at line 47; FAB-01-e test passes |
| 5 | Callback FAB opens a Dialog on click | VERIFIED | `onClick={() => setCallbackOpen(true)}` at line 57; `Dialog open={callbackOpen}` at line 87; FAB-02-b test passes |
| 6 | Dialog shows the store phone number when phones are provided | VERIFIED | `phones.map(phone => <a href={uaPhoneTelHref(...)}>{formatUaPhoneDisplay(...)}</a>)` at lines 95-106; FAB-02-c test passes |
| 7 | Dialog contains the callback request form with idPrefix='fab' | VERIFIED | `<CallbackRequestForm idPrefix="fab" compact />` at line 108; FAB-02-d test passes |
| 8 | Guest cart count syncs from localStorage via CART_CHANGED_EVENT | VERIFIED | useEffect at lines 38-45: `if (hasSession) return;` guards guest-only sync, attaches/removes CART_CHANGED_EVENT listener |
| 9 | Session user receives initialCartCount as prop — no localStorage sync | VERIFIED | `if (hasSession) return;` at line 39 — session users skip the localStorage sync effect entirely |
| 10 | StorefrontFabs appears on every storefront page | VERIFIED | Rendered at fragment root in `src/app/(storefront)/layout.tsx` line 42 — covers all storefront routes |
| 11 | StorefrontFabs does NOT appear on admin pages | VERIFIED | No reference to StorefrontFabs in any admin layout file (grep confirmed 0 results in src/app/(admin)) |
| 12 | Store phone numbers are fetched server-side and passed as props | VERIFIED | `const contacts = await getPublicStoreContacts()` at line 22; `phones={contacts.phones}` at line 43 |
| 13 | Session cart count is fetched server-side and passed as initialCartCount | VERIFIED | `const cartCount = session?.user ? await getCartItemCount(session.user.id) : 0` at line 23; `initialCartCount={cartCount}` at line 44 |
| 14 | Guest users get initialCartCount=0 (no session cart query) | VERIFIED | Ternary guard `session?.user ? await getCartItemCount(...) : 0` at line 23 |

**Score:** 14/14 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/layout/storefront-fabs.tsx` | StorefrontFabs client component — both FABs in fixed bottom-left wrapper | VERIFIED | 113 lines, exports `StorefrontFabs`, "use client" directive, full implementation |
| `src/components/layout/storefront-fabs.test.tsx` | Unit tests covering FAB-01 and FAB-02 | VERIFIED | 127 lines, `@vitest-environment jsdom` at line 1, 9 tests all passing |
| `src/app/(storefront)/layout.tsx` | Storefront layout RSC with StorefrontFabs injected after Toaster | VERIFIED | `async function StorefrontLayout`, StorefrontFabs at line 42, after Toaster at line 41 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| storefront-fabs.tsx | /koszyk | Link href | WIRED | `href="/koszyk"` at line 68 |
| storefront-fabs.tsx | src/components/ui/dialog.tsx | Dialog open/onOpenChange controlled state | WIRED | `open={callbackOpen}` at line 87 |
| storefront-fabs.tsx | src/components/layout/callback-request-form.tsx | idPrefix='fab' prop | WIRED | `<CallbackRequestForm idPrefix="fab" compact />` at line 108 |
| src/app/(storefront)/layout.tsx | src/components/layout/storefront-fabs.tsx | JSX import and render with phones, initialCartCount, hasSession props | WIRED | `<StorefrontFabs phones={contacts.phones} initialCartCount={cartCount} hasSession={Boolean(session?.user)} />` at lines 42-46 |
| src/app/(storefront)/layout.tsx | src/server/services/store-settings.service.ts | getPublicStoreContacts() called in async layout RSC | WIRED | `const contacts = await getPublicStoreContacts()` at line 22 |
| src/app/(storefront)/layout.tsx | src/server/services/cart.service.ts | getCartItemCount(session.user.id) called conditionally when session exists | WIRED | `session?.user ? await getCartItemCount(session.user.id) : 0` at line 23 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| storefront-fabs.tsx | phones | getPublicStoreContacts() in layout.tsx RSC | Yes — async server call to store-settings.service | FLOWING |
| storefront-fabs.tsx | initialCartCount | getCartItemCount(session.user.id) in layout.tsx RSC | Yes — conditional DB query via cart.service | FLOWING |
| storefront-fabs.tsx | cartCount (guest) | getPendingItemCount() from localStorage | Yes — reads localStorage pending items | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 9 unit tests pass | `npm test -- src/components/layout/storefront-fabs.test.tsx` | 9 passed (1 file) | PASS |
| No TS errors in phase 42 files | `npx tsc --noEmit \| grep storefront-fabs\|storefront/layout` | 0 lines (no errors) | PASS |

### Probe Execution

No probe scripts declared or applicable for this phase.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| FAB-01 | 42-01, 42-02 | User always sees a cart button in the bottom-left floating zone (visible even when cart is empty) | SATISFIED | Cart FAB always rendered (no early return at count=0); layout.tsx wires it to every storefront page |
| FAB-02 | 42-01, 42-02 | User can open a callback dialog from a floating button — sees store phone and callback form | SATISFIED | Callback FAB opens controlled Dialog with phones list and CallbackRequestForm idPrefix="fab" |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | None found | — | — |

No TBD, FIXME, XXX, TODO, HACK, PLACEHOLDER, empty return stubs, or hardcoded empty data found in the two files modified by this phase.

### Human Verification Required

#### 1. Both FABs Visible on Storefront

**Test:** Start dev server (`npm run dev`), visit http://localhost:3000
**Expected:** Two circular buttons visible in bottom-left corner — lower button has cart icon, upper button has phone icon
**Why human:** Visual rendering and layout position cannot be verified by grep or test runner

#### 2. Cart FAB Visible When Cart Is Empty

**Test:** Empty the cart, return to homepage
**Expected:** Cart FAB still visible at bottom-left even with zero items in cart
**Why human:** Requires browser interaction to confirm no visual disappearance at count=0

#### 3. Callback FAB Opens Dialog with Store Phone and Form

**Test:** Click the phone icon FAB
**Expected:** Dialog opens titled "Зв'яжіться з нами", shows store phone number(s), contains form "Вкажіть свій номер — ми передзвонимо"
**Why human:** Requires browser interaction and real database data to confirm phone display

#### 4. FABs Absent on Admin Pages

**Test:** Navigate to http://localhost:3000/admin (any admin page)
**Expected:** No floating buttons visible anywhere on admin pages
**Why human:** Visual confirmation of route group isolation in the browser — code analysis confirms no wiring, but visual check ensures no bleed-through

#### 5. Dialog Closes on X Button and Esc Key

**Test:** Open callback dialog, then (a) click X button, (b) press Escape key
**Expected:** Dialog closes in both cases
**Why human:** Keyboard and close-button interactions require browser testing

### Gaps Summary

No blocking gaps found. All 14 must-have truths are verified in the codebase. All 9 unit tests pass. TypeScript compiles clean for phase files. All key links are wired.

The only items pending are visual/behavioral checks in a running browser that cannot be verified programmatically.

---

_Verified: 2026-05-23T13:38:00Z_
_Verifier: Claude (gsd-verifier)_
