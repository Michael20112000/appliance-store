# Phase 28: Nav, homepage & catalog labels - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-20
**Phase:** 28-nav-homepage-catalog-labels
**Areas discussed:** Mobile drawer auth, Smooth scroll #kategorii, Homepage category counts, Catalog sort labels

---

## Mobile drawer auth (NAV-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Under callback form | Separator, then auth links | ✓ |
| Above categories | Auth at top of sheet | |
| Sticky footer in sheet | Always visible auth | |

**User's choice:** Auth **under callback**; drawer keeps categories → callback → auth. **Guest:** Увійти + Реєстрація. **Signed-in:** Кабінет + Вийти (user clarified drawer should mirror full mobile menu needs).
**Notes:** Visual style **as header** (`StoreHeaderAuth`). Desktop header **unchanged**; drawer stays `md:hidden` only.

---

## Smooth scroll to `#kategorii` (HOME-04)

| Option | Description | Selected |
|--------|-------------|----------|
| Hero only | Smooth scroll only on hero CTA | |
| All storefront `#` | Global smooth on storefront | ✓ |
| JS scrollIntoView | Per-click handler | |

| Option | Description | Selected |
|--------|-------------|----------|
| CSS scroll-behavior | On html (storefront-scoped) | ✓ |
| JS only | scrollIntoView | |
| CSS + JS offset | Hybrid | |

| Option | Description | Selected |
|--------|-------------|----------|
| scroll-margin-top | Compensate sticky header | ✓ |
| No offset | Native scroll only | |

| Option | Description | Selected |
|--------|-------------|----------|
| Instant when reduced-motion | a11y | ✓ |
| Always smooth | | |

**User's choice:** `1, 2, 1, 1` — global storefront CSS smooth scroll, `scroll-margin-top` on `#kategorii`, disable smooth when `prefers-reduced-motion: reduce`.

---

## Homepage category counts (HOME-05)

| Option | Description | Selected |
|--------|-------------|----------|
| Numeric badge only | e.g. `12` | Partial |
| Count + word | «12 товарів» | |
| Replace CardDescription | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Beside title, same row | Flex row with CardTitle | ✓ |
| Overlay on image | | |
| Under title | | |

| Option | Description | Selected |
|--------|-------------|----------|
| «1 товар» for count=1 | UA singular | ✓ |
| «1» only | | |
| Never show word | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Hide empty categories (Phase 25) | No card render | ✓ |
| Show 0 | | |

**User's choice:** Badge beside category name; **1 товар** when count is 1; **Phase 25 empty filter unchanged**. CONTEXT resolves multi-count as **digits-only** in badge (2+) to align with drawer while honoring singular phrase for 1.

---

## Catalog sort labels (CAT-02)

| Option | Description | Selected |
|--------|-------------|----------|
| REQUIREMENTS exact | «Новіше», «Дорожче», «Дешевше» | |
| User labels | «Найновіші», «Дорожче», «Дешевше» | ✓ |
| Custom freeform | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Claude discretion | Central labels + toolbar + test | ✓ |
| Select only | | |
| All catalog copy | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Labels only, keys unchanged | | ✓ |
| Change URL keys | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Sort only (scope) | | ✓ |
| All catalog-labels.ts | | |

**User's choice:** «Найновіші», «Дорожче», «Дешевше»; URL keys unchanged; sort-only scope. Label rollout: **agent discretion** → `CATALOG_SORT_LABELS` + `catalog-toolbar` + `catalog-labels.test.ts`.

---

## Claude's Discretion

- `scroll-margin-top` tuning and CSS file placement.
- Shared auth component extraction between header and drawer.
- Homepage badge helper vs inline ternary for count display.

## Deferred Ideas

- Broader catalog label shortening (brands, filters).
- Deduplicating mobile header auth (user wants header kept).
