# Phase 25: Homepage empty categories — UI Design Contract

**Created:** 2026-05-19  
**Status:** Approved (derived from discuss-phase CONTEXT)

## Scope

Homepage `CategoryGrid` section only (`#kategorii` on `/`). No new routes, no card redesign, no product-count badges.

## Section visibility (HOME-03)

| Condition | Render |
|-----------|--------|
| 0 categories after `categoriesWithAvailableProducts` | **Nothing** — return `null`; no `<section>`, no `h2`, no empty-state copy |
| ≥ 1 category | Full section: `h2` «Категорії» + grid |

## Grid layout

- Unchanged classes: `grid grid-cols-2 gap-4 md:grid-cols-4`
- **1–3 categories:** same grid; no centering, column-span, or sparse-layout variants (D-06)

## Category card (unchanged)

| Element | Spec |
|---------|------|
| Image | Cloudinary `OptimizedImage` when `imagePublicId`; else muted «Без фото» placeholder |
| Title | `CardTitle` with category name |
| CTA | `CardDescription` «Переглянути» |
| Link | `/katalog/{slug}` |

No `productCount` badge on homepage cards (FOOT-04 is Phase 26).

## Parity reference

Filtered category set must match `StoreHeader` / `catalog-filters` — same `listCategoriesWithProductCounts` + `categoriesWithAvailableProducts` pipeline.

## Verification (visual)

1. After seed with empty categories: homepage has no «Категорії» block; header also omits those categories.
2. Categories with available products still show cards identical to pre-phase styling.
3. Sparse grid (1–3 items) uses standard 2/4-column grid without layout hacks.
