---
phase: 04-admin-operations
plan: 04
subsystem: api
tags: [admin, orders, prisma, zod, vitest, sonner, shadcn]

requires:
  - phase: 03-cart-checkout
    provides: order.service, Order/OrderItem models, SOLD on checkout
  - phase: 04-admin-operations
    provides: requireAdmin layout, AdminNav baseline
provides:
  - admin-order.service with transition matrix and cancel inventory revert
  - Admin order actions with revalidation
  - Admin UI at /admin/zamovlennia list and detail
affects: [04-05]

tech-stack:
  added: [sonner, next-themes]
  patterns:
    - "Order status labels in lib/order/status-labels.ts for client + server"
    - "Cancel flow reverts SOLD→AVAILABLE in prisma.$transaction"
    - "requireAdmin on updateOrderStatusAction; illegal transitions return INVALID_STATUS_TRANSITION"

key-files:
  created:
    - src/server/services/admin-order.service.ts
    - src/server/services/admin-order.service.test.ts
    - src/server/validators/admin-order.ts
    - src/server/validators/admin-order.test.ts
    - src/server/actions/admin/order.actions.ts
    - src/lib/order/status-labels.ts
    - src/components/admin/orders-table.tsx
    - src/components/admin/order-status-select.tsx
    - src/components/admin/order-status-badge.tsx
    - src/components/admin/order-list-filters.tsx
    - src/app/(admin)/admin/zamovlennia/page.tsx
    - src/app/(admin)/admin/zamovlennia/[orderNumber]/page.tsx
    - src/components/ui/select.tsx
    - src/components/ui/alert-dialog.tsx
    - src/components/ui/sonner.tsx
  modified:
    - src/components/admin/admin-nav.tsx
    - src/app/(admin)/admin/layout.tsx
    - package.json

key-decisions:
  - "Shared ORDER_STATUS_LABELS_UA in lib/order/status-labels.ts to avoid prisma import in client badges"
  - "Filter tabs via ?filter= query param mapping to status sets on list page"
  - "AlertDialog + sonner toast on cancel and successful status update"

patterns-established:
  - "Pattern: admin-order.service → order.actions → OrderStatusSelect (client)"
  - "Pattern: revalidatePath /admin/zamovlennia, detail, and /kabinet after status change"

requirements-completed: [ADM-04]

duration: 12min
completed: 2026-05-17
---

# Phase 4 Plan 04: Admin Orders Summary

**Admin order management at `/admin/zamovlennia` with linear status transitions, cancel inventory revert, and Ukrainian UI**

## Performance

- **Duration:** 12 min
- **Started:** 2026-05-17T13:15:00Z
- **Completed:** 2026-05-17T13:27:00Z
- **Tasks:** 3
- **Files modified:** 18

## Accomplishments

- `admin-order.service` lists all orders, loads detail by `orderNumber`, and updates status with `INVALID_STATUS_TRANSITION` guard
- On `CANCELLED`, linked products revert `SOLD` → `AVAILABLE` inside a transaction (D-04-04)
- Admin pages: filtered order table, detail with line items, `OrderStatusSelect` with cancel confirmation
- `AdminNav` enables **Замовлення** → `/admin/zamovlennia`

## Task Commits

1. **Task 1: admin-order.service + validators + unit tests** - `90109c5` (test), `56cc433` (feat)
2. **Task 2: order.actions** - `1cdd0bc` (feat)
3. **Task 3: Orders list + detail + status select UI** - `97bd870` (feat)

## Files Created/Modified

- `src/server/services/admin-order.service.ts` - Transition matrix, list/get/update, cancel revert
- `src/server/actions/admin/order.actions.ts` - `updateOrderStatusAction` with `requireAdmin`
- `src/app/(admin)/admin/zamovlennia/page.tsx` - Filter tabs and orders table
- `src/app/(admin)/admin/zamovlennia/[orderNumber]/page.tsx` - Customer, items, status control
- `src/components/admin/order-status-select.tsx` - Select + cancel AlertDialog + toast

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Critical] Extracted status labels to shared lib**
- **Found during:** Task 3 (client `OrderStatusBadge`)
- **Issue:** Importing `admin-order.service` in client components would pull Prisma
- **Fix:** `src/lib/order/status-labels.ts` shared by service and UI
- **Files modified:** `src/lib/order/status-labels.ts`, `admin-order.service.ts`
- **Commit:** `97bd870`

**2. [Rule 3 - Blocking] Added shadcn select, alert-dialog, sonner**
- **Found during:** Task 3 UI
- **Issue:** Components required by UI-SPEC were not yet installed
- **Fix:** `npx shadcn add select alert-dialog sonner`
- **Commit:** `97bd870`

## Self-Check: PASSED

- FOUND: src/server/services/admin-order.service.ts
- FOUND: src/server/actions/admin/order.actions.ts
- FOUND: src/app/(admin)/admin/zamovlennia/page.tsx
- FOUND: src/components/admin/order-status-select.tsx
- FOUND: 90109c5, 56cc433, 1cdd0bc, 97bd870
