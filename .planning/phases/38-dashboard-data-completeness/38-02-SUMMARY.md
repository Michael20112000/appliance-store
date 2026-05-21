---
phase: 38-dashboard-data-completeness
plan: 02
subsystem: admin-ui
tags: [admin, dashboard, orders-table, shadcn]
requirements: [ADM-DASH-08]
---

# Plan 38-02 Summary — Recent orders table parity

## What Was Built

Dashboard «Останні замовлення» now matches `/admin/zamovlennia` column structure (ADM-DASH-08):

- **`src/server/services/admin-order.service.ts`** — `findMany` `take: 10` (was 5)
- **`src/server/services/admin-order.service.test.ts`** — asserts `take: 10` and `orderBy: { createdAt: "desc" }`
- **`src/components/admin/admin-recent-orders-table.tsx`** — shadcn `Table`, 6 columns (Номер, Дата, Покупець, Доставка, Сума, Статус), `OrderListStatusSelect`, row navigation unchanged; no filters/pagination/sort headers

## Key Decisions

- Static shadcn table (no TanStack) — parity without list chrome
- `AdminRecentOrderRow` Pick type removed; props use full `AdminOrderSummaryDto[]`
- Helpers `formatDate` / `deliveryLabel` copied inline from `orders-data-table.tsx`

## Verification

- `npx vitest run src/server/services/admin-order.service.test.ts` — 35 tests pass
- Human verify: **pending** — `/admin` table vs `/admin/zamovlennia`

## Self-Check: PASSED (automated)

## Files Modified

- `src/server/services/admin-order.service.ts`
- `src/server/services/admin-order.service.test.ts`
- `src/components/admin/admin-recent-orders-table.tsx`
