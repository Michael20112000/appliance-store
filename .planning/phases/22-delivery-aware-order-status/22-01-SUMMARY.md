---
phase: 22-delivery-aware-order-status
plan: 01
subsystem: api
tags: [orders, admin, vitest, prisma]

requires: []
provides:
  - Delivery-aware order status transitions (lib + server + admin UI)
affects: [admin-orders, order-status]

tech-stack:
  added: []
  patterns:
    - "Filter allowed status targets by deliveryType in one lib module"
    - "Server assertTransitionAllowedForDelivery enforces UI rules"

key-files:
  created:
    - src/lib/order/status-transitions.test.ts
  modified:
    - src/lib/order/status-transitions.ts
    - src/server/services/admin-order.service.ts
    - src/server/services/admin-order.service.test.ts
    - src/components/admin/order-list-status-select.tsx
    - src/components/admin/order-list-status-select.test.tsx
    - src/components/admin/orders-data-table.tsx
    - src/app/(admin)/admin/zamovlennia/[orderNumber]/page.tsx

key-decisions:
  - "Reuse INVALID_STATUS_TRANSITION for delivery-incompatible targets (no new error code)"
  - "Detail page imports getAllowedNextStatusesForDelivery via admin-order.service re-export"

patterns-established:
  - "isStatusCompatibleWithDelivery gates OUT_FOR_DELIVERY on PICKUP and READY_FOR_PICKUP on LVIV_DELIVERY"

requirements-completed: [ORD-03, ORD-04]

duration: 25min
completed: 2026-05-19
---

# Phase 22 Plan 01 Summary

**Admin order status options and API now respect pickup vs Lviv delivery — wrong fulfillment statuses are hidden and rejected.**

## Performance

- **Duration:** ~25 min
- **Tasks:** 4/4
- **Files modified:** 8

## Accomplishments

- Added `getAllowedNextStatusesForDelivery` and `assertTransitionAllowedForDelivery` in `status-transitions.ts` with Vitest matrix.
- `updateOrderStatus` enforces delivery-aware transitions on the server.
- List and detail admin selects filter incompatible next statuses; list select requires `deliveryType` prop.

## Files Created/Modified

- `src/lib/order/status-transitions.ts` — delivery compatibility helpers
- `src/lib/order/status-transitions.test.ts` — matrix tests
- `src/server/services/admin-order.service.ts` — server enforcement + re-exports
- `src/components/admin/order-list-status-select.tsx` — `deliveryType` prop + filtered options
- `src/app/(admin)/admin/zamovlennia/[orderNumber]/page.tsx` — delivery-aware allowed statuses

## Self-Check: PASSED

- [x] `npx vitest run` on phase 22 test files — 42 passed
- [x] `npm run build` — success
- [x] ORD-03 UI filtering on list + detail
- [x] ORD-04 server rejection with INVALID_STATUS_TRANSITION
