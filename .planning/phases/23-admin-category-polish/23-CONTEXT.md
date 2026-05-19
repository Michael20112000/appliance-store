# Phase 23: Admin category polish - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Polish admin category navigation only: icon affordances on the category edit toolbar (ADM-CAT-03) and a «Товари» column with «Переглянути» link on the category list (ADM-CAT-04). Row-click to open category edit must remain intact (ADM-CAT-02, already shipped).

Out of scope: category CRUD logic, sort order, images, product auto-save (Phase 24), storefront category filtering (Phase 25).

</domain>

<decisions>
## Implementation Decisions

### Edit page toolbar icons (ADM-CAT-03)
- **D-01:** Match list-page pattern: **icon + visible Ukrainian label** (not icon-only). Lucide icons with `aria-hidden` on the icon; button accessible name comes from visible text.
- **D-02:** «Переглянути товари» → `Eye` icon; «Додати товар» → `Plus` icon (same semantics as REQUIREMENTS.md examples).
- **D-03:** Keep existing `Link` targets unchanged: `/admin/tovary?categoryId={id}` and `/admin/tovary/novyi?categoryId={id}`.

### List table «Товари» column (ADM-CAT-04)
- **D-04:** Replace current header **«Товарів»** (count-only) with column **«Товари»** containing a `Link` **«Переглянути»** to `/admin/tovary?categoryId={id}`.
- **D-05:** Show product count as secondary hint in the same cell: muted text `(N)` after the link, e.g. `Переглянути (12)` — operators keep count context without a separate column.
- **D-06:** For **0 products**, still show «Переглянути (0)» — empty filtered list is valid; do not hide or disable the link.

### Row-click vs link (success criterion 3)
- **D-07:** Reuse admin table navigation helpers from `src/lib/admin/clickable-table-row.ts`: link cell calls `stopPropagation` on `click` and `pointerDown`; optional `suppressAdminRowNavigation()` when opening the link (same pattern as `product-list-delete-button.tsx`).
- **D-08:** Do not add a separate «Редагувати» button — row click remains the only edit affordance (ADM-CAT-02).

### Claude's Discretion
User delegated all gray areas («все на твій вибір»). Planner may adjust spacing/size (`size="sm"`) but must not change decisions D-01–D-08.

### Folded Todos
- **BUG-19** (v1.5 intake): `/admin/kategorii/[id]` header buttons lack icons → covered by D-01–D-03.
- **BUG-21** (v1.5 intake): list missing «Товари» / «Переглянути» column → covered by D-04–D-06.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — ADM-CAT-03, ADM-CAT-04
- `.planning/ROADMAP.md` — Phase 23 goal and success criteria
- `.planning/todos/pending/bugfix-intake-2026-05-19-v1.5.md` — BUG-19, BUG-21 operator reports

### Prior shipped admin category UX
- `.planning/milestones/v1.2-REQUIREMENTS.md` — ADM-CAT-01 (Plus on add), ADM-CAT-02 (row-click edit)

### Code touchpoints
- `src/app/(admin)/admin/kategorii/[id]/page.tsx` — edit toolbar buttons
- `src/components/admin/admin-categories-table.tsx` — list table columns + row click
- `src/lib/admin/clickable-table-row.ts` — row navigation + suppressAdminRowNavigation
- `src/lib/admin/products-url.ts` — categoryId query param for `/admin/tovary`
- `src/app/(admin)/admin/tovary/page.tsx` — consumes `categoryId` filter (already works)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AdminCategoriesTable` + `getAdminClickableRowProps` — extend table cell, preserve row `href` to `/admin/kategorii/{id}`
- List header `Button` with `Plus` on `/admin/kategorii` — visual reference for D-01
- `buildAdminProductsListUrl` / `products-url.ts` — use for consistent `categoryId` query strings in tests if needed

### Established Patterns
- `suppressAdminRowNavigation` + `stopPropagation` on interactive cells inside clickable admin rows (products table delete button)
- Server page passes `productCount` from `listCategoriesAdmin` `_count.products` — no new API required for D-05

### Integration Points
- Vitest: extend or add tests for `admin-categories-table` link href and row navigation guard; optional snapshot of edit page markup for icons (lighter: component test if table extracted)

</code_context>

<specifics>
## Specific Ideas

- Operator expectation from intake: icons like Plus/Eye on edit; list link must not break row-click edit (explicit ROADMAP criterion).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

### Reviewed Todos (not folded)
- Other v1.5 intake items (BUG-20, BUG-22, BUG-23) belong to phases 24–26 per ROADMAP.

</deferred>

---

*Phase: 23-Admin category polish*
*Context gathered: 2026-05-19*
