---
phase: 07-catalog-filters-fix
reviewed: 2026-05-17T18:00:00Z
depth: standard
files_reviewed: 12
files_reviewed_list:
  - src/app/(storefront)/katalog/[slug]/page.tsx
  - src/app/(storefront)/katalog/page.tsx
  - src/components/catalog/active-filter-chips.tsx
  - src/components/catalog/catalog-brand-param-guard.tsx
  - src/components/catalog/catalog-filters-sheet.tsx
  - src/components/catalog/catalog-filters.tsx
  - src/components/catalog/catalog-toolbar.tsx
  - src/components/ui/slider.tsx
  - src/lib/catalog/search-params.test.ts
  - src/lib/catalog/throttle.ts
  - src/server/services/catalog.service.test.ts
  - src/server/services/catalog.service.ts
findings:
  critical: 1
  warning: 6
  info: 2
  total: 9
status: issues
---

# Phase 7: Code Review Report

**Reviewed:** 2026-05-17T18:00:00Z  
**Depth:** standard  
**Files Reviewed:** 12 (commits `f207eff^..318dae9`, plans 07-01–07-04)  
**Status:** issues

## Summary

Phase 7 delivers context-scoped brands/price bounds, dual-thumb slider with throttled URL sync, mobile filter sheet, category brand guard, and active filter chips. Service-layer price mapping and Vitest coverage look sound. The main risks are **client-only normalization** (URL thumbs and invalid `brend` on SSR) and **slider vs. one-sided price inputs** fighting each other. No injection/hardcoded-secret issues found in reviewed files.

## Critical Issues

### CR-01: URL price thumbs not clamped or normalized before Slider render

**File:** `src/components/catalog/catalog-filters.tsx:55-61`, `86-90`  
**Issue:** `thumbValuesFromParams` returns raw URL values (only substituting `null` with bounds endpoints). Values below `bounds.minUah`, above `bounds.maxUah`, or inverted (`cinaVid > cinaDo`) are passed straight to the controlled `Slider`. `normalizeThumbRange` runs only on drag/commit, not on derived display state. Crafted or stale URLs (e.g. `?cina-vid=1&cina-do=999999` on a 100–5000 ₴ catalog) produce thumbs outside the track or crossed handles while the server still filters on those raw values.

**Fix:**
```typescript
function thumbValuesFromParams(
  cinaVid: number | null,
  cinaDo: number | null,
  bounds: PriceBounds,
): [number, number] {
  const low = cinaVid ?? bounds.minUah;
  const high = cinaDo ?? bounds.maxUah;
  return normalizeThumbRange([low, high], bounds);
}
```

## Warnings

### WR-01: Slider drag always sets both `cina-vid` and `cina-do`, undoing one-sided filters

**File:** `src/components/catalog/catalog-filters.tsx:97-101`, `211-217`  
**Issue:** `syncPriceToUrl` always writes `{ cinaVid, cinaDo }`. Manual inputs and Vitest explicitly support min-only / max-only (`search-params.test.ts`). After a user sets only `cina-vid` via the «Від» field, any slider movement reintroduces `cina-do` at the max thumb, changing filter semantics without clear UX feedback.

**Fix:** On slider updates, preserve `null` for a bound the user cleared (track “touched” sides), or only write the bound(s) whose thumb moved; document dual-bound-only behavior if intentional.

### WR-02: Price inputs desync from slider while dragging

**File:** `src/components/catalog/catalog-filters.tsx:86-90`, `236-247`  
**Issue:** During drag, `thumbValues` uses `dragValues`, but number inputs bind to `params.cinaVid` / `params.cinaDo` (URL), which update on a 200ms throttle. Users see thumbs move while «Від»/«До» stay stale until throttle/commit.

**Fix:** Drive input `value` from the same derived source as the slider (`dragValues ?? URL`), or show formatted thumb values during drag.

### WR-03: Invalid `brend` applied on SSR before client guard strips it

**File:** `src/app/(storefront)/katalog/[slug]/page.tsx:56-72`, `src/components/catalog/catalog-brand-param-guard.tsx:17-21`  
**Issue:** Server `listPublicProducts` runs with crafted `brend` not in `brands`. First paint can show an empty grid or wrong count; `CatalogBrandParamGuard` clears `brend` only after hydration (`history: 'replace'`). Contradicts D-07-11 intent (“grid without brand filter”) on first paint.

**Fix:** Strip invalid `brend` in the server page before `parsersToFilters` / `listPublicProducts`, or pass `brand` only when `brands.includes(parsed.brend)`.

### WR-04: Two `CatalogFiltersPanel` instances mount on every viewport

**File:** `src/app/(storefront)/katalog/page.tsx:63-73`, `src/components/catalog/catalog-filters-sheet.tsx:38-39`  
**Issue:** Desktop aside and mobile sheet each mount a full panel (separate `useQueryStates`, throttles, sliders). Hidden panel stays mounted (`lg:hidden` / `hidden lg:block`), doubling client work and raising risk of duplicate side effects if both panels ever receive input.

**Fix:** Single panel instance portaled into sheet on mobile, or lazy-mount sheet content when `open === true`.

### WR-05: Non-finite input can write `NaN` into URL state

**File:** `src/components/catalog/catalog-filters.tsx:112-127`, `129-144`  
**Issue:** `handleMinInput` / `handleMaxInput` call `Number(raw)` without `Number.isFinite` guard. Invalid text yields `NaN`, which flows through `clampPrice` / `setParams`. Behavior depends on nuqs serialization; can leave price filter stuck until reset.

**Fix:**
```typescript
const parsed = Number(raw);
if (!Number.isFinite(parsed)) return;
```

### WR-06: Category sidebar links drop all filter query params (D-07-10 open)

**File:** `src/components/catalog/catalog-filters.tsx:152-172`  
**Issue:** Category `Link` hrefs are path-only (`/katalog/${cat.slug}`). Valid `brend`, price, and `stan` are lost on category change. Documented deferral, but ROADMAP D-07-10 is still unmet and surprises users who expect filters to persist.

**Fix:** Build hrefs with `createSerializer(catalogParsers)` and preserve params when the brand exists in the target category list.

## Info

### IN-01: Active filter list missing `role="listitem"`

**File:** `src/components/catalog/active-filter-chips.tsx:64-93`  
**Issue:** Container uses `role="list"` but chips are not `role="listitem"`, weakening screen-reader structure.

**Fix:** Add `role="listitem"` on each chip wrapper or drop `role="list"`.

### IN-02: Non-null assertion in `priceChipLabel` fallback branch

**File:** `src/components/catalog/active-filter-chips.tsx:22`  
**Issue:** `cinaDo!` is safe given `hasPrice` but brittle if call sites change.

**Fix:** Early-return when `cinaDo == null` in the «до» branch.

---

_Reviewed: 2026-05-17T18:00:00Z_  
_Reviewer: Claude (gsd-code-reviewer)_  
_Depth: standard_
