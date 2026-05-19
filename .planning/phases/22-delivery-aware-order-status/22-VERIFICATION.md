---
status: passed
phase: 22-delivery-aware-order-status
verified: 2026-05-19
score: 4/4
requirements:
  - ORD-03
  - ORD-04
---

# Phase 22 Verification

## Must-haves

| Truth | Status | Evidence |
|-------|--------|----------|
| PICKUP orders never show OUT_FOR_DELIVERY in admin select | ✓ | `getAllowedNextStatusesForDelivery` + component test |
| LVIV_DELIVERY orders never show READY_FOR_PICKUP | ✓ | Matrix test + lib filter |
| API rejects delivery-incompatible targets | ✓ | `updateOrderStatus` + service tests |
| Vitest matrix delivery × status | ✓ | `status-transitions.test.ts` |

## Automated checks

| ID | Result |
|----|--------|
| V1 | ✓ vitest status-transitions |
| V2 | ✓ vitest admin-order.service |
| V3 | ✓ vitest order-list-status-select |
| V4 | ⚠ `npm test` — `prisma/seed.test.ts` fails (DB has 0 out-of-stock products; unrelated to phase 22) |
| V5 | ✓ `npm run build` |

## Human verification

Optional manual checks in 22-VALIDATION.md — not blocking.
