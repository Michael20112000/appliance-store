---
phase: 12-admin-tables-status-sort
plan: 01
status: complete
requirements:
  - ADM-ORD-02
---

# Plan 12-01 Summary

## Outcome

Verified `OrderListStatusSelect` wiring in `orders-data-table.tsx` (status column, no «Відкрити» column). Added Vitest regression for `stopPropagation` on Select trigger.

## Key files

- `src/components/admin/order-list-status-select.test.tsx` (created)
- `vitest.config.ts` — include `*.test.tsx` + jsdom
- `package.json` — `jsdom` devDependency

## Self-Check: PASSED

- [x] `npx vitest run src/components/admin/order-list-status-select.test.tsx`
- [x] `grep OrderListStatusSelect orders-data-table.tsx`
