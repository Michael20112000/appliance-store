# Project Research Summary

**Project:** Appliance Store Lviv
**Domain:** Single-store used-appliance e-commerce (Ukraine, local delivery)
**Researched:** 2026-05-16
**Confidence:** HIGH

## Executive Summary

Це класичний **single-store e-commerce** з акцентом на **б/у техніку** і **локальний Львів**. Рекомендований підхід: monolithic **Next.js App Router** з **Prisma/Postgres**, опційною авторизацією для покупця, повноцінною **адмінкою** і **Pusher** для realtime-чату. Онлайн-оплата свідомо відкладена — checkout фіксує замовлення і спосіб доставки.

Головні ризики: недостатній опис стану товару, чат без збереження в БД, слабкий local SEO, діри в admin RBAC. Vertical MVP-фази: фундамент → каталог → кошик/замовлення → адмін → чат → polish.

## Key Findings

### Recommended Stack

Next.js 15 + TypeScript + Prisma + Postgres + Tailwind + shadcn + Cloudinary + Better Auth. Додатково: Zod, React Hook Form, nuqs (фільтри в URL), TanStack Query, **Pusher** для чату, Vercel deploy.

### Expected Features

**Must have:** каталог, категорії (CRUD), фільтри, картка товару з condition, кошик, checkout (без оплати), доставка/самовивіз, адмін товари/замовлення/чати, UA UI.

**Defer v2:** онлайн-оплата, доставка по Україні, wishlist, відгуки.

### Architecture Approach

Один Next.js застосунок: storefront + `/admin` + API/Actions → Prisma. Окремі сервіси: Catalog, Cart, Order, Chat, Media. Чат: Postgres + Pusher.

### Critical Pitfalls

1. Б/у без condition/фото
2. Чат без persistence
3. Неіндексовані фільтри
4. Admin без server RBAC
5. Слабкий Lviv SEO

## Roadmap Implications

| Phase | Focus | Rationale |
|-------|-------|-----------|
| 1 | Foundation + auth + schema + design system | Everything depends on this |
| 2 | Catalog + filters + SEO (MVP slice) | Core value: find product |
| 3 | Cart + checkout + orders | Revenue path |
| 4 | Admin CRUD + order management | Store operates inventory |
| 5 | Realtime chat | Depends on auth + admin |
| 6 | Polish, tests, deploy hardening | Performance + SEO + E2E |

**Phase ordering:** Foundation → Catalog → Commerce → Admin ops → Chat → Polish

**Estimated phases:** 6 (standard granularity, vertical MVP mode)

## Research Files

- STACK.md — versions, libraries, anti-patterns
- FEATURES.md — table stakes, differentiators, dependencies
- ARCHITECTURE.md — routes, models, build order
- PITFALLS.md — mistakes and prevention
