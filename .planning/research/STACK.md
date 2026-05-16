# Stack Research

**Domain:** Single-store used-appliance e-commerce (Lviv, UA)
**Researched:** 2026-05-16
**Confidence:** HIGH (mandated stack) / MEDIUM (addon choices)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.x (App Router) | Framework, SSR/SSG, API routes | User mandate; SEO via RSC + metadata API |
| TypeScript | 5.x | Type safety | User mandate |
| Prisma | 6.x | ORM, migrations | User mandate; great DX with Postgres |
| PostgreSQL | 16+ | Primary DB | User mandate; filters, orders, chat messages |
| Tailwind CSS | 4.x | Styling | User mandate; pairs with shadcn |
| shadcn/ui | latest (CLI) | UI components | User mandate; accessible, customizable |
| Cloudinary | 2.x SDK | Product images | User mandate; transforms, CDN, upload widget |
| Better Auth | 1.x | Auth (buyer + admin) | User mandate; App Router adapter, roles |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | 3.x | Validation | Forms, API bodies, env |
| React Hook Form | 7.x | Forms | Checkout, admin CRUD |
| @hookform/resolvers | 3.x | Zod + RHF | All forms |
| nuqs | 2.x | URL search state | Catalog filters in query string |
| Pusher (or Ably) | latest | Realtime chat | Serverless-friendly on Vercel |
| next-cloudinary | latest | Image components | Product gallery, LCP |
| @tanstack/react-query | 5.x | Client cache | Cart, chat list, admin tables |
| lucide-react | latest | Icons | shadcn default |
| date-fns | 4.x | Dates | Order timestamps (uk locale) |
| slugify | 1.x | Slugs | Category/product URLs (UA translit) |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint + eslint-config-next | Lint | Include `@convex-dev` N/A — use prisma-eslint if desired |
| Prettier | Format | Optional team standard |
| Vitest + Testing Library | Unit/component tests | Nyquist validation |
| Playwright | E2E | Checkout + auth flows |
| Vercel | Deploy | Natural fit for Next.js |
| Neon / Supabase Postgres / local Docker | DB hosting | Prisma-compatible |

## Installation

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
npx shadcn@latest init
npm install prisma @prisma/client better-auth zod react-hook-form @hookform/resolvers nuqs @tanstack/react-query date-fns slugify
npm install cloudinary next-cloudinary pusher pusher-js
npm install -D prisma vitest @testing-library/react playwright
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Pusher | Socket.io + custom server | Self-hosted, high message volume |
| Pusher | Ably | Similar SaaS, compare pricing |
| Postgres filters | Meilisearch | 500+ SKUs, fuzzy search, typos |
| nuqs | manual useSearchParams | Very small catalog only |
| React Query | SWR | Team preference |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| NextAuth v4 alone | User chose Better Auth | Better Auth |
| Redux | Overkill for this scope | React Query + server state |
| MongoDB | User chose Postgres | Prisma + Postgres |
| Stripe on v1 | Out of scope per PROJECT.md | Order status + offline payment note |
| Multi-vendor plugins | Single-store | One `Product` owner |

## Stack Patterns by Variant

**If catalog < 200 SKUs:**
- Postgres `WHERE` + indexes on categoryId, brand, price, condition
- No Meilisearch yet

**If chat traffic low (single store):**
- Pusher private channels per conversation
- Messages persisted in Postgres, push for live update

**If SEO priority (Lviv local):**
- `generateMetadata` per product/category
- JSON-LD `Product` + `LocalBusiness`
- Ukrainian slugs, canonical URLs

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 15 | React 19 | Use current shadcn init |
| Better Auth 1.x | Prisma adapter | Official prismaAdapter |
| Prisma 6 | Node 20+ | Match Vercel runtime |

## Sources

- Next.js App Router docs (2025)
- Better Auth docs — Prisma + Next.js
- Cloudinary Next.js integration
- Pusher Channels — serverless pattern

## Implications for Roadmap

- Phase 1: scaffold Next + Prisma + Auth + shadcn theme (airy design tokens)
- Early: schema (Product, Category, Order, Message, Conversation)
- Mid: catalog + filters before chat (chat depends on auth)
- Deploy: Vercel + managed Postgres from day 1
