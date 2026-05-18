# Phase 12: Admin Tables — Status & Sort — Research

**Researched:** 2026-05-18  
**Domain:** Admin order status inline edit, server-side product list sorting, URL state  
**Confidence:** HIGH (orders pattern exists; products gap verified in code)

## Summary

Phase 12 delivers **ADM-ORD-02** (inline order status from list) and **ADM-PRD-02** (products table column sort like orders). **Critical finding:** ADM-ORD-02 is **already implemented** — `OrderListStatusSelect` wired in `orders-data-table.tsx` during Phase 11 UAT (`11-UAT.md` tests 1b). Remaining work for orders: **automated tests**, manual regression checklist, mark requirement complete.

**ADM-PRD-02** is **not implemented**. Products list uses `listAdminProducts` with fixed `orderBy: { updatedAt: "desc" }`; `listAdminProductsSchema` has no `sort`/`dir`; `adminProductsUrl` omits sort params; `AdminProductsTable` has static `<th>` headers; pagination and filter links do not preserve sort.

**Primary recommendation:** Mirror the **orders URL sort stack** for products (validator → `buildPrismaProductOrderBy` → service → `adminProductsUrl` → page `searchParams` → table sort headers). Keep products on **plain HTML `<table>`** (Phase 11 canonical) with `Link` headers matching `SortableHeader` visuals from `orders-data-table.tsx` — optional extract to `admin-sortable-table-header.tsx` for DRY.

**Packages:** No new npm dependencies.

## Phase Requirements

| ID | Description | Status | Research Support |
|----|-------------|--------|------------------|
| ADM-ORD-02 | Inline order status via shadcn Select; allowed transitions; stopPropagation | **Shipped in code** | `order-list-status-select.tsx` + `orders-data-table.tsx`; verify + Vitest |
| ADM-PRD-02 | Products table sortable columns like orders | **Not started** | Extend schema/service/url/table/filters/pagination |

## Codebase Reality (verified)

| Artifact | Orders | Products |
|----------|--------|----------|
| Inline status Select | `OrderListStatusSelect` in status cell | `ProductListStatusSelect` (out of scope for sort) |
| Sort URL params | `sort`, `dir` in `listOrdersAdminSchema` | Missing |
| Sort headers | `SortableHeader` + `adminOrdersUrl` | Static headers |
| Default sort | `createdAt` desc | `updatedAt` desc (implicit, no URL) |
| Table tech | TanStack + shadcn Table | Plain `<table>` |

## Standard Stack (reuse)

| Layer | Choice | Reference |
|-------|--------|-----------|
| URL builder | `adminProductsUrl` | `src/lib/admin/products-url.ts` |
| Validator | Zod enums | `admin-order.ts` → copy pattern |
| DB sort | Prisma `orderBy` | `buildPrismaOrderBy` in `admin-order.service.ts` |
| UI headers | Next `Link` + lucide icons | `orders-data-table.tsx` `SortableHeader` |
| Status action | Server action | `updateOrderStatusAction` (exists) |
| Transitions | Pure TS | `lib/order/status-transitions.ts` |

## Product Sort Design

### URL contract

| Param | Values | Default (omit from URL) |
|-------|--------|-------------------------|
| `sort` | `title`, `category`, `price`, `status` | *(backend)* `updatedAt` |
| `dir` | `asc`, `desc` | `desc` |

When `sort` is omitted, backend uses `{ updatedAt: "desc" }` (current behavior). Do **not** add `updatedAt` to public sort enum — no UI column.

### Prisma mapping

```ts
// buildPrismaProductOrderBy(sort, dir)
title    → { title: dir }
category → { category: { name: dir } }
price    → { price: dir }
status   → { status: dir }
default  → { updatedAt: "desc" }
```

### Sortable columns (UI)

| Column | Sortable | Notes |
|--------|----------|-------|
| Фото | No | Thumbnail only |
| Назва | Yes (`title`) | Brand subline stays in cell |
| Категорія | Yes (`category`) | Relation sort by name |
| Ціна | Yes (`price`) | Kopiyky integer |
| Статус | Yes (`status`) | Cell still has `ProductListStatusSelect` + stopPropagation |

### Propagation surfaces (must all pass sort/dir)

1. `tovary/page.tsx` — parse `searchParams`, pass to service + table
2. `admin-products-table.tsx` — header Links
3. `products-list-pagination.tsx` — `hrefFor`
4. `product-list-filters.tsx` — all `adminProductsUrl` calls

## Orders (ADM-ORD-02) — verify-only plan

Existing behavior to confirm:

- `getAllowedNextStatuses` filters options
- Terminal statuses → disabled Select
- `CANCELLED` → `AlertDialog` before save
- `stopPropagation` on `onClick` + `onPointerDown` of `SelectTrigger`
- `updateOrderStatusAction` + `router.refresh()` on success
- Sort header on status column independent of inline Select

**Gap:** No Vitest for `order-list-status-select` or `products-url` sort (ROADMAP success criterion #4).

## Plan Split Recommendation

| Plan | Wave | Scope |
|------|------|-------|
| 12-01 | 1 | ADM-ORD-02 verification + Vitest (`stopPropagation`, optional action mock) |
| 12-02 | 2 | ADM-PRD-02 backend: validator, `buildPrismaProductOrderBy`, service, `adminProductsUrl`, tests |
| 12-03 | 3 | ADM-PRD-02 UI: `AdminProductsTable` sort headers, wire page/filters/pagination, manual checklist |

**3 plans, 3 waves** — backend before UI so page can pass real sort props.

## Anti-Patterns

| Avoid | Why |
|-------|-----|
| Client-only sort without URL | Breaks shareable admin URLs; inconsistent with orders |
| TanStack migration for products | Out of scope; plain table is Phase 11 canonical |
| Re-implement order status Select | Already shipped; wastes scope |
| Sort column `updatedAt` in UI | No column; keep as silent default |
| Badge-only order status | ADM-ORD-02 requires Select control |

## Validation Architecture

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x |
| Quick run | `npx vitest run src/lib/admin/products-url.test.ts src/server/validators/admin-product.test.ts` |
| Full suite | `npm test` |
| Manual | `12-MANUAL-CHECKLIST.md` (plan 12-03) |

### Automated coverage map

| Requirement | Test target |
|-------------|-------------|
| ADM-PRD-02 URL | `products-url.test.ts` — sort/dir query building |
| ADM-PRD-02 schema | `admin-product.test.ts` — valid/invalid sort keys |
| ADM-ORD-02 isolation | `order-list-status-select.test.tsx` — trigger stopPropagation (optional) |
| Regression | `clickable-table-row.test.ts` — unchanged |

## RESEARCH COMPLETE

**Plans:** 3 (verify orders → products backend → products UI)  
**Main delta:** Product server-side sort + URL-synced headers  
**Orders:** Verify + tests only
