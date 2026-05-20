# Roadmap: Appliance Store Lviv

## Milestones

- **v2.0 Polish, UX & Admin analytics** — Phases 28–36 (planning 2026-05-20) — [requirements](REQUIREMENTS.md)
- ✅ **v1.5 Incremental polish & operator UX** — Phases 22–27 (shipped 2026-05-19) — [archive](milestones/v1.5-ROADMAP.md) · [requirements](milestones/v1.5-REQUIREMENTS.md)
- ✅ **v1.4 Bugfix stabilization** — Phase 21 (shipped 2026-05-19) — [archive](milestones/v1.4-ROADMAP.md) · [requirements](milestones/v1.4-REQUIREMENTS.md)
- ✅ **v1.3 Fixes & Admin UX** — Phases 17–20 (shipped 2026-05-19) — [archive](milestones/v1.3-ROADMAP.md) · [requirements](milestones/v1.3-REQUIREMENTS.md)
- ✅ **v1.2 Polish & UX** — Phases 11–16 (shipped 2026-05-19) — [archive](milestones/v1.2-ROADMAP.md) · [requirements](milestones/v1.2-REQUIREMENTS.md)
- ✅ **v1.1 Engagement & Fixes** — Phases 7–10 (shipped 2026-05-17) — [archive](milestones/v1.1-ROADMAP.md) · [requirements](milestones/v1.1-REQUIREMENTS.md)
- ✅ **v1.0 Appliance Store MVP** — Phases 1–6 (shipped 2026-05-17) — [archive](milestones/v1.0-ROADMAP.md) · [requirements](milestones/v1.0-REQUIREMENTS.md)

## Phases

### Phase 28: Nav, homepage & catalog labels

**Goal:** Мобільна навігація повна; головна й каталог зрозуміліші для покупця.

**Requirements:** NAV-01, HOME-04, HOME-05, CAT-02

**Success criteria:**

1. У mobile drawer під callback є «Увійти» / «Реєстрація» для гостя
2. Клік `#kategorii` — smooth scroll до блоку категорій
3. На картках категорій видно count; порожні категорії не показуються
4. Select сортування на `/katalog` показує «Найновіші», «Дорожче», «Дешевше»

**Plans:** 4/4 plans complete

Plans:
**Wave 1**

- [x] 28-01-PLAN.md — Shared StorefrontAuthLinks + drawer session auth (NAV-01)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 28-02-PLAN.md — Storefront-scoped smooth scroll CSS for #kategorii (HOME-04)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 28-03-PLAN.md — Homepage category count badges + formatCategoryCountBadge (HOME-05)

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 28-04-PLAN.md — Catalog sort labels map + toolbar dedupe (CAT-02)

---

### Phase 29: Product cards & PDP core UX

**Goal:** Картки й PDP відчуваються плавними; кошик на PDP без зайвих кнопок.

**Requirements:** CARD-01, PDP-05, PDP-06

**Success criteria:**

1. Desktop hover на multi-image card — fade кожні ~3 с
2. Lightbox swipe без jerk після release
3. «Вже в кошику» + trash icon; FAB кошика над чатом; без трьох кнопок з disabled

**Plans:** 3/3 plans complete

**Wave 1** *(parallel)*

- [x] 29-01-PLAN.md — Catalog previewImages + card hover crossfade (CARD-01)
- [x] 29-02-PLAN.md — Lightbox Embla snap tuning (PDP-05)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 29-03-PLAN.md — PDP in-cart UI + PdpCartFab above chat (PDP-06)

---

### Phase 30: Similar products & footer layout

**Goal:** PDP допомагає вибору; footer акуратний на desktop.

**Requirements:** PDP-07, FOOT-05

**Success criteria:**

1. Секція «Схожі товари» з тієї ж категорії ±20% ціни, без поточного SKU
2. Footer: map | contacts+form; © по центру на desktop

**Plans:** 2/2 plans complete

Plans:
- [x] 30-01-PLAN.md — Similar products query, tests, PDP section (PDP-07)
- [x] 30-02-PLAN.md — Footer desktop map | contacts+form; © centered (FOOT-05)

---

### Phase 31: Order status UX & bugfix

**Goal:** Оператор бачить статуси з першого погляду; критичний bug підтвердження закритий.

**Requirements:** ORD-05, BUG-24

**Success criteria:**

1. Колонка статусу з легким кольоровим акцентом за статусом
2. Select не обрізає «Підтверджено (поточний)»
3. ASL-20260519-0013 → CONFIRMED проходить (або задокументована причина + fix)
4. Vitest на регресію transition/stock

**Plans:** 1/1 plans complete

Plans:
- [x] 31-01-PLAN.md — Shared status errors/accents; fix list INSUFFICIENT_STOCK mapping; Vitest + ASL verification

---

### Phase 32: Admin dashboard polish

**Goal:** Головна адмінки швидко орієнтує оператора.

**Requirements:** ADM-DASH-03, ADM-DASH-04

**Success criteria:**

1. «Додати товар» — primary blue + Plus; «Переглянути замовлення» — Eye
2. Три stat-картки з lucide-іконками

**Plans:** 1/1 plans complete

Plans:
- [x] 32-01-PLAN.md — Update dashboard action buttons + StatCard icons (ADM-DASH-03, ADM-DASH-04)

---

### Phase 33: Admin categories DnD & links

**Goal:** Категорії зручно сортувати й переходити до товарів.

**Requirements:** ADM-CAT-05, ADM-CAT-06

**Success criteria:**

1. «Переглянути (N)» виглядає як link (hover/focus)
2. Drag & drop зберігає порядок у БД; refresh зберігає order
3. Vitest або manual checklist для reorder API

**Plans:** 4/4 plans complete

Plans:

**Wave 1**

- [x] 33-01-PLAN.md — Package legitimacy checkpoint + install @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (ADM-CAT-06)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 33-02-PLAN.md — reorderCategories service method + Vitest unit tests (ADM-CAT-06)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 33-03-PLAN.md — reorderCategoriesAction server action with requireAdmin + input validation (ADM-CAT-06)

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 33-04-PLAN.md — AdminCategoriesTable DnD rewrite + Переглянути link styling + human verify (ADM-CAT-05, ADM-CAT-06)

---

### Phase 34: Admin analytics

**Goal:** Оператор бачить продажі, виручку, дзвінки та тренди.

**Requirements:** AN-01, AN-02

**Success criteria:**

1. `/admin/analityka` — KPI + графіки (замовлення, виручка, callbacks тощо)
2. Dashboard прев'ю — ≤2 графіки перед «Останні замовлення»
3. Дані з існуючих Prisma таблиць (без фейкових mock)

**Plans:** 5/5 plans complete

Plans:

**Wave 0**

- [x] 34-01-PLAN.md — analytics service test scaffold: getAnalyticsData stubs, BigInt conversion, zero-fill tests (AN-01)

**Wave 1** *(parallel, both blocked on Wave 0)*

- [x] 34-02-PLAN.md — shadcn chart install + admin-analytics.service.ts: getAnalyticsData, getDashboardAnalyticsPreview, fillDays, formatRevenue (AN-01, AN-02)
- [x] 34-03-PLAN.md — Admin nav item «Аналітика» + PeriodSelector component (AN-01)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 34-04-PLAN.md — AnalyticsCharts + AnalyticsDashboardPreview client components (AN-01, AN-02)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 34-05-PLAN.md — /admin/analityka page + dashboard preview wiring + human verify (AN-01, AN-02)

---

### Phase 35: Callback calls (Дзвінки)

**Goal:** Заявки на дзвінок — окремий робочий простір зі статусами й архівом.

**Requirements:** CALL-01, CALL-02, CALL-03, CALL-04

**Success criteria:**

1. Немає таблиці дзвінків на `/admin/nalashtuvannia`
2. `/admin/dzvinky` — список, зміна статусу, нотатка, архів
3. Prisma migration для status/note/archivedAt якщо потрібно

**Plans:** 0/0

---

### Phase 36: Admin sidebar badges

**Goal:** Sidebar показує що потребує уваги оператора.

**Requirements:** ADM-NAV-01

**Success criteria:**

1. Категорії / товари — total count badges
2. Замовлення — pending/active count (узгоджене правило в UI-SPEC або CONTEXT)
3. Чати / дзвінки — лише невирішені, не total
4. Performance: один aggregated query або RSC cache, без N+1 на кожен nav render

**Plans:** 0/0

---

## Progress

| Milestone | Phases | Plans | Status |
|-----------|--------|-------|--------|
| v2.0 Polish, UX & Admin analytics | 9 (28–36) | 0 | Planning |
| v1.5 Incremental polish | 6 (22–27) | 8 | ✅ Shipped 2026-05-19 |
| v1.4 Bugfix stabilization | 1 (21) | 1 | ✅ Shipped 2026-05-19 |
| v1.3 Fixes & Admin UX | 4 (17–20) | 7 | ✅ Shipped 2026-05-19 |
| v1.2 Polish & UX | 6 (11–16) | 21 | ✅ Shipped 2026-05-19 |
| v1.1 Engagement & Fixes | 4 (7–10) | 20 | ✅ Shipped 2026-05-17 |
| v1.0 MVP | 6 (1–6) | 36 | ✅ Shipped 2026-05-17 |
