# Appliance Store Lviv

## What This Is

Онлайн-магазин **б/у побутової техніки** у Львові. Покупець переглядає каталог з фільтрами (ціна, бренд, стан), оформлює замовлення (самовивіз або доставка по Львову), додає в обране, спілкується з магазином у real-time чаті. Адмінка на shadcn Sidebar: CRUD товарів і категорій (з фото), замовлення з inline-статусом, чати з архівом і ПКМ-lifecycle. Каталог пагінований (16 карток), порожні категорії приховані, усі селекти — shadcn. UI — легкий, повітряний, українською.

**Live:** https://project-r4qzr.vercel.app

## Core Value

Покупець швидко знаходить потрібну б/у техніку у Львові, бачить реальний стан і ціну, оформлює замовлення без зайвого тертя — і за потреби одразу пише магазину в чат.

## Current Milestone: v1.5 Incremental polish & operator UX

**Goal:** Виправити delivery-aware статуси замовлень, допиляти адмінку (категорії/товари), вирівняти вітрину (порожні категорії, футер, mobile drawer) і закрити відкладений human UAT.

**Target features:**

- Delivery-aware статуси замовлень в адмінці (ORD-03/04)
- Адмін категорії: іконки на edit, колонка «Товари» (ADM-CAT-03/04)
- Адмін товар: auto-save, «Назад», trash delete (ADM-PRD-05)
- Головна: приховати порожні категорії (HOME-03)
- Футер + mobile: контакти, callback, counts (FOOT-01…04)
- Human UAT closure (UAT-01)

## Current State

**Shipped:** v1.0 → v1.4 (2026-05-19)

**In progress:** v1.5 planning — phases 22–27

**Latest (v1.4):** Verify-only stabilization — BUG-12…17; intake workflow on `main`.

**v1.3 delivered:** admin chat internal scroll, product delete from list, `db:purge` + empty DB tolerance, guest checkout without registration.

**v1.2 delivered:** admin row-click UX, stock quantity (admin-only), chat context menu, catalog polish, shadcn Select audit.

**Operator:** Real catalog data after optional purge + seed; bugfixes via `BUGFIX-WORKFLOW.md` intake files.

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

### Validated (v1.3)

- ✓ ADM-CHAT-02 — admin chat inbox internal scroll — v1.3
- ✓ ADM-PRD-04 — delete product from list — v1.3
- ✓ GUEST-01 — guest checkout (localStorage cart + token) — v1.3
- ✓ DATA-01 — `db:purge` business data — v1.3
- ✓ DATA-02 — empty DB UX — v1.3

### Validated (v1.4)

- ✓ BUG-12…17 — operator bugfix intake (quantity model, inventory transitions, category UX) — v1.4 verify-only

### Active (v1.5)

- ORD-03/04 — delivery-aware order status (admin + server)
- ADM-CAT-03/04 — category edit icons, list «Товари» link
- ADM-PRD-05 — product edit auto-save UX
- HOME-03 — homepage hide empty categories
- FOOT-01…04 — footer + mobile callback + category counts
- UAT-01 — Phase 19 purge UAT + verify-work checkpoint

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
- Milestones archived: `.planning/milestones/v1.0-*` … `v1.4-*`
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
| Тільки б/у | Фокус + condition filter | ✓ Good |
| Checkout без онлайн-оплати v1 | Швидший запуск | ✓ Good |
| Guest cart merge on login | localStorage pending → merge action | ✓ Good |
| Guest checkout без реєстрації | localStorage cart + guest order token | ✓ Good (v1.3 phase 20) |
| Pusher for chat | Realtime buyer ↔ store | ✓ Good |
| Wishlist merge on login | Як кошик — один список після входу | ✓ Good (v1.1) |
| Slug auto з назви | Адмін не редагує slug | ✓ Good (v1.2 verified) |
| Category image на головній | HOME-01/02 | ✓ Good (v1.1) |
| Stock quantity admin-only | Декілька однакових одиниць без окремих PDP | ✓ Good (v1.2) |
| Hide empty categories storefront | Не показувати «0 товарів» | ✓ Good (v1.2) |
| Shared clickable-row helper | Єдиний патерн admin tables | ✓ Good (v1.2) |
| shadcn Select + nuqs sentinel | Консистентні контроли, `__all__` для brand | ✓ Good (v1.2) |
| Bugfix intake → plan → execute | Уникати ad-hoc multi-bug регресій | ✓ Good (v1.4) |
| Quantity-only listing | `ProductStatus` прибрано; reserve на CONFIRMED | ✓ Good (v1.4) |
| db:purge separate from seed | Операторський контроль наповнення | ✓ Good (v1.3) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

<details>
<summary>Pre-v1.2 planning snapshot (2026-05-18)</summary>

v1.2 scope: admin row UX, orders status, stock qty, chat RCM, catalog polish, shadcn Select audit.

</details>

---
*Last updated: 2026-05-19 — milestone v1.5 started*
