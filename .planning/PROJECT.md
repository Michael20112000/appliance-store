# Appliance Store Lviv

## What This Is

Онлайн-магазин **б/у побутової техніки** у Львові (v1.0 shipped). Покупець переглядає каталог, фільтрує, оформлює замовлення (самовивіз або доставка по Львову), спілкується з магазином у real-time чаті. Адмінка: CRUD товарів і категорій, замовлення, чати. UI — легкий, повітряний, українською.

**Live:** https://project-r4qzr.vercel.app

## Core Value

Покупець швидко знаходить потрібну б/у техніку у Львові, бачить реальний стан і ціну, оформлює замовлення без зайвого тертя — і за потреби одразу пише магазину в чат.

## Current Milestone: v1.1 Engagement & Fixes

**Goal:** Wishlist для гостя й залогіненого (без merge), виправлення багів каталогу й адмінки, UX-полірування через shadcn (Sidebar, Slider, Data Table), зображення категорій на головній.

**Target features:**
- Wishlist: гість (localStorage) + залогінений (БД), **без** об'єднання при логіні
- Каталог: Slider для ціни, робочий price filter, бренди лише в межах категорії
- Адмін: shadcn Sidebar, Data Table для замовлень (пагінація + page size), прибрати Slug у таблиці категорій, керування станами чатів
- Баг: кнопка «Чернетки» → `/admin/tovary?status=DRAFT`
- Головна: картинки категорій, редагування через адмінку
- Аналітика Vercel — вже підключена, окремої фази немає

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
- ✓ Vercel Analytics на storefront — v1.1 prep (2026-05-17)

### Active (v1.1)

See `.planning/REQUIREMENTS.md` for REQ-IDs and traceability.

### Out of Scope (v1.1)

- Відгуки / модерація коментарів — descoped
- Core Web Vitals / Lighthouse / perf milestone
- Wishlist merge при логіні
- Нова адмін-функціональність поза чатами, замовленнями, категоріями
- Онлайн-оплата, доставка за межі Львова, маркетплейс
- GSC / custom domain (окремий milestone за потреби)

### Out of Scope (project)

- Маркетплейс з багатьма продавцями — один магазин
- Нова техніка — тільки б/у
- Багатомовність — тільки українська

## Context

- Локація: **Львів**, україномовні покупці
- v1.0 shipped 2026-05-17; planning archive: `.planning/milestones/v1.0-*`
- Відомі баги v1.1: ціна-фільтр не відсікає товари; бренди глобальні замість per-category; чернетки href без query

## Constraints

- **Stack**: Next.js + TypeScript, Prisma + PostgreSQL, Tailwind, shadcn/ui, Cloudinary, Better Auth, Pusher
- **Locale**: UI лише українською
- **Business**: single-store, used appliances only
- **UI**: нові патерни адмінки — shadcn Sidebar, Slider, Data Table

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single-store | Один магазин у Львові | ✓ Good |
| Тільки б/у | Фокус + condition filter | ✓ Good |
| Checkout без онлайн-оплати v1 | Швидший запуск | ✓ Good |
| Guest cart merge on login | localStorage pending → merge action | ✓ Good |
| Pusher for chat | Realtime buyer ↔ store | ✓ Good |
| Wishlist **no merge** on login | Окремі списки гість/юзер — явна вимога v1.1 | — Pending |
| Відгуки v1.1 | Descoped після обговорення | — N/A |
| Perf/CWV v1.1 | Out of scope | — N/A |

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
<summary>Pre-v1.0 planning snapshot (2026-05-16)</summary>

Original MVP scope and stack decisions captured at project init. See `milestones/v1.0-REQUIREMENTS.md` for REQ-ID traceability.

</details>

---
*Last updated: 2026-05-17 — milestone v1.1 started*
