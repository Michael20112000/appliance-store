# Phase 39: Calls Auto-save & Categories Table Actions - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 39-Calls Auto-save & Categories Table Actions
**Areas discussed:** Фідбек автозбереження нотатки, Помилки й архів, Колонка №, Підтвердження видалення, Верстка «Дії»

---

## Фідбек автозбереження нотатки

| Option | Description | Selected |
|--------|-------------|----------|
| Toast на кожен save | Поточна поведінка кнопки «Зберегти» | |
| Тихий status «Збереження…/Збережено» | Як `ProductEditHeader` | ✓ |
| Без фідбеку взагалі | | |

**User's choice:** Усі зони; «зручно і красиво», консистентно з проектом — делеговано патерну product edit.
**Notes:** Success toast прибрати; error toast лишити.

---

## Помилки й архів

| Option | Description | Selected |
|--------|-------------|----------|
| Rollback тексту | | |
| Toast + залишити текст | Як product auto-save | ✓ |
| Disable textarea | | |

**User's choice:** Консистентність з `useProductAutoSave` — не відкочувати, toast на error.
**Notes:** Archived rows уже read-only в archive view.

---

## Колонка порядкового номера

| Option | Description | Selected |
|--------|-------------|----------|
| Позиція в списку 1…N | index+1 після DnD | ✓ |
| sortOrder з БД | | |

**User's choice:** Відповідає success criteria ROADMAP («1, 2, 3… після перестановки»).

---

## Підтвердження видалення категорії

| Option | Description | Selected |
|--------|-------------|----------|
| window.confirm | Як `category-form` | |
| shadcn AlertDialog | Як `ProductListDeleteButton` | ✓ |

**User's choice:** Красивіше + консистентно з admin delete в таблицях/формах товарів.

---

## Верстка колонки «Дії»

| Option | Description | Selected |
|--------|-------------|----------|
| Дві текстові sm-кнопки | outline + destructive dialog trigger | ✓ |
| Icon-only | | |
| Dropdown menu | | |

**User's choice:** Текстові лейбли з requirements; stopPropagation як у «Переглянути».

---

## Claude's Discretion

- Ім'я hook, shared primitive з product autosave, точний порядок колонок, post-delete refresh vs local state update.

## Deferred Ideas

- Category edit auto-save + header trash → Phase 40
- Заміна window.confirm у category-form на AlertDialog → Phase 40 або окремий cleanup
