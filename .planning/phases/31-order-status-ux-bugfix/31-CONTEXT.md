# Phase 31: Order status UX & bugfix - Context

**Gathered:** 2026-05-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin orders (`/admin/zamovlennia`): operators see status at a glance (light color accents), status selects fit long UA labels, and BUG-24 (ASL-20260519-0013) is closed with a documented root cause and correct operator-facing errors.

**In scope (requirements):** ORD-05, BUG-24 — per `.planning/REQUIREMENTS.md` and ROADMAP Phase 31 success criteria.

**Out of scope:** Changing delivery-aware transition matrix (Phase 22), checkout stock policy redesign (soft reservation at checkout), admin qty-decrease guards, new order statuses, email notifications, storefront order flows.

</domain>

<decisions>
## Implementation Decisions

### BUG-24 — root cause (ASL-20260519-0013)
- **D-01:** Reproduced in DB: order `ASL-20260519-0013` is `PENDING` + `PICKUP`; line item product `Пральна машина AEG 42` has **`product.quantity = 0`** at confirm time.
- **D-02:** Server correctly rejects `PENDING → CONFIRMED` via `reserveProductUnitsForOrder` → `INSUFFICIENT_STOCK` (not an invalid delivery transition).
- **D-03:** Operator-visible bug is **mis-mapped error**: `order-list-status-select.tsx` `errorMessages` lacks `INSUFFICIENT_STOCK`, so UI shows generic **UNKNOWN** («Не вдалося оновити статус…») even when server returns `INSUFFICIENT_STOCK`. Detail `order-status-select.tsx` already maps it.
- **D-04:** Likely data scenario (per operator): customer ordered while `qty ≥ 1`; later **admin manually set qty to 0** (or another confirmed order consumed the last unit). Pending order remains; confirm is **not** valid per current stock rules.

### BUG-24 — operator policy when stock is insufficient
- **D-05:** **Do not** allow `CONFIRMED` without successful inventory reserve when `product.quantity` is insufficient — no idempotent skip, no confirm-without-decrement.
- **D-06:** When reserve fails, show **clear UA message** (same copy as detail page): «Недостатньо товару на складі для підтвердження» — in **both** list and detail selects.
- **D-07:** Add **actionable hint** for operator (toast description or inline helper): increase product qty in `/admin/tovary/[id]` **or** cancel the order — do not leave generic UNKNOWN.
- **D-08:** Success for ASL-20260519-0013: **document root cause** in plan/verification; order may confirm only after operator restores `quantity ≥ 1` (manual data fix acceptable for this ticket). ROADMAP criterion «CONFIRMED проходить» applies when transition is **valid per stock** — not by bypassing reserve.

### ORD-05 — status colors & select width (not discussed; follow requirements)
- **D-09:** Light background/border accent per status on orders table status cell and/or select trigger (скасовано — reddish, виконано — greenish, etc.) — match REQUIREMENTS ORD-05; exact palette in planner/UI discretion.
- **D-10:** Fix truncated «Підтверджено (поточний)» — increase `OrderListStatusSelect` width beyond `w-[11rem]` and align detail `max-w-xs` if needed; prefer `min-w` + no text clipping over abbreviating «(поточний)».

### Tests
- **D-11:** Vitest: regression for `INSUFFICIENT_STOCK` mapping in list select (if component-level) and existing `updateOrderStatus` / transition tests extended for stock-at-zero on `PENDING → CONFIRMED`.
- **D-12:** Manual: ASL-20260519-0013 shows stock message (not UNKNOWN); after restoring product qty, confirm succeeds.

### Claude's Discretion
- Exact status → color token mapping (Tailwind classes) and whether accent is on `SelectTrigger` only vs whole table cell.
- Hint UI: extended toast vs `title`+`description` on sonner vs static text under select on error.
- Whether to add optional warning on order detail when any line’s `product.quantity < item.quantity` while order is `PENDING`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — ORD-05, BUG-24
- `.planning/ROADMAP.md` — Phase 31 goal and success criteria
- `.planning/BUGFIX-WORKFLOW.md` — intake → plan → execute for bugs

### Prior phase (order status rules)
- `.planning/phases/22-delivery-aware-order-status/22-RESEARCH.md` — delivery-aware transitions
- `.planning/phases/22-delivery-aware-order-status/22-01-SUMMARY.md` — shipped ORD-03/04 behavior
- `.planning/todos/completed/bugfix-intake-2026-05-19.md` — BUG-15 reserve on CONFIRMED only

### Code (primary touchpoints)
- `src/components/admin/order-list-status-select.tsx` — list select, missing `INSUFFICIENT_STOCK` in `errorMessages`, `w-[11rem]`
- `src/components/admin/order-status-select.tsx` — detail select, has stock error mapping
- `src/components/admin/orders-data-table.tsx` — status column
- `src/server/actions/admin/order.actions.ts` — `updateOrderStatusAction` error mapping
- `src/server/services/admin-order.service.ts` — `updateOrderStatus`
- `src/server/services/product-inventory.ts` — reserve/release on transitions
- `src/lib/order/status-transitions.ts` — allowed transitions
- `src/lib/order/status-labels.ts` — UA labels

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ORDER_STATUS_LABELS_UA` — UA status strings including «(поточний)» suffix in selects
- `getAllowedNextStatusesForDelivery` — already used in list select
- `updateOrderStatusAction` + toast/sonner pattern in both status selects
- `admin-order.service.test.ts` — delivery-incompatible transition tests; extend for stock

### Established Patterns
- Stock: reserve only on `PENDING → CONFIRMED`; release on cancel from non-pending; checkout does not decrement (BUG-15)
- Cancel confirmation `AlertDialog` before `CANCELLED`
- Server errors mapped to stable action error codes; UI maps codes to UA strings

### Integration Points
- List: `orders-data-table.tsx` → `OrderListStatusSelect`
- Detail: `/admin/zamovlennia/[orderNumber]` → `OrderStatusSelect`
- Revalidate paths on successful status change include catalog and admin products

</code_context>

<specifics>
## Specific Ideas

- Operator quote for ASL-20260519-0013: guest order, pickup, one washer line; status «Нове»; error toast «Не вдалося оновити статус. Спробуйте ще раз.»
- Operator confusion: «how can there be an order if product is out of stock» — explain via admin qty edit / competing orders, not broken checkout.

</specifics>

<deferred>
## Deferred Ideas

- **Soft reservation at checkout** — hold unit when order created; belongs to future inventory phase.
- **Admin guard** when lowering `product.quantity` below sum of open `PENDING` order line quantities — separate admin/UX phase.
- **Combo guard + order warning badge** — deferred (user chose message-only path for this phase).

### Reviewed Todos (not folded)
- `bugfix-intake-TEMPLATE.md` — template only; no concrete BUG-24 row (score match on keywords).

</deferred>

---

*Phase: 31-Order status UX & bugfix*
*Context gathered: 2026-05-20*
