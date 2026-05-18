---
phase: 12-admin-tables-status-sort
plan: 03
status: complete
requirements:
  - ADM-ORD-02
  - ADM-PRD-02
---

# Plan 12-03 Summary

## Outcome

Shared `AdminSortableTableHeader` (orders refactored). Products table has four sortable columns; page, filters, and pagination preserve `sort`/`dir`. Manual checklist added.

## Key files

- `src/components/admin/admin-sortable-table-header.tsx`
- `src/components/admin/admin-products-table.tsx`
- `src/app/(admin)/admin/tovary/page.tsx`
- `src/components/admin/product-list-filters.tsx`
- `src/components/admin/products-list-pagination.tsx`

## Self-Check: PASSED

- [x] `npm test` / `npm run build`
- [x] Sort headers + URL wiring present
