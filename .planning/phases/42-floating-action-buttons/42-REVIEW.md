---
phase: 42-floating-action-buttons
reviewed: 2026-05-23T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/components/layout/storefront-fabs.tsx
  - src/components/layout/storefront-fabs.test.tsx
  - src/app/(storefront)/layout.tsx
findings:
  critical: 1
  warning: 3
  info: 1
  total: 5
status: issues_found
---

# Phase 42: Code Review Report

**Reviewed:** 2026-05-23T00:00:00Z
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Three files were reviewed: the `StorefrontFabs` client component, its Vitest test suite, and the `StorefrontLayout` server component that wires the FABs into the page. The implementation is broadly sound, but a critical event-name mismatch silently breaks guest cart sync, a z-index misconfiguration causes FAB buttons to render on top of the dialog backdrop, two test mock values are wrong, and one minor comment labelling error exists.

## Critical Issues

### CR-01: Event name in test mock doesn't match production value — guest cart sync is untestable (and currently broken by the wrong constant)

**File:** `src/components/layout/storefront-fabs.test.tsx:25`

**Issue:** The test file manually mocks `@/lib/cart/cart-events` with the string value `"cart-changed"`, but the real module exports `CART_CHANGED_EVENT = "cart:changed"` (colon, not hyphen). Because `storefront-fabs.tsx` imports the constant from the real module at runtime, the production component listens on `"cart:changed"`. The test mock diverges, so any test that dispatches `"cart-changed"` would never trigger the listener — the cart sync behaviour is never actually exercised by the test suite. The `useEffect` that calls `getPendingItemCount` on the event is never triggered in tests, meaning the sync path has zero coverage despite tests appearing to pass.

**Fix:** Change the mock value in the test file to match the real constant:
```ts
vi.mock("@/lib/cart/cart-events", () => ({
  CART_CHANGED_EVENT: "cart:changed",   // was "cart-changed"
}));
```
Alternatively, import the constant from the source module so the mock stays in sync automatically:
```ts
import { CART_CHANGED_EVENT } from "@/lib/cart/cart-events";
vi.mock("@/lib/cart/cart-events", () => ({ CART_CHANGED_EVENT }));
```

## Warnings

### WR-01: FAB container z-index (59) is below the Dialog backdrop z-index (50) — FABs will render on top of their own dialog backdrop

**File:** `src/components/layout/storefront-fabs.tsx:51`

**Issue:** The wrapper `div` is positioned at `z-[59]`. The `DialogContent` overlay (in `src/components/ui/dialog.tsx`) renders at `z-50`. Because the FAB container is `z-[59]` and the Dialog is a portal that renders in a separate DOM subtree (typically at the document body), the FAB buttons can visually bleed through the dialog backdrop and remain interactive while the modal is open. The correct pattern is to use a z-index below the dialog stack (e.g., `z-40`) or ensure the dialog portal's overlay (`z-50`) stacks correctly above the FABs.

**Fix:** Lower the container z-index to stay under the dialog backdrop:
```tsx
className="fixed bottom-6 left-6 z-40 flex flex-col items-center gap-3 pb-[max(0px,env(safe-area-inset-bottom))]"
```

### WR-02: `aria-label` on Cart FAB uses plural "товарів" for all non-zero counts, including 1

**File:** `src/components/layout/storefront-fabs.tsx:69`

**Issue:** The `aria-label` is `"Кошик, ${cartCount} товарів"` for any `cartCount > 0`. In Ukrainian, the grammatical form of the noun depends on the count: `1 товар`, `2–4 товари`, `5+ товарів`. A screen reader will announce "Кошик, 1 товарів" which is incorrect grammar and may confuse assistive-technology users.

**Fix:** Apply Ukrainian grammatical plural rules:
```ts
function cartAriaLabel(count: number): string {
  if (count === 0) return "Кошик";
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `Кошик, ${count} товар`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
    return `Кошик, ${count} товари`;
  return `Кошик, ${count} товарів`;
}
```

### WR-03: `useEffect` for guest cart sync calls `getPendingItemCount()` synchronously on mount even when `hasSession` later turns true — stale count can persist until next event

**File:** `src/components/layout/storefront-fabs.tsx:38-45`

**Issue:** When `hasSession` is `false`, the effect runs `sync()` immediately on mount, which overwrites `initialCartCount` with the localStorage count. This is intentional. However, if `hasSession` changes from `false` to `true` during the component's lifetime (e.g., after a sign-in without a full navigation), the effect's cleanup removes the listener but the `cartCount` state retains whatever value `getPendingItemCount()` last set, not the server-side count. The server-session count won't be reflected until `initialCartCount` prop changes, which may not happen immediately. While this is a transient edge case, the two effects (lines 34–36 and 38–45) can race: when `hasSession` becomes `true`, effect 1 resets `cartCount` to `initialCartCount`, but if effect 2 fires its `sync()` after that (React batches effects in order, so typically it won't), the localStorage count could win.

This is a low-risk edge case in practice because Next.js full-page navigation occurs after login. However, the dual-effect design is worth noting.

**Fix:** Consolidate the two effects or add an explicit guard in effect 2:
```ts
useEffect(() => {
  if (hasSession) {
    setCartCount(initialCartCount);
    return;
  }
  const sync = () => setCartCount(getPendingItemCount());
  sync();
  window.addEventListener(CART_CHANGED_EVENT, sync);
  return () => window.removeEventListener(CART_CHANGED_EVENT, sync);
}, [hasSession, initialCartCount]);
```

## Info

### IN-01: Duplicate comment label "FAB-02" applied to two separate elements

**File:** `src/components/layout/storefront-fabs.tsx:53,86`

**Issue:** Line 53 has the comment `{/* FAB-02: Callback FAB */}` (the button) and line 86 has `{/* FAB-02: Callback Dialog */}`. The dialog is a subordinate of FAB-02, not a third FAB. The duplication is harmless but creates ambiguity if someone tries to reference FAB-02 in documentation or bug reports.

**Fix:** Rename the dialog comment to remove the duplicate ID:
```tsx
{/* Callback Dialog (belongs to FAB-02) */}
```

---

_Reviewed: 2026-05-23T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
