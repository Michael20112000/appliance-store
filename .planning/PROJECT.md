# Appliance Store Lviv

## What This Is

Онлайн-магазин **б/у побутової техніки** у Львові. Покупець переглядає каталог з фільтрами (ціна, бренд, стан), оформлює замовлення як гість або з акаунтом (самовивіз або доставка по Львову), додає в обране, бачить контакти і callback у футері та mobile drawer, спілкується з магазином у real-time чаті. Адмінка: CRUD товарів/категорій з DnD-сортуванням, delivery-aware статуси замовлень, auto-save редагування товару, аналітика продажів, управління дзвінками (Дзвінки), sidebar badges. UI — українською.

**Live:** https://project-r4qzr.vercel.app

## Core Value

Покупець швидко знаходить потрібну б/у техніку у Львові, бачить реальний стан і ціну, оформлює замовлення без зайвого тертя — і за потреби одразу пише магазину в чат.

## Current Milestone: v3.0 Chat & Engagement

**Goal:** Повноцінний чат — гостьовий доступ без реєстрації, історія розмов для авторизованих юзерів, вкладення файлів, контроль адміна над статусом чату.

**Target features:**
- Гостьовий чат: без реєстрації, один чат, лише текст; сесія через localStorage/cookie; при вході → прив'язується до акаунту
- Гість в адмінці відображається як "Гість"
- Адмін закриває чат: юзер бачить "Чат завершено", input блокується, пропонується відкрити новий
- Меню-кнопка в чат-віджеті (поряд з ×): відкриває дровер з середини віджету
- Дровер: список чатів з перемиканням (тільки авторизовані)
- Новий чат можна створити з дровера
- Вкладення файлів (jpg/png/webp + pdf) — тільки авторизовані юзери та адмін

## Current State

**Shipped:** v1.0 → v2.1 (2026-05-21)

**Phase 45 complete (2026-05-24):** Floating UI overhaul — callback phone premature validation fixed (shouldValidate removed), all three FABs (callback/cart/chat) consolidated into single bottom-right column at z-[49], dialog backdrop correctly covers FAB group, StorefrontFabs moved inside ChatContext.Provider.

**Latest (v2.1):** Admin UX completeness — dashboard StatCards (calls + chats), full AnalyticsCharts on /admin, recent orders table parity (6 cols, max 10), callback note auto-save (400ms throttle), categories table № + Дії columns, category edit auto-save + icon-trash (mirrors product edit page).

**v2.0:** UX polish — nav auth, smooth scroll, category counts, catalog sort; PDP lightbox, in-cart FAB, схожі товари; footer desktop; admin analytics + callbacks (Дзвінки) + DnD categories + sidebar badges.

**Operator:** `BUGFIX-WORKFLOW.md` intake; optional `db:purge` + seed.

## Requirements

### Validated (v1.0–v1.4)

See prior milestones in `.planning/milestones/v1.*-REQUIREMENTS.md` and Validated sections in archived PROJECT snapshots.

### Validated (v1.5)

- ✓ ORD-03/04 — delivery-aware order status (admin UI + server) — v1.5
- ✓ ADM-CAT-03/04 — category edit icons, list «Товари» link — v1.5
- ✓ ADM-PRD-05 — product edit auto-save, back link, header delete — v1.5
- ✓ HOME-03 — homepage hides empty categories — v1.5
- ✓ FOOT-01…04 — footer contacts, callback, mobile drawer counts — v1.5
- ✓ UAT-01 — Phase 19 purge UAT + v1.5 smoke — v1.5

### Validated (v2.1)

- ✓ ADM-DASH-05/06 — StatCards «Нові дзвінки» + «Активні чати» на /admin — v2.1
- ✓ ADM-DASH-07/08 — повноцінні AnalyticsCharts + recent orders table (6 cols, max 10) — v2.1
- ✓ CALL-05 — callback note auto-save 400ms throttle, без кнопки «Зберегти» — v2.1
- ✓ ADM-CAT-07/08 — таблиця категорій: колонка № + Дії (Додати товар, Видалити) — v2.1
- ✓ ADM-CAT-09/10 — category edit auto-save (500ms) + icon-trash header button — v2.1

### Validated (v2.0)

- ✓ NAV-01 — mobile drawer auth buttons (Увійти/Реєстрація for guests) — v2.0
- ✓ HOME-04 — smooth scroll to `#kategorii` with header offset — v2.0
- ✓ HOME-05 — homepage category count badges — v2.0
- ✓ CAT-02 — catalog sort labels (Найновіші/Дорожче/Дешевше) + toolbar dedupe — v2.0
- ✓ CARD-01 — product card hover crossfade gallery (desktop) — v2.0
- ✓ PDP-05 — lightbox Embla snap tuning — v2.0
- ✓ PDP-06 — PDP in-cart UI (Вже в кошику + trash) + CartFab — v2.0
- ✓ PDP-07 — «Схожі товари» server-side, category-scoped ±20% price bands — v2.0
- ✓ FOOT-05 — responsive footer desktop 2-col layout — v2.0
- ✓ ORD-05, BUG-24 — order status accents + INSUFFICIENT_STOCK mapping fix — v2.0
- ✓ ADM-DASH-03/04 — dashboard action button polish + StatCard icons — v2.0
- ✓ ADM-CAT-05/06 — DnD category reorder + «Переглянути» link styling — v2.0
- ✓ AN-01/02 — admin analytics page + dashboard preview — v2.0
- ✓ CALL-01…04 — Дзвінки workspace (status, note, archive, /admin/dzvinky) — v2.0
- ✓ ADM-NAV-01 — sidebar badges (5 nav items, aggregated fetch, TDD) — v2.0

### Validated (v2.2)

- ✓ SOC-01 — Соцмережі у хедері, дровері, футері (Telegram, Viber, WhatsApp) — v2.2
- ✓ FAB-01 — Floating cart button (завжди видима, ліворуч внизу) — v2.2
- ✓ FAB-02 — Floating callback button з діалогом (номер магазину + форма телефону) — v2.2
- ✓ SLIDER-01 — Ціновий слайдер: крок 50грн, snap до реального min/max — v2.2
- ✓ ANIM-01 — Легкі анімації storefront + fade page transitions — v2.2
- ✓ BUG-25 — Адреса в футері: виправити посилання з embed URL на Google Maps — v2.2

### Validated (v2.3)

- ✓ HDR-01 — Прибрати кнопки авторизації з мобільного хедера; бургер — крайній правий — v2.3
- ✓ HDR-02 — Pending-стан для кнопок авторизації в хедері (Виходимо... / лоадер) — v2.3
- ✓ FAB-03 — Прибрати валідаційний текст "Вкажіть номер телефону — лише цифри, від 10 до 15" з callback-форми — v2.3
- ✓ FAB-04 — Всі floating-кнопки у правому нижньому куті стовпчиком (зворотній дзвінок → корзина → чат); callback-діалог поверх блоку — v2.3

### Validated (v3.0)

- ✓ CHAT-02 — При реєстрації/вході гостьовий чат прив'язується до акаунту — Phase 47
- ✓ CHAT-04 — Адмін може завершити чат; юзер бачить "Чат завершено", input блокується — Phase 47
- ✓ CHAT-05 — Після завершення чату юзеру пропонується відкрити новий — Phase 47

### Active (v3.0)

- [ ] CHAT-01 — Гостьовий чат без реєстрації (один чат, лише текст); сесія через localStorage/cookie
- [ ] CHAT-03 — Гість відображається в адмінці як "Гість"
- [ ] CHAT-06 — Меню-кнопка у чат-віджеті (поряд з ×) відкриває дровер з середини віджету
- [ ] CHAT-07 — Дровер: список чатів з можливістю перемикання (тільки авторизовані)
- [ ] CHAT-08 — Новий чат можна створити з дровера
- [ ] CHAT-09 — Вкладення файлів (jpg/png/webp + pdf) — лише авторизовані юзери та адмін

### Deferred (post–v2.0)

- PERF-01 — Core Web Vitals / Lighthouse
- SEO-01/02 — GSC, custom domain
- REV-01/02 — відгуки на товари
- CAT-WIP-01 — merge `git stash@{0}` (pagination/seed)

### Out of Scope

- Відгуки (REV) — post–v3.0
- Core Web Vitals / Lighthouse (PERF-01) — post–v3.0
- GSC / custom domain (SEO-01/02) — post–v3.0
- Онлайн-оплата, доставка за межі Львова, маркетплейс
- Багатомовність
- Storefront stock quantity display (admin-only by design)

## Context

- Локація: **Львів**, україномовні покупці
- Stack: Next.js 16, Prisma 7, PostgreSQL (Neon), Tailwind, shadcn/ui, Cloudinary, Better Auth, Pusher, @dnd-kit
- Milestones: `.planning/milestones/v1.0-*` … `v2.0-*`
- Bugfix process: `.planning/BUGFIX-WORKFLOW.md`
- Preview: https://project-r4qzr.vercel.app

## Constraints

- **Locale**: UI лише українською
- **Business**: single-store, used appliances only
- **UI**: shadcn Sidebar, Select, DropdownMenu, Data Table, Badge, Pagination, Context Menu

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single-store | Один магазин у Львові | ✓ Good |
| Guest checkout без реєстрації | localStorage cart + guest order token | ✓ Good |
| Bugfix intake → plan → execute | Уникати ad-hoc multi-bug регресій | ✓ Good |
| db:purge separate from seed | Операторський контроль | ✓ Good |
| Delivery-aware status matrix | ORD-03/04 — UI + server reject | ✓ Good (v1.5) |
| Product edit auto-save | ADM-PRD-05 — debounce, no manual Save on edit | ✓ Good (v1.5) |
| Homepage category filter = header | HOME-03 — hide empty categories | ✓ Good (v1.5) |
| Store contacts in DB | FOOT — admin settings, footer, drawer, JsonLd | ✓ Good (v1.5) |
| Purge preserves auth + store contacts | D-08 — CallbackRequest, StorePhone/Email/Address | ✓ Good (v1.5) |
| Stale Prisma singleton guard | Dev HMR after schema add — recreate client | ✓ Good (v1.5) |
| @dnd-kit for category DnD | Legitimacy-checked, sortable + utilities combo | ✓ Good (v2.0) |
| TDD (RED→GREEN) for services | admin-sidebar + analytics services — Nyquist wave 0 | ✓ Good (v2.0) |
| Single aggregated fetch for sidebar | Promise.all 5 queries, no N+1 per nav render | ✓ Good (v2.0) |
| Callback workspace = separate page | /admin/dzvinky replaces settings table | ✓ Good (v2.0) |
| shadcn recharts for analytics | Zero-fill day-bucketing, BigInt conversion | ✓ Good (v2.0) |
| Category edit = product edit mirror | Auto-save + icon-trash, same patterns | ✓ Good (v2.1) |
| useCategoryAutoSave TDD RED→GREEN | Ensures schema guard + snapshot dedup correctness | ✓ Good (v2.1) |
| CategoryForm mode-conditional buttons | Edit mode: no Save/Delete; create mode: unchanged | ✓ Good (v2.1) |
| guest chat via localStorage token | Один UUID в localStorage; claim через POST /api/chat/claim при вході | ✓ Good (v3.0/47) |
| claimGuestConversation in $transaction | TOCTOU race між findFirst + updateMany — транзакція усуває | ✓ Good (v3.0/47) |
| router.refresh() after claim | SSR re-hydrates initialConversationId без page reload — найпростіший підхід | ✓ Good (v3.0/47) |

## Evolution

<details>
<summary>v2.3 milestone snapshot (2026-05-24)</summary>

v2.3 scope: mobile header cleanup (auth buttons removed, burger rightmost, sign-out pending state) + floating UI overhaul (all FABs bottom-right column, dialog z-index fixed, validation text removed).
2 phases, 4 plans, shipped 2026-05-24.

</details>

<details>
<summary>v2.2 milestone snapshot (2026-05-23)</summary>

v2.2 scope: storefront polish — social links (header/drawer/footer), floating FABs (cart + callback), price slider fix (50 UAH step), page fade animation, footer map link bugfix.
3 phases, 6 plans, shipped 2026-05-23.

</details>

<details>
<summary>v2.1 milestone snapshot (2026-05-21)</summary>

v2.1 scope: admin UX completeness — dashboard StatCards + full analytics charts + recent orders table parity, callback note auto-save, categories table № + Дії, category edit auto-save + icon-trash.
4 phases, 7 plans, shipped 2026-05-21.

</details>

<details>
<summary>v2.0 milestone snapshot (2026-05-21)</summary>

v2.0 scope: storefront UX polish (nav, catalog, PDP, footer, homepage), admin analytics, callbacks (Дзвінки), category DnD, order status UX + ASL bugfix, sidebar badges.
9 phases, 26 plans, shipped 2026-05-21.

</details>

<details>
<summary>Pre-v1.5 planning snapshot (2026-05-19)</summary>

v1.5 scope: ORD-03/04, ADM-CAT/PRD polish, HOME-03, FOOT-01…04, UAT-01 closure.

</details>

---
*Last updated: 2026-05-25 — Phase 47 complete (CHAT-02, CHAT-04, CHAT-05 shipped)*
