---
phase: 15
slug: storefront-catalog-polish
status: draft
shadcn_initialized: true
preset: "base-nova · base: neutral · cssVariables · Tailwind v4 · geist"
created: 2026-05-18
locale: uk
extends: 02-UI-SPEC.md
---

# Phase 15 — UI Design Contract

> Порожні категорії приховані; counts — shadcn **Badge** `secondary`; каталог пагінований по **16** з UI як `/admin/tovary`. Джерела: `15-CONTEXT.md` (D-15-01…D-15-16), `02-UI-SPEC.md`, `catalog-filters.tsx`, `admin-list-pagination.tsx`.

**Out of scope:** ProductCard redesign, quantity badges, нові фільтри/сортування, checkout.

---

## Design System

| Property | Value |
|----------|-------|
| Badge | `@/components/ui/badge` — `variant="secondary"` |
| Pagination | Reuse `AdminListPagination` — optional `showPageSizeSelector={false}` for storefront fixed 16 |
| Page size | `CATALOG_PAGE_SIZE = 16` (server constant) |
| URL | `storinka` → query key `сторінка` (unchanged) |

---

## Category Navigation (CAT-04, CAT-05)

### Visibility rules

| Surface | Rule |
|---------|------|
| Header desktop | First **4** categories with `productCount > 0`, `sortOrder` asc — **no backfill** |
| Homepage `CategoryGrid` | Omit cards where `productCount === 0`; hide entire section if none left |
| Catalog sidebar | Omit category rows with `productCount === 0`; always show «Усі товари» |
| `StoreMobileNav` | Same filtered list as sidebar (names only; badge optional per D-15-09 on links) |

### Label + count (D-15-06…D-15-09)

```
[Category name] [Badge: N]
```

| Element | Layout |
|---------|--------|
| Sidebar link | `flex items-center gap-2` — name + Badge inline |
| «Усі товари» | Same pattern with `totalProductCount` |
| Header / mobile | Name + Badge when counts available |

Remove `formatCategoryLabel` (`"Name — N"`).

---

## Catalog Pagination (CAT-06)

| Property | Spec |
|----------|------|
| Placement | Below `ProductGrid` in main column |
| Visibility | Hidden when `totalPages <= 1` |
| Page size | Fixed 16 — no storefront page-size selector |
| OOB page | Client clamp: `storinka` → `min(requested, totalPages)` via nuqs `replace` |
| Deep link empty category | HTTP 200 + existing empty state copy (D-15-16) |

### Pagination chrome

Match admin: Previous / numbered pages / Next, UA labels «Попередня» / «Наступна», `text-sm text-muted-foreground` page indicator.

---

## Empty States

| Case | Behavior |
|------|----------|
| Category exists, 0 available products | 200, dashed border empty block (existing pattern on `[slug]` page) |
| Global catalog, 0 results with filters | Existing «Товарів не знайдено» |
| Homepage, all categories empty | Section not rendered |

---

## Accessibility

- Badge counts: `aria-label` or visible text adjacent to name (badge number is visible)
- Pagination: reuse shadcn `PaginationLink` / `aria-disabled` from admin component

---

## Verification (manual)

- [ ] Header shows ≤4 categories, none with 0 products
- [ ] Sidebar: no «Name — N», only Badge
- [ ] `/katalog?сторінка=99` clamps when few products
- [ ] Pagination hidden on single page
