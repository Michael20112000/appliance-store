# Appliance Store Lviv

## What This Is

Онлайн-магазин **б/у побутової техніки** у Львові. Один магазин продає свій асортимент: покупець переглядає каталог, фільтрує, кладе в кошик, оформлює замовлення (самовивіз або доставка по Львову), за потреби спілкується з магазином у real-time чаті. Інтерфейс — **легкий, повітряний**, українською. Адмінка: повний CRUD товарів і категорій, замовлення, чати з клієнтами.

## Core Value

Покупець швидко знаходить потрібну б/у техніку у Львові, бачить реальний стан і ціну, оформлює замовлення без зайвого тертя — і за потреби одразу пише магазину в чат.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Каталог б/у техніки з початковими категоріями (пральні, холодильники, морозильники, ТВ, плити, духові, варильні поверхні, сушарки)
- [ ] CRUD категорій з адмінки (створення / видалення / редагування)
- [ ] CRUD товарів з адмінки (фото через Cloudinary, бренд, ціна, стан, опис)
- [ ] Пошук і фільтри: категорія, бренд, діапазон ціни, стан (condition)
- [ ] Кошик і checkout (без онлайн-оплати на v1 — оплата на місці / пізніше)
- [ ] Доставка: самовивіз + доставка по Львову
- [ ] Опційна авторизація: каталог без логіну; для кошика / чату — логін
- [ ] Real-time чат покупець ↔ магазин (менеджер)
- [ ] Адмін: товари, категорії, замовлення, чати
- [ ] UI: легкий, повітряний дизайн; якісний UX, SEO, продуктивність

### Out of Scope

- Маркетплейс з багатьма продавцями — один магазин, один продавець
- Нова техніка — тільки б/у
- Онлайн-оплата (Stripe/LiqPay) на v1 — лише оформлення замовлення
- Доставка за межі Львова на v1
- Багатомовність — тільки українська інтерфейс

## Context

- Локація та аудиторія: **Львів**, україномовні покупці
- Категорії на старті: Пральні машини, Холодильники, Морозильні камери, Телевізори, Плити, Духові шафи, Варильні поверхні, Сушарки для одягу
- MVP = повний набір: каталог, адмінка, кошик, чат, фільтри (не урізана версія)
- «Хороший» продукт = сильний **дизайн/UX**, **SEO**, **технічна якість** (швидкість, стабільність)

## Constraints

- **Tech stack**: Next.js (App Router) + TypeScript, Prisma + PostgreSQL, Tailwind CSS, shadcn/ui, Cloudinary (зображення), Better Auth
- **Realtime**: потрібен для чату (конкретний транспорт — на етапі research/plan)
- **Locale**: UI лише українською
- **Business**: single-store, used appliances only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single-store (не маркетплейс) | Один магазин у Львові | — Pending |
| Тільки б/у товари | Фокус асортименту + фільтр condition | — Pending |
| Checkout без онлайн-оплати v1 | Швидший запуск, оплата офлайн | — Pending |
| Auth опційний для перегляду | Нижчий бар'єр входу | — Pending |
| Доставка: самовивіз + Львів | Локальний бізнес | — Pending |
| Stack: Next + Prisma + shadcn + Cloudinary + Better Auth | Задано замовником | — Pending |
| MVP = full feature set | Явний запит на все одразу | — Pending |

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

---
*Last updated: 2026-05-16 after initialization*
