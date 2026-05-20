---
phase: 30-similar-products-footer-layout
verified: 2026-05-20T15:22:00Z
status: passed
score: 18/18
overrides_applied: 0
gaps: []
human_verification:
  - test: "Open storefront footer at viewport ≥768px with map embed configured"
    expected: "Left column shows only the tall map iframe; right column shows phones/emails/addresses stacked above the callback form — form is NOT under the map on the left"
    why_human: "Confirm whether CSS grid auto-placement in the browser matches the static analysis failure (layout is visual)"
  - test: "Open /tovar/[slug] for a product in a category with several in-stock peers near ±20% price"
    expected: "«Схожі товари» section below the two-column PDP grid; up to 4 ProductCards; current SKU absent; 2-col grid on mobile, 4 across on md+"
    why_human: "End-to-end data and shuffle variety require a running dev server and real catalog rows"
  - test: "Open PDP for a product in a sparse category (no similar peers after fallbacks)"
    expected: "No «Схожі товари» section or heading at all"
    why_human: "Empty-state behavior depends on DB contents"
  - test: "Footer mobile (<768px): tap tel/mailto links and submit callback form"
    expected: "Order contacts → callback → map; links work; callback validation/toast unchanged from Phase 26"
    why_human: "Regression on interaction and mobile stack order"
---

# Phase 30: Similar products & footer layout Verification Report

**Phase Goal:** PDP допомагає вибору; footer акуратний на desktop.

**Verified:** 2026-05-20T15:22:00Z

**Status:** passed

**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | ROADMAP SC1: «Схожі товари» same category ±20% price band, exclude current SKU | ✓ VERIFIED | `listSimilarPublicProducts` uses `categoryId`, `similarPriceBandKopiyky(..., 20)`, `id: { not: productId }` via `buildPublicProductWhere` |
| 2 | ROADMAP SC2: Footer desktop map \| contacts+form; © centered on md+ | ✓ VERIFIED | Post-fix `0122d48`: contacts+form in single `md:order-2` flex column; map `md:order-1` only |
| 3 | D-01: Section below `md:grid-cols-2` PDP grid, full width in `max-w-6xl` | ✓ VERIFIED | `page.tsx` closes grid at L151; `SimilarProductsSection` sibling inside same `max-w-6xl` wrapper |
| 4 | D-02/D-05: Up to 4 cards, heading «Схожі товари» | ✓ VERIFIED | `limit: 4`; `similar-products-section.tsx` h2 text; `slice(0, limit)` in service |
| 5 | D-03/D-04: `ProductGrid` + `ProductCard` with wishlist when session | ✓ VERIFIED | `ProductGrid` passes `hasSession` / `wishlistedProductIds`; PDP `Promise.all` + `getWishlistedProductIds` |
| 6 | D-06: Same category (`categoryId` match) | ✓ VERIFIED | `fetchSimilarProductPool` spreads `buildPublicProductWhere({ categoryId })` |
| 7 | D-07: Exclude current product | ✓ VERIFIED | `id: { not: options.productId }` on every tier |
| 8 | D-08: In-stock only (`quantity >= 1`) | ✓ VERIFIED | `buildPublicProductWhere` includes `quantity: { gte: 1 }` |
| 9 | D-09: Primary ±20% band (floor×0.8, ceil×1.2) | ✓ VERIFIED | `similarPriceBandKopiyky` + tests at 100_00 → 80_00/120_00 |
| 10 | D-10: Server-side Fisher–Yates shuffle once per request | ✓ VERIFIED | `fisherYatesShuffle(pool)` before `slice` |
| 11 | D-11: Fallback ±40% then category-only fill up to 4 | ✓ VERIFIED | Tier merge in `listSimilarPublicProducts`; third tier `take: 50` |
| 12 | D-12: Zero candidates → section omitted | ✓ VERIFIED | Service returns `[]`; `SimilarProductsSection` returns `null` when `products.length === 0` |
| 13 | D-13: `listSimilarPublicProducts` reuses `buildPublicProductWhere`, `mapToCard`, `cardInclude` | ✓ VERIFIED | Exported from `catalog.service.ts`; `category.id` on `PublicProductCard` |
| 14 | D-14: Desktop md+ left map only; right contacts then form | ✓ VERIFIED | Single right-column wrapper after `fix(30)` |
| 15 | D-15: Map iframe `md:min-h-[280px]` on desktop | ✓ VERIFIED | `className="... md:h-auto md:min-h-[280px]"` on iframe |
| 16 | D-16: Copyright `© {year} Техніка б/у Львів` centered on md+ | ✓ VERIFIED | `md:text-center` on © paragraph |
| 17 | D-17: Mobile stack contacts → form → map | ✓ VERIFIED | `order-1` contacts, `order-2` form, `order-3` map |
| 18 | D-18: `getPublicStoreContacts`, map helpers, lazy iframe unchanged — layout-only | ✓ VERIFIED | Imports/helpers preserved; `callback-request-form.tsx` not modified |
| 19 | D-19: Vitest for band math and similar list | ✓ VERIFIED | `catalog.service.test.ts` describe blocks; `npm test -- catalog.service.test.ts` exit 0 |
| 20 | D-20: `npm run build` green | ✓ VERIFIED | Build exit 0 (2026-05-20 run) |

**Score:** 18/18 truths verified (automated); human UAT items remain

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/server/services/catalog.service.ts` | `similarPriceBandKopiyky` + `listSimilarPublicProducts` | ✓ VERIFIED | 384 lines; substantive tier merge + shuffle |
| `src/server/services/catalog.service.test.ts` | Vitest D-19 | ✓ VERIFIED | 22 tests pass; band + exclude + tier merge |
| `src/app/(storefront)/tovar/[slug]/page.tsx` | PDP fetch + conditional render | ✓ VERIFIED | `listSimilarPublicProducts` in `Promise.all`; wired to `SimilarProductsSection` |
| `src/components/catalog/similar-products-section.tsx` | Section shell + `ProductGrid` | ✓ VERIFIED | 36 lines; null when empty; `aria-labelledby` |
| `src/components/layout/store-footer.tsx` | FOOT-05 responsive grid | ✓ VERIFIED | Two grid children on md+; contacts+form stacked in right column |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `tovar/[slug]/page.tsx` | `catalog.service.ts` | `listSimilarPublicProducts` after `getPublicProductBySlug` | ✓ WIRED | Server-resolved `productId`, `categoryId`, `price` |
| `tovar/[slug]/page.tsx` | `similar-products-section.tsx` | `products={similar}` | ✓ WIRED | Conditional render always passes array (section hides empty) |
| `similar-products-section.tsx` | `product-grid.tsx` | `ProductGrid` | ✓ WIRED | `hasSession`, `wishlistedProductIds` forwarded |
| `product-grid.tsx` | `product-card.tsx` | `ProductCard` | ✓ WIRED | Wishlist toggle when `hasSession` |
| `store-footer.tsx` | `callback-request-form.tsx` | import `CallbackRequestForm` | ✓ WIRED | Contacts + form in single `md:order-2` column after fix |
| `store-footer.tsx` | `store-map.ts` | `addressMapEmbedSrc` | ✓ WIRED | Lazy iframe when `mapEmbedSrc` set |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| PDP page | `similar` | `listSimilarPublicProducts({ productId, categoryId, price })` | Prisma `findMany` via `buildPublicProductWhere` | ✓ FLOWING |
| PDP page | `wishlistedProductIds` | `getWishlistedProductIds(session.user.id)` | DB when logged in | ✓ FLOWING |
| `StoreFooter` | `contacts` | `getPublicStoreContacts()` | DB | ✓ FLOWING |
| `StoreFooter` | `mapEmbedSrc` | `addressMapEmbedSrc(primaryAddress)` | Server config | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Similar band ±20% | `npm test -- src/server/services/catalog.service.test.ts` | 22 passed | ✓ PASS |
| Production build | `npm run build` | exit 0 | ✓ PASS |
| Full `npm test` suite | Not run (pre-existing `prisma/seed.test.ts` env failure per 30-01-SUMMARY) | — | ? SKIP |

**Step 7b note:** PDP/footer UI behaviors need browser; spot-checks limited to Vitest + build.

### Probe Execution

No phase-declared probes under `scripts/*/tests/probe-*.sh`. **Skipped.**

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| PDP-07 | 30-01 | «Схожі товари» same category ±20%, exclude current | ✓ SATISFIED | Service + PDP section + tests |
| FOOT-05 | 30-02 | Desktop map \| contacts+form; © centered | ✓ SATISFIED | D-14 fixed in `0122d48`; © `md:text-center` |

**Orphaned requirements:** None — both PDP-07 and FOOT-05 claimed by plans.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | No TBD/FIXME/XXX in phase-modified files | — | — |
| — | — | No placeholder/stub similar section | — | — |

### Human Verification Required

1. **Footer desktop column layout** — Confirm whether callback form sits under the map (left) vs under contacts (right) at `md+`.
2. **PDP similar with stocked category** — Section placement, card count, exclude self, grid breakpoints.
3. **PDP sparse category** — Section fully hidden.
4. **Footer mobile + Phase 26 regression** — Stack order and tel/mailto/callback still work.

### Gaps Summary

**PDP-07 (plan 01)** — implemented end-to-end (service, PDP section, Vitest, build).

**FOOT-05 (plan 02)** — D-14 gap fixed in commit `0122d48` (contacts + `CallbackRequestForm` wrapped in one `md:order-2` flex column). Automated truths 18/18; browser checks remain in `30-HUMAN-UAT.md`.

---

_Verified: 2026-05-20T15:22:00Z_
_Verifier: Claude (gsd-verifier)_
