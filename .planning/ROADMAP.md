# Roadmap: Appliance Store Lviv

## Milestones

- 🚧 **v1.5 Incremental polish & operator UX** — Phases 22–27 (planning) — [requirements](REQUIREMENTS.md)
- ✅ **v1.4 Bugfix stabilization** — Phase 21 (shipped 2026-05-19) — [archive](milestones/v1.4-ROADMAP.md) · [requirements](milestones/v1.4-REQUIREMENTS.md)
- ✅ **v1.3 Fixes & Admin UX** — Phases 17–20 (shipped 2026-05-19) — [archive](milestones/v1.3-ROADMAP.md) · [requirements](milestones/v1.3-REQUIREMENTS.md)
- ✅ **v1.2 Polish & UX** — Phases 11–16 (shipped 2026-05-19) — [archive](milestones/v1.2-ROADMAP.md) · [requirements](milestones/v1.2-REQUIREMENTS.md)
- ✅ **v1.1 Engagement & Fixes** — Phases 7–10 (shipped 2026-05-17) — [archive](milestones/v1.1-ROADMAP.md) · [requirements](milestones/v1.1-REQUIREMENTS.md)
- ✅ **v1.0 Appliance Store MVP** — Phases 1–6 (shipped 2026-05-17) — [archive](milestones/v1.0-ROADMAP.md) · [requirements](milestones/v1.0-REQUIREMENTS.md)

## Phases

### Phase 22: Delivery-aware order status

**Goal:** Адмін не може випадково поставити статус доставки для самовивозу і навпаки.

**Requirements:** ORD-03, ORD-04

**Success criteria:**

1. Для замовлення `PICKUP` у select немає `OUT_FOR_DELIVERY`
2. Для замовлення `LVIV_DELIVERY` у select немає `READY_FOR_PICKUP`
3. API повертає помилку при спробі недопустимого переходу
4. Vitest покриває матрицю delivery × status

**Plans:** 1/1 plans complete

Plans:
- [x] `22-01-PLAN.md` — delivery-aware status lib, server enforcement, admin selects + Vitest

---

### Phase 23: Admin category polish

**Goal:** Швидша навігація між категоріями і товарами в адмінці.

**Requirements:** ADM-CAT-03, ADM-CAT-04

**Success criteria:**

1. На edit category кнопки мають іконки (lucide) з aria-label
2. Список категорій має колонку «Товари» → «Переглянути» з правильним `categoryId`
3. Row-click edit категорії не зламаний

**Plans:** 1/1 plans complete

Plans:
- [ ] `23-01-PLAN.md` — edit toolbar icons (ADM-CAT-03), list «Товари» link column + Vitest (ADM-CAT-04)

---

### Phase 24: Product edit auto-save UX

**Goal:** Редагування товару без зайвих кліків «Зберегти» і з зрозумілою навігацією.

**Requirements:** ADM-PRD-05

**Success criteria:**

1. «Назад» над заголовком «Редагувати товар»
2. Зміни полів зберігаються автоматично (throttle), toast при помилці
3. Немає кнопок «Зберегти» і «На вітрині»
4. Видалити — icon trash top-right, confirm dialog як на list

**Plans:** 1 plan

Plans:
- [ ] `24-01-PLAN.md` — Wave 0: debounce + useProductAutoSave tests; Wave 1: edit shell, header delete, auto-save form (ADM-PRD-05)

---

### Phase 25: Homepage empty categories

**Goal:** Головна не показує порожні категорії — як навігація в хедері.

**Requirements:** HOME-03

**Success criteria:**

1. `CategoryGrid` використовує той самий filter, що `categoriesWithAvailableProducts`
2. Після purge/seed порожні категорії не рендеряться
3. Build + існуючі catalog tests green

**Plans:** 0/0

---

### Phase 26: Footer & mobile contact

**Goal:** Покупець бачить контакти і може залишити номер для дзвінка з футера або мобільного меню.

**Requirements:** FOOT-01, FOOT-02, FOOT-03, FOOT-04

**Success criteria:**

1. Footer: телефон (tel:), email (mailto:), форма callback
2. Mobile drawer: під категоріями — та сама форма
3. Mobile drawer: біля категорії показано `productCount` для available товарів
4. Валідація телефону (UA) + success/error feedback

**Plans:** 0/0

---

### Phase 27: Human UAT closure

**Goal:** Закрити відкладений operator UAT після purge та критичні flows v1.5.

**Requirements:** UAT-01

**Success criteria:**

1. `19-MANUAL-CHECKLIST.md` пройдено або задокументовано gap
2. Smoke: guest checkout, admin orders, purge empty state
3. Intake v1.5 рядки → done після verify фаз 22–26

**Plans:** 0/0

---

## Progress

| Milestone | Phases | Plans | Status |
|-----------|--------|-------|--------|
| v1.5 Incremental polish | 6 (22–27) | 1 | 🚧 Planning |
| v1.4 Bugfix stabilization | 1 (21) | 1 | ✅ Shipped 2026-05-19 |
| v1.3 Fixes & Admin UX | 4 (17–20) | 7 | ✅ Shipped 2026-05-19 |
| v1.2 Polish & UX | 6 (11–16) | 21 | ✅ Shipped 2026-05-19 |
| v1.1 Engagement & Fixes | 4 (7–10) | 20 | ✅ Shipped 2026-05-17 |
| v1.0 MVP | 6 (1–6) | 36 | ✅ Shipped 2026-05-17 |
