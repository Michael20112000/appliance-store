---
phase: 29
slug: product-cards-pdp-core-ux
status: draft
shadcn_initialized: true
preset: base-nova (style), neutral baseColor, cssVariables, lucide icons
created: 2026-05-20
---

# Phase 29 — Product cards & PDP core UX — UI Design Contract

> Visual and interaction contract for CARD-01, PDP-05, PDP-06. Storefront catalog cards + PDP only.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn + Tailwind 4 |
| Icons | lucide-react (`ShoppingCart`, `Trash2`, `Check` optional on add state) |
| Motion | Respect `prefers-reduced-motion: reduce` — no card rotation (Phase 28 precedent) |

---

## Spacing Scale

| Token | Usage |
|-------|-------|
| `gap-2` | In-cart control row (primary + trash) |
| `gap-3` | PDP action column (`AddToCart`, wishlist, chat) |
| `bottom-6` (`1.5rem`) | ChatFab anchor |
| `bottom-[5.75rem]` | Cart FAB — ~92px, clears 56px chat button + margin |
| `right-6` | Both FABs aligned |
| `size-14` | FAB touch targets (match ChatFab) |
| `min-h-11` | PDP buttons (existing) |

**Safe area:** both FABs use `pb-[max(0px,env(safe-area-inset-bottom))]` on fixed positioning.

---

## Typography

| Role | Class | Usage |
|------|-------|-------|
| Button label | `text-sm` (Button default) | «Вже в кошику», «Додати в кошик» |
| FAB | icon only | `aria-label` «Перейти до кошика» |
| Trash | icon only | `aria-label` «Прибрати {productTitle} з кошика» |

---

## Color

| Element | Classes |
|---------|---------|
| In-cart primary | `variant="secondary"` disabled |
| Trash | `variant="outline"` `size="icon"` |
| FAB | `bg-primary text-primary-foreground shadow-lg` (match ChatFab) |
| Count badge | `bg-primary ring-2 ring-background` on FAB |

---

## CARD-01: Product card image stack

### Layout

- Container: `relative aspect-[4/3] min-h-48 w-full bg-muted` (unchanged)
- Stack: absolutely positioned layers `inset-0`, each `OptimizedImage` `fill object-cover`
- Active layer: `opacity-100`, inactive: `opacity-0`
- Transition: `transition-opacity duration-300` (300–500ms discretion)

### Interaction

| Viewport | Behavior |
|----------|----------|
| `< md` or no hover | First image only, no timer |
| `md+` + `(hover: hover)` + 2+ images | On `mouseenter`: show image 0 immediately, then advance every **3000ms** |
| `mouseleave` | Clear timer, reset to image 0 |
| `prefers-reduced-motion: reduce` | First image only |

### Accessibility

- Card `Link` `aria-label` unchanged (product title + price)
- Rotating images decorative — no extra tab stops
- `ConditionBadge` stays `absolute left-2 top-2 z-10` above image stack

---

## PDP-05: Lightbox carousel

### Interaction

- Drag: momentum allowed, **snap to nearest slide** on release (`dragFree: false`)
- Loop: enabled when `hasMultiple`
- Animation: `duration: 25` (Embla) on snap
- Counter pill: unchanged (`bottom-4`, `bg-black/60`)

### Motion

- No autoplay in lightbox
- Reduced motion: do not disable swipe; only card hover rotation is affected per phase scope

---

## PDP-06: In-cart controls

### Layout (in-cart)

```
[ «Вже в кошику» (disabled secondary, flex-1 or w-full sm:w-auto) ] [ trash icon 44px ]
```

- **Max two controls** in cart row (wishlist remains separate below)
- Remove third row / link «Перейти до кошика»

### Copy (locked)

| State | Label |
|-------|-------|
| Default | «Додати в кошик» |
| In cart | «Вже в кошику» |
| Pending remove | «Прибираємо…» on trash only |

---

## PDP-06: Cart FAB stack

### Z-index stack (bottom-right)

| Layer | z-index | Position |
|-------|---------|----------|
| ChatFab | `z-[60]` | `bottom-6 right-6` |
| PdpCartFab | `z-[59]` | `bottom-[5.75rem] right-6` |

### Visibility

- `count === 0` → FAB not rendered (no empty floating button)
- `count > 0` → show FAB + badge (`1`…`9`, then `9+`)

### Scope

- Mounted only on `/tovar/[slug]` — not catalog, home, or layout global

---

## Accessibility

| Control | Requirement |
|---------|-------------|
| Trash | `aria-label` Ukrainian, includes product title |
| In-cart primary | `aria-label` «{title} вже в кошику» |
| Cart FAB | `aria-label` «Перейти до кошика»; badge `aria-hidden` if decorative |
| Focus | `focus-visible:ring-2 focus-visible:ring-ring` on FAB and trash |

---

## Out of scope

- Similar products (Phase 30)
- Global cart FAB
- Footer / admin
- Tap-to-cycle on mobile cards

---

## Manual UAT checklist

1. Desktop: card with 3+ photos — hover → immediate first image, then ~3s crossfade
2. Mobile: card shows first image only, no cycle
3. Reduced motion OS setting: card static
4. PDP lightbox on phone: swipe and release — no jerk snap-back
5. PDP add to cart → «Вже в кошику» + trash; no «Перейти до кошика»
6. Cart FAB appears above chat when count ≥ 1; links to `/koszyk`
