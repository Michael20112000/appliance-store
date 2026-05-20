---
phase: 31-order-status-ux-bugfix
reviewed: 2026-05-20T12:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - src/lib/order/admin-status-errors.ts
  - src/lib/order/admin-status-errors.test.ts
  - src/lib/order/status-styles.ts
  - src/lib/order/status-styles.test.ts
  - src/components/admin/order-list-status-select.tsx
  - src/components/admin/order-status-select.tsx
  - src/components/admin/order-list-status-select.test.tsx
  - src/server/services/admin-order.service.test.ts
findings:
  critical: 0
  warning: 1
  info: 1
  total: 2
status: issues_found
---

# Phase 31: Code Review Report

**Reviewed:** 2026-05-20T12:00:00Z  
**Depth:** standard  
**Files Reviewed:** 8  
**Status:** issues_found

## Summary

Plan 31-01 fixes BUG-24 by centralizing admin order status error toasts (`showOrderStatusErrorToast`) and adding per-status `SelectTrigger` accents (`getOrderStatusAccentClass`). List and detail selects both call the shared helper on `!result.ok`; Vitest covers `INSUFFICIENT_STOCK` mapping on the list component and service-level `PENDING→CONFIRMED` reserve failure. Server confirm path still calls `reserveProductUnitsForOrder` before update — no stock bypass (D-05).

No critical or security defects found in scoped changes. One warning: async status updates inside `useTransition` can reject without user feedback. One info: detail select lacks the same component-level stock-toast test as the list.

## Warnings

### WR-01: Async `applyStatus` inside `useTransition` can reject silently

**File:** `src/components/admin/order-list-status-select.tsx:99`, `src/components/admin/order-list-status-select.tsx:140`, `src/components/admin/order-status-select.tsx:85`, `src/components/admin/order-status-select.tsx:136`  
**Issue:** `startTransition(() => applyStatus(...))` calls an `async` function but does not await or catch its returned `Promise`. `updateOrderStatusAction` normally returns `{ ok: false, error }`, but it can still throw (e.g. `requireAdmin()` redirect, Zod parse failure, unexpected server/network errors). Those rejections are not handled in the transition callback, so operators may see no error toast and a stuck `pending` state until refresh.  
**Fix:** Handle rejection at the call site or inside `applyStatus`:

```tsx
async function applyStatus(nextStatus: OrderStatus) {
  try {
    const result = await updateOrderStatusAction({
      orderId,
      status: nextStatus,
    });

    if (!result.ok) {
      showOrderStatusErrorToast(result.error);
      return;
    }

    toast.success("Статус оновлено");
    setSelectedStatus(null);
    setCancelOpen(false);
    router.refresh();
  } catch {
    showOrderStatusErrorToast("UNKNOWN");
  }
}
```

Alternatively: `startTransition(() => { void applyStatus(nextStatus).catch(() => showOrderStatusErrorToast("UNKNOWN")); });`

## Info

### IN-01: Detail select has no component test for `INSUFFICIENT_STOCK` toast

**File:** `src/components/admin/order-status-select.tsx` (no matching `order-status-select.test.tsx`)  
**Issue:** Plan 31-01 requires list/detail parity on error mapping. Code parity is correct (both use `showOrderStatusErrorToast`), but only `order-list-status-select.test.tsx` asserts the stock toast wiring. A future edit to the detail select could regress BUG-24 without failing CI.  
**Fix:** Add a focused Vitest/jsdom test mirroring the list case (mock `updateOrderStatusAction` → `{ ok: false, error: "INSUFFICIENT_STOCK" }`, assert `toast.error` title + description), or extract a shared test helper used by both components.

---

_Reviewed: 2026-05-20T12:00:00Z_  
_Reviewer: Claude (gsd-code-reviewer)_  
_Depth: standard_
