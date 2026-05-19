# Phase 22: Delivery-aware order status — Research

**Researched:** 2026-05-19  
**Status:** Complete

## RESEARCH COMPLETE

## Summary

Phase 22 closes a gap between **order lifecycle** (`status-transitions.ts`) and **fulfillment mode** (`deliveryType`: `PICKUP` | `LVIV_DELIVERY`). Today both admin selects and `updateOrderStatus` use `getAllowedNextStatuses(status)` / `assertTransitionAllowed(from, to)` only, so a `CONFIRMED` pickup order can still offer «Доставляється» (`OUT_FOR_DELIVERY`) and the API accepts it.

The fix is a **single source of truth** in `src/lib/order/status-transitions.ts`: filter allowed *targets* by delivery type, use it in server `updateOrderStatus`, list select, and detail page. Reuse existing `INVALID_STATUS_TRANSITION` for API errors (no new action error code).

## Current architecture

| Layer | File | Behavior today |
|-------|------|----------------|
| Domain | `src/lib/order/status-transitions.ts` | `ALLOWED_TRANSITIONS` graph; no `DeliveryType` |
| Server | `src/server/services/admin-order.service.ts` | `updateOrderStatus` → `assertTransitionAllowed` only |
| Action | `src/server/actions/admin/order.actions.ts` | Maps `INVALID_STATUS_TRANSITION` to toast |
| List UI | `src/components/admin/order-list-status-select.tsx` | `getAllowedNextStatuses(status)` |
| List parent | `src/components/admin/orders-data-table.tsx` | Passes `orderId`, `status` only |
| Detail UI | `src/app/(admin)/admin/zamovlennia/[orderNumber]/page.tsx` | `getAllowedNextStatuses(order.status)` |
| Detail select | `src/components/admin/order-status-select.tsx` | Receives precomputed `allowedNextStatuses` |

Existing tests: `admin-order.service.test.ts` (transitions), `order-list-status-select.test.tsx` (stopPropagation only).

## Delivery × status rules (from ROADMAP / ORD-03–04)

| `deliveryType` | Forbidden **target** statuses (in select & API) |
|----------------|--------------------------------------------------|
| `PICKUP` | `OUT_FOR_DELIVERY` |
| `LVIV_DELIVERY` | `READY_FOR_PICKUP` |

All other graph transitions unchanged. Terminal statuses (`COMPLETED`, `CANCELLED`) unchanged.

**From `CONFIRMED`:**

- `PICKUP` → `READY_FOR_PICKUP`, `CANCELLED`
- `LVIV_DELIVERY` → `OUT_FOR_DELIVERY`, `CANCELLED`

## Recommended implementation

### 1. Domain helpers (`status-transitions.ts`)

Add:

- `isStatusCompatibleWithDelivery(status, deliveryType): boolean`
- `getAllowedNextStatusesForDelivery(from, deliveryType): OrderStatus[]` — `getAllowedNextStatuses(from).filter(...)`
- `assertTransitionAllowedForDelivery(from, to, deliveryType)` — call `assertTransitionAllowed` then delivery check; throw `INVALID_STATUS_TRANSITION` on mismatch

Keep `getAllowedNextStatuses` / `assertTransitionAllowed` for callers that intentionally ignore delivery (none in admin path after this phase).

### 2. Server (`admin-order.service.ts`)

In `updateOrderStatus`, replace `assertTransitionAllowed(order.status, newStatus)` with `assertTransitionAllowedForDelivery(order.status, newStatus, order.deliveryType)`.

Re-export new helpers from service (detail page already imports from here).

### 3. Admin UI

- `OrderListStatusSelect`: add prop `deliveryType`; use `getAllowedNextStatusesForDelivery(status, deliveryType)`.
- `orders-data-table.tsx`: pass `row.original.deliveryType`.
- Detail page: `getAllowedNextStatusesForDelivery(order.status, order.deliveryType)`.

### 4. Tests (Vitest matrix — success criterion #4)

**Unit** — new `src/lib/order/status-transitions.test.ts` (or extend if exists):

- Matrix: for each `deliveryType` × representative `from` × each possible `to`, assert allow/deny matches table above.
- Explicit cases: `CONFIRMED`+`PICKUP`+`OUT_FOR_DELIVERY` throws; `CONFIRMED`+`LVIV_DELIVERY`+`READY_FOR_PICKUP` throws; valid pickup/delivery paths pass.

**Service** — extend `admin-order.service.test.ts` or dedicated test with mocked prisma for `updateOrderStatus` rejecting delivery-incompatible target.

**Component** — extend `order-list-status-select.test.tsx`: render `CONFIRMED` + `PICKUP`, open select, assert no option text «Доставляється» / no `OUT_FOR_DELIVERY` value in DOM.

No Prisma schema changes. No migration push.

## Risks

| Risk | Mitigation |
|------|------------|
| Legacy orders in “wrong” status for delivery type | Only **targets** are filtered; existing status display unchanged; transitions to `COMPLETED`/`CANCELLED` still work |
| Duplicated filter in UI vs server | Single lib functions used everywhere |
| Breaking admin-order re-exports | Add exports alongside existing ones |

## Validation Architecture

| Requirement | Automated check |
|-------------|-----------------|
| ORD-03 UI filter | Component test + manual: list + detail select |
| ORD-04 API reject | Unit `assertTransitionAllowedForDelivery` + service/integration test |
| Matrix coverage | `status-transitions.test.ts` describe.each matrix |

## Validation

- `npm test` — all new/updated tests green
- `npm run build` — no type errors

## RESEARCH COMPLETE
