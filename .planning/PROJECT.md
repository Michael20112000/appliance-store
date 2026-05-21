# Appliance Store Lviv

## What This Is

Онлайн-магазин **б/у побутової техніки** у Львові. Покупець переглядає каталог з фільтрами (ціна, бренд, стан), оформлює замовлення як гість або з акаунтом (самовивіз або доставка по Львову), додає в обране, бачить контакти і callback у футері та mobile drawer, спілкується з магазином у real-time чаті. Адмінка: CRUD товарів/категорій з DnD-сортуванням, delivery-aware статуси замовлень, auto-save редагування товару, аналітика продажів, управління дзвінками (Дзвінки), sidebar badges. UI — українською.

**Live:** https://project-r4qzr.vercel.app

## Core Value

Покупець швидко знаходить потрібну б/у техніку у Львові, бачить реальний стан і ціну, оформлює замовлення без зайвого тертя — і за потреби одразу пише магазину в чат.

## Current State

**Shipped:** v1.0 → v2.1 (2026-05-21)

## Current State

**Shipped:** v1.0 → v2.1 (2026-05-21)

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

### Active (v2.2+)

*(See next milestone planning for new requirements)*

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

## Evolution

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
*Last updated: 2026-05-21 — milestone v2.1 shipped*
