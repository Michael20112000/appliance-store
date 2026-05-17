# Appliance Store Lviv

## What This Is

Онлайн-магазин **б/у побутової техніки** у Львові (v1.0 shipped). Покупець переглядає каталог, фільтрує, оформлює замовлення (самовивіз або доставка по Львову), спілкується з магазином у real-time чаті. Адмінка: CRUD товарів і категорій, замовлення, чати. UI — легкий, повітряний, українською.

**Live:** https://project-r4qzr.vercel.app

## Core Value

Покупець швидко знаходить потрібну б/у техніку у Львові, бачить реальний стан і ціну, оформлює замовлення без зайвого тертя — і за потреби одразу пише магазину в чат.

## Current State (v1.0 shipped 2026-05-17)

- Next.js 16 App Router, Prisma + Neon PostgreSQL, Better Auth, shadcn/ui, Cloudinary, Pusher
- GitHub Actions: lint + Vitest + Playwright on localhost
- Deploy smoke 4/4 on live origin
- **Tech debt:** mobile Lighthouse CWV above targets on preview (LCP/CLS); Phase 04 human UAT partial

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
- ✓ UI українською, адаптив, SEO (meta, JSON-LD, sitemap, robots) — v1.0
- ✓ CI + deploy hardening — v1.0

### Active (next milestone)

- [ ] Core Web Vitals: LCP ≤2.5s, CLS ≤0.1 on `/`, `/katalog`, PDP (preview/production lab)
- [ ] Custom production domain (optional)
- [ ] Google Search Console (post-launch, D-06-12)

### Out of Scope

- Маркетплейс з багатьма продавцями — один магазин
- Нова техніка — тільки б/у
- Онлайн-оплата v1 — лише оформлення замовлення
- Доставка за межі Львова на v1
- Багатомовність — тільки українська

## Context

- Локація: **Львів**, україномовні покупці
- ~119 commits, MVP built 2026-05-16 → 2026-05-17
- Planning archive: `.planning/milestones/v1.0-ROADMAP.md`

## Constraints

- **Stack**: Next.js + TypeScript, Prisma + PostgreSQL, Tailwind, shadcn/ui, Cloudinary, Better Auth, Pusher
- **Locale**: UI лише українською
- **Business**: single-store, used appliances only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single-store | Один магазин у Львові | ✓ Good |
| Тільки б/у | Фокус + condition filter | ✓ Good |
| Checkout без онлайн-оплати v1 | Швидший запуск | ✓ Good |
| Guest cart merge on login | localStorage pending → merge action | ✓ Good |
| Pusher for chat | Realtime buyer ↔ store | ✓ Good |
| Order numbers ASL-YYYYMMDD-#### | Readable ops | ✓ Good |
| Native overflow scroll on mobile chat Sheet | ScrollArea touch issues | ✓ Good (06-09) |

<details>
<summary>Pre-v1.0 planning snapshot (2026-05-16)</summary>

Original MVP scope and stack decisions captured at project init. See `milestones/v1.0-REQUIREMENTS.md` for REQ-ID traceability.

</details>

---
*Last updated: 2026-05-17 after v1.0 milestone*
