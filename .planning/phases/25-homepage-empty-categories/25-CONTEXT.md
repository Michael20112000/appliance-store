# Phase 25: Homepage empty categories - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Filter the homepage **«Категорії»** section (`CategoryGrid` on `/`) so it only renders category cards that have at least one **available** product — same definition as storefront header nav and catalog filters (HOME-03).

Out of scope: mobile drawer product counts (FOOT-04, Phase 26), changing `buildCatalogContextWhere` rules, admin category list, catalog pagination, category images/placeholders (existing behavior stays), footer/contact (Phase 26).

</domain>

<decisions>
## Implementation Decisions

### Data & filter (HOME-03)
- **D-01:** Replace `CategoryGrid`'s raw `prisma.category.findMany` with **`listCategoriesWithProductCounts()`** from `catalog.service`, then **`categoriesWithAvailableProducts(categories)`** — identical pipeline to `StoreHeader` / `catalog-filters`.
- **D-02:** **Available product** means `productCount > 0` where count comes from `getCatalogCategoryCounts()` / `buildCatalogContextWhere()` (published, in-stock catalog rules — no new business logic in this phase).
- **D-03:** Preserve **`sortOrder: "asc"`** from the categories list after filtering (order unchanged from today, minus empty categories).

### Empty & partial UI
- **D-04:** If **zero** categories remain after filter → **do not render the section at all** (no `<section id="kategorii">`, no `h2`, no grid, no empty-state copy). Homepage continues with hero/other blocks only.
- **D-05:** **`h2` «Категорії»** appears only when at least one category card renders (same condition as D-04 — section and heading are coupled).
- **D-06:** When **1–3** categories remain → keep the **existing responsive grid** (`grid-cols-2` / `md:grid-cols-4`). Do not add centering, column-span hacks, or layout variants for sparse grids.

### Cards & links (unchanged)
- **D-07:** Keep current card UI: Cloudinary image or «Без фото», `CardTitle` + «Переглянути», link to `/katalog/{slug}`. No product count badge on homepage cards (not in HOME-03; FOOT-04 is mobile drawer only).

### Tests (ROADMAP)
- **D-08:** Add coverage that documents the filter contract — at minimum extend or add tests so planner can prove empty categories are excluded (unit on filtered list and/or focused test around `CategoryGrid` data path). Existing `categories.test.ts` + catalog tests must stay green; `npm run build` required.

### Claude's Discretion
- Exact test placement (pure function test vs. small component/service wrapper test).
- Whether to extract a shared `getStorefrontCategories()` helper used by header + homepage (only if it reduces duplication without scope creep).
- Minor refactors inside `category-grid.tsx` for readability.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — **HOME-03** (homepage hide empty categories)
- `.planning/ROADMAP.md` — Phase 25 success criteria

### Existing filter & data
- `src/lib/catalog/categories.ts` — `categoriesWithAvailableProducts`
- `src/lib/catalog/categories.test.ts` — filter unit tests
- `src/server/services/catalog.service.ts` — `listCategoriesWithProductCounts`, `getCatalogCategoryCounts`, `buildCatalogContextWhere`
- `src/components/layout/store-header.tsx` — reference implementation (header nav filter)
- `src/components/catalog/catalog-filters.tsx` — same filter on catalog sidebar

### Homepage target
- `src/components/home/category-grid.tsx` — component to change
- `src/app/(storefront)/page.tsx` — renders `CategoryGrid`

### Prior phase boundary
- `.planning/phases/23-admin-category-polish/23-CONTEXT.md` — explicitly deferred storefront category filtering to Phase 25

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `categoriesWithAvailableProducts` — single-line filter; already used in header and catalog filters.
- `listCategoriesWithProductCounts` — returns categories with `productCount` keyed by catalog-visible products.

### Established Patterns
- Server components fetch via `catalog.service`, not ad-hoc Prisma in UI components (header follows this; `CategoryGrid` currently diverges — align it).

### Integration Points
- `CategoryGrid` is async server component on storefront home; swap data source, filter array, early-return `null` when empty before section markup.

</code_context>

<specifics>
## Specific Ideas

Operator expectation: after DB purge/seed, homepage must not show category tiles that lead to empty catalog pages — match header behavior.

</specifics>

<deferred>
## Deferred Ideas

- **FOOT-04** — show `productCount` next to each category in mobile drawer (Phase 26).
- **Sparse grid visual polish** (centered/wider cards when 1–3 categories) — explicitly rejected; keep standard grid.

</deferred>

---

*Phase: 25-homepage-empty-categories*
*Context gathered: 2026-05-19*
