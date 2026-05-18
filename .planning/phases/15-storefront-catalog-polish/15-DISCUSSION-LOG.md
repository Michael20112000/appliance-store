# Phase 15 Discussion Log

**Date:** 2026-05-18  
**Phase:** Storefront Catalog Polish

## Areas Discussed

1. Порожні категорії (CAT-04)
2. Badge у сайдбарі (CAT-05)
3. Пагінація 16 (CAT-06)
4. Deep link на порожню категорію

## Decisions Recorded

| Area | Question | Choice |
|------|----------|--------|
| Header nav | Топ-4 категорії | Перші 4 **непорожні** за sortOrder |
| Homepage | Порожні картки | Не показувати картку (сітка стискається) |
| Sidebar | Порожні рядки | Не показувати (count = 0) |
| Mobile nav | Правила | Як sidebar |
| Badge placement | Де count | Одразу після назви |
| «Усі товари» | Badge | Так, total count |
| Badge variant | Стиль | `secondary` |
| Badge scope | Де ще | Sidebar + header/mobile nav |
| Pagination | Компонент | Reuse `AdminListPagination` |
| Pagination | Позиція | Під сіткою |
| Pagination | 0 товарів | Не показувати (totalPages <= 1) |
| Pagination | storinka OOB | Clamp + sync URL (nuqs) |
| Deep link | 0 available category | 200 + empty state (не 404) |
| Sitemap | Порожні категорії | Claude's discretion |

## Deferred

- Homepage section hide when all empty — user chose hide cards only.
- Sitemap exclusion — planner discretion if trivial.
