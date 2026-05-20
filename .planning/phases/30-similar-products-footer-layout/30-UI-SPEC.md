---
phase: 30
slug: similar-products-footer-layout
status: draft
shadcn_initialized: true
preset: base-nova (style), neutral baseColor, cssVariables, lucide icons
created: 2026-05-20
---

# Phase 30 — Similar products & footer layout — UI Design Contract

> Visual and interaction contract for PDP-07, FOOT-05. PDP «Схожі товари» section + storefront footer column restructure. Layout-only for footer; no callback/contact copy changes.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn + Tailwind 4 |
| Preset | `base-nova`, `neutral`, CSS variables — `components.json` |
| Component library | Base UI primitives via `@/components/ui/*` |
| Icons | lucide-react (ProductCard / wishlist unchanged) |
| Font | Project `--font-sans` (`globals.css`) |

**Registry:** shadcn official only (`registries: {}`). No third-party blocks this phase.

---

## Spacing Scale

Project-standard 8pt scale (Tailwind multiples of 4):

| Token | Value | Usage in this phase |
|-------|-------|---------------------|
| xs | 4px | Card internal padding (ProductCard — unchanged) |
| sm | 8px | Contact list `space-y-2` |
| md | 16px | Similar grid `gap-4`; footer contacts `space-y-6` |
| lg | 24px | Similar grid desktop `md:gap-6`; footer grid `md:gap-12` |
| xl | 32px | Footer shell `py-8`; similar section `mt-16` |
| 2xl | 48px | PDP main grid `gap-10` (unchanged above section) |
| 3xl | 64px | — |

**Exceptions:**

- Similar section top separator: `mt-16 border-t border-border pt-12` — separates from main PDP grid without crowding FAB stack.
- Footer map iframe desktop: **min-height 280px** (`md:min-h-[280px]`), full column width — primary visual anchor (D-15).
- Footer map iframe mobile: **height 160px** (`h-40`) — unchanged from Phase 26; map is last in stack.
- Touch targets: callback submit remains **min-height 44px** (`min-h-11`).

---

## Typography

| Role | Size | Weight | Line height | Usage |
|------|------|--------|-------------|-------|
| Body | 14px (`text-sm`) | 400 | 1.5 | Footer contacts, copyright |
| Label | 14px (`text-sm`) | 500 (`font-medium`) | 1.5 | Phone/email links in footer |
| Heading | 18px (`text-lg`) | 500 (`font-medium`) | 1.2 | «Схожі товари» section title |
| Display | — | — | — | Not used this phase |

**Weights in phase:** 400 (body), 500 (section heading + contact links).

ProductCard title/price typography unchanged from Phase 29 (`text-base` title, `text-lg` price).

---

## Color

Uses existing CSS variables. No new tokens.

| Role | Token / class | Usage (60/30/10) |
|------|---------------|------------------|
| Dominant (60%) | `bg-background` | PDP page surface |
| Secondary (30%) | `bg-muted/40`, `border-border` | Footer shell; similar section divider |
| Muted text | `text-muted-foreground` | Copyright, contact labels |
| Foreground | `text-foreground` | Section heading, contact links |
| Accent (10%) | `bg-primary`, `text-primary-foreground` | **Only** callback submit «Передзвоніть мені» |
| Destructive | — | Not used this phase |

**Accent reserved for:** callback form primary submit button only. ProductCard links and footer `tel:`/`mailto:` links stay `text-foreground` with hover underline — not primary fill.

---

## Scope

| Surface | In scope |
|---------|----------|
| PDP `/tovar/[slug]` | «Схожі товари» section below main grid |
| `StoreFooter` | Desktop 2-col (map \| contacts+form); mobile stack reorder; © centering |
| `catalog.service.ts` | `listSimilarPublicProducts` — no UI beyond data |

**Out of scope:** Similar-products algorithm UX beyond display; footer copy changes; admin; mobile drawer; PDP cart FAB / lightbox / card hover (Phase 29); analytics; horizontal scroll for similar products; compact card variant.

---

## PDP-07: «Схожі товари» section

### Placement (D-01)

- **Below** the main `md:grid-cols-2` gallery + info grid.
- **Inside** the same `mx-auto max-w-6xl px-4 sm:px-6` container as breadcrumb + product grid (full content width, not nested in right column).
- **Above** footer; do not mount inside `PdpCartFab` scope.

### Section shell

```text
<section aria-labelledby="similar-products-heading">
  <h2 id="similar-products-heading" className="text-lg font-medium">
    Схожі товари
  </h2>
  <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
    …ProductCard × up to 4…
  </div>
</section>
```

Wrapper (when ≥1 similar product):

```text
className="mt-16 border-t border-border pt-12"
```

### Grid (D-03, D-02)

| Viewport | Layout |
|----------|--------|
| `< md` | `grid-cols-2 gap-4` — **same as** `ProductGrid` / catalog |
| `md+` | `md:grid-cols-4 md:gap-6` — **4 cards in one row** when 4 products exist |

**Canonical grid class:** `grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6` — reuse from `product-grid.tsx` (do not invent a new pattern).

### Cards (D-04)

- Reuse **`ProductCard`** unchanged — including `ProductCardImageStack`, `ConditionBadge`, `WishlistToggleButton` overlay.
- Pass `hasSession` and per-product `initialInWishlist` from PDP page (same pattern as catalog/wishlist grid).
- Image `sizes`: inherit ProductCard default `(max-width: 768px) 50vw, 25vw`.

### Visibility (D-12)

| Condition | UX |
|-----------|-----|
| 0 similar products after all fallbacks | **Render nothing** — no heading, no empty placeholder |
| 1–3 products | Show heading + grid with available cards only (no skeleton slots) |
| 4 products | Full row on desktop |

### Empty / error states

| State | UX |
|-------|-----|
| Empty (no candidates) | Section omitted entirely |
| Fetch error | Omit section (server-side; no inline error UI on PDP) |

---

## FOOT-05: Footer layout (`StoreFooter`)

### Shell (unchanged)

```text
<footer className="border-t border-border bg-muted/40">
  <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
```

### Desktop (≥ `md`): two columns (D-14)

Grid: `grid gap-8 md:grid-cols-2 md:gap-12`.

| Column | Content top → bottom |
|--------|----------------------|
| **Left** | **Map iframe only** — no phones/emails/addresses in this column |
| **Right** | Phones → Emails → Addresses → `CallbackRequestForm` stacked (`space-y-6` on contact block wrapper) |

**Left column map spec:**

```text
<iframe
  title="Карта магазину"
  loading="lazy"
  className="h-40 w-full rounded-md border border-border md:h-auto md:min-h-[280px]"
/>
```

- Map renders only when `mapEmbedSrc` exists (primary address).
- Left column is the **visual anchor** — iframe fills column width; height ≥280px on desktop.

**Right column contacts:** preserve Phase 26 list patterns (`space-y-2` per type, `font-medium` phones, external map links on addresses). Omit empty contact types — no placeholders.

### Mobile (`< md`): single column stack (D-17)

Order top → bottom:

1. **Contacts** (phones, emails, addresses — same blocks as today)
2. **`CallbackRequestForm`**
3. **Map iframe** (if address configured) — `h-40`, action-first; map last

Do **not** regress Phase 26: formatted phones, `tel:`/`mailto:`, lazy iframe, callback validation/toast behavior.

### Copyright row (D-16)

Below main grid, full width:

```text
<p className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground md:text-center">
  © {year} Техніка б/у Львів
</p>
```

| Viewport | Alignment |
|----------|-----------|
| `< md` | Left-aligned (default) |
| `md+` | **`text-center`** (locked) |

---

## Copywriting Contract

| Element | Copy (UA, locked) |
|---------|-------------------|
| Similar section heading | Схожі товари |
| Callback heading | Вкажіть свій номер — ми передзвонимо (unchanged) |
| Callback CTA | Передзвоніть мені |
| Map iframe title | Карта магазину |
| Copyright | © {year} Техніка б/у Львів |
| ProductCard empty image | Без фото (unchanged) |

| Element | Copy |
|---------|------|
| Similar empty state | **None** — hide entire section |
| Similar error state | **None** — hide section |
| Destructive confirmation | **N/A** this phase |

---

## Component Inventory

| Component | Source | Notes |
|-----------|--------|-------|
| `ProductCard` | `@/components/catalog/product-card` | Similar grid — no variant |
| `ProductGrid` | `@/components/catalog/product-grid` | Optional reuse for grid wrapper only; max 4 items |
| `CallbackRequestForm` | `@/components/layout/callback-request-form` | Footer right col (desktop) / middle (mobile) |
| `StoreFooter` | `@/components/layout/store-footer.tsx` | Layout refactor only |
| `Card` | `@/components/ui/card` | Via ProductCard |

**New files (executor discretion):**

- `SimilarProductsSection` (or inline in PDP page) — server component wrapping heading + grid
- `listSimilarPublicProducts` in `catalog.service.ts` — data only

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | existing only (card, button, etc.) | not required |
| Third-party | none | — |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Similar section | `aria-labelledby="similar-products-heading"` on `<section>` |
| Similar cards | Existing ProductCard `aria-label` (title + price) |
| Map iframe | `title="Карта магазину"` |
| Phone/email links | Formatted visible text; correct `tel:` / `mailto:` hrefs |
| External address links | `target="_blank"` + `rel="noopener noreferrer"` |
| Callback form | Phase 26 patterns unchanged (`sr-only` label, inline errors) |

---

## Regression guards

- Phase 29: PDP FAB stack, in-cart controls, lightbox — **unchanged**
- Phase 26: Callback form copy, validation, success toast — **unchanged**
- Phase 26 mobile drawer — **out of scope**; no footer changes in drawer

---

## Manual UAT checklist

1. **PDP similar:** Section appears below gallery/info grid; heading «Схожі товари»; up to 4 cards.
2. **PDP mobile:** 2-column card grid (not horizontal scroll).
3. **PDP desktop:** 4 cards in one row when 4 exist.
4. **PDP cards:** Full ProductCard with wishlist overlay; hover image rotation on desktop (Phase 29).
5. **PDP sparse category:** Fallback fills slots or section hidden when zero candidates — no empty heading.
6. **Footer desktop:** Left = tall map only; right = contacts + callback form.
7. **Footer mobile:** Order contacts → callback → map.
8. **Footer ©:** Centered on `md+`; left on mobile.
9. **Footer empty contacts:** Types with zero entries omitted; callback + © still render.
10. **Build:** `npm test` + `npm run build` green.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending

---

## Plan-phase readiness

**Status:** `draft` — ready for `/gsd-plan-phase` and `gsd-ui-checker` verification.

**Locked from upstream:** 30-CONTEXT.md D-01…D-20, REQUIREMENTS PDP-07 / FOOT-05, Phase 26 footer tokens, Phase 29 ProductCard grid pattern.

**Executor may tune (discretion):** exact `pt-12` vs `pt-10` on similar section; in-memory shuffle vs DB random; mobile © left vs center (desktop center locked).

---

*Phase: 30-similar-products-footer-layout*  
*Sources: 30-CONTEXT.md (20 decisions), REQUIREMENTS PDP-07/FOOT-05, 29-UI-SPEC.md, 26-UI-SPEC.md, product-grid.tsx, store-footer.tsx, product-card.tsx, components.json*
