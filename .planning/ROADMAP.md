# Roadmap: Appliance Store Lviv

## Milestones

- ✅ **v1.0 Appliance Store MVP** — Phases 1–6 (shipped 2026-05-17) — [archive](milestones/v1.0-ROADMAP.md) · [requirements](milestones/v1.0-REQUIREMENTS.md)
- 🚧 **v1.1 Engagement & Fixes** — Phases 7–10 (planning)

## Current: v1.1 Engagement & Fixes

**Goal:** Wishlist без merge, виправлення каталогу й адмінки, shadcn Sidebar/Slider/Data Table, зображення категорій на головній.

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 7 | Catalog Filters Fix | 3/4 | In Progress|  |
| 8 | Admin UX & Chat Lifecycle | shadcn admin shell, orders table, chat states | FIX-01, ADM-01–03, CHAT-05–06 | 5 |
| 9 | Wishlist | Обране для гостя й юзера без merge | WISH-01–05 | 5 |
| 10 | Category Showcase Images | Картинки категорій на головній + адмін | HOME-01, HOME-02 | 4 |

### Phase 7: Catalog Filters Fix

**Goal:** Каталог фільтрує ціну й бренди коректно; UX ціни через Slider.

**Requirements:** CAT-01, CAT-02, CAT-03

**Success criteria:**
1. На `/katalog?cina-vid=13000` не показуються товари дешевші за 13 000 ₴
2. Slider синхронізує `cina-vid` / `cina-do` в URL і скидає сторінку на 1
3. На `/katalog/telephony` у фільтрі брендів немає Bosch/Whirlpool тощо, якщо в категорії їх немає
4. Vitest покриває `parsersToFilters` і `getDistinctBrands(categoryId?)`
5. Playwright або manual checklist: зміна slider → оновлений grid

**Plans:** 3/4 plans executed

**Wave 1** *(foundation — service + slider install)*
- [x] 07-01-PLAN.md — `getDistinctBrands(categoryId?)`, `getCatalogPriceBounds`, wire pages, shadcn slider

**Wave 2** *(blocked on Wave 1 — interactive UX)*
- [x] 07-02-PLAN.md — Dual-thumb Slider, throttle 200ms, mobile filter sheet
- [x] 07-03-PLAN.md — Invalid `brend` guard, active filter chips

**Wave 3** *(blocked on Wave 2+3 — verification)*
- [ ] 07-04-PLAN.md — Vitest expansion, manual checklist, e2e regression

**Cross-cutting constraints:**
- URL keys `cina-vid`, `cina-do`, `brend`, `сторінка` unchanged
- Price stored/filtered in kopiyky; UI in UAH step 50
- No new Playwright price/slider spec (manual checklist only)

---

### Phase 8: Admin UX & Chat Lifecycle

**Goal:** Адмінка на shadcn Sidebar + Data Table; керування життєвим циклом чатів; дрібні фікси.

**Requirements:** FIX-01, ADM-01, ADM-02, ADM-03, CHAT-05, CHAT-06

**Success criteria:**
1. «Чернетки» на dashboard → `/admin/tovary?status=DRAFT`
2. Admin layout використовує `@/components/ui/sidebar` pattern (collapsible на mobile)
3. `/admin/zamovlennia` — пагінація, page size 10/20/50, сортування колонок де доречно
4. Таблиця категорій без колонки Slug
5. Адмін архівує чат → зникає з активного списку, доступний у «Архів»
6. Адмін видаляє чат після confirm → записів немає в БД

**Plans:** TBD via `/gsd-plan-phase 8`

**Notes:**
- Prisma: `ConversationStatus` enum (`OPEN` | `ARCHIVED`) + optional `deletedAt` або hard delete policy
- Встановити shadcn: `sidebar`, `slider`, `data-table` (+ `table`, `pagination` якщо ще немає)

---

### Phase 9: Wishlist

**Goal:** Обране для гостя (localStorage) і залогіненого (БД) без merge при логіні.

**Requirements:** WISH-01, WISH-02, WISH-03, WISH-04, WISH-05

**Success criteria:**
1. Гість додає товар → badge/іконка «в обраному»; після reload — на місці
2. Залогінений юзер має свій список у БД
3. Гість додає 3 товари → логін → wishlist юзера **не** містить ці 3 (окремі списки)
4. Сторінка `/obrane` (або кабінет) показує доступні товари; sold/draft приховані
5. Unit tests на storage key і server actions

**Plans:** TBD via `/gsd-plan-phase 9`

**Notes:**
- Prisma: `WishlistItem` (userId, productId) unique
- Guest key: `appliance-wishlist-guest` (аналог cart pending, **без** merge gate)

---

### Phase 10: Category Showcase Images

**Goal:** Головна показує зображення категорій; адмін керує ними.

**Requirements:** HOME-01, HOME-02

**Success criteria:**
1. Кожна картка в секції «Категорії» має зображення (fallback placeholder якщо немає)
2. Адмін на `/admin/kategorii/[id]` завантажує/змінює image через signed widget
3. `Category.imagePublicId` (або аналог) у Prisma + revalidate homepage
4. Зображення оптимізовані (CldImage, sizes для grid)
5. Seed/migration не ламає існуючі категорії

**Plans:** TBD via `/gsd-plan-phase 10`

---

## Progress

| Milestone | Phases | Plans | Status |
|-----------|--------|-------|--------|
| v1.0 MVP | 6 | 36 | ✅ Shipped 2026-05-17 |
| v1.1 Engagement & Fixes | 4 | 0 | 🚧 Planning |

---
*Roadmap updated: 2026-05-17 — milestone v1.1*
