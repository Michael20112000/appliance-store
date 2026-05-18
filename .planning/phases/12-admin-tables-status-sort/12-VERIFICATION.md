---
status: human_needed
phase: 12-admin-tables-status-sort
verified: 2026-05-18
score: 8/8
---

# Phase 12 Verification

## Must-haves

| Truth | Status | Evidence |
|-------|--------|----------|
| Order status cell uses OrderListStatusSelect | ✓ | `orders-data-table.tsx` status column |
| Select stopPropagation | ✓ | `order-list-status-select.test.tsx` |
| Product sort via URL + Prisma | ✓ | `admin-product.ts` schema, `buildPrismaProductOrderBy` |
| Sortable product headers | ✓ | `admin-products-table.tsx` + `AdminSortableTableHeader` |
| Filters/pagination preserve sort | ✓ | `product-list-filters.tsx`, `products-list-pagination.tsx` |
| Photo column not sortable | ✓ | Plain `<th>Фото</th>` |
| Vitest sort/url tests | ✓ | `products-url.test.ts`, `admin-product.test.ts` |
| Manual checklist | ✓ | `12-MANUAL-CHECKLIST.md` |

## Requirements

| ID | Status |
|----|--------|
| ADM-ORD-02 | Implemented (verified + test) |
| ADM-PRD-02 | Implemented (backend + UI) |

## Automated checks

- `npm test` — 183 passed
- `npm run build` — success

## Human verification

Complete `.planning/phases/12-admin-tables-status-sort/12-MANUAL-CHECKLIST.md` on dev server (`/admin/zamovlennia`, `/admin/tovary`).
