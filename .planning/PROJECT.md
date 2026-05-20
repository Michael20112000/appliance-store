# Appliance Store Lviv

## What This Is

Онлайн-магазин **б/у побутової техніки** у Львові. Покупець переглядає каталог з фільтрами (ціна, бренд, стан), оформлює замовлення як гість або з акаунтом (самовивіз або доставка по Львову), додає в обране, бачить контакти і callback у футері та mobile drawer, спілкується з магазином у real-time чаті. Адмінка: CRUD товарів/категорій, delivery-aware статуси замовлень, auto-save редагування товару, налаштування контактів магазину. UI — українською.

**Live:** https://project-r4qzr.vercel.app

## Core Value

Покупець швидко знаходить потрібну б/у техніку у Львові, бачить реальний стан і ціну, оформлює замовлення без зайвого тертя — і за потреби одразу пише магазину в чат.

## Current State

**Shipped:** v1.0 → v1.5 (2026-05-19)

**Latest (v1.5):** Delivery-aware order status; admin category/product polish; homepage hides empty categories; footer + mobile contacts/callback from DB; UAT-01 closed (purge + v1.5 smoke).

**Active milestone:** v2.0 Polish, UX & Admin analytics — Phase 29 complete (product cards hover + PDP lightbox/cart UX, 2026-05-20)

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
- ✓ UAT-01 — Phase 19 purge UAT + v1.5 smoke (`27-UAT-REPORT.md`) — v1.5

### Active (v2.0)

See `.planning/REQUIREMENTS.md` — storefront polish (nav, catalog, PDP, footer, homepage), admin analytics, callback «Дзвінки», category DnD, order status UX + ASL bugfix, sidebar badges.

### Deferred (post–v2.0)

- PERF-01 — Core Web Vitals / Lighthouse
- SEO-01/02 — GSC, custom domain
- REV-01/02 — відгуки на товари
- CAT-WIP-01 — merge `git stash@{0}` (pagination/seed)

### Out of Scope (v2.0)

- Відгуки (REV) — post–v2.0
- Core Web Vitals / Lighthouse (PERF-01) — post–v2.0
- GSC / custom domain (SEO-01/02) — post–v2.0
- Онлайн-оплата, доставка за межі Львова, маркетплейс
- Багатомовність
- Storefront stock quantity display (admin-only by design)

## Context

- Локація: **Львів**, україномовні покупці
- Stack: Next.js 16, Prisma 7, PostgreSQL (Neon), Tailwind, shadcn/ui, Cloudinary, Better Auth, Pusher
- Milestones: `.planning/milestones/v1.0-*` … `v1.5-*`
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

## Evolution

<details>
<summary>Pre-v1.5 planning snapshot (2026-05-19)</summary>

v1.5 scope: ORD-03/04, ADM-CAT/PRD polish, HOME-03, FOOT-01…04, UAT-01 closure.

</details>

## Current Milestone: v2.0 Polish, UX & Admin analytics

**Goal:** Вилизати вітрину й адмінку — UX-фікси, аналітика продажів/дзвінків, операторські інструменти (DnD категорій, дзвінки, badges), критичний bugfix статусу замовлення.

**Target features:**

- Mobile drawer: кнопки входу/реєстрації під callback
- Каталог: сортування «Новіше» / «Дорожче» / «Дешевше»
- Картки товарів: fade-галерея на hover (desktop)
- PDP: плавний lightbox-слайдер, кошик UX + FAB, «Схожі товари» ±20% ціни
- Footer: 2 колонки desktop, © по центру; smooth scroll `#kategorii`; counts на картках категорій
- Admin: dashboard polish, analytics + прев’ю, «Дзвінки», DnD категорій, кольори статусів, bugfix ASL-20260519-0013, sidebar badges

---
*Last updated: 2026-05-20 — Phase 29 complete (v2.0)*
