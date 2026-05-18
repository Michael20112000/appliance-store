# Phase 12 — Pattern Map

**Phase:** 12 — Admin Tables — Status & Sort  
**Generated:** 2026-05-18

## File → Analog Map

| New / modified file | Role | Closest analog | Key excerpt pattern |
|---------------------|------|----------------|---------------------|
| `order-list-status-select.tsx` | Verify only | `product-list-status-select.tsx` | `stopPropagation` on trigger |
| `admin-product.ts` (sort enums) | Validator | `admin-order.ts` L11-30 | `adminOrderListSortSchema` + defaults |
| `admin-product.service.ts` | orderBy builder | `admin-order.service.ts` `buildPrismaOrderBy` | switch on sort key |
| `products-url.ts` | URL sort params | `orders-url.ts` | omit default sort/dir |
| `products-url.test.ts` | URL tests | `orders-url.test.ts` L22-26 | sort+dir in query |
| `admin-products-table.tsx` | Sort headers | `orders-data-table.tsx` `SortableHeader` | Link + arrow icons + `aria-sort` |
| `products-list-pagination.tsx` | Preserve sort | `orders-data-table` pagination block | pass sort/dir to url helper |
| `product-list-filters.tsx` | Preserve sort | — | add sort/dir to every `adminProductsUrl` call |
| `tovary/page.tsx` | Parse searchParams | `zamovlennia` orders page | pass sort/dir to list |

## Shared extract (optional)

| Artifact | When |
|----------|------|
| `admin-sortable-table-header.tsx` | If duplicating `SortableHeader` + `nextSortDir` + `getAriaSort` — **visual must match orders** |

## Do not copy

| Pattern | Reason |
|---------|--------|
| TanStack `useReactTable` for products | Phase 11 locked plain `<table>` |
| Client-side sort | ADM-PRD-02 requires server/URL sort |
| Rebuild `OrderListStatusSelect` | Already implemented |
