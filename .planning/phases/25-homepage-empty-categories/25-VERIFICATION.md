---
phase: 25-homepage-empty-categories
status: human_needed
verified: 2026-05-19
score: 8/8
requirements:
  - HOME-03
---

# Phase 25 Verification

**Status:** human_needed — automated must-haves pass; manual parity checks remain.

## Must-Have Verification

| ID | Truth | Result | Evidence |
|----|-------|--------|----------|
| D-01 | CategoryGrid uses listCategoriesWithProductCounts + categoriesWithAvailableProducts | ✓ | `category-grid.tsx` imports and awaits both |
| D-02 | Available = productCount > 0 from catalog counts | ✓ | `categoriesWithAvailableProducts` + unchanged `buildCatalogContextWhere` |
| D-03 | Filter preserves sortOrder asc | ✓ | `listCategories` order + `preserves input order after filtering` test |
| D-04 | Zero categories → return null | ✓ | `if (categories.length === 0) return null` before section |
| D-05 | h2 only when cards render | ✓ | Coupled with D-04 — section markup after guard |
| D-06 | Sparse grid keeps grid-cols-2 md:grid-cols-4 | ✓ | Classes unchanged in category-grid.tsx |
| D-07 | Cards keep image / «Без фото» / link | ✓ | Card loop unchanged; DTO has image fields |
| D-08 | Tests document contract; build green | ✓ | Targeted tests pass; `npm run build` green |

## Automated Checks

- `npm test -- --run src/lib/catalog/categories.test.ts src/server/services/catalog.service.test.ts` — PASS
- `npm run build` — PASS
- Full `npm test` — 244/245 pass; `prisma/seed.test.ts` out-of-stock count fails (DB state after purge, pre-existing)

## Human Verification

1. After purge/seed: load `/` — if all categories empty, no `#kategorii` block.
2. Compare header category links vs homepage cards — same slugs visible.
3. With 1–3 categories: grid layout unchanged.

## Gaps

None for automated scope.
