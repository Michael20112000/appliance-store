# Phase 29: Product cards & PDP core UX - Context

**Gathered:** 2026-05-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Make catalog cards and PDP feel smooth: **desktop hover** fades through multiple product photos (~3s); **lightbox** swipes without a jerk after release; **PDP cart** shows a clear in-cart state with trash-only removal and no button clutter; **cart FAB** on PDP sits above the existing chat FAB.

**In scope (requirements):** CARD-01, PDP-05, PDP-06 — per `.planning/REQUIREMENTS.md` and ROADMAP Phase 29 success criteria.

**Out of scope:** Similar products block (PDP-07, Phase 30), footer layout (FOOT-05, Phase 30), global cart FAB on all storefront routes, changing wishlist/chat flows beyond FAB stacking, admin work.

</domain>

<decisions>
## Implementation Decisions

### Product card hover (CARD-01)
- **D-01:** Extend **`PublicProductCard`** and catalog list query to include **`images[]`** (up to **5** images, `sortOrder` asc) — not `take: 1` only.
- **D-02:** **Desktop only** (`md:` hover / pointer fine): crossfade rotation every **~3s**; **first image shows immediately** on hover start (no initial delay).
- **D-03:** **Touch / no hover:** **static first image only** — no autoplay, no tap-to-cycle.
- **D-04:** **`prefers-reduced-motion: reduce`:** **no rotation** — first image only (Claude discretion aligned with Phase 28 motion policy).
- **D-05:** Rotation **pauses** when pointer leaves the card; **does not** run when card is not hovered.
- **D-06:** Single-image products: **no rotation logic** — behave as today.

### Lightbox swipe (PDP-05)
- **D-07:** Target feel: **momentum drag + snap** to nearest slide — **no post-release jerk** (tune Embla in `product-gallery.tsx` / shared `carousel.tsx`).
- **D-08:** Keep **loop enabled** in lightbox when multiple images (`loop: true` as today).
- **D-09:** Thumbnail strip + main PDP image behavior **unchanged** unless required for lightbox fix.

### PDP cart state (PDP-06)
- **D-10:** After add, primary control: disabled/secondary button **«Вже в кошику»** (not «У кошику»).
- **D-11:** Remove from cart: **icon-only trash** (`Trash2` or equivalent) beside primary — **no** full-width «Прибрати з кошика» text button.
- **D-12:** **Remove** «Перейти до кошика» from PDP inline actions — navigation via FAB (D-15).
- **D-13:** **No third disabled button row** — max **two** visible controls in cart state (primary + trash); wishlist stays separate.
- **D-14:** Guest + signed-in: same UX; pending localStorage for guests, server cart for session (existing `AddToCartButton` paths).

### Cart FAB on PDP (PDP-06)
- **D-15:** **PDP only** (`/tovar/[slug]`) — not global storefront FAB.
- **D-16:** **Visibility (Claude discretion):** show FAB when **cart count ≥ 1** (server cart line count or guest pending count) — badge shows count; hidden when empty.
- **D-17:** **Guest (Claude discretion):** same FAB — count from **`pending-storage`** (total pending items), link to `/koszyk`.
- **D-18:** **Position:** fixed **above** existing `ChatFab` (`bottom-6 right-6 z-[60]`) — cart FAB ~`bottom-[5.75rem] right-6`, `z-[59]` or coordinated stack so cart sits visually higher; respect `safe-area-inset-bottom`.
- **D-19:** FAB action: **navigate to `/koszyk`** (not add-to-cart); use `ShoppingCart` icon + numeric badge when count > 0.
- **D-20:** `OpenChatButton` on PDP stays inline in content; global `ChatFab` unchanged.

### Tests & quality
- **D-21:** Vitest for `formatCategoryCountBadge already exists; add tests for card image helper / cart button states if extracted.
- **D-22:** `npm test` + `npm run build` green; manual UAT: hover fade desktop, lightbox swipe mobile, PDP cart two-control layout, FAB above chat.

### Claude's Discretion
- Exact crossfade CSS (opacity transition duration ~300–500ms between 3s holds).
- Embla options: `duration`, `dragFree`, `skipSnaps`, `containScroll` tuning for lightbox.
- FAB exact offset px between cart and chat FABs; badge max display (9+).
- Whether list query uses `take: 5` on images relation vs separate field name `previewImages`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements
- `.planning/ROADMAP.md` — Phase 29 goal and success criteria
- `.planning/REQUIREMENTS.md` — CARD-01, PDP-05, PDP-06
- `.planning/PROJECT.md` — v2.0 milestone, Ukrainian UI

### Prior phase (do not regress)
- `.planning/phases/28-nav-homepage-catalog-labels/28-CONTEXT.md` — motion/reduced-motion precedent
- `.planning/phases/20-guest-checkout/20-CONTEXT.md` — guest cart / pending storage (if exists; else `src/lib/cart/pending-storage.ts`)

### Product card & catalog API
- `src/components/catalog/product-card.tsx` — hover target; currently single image
- `src/types/catalog.ts` — `PublicProductCard` shape
- `src/server/services/catalog.service.ts` — list query `images take: 1` → extend to ≤5

### PDP gallery & carousel
- `src/components/catalog/product-gallery.tsx` — lightbox Embla carousel
- `src/components/ui/carousel.tsx` — shared Embla wrapper

### PDP cart & FAB stack
- `src/components/cart/add-to-cart-button.tsx` — refactor in-cart UI
- `src/app/(storefront)/tovar/[slug]/page.tsx` — wire FAB + cart controls
- `src/components/chat/chat-fab.tsx` — existing fixed `bottom-6 right-6 z-[60]`
- `src/components/chat/chat-provider.tsx` — global ChatFab mount
- `src/lib/cart/pending-storage.ts` — guest cart count source

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ProductCard` + `OptimizedImage` + `group-hover:shadow-md` — extend image layer for crossfade stack.
- `ProductGallery` + shadcn `Carousel` (Embla) — lightbox tuning in place.
- `AddToCartButton` — add/remove/session/guest logic; UI-only refactor for PDP-06.
- `ChatFab` — anchor for vertical FAB stack on PDP.

### Established Patterns
- Catalog list uses **`PublicProductCard`** with single `image` — **must extend type + mapper** for CARD-01.
- Cart: **`addToCartAction` / `removeFromCartAction`** + **`pending-storage`** for guests.
- Floating actions: **`fixed bottom-6 right-6`** + high z-index — match for cart FAB offset.

### Integration Points
- `catalog.service.ts` list/select — add up to 5 images per product card.
- `product-card.tsx` — client or CSS-only hover rotation component.
- `add-to-cart-button.tsx` + new `pdp-cart-fab.tsx` (or similar) — PDP page composition.
- Embla opts in `product-gallery.tsx` dialog carousel.

</code_context>

<specifics>
## Specific Ideas

- User confirmed Phase 28 UAT — no changes to Phase 29 scope from that.
- Card hover: **3s interval, first image immediate on hover**, mobile static.
- PDP: **«Вже в кошику» + trash only**, drop «Перейти до кошика».
- Lightbox: **momentum + snap**, keep loop.

</specifics>

<deferred>
## Deferred Ideas

- **PDP-07** similar products — Phase 30.
- **Global cart FAB** on catalog/home — out of scope (PDP-only locked).
- **Tap-to-cycle** images on mobile cards — user chose static.

</deferred>

---

*Phase: 29-product-cards-pdp-core-ux*
*Context gathered: 2026-05-20*
