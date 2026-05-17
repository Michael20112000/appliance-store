# Appliance Store Lviv

## What This Is

Онлайн-магазин **б/у побутової техніки** у Львові. Покупець переглядає каталог з фільтрами (ціна, бренд, стан), оформлює замовлення (самовивіз або доставка по Львову), додає в обране, спілкується з магазином у real-time чаті. Адмінка на shadcn Sidebar: CRUD товарів і категорій (з фото), замовлення, чати з архівом. UI — легкий, повітряний, українською.

**Live:** https://project-r4qzr.vercel.app

## Core Value

Покупець швидко знаходить потрібну б/у техніку у Львові, бачить реальний стан і ціну, оформлює замовлення без зайвого тертя — і за потреби одразу пише магазину в чат.

## Current State

**Shipped:** v1.0 MVP (2026-05-17) + **v1.1 Engagement & Fixes** (2026-05-17)

**Next:** Planning v1.2+ via `/gsd-new-milestone`

Post-v1.1 UX (not in GSD plans): auto slug на create, PDP gallery + Dialog/Carousel, admin products table row-click + status dropdown.

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

### Active

_(Немає — визначаються наступним milestone через `/gsd-new-milestone`)_

### Out of Scope

- Відгуки (REV-01/02) — v2
- Core Web Vitals / Lighthouse milestone (PERF-01) — v2
- GSC / custom domain (SEO-01/02) — v2
- Онлайн-оплата, доставка за межі Львова, маркетплейс
- Багатомовність

## Context

- Локація: **Львів**, україномовні покупці
- Stack: Next.js 16, Prisma, PostgreSQL, Tailwind, shadcn/ui, Cloudinary, Better Auth, Pusher
- Milestones archived: `.planning/milestones/v1.0-*`, `v1.1-*`
- Preview: https://project-r4qzr.vercel.app (mobile Lighthouse still above targets — v1.0 debt)

## Constraints

- **Locale**: UI лише українською
- **Business**: single-store, used appliances only
- **UI**: shadcn Sidebar, Slider, Data Table, Dialog, Carousel

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
| Відгуки v1.1 | Descoped | — N/A |
| Perf/CWV milestone | Out of scope v1.1 | — Deferred v2 |

<details>
<summary>Pre-v1.1 planning snapshot (2026-05-17)</summary>

Original v1.1 scope: wishlist, catalog filters, admin UX, category images. See `milestones/v1.1-REQUIREMENTS.md`.

</details>

---
*Last updated: 2026-05-17 after v1.1 milestone shipped*
