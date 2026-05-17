---
phase: 7
slug: catalog-filters-fix
status: draft
extends: 02-UI-SPEC.md
created: 2026-05-17
locale: uk
---

# Phase 7 — UI Design Contract (delta)

> **Extends** `02-UI-SPEC.md` — tokens, typography, 60/30/10 unchanged. This document only specifies **new/changed** catalog filter UI for Phase 7.

## shadcn add

```bash
npx shadcn@latest add slider
```

## Price filter (CAT-01, CAT-02)

| Property | Value |
|----------|-------|
| Control | **Dual-thumb** `Slider` (one range, two thumbs) |
| Companion inputs | Two number fields «Від» / «До» (grid 2 cols, existing pattern) |
| Step | **50** UAH (`step={50}` on Slider; inputs snap on blur) |
| Bounds | `min`/`max` from server `priceBounds` (cheapest / priciest AVAILABLE in context) |
| Empty bounds | Disable Slider + inputs; helper text «Немає товарів для фільтра ціни» |
| URL keys | `cina-vid`, `cina-do` (unchanged) |
| On change | `сторінка` → 1 |
| Drag URL update | **Throttle 200 ms** (not commit-only) |

### Slider layout

```
Ціна, ₴
[====●────────●====]  ← Slider full width, mt-2
[ Від: ____ ] [ До: ____ ]
```

- Slider: `className="mt-3"` under label «Ціна, ₴»
- Thumb labels (optional): show `formatPriceKopiyky` at track ends for min/max bounds (discretion)
- Inputs sync bidirectionally with slider; clamp to `[bounds.minUah, bounds.maxUah]`

## Mobile (D-07-04)

| Breakpoint | Behavior |
|------------|----------|
| `< lg` | Sticky bar: button **«Фільтри»** opens `Sheet` (side bottom or left per 02-UI-SPEC) containing **same** filter panel as desktop (categories, brand, price Slider, condition, reset) |
| `≥ lg` | Existing sidebar `aside` unchanged |

**Sheet copy:** Title **«Фільтри»**; footer button **«Показати результати»** closes sheet (filters already applied via URL).

## Active filter chips (D-07-12)

| Property | Value |
|----------|-------|
| Placement | **Above** product grid, inside toolbar column — first row in `CatalogToolbar` or sibling block `mb-3` |
| Chips | Brand (single), price range (one chip if either bound set), each condition (multi) |
| Remove | × on chip clears that dimension only |
| Price chip label | `від 13 000 ₴`, `до 20 000 ₴`, or `13 000 – 20 000 ₴` |
| Condition chip | `conditionLabelUa` |
| Style | `Badge` variant `secondary` + dismiss button; min touch 44px height |
| Reset all | Sidebar **«Скинути фільтри»** remains; chips are additive UX |

## Copy (unchanged from Phase 2)

- «Ціна, ₴», «Від», «До», «Бренд», «Стан», «Скинути фільтри»

## Accessibility

- Slider: `aria-label="Діапазон ціни"`
- Inputs: `aria-label="Мінімальна ціна"` / `Максимальна ціна"`
- Chips: `aria-label="Прибрати фільтр: {label}"`

## Out of scope

- Playwright screenshots for slider
- Changing URL param names
- Admin UI
