# Roadmap: Appliance Store Lviv

## Overview

Вертикальний MVP для онлайн-магазину б/у побутової техніки у Львові: спочатку фундамент (Next.js, auth, дизайн-система), потім каталог із пошуком і SEO, комерція (кошик і checkout без онлайн-оплати), адмінка для операцій магазину, realtime-чат і фінальне полірування перед запуском. Кожна фаза закриває цілісний шар цінності для покупця або магазину.

## Phases

**Phase Numbering:**

- Integer phases (1–6): Planned MVP milestone work
- Decimal phases (e.g. 2.1): Urgent insertions via `/gsd-phase insert`

- [ ] **Phase 1: Foundation, Auth & Design System** — Next.js, Prisma, Better Auth, український UI, design tokens, Cloudinary pipeline
- [ ] **Phase 2: Catalog & Discovery** — Каталог, картка товару, категорії, пошук, фільтри в URL, local SEO
- [x] **Phase 3: Cart & Checkout** — Кошик, оформлення замовлення (самовивіз / Львів), історія замовлень
- [x] **Phase 4: Admin Operations** — CRUD категорій і товарів, замовлення, RBAC для `/admin` (completed 2026-05-17)
- [ ] **Phase 5: Realtime Chat** — Чат покупець ↔ магазин з persistence і адмін-інбоксом
- [ ] **Phase 6: Polish & Launch** — Продуктивність, стабільність, E2E, deploy hardening

## Phase Details

### Phase 1: Foundation, Auth & Design System

**Goal**: Покупець і адмін мають стабільний застосунок з українським UI, сесією та базовою інфраструктурою для медіа
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-05, UI-01, UI-02, UI-03, PERF-01
**Success Criteria** (what must be TRUE):

  1. Користувач відкриває головну сторінку українською з легким, повітряним стилем на mobile і desktop
  2. Користувач переглядає публічні сторінки без реєстрації
  3. Користувач реєструється / входить email-паролем і залишається в системі після перезавантаження
  4. Зображення з Cloudinary віддаються в оптимізованих форматах і розмірах через єдиний компонент

**Plans**: 6 plans

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Scaffold, tests, Vercel deploy (S1)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Neon + Prisma migrate + seed (S2)
- [x] 01-03-PLAN.md — Design tokens + shadcn + storefront shell (S3)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-04-PLAN.md — Public home + category stubs (S4)

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 01-05-PLAN.md — Auth pages + session persist (S5)

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 01-06-PLAN.md — Admin RBAC + Cloudinary OptimizedImage (S6)

**UI hint**: yes

### Phase 2: Catalog & Discovery

**Goal**: Покупець швидко знаходить потрібну б/у техніку у Львові через каталог, пошук і фільтри
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: CAT-01, CAT-02, CAT-03, CAT-04, CAT-05, CAT-06, CAT-07, SEO-01, SEO-02
**Success Criteria** (what must be TRUE):

  1. Користувач бачить список товарів з фото, ціною, брендом і станом; продані товари не показуються
  2. Користувач відкриває сторінку товару з описом, галереєю і станом
  3. Користувач переглядає товари за категоріями (8 стартових і динамічні)
  4. Користувач шукає і фільтрує за категорією, брендом, ціною і станом; фільтри в URL — посилання можна поділитися
  5. Сторінки категорій і товарів мають унікальні meta та JSON-LD (Product, LocalBusiness для Львова)

**Plans**: 6 plans

Plans:
**Wave 1**

- [ ] 02-01-PLAN.md — Prisma Product/Image, migrate, catalog.service, seed (data foundation)

**Wave 2** *(blocked on Wave 1)*

- [ ] 02-02-PLAN.md — Category grid on /katalog/[slug] (CAT-01, CAT-03, CAT-07)
- [ ] 02-03-PLAN.md — PDP /tovar/[slug] (CAT-02)

**Wave 3** *(blocked on Wave 2)*

- [ ] 02-04-PLAN.md — nuqs filters + global /katalog (CAT-05, CAT-06)

**Wave 4** *(blocked on Wave 3)*

- [ ] 02-05-PLAN.md — Text search q param (CAT-04)

**Wave 5** *(blocked on Wave 4 completion)*

- [ ] 02-06-PLAN.md — generateMetadata, JSON-LD, sitemap (SEO-01, SEO-02)

**UI hint**: yes

### Phase 3: Cart & Checkout

**Goal**: Авторизований покупець оформлює замовлення без онлайн-оплати — самовивіз або доставка по Львову
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: AUTH-03, CART-01, CART-02, CART-03, CHK-01, CHK-02, CHK-03, CHK-04
**Success Criteria** (what must be TRUE):

  1. Неавторизований користувач не може додати в кошик — його перенаправляє на вхід
  2. Користувач додає товар у кошик, змінює кількість і видаляє позиції; після входу гостьовий кошик об'єднується
  3. Користувач оформлює замовлення з телефоном і способом отримання (самовивіз або доставка по Львову)
  4. Після оформлення користувач бачить підтвердження без онлайн-оплати та історію замовлень у кабінеті

**Plans**: 5 plans

Plans:
**Wave 1**

- [x] 03-01-PLAN.md — Prisma Cart/Order models, cart.service, order.service skeleton, validators, unit tests

**Wave 2** *(blocked on Wave 1)*

- [x] 03-02-PLAN.md — requireBuyer, cart.actions, PDP add-to-cart, localStorage pending merge (AUTH-03, CART-01, CART-03)

**Wave 3** *(blocked on Wave 2)*

- [x] 03-03-PLAN.md — /koszyk page + cart UI components (CART-02, AUTH-03)

**Wave 4** *(blocked on Wave 1 + Wave 3)*

- [x] 03-04-PLAN.md — /zamovlennia checkout, atomic SOLD transaction, /zamovlennia/pidtverdzhennia/[orderNumber] (CHK-01–03)

**Wave 5** *(blocked on Wave 4)*

- [x] 03-05-PLAN.md — /kabinet order history, header cart badge, Playwright e2e (CHK-04)

**Validation:** `03-VALIDATION.md`

### Phase 4: Admin Operations

**Goal**: Адміністратор магазину повністю керує асортиментом і замовленнями через захищену адмінку
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: AUTH-04, ADM-01, ADM-02, ADM-03, ADM-04 *(ADM-05 chat admin → Phase 5)*
**Success Criteria** (what must be TRUE):

  1. Користувач без ролі admin не може відкрити `/admin` (server-side перевірка)
  2. Адмін створює, редагує і видаляє категорії
  3. Адмін CRUD товарів із завантаженням кількох фото через Cloudinary
  4. Адмін переглядає замовлення і змінює їхній статус

**Plans**: 5 plans

Plans:
**Wave 1**

- [x] 04-01-PLAN.md — Cloudinary SDK + signed upload route (ADM-03 infra)

**Wave 2** *(parallel with Wave 1 — no Cloudinary dependency)*

- [x] 04-02-PLAN.md — Category CRUD + /admin/kategorii (ADM-01, AUTH-04)

**Wave 3** *(depends on 04-01, 04-02)*

- [x] 04-03-PLAN.md — Product CRUD + multi-image upload (ADM-02, ADM-03)

**Wave 4** *(parallel — orders independent of Cloudinary)*

- [x] 04-04-PLAN.md — Orders list + status + cancel revert (ADM-04)

**Wave 5** *(depends on 04-02, 04-03, 04-04)*

- [x] 04-05-PLAN.md — Admin shell, dashboard, E2E, disabled Чати nav (AUTH-04 proof)

**UI hint**: yes

### Phase 5: Realtime Chat

**Goal**: Покупець і магазин спілкуються в реальному часі зі збереженою історією
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04
**Success Criteria** (what must be TRUE):

  1. Авторизований користувач відкриває чат з магазином зі сторінки товару або кабінету
  2. Повідомлення з'являються у співрозмовника без перезавантаження сторінки
  3. Історія чату доступна після перезавантаження
  4. Адмін бачить список діалогів і відповідає покупцям в одному інтерфейсі

**Plans**: TBD

### Phase 6: Polish & Launch

**Goal**: Застосунок готовий до продакшену: швидкий, стабільний, перевірений end-to-end
**Mode:** mvp
**Depends on**: Phase 5
**Requirements**: (cross-cutting — покращення всіх попередніх фаз)
**Success Criteria** (what must be TRUE):

  1. Ключові user flows (каталог → кошик → checkout → адмін → чат) проходять E2E без регресій
  2. Core Web Vitals і завантаження зображень відповідають цілям продуктивності на mobile
  3. Local SEO (meta, JSON-LD, sitemap) перевірені для категорій і товарів
  4. Застосунок задеплоєний на Vercel з production env і smoke-перевіркою

**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation, Auth & Design System | 0/6 | Not started | - |
| 2. Catalog & Discovery | 0/6 | Not started | - |
| 3. Cart & Checkout | 0/TBD | Not started | - |
| 4. Admin Operations | 5/5 | Complete   | 2026-05-17 |
| 5. Realtime Chat | 0/TBD | Not started | - |
| 6. Polish & Launch | 0/TBD | Not started | - |

---
*Roadmap created: 2026-05-16*
*Granularity: standard (6 vertical MVP phases)*
