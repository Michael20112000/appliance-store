# Roadmap: Appliance Store Lviv

## Milestones

- ✅ **v2.0 Polish, UX & Admin analytics** — Phases 28–36 (shipped 2026-05-21) — [archive](milestones/v2.0-ROADMAP.md) · [requirements](milestones/v2.0-REQUIREMENTS.md)
- ✅ **v1.5 Incremental polish & operator UX** — Phases 22–27 (shipped 2026-05-19) — [archive](milestones/v1.5-ROADMAP.md) · [requirements](milestones/v1.5-REQUIREMENTS.md)
- ✅ **v1.4 Bugfix stabilization** — Phase 21 (shipped 2026-05-19) — [archive](milestones/v1.4-ROADMAP.md) · [requirements](milestones/v1.4-REQUIREMENTS.md)
- ✅ **v1.3 Fixes & Admin UX** — Phases 17–20 (shipped 2026-05-19) — [archive](milestones/v1.3-ROADMAP.md) · [requirements](milestones/v1.3-REQUIREMENTS.md)
- ✅ **v1.2 Polish & UX** — Phases 11–16 (shipped 2026-05-19) — [archive](milestones/v1.2-ROADMAP.md) · [requirements](milestones/v1.2-REQUIREMENTS.md)
- ✅ **v1.1 Engagement & Fixes** — Phases 7–10 (shipped 2026-05-17) — [archive](milestones/v1.1-ROADMAP.md) · [requirements](milestones/v1.1-REQUIREMENTS.md)
- ✅ **v1.0 Appliance Store MVP** — Phases 1–6 (shipped 2026-05-17) — [archive](milestones/v1.0-ROADMAP.md) · [requirements](milestones/v1.0-REQUIREMENTS.md)

## Phases

<details>
<summary>✅ v2.0 Polish, UX & Admin analytics (Phases 28–36) — SHIPPED 2026-05-21</summary>

- [x] Phase 28: Nav, homepage & catalog labels — 4/4 plans complete
- [x] Phase 29: Product cards & PDP core UX — 3/3 plans complete
- [x] Phase 30: Similar products & footer layout — 2/2 plans complete
- [x] Phase 31: Order status UX & bugfix — 1/1 plans complete
- [x] Phase 32: Admin dashboard polish — 1/1 plans complete
- [x] Phase 33: Admin categories DnD & links — 4/4 plans complete
- [x] Phase 34: Admin analytics — 5/5 plans complete
- [x] Phase 35: Callback calls (Дзвінки) — 3/3 plans complete
- [x] Phase 36: Admin sidebar badges — 3/3 plans complete

Full phase details: [milestones/v2.0-ROADMAP.md](milestones/v2.0-ROADMAP.md)

</details>

### v2.1 Fixes & UX (In Progress)

**Milestone Goal:** Допрацювати адмін-дашборд і UX адмін-сторінок — повноцінні дані, автозбереження, зручніші дії.

- [x] **Phase 37: Dashboard StatCards** - Два нові StatCard для дзвінків і чатів на /admin
- [ ] **Phase 38: Dashboard Data Completeness** - Повноцінні графіки аналітики і розширена таблиця замовлень на дашборді
- [ ] **Phase 39: Calls Auto-save & Categories Table Actions** - Автозбереження нотатки дзвінка + колонки порядкового номера і дій у таблиці категорій
- [ ] **Phase 40: Category Edit UX** - Автозбереження і icon-trash на сторінці редагування категорії

## Phase Details

### Phase 37: Dashboard StatCards
**Goal**: Адмін-дашборд відображає StatCard для нових дзвінків і активних чатів поруч з існуючими StatCards
**Depends on**: Phase 36
**Requirements**: ADM-DASH-05, ADM-DASH-06
**Success Criteria** (what must be TRUE):
  1. Адмін бачить StatCard «Нові дзвінки» з актуальним лічильником непрочитаних/нових дзвінків на /admin
  2. Адмін бачить StatCard «Активні чати» з кількістю непрочитаних повідомлень на /admin
  3. Обидва нові StatCards відображаються поруч з існуючими (замовлення, товари тощо) без порушення лейауту
**Plans**: 1 plan
Plans:
- [x] 37-01-PLAN.md — Add «Нові дзвінки» and «Активні чати» StatCards to dashboard (ADM-DASH-05, ADM-DASH-06)
**UI hint**: yes

### Phase 38: Dashboard Data Completeness
**Goal**: Адмін-дашборд містить повноцінні графіки аналітики і повну таблицю останніх замовлень
**Depends on**: Phase 37
**Requirements**: ADM-DASH-07, ADM-DASH-08
**Success Criteria** (what must be TRUE):
  1. Дашборд показує ті самі графіки (замовлення і виручка), що й /admin/analityka — ідентичний вигляд і дані
  2. Таблиця «Останні замовлення» на дашборді відповідає структурі таблиці з /admin/zamovlennia: ті самі колонки, статуси з акцентами, row-click навігація
  3. Таблиця показує максимум 10 рядків і не містить фільтр-табів і пагінації
  4. Адмін може клацнути рядок у таблиці і потрапити на сторінку замовлення
**Plans**: TBD
**UI hint**: yes

### Phase 39: Calls Auto-save & Categories Table Actions
**Goal**: Нотатка дзвінка зберігається автоматично; таблиця категорій показує порядковий номер і кнопки дій
**Depends on**: Phase 37
**Requirements**: CALL-05, ADM-CAT-07, ADM-CAT-08
**Success Criteria** (what must be TRUE):
  1. Оператор вводить текст у поле нотатки дзвінка — зміни зберігаються автоматично через ~400мс після зупинки введення, кнопки «Зберегти» немає
  2. Таблиця категорій відображає колонку з порядковим номером (1, 2, 3…), що оновлюється після DnD-перестановки рядків
  3. Таблиця категорій має колонку «Дії» з кнопкою «Додати товар» (веде до форми нового товару з передвибраною категорією)
  4. Колонка «Дії» містить кнопку «Видалити» з діалогом підтвердження перед видаленням категорії
**Plans**: TBD
**UI hint**: yes

### Phase 40: Category Edit UX
**Goal**: Сторінка редагування категорії автозберігає зміни і має icon-only trash для видалення
**Depends on**: Phase 39
**Requirements**: ADM-CAT-09, ADM-CAT-10
**Success Criteria** (what must be TRUE):
  1. Адмін редагує поля категорії — зміни зберігаються автоматично без кнопки «Зберегти», аналогічно /admin/tovary/[id]
  2. Кнопки «Зберегти» немає на сторінці редагування категорії
  3. У правому верхньому куті сторінки редагування категорії розташована icon-only trash-кнопка для видалення категорії
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 37. Dashboard StatCards | 0/1 | Not started | - |
| 38. Dashboard Data Completeness | 0/TBD | Not started | - |
| 39. Calls Auto-save & Categories Table Actions | 0/TBD | Not started | - |
| 40. Category Edit UX | 0/TBD | Not started | - |
