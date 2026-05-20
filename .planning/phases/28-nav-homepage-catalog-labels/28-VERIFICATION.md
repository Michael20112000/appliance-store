---
phase: 28-nav-homepage-catalog-labels
status: human_needed
score: 4/4
verified: 2026-05-20
---

# Phase 28 Verification

## Must-haves

| Req | Criterion | Result |
|-----|-----------|--------|
| NAV-01 | Mobile drawer auth below callback (guest + signed-in) | PASS — `StorefrontAuthLinks` in `StoreMobileNav`; tests cover both states |
| HOME-04 | Smooth scroll to `#kategorii` with header offset | PASS — `html:has(#main-content)` + `#kategorii { scroll-margin-top: 4.5rem }` |
| HOME-05 | Category cards show count; empty hidden | PASS — `formatCategoryCountBadge` + `categoriesWithAvailableProducts` unchanged |
| CAT-02 | Sort labels Найновіші / Дорожче / Дешевше | PASS — `CATALOG_SORT_LABELS` + toolbar maps via `catalogSortLabel` |

## Automated checks

- Phase Vitest (mobile nav, format, catalog-labels, categories) — PASS
- `npm run build` — PASS
- Full `npm test` — 3 failures in `prisma/seed.test.ts` (pre-existing seed data; unrelated to phase 28)

## Human verification

1. Mobile viewport — open drawer as guest: Увійти / Реєстрація below callback.
2. Signed-in — drawer shows Кабінет / Вийти; header auth unchanged.
3. Homepage hero CTA → smooth scroll to categories; title visible below sticky header.
4. OS «Reduce motion» — jump to `#kategorii` without smooth animation.
5. `/admin` — no global smooth scroll on hash links.
6. Homepage cards — `1 товар` vs digit-only badges; no zero-count cards.
7. `/katalog` — sort dropdown shows Найновіші, Дорожче, Дешевше; URL keys unchanged.
