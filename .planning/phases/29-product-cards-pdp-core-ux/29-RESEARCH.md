# Phase 29: Product cards & PDP core UX — Research

**Researched:** 2026-05-20  
**Domain:** Storefront catalog cards, PDP gallery (Embla), PDP cart controls, fixed FAB stacking  
**Confidence:** HIGH (codebase + locked CONTEXT); MEDIUM (Embla jerk tuning — needs manual mobile UAT)

## Summary

Phase 29 is a **vertical UX slice** on existing Next.js 16 / React 19 / Prisma / shadcn stack — **no new npm packages**. Three workstreams share one theme: **motion and cart clarity on the path to purchase**.

**CARD-01** requires extending the catalog list API from **one image** (`cardInclude.images take: 1`) to **up to five** ordered previews, then a **desktop-only hover rotator** on `ProductCard` with ~3s holds and ~300–500ms crossfades. Touch and `prefers-reduced-motion` stay on the first image only (aligned with Phase 28 globals).

**PDP-05** tunes the **lightbox** Embla instance in `product-gallery.tsx` (not the thumbnail strip) for **snap-after-drag** without post-release jerk, keeping `loop: true` for multi-image products.

**PDP-06** refactors `AddToCartButton` in-cart UI to **«Вже в кошику» + icon-only trash** (max two controls), removes **«Перейти до кошика»**, and adds a **PDP-only cart FAB** stacked above `ChatFab`, visible when cart count ≥ 1 (guest: `pending-storage` + `CART_CHANGED_EVENT`; signed-in: `getCartItemCount` + `router.refresh()`).

**Primary recommendation:** Extend types/query first (`PublicProductCard` + `mapToCard`), add a small **client** `ProductCardImageRotator`, tune **lightbox-only** Embla opts (`dragFree: false`, `containScroll: false`, keep loop), extract **`PdpCartFab`** mirroring `GuestCartNavLink` badge patterns, and gate FAB count with existing cart events.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Product card hover (CARD-01)
- **D-01:** Extend **`PublicProductCard`** and catalog list query to include **`images[]`** (up to **5** images, `sortOrder` asc) — not `take: 1` only.
- **D-02:** **Desktop only** (`md:` hover / pointer fine): crossfade rotation every **~3s**; **first image shows immediately** on hover start (no initial delay).
- **D-03:** **Touch / no hover:** **static first image only** — no autoplay, no tap-to-cycle.
- **D-04:** **`prefers-reduced-motion: reduce`:** **no rotation** — first image only (Claude discretion aligned with Phase 28 motion policy).
- **D-05:** Rotation **pauses** when pointer leaves the card; **does not** run when card is not hovered.
- **D-06:** Single-image products: **no rotation logic** — behave as today.

#### Lightbox swipe (PDP-05)
- **D-07:** Target feel: **momentum drag + snap** to nearest slide — **no post-release jerk** (tune Embla in `product-gallery.tsx` / shared `carousel.tsx`).
- **D-08:** Keep **loop enabled** in lightbox when multiple images (`loop: true` as today).
- **D-09:** Thumbnail strip + main PDP image behavior **unchanged** unless required for lightbox fix.

#### PDP cart state (PDP-06)
- **D-10:** After add, primary control: disabled/secondary button **«Вже в кошику»** (not «У кошику»).
- **D-11:** Remove from cart: **icon-only trash** (`Trash2` or equivalent) beside primary — **no** full-width «Прибрати з кошика» text button.
- **D-12:** **Remove** «Перейти до кошика» from PDP inline actions — navigation via FAB (D-15).
- **D-13:** **No third disabled button row** — max **two** visible controls in cart state (primary + trash); wishlist stays separate.
- **D-14:** Guest + signed-in: same UX; pending localStorage for guests, server cart for session (existing `AddToCartButton` paths).

#### Cart FAB on PDP (PDP-06)
- **D-15:** **PDP only** (`/tovar/[slug]`) — not global storefront FAB.
- **D-16:** **Visibility (Claude discretion):** show FAB when **cart count ≥ 1** (server cart line count or guest pending count) — badge shows count; hidden when empty.
- **D-17:** **Guest (Claude discretion):** same FAB — count from **`pending-storage`** (total pending items), link to `/koszyk`.
- **D-18:** **Position:** fixed **above** existing `ChatFab` (`bottom-6 right-6 z-[60]`) — cart FAB ~`bottom-[5.75rem] right-6`, `z-[59]` or coordinated stack so cart sits visually higher; respect `safe-area-inset-bottom`.
- **D-19:** FAB action: **navigate to `/koszyk`** (not add-to-cart); use `ShoppingCart` icon + numeric badge when count > 0.
- **D-20:** `OpenChatButton` on PDP stays inline in content; global `ChatFab` unchanged.

#### Tests & quality
- **D-21:** Vitest for `formatCategoryCountBadge` already exists; add tests for card image helper / cart button states if extracted.
- **D-22:** `npm test` + `npm run build` green; manual UAT: hover fade desktop, lightbox swipe mobile, PDP cart two-control layout, FAB above chat.

### Claude's Discretion
- Exact crossfade CSS (opacity transition duration ~300–500ms between 3s holds).
- Embla options: `duration`, `dragFree`, `skipSnaps`, `containScroll` tuning for lightbox.
- FAB exact offset px between cart and chat FABs; badge max display (9+).
- Whether list query uses `take: 5` on images relation vs separate field name `previewImages`.

### Deferred Ideas (OUT OF SCOPE)
- **PDP-07** similar products — Phase 30.
- **Global cart FAB** on catalog/home — out of scope (PDP-only locked).
- **Tap-to-cycle** images on mobile cards — user chose static.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CARD-01 | Desktop hover on multi-image card — smooth fade rotation ~3s per image | Extend `cardInclude` to `take: 5`; add `images[]` on `PublicProductCard`; client rotator with hover + reduced-motion gates; keep `image` as first for compat |
| PDP-05 | Lightbox slider: smooth swipe, no jerk after finger release | Lightbox-only Embla opts: default snap (`dragFree: false`), `containScroll: false` with loop; avoid changing thumbnail carousel; manual mobile UAT |
| PDP-06 | «Вже в кошику» + trash icon; no separate remove CTA; cart FAB above chat | Refactor `AddToCartButton` in-cart branch; new `PdpCartFab` on PDP page; reuse `getPendingItemCount` / `getCartItemCount` + badge `9+` pattern from nav links |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Multi-image card data | API / Backend (`catalog.service`) | Types (`catalog.ts`) | Images come from Prisma `include`; card UI only consumes DTO |
| Hover image rotation | Browser (client component) | CSS (`prefers-reduced-motion`, `@media (hover: hover)`) | Timers and hover state are client-only; no SSR autoplay |
| Lightbox swipe physics | Browser (Embla in `product-gallery`) | — | Drag/snap is viewport interaction |
| PDP in-cart controls | Browser (`add-to-cart-button`) | Server Actions (existing cart actions) | UI refactor; mutations unchanged |
| PDP cart FAB visibility/count | Browser (`pdp-cart-fab`) | SSR initial count from `page.tsx` | Guest count is localStorage; session count from server prop + `router.refresh()` |
| Chat FAB position | Browser (`chat-fab`) | — | Unchanged; cart FAB stacks relative to it |

## Standard Stack

### Core (already in repo — no installs)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Next.js** | 16.2.6 | App Router, RSC PDP | Project mandate |
| **React** | 19.2.4 | Client islands | Card rotator, FAB, gallery |
| **embla-carousel-react** | 8.6.0 | PDP gallery / lightbox | Already wired via shadcn `Carousel` |
| **lucide-react** | 1.16.0 | Trash, cart icons | Existing PDP/header pattern |
| **Vitest** | 4.1.6 | Unit tests | `npm test` in CI/local |
| **Tailwind CSS** | 4.x | Layout, motion utilities | `globals.css` reduced-motion precedent |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@testing-library/react** | 16.3.2 | Component tests | If testing extracted button/rotator helpers with jsdom |
| **Playwright** | 1.60.0 | E2E | Optional extension to `e2e/product-pdp.spec.ts` — not required by CONTEXT |

**Installation:** None for this phase.

**Version verification:** `embla-carousel` / `embla-carousel-react` **8.6.0** in `package-lock.json` [VERIFIED: project lockfile].

## Package Legitimacy Audit

No new external packages. Existing `embla-carousel-react@^8.6.0` is already a project dependency [VERIFIED: package.json].

| Package | Disposition |
|---------|-------------|
| (none new) | N/A |

## Project Constraints (from .cursor/rules/)

- **Stack:** Next.js App Router + TypeScript, Prisma, Tailwind, shadcn, Ukrainian UI only.
- **Next.js:** Read `node_modules/next/dist/docs/` before API changes — this phase is mostly client/UI [CITED: AGENTS.md].
- **GSD:** Follow atomic plans, `npm test` + `npm run build` per D-22.

## Architecture Patterns

### System Architecture Diagram

```mermaid
flowchart TB
  subgraph SSR["SSR — tovar/[slug]/page.tsx"]
    P[getPublicProductBySlug]
    C[getCartItemCount / isProductInCart]
  end

  subgraph API["Server — catalog.service"]
    L[listPublicProducts cardInclude take:5]
    M[mapToCard → PublicProductCard + images[]]
  end

  subgraph Client["Client components"]
    PC[ProductCard + ImageRotator]
    PG[ProductGallery lightbox Embla]
    ATC[AddToCartButton in-cart UI]
    FAB[PdpCartFab]
    CF[ChatFab global]
  end

  subgraph Storage["Cart state"]
    LS[(pending-storage localStorage)]
    DB[(CartItem Prisma)]
  end

  L --> M --> PC
  P --> PG
  P --> ATC
  C --> FAB
  ATC -->|guest| LS
  ATC -->|session actions| DB
  FAB -->|guest count| LS
  FAB -->|session count prop| C
  FAB -->|link| Koszyk["/koszyk"]
  CF -.stack below.- FAB
```

### Recommended Project Structure

```
src/
├── types/catalog.ts                    # PublicProductCard + images[]
├── server/services/catalog.service.ts  # cardInclude take:5, mapToCard
├── components/catalog/
│   ├── product-card.tsx                # compose rotator in image slot
│   ├── product-card-image-rotator.tsx  # NEW client — hover cycle
│   └── product-gallery.tsx             # lightbox Embla opts only
├── components/cart/
│   ├── add-to-cart-button.tsx          # PDP in-cart layout
│   └── pdp-cart-fab.tsx                # NEW client — FAB + badge
└── app/(storefront)/tovar/[slug]/page.tsx  # wire FAB + initialCount
```

### Pattern 1: `PublicProductCard` extension (avoid type clash with PDP detail)

**What:** Add **`images`** array on the card DTO (≤5, ordered); keep **`image`** as the first preview for backward compatibility (wishlist mappers, JSON-LD, alt fallback).

**When to use:** All list surfaces using `listPublicProducts` / `mapToCard` (catalog, category, home if added later).

**Type shape (recommended):**

```typescript
// PublicProductCard — preview list without sortOrder on card
images: Array<{ cloudinaryPublicId: string; alt: string | null }>;
image: { cloudinaryPublicId: string; alt: string | null } | null; // images[0] or null

// PublicProductDetail — override with sortOrder for gallery
export type PublicProductDetail = Omit<PublicProductCard, "images"> & {
  description: string | null;
  images: Array<{
    cloudinaryPublicId: string;
    alt: string | null;
    sortOrder: number;
  }>;
};
```

**Service change:**

```typescript
// catalog.service.ts — cardInclude
images: {
  orderBy: { sortOrder: "asc" },
  take: 5,
  select: { cloudinaryPublicId: true, alt: true },
},

// mapToCard
const images = product.images.map(...);
return { ..., images, image: images[0] ?? null };
```

**Wishlist adapters:** `toPublicProductCard` sets `images: line.image ? [line.image] : []` — single-image cards skip rotation (D-06) [VERIFIED: wishlist-grid.tsx, wishlist-cabinet-preview.tsx].

### Pattern 2: Desktop-only hover rotator (client island)

**What:** Small `"use client"` component in the card image frame: stack `OptimizedImage` layers with opacity transition; `setInterval(3000)` only while hovered.

**Gates (all required):**

| Gate | Implementation |
|------|----------------|
| Multi-image | `images.length > 1` |
| Desktop hover | `@media (hover: hover) and (pointer: fine)` — enable handlers only when `matchMedia` true, or `hidden md:block` stack with rotator active only on `md+` **and** pointer fine |
| Reduced motion | `matchMedia("(prefers-reduced-motion: reduce)")` → static index 0 |
| Hover lifecycle | `onMouseEnter` → show index 0 immediately, start interval; `onMouseLeave` → clear interval, reset to 0 |

**Do not** use CSS-only infinite animation for 3s holds — first-frame-immediate + pause-on-leave is awkward in pure CSS [VERIFIED: CONTEXT D-02, D-05].

### Pattern 3: Lightbox-only Embla tuning (PDP-05)

**What:** Apply options **only** on the `Dialog` `Carousel` in `product-gallery.tsx` (lines ~151–154). Leave thumbnail `Carousel` at `{ align: "start", containScroll: "trimSnaps" }` (D-09).

**Recommended lightbox `opts` (starting point for UAT):**

```typescript
{
  loop: hasMultiple,
  startIndex: dialogIndex,
  align: "center",           // default; explicit for loop slides
  dragFree: false,           // snap after drag — REQUIRED for D-07 [CITED: Embla docs]
  skipSnaps: false,          // default
  containScroll: false,      // avoid trimSnaps fighting loop alignment [CITED: Embla Fade/loop guidance]
  duration: 25,              // API scrolls only; drag uses physics [CITED: Embla docs]
}
```

**Embla tuning notes [CITED: Context7 `/davidjerleke/embla-carousel/v8.6.0`]:**

| Option | Default | Lightbox intent |
|--------|---------|-----------------|
| `dragFree` | `false` | Keep `false` — `true` causes free-scroll without snap (opposite of D-07) |
| `duration` | `25` | Affects `scrollTo()` / API only, **not** drag release |
| `skipSnaps` | `false` | Keep `false` unless testing vigorous-swipe skip |
| `containScroll` | `'trimSnaps'` | Set `false` on lightbox to reduce end-cap snap weirdness with `loop: true` |
| `loop` | `false` | Keep `true` when `hasMultiple` (D-08) |

**Jerk diagnostics:** If jerk remains, check `dialogApi.scrollTo(dialogIndex, true)` — second arg `true` = instant jump on open [VERIFIED: product-gallery.tsx L56]; acceptable on open, but avoid instant scroll on drag end. Prefer manual UAT on real iOS/Android.

**Do not** add `embla-carousel-fade` plugin unless UX pivots to fade — not in scope.

### Pattern 4: PDP cart FAB stacking

**What:** New `PdpCartFab` client component, rendered only on `tovar/[slug]/page.tsx` (D-15).

**Anchor math [VERIFIED: chat-fab.tsx]:**

| Element | Classes |
|---------|---------|
| ChatFab | `fixed bottom-6 right-6 z-[60] size-14` |
| Cart FAB | `fixed bottom-[5.75rem] right-6 z-[59] size-14` + `pb-[max(0px,env(safe-area-inset-bottom))]` |

`5.75rem` ≈ 92px places cart FAB above 56px chat button + 24px bottom offset + ~12px gap (D-18 discretion).

**Count sync:**

| Auth | Source | Update mechanism |
|------|--------|------------------|
| Guest | `getPendingItemCount()` | `CART_CHANGED_EVENT` listener (same as `guest-cart-nav-link.tsx`) [VERIFIED] |
| Session | `getCartItemCount(userId)` from page | `initialCount` prop + `useEffect` on prop change after `router.refresh()` from `AddToCartButton` [VERIFIED: add-to-cart-button.tsx] |

**Visibility:** `count >= 1` render FAB; else `null` (D-16). Badge: `count > 9 ? "9+" : count` [VERIFIED: guest-cart-nav-link.tsx].

**Link target:** `/koszyk` (D-19). Note: `cart-nav-link.tsx` currently has `href="/koszyk42"` — likely typo, **out of scope** unless planner fixes opportunistically.

### Pattern 5: `AddToCartButton` in-cart UI (PDP-06)

**Current (to replace) [VERIFIED: add-to-cart-button.tsx L86–122]:** disabled «У кошику», text «Прибрати з кошика», ghost «Перейти до кошика».

**Target layout:**

```
[ «Вже в кошику» (disabled secondary) ] [ Trash2 icon button ]
```

- Row: `flex items-center gap-2` — max two controls (D-13).
- Trash: `size="icon"`, `variant="outline"`, `aria-label` Ukrainian remove label.
- Optional `layout="pdp" | "default"` prop if other surfaces need legacy layout — grep shows PDP-only usage today [VERIFIED: only `tovar/[slug]/page.tsx` imports component].

### Anti-Patterns to Avoid

- **Global cart FAB:** Violates D-15 — do not mount in `storefront` layout.
- **`dragFree: true` on lightbox:** Breaks snap-to-nearest (D-07).
- **Autoplay card images on mobile:** Violates D-03.
- **Third in-cart button or disabled ghost row:** Violates D-13.
- **Server Component hover timers:** Causes hydration issues and wastes SSR.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Carousel / swipe | Custom touch handlers | Embla via shadcn `Carousel` | Drag physics, loop, snap already solved |
| Cart persistence | New guest store | `pending-storage` + cart actions | Phase 20 guest checkout |
| FAB badge sync | Polling | `CART_CHANGED_EVENT` + `router.refresh()` | Established patterns |
| Image CDN URLs | Manual Cloudinary URLs | `OptimizedImage` | Project standard |

## Common Pitfalls

### Pitfall 1: `PublicProductDetail` / `PublicProductCard` `images` field collision
**What goes wrong:** Extending card with `images` breaks `PublicProductCard & { images: ... sortOrder }` intersection.  
**How to avoid:** `Omit<PublicProductCard, "images">` on detail type (Pattern 1).  
**Warning signs:** TS errors in `catalog.ts` or `getPublicProductBySlug` return type.

### Pitfall 2: Client bundle on every card
**What goes wrong:** Making entire `ProductCard` client pulls wishlist/catalog grids client-side.  
**How to avoid:** Only `ProductCardImageRotator` is `"use client"`; card shell stays server component.  
**Warning signs:** Larger JS on `/katalog` RSC pages.

### Pitfall 3: Lightbox jerk confused with thumbnail carousel
**What goes wrong:** Tuning shared defaults breaks thumbnail strip (D-09).  
**How to avoid:** Separate `opts` objects — lightbox vs thumbs.  
**Warning signs:** Thumbnail strip overscrolls or loses trim.

### Pitfall 4: FAB hidden after guest add
**What goes wrong:** Guest add does not call `router.refresh()`; FAB must listen to `CART_CHANGED_EVENT`.  
**How to avoid:** Mirror `GuestCartNavLink` effect pattern in `PdpCartFab`.  
**Warning signs:** FAB appears only after full page reload.

### Pitfall 5: z-index under lightbox dialog
**What goes wrong:** FAB shows over modal backdrop.  
**How to avoid:** Keep FAB `z-[59]` below dialog content (Radix dialog typically z-50 stack); hide FAB when `dialogOpen` optional — **not required by CONTEXT**; verify in UAT.

### Pitfall 6: List payload regression
**What goes wrong:** 5× images × 24 products increases HTML/RSC payload.  
**How to avoid:** Cap at 5 in Prisma `take`; monitor LCP on `/katalog`.  
**Warning signs:** Slower TTFB on category pages.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Embla jerk not fixed by opts alone | MEDIUM | Manual mobile UAT; iterate `containScroll` / `align`; avoid `dragFree: true` |
| Hover rotator accessibility | LOW | Respect `prefers-reduced-motion`; no auto motion on touch |
| Guest/session count desync on PDP | LOW | Dual path in `PdpCartFab`; test add/remove both modes |
| Wishlist single-image cards | LOW | `images: []` or one element — no rotator |
| Pre-existing test failures | LOW | 2 test files failed at research time — do not blame Phase 29; fix or note in plan |
| `cart-nav-link` `/koszyk42` typo | LOW | Out of scope; FAB uses `/koszyk` per D-19 |

## File Change List

| File | Action | Requirements |
|------|--------|--------------|
| `src/types/catalog.ts` | Edit | CARD-01 — card `images[]`, detail `Omit` pattern |
| `src/server/services/catalog.service.ts` | Edit | CARD-01 — `take: 5`, `mapToCard` |
| `src/components/catalog/product-card-image-rotator.tsx` | **Create** | CARD-01 — client hover cycle |
| `src/components/catalog/product-card.tsx` | Edit | CARD-01 — use rotator |
| `src/components/catalog/product-gallery.tsx` | Edit | PDP-05 — lightbox Embla opts |
| `src/components/cart/add-to-cart-button.tsx` | Edit | PDP-06 — in-cart UI |
| `src/components/cart/pdp-cart-fab.tsx` | **Create** | PDP-06 — FAB + badge |
| `src/app/(storefront)/tovar/[slug]/page.tsx` | Edit | PDP-06 — mount FAB, pass count |
| `src/components/wishlist/wishlist-grid.tsx` | Edit | CARD-01 — `images` in mapper |
| `src/components/wishlist/wishlist-cabinet-preview.tsx` | Edit | CARD-01 — `images` in mapper |
| `src/lib/catalog/product-card-images.test.ts` | **Create** (optional) | D-21 — pure helpers |
| `src/components/cart/add-to-cart-button.test.tsx` | **Create** (optional) | D-21 — in-cart labels/layout |
| `e2e/product-pdp.spec.ts` | Edit (optional) | Nyquist — FAB / in-cart assertions |

**Do not change (unless bug):** `src/components/ui/carousel.tsx` (shared wrapper), `src/components/chat/chat-fab.tsx` (D-20), thumbnail carousel opts in gallery (D-09).

## Code Examples

### Card hover rotator sketch

```typescript
// product-card-image-rotator.tsx — client
"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const HOLD_MS = 3000;

export function ProductCardImageRotator({ images, alt, sizes }: Props) {
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clear = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const onEnter = () => {
    if (images.length <= 1 || reducedMotion) return;
    setActive(true);
    setIndex(0); // D-02: first image immediately
    clear();
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, HOLD_MS);
  };

  const onLeave = () => {
    setActive(false);
    clear();
    setIndex(0);
  };

  useEffect(() => () => clear(), [clear]);

  // Render stacked OptimizedImage with opacity transition ~300–500ms
}
```

### Lightbox Embla opts

```typescript
// product-gallery.tsx — dialog Carousel only
<Carousel
  setApi={setDialogApi}
  opts={{
    loop: hasMultiple,
    startIndex: dialogIndex,
    align: "center",
    dragFree: false,
    skipSnaps: false,
    containScroll: false,
    duration: 25,
  }}
  className="w-full"
>
```

### PDP FAB (pattern from guest nav)

```typescript
// pdp-cart-fab.tsx
"use client";
// useState(initialCount), CART_CHANGED_EVENT + getPendingItemCount when !hasSession
// if (count < 1) return null;
// Link href="/koszyk" with Badge 9+ pattern
// className: fixed bottom-[5.75rem] right-6 z-[59] size-14 ...
```

## State of the Art

| Old (current) | Target (Phase 29) | Impact |
|---------------|-------------------|--------|
| Card single `image` | Up to 5 `images[]` + hover rotator | CARD-01 |
| Lightbox `loop` only | + snap tuning, `containScroll: false` | PDP-05 |
| 3-button in-cart row | 2 controls + PDP FAB | PDP-06 |

**Deprecated/outdated:** None — extend existing components.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `containScroll: false` fixes lightbox jerk | Embla tuning | LOW — revert and try `align` / loop off in UAT |
| A2 | `bottom-[5.75rem]` clears ChatFab on common viewports | FAB stack | LOW — tweak px in discretion |
| A3 | Field name `images` on card (vs `previewImages`) | Type extension | LOW — rename in mapper only |

**Planner confirmation:** A1 via mobile UAT; A2 via visual check with safe-area; A3 pick one name in plan task 1.

## Open Questions

1. **Extract shared `CartFabLink` vs PDP-only component?**  
   - What we know: `GuestCartNavLink` already implements badge + event.  
   - Recommendation: **PDP-only `PdpCartFab`** per D-15; duplicate minimal badge logic to avoid scope creep.

2. **Optional: hide FAB when lightbox open?**  
   - Not in CONTEXT; skip unless UAT shows overlap annoyance.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | build/test | ✓ | v24.14.0 | — |
| npm | scripts | ✓ | 11.9.0 | — |
| Vitest | D-21 | ✓ | 4.1.6 | — |
| embla-carousel-react | PDP-05 | ✓ | 8.6.0 | — |
| Dev server | manual UAT | ✓ (user terminal) | — | — |

**Missing dependencies:** None.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test` |
| Build gate | `npm run build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| CARD-01 | `mapToCard` returns ≤5 images ordered | unit | `npm test -- src/server/services/catalog.service.test.ts` (extend) | ✅ extend |
| CARD-01 | Rotator does not cycle when `images.length === 1` | unit | `npm test -- src/lib/catalog/product-card-images.test.ts` | ❌ Wave 0 |
| CARD-01 | Reduced motion / hover gating helpers | unit | same | ❌ Wave 0 |
| PDP-05 | Lightbox snap config regression | manual | Mobile UAT swipe lightbox | N/A |
| PDP-06 | In-cart shows «Вже в кошику» not «У кошику» | unit | `npm test -- src/components/cart/add-to-cart-button.test.tsx` | ❌ Wave 0 |
| PDP-06 | FAB count from pending storage | unit | `npm test -- src/lib/cart/pending-storage` patterns exist | ✅ partial |
| PDP-06 | FAB visible when count ≥ 1 | manual / e2e | `e2e/product-pdp.spec.ts` extend | ✅ extend optional |

### Sampling Rate

- **Per task commit:** `npm test` (targeted file if possible)
- **Per wave merge:** `npm test` + `npm run build`
- **Phase gate:** Manual UAT per D-22 + full suite green

### Wave 0 Gaps

- [ ] `src/lib/catalog/product-card-images.ts` + test — `shouldRotatePreviewImages(count, { reducedMotion, pointerFine })`
- [ ] Extend `catalog.service.test.ts` — `mapToCard` / include images length (mock prisma payload)
- [ ] `src/components/cart/add-to-cart-button.test.tsx` — in-cart copy and max two buttons
- [ ] Optional: `e2e/product-pdp.spec.ts` — add to cart → «Вже в кошику» + FAB visible

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | no | No auth changes |
| V3 Session Management | no | Reuse existing session cart |
| V4 Access Control | no | Public catalog/PDP |
| V5 Input Validation | no | No new user inputs |
| V6 Cryptography | no | — |

### Known Threat Patterns

| Pattern | STRIDE | Mitigation |
|---------|--------|------------|
| XSS via product alt/title | Tampering | React escaping; existing `OptimizedImage` |
| Cart manipulation | Spoofing | Server actions validate productId on session path; guest local-only until checkout |

No new attack surface beyond UI composition.

## Sources

### Primary (HIGH confidence)
- Codebase: `product-card.tsx`, `catalog.service.ts`, `catalog.ts`, `product-gallery.tsx`, `carousel.tsx`, `add-to-cart-button.tsx`, `tovar/[slug]/page.tsx`, `chat-fab.tsx`, `pending-storage.ts`, `guest-cart-nav-link.tsx`
- Context7 `/davidjerleke/embla-carousel/v8.6.0` — `duration`, `dragFree`, `skipSnaps`, `containScroll` [CITED: Embla API options]
- `node_modules/embla-carousel/esm/embla-carousel.esm.js` — defaultOptions [VERIFIED]
- `.planning/phases/29-product-cards-pdp-core-ux/29-CONTEXT.md` — locked decisions

### Secondary (MEDIUM confidence)
- Phase 28 `globals.css` `prefers-reduced-motion` pattern for CARD-01 alignment

### Tertiary (LOW confidence)
- None blocking planning

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — no new deps; versions from lockfile
- Architecture: **HIGH** — files and patterns verified in repo
- Embla jerk fix: **MEDIUM** — docs + defaults; needs device UAT
- Pitfalls: **HIGH** — type collision and FAB sync are concrete

**Research date:** 2026-05-20  
**Valid until:** 2026-06-20 (stable stack) / 2026-06-06 re-check Embla after UAT if jerk persists
