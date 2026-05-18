# Roadmap: Appliance Store Lviv

## Milestones

- 🚧 **v1.2 Polish & UX** — Phases 11–16 (planning 2026-05-18)
- ✅ **v1.1 Engagement & Fixes** — Phases 7–10 (shipped 2026-05-17) — [archive](milestones/v1.1-ROADMAP.md) · [requirements](milestones/v1.1-REQUIREMENTS.md)
- ✅ **v1.0 Appliance Store MVP** — Phases 1–6 (shipped 2026-05-17) — [archive](milestones/v1.0-ROADMAP.md) · [requirements](milestones/v1.0-REQUIREMENTS.md)

## Phases

### v1.2 Polish & UX

#### Phase 11: Admin List Row UX

**Goal:** Єдиний патерн адмін-таблиць — клік по рядку, plus на CTA, без зайвих action-колонок.

**Requirements:** ADM-ORD-01, ADM-CAT-01, ADM-CAT-02, ADM-PRD-01, UX-02

**Success criteria:**

1. Замовлення відкриваються кліком по рядку; «Відкрити» відсутня
2. Категорії відкриваються кліком по рядку; «Редагувати» відсутня; «Додати категорію» з Plus
3. «Додати товар» з Plus; рядки товарів з `cursor-pointer` (існуючий row-click збережено)
4. Клікабельні admin rows мають focus/hover стани для клавіатури

**Plans:** 5 plans

Plans:
**Wave 1**

- [x] 11-01-PLAN.md — Shared clickable-row helper + Vitest + client hook

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 11-02-PLAN.md — Products table refactor + Plus on «Додати товар»
- [x] 11-03-PLAN.md — Orders table row-click; remove «Відкрити»

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 11-04-PLAN.md — Categories client table + Plus CTA
- [x] 11-05-PLAN.md — Dashboard recent orders + manual checklist

---

#### Phase 12: Admin Tables — Status & Sort

**Goal:** Inline зміна статусу замовлення та сортування таблиці товарів.

**Requirements:** ADM-ORD-02, ADM-PRD-02

**Success criteria:**

1. Клік по бейджу статусу в orders table відкриває shadcn control; зміна статусу зберігається з валідацією переходів
2. Select статусу не тригерить navigation row-click (`stopPropagation`)
3. Таблиця товарів сортується по колонках (URL або client pattern як orders)
4. Vitest/e2e smoke для sort URL або table headers

**Plans:** 3 plans

Plans:
**Wave 1**

- [x] 12-01-PLAN.md — Verify ADM-ORD-02 (OrderListStatusSelect) + Vitest stopPropagation

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 12-02-PLAN.md — Products sort backend: validator, Prisma orderBy, products-url + tests

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 12-03-PLAN.md — Products sort UI headers + wire page/filters/pagination + manual checklist

---

#### Phase 13: Product Stock Quantity

**Goal:** Облік кількості однакових одиниць товару лише в адмінці.

**Requirements:** ADM-PRD-03

**Success criteria:**

1. Prisma поле `quantity` на Product; міграція застосована (D-13-01–02)
2. Create/edit form: поле «Кількість» — create min 1 default 1; edit min 0 max 999 (D-13-08–11)
3. Admin list показує колонку «Кількість» без сорту; storefront без відображення quantity (D-13-12–13)
4. Checkout атомарно decrement quantity; SOLD лише при quantity === 0 (D-13-04–07)

**Plans:** 4 plans

Plans:
**Wave 1**

- [x] 13-01-PLAN.md — Prisma schema + migration + generate (blocking)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 13-02-PLAN.md — Checkout decrement, cart/catalog/wishlist guards, unit tests
- [x] 13-03-PLAN.md — Admin Zod + admin-product.service persistence

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 13-04-PLAN.md — Admin form/table UI + e2e

---

#### Phase 14: Admin Chat Context Menu

**Goal:** Швидкий lifecycle чату зі списку без відкриття треда.

**Requirements:** ADM-CHAT-01

**Success criteria:**

1. ПКМ по рядку чату в inbox відкриває DropdownMenu/context menu
2. Пункти: архівувати / розархівувати (за статусом) / видалити з підтвердженням
3. Ті самі server actions що ⋮ у `chat-thread.tsx`
4. Лівий клік лишається відкриттям треда; меню не ламає mobile long-press де недоступно

**Plans:** TBD (`/gsd-plan-phase 14`)

---

#### Phase 15: Storefront Catalog Polish

**Goal:** Чистіший каталог — без порожніх категорій, badge counts, пагінація 16.

**Requirements:** CAT-04, CAT-05, CAT-06

**Success criteria:**

1. Категорії з 0 AVAILABLE товарів не в header, homepage grid, catalog sidebar
2. Count у sidebar — shadcn Badge
3. `/katalog` і category pages: max 16 products, pagination UI як admin tovary
4. URL param `storinka` (або існуючий) синхронізований з nuqs
5. e2e або Vitest: empty category hidden; pagination changes page

**Plans:** TBD (`/gsd-plan-phase 15`)

---

#### Phase 16: Shadcn Select Audit & Verify

**Goal:** Консистентні shadcn контроли; верифікація gallery і auto slug.

**Requirements:** UX-01, POL-01, POL-02

**Success criteria:**

1. Немає native `<select>` у `src/components` та admin forms (grep clean)
2. `catalog-toolbar` sort — shadcn Select
3. PDP gallery: multi-image, dialog, mobile — manual checklist pass
4. Create product/category: slug auto; create UI без slug input
5. `npm run build` і тести green

**Plans:** TBD (`/gsd-plan-phase 16`)

---

<details>
<summary>✅ v1.1 Engagement & Fixes (Phases 7–10) — SHIPPED 2026-05-17</summary>

- [x] Phase 7: Catalog Filters Fix (4/4 plans)
- [x] Phase 8: Admin UX & Chat Lifecycle (7/7 plans)
- [x] Phase 9: Wishlist (5/5 plans)
- [x] Phase 10: Category Showcase Images (4/4 plans)

See [milestones/v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md).

</details>

<details>
<summary>✅ v1.0 Appliance Store MVP (Phases 1–6) — SHIPPED 2026-05-17</summary>

See [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md).

</details>

## Progress

| Milestone | Phases | Plans | Status |
|-----------|--------|-------|--------|
| v1.2 Polish & UX | 6 (11–16) | 0 | 🚧 Planning |
| v1.1 Engagement & Fixes | 4 | 20 | ✅ Shipped 2026-05-17 |
| v1.0 MVP | 6 | 36 | ✅ Shipped 2026-05-17 |

---
*Roadmap updated: 2026-05-18 — v1.2 milestone initialized*
