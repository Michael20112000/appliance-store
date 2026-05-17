# Phase 7: Catalog Filters Fix — Research

**Researched:** 2026-05-17  
**Domain:** Catalog price/brand filters — nuqs URL sync, Prisma queries, shadcn Slider, active filter chips  
**Confidence:** HIGH (code audit + locked CONTEXT); MEDIUM (CAT-02 root cause — needs regression test on live parse path)

## Summary

Phase 7 fixes **three buyer-visible catalog bugs** and upgrades price UX. The data layer already supports price `gte`/`lte` in kopiyky (`parsersToFilters` ×100, `buildPublicProductWhere`) and brand filtering — but **`getDistinctBrands()` ignores `categoryId`** (always global brands → CAT-03), and price UX is **number inputs only** (no Slider → CAT-01). **CAT-02** (`?cina-vid=13000` shows cheaper items) is **not explained by obvious logic bugs** in `parsersToFilters` / `buildPublicProductWhere`; most likely failures are **(a)** missing server-side parse regression, **(b)** stale grid if client navigation edge case, or **(c)** test data misunderstanding (UAH vs kopiyky display). Plan must add **Vitest coverage** for `cina-vid`-only filter and a **manual repro checklist**.

**Primary recommendation:** Four plans — (1) service layer + shadcn slider + page wiring, (2) dual-thumb Slider + throttle + mobile sheet, (3) brand URL sanitizer + active chips, (4) Vitest expansion + manual gate doc — preserving URL contract (`cina-vid`, `cina-do`, `brend`, `сторінка`).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| URL filter state | Browser (nuqs `useQueryStates`) | RSC (`catalogSearchParamsCache.parse`) | Client updates URL; server reads on navigation/SSR |
| Product list query | API / DB (Prisma `listPublicProducts`) | RSC pages | Server fetches filtered grid |
| Brand list / price bounds | API / DB (new helpers on `catalog.service`) | RSC passes props to client filters |
| Slider + chips UI | Browser (React client components) | shadcn `slider`, existing tokens |
| Invalid brand strip (D-07-11) | Browser (`useEffect` + `replace`) or RSC redirect | Prefer client to avoid full RSC redirect blink |

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-07-01…07:** shadcn dual-thumb Slider + «від/до» inputs; step **50 ₴**; bounds from min/max AVAILABLE price in context; mobile same Slider; throttle **200 ms** on drag; `сторінка` → 1 on price change.
- **D-07-08…11:** `getDistinctBrands(categoryId?)`; category pages pass `category.id`; preserve `brend` across categories when valid; silent `replace` drop invalid `brend` + `сторінка=1`.
- **D-07-12…13:** Active chips (brand, price range, condition) above grid; nuqs-only state.
- **D-07-14…16:** Vitest for parsers/service; no new Playwright price spec; don't break `e2e/catalog-filters-url.spec.ts`.

### Claude's Discretion

- `getCatalogPriceBounds(categoryId?)` implementation (single `aggregate` min/max).
- D-07-11: client `useEffect` vs server redirect — **recommend client** in `CatalogBrandParamGuard` mounted on category layout/page wrapper.
- Chips component path: `src/components/catalog/active-filter-chips.tsx`.
- Mobile: **no filter sheet exists today** — add `CatalogFiltersSheet` for `<lg` per Phase 2 UI-SPEC, reusing shared `CatalogFiltersPanel` children.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CAT-01 | Price filter via Slider + URL sync | shadcn `slider`; `@radix-ui/react-slider` pattern; throttle via `useRef` + `setTimeout` 200ms |
| CAT-02 | `cina-vid` must filter server-side | Logic present; add test `parsersToFilters` + `buildPublicProductWhere` for vid-only; manual `/katalog?cina-vid=13000` |
| CAT-03 | Category-scoped brands | Change `getDistinctBrands(categoryId?)` with `where: { status, categoryId? }` |

## Current Code Gaps

| File | Gap |
|------|-----|
| `catalog.service.ts` | `getDistinctBrands()` — no `categoryId`; no price bounds helper |
| `katalog/[slug]/page.tsx` | Calls `getDistinctBrands()` without category |
| `catalog-filters.tsx` | Inputs only; no Slider; no `priceBounds` prop |
| `catalog-toolbar.tsx` | No active chips |
| `components/ui/slider.tsx` | **Not installed** |
| Mobile catalog filters | No sheet — sidebar stacks on mobile (acceptable but D-07-04 wants sheet + Slider) |

## CAT-02 Root Cause Analysis

**Observed:** Roadmap success criterion — `/katalog?cina-vid=13000` shows products below 13 000 ₴.

**Code path (expected correct):**

1. `catalogSearchParamsCache.parse` → `cinaVid: 13000` via `parseAsInteger` + urlKey `cina-vid`.
2. `parsersToFilters` → `minPrice: 1_300_000` (kopiyky).
3. `buildPublicProductWhere` → `price: { gte: 1_300_000 }`.

**Ruled out by inspection:**

- Zod `catalogFiltersSchema` accepts `minPrice` integers.
- Price column is **kopiyky** in Prisma; conversion ×100 is consistent with `formatPriceKopiyky`.

**Likely causes to verify in execution:**

1. **No automated test** for `cinaVid` only (null `cinaDo`) — add Vitest.
2. **nuqs server parser** edge case — add test calling `catalogSearchParamsCache.parse` with `{ "cina-vid": "13000" }`.
3. **User sees stale client state** — ensure `shallow: false` on filter `useQueryStates` (already set); full navigation should refetch RSC.
4. **Display vs filter** — confirm seed prices; card shows UAH = kopiyky/100.

**Fix strategy:** Add failing test first if reproducible; if tests pass, manual checklist + optional `export const dynamic = 'force-dynamic'` on catalog pages only if Next cache suspected.

## Standard Stack

| Library | Version | Purpose |
|---------|---------|---------|
| nuqs | 2.8.x (installed) | URL state, `catalogUrlKeys` UA keys |
| shadcn slider | add in phase | Dual-thumb range |
| Prisma | 7.x | `aggregate` min/max price, `distinct` brands |
| Vitest | installed | Unit tests |

### shadcn slider install

```bash
npx shadcn@latest add slider
```

## Architecture Patterns

### Price bounds query

```typescript
// catalog.service.ts — pattern
export async function getCatalogPriceBounds(categoryId?: string) {
  const where = buildPublicProductWhere({ categoryId });
  const agg = await prisma.product.aggregate({
    where,
    _min: { price: true },
    _max: { price: true },
  });
  const minK = agg._min.price;
  const maxK = agg._max.price;
  if (minK == null || maxK == null) return null;
  return {
    minUah: Math.floor(minK / 100),
    maxUah: Math.ceil(maxK / 100),
  };
}
```

Empty catalog: return `null` → UI disables slider (D-07-03).

### getDistinctBrands(categoryId?)

```typescript
export async function getDistinctBrands(categoryId?: string): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: {
      status: PUBLIC_STATUS,
      ...(categoryId && { categoryId }),
    },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });
  return rows.map((r) => r.brand);
}
```

### Slider throttle (200 ms)

Use `useRef` for last commit time; on `onValueChange` update local slider state immediately; call `setParams({ cinaVid, cinaDo, storinka: 1 })` at most every 200ms while dragging; on `onValueCommit` flush immediately.

### D-07-11 invalid brand

Client component on category pages:

```typescript
useEffect(() => {
  if (params.brend && !brands.includes(params.brend)) {
    void setParams({ brend: null, storinka: 1 }, { history: "replace" });
  }
}, [params.brend, brands, setParams]);
```

Pass `brands` from server props (already category-scoped after plan 07-01).

### Active chips

Read same `useQueryStates` parsers; render removable badges:

- Brand: clear `brend`
- Price: clear `cinaVid` + `cinaDo` together
- Each `stan` value: remove from array

Labels: `formatPriceKopiyky` for display; condition via `conditionLabelUa`.

## Validation Architecture

| Requirement | Test Type | Command / Instruction |
|-------------|-----------|------------------------|
| CAT-01 Slider URL | manual | Drag slider → URL has `cina-vid`/`cina-do`, page 1 |
| CAT-02 min price | unit + manual | Vitest `cina-vid` only; browse `/katalog?cina-vid=13000` |
| CAT-03 brands | unit + manual | Category page brand `<select>` has no foreign brands |
| parsersToFilters | unit | `npm test -- search-params` |
| getDistinctBrands | unit | `npm test -- catalog.service` |
| buildPublicProductWhere price | unit | existing + gte-only case |
| URL sync regression | e2e (existing) | `npm run test:e2e -- catalog-filters-url` |

## Plan Structure Recommendation

| Plan | Wave | Focus |
|------|------|-------|
| 07-01 | 1 | `getCatalogPriceBounds`, `getDistinctBrands(categoryId?)`, wire pages, shadcn slider, service tests |
| 07-02 | 2 | Dual-thumb Slider, step 50, throttle 200ms, mobile filter sheet |
| 07-03 | 2 | `CatalogBrandParamGuard`, `active-filter-chips`, toolbar integration |
| 07-04 | 3 | Vitest expansion, `07-MANUAL-CHECKLIST.md`, verify e2e |

## RESEARCH COMPLETE
