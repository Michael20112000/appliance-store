# Phase 9: Wishlist - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-17
**Phase:** 9-wishlist
**Areas discussed:** Wishlist pages & nav, Header badge, Catalog/PDP toggle, Post-login behavior, Unavailable rows, Cap & toasts

---

## 1. Де живе список обраного

| Option | Description | Selected |
|--------|-------------|----------|
| Окрема `/obrane` + header link | Повний список на dedicated URL | ✓ (частина) |
| Секція в `/kabinet` only | Без окремого URL | |
| Обидва | `/obrane` основна + прев’ю в кабінеті + «Дивитись усе» | ✓ |

**User's choice:** Обидва: `/obrane` основна, у кабінеті короткий блок + «Дивитись усе»
**Notes:** Planner discretion: до 3 карток у прев’ю (D-09-02).

---

## 2. Іконка в хедері для гостя

| Option | Description | Selected |
|--------|-------------|----------|
| Heart + badge для гостя (LS) і юзера (БД) | Завжди в header | ✓ |
| Тільки для залогінених | | |
| Heart всім, badge якщо count > 0 | | |

**User's choice:** Heart + badge і для гостя (з localStorage), і для юзера (з БД)

---

## 3. Кнопка на картці каталогу

| Option | Description | Selected |
|--------|-------------|----------|
| Heart overlay, stopPropagation | Не відкриває товар | ✓ |
| Кнопка під ціною | | |
| Тільки PDP | | |

**User's choice:** Heart у куті зображення (overlay), клік не відкриває товар + Sonner що товар додано
**Notes:** Також toast на зняття — «Прибрано з обраного» (D-09-12).

---

## 4. Після логіну — два списки

| Option | Description | Selected |
|--------|-------------|----------|
| Тихо БД, guest-key в тіні до logout | Без toast про гостєвий список | ✓ |
| Toast про гостєвий список | | |
| Банер на `/obrane` | | |

**User's choice:** Тихо перемикаємось на БД, guest-key лишається «в тіні» до logout

---

## 5. Sold / draft у списку

| Option | Description | Selected |
|--------|-------------|----------|
| Тихо приховати | | |
| Рядок «Товар більше недоступний» без купити | | ✓ |
| Auto-remove при відкритті | | |

**User's choice:** Рядок «Товар більше недоступний» без кнопки купити

---

## 6. Ліміт і зворотний зв’язок

| Option | Description | Selected |
|--------|-------------|----------|
| Cap 20 як cart pending | | ✓ |
| Без ліміту | | |
| Toast «Додано»/«Прибрано» | | ✓ |
| Лише зміна іконки (як кошик) | | |

**User's choice:** Такий самий cap для guest wishlist + Toast «Додано» / «Прибрано»
**Notes:** Іконка теж оновлюється; toast на add і remove (не icon-only).

---

## Claude's Discretion

- Прев’ю в кабінеті: до 3 товарів.
- Empty states copy.
- Server vs client badge fetch for logged-in users.

## Deferred Ideas

- Auto-prune unavailable from wishlist
- Merge on login (out of scope project-wide)
