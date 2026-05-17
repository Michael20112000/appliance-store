# Roadmap: Appliance Store Lviv

## Milestones

- ✅ **v1.0 Appliance Store MVP** — Phases 1–6 (shipped 2026-05-17) — [archive](milestones/v1.0-ROADMAP.md) · [requirements](milestones/v1.0-REQUIREMENTS.md)
- 🚧 **v1.1 Engagement & Fixes** — Phases 7–10 (planning)

## Current: v1.1 Engagement & Fixes

**Goal:** Wishlist без merge, виправлення каталогу й адмінки, shadcn Sidebar/Slider/Data Table, зображення категорій на головній.

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 7 | Catalog Filters Fix | 4/4 | Complete   | 2026-05-17 |
| 8 | Admin UX & Chat Lifecycle | 7/7 | Complete   | 2026-05-17 |
| 9 | Wishlist | 5/5 | ✅ Complete   | 2026-05-17 |
| 10 | Category Showcase Images | Картинки категорій на головній + адмін | HOME-01, HOME-02 | — |

### Phase 7: Catalog Filters Fix

**Goal:** Каталог фільтрує ціну й бренди коректно; UX ціни через Slider.

**Requirements:** CAT-01, CAT-02, CAT-03

**Success criteria:**
1. На `/katalog?cina-vid=13000` не показуються товари дешевші за 13 000 ₴
2. Slider синхронізує `cina-vid` / `cina-do` в URL і скидає сторінку на 1
3. На `/katalog/telephony` у фільтрі брендів немає Bosch/Whirlpool тощо, якщо в категорії їх немає
4. Vitest покриває `parsersToFilters` і `getDistinctBrands(categoryId?)`
5. Playwright або manual checklist: зміна slider → оновлений grid

**Plans:** 4/4 plans complete

**Wave 1** *(foundation — service + slider install)*
- [x] 07-01-PLAN.md — `getDistinctBrands(categoryId?)`, `getCatalogPriceBounds`, wire pages, shadcn slider

**Wave 2** *(blocked on Wave 1 — interactive UX)*
- [x] 07-02-PLAN.md — Dual-thumb Slider, throttle 200ms, mobile filter sheet
- [x] 07-03-PLAN.md — Invalid `brend` guard, active filter chips

**Wave 3** *(blocked on Wave 2+3 — verification)*
- [x] 07-04-PLAN.md — Vitest expansion, manual checklist, e2e regression

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

**Plans:** 7/7 plans complete

**Wave 1** *(foundation — dashboard fix + sidebar shell)*
- [x] 08-01-PLAN.md — FIX-01 drafts href; shadcn sidebar/table/pagination/tabs install; AppSidebar layout (ADM-01)

**Wave 2** *(blocked on Wave 1 — orders backend)*
- [x] 08-02-PLAN.md — listOrdersAdminPaginated, Zod schema, adminOrdersUrl, Vitest (ADM-02)

**Wave 3** *(blocked on Wave 2 / parallel ADM-03)*
- [x] 08-03-PLAN.md — Orders Data Table page, URL sort/pagination (ADM-02)
- [x] 08-04-PLAN.md — Remove Slug column from categories table (ADM-03)

**Wave 4** *(blocked on Wave 1 — chat schema + services)*
- [x] 08-05-PLAN.md — ConversationStatus migration [BLOCKING], chat lifecycle services/actions (CHAT-05/06)

**Wave 5–6** *(blocked on Wave 4 — chat UI + verification)*
- [x] 08-06-PLAN.md — Admin chat tabs, archive/unarchive/delete UX (CHAT-05/06)
- [x] 08-07-PLAN.md — Buyer archived read-only, API guard, Vitest + manual checklist (CHAT-05/06)

**Notes:**
- Prisma: `ConversationStatus` enum (`OPEN` | `ARCHIVED`) + optional `deletedAt` або hard delete policy
- Встановити shadcn: `sidebar`, `slider`, `data-table` (+ `table`, `pagination` якщо ще немає)

---

### Phase 9: Wishlist ✅

**Goal:** Обране для гостя (localStorage) і залогіненого (БД); merge гостевого списку в БД при логіні.

**Requirements:** WISH-01, WISH-02, WISH-03, WISH-04, WISH-05

**Success criteria:**
1. Гість додає товар → badge/іконка «в обраному»; після reload — на місці
2. Залогінений юзер має свій список у БД
3. Гість додає товари → логін → items **merge** у DB wishlist (як кошик)
4. Сторінка `/obrane` показує доступні та недоступні (opacity + «Товар більше недоступний»)
5. Unit tests на storage key; Vitest gate green

**Plans:** 5/5 plans complete · **Verification:** passed · **UAT:** 09-HUMAN-UAT.md

**Wave 1** *(schema + guest storage)*
- [x] 09-01-PLAN.md — Prisma `WishlistItem` migrate [BLOCKING] + `guest-storage.ts` Vitest (WISH-01, WISH-03)

**Wave 2** *(server layer)*
- [x] 09-02-PLAN.md — wishlist service/actions, no auto-prune, no merge (WISH-02, WISH-03, WISH-04 backend)

**Wave 3** *(toggle UX)*
- [x] 09-03-PLAN.md — Storefront Toaster, `WishlistToggleButton`, ProductCard overlay + PDP (WISH-05)

**Wave 4** *(nav + /obrane)*
- [x] 09-04-PLAN.md — `WishlistNavLink` all visitors, `/obrane` guest+session, unavailable rows (WISH-01, WISH-02, WISH-04)

**Wave 5** *(cabinet + verification)*
- [x] 09-05-PLAN.md — `/kabinet` preview ≤3, Vitest gate, `09-MANUAL-CHECKLIST.md` D-09-24 (WISH-03, WISH-04)

**Notes:**
- Prisma: `WishlistItem` (userId, productId) unique — `npx prisma migrate dev --name wishlist_item`
- Guest key: `appliance-wishlist-guest`; merge gate `WishlistPendingMergeGate` (як cart)
- Unavailable: єдиний grid, opacity, без окремої секції «Недоступні»
- Post-phase UX: «Очистити обране» / «Очистити кошик»; клік по картці каталогу → PDP

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
| v1.1 Engagement & Fixes | 4 | 16 | 🚧 Phase 10 next |

---
*Roadmap updated: 2026-05-17 — milestone v1.1*
