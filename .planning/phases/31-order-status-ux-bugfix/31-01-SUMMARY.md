---
phase: 31-order-status-ux-bugfix
plan: 01
subsystem: ui
tags: [admin, orders, sonner, vitest, stock]

requires: []
provides:
  - Shared admin order status error toasts with INSUFFICIENT_STOCK hint
  - Per-status SelectTrigger accent classes on list and detail
  - Vitest regression for list error mapping and PENDING→CONFIRMED reserve failure
affects: [admin-orders]

tech-stack:
  added: []
  patterns:
    - "showOrderStatusErrorToast centralizes UA error copy for admin status selects"
    - "getOrderStatusAccentClass applies trigger-only status accents"

key-files:
  created:
    - src/lib/order/admin-status-errors.ts
    - src/lib/order/admin-status-errors.test.ts
    - src/lib/order/status-styles.ts
    - src/lib/order/status-styles.test.ts
  modified:
    - src/components/admin/order-list-status-select.tsx
    - src/components/admin/order-status-select.tsx
    - src/components/admin/order-list-status-select.test.tsx
    - src/server/services/admin-order.service.test.ts

key-decisions:
  - "List and detail selects share admin-status-errors; no reserve bypass on confirm (D-05)"
  - "Status accents on SelectTrigger only, not table rows (D-09)"

patterns-established:
  - "Admin status errors: ORDER_STATUS_ERROR_MESSAGES + optional descriptions via sonner"

requirements-completed: [ORD-05, BUG-24]

duration: 25min
completed: 2026-05-20
---

# Phase 31 Plan 01 Summary

**Admin order status selects now show correct stock errors, actionable hints, and per-status trigger accents — BUG-24 list UNKNOWN mapping fixed without changing reserve-on-confirm.**

## Performance

- **Duration:** ~25 min
- **Completed:** 2026-05-20
- **Tasks:** 3/3
- **Files modified:** 8

## Accomplishments

- Added `showOrderStatusErrorToast` and `getOrderStatusAccentClass` shared helpers with unit tests.
- Wired `OrderListStatusSelect` and `OrderStatusSelect` to shared errors, `min-w-[14rem]` triggers, and status accents.
- Added Vitest for `INSUFFICIENT_STOCK` toast on list and service test proving `reserveProductUnitsForOrder` runs before `INSUFFICIENT_STOCK` on PENDING→CONFIRMED.

## ASL-20260519-0013 root cause (D-01, D-02, D-04, D-08)

Order **ASL-20260519-0013** was **PENDING** (pickup) with line items requiring stock at confirm. Confirm calls `reserveProductUnitsForOrder`; when `product.quantity` is **0** (or another order consumed the last unit after checkout — D-04), the server throws **`INSUFFICIENT_STOCK`**. The **list** select lacked that key in `errorMessages`, so operators saw generic **UNKNOWN** («Не вдалося оновити статус…») instead of the stock message. **Valid path:** restore `quantity ≥ 1` in `/admin/tovary/[id]`, then confirm — reserve succeeds; no bypass added (D-05, D-08).

## Files Created/Modified

- `src/lib/order/admin-status-errors.ts` — UA messages + stock hint toast
- `src/lib/order/status-styles.ts` — per-status trigger Tailwind accents
- `src/components/admin/order-list-status-select.tsx` — BUG-24 fix + ORD-05 width/accent
- `src/components/admin/order-status-select.tsx` — parity with list
- `src/components/admin/order-list-status-select.test.tsx` — INSUFFICIENT_STOCK toast regression
- `src/server/services/admin-order.service.test.ts` — reserve-before-fail regression

## Self-Check: PASSED

- Phase-scoped Vitest suites: pass
- `npm run build`: pass
- `npm test`: 2 failures in `prisma/seed.test.ts` (local DB not fully seeded) — unrelated to phase 31

## Human verification (D-12)

1. `/admin/zamovlennia` — ASL-20260519-0013 or PENDING order with product qty 0: confirm → stock toast + hint, not UNKNOWN.
2. Restore product quantity → confirm succeeds.
3. Visual: distinct trigger accents; «Підтверджено (поточний)» not clipped.
