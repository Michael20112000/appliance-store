# Phase 28: Nav, homepage & catalog labels - Context

**Gathered:** 2026-05-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Polish storefront navigation and catalog copy so buyers orient faster: **mobile drawer** includes auth like the header; **homepage** smooth-scrolls to categories and shows per-category availability counts; **catalog sort** select uses short Ukrainian labels.

**In scope (requirements):** NAV-01, HOME-04, HOME-05, CAT-02 — per `.planning/REQUIREMENTS.md` and ROADMAP Phase 28 success criteria.

**Out of scope:** PDP/card hover (Phase 29), footer layout (Phase 30), admin analytics, changing sort URL keys, brand/filter label sweep beyond sort select, homepage sparse-grid layout changes, drawer category count UX (already Phase 26).

</domain>

<decisions>
## Implementation Decisions

### Mobile drawer auth (NAV-01)
- **D-01:** Keep current drawer order: **categories list** → **separator** → **`CallbackRequestForm`** → **separator** → **auth block**.
- **D-02:** **Guest:** show **«Увійти»** + **«Реєстрація»** (same targets and visual treatment as `StoreHeaderAuth` — text link + primary registration button).
- **D-03:** **Signed-in:** show **«Кабінет»** + **«Вийти»** in the drawer (sign-out same behavior as header).
- **D-04:** Reuse header auth styling/classes; prefer extracting a small shared **`StorefrontAuthLinks`** (or passing `variant="drawer"`) used by `StoreHeaderAuth` and `StoreMobileNav` to avoid drift.
- **D-05:** Pass **session** into `StoreMobileNav` from `StoreHeader` (server) — drawer is client sheet but auth links are static per session snapshot.
- **D-06:** **Desktop header unchanged** — drawer trigger stays `md:hidden`; do not remove auth from header on mobile (user may use either entry).

### Smooth scroll to `#kategorii` (HOME-04)
- **D-07:** Enable **smooth scroll for all storefront routes** — not only hero CTA. Scope via CSS so admin layout is unaffected (e.g. `html:has(#main-content)` where `#main-content` is the storefront layout main id).
- **D-08:** Implementation = **CSS `scroll-behavior: smooth`** on `html` (no global JS scroll hijack for all anchors).
- **D-09:** Compensate **sticky header** on target: add **`scroll-margin-top`** on `#kategorii` (tune to header height — sticky header in `store-header.tsx`).
- **D-10:** **`prefers-reduced-motion: reduce`** → **instant scroll** (disable smooth via `@media (prefers-reduced-motion: reduce) { scroll-behavior: auto; }`).

### Homepage category counts (HOME-05)
- **D-11:** Keep **Phase 25 filter** — only categories with `productCount > 0`; zero-count categories **not rendered** (no change to `categoriesWithAvailableProducts`).
- **D-12:** Show count on each homepage category card: **`Badge`** in the **same row as `CardTitle`**, immediately after the category name (flex row, gap, title truncates if needed).
- **D-13:** Badge content:
  - **`count === 1`** → **`1 товар`** (UA singular, per user).
  - **`count >= 2`** → **digits only** in badge (e.g. `12`) — matches drawer numeric style for multi-item counts.
- **D-14:** Reuse existing **`productCount`** from `listCategoriesWithProductCounts()` — same definition as header/drawer (catalog-visible in-stock rules).
- **D-15:** Keep **«Переглянути»** in `CardDescription`; count is additive, not a replacement for description.

### Catalog sort labels (CAT-02)
- **D-16:** Update **`CATALOG_SORT_LABELS`** to: **`novi` → «Найновіші»**, **`cina-desc` → «Дорожче»**, **`cina-asc` → «Дешевше»** (user choice; note REQUIREMENTS text said «Новіше» — **discussion locks «Найновіші»**).
- **D-17:** **URL sort keys unchanged** (`novi`, `cina-asc`, `cina-desc`) — labels only.
- **D-18:** **Label surface area:** central map in `catalog-labels.ts` + **`catalog-toolbar.tsx`** select items via `catalogSortLabel()`; update **`catalog-labels.test.ts`**. No other catalog strings in this phase (brand/filters out of scope).
- **D-19:** No SEO/title changes unless sort label is duplicated there today (grep shows **only toolbar** — no extra work).

### Tests & quality
- **D-20:** Update `catalog-labels.test.ts` for new sort strings; add/extend test for homepage count badge rendering or a small `formatCategoryCountBadge(count)` helper if extracted.
- **D-21:** `npm test` + `npm run build` green; manual: mobile drawer guest auth, hero → categories scroll, homepage badges, catalog sort labels.

### Claude's Discretion
- Exact `scroll-margin-top` value and whether to use CSS variable tied to header height.
- Shared auth component name/split between header and drawer.
- Whether `count >= 2` badge uses `tabular-nums` like drawer (recommended for alignment).
- Placing smooth-scroll rules in `globals.css` vs storefront-specific CSS module.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements
- `.planning/ROADMAP.md` — Phase 28 goal and success criteria
- `.planning/REQUIREMENTS.md` — NAV-01, HOME-04, HOME-05, CAT-02
- `.planning/PROJECT.md` — v2.0 milestone, Ukrainian UI constraint

### Prior phase decisions (counts & homepage)
- `.planning/phases/25-homepage-empty-categories/25-CONTEXT.md` — empty category filter, no homepage badges then
- `.planning/phases/26-footer-mobile-contact/26-CONTEXT.md` — drawer counts + callback form order

### Mobile nav & auth
- `src/components/layout/store-mobile-nav.tsx` — drawer shell; add auth block
- `src/components/layout/store-header.tsx` — passes categories; add session to mobile nav
- `src/components/layout/store-header-auth.tsx` — auth link patterns to reuse

### Homepage
- `src/components/home/hero-section.tsx` — `href="/#kategorii"`
- `src/components/home/category-grid.tsx` — target for counts + `#kategorii`
- `src/app/(storefront)/layout.tsx` — `#main-content` id for storefront scroll scope

### Catalog sort
- `src/lib/catalog/catalog-labels.ts` — `CATALOG_SORT_LABELS`
- `src/lib/catalog/catalog-labels.test.ts`
- `src/components/catalog/catalog-toolbar.tsx` — sort select UI
- `src/lib/catalog/search-params.ts` — sort enum keys (unchanged)

### Count helpers
- `src/lib/catalog/categories.ts` — `categoriesWithAvailableProducts`
- `src/server/services/catalog.service.ts` — `listCategoriesWithProductCounts`
- `src/lib/catalog/format.ts` — `pluralResultsUa` (reference for UA plural rules; homepage badge uses hybrid rule D-13)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `StoreHeaderAuth` — login/register and cabinet/sign-out patterns.
- `StoreMobileNav` — already renders `productCount` badges for categories; auth block fits below `CallbackRequestForm`.
- `CategoryGrid` — already uses `listCategoriesWithProductCounts` + filter; only UI for count missing.
- `CATALOG_SORT_LABELS` / `catalogSortLabel` — single source for sort copy.
- Storefront `main#main-content` — hook for scoped smooth-scroll CSS without touching admin.

### Established Patterns
- Server header fetches session + categories; client drawer closes on `pathname` change.
- Category availability = `productCount > 0` from catalog service (locked v1.5).
- shadcn `Badge variant="secondary"` + muted text in drawer for counts.

### Integration Points
- `StoreHeader` → pass `session` + keep `availableCategories` for `StoreMobileNav`.
- Global CSS or storefront stylesheet for `scroll-behavior` + `#kategorii` scroll-margin.
- `category-grid.tsx` — flex row title + badge per card.

</code_context>

<specifics>
## Specific Ideas

- Drawer must keep **everything that exists today** plus auth at the bottom — not a redesign of category/callback sections.
- Sort labels explicitly **«Найновіші»**, «Дорожче», «Дешевше» (not «Новіші» / «Ціна ↑↓»).
- Homepage count: **«1 товар»** for singular; **numeric-only badge** for 2+ to stay consistent with drawer for larger counts.

</specifics>

<deferred>
## Deferred Ideas

- Shortening brand filter label «Усі бренди» / other `catalog-labels` strings — user limited phase to CAT-02 sort only.
- Removing duplicate mobile header auth — user chose to keep header as-is.
- Changing REQUIREMENTS wording «Новіше» → «Найновіші» in REQUIREMENTS.md — optional doc sync in plan, not blocking implementation.

</deferred>

---

*Phase: 28-nav-homepage-catalog-labels*
*Context gathered: 2026-05-20*
