# Phase 30: Similar products & footer layout — Research

**Researched:** 2026-05-20  
**Domain:** PDP similar-products query + footer responsive layout (Next.js RSC, Prisma, Tailwind)  
**Confidence:** HIGH (codebase + locked CONTEXT); MEDIUM (tiered fallback edge cases with sparse categories)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Similar products — placement (PDP-07)
- **D-01:** Section **below the main two-column grid** (gallery + product info), **full width** within `max-w-6xl` container — not inside the right column.
- **D-02:** Show **exactly up to 4** similar products (not fewer displayed slots unless fewer exist after fallback).
- **D-03:** **Mobile:** same **2-column grid** as catalog (`grid-cols-2` or existing catalog grid pattern) — not horizontal scroll.
- **D-04:** Reuse full **`ProductCard`** including **wishlist toggle** — same card as `/katalog`.
- **D-05:** Section heading: **«Схожі товари»** (UA, matches requirement id).

#### Similar products — selection logic (PDP-07)
- **D-06:** Same **category** as current product (`categoryId` match).
- **D-07:** **Exclude current product** (`id !== currentProductId`).
- **D-08:** **In-stock only** — `quantity >= 1` (same as public catalog).
- **D-09:** Primary price band: **±20%** of current `price` (kopiyky): `min = floor(price × 0.8)`, `max = ceil(price × 1.2)`.
- **D-10:** **Sort:** **random** order within the final candidate set (shuffle once per server render / request — not client re-shuffle on hydration).
- **D-11:** **Fallback when fewer than 4 matches:**
  1. Widen band to **±40%** (`floor × 0.6`, `ceil × 1.4`), same category, exclude current, in-stock.
  2. If still **< 4**, fill remaining slots from **same category** without price filter (exclude current, in-stock), then random sort and take up to 4.
- **D-12:** If **zero** candidates after all fallbacks → **hide section entirely** (no empty heading).
- **D-13:** New service helper e.g. `listSimilarPublicProducts({ productId, categoryId, price, limit: 4 })` in `catalog.service.ts`; reuse `buildPublicProductWhere` / `mapToCard` / `cardInclude`.

#### Footer layout (FOOT-05)
- **D-14:** **Desktop (`md+`):** two columns — **left: map embed only**; **right: contacts (phones, emails, addresses) + `CallbackRequestForm`** stacked.
- **D-15:** Map column is the **primary visual** on desktop — taller iframe than today (planner tune; suggest `md:min-h-[280px]` or full column height).
- **D-16:** **Copyright row:** `© {year} Техніка б/у Львів` **text-center on desktop (`md:text-center`)**; may stay left-aligned on mobile (Claude discretion — centered on md+ is locked).
- **D-17:** **Mobile:** single-column stack — **contacts → callback form → map** (action-first; map last). Do not regress callback or contact links from Phase 26.
- **D-18:** Keep lazy-loaded iframe, `getPublicStoreContacts()`, existing map URL helpers — **layout-only refactor** in `store-footer.tsx`.

#### Tests & quality
- **D-19:** Vitest for price-band math helper and/or similar-products query (exclude self, band boundaries, fallback steps).
- **D-20:** `npm test` + `npm run build` green; manual: PDP similar section with 4 cards, fallback when sparse category, footer desktop columns + centered ©.

### Claude's Discretion
- Exact map iframe height/aspect on desktop left column.
- Random shuffle implementation (Prisma `orderBy` random vs in-memory shuffle of ≤N rows).
- Whether mobile © is centered or left (desktop center locked).
- Section spacing (`mt-16` / `border-t`) to match PDP rhythm below grid.
- Footer mobile column order fine-tuning if contacts block is empty.

### Deferred Ideas (OUT OF SCOPE)
- **Footer column discussion** — user skipped interactive discuss; locked from FOOT-05 requirement text + Phase 26 assets.
- **Horizontal scroll** for similar products on mobile — user chose catalog-style grid.
- **Compact similar cards** — user chose full ProductCard.
- **Recommendation engine / cross-category similar** — out of scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **PDP-07** | Секція «Схожі товари» — товари тієї ж категорії в ціновому діапазоні ±20% від поточного (виключити поточний товар) | `listSimilarPublicProducts` + tiered ±20% → ±40% → category fill; `ProductGrid`/`ProductCard`; hide when `length === 0`; extend PDP detail with `categoryId` |
| **FOOT-05** | Footer на desktop: дві колонки (карта \| контакти + форма callback); рядок © відцентрований | Restructure `store-footer.tsx` grid + CSS `order` for mobile stack; `md:text-center` on © row; taller map iframe in left column |
</phase_requirements>

## Summary

Phase 30 is a **layout + catalog-query slice** on the existing stack — **no new npm packages**. Two independent workstreams:

1. **PDP-07 — Similar products:** Add a server-side selector in `catalog.service.ts` that gathers in-stock peers in the same category (price bands with fallbacks), shuffles once per request, returns up to four `PublicProductCard` rows, and renders them **below** the PDP two-column grid via reused `ProductGrid` + `ProductCard` (including wishlist when session exists).

2. **FOOT-05 — Footer layout:** Refactor `store-footer.tsx` only — desktop **map left / contacts+form right**, mobile **contacts → form → map**, © **centered from `md+`**. Phase 26 data sources (`getPublicStoreContacts`, `addressMapEmbedSrc`, `CallbackRequestForm`) stay unchanged.

**Primary recommendation:** Export pure `similarPriceBandKopiyky()` for Vitest; implement `listSimilarPublicProducts()` with tiered Prisma queries + in-memory Fisher–Yates shuffle (PostgreSQL pool is small); add `category.id` to `getPublicProductBySlug` payload; wire PDP parallel fetch with `getWishlistedProductIds` like catalog pages; footer uses one `md:grid-cols-2` with `order-*` utilities — no duplicate markup.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Similar product selection & fallbacks | API / Backend (`catalog.service.ts`) | Prisma / PostgreSQL | Business rules and stock filters belong in service layer |
| Price band math | API / Backend (pure helper) | Vitest unit tests | Deterministic kopiyky math must not drift in UI |
| Random ordering | API / Backend (shuffle after query) | — | Locked: server render only; avoids hydration mismatch |
| Similar section UI | Frontend Server (PDP RSC `page.tsx`) | `ProductGrid` (presentational) | Data fetched on server; grid is existing component |
| Wishlist state on similar cards | API (`wishlist.service`) | PDP RSC passes `Set` to grid | Same pattern as `/katalog/[slug]/page.tsx` |
| Footer column layout | Frontend Server (`store-footer.tsx`) | Tailwind responsive utilities | Async RSC; no new endpoints |
| Map embed / contacts / callback | API + existing components | — | Phase 26 assets; layout-only move |

## Technical Approach

### Stack (no installs)

| Piece | Location | Role |
|-------|----------|------|
| Prisma 7.8 + PostgreSQL | `catalog.service.ts` | Tiered `findMany` with `buildPublicProductWhere` + `cardInclude` |
| `ProductGrid` | `src/components/catalog/product-grid.tsx` | `grid-cols-2 md:grid-cols-4` — matches D-03 |
| `ProductCard` | Phase 29 card with wishlist overlay | D-04 |
| `getWishlistedProductIds` | `wishlist.service.ts` | Catalog PDP parity |
| `StoreFooter` | `store-footer.tsx` | FOOT-05 layout refactor |

### `categoryId` gap (must fix in implementation)

`getPublicProductBySlug` today returns `category: { name, slug }` only — **no `categoryId`**. Similar query needs `categoryId` (D-06).

**Prescriptive fix:** Extend category select in `getPublicProductBySlug` to `{ id, name, slug }` and add `id` to `PublicProductCard['category']` type (or a PDP-only extended type). Callers that only use name/slug remain compatible.

### Similar query strategy

Use **progressive pool merge**, not a single wide query:

1. **Pool A:** `buildPublicProductWhere({ categoryId, minPrice, maxPrice })` + `id: { not: productId }` — ±20% bands from `similarPriceBandKopiyky(price, 20)`.
2. If `|pool| < 4`, **Pool B:** same with ±40% bands; merge unique by `id` (exclude A duplicates).
3. If still `< 4`, **Pool C:** category only (no price keys); merge unique; cap fetch with `take: 50` (discretion) to avoid loading huge categories.
4. **Shuffle** merged pool in Node (Fisher–Yates), `slice(0, 4)`, `mapToCard`.
5. Return `[]` if pool empty → PDP omits section (D-12).

**Do not** use client-side shuffle. **Do not** use Prisma `orderBy` random unless raw SQL is introduced — in-memory shuffle on ≤50 rows is simpler and testable [VERIFIED: project pattern — no existing random sort in codebase].

**Random implementation (recommendation):** In-memory shuffle on the merged candidate array before `slice(0, limit)` — satisfies D-10 and works on Vercel serverless without `$queryRaw ORDER BY RANDOM()`.

```typescript
// Pure helper — unit test target
export function similarPriceBandKopiyky(
  priceKop: number,
  band: 20 | 40,
): { minPrice: number; maxPrice: number } {
  if (band === 20) {
    return {
      minPrice: Math.floor(priceKop * 0.8),
      maxPrice: Math.ceil(priceKop * 1.2),
    };
  }
  return {
    minPrice: Math.floor(priceKop * 0.6),
    maxPrice: Math.ceil(priceKop * 1.4),
  };
}
```

### PDP wiring

In `src/app/(storefront)/tovar/[slug]/page.tsx`:

- After `getPublicProductBySlug`, parallelize:
  - `listSimilarPublicProducts({ productId, categoryId: product.category.id, price: product.price, limit: 4 })`
  - `getWishlistedProductIds` when session (existing catalog pattern)
- Keep similar block **inside** the same `max-w-6xl` wrapper, **after** the `md:grid-cols-2` product grid, before closing container.
- Optional `SimilarProductsSection` server component (heading + `ProductGrid`) for readability — not required.

Suggested markup rhythm (discretion on exact classes):

```tsx
{similar.length > 0 ? (
  <section className="mt-16 border-t border-border pt-12">
    <h2 className="text-2xl font-semibold tracking-tight">Схожі товари</h2>
    <div className="mt-6">
      <ProductGrid
        products={similar}
        hasSession={Boolean(session?.user)}
        wishlistedProductIds={wishlistedProductIds}
      />
    </div>
  </section>
) : null}
```

### Footer wiring

Single grid, three logical blocks, responsive `order`:

| Block | Mobile order | Desktop column |
|-------|--------------|------------------|
| Contacts (phones, emails, address links) | 1 | Right, top |
| `CallbackRequestForm` | 2 | Right, below contacts |
| Map iframe | 3 | Left, full height |

```tsx
<div className="grid gap-8 md:grid-cols-2 md:gap-12">
  <div className="order-3 md:order-1 md:row-span-2">
    {/* map only — md:min-h-[280px] md:h-full on iframe */}
  </div>
  <div className="order-1 md:order-2 space-y-6">{/* contacts */}</div>
  <div className="order-2 md:order-2">{/* CallbackRequestForm */}</div>
</div>
<p className="mt-8 ... md:text-center">© {year} Техніка б/у Львів</p>
```

If all contact lists empty, mobile order still valid; map-last preserved (D-17). Empty-state discretion: still show form + map.

## Similar Products Implementation

### Reuse from catalog service [VERIFIED: codebase]

| Asset | Usage |
|-------|--------|
| `buildPublicProductWhere` | `quantity >= 1`, `categoryId`, `minPrice`/`maxPrice` already implemented |
| `cardInclude` | Same image take:5 as list endpoints |
| `mapToCard` | DTO parity with `/katalog` cards |
| `ProductGrid` | Exact grid classes: `grid-cols-2 gap-4 md:grid-cols-4 md:gap-6` |

### `buildPublicProductWhere` extension

Add optional `excludeProductId?: string` **either**:

- As param on `buildPublicProductWhere`, spreading `id: { not: excludeProductId }`, **or**
- Inline in `listSimilarPublicProducts` when composing `where` (smaller diff).

Prefer **inline spread in similar helper** to avoid changing filter semantics for catalog pages (YAGNI).

### Service signature (prescriptive)

```typescript
export async function listSimilarPublicProducts(input: {
  productId: string;
  categoryId: string;
  price: number; // kopiyky
  limit?: number;
}): Promise<PublicProductCard[]>
```

### Anti-patterns

- **Client-side similar fetch:** Breaks RSC SEO pattern and duplicates auth.
- **Re-shuffle on hydration:** Violates D-10.
- **Showing empty «Схожі товари» heading:** Violates D-12.
- **Compact card variant:** Out of scope per CONTEXT.
- **Using `listPublicProducts` pagination:** Wrong abstraction; similar needs tiered merge + exclude self.

## Footer Layout

### Current vs target [VERIFIED: `store-footer.tsx`]

| | Phase 26 (today) | Phase 30 (FOOT-05) |
|--|------------------|---------------------|
| Desktop col 1 | Contacts + map stacked | **Map only** (taller) |
| Desktop col 2 | `CallbackRequestForm` | **Contacts + form** |
| Mobile | Contacts, map, form in col1 then form col2 | **Contacts → form → map** |
| © | Left-aligned | **`md:text-center`** |

### Regression guards (Phase 26)

- `getPublicStoreContacts()` — unchanged
- `uaPhoneTelHref` / `formatUaPhoneDisplay` — unchanged
- `addressExternalMapUrl` / `addressMapEmbedSrc` — unchanged
- `CallbackRequestForm` — same component, new grid cell
- iframe `loading="lazy"` — keep

### Map sizing (discretion)

Today: `h-40 md:h-[200px]`. Recommend desktop left column: `className="h-48 w-full rounded-md border ... md:min-h-[280px] md:h-full"` so map anchors the row visually (D-15).

## Standard Stack

No new packages. Existing versions [VERIFIED: `package.json`]: Next.js 16.2.6, Prisma 7.8, Vitest (via `npm test`), Tailwind 4.x.

## Package Legitimacy Audit

No external installs for this phase.

## Don't Hand-Roll

| Problem | Use instead | Why |
|---------|-------------|-----|
| Product card UI | `ProductCard` + `ProductGrid` | Phase 29 hover/wishlist already shipped |
| Public catalog filters | `buildPublicProductWhere` | Single source for in-stock + price |
| Footer callback | `CallbackRequestForm` | Shared with mobile drawer |
| Map URLs | `store-map.ts` helpers | Tested Phase 26 |

## Common Pitfalls

### Pitfall 1: Hydration mismatch on random order
**What goes wrong:** Client re-randomizes similar cards → React hydration warning.  
**Prevention:** Shuffle only in server function before RSC render (D-10).

### Pitfall 2: Missing `categoryId` on PDP DTO
**What goes wrong:** Extra DB round-trip or wrong category filter.  
**Prevention:** Add `category.id` to `getPublicProductBySlug` include/select.

### Pitfall 3: Footer duplicate map/contacts on mobile
**What goes wrong:** Copy-paste blocks for mobile/desktop → drift.  
**Prevention:** One DOM tree + Tailwind `order-*` / `md:grid-cols-2`.

### Pitfall 4: Similar section inside right column
**What goes wrong:** Narrow column breaks 2×2 mobile grid.  
**Prevention:** Section sibling to `md:grid-cols-2` grid, not child of right column (D-01).

### Pitfall 5: Sparse category shows 1–3 cards with empty slots
**What goes wrong:** User expects 4 slots always.  
**Prevention:** Render only returned cards (D-02 allows fewer when stock scarce); do not pad placeholders.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (`vitest run`) |
| Config | `vitest.config.ts` |
| Quick run | `npm test -- src/server/services/catalog.service.test.ts` |
| Full suite | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PDP-07 | ±20% / ±40% kopiyky bounds | unit | `npm test -- src/server/services/catalog.service.test.ts -t "similarPriceBand"` | ❌ Wave 0 — add describe block |
| PDP-07 | Exclude current product id in where | unit | `npm test -- ... -t "listSimilarPublicProducts"` with mocked prisma | ❌ Wave 0 |
| PDP-07 | Fallback widens band then category-only | unit | Mock sequential `findMany` return counts 1 → 2 → 5 | ❌ Wave 0 |
| PDP-07 | Zero candidates → empty array | unit | All queries return `[]` | ❌ Wave 0 |
| FOOT-05 | Desktop © centered | manual / optional snapshot | Visual check `md:text-center` on © `<p>` | N/A layout |
| FOOT-05 | Mobile order contacts→form→map | manual | Resize viewport < md | N/A |

### Sampling Rate

- **Per task commit:** `npm test -- src/server/services/catalog.service.test.ts`
- **Per wave merge:** `npm test` + `npm run build`
- **Phase gate:** Manual PDP + footer checks per D-20

### Wave 0 Gaps

- [ ] `similarPriceBandKopiyky` tests (20% and 40% edge cases, e.g. price `100_00` → min/max)
- [ ] `listSimilarPublicProducts` tests with `vi.mock("@/lib/db")` following existing `catalog.service.test.ts` style
- [ ] Extend prisma mock with `findMany` if not already chained
- [ ] Optional: extend `PublicProductCard` type test fixtures with `category.id`

**Note:** Full suite currently reports some failures unrelated to this phase (257 passed / 6 failed at research time) — phase completion should not add regressions; fix only if this phase touches failing modules.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | No (read-only similar) | — |
| V4 Access Control | No new mutations | Public catalog same as `/katalog` |
| V5 Input Validation | Low | `productId`/`categoryId` from server-loaded PDP, not user input |
| V5 Input Validation | Yes (footer) | Existing `CallbackRequestForm` + `callbackRequestSchema` unchanged |

### Threat patterns

| Pattern | Mitigation |
|---------|------------|
| IDOR via manipulated similar query | No client-supplied IDs; only PDP-resolved product |
| XSS in footer | Existing React escaping; no `dangerouslySetInnerHTML` |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build/test | ✓ | v24.14.0 | — |
| npm | scripts | ✓ | 11.9.0 | — |
| PostgreSQL (Neon) | Prisma dev/prod | ✓ (project) | 16+ | — |
| Vitest | D-19 | ✓ | 4.x | — |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Sparse category shows 0–3 cards | Medium | Low UX | Accepted by D-02/D-11; hide section if zero |
| Large category fill query slow | Low | Latency on PDP | `take: 50` on category-only query; only when bands sparse |
| `category.id` type ripple | Low | TS errors | Add optional `id` to category type; update mappers |
| Footer mobile order with empty contacts | Low | Odd stack (form→map only) | Accept per discretion; test with seed contacts |
| Pre-existing test failures block CI | Medium | Phase gate noise | Run targeted catalog tests; do not scope-fix unrelated suites unless required |

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/server/services/catalog.service.ts` | **Modify** | `similarPriceBandKopiyky`, `listSimilarPublicProducts` |
| `src/server/services/catalog.service.test.ts` | **Modify** | Unit tests for band + similar list |
| `src/types/catalog.ts` | **Modify** | `category.id` on `PublicProductCard` |
| `src/app/(storefront)/tovar/[slug]/page.tsx` | **Modify** | Fetch similar + render section; wishlist Set |
| `src/components/layout/store-footer.tsx` | **Modify** | FOOT-05 grid/order/©/map height |
| `src/components/catalog/product-grid.tsx` | **Reuse** | No change expected |
| `src/components/catalog/product-card.tsx` | **Reuse** | No change expected |
| `src/components/catalog/similar-products-section.tsx` | **Optional create** | Heading + grid wrapper (planner choice) |

**Do not touch:** `callback-request-form.tsx`, `store-map.ts`, `store-settings.service.ts`, admin routes, Phase 29 gallery/cart FAB unless regression found.

## Code Examples

### Catalog page wishlist pattern (reuse on PDP)

```typescript
// Source: src/app/(storefront)/katalog/[slug]/page.tsx
const wishlistedProductIds = session?.user
  ? new Set(await getWishlistedProductIds(session.user.id))
  : undefined;
```

### ProductGrid grid classes (locked for similar)

```typescript
// Source: src/components/catalog/product-grid.tsx
<div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
```

### buildPublicProductWhere price filter (reuse)

```typescript
// Source: src/server/services/catalog.service.ts
...(filters.minPrice != null || filters.maxPrice != null
  ? {
      price: {
        ...(filters.minPrice != null && { gte: filters.minPrice }),
        ...(filters.maxPrice != null && { lte: filters.maxPrice }),
      },
    }
  : {}),
```

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | In-memory shuffle on ≤50 rows is acceptable for PDP TTFB | Similar Implementation | Slight latency if category huge — cap `take` |
| A2 | Adding `category.id` to public types is non-breaking | Technical Approach | Consumers ignoring extra field — low risk |
| A3 | `md:grid-cols-4` on PDP similar is correct at all breakpoints | Similar | Matches catalog; user locked 2-col mobile |

**Empty assumptions requiring user confirm:** None for locked decisions.

## Open Questions

1. **Extract `similar-products-section.tsx` vs inline in `page.tsx`?**
   - Recommendation: extract if section markup > ~15 lines; otherwise inline (planner discretion).

2. **Category-only query `take` cap?**
   - Recommendation: `50` before shuffle — balances fill rate vs query cost.

## Sources

### Primary (HIGH confidence)
- `.planning/phases/30-similar-products-footer-layout/30-CONTEXT.md` — locked decisions
- `src/server/services/catalog.service.ts` — filters, card mapping
- `src/app/(storefront)/tovar/[slug]/page.tsx` — PDP structure
- `src/components/layout/store-footer.tsx` — current footer
- `src/components/catalog/product-grid.tsx` — grid contract
- `.planning/phases/26-footer-mobile-contact/26-CONTEXT.md` — footer regression baseline

### Secondary
- `.planning/REQUIREMENTS.md` — PDP-07, FOOT-05 text
- `.planning/ROADMAP.md` — Phase 30 success criteria

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new deps
- Architecture: HIGH — mirrors catalog + Phase 26 footer
- Pitfalls: MEDIUM — sparse-category behavior needs manual UAT

**Research date:** 2026-05-20  
**Valid until:** 2026-06-20

## RESEARCH COMPLETE
