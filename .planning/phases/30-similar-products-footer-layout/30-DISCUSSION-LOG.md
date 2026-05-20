# Phase 30: Similar products & footer layout - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-20
**Phase:** 30-similar-products-footer-layout
**Areas discussed:** Similar placement, Similar selection logic (footer locked from requirements without interactive discuss)

---

## Similar — placement on PDP

| Option | Description | Selected |
|--------|-------------|----------|
| Below main grid, full-width | Under two-column gallery+info block | ✓ |
| In right column under description | Compact but narrow for cards | |
| Page bottom | Below «До каталогу» | |

| Option | Description | Selected |
|--------|-------------|----------|
| 4 products | 1 row desktop, 2×2 mobile | ✓ |
| 6 products | 2 rows desktop | |
| 8 products | Longer section | |
| Claude decides | 4–6 range | |

| Option | Description | Selected |
|--------|-------------|----------|
| Grid 2 col (catalog) | Same as /katalog | ✓ |
| Horizontal scroll | Compact mobile | |
| Claude decides | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Full ProductCard with wishlist | Catalog consistency | ✓ |
| ProductCard without wishlist | Less noise | |
| Compact card | Smaller height | |

**User's choice:** Below grid, 4 items, 2-col grid mobile, full ProductCard.
**Notes:** User skipped further placement questions.

---

## Similar — selection logic

| Option | Description | Selected |
|--------|-------------|----------|
| ±20% with kopiyky rounding | floor(0.8×), ceil(1.2×) | ✓ |
| Exact 80%/120% | No rounding | |
| Claude decides | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Closest price | Nearest to current price | |
| Newest | createdAt desc | |
| Random | Varied order per load | ✓ |
| Claude decides | closest + tiebreak | |

| Option | Description | Selected |
|--------|-------------|----------|
| Hide section | No empty block | |
| Empty message | «Немає схожих» | |
| Fallback: whole category | Ignore price filter | |
| Fallback: expand range | ±40% then category | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| In-stock only | quantity >= 1 | ✓ |
| Include sold out | | |

**User's choice:** Rounded ±20%, random sort, fallback ±40% then category fill, in-stock only.
**Notes:** Hide section if zero after all fallbacks (derived in CONTEXT).

---

## Footer layout (not interactively discussed)

**User's choice:** Accepted Claude locking from FOOT-05: desktop map | contacts+form, © centered on desktop.
**Notes:** User did not select footer gray areas in initial multi-select.

---

## Claude's Discretion

- Map iframe height on desktop left column
- Random shuffle implementation detail
- Mobile © alignment (desktop center locked)
- PDP section spacing tokens

## Deferred Ideas

- Horizontal scroll similar cards on mobile
- Compact card variant for similar section
- Cross-category / ML recommendations
