# Phase 31 — Research

**Researched:** 2026-05-20  
**Domain:** Admin order status UX + BUG-24 stock error mapping  
**Confidence:** HIGH

## Summary

Phase 31 is a **targeted bugfix + polish** on existing admin order status UI. Root cause for ASL-20260519-0013 is confirmed: server returns `INSUFFICIENT_STOCK` on `PENDING → CONFIRMED` when `product.quantity === 0`, but **list** select maps unknown codes to generic `UNKNOWN`. Detail select already maps `INSUFFICIENT_STOCK` correctly.

No schema or transition-matrix changes. Implementation = shared error helper, parity list/detail, status accent classes, wider triggers, Vitest extensions.

**Primary recommendation:** One plan (wave 1) covering BUG-24 + ORD-05; optional extract `src/lib/order/admin-status-errors.ts` for DRY between two selects.

## Standard Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| UI | shadcn Select + sonner | Existing in both status components |
| Server | `updateOrderStatus` + `reserveProductUnitsForOrder` | Phase 22 / BUG-15 — unchanged |
| Tests | Vitest | `order-list-status-select.test.tsx`, `admin-order.service.test.ts` |

## Architecture Patterns

### Error mapping duplication

```typescript
// order-status-select.tsx — HAS INSUFFICIENT_STOCK
// order-list-status-select.tsx — MISSING INSUFFICIENT_STOCK → falls through to UNKNOWN
```

**Fix:** Extract shared `ORDER_STATUS_ERROR_MESSAGES` + `getOrderStatusErrorToast(error)` with optional description for stock.

### Status accents

New `getOrderStatusAccentClass(status)` in `src/lib/order/status-styles.ts` (or colocate with `status-labels.ts`). Apply to `SelectTrigger className={cn(..., getOrderStatusAccentClass(status))}` in list + detail.

### Tests

- Component test: mock `updateOrderStatusAction` returning `{ ok: false, error: 'INSUFFICIENT_STOCK' }` → expect stock UA string, not UNKNOWN.
- Service test: `PENDING → CONFIRMED` with mocked inventory throwing `INSUFFICIENT_STOCK` (may already exist — extend if missing).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Custom dropdown | — | shadcn Select |
| Bypass reserve on confirm | — | Fix messaging + operator restores qty |

## Common Pitfalls

1. **Only fixing list file** — detail already correct; keep both on shared helper.
2. **`w-[11rem]` only on enabled branch** — disabled-only trigger also needs width fix (lines 60–68).
3. **ROADMAP criterion 3** — «CONFIRMED проходить» means after qty restored, not bypassing reserve.

## Code References

| File | Role |
|------|------|
| `order-list-status-select.tsx` | BUG-24 list mapping, width |
| `order-status-select.tsx` | Reference mapping, detail width |
| `order.actions.ts` | Maps `INSUFFICIENT_STOCK` from service |
| `admin-order.service.ts` | `updateOrderStatus` + reserve |
| `product-inventory.ts` | Throws `INSUFFICIENT_STOCK` |
| `order-list-status-select.test.tsx` | Extend for error mapping |

## Validation Architecture

### Test pyramid

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | Error helper, accent class map |
| Component | Vitest + RTL | List select toast on INSUFFICIENT_STOCK |
| Integration | Vitest | admin-order.service stock-at-zero |
| Manual | Browser | ASL-20260519-0013 message + confirm after qty fix |

### Critical scenarios

1. List select: confirm with zero stock → stock UA message + hint, not UNKNOWN.
2. Detail select: same message (regression guard).
3. Long label «Підтверджено (поточний)» visible without truncation in list.
4. Each status shows distinct light accent on trigger.

## Sources

- `.planning/phases/31-order-status-ux-bugfix/31-CONTEXT.md` (D-01–D-12)
- Live code read 2026-05-20

## Metadata

**Confidence:** HIGH — root cause verified in CONTEXT + code grep  
**Research type:** bugfix / polish  
**Planner notes:** Single plan preferred; no DB migration
