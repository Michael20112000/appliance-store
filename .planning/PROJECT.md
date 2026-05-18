# Appliance Store Lviv

## What This Is

Онлайн-магазин **б/у побутової техніки** у Львові. Покупець переглядає каталог з фільтрами (ціна, бренд, стан), оформлює замовлення (самовивіз або доставка по Львову), додає в обране, спілкується з магазином у real-time чаті. Адмінка на shadcn Sidebar: CRUD товарів і категорій (з фото), замовлення, чати з архівом. UI — легкий, повітряний, українською.

**Live:** https://project-r4qzr.vercel.app

## Core Value

Покупець швидко знаходить потрібну б/у техніку у Львові, бачить реальний стан і ціну, оформлює замовлення без зайвого тертя — і за потреби одразу пише магазину в чат.

## Current Milestone: v1.2 Polish & UX

**Goal:** Дополірувати адмінку й storefront — кліки по рядках, shadcn-контроли, каталог з пагінацією, облік кількості на складі.

**Target features:**

- **Admin orders** — зміна статусу з бейджа в таблиці; рядок відкриває замовлення (без «Відкрити»)
- **Admin categories** — plus на «Додати категорію»; рядок відкриває редагування (без «Редагувати»)
- **Admin products** — plus на «Додати товар»; сортування колонок у таблиці; кількість одиниць на складі (лише адмінка)
- **Admin chat** — ПКМ по чату в списку → архів / видалити (як ⋮ у треді)
- **Storefront catalog** — приховати порожні категорії; badge для лічильників; пагінація 16 карток; shadcn Select замість native `<select>`
- **Cross-cutting** — `cursor-pointer` на клікабельних рядках; аудит селектів по проєкту
- **Verify/polish** — PDP gallery, auto slug (частково вже в коді)

## Current State

**Shipped:** v1.0 MVP + v1.1 Engagement & Fixes (2026-05-17)

**In progress:** v1.2 planning (2026-05-18)

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

### Active (v1.2)

15 requirements in `.planning/REQUIREMENTS.md` — phases 11–16 (admin row UX, orders status, stock qty, chat RCM, catalog polish, shadcn Select audit).

### Out of Scope

- Відгуки (REV-01/02) — v2
- Core Web Vitals / Lighthouse milestone (PERF-01) — v2
- GSC / custom domain (SEO-01/02) — v2
- Онлайн-оплата, доставка за межі Львова, маркетплейс
- Багатомовність
- Відображення кількості на складі на storefront (лише адмінка в v1.2)

## Context

- Локація: **Львів**, україномовні покупці
- Stack: Next.js 16, Prisma, PostgreSQL, Tailwind, shadcn/ui, Cloudinary, Better Auth, Pusher
- Milestones archived: `.planning/milestones/v1.0-*`, `v1.1-*`
- Preview: https://project-r4qzr.vercel.app

## Constraints

- **Locale**: UI лише українською
- **Business**: single-store, used appliances only
- **UI**: shadcn Sidebar, Select, DropdownMenu, Data Table, Badge, Pagination

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single-store | Один магазин у Львові | ✓ Good |
| Тільки б/у | Фокус + condition filter | ✓ Good |
| Checkout без онлайн-оплати v1 | Швидший запуск | ✓ Good |
| Guest cart merge on login | localStorage pending → merge action | ✓ Good |
| Pusher for chat | Realtime buyer ↔ store | ✓ Good |
| Wishlist merge on login | Як кошик — один список після входу | ✓ Good (v1.1) |
| Slug auto з назви | Адмін не редагує slug | ✓ Good (post-v1.1) |
| Category image на головній | HOME-01/02 | ✓ Good (v1.1) |
| Stock quantity admin-only v1.2 | Декілька однакових одиниць без окремих PDP | — Pending |
| Hide empty categories storefront | Не показувати «Бензопили — 0» | — Pending (v1.2) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

<details>
<summary>Pre-v1.2 planning snapshot (2026-05-17)</summary>

v1.1 shipped phases 7–10. Post-v1.1 UX debt: orders row actions, category/product admin clicks, catalog pagination, native selects, stock quantity.

</details>

---
*Last updated: 2026-05-18 — milestone v1.2 started*
