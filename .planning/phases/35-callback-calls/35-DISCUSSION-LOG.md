# Phase 35: Callback calls (Дзвінки) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-20
**Phase:** 35-callback-calls
**Areas discussed:** list_archive, status_flow, notes_ux, nav_discover (all auto-resolved)

---

## Список і архів

| Option | Description | Selected |
|--------|-------------|----------|
| Таби Active / Archive (URL `?view=`) | Як OrderListFilters — знайомий патерн | ✓ |
| Окрема сторінка /admin/dzvinky/archive | Другий route | |
| Один список + checkbox «Показати архів» | Менше URL state | |

**User's choice:** «все на твій вибір аби зручно було»
**Notes:** Archive only when CONSULTED; one-way archive for v1.

---

## Статуси

| Option | Description | Selected |
|--------|-------------|----------|
| 2 статуси (CALL-02) | PENDING + CONSULTED | ✓ |
| 3+ статуси | Не в requirements | |
| Select у рядку таблиці | Як order-list-status-select | ✓ |
| Окрема detail page | Overkill для callback | |

**User's choice:** Claude discretion (aligned with CALL-02)

---

## Нотатка

| Option | Description | Selected |
|--------|-------------|----------|
| Textarea в таблиці + «Зберегти» | Мінімум кліків, видно контекст | ✓ |
| Sheet/Dialog по кліку рядка | Більше кліків | |
| Auto-save on blur | Ризик випадкових змін | |

**User's choice:** Claude discretion

---

## Навігація

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar «Дзвінки» зараз | CALL-01 потребує discoverability | ✓ |
| Тільки URL без nav до Phase 36 | Гірше UX | |
| Badge count | Phase 36 | deferred |

**User's choice:** Claude discretion

---

## Claude's Discretion

- Server action split vs combined mutations
- Table component refactor depth
- Exact nav item ordering in sidebar

## Deferred Ideas

- Unarchive, pagination, extra statuses, operator notifications — see CONTEXT.md `<deferred>`
