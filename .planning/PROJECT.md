# Appliance Store Lviv

## What This Is

Онлайн-магазин **б/у побутової техніки** у Львові. Покупець переглядає каталог з фільтрами (ціна, бренд, стан), оформлює замовлення (самовивіз або доставка по Львову), додає в обране, спілкується з магазином у real-time чаті. Адмінка на shadcn Sidebar: CRUD товарів і категорій (з фото), замовлення з inline-статусом, чати з архівом і ПКМ-lifecycle. Каталог пагінований (16 карток), порожні категорії приховані, усі селекти — shadcn. UI — легкий, повітряний, українською.

**Live:** https://project-r4qzr.vercel.app

## Core Value

Покупець швидко знаходить потрібну б/у техніку у Львові, бачить реальний стан і ціну, оформлює замовлення без зайвого тертя — і за потреби одразу пише магазину в чат.

## Current Milestone: v1.3 Fixes & Admin UX

**Goal:** Стабільний адмін-чат з внутрішнім скролом, видалення товару зі списку, чиста БД для наповнення реальними даними + empty-state стійкість.

**Target features:**
- `/admin/chaty`: фіксована висота панелі; список діалогів і тред скроляться всередині (не росте вся сторінка)
- `/admin/tovary`: іконка кошика в останній колонці, `stopPropagation` — без переходу на edit при delete
- Повне очищення бізнес-даних у БД (товари, категорії, замовлення, чати тощо); фікси UI при порожній БД
- Без: відгуків, SEO/GSC, Lighthouse milestone, нових storefront-фіч

## Current State

**Shipped:** v1.0 MVP + v1.1 Engagement & Fixes + **v1.2 Polish & UX** (2026-05-19)

**In progress:** v1.3 Fixes & Admin UX — requirements and roadmap defined 2026-05-19.

**v1.2 delivered:** admin row-click UX, order status inline select, product table sort, stock quantity (admin-only), chat inbox context menu, catalog polish (empty categories, badges, pagination 16), shadcn Select audit, PDP gallery + slug policy verified.

## Requirements

### Validated (v1.0)

- ✓ Каталог б/у техніки з категоріями — v1.0
- ✓ CRUD категорій і товарів з адмінки — v1.0
- ✓ Пошук і фільтри (URL-sync) — v1.0
- ✓ Кошик і checkout без онлайн-оплати — v1.0
- ✓ Доставка: самовивіз + Львів — v1.0
- ✓ Auth: каталог без логіну; кошик/чат з логіном — v1.0
- ✓ Real-time чат покупець ↔ магазин — v1.0
- ✓ Адмін: товари, категорії, замовлення, чати — v1.0
- ✓ UI українською, адаптив, SEO — v1.0
- ✓ CI + deploy — v1.0
- ✓ Vercel Analytics — v1.0

### Validated (v1.1)

- ✓ FIX-01 — чернетки dashboard → `/admin/tovary?status=DRAFT`
- ✓ CAT-01/02/03 — Slider ціни, серверний фільтр, бренди per-category
- ✓ ADM-01/02/03 — Sidebar, orders Data Table, без Slug у списку категорій
- ✓ CHAT-05/06 — архів і видалення чатів
- ✓ WISH-01…05 — wishlist гість + БД, merge при логіні, `/obrane`
- ✓ HOME-01/02 — зображення категорій на головній + адмін upload

### Validated (v1.2)

- ✓ ADM-ORD-01/02 — row-click orders + inline status select
- ✓ ADM-CAT-01/02 — Plus CTA, row-click edit
- ✓ ADM-PRD-01/02/03 — Plus CTA, column sort, stock quantity (admin-only)
- ✓ ADM-CHAT-01 — inbox context menu (desktop)
- ✓ CAT-04/05/06 — hide empty categories, Badge counts, pagination 16
- ✓ UX-01/02 — shadcn Select everywhere in components; clickable rows
- ✓ POL-01/02 — PDP gallery verified; auto slug on create

### Active (v1.3)

- ADM-CHAT-02 — admin chat inbox + thread fixed-height internal scroll
- ADM-PRD-04 — delete product from `/admin/tovary` table (trash icon, stopPropagation)
- DATA-01 — purge all business entities from database (operator-run)
- DATA-02 — storefront + admin tolerate empty database without errors

### Out of Scope

- Відгуки (REV-01/02) — v2
- Core Web Vitals / Lighthouse milestone (PERF-01) — v2
- GSC / custom domain (SEO-01/02) — v2
- Онлайн-оплата, доставка за межі Львова, маркетплейс
- Багатомовність
- Відображення кількості на складі на storefront (admin-only by design)

## Context

- Локація: **Львів**, україномовні покупці
- Stack: Next.js 16, Prisma, PostgreSQL, Tailwind, shadcn/ui, Cloudinary, Better Auth, Pusher
- Milestones archived: `.planning/milestones/v1.0-*`, `v1.1-*`, `v1.2-*`
- Preview: https://project-r4qzr.vercel.app

## Constraints

- **Locale**: UI лише українською
- **Business**: single-store, used appliances only
- **UI**: shadcn Sidebar, Select, DropdownMenu, Data Table, Badge, Pagination, Context Menu

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single-store | Один магазин у Львові | ✓ Good |
| Тільки б/у | Фокус + condition filter | ✓ Good |
| Checkout без онлайн-оплати v1 | Швидший запуск | ✓ Good |
| Guest cart merge on login | localStorage pending → merge action | ✓ Good |
| Pusher for chat | Realtime buyer ↔ store | ✓ Good |
| Wishlist merge on login | Як кошик — один список після входу | ✓ Good (v1.1) |
| Slug auto з назви | Адмін не редагує slug | ✓ Good (v1.2 verified) |
| Category image на головній | HOME-01/02 | ✓ Good (v1.1) |
| Stock quantity admin-only | Декілька однакових одиниць без окремих PDP | ✓ Good (v1.2) |
| Hide empty categories storefront | Не показувати «0 товарів» | ✓ Good (v1.2) |
| Shared clickable-row helper | Єдиний патерн admin tables | ✓ Good (v1.2) |
| shadcn Select + nuqs sentinel | Консистентні контроли, `__all__` для brand | ✓ Good (v1.2) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

<details>
<summary>Pre-v1.2 planning snapshot (2026-05-18)</summary>

v1.2 scope: admin row UX, orders status, stock qty, chat RCM, catalog polish, shadcn Select audit.

</details>

---
*Last updated: 2026-05-19 — milestone v1.3 Fixes & Admin UX started*
