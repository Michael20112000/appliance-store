# Phase 7: Catalog Filters Fix - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-17
**Phase:** 07-Catalog Filters Fix
**Areas discussed:** Price Slider UX, Price bounds, URL throttle, Brands per category, Verification, Active filter chips

---

## Price Slider UX (CAT-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Number inputs only | Keep current two `<input type="number">` | |
| Dual-thumb Slider + inputs | shadcn Slider (min/max thumbs) synced with «від/до», step 50 ₴ | ✓ |
| Slider only, no inputs | Range control without text fields | |

**User's choice:** Dual-thumb Slider + поля «від/до», крок **50 ₴**, mobile теж Slider.
**Notes:** Мінімум/максимум повзунків = найдешевший / найдорожчий товар у видимому контексті.

---

## Price bounds (context)

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed cap (e.g. 500 000 ₴) | Static slider max from UI-SPEC era | |
| Dynamic from catalog data | min/max price of AVAILABLE products in context | ✓ |

**User's choice:** Dynamic per context (global catalog vs category slug).

---

## URL update timing

| Option | Description | Selected |
|--------|-------------|----------|
| Throttle 200 ms during drag | Push `cina-vid`/`cina-do` every 200 ms while dragging | ✓ |
| Debounce after release | Update URL only on `onValueCommit` | |
| Live every frame | No throttle | |

**User's choice:** **3a** — throttle 200 ms під час перетягування.

---

## Brands per category (CAT-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Global brands always | Current `getDistinctBrands()` behavior | |
| Per-category list + keep valid brend | Filter options by category; preserve URL brend when valid | ✓ |
| Per-category + clear invalid brend silently | Strip `brend` from URL when not in category brand list | ✓ |

**User's choice:** Різні бренди per category; зберігати `brend` при переході якщо бренд є в новій категорії; якщо немає (Bosch → телефони) — **тихий replace** URL без `brend`, сторінка 1, без toast (**4a**).

---

## Verification

| Option | Description | Selected |
|--------|-------------|----------|
| Vitest + manual checklist | Unit tests + roadmap manual slider→grid check | ✓ |
| Add Playwright price E2E | Automated browser test for min price filter | |

**User's choice:** Vitest + manual checklist (no new Playwright for price).

---

## Active filter chips

| Option | Description | Selected |
|--------|-------------|----------|
| Out of scope Phase 7 | Sidebar reset only | |
| Add chips above grid | Removable chips for brand, price range, condition | ✓ |

**User's choice:** **6b** — додати чіпси (бренд, діапазон ціни, стан), зняття по одному.

**Clarification given:** Пояснено, що чіпси — плашки над сіткою з ×; користувач обрав включити в фазу.

---

## Claude's Discretion

- `getCatalogPriceBounds` query shape; server vs client invalid-`brend` strip (D-07-11).
- Chip component file layout and styling.

## Deferred Ideas

None captured.
