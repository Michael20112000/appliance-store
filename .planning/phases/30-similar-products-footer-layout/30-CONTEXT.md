# Phase 30: Similar products & footer layout - Context

**Gathered:** 2026-05-20
**Status:** Ready for planning

<domain>
## Phase Boundary

PDP gets a **«Схожі товари»** section to help buyers compare alternatives; storefront **footer** on desktop is reorganized per FOOT-05.

**In scope (requirements):** PDP-07, FOOT-05 — per `.planning/REQUIREMENTS.md` and ROADMAP Phase 30 success criteria.

**Out of scope:** Changing similar-products algorithm beyond category + price band (no ML/recommendations), global footer copy changes, admin settings CRUD, mobile drawer, PDP cart/lightbox/card hover (Phase 29), analytics, new callback features.

</domain>

<decisions>
## Implementation Decisions

### Similar products — placement (PDP-07)
- **D-01:** Section **below the main two-column grid** (gallery + product info), **full width** within `max-w-6xl` container — not inside the right column.
- **D-02:** Show **exactly up to 4** similar products (not fewer displayed slots unless fewer exist after fallback).
- **D-03:** **Mobile:** same **2-column grid** as catalog (`grid-cols-2` or existing catalog grid pattern) — not horizontal scroll.
- **D-04:** Reuse full **`ProductCard`** including **wishlist toggle** — same card as `/katalog`.
- **D-05:** Section heading: **«Схожі товари»** (UA, matches requirement id).

### Similar products — selection logic (PDP-07)
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

### Footer layout (FOOT-05)
- **D-14:** **Desktop (`md+`):** two columns — **left: map embed only**; **right: contacts (phones, emails, addresses) + `CallbackRequestForm`** stacked.
- **D-15:** Map column is the **primary visual** on desktop — taller iframe than today (planner tune; suggest `md:min-h-[280px]` or full column height).
- **D-16:** **Copyright row:** `© {year} Техніка б/у Львів` **text-center on desktop (`md:text-center`)**; may stay left-aligned on mobile (Claude discretion — centered on md+ is locked).
- **D-17:** **Mobile:** single-column stack — **contacts → callback form → map** (action-first; map last). Do not regress callback or contact links from Phase 26.
- **D-18:** Keep lazy-loaded iframe, `getPublicStoreContacts()`, existing map URL helpers — **layout-only refactor** in `store-footer.tsx`.

### Tests & quality
- **D-19:** Vitest for price-band math helper and/or similar-products query (exclude self, band boundaries, fallback steps).
- **D-20:** `npm test` + `npm run build` green; manual: PDP similar section with 4 cards, fallback when sparse category, footer desktop columns + centered ©.

### Claude's Discretion
- Exact map iframe height/aspect on desktop left column.
- Random shuffle implementation (Prisma `orderBy` random vs in-memory shuffle of ≤N rows).
- Whether mobile © is centered or left (desktop center locked).
- Section spacing (`mt-16` / `border-t`) to match PDP rhythm below grid.
- Footer mobile column order fine-tuning if contacts block is empty.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements
- `.planning/ROADMAP.md` — Phase 30 goal and success criteria
- `.planning/REQUIREMENTS.md` — PDP-07, FOOT-05
- `.planning/PROJECT.md` — v2.0 milestone, Ukrainian UI

### Prior phases (do not regress)
- `.planning/phases/29-product-cards-pdp-core-ux/29-CONTEXT.md` — ProductCard, previewImages, PDP FAB
- `.planning/phases/26-footer-mobile-contact/26-CONTEXT.md` — contacts DB, callback form, map embed (layout superseded on desktop by D-14)

### Similar products
- `src/app/(storefront)/tovar/[slug]/page.tsx` — wire similar section below grid
- `src/server/services/catalog.service.ts` — `listPublicProducts`, `buildPublicProductWhere`, `mapToCard`, `cardInclude`
- `src/components/catalog/product-card.tsx` — reuse for similar grid
- `src/types/catalog.ts` — `PublicProductCard`, `CatalogFilters` (minPrice/maxPrice)

### Footer
- `src/components/layout/store-footer.tsx` — column restructure
- `src/components/layout/callback-request-form.tsx` — right column on desktop
- `src/lib/catalog/store-map.ts` — `addressMapEmbedSrc`, `addressExternalMapUrl`
- `src/server/services/store-settings.service.ts` — `getPublicStoreContacts`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ProductCard` + `ProductCardImageStack` — Phase 29 card with multi-image hover.
- `listPublicProducts` + `buildPublicProductWhere` — price min/max filters already exist.
- `StoreFooter` — two-column grid today (contacts+map | form); needs column content swap per FOOT-05.
- `CallbackRequestForm` — shared footer/drawer component, moves to right column with contacts.

### Established Patterns
- Public catalog: in-stock `quantity >= 1`, prices in kopiyky.
- PDP is RSC; similar products fetched server-side on page load.
- Footer is async server component reading DB contacts.

### Integration Points
- New `listSimilarPublicProducts` (or equivalent) called from PDP page after `getPublicProductBySlug`.
- New `SimilarProductsSection` (or inline section) below main grid in `page.tsx`.
- `store-footer.tsx` grid template: map column | contacts+form column; © row styling.

</code_context>

<specifics>
## Specific Ideas

- Similar section feels like catalog grid — 4 cards, full ProductCard with wishlist.
- Random order for variety on repeat visits.
- Fallback: ±20% → ±40% → whole category so section usually fills when category has enough SKUs.
- Footer desktop: map left (visual anchor), contacts + callback right, © centered.

</specifics>

<deferred>
## Deferred Ideas

- **Footer column discussion** — user skipped interactive discuss; locked from FOOT-05 requirement text + Phase 26 assets.
- **Horizontal scroll** for similar products on mobile — user chose catalog-style grid.
- **Compact similar cards** — user chose full ProductCard.
- **Recommendation engine / cross-category similar** — out of scope.

</deferred>

---

*Phase: 30-similar-products-footer-layout*
*Context gathered: 2026-05-20*
