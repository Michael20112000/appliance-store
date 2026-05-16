# Stack Research

**Domain:** Single-store used-appliance e-commerce (Lviv, UA)  
**Researched:** 2026-05-16  
**Confidence:** **HIGH** (user-mandated core) / **MEDIUM** (addon choices verified via npm + docs, not yet battle-tested in this repo)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js** | **16.2.x** (App Router) | Full-stack framework, RSC, metadata/SEO, Route Handlers | User mandate; native `metadata`, `sitemap.ts`, `robots.ts`, `generateStaticParams` for product SEO ([Next.js v16.1.6 docs](https://github.com/vercel/next.js/tree/v16.1.6/docs)) |
| **React** | **19.2.x** | UI runtime | Required peer of Next 16; works with shadcn + RSC |
| **TypeScript** | **5.8.x** (pin `~5.8.0`) | Type safety | User mandate; **prefer 5.8 over 6.0** until `create-next-app` and `eslint-config-next` explicitly target TS 6 — npm latest is 6.0.3 but ecosystem lag is real (**MEDIUM** confidence on TS 6) |
| **Prisma** | **7.8.x** | ORM, migrations, type-safe queries | User mandate; Prisma 7 simplifies Neon/Vercel pooling via driver adapters |
| **PostgreSQL** | **16+** (managed) | Products, orders, chat, auth tables | User mandate; indexes + optional `fullTextSearchPostgres` for search |
| **@prisma/adapter-neon** | **7.8.x** | Serverless DB driver | Pooled connections on Vercel; pairs with Neon ([Prisma Neon guide](https://www.prisma.io/docs/orm/overview/databases/neon)) |
| **Neon** | Serverless Postgres | Production DB host | Vercel integration, branching for preview DBs, Ukraine-accessible via CDN edge (app), DB in EU region recommended |
| **Tailwind CSS** | **4.3.x** | Utility styling | User mandate; v4 uses `@theme` in CSS — shadcn supports Tailwind v4 |
| **shadcn/ui** | CLI **latest** (`npx shadcn@latest`) | Accessible UI primitives | User mandate; **new-york** style, OKLCH tokens for “легкий, повітряний” UI ([shadcn Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4)) |
| **Cloudinary** | **2.10.x** (`cloudinary`) | Image storage, transforms, CDN | User mandate; used-appliance photos need crop/quality variants |
| **next-cloudinary** | **6.17.x** | `CldImage`, `CldUploadWidget` in App Router | Signed admin uploads, LCP-friendly images ([next-cloudinary](https://github.com/cloudinary-community/next-cloudinary)) |
| **Better Auth** | **1.6.x** | Buyer + staff auth, sessions | User mandate; `prismaAdapter`, **admin plugin** for store manager role ([Better Auth](https://www.better-auth.com/docs)) |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Zod** | **4.4.x** | Runtime validation | Server Actions, Route Handlers, env (`zod` env schema), shared client/server schemas |
| **react-hook-form** | **7.76.x** | Form state | Checkout, admin CRUD, chat compose |
| **@hookform/resolvers** | **5.2.x** | Zod ↔ RHF | All forms; **5.1+** supports Zod 4 ([resolvers PR #777](https://github.com/react-hook-form/resolvers/pull/777)) |
| **nuqs** | **2.8.x** | URL query state | Catalog filters (category, brand, price range, condition) — shareable URLs, SSR-friendly |
| **pusher** + **pusher-js** | **5.3.x** / **8.5.x** | Realtime transport | Buyer ↔ store chat on **Vercel serverless** (no persistent WS in functions) |
| **@tanstack/react-query** | **5.100.x** | Client cache | Admin order/chat lists, optimistic chat send; **not** for catalog (use RSC) |
| **schema-dts** | **2.0.x** | JSON-LD types | `Product`, `LocalBusiness`, `BreadcrumbList` for Lviv SEO |
| **date-fns** | **4.x** | Date formatting | Order timestamps; `uk` locale |
| **slugify** | **1.6.x** | URL slugs | UA product/category slugs (transliteration rules in app layer) |
| **lucide-react** | latest | Icons | shadcn default |
| **dotenv** | latest | Env loading | Prisma 7 `prisma.config.ts` + local dev |
| **pg** | **8.x** | Postgres driver | If using `@prisma/adapter-pg` instead of Neon adapter (Docker local) |

### Development Tools

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| **eslint** + **eslint-config-next** | **10.x** / **16.2.x** | Lint | Match Next major; run on CI |
| **prettier** + **prettier-plugin-tailwindcss** | **3.8.x** / **0.6.x** | Format | Sort Tailwind classes |
| **Vitest** | **4.1.x** | Unit + component tests | Fast; use with `@vitejs/plugin-react` |
| **@testing-library/react** | **16.3.x** | Component tests | Forms, cart UI |
| **Playwright** | **1.60.x** | E2E | Checkout, auth gate, admin CRUD smoke |
| **Vercel** | — | Hosting | Preview deployments per PR; Edge not required for MVP |
| **Neon** | — | Postgres | `DATABASE_URL` (pooled) + `DIRECT_URL` (migrations) |
| **Prisma CLI** | **7.8.x** | Migrations, studio | `npx prisma migrate dev`; `prisma generate` in build |
| **@better-auth/cli** | latest | Auth schema | `npx @better-auth/cli generate` → merge into Prisma schema |

---

## Domain-Specific Recommendations

### Real-time chat (buyer ↔ store)

**Use: Pusher Channels + Postgres message persistence.**

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Transport | **Pusher** private/presence channels | Vercel cannot hold WebSockets in Serverless Functions; client connects to Pusher directly ([Ably/Vercel pattern](https://ably.com/blog/realtime-chat-app-nextjs-vercel) applies to all hosted pub/sub) |
| Persistence | **Prisma** `Message`, `Conversation` | Source of truth; load history on open |
| Auth | **Better Auth** session | Server signs Pusher channel auth in Route Handler |
| Flow | POST message → save DB → `pusher.trigger` → clients subscribe | Simple, debuggable, fits single-store volume |

**Alternative:** **Ably** `2.21.x` — better if you need built-in chat history/presence SDK; compare EU pricing.  
**Do not use on Vercel:** raw **Socket.io** server, **SSE-only** without reconnect strategy, or **Supabase Realtime** as second realtime DB.

### Search & filters

**Use: Prisma `where` + PostgreSQL indexes for v1; optional `fullTextSearchPostgres` for title/description.**

| Need | Implementation |
|------|----------------|
| Category, brand, price, condition | Composite indexes; filter via Server Component + `nuqs` in URL |
| Text search | `contains` / `search` (preview `fullTextSearchPostgres`) on `title`, `description` |
| Sort | `orderBy` price, `createdAt` |
| Pagination | Cursor-based `prisma.product.findMany({ take, skip/cursor })` |

**Defer:** Meilisearch `0.58.x` until catalog **500+ SKUs** or fuzzy/typo search is a stated pain (**anti-feature for v1**).

### SEO (Lviv, Ukrainian-only)

| Mechanism | Tool |
|-----------|------|
| Per-page meta | `export const metadata` / `generateMetadata` on `/katalog/[slug]`, category routes |
| Sitemap | `app/sitemap.ts` dynamic from Prisma |
| Robots | `app/robots.ts` |
| Static/ISR product pages | `generateStaticParams` + `revalidate` (e.g. 3600) for published products |
| Structured data | `schema-dts` JSON-LD: `Product`, `Offer`, `LocalBusiness` (Lviv address) |
| Images | `CldImage` with `sizes`, priority on LCP hero |
| HTML | `<html lang="uk">`; Ukrainian titles/descriptions only |
| Performance | Next Image + Cloudinary `f_auto,q_auto`; avoid client-only catalog for indexable pages |

### Deployment

| Component | Recommendation |
|-----------|----------------|
| App | **Vercel** (production + previews) |
| Database | **Neon** Postgres, region **eu-central-1** (Frankfurt) or closest EU — lower latency for Lviv than US |
| Media | **Cloudinary** cloud (global CDN) |
| Realtime | **Pusher** app (EU cluster if available in plan) |
| Env | Vercel env vars: `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, Cloudinary, Pusher keys |
| CI | GitHub Actions: `lint`, `vitest`, `prisma migrate diff` or deploy migrate on release |
| Local | Docker Postgres **16** OR Neon dev branch; `pnpm` or `npm` per team preference |

**Do not use for MVP:** self-hosted Node on VPS (ops burden), **Vercel Postgres** if team already standardized on Neon + Prisma 7 adapter docs.

### Testing

| Layer | Stack | Scope |
|-------|-------|-------|
| Unit | **Vitest** 4.x | Zod schemas, slug helpers, price filter builders |
| Component | Vitest + **Testing Library** | Forms, cart badge, filter UI |
| E2E | **Playwright** | Guest browse → login → add to cart → checkout; admin create product |
| API | Vitest + `fetch` against Route Handlers | Chat auth, Cloudinary sign endpoint |
| Auth | Playwright storage state | Separate `admin` and `buyer` projects |

**Skip for v1:** Cypress (heavier), Percy (unless design regression required).

### Validation (Zod)

- **Single source of truth:** `src/lib/validations/*.ts` — import in Server Actions and (via resolver) client forms.
- **Zod 4** for new code; use `zod/v4` import path if mixing legacy snippets.
- **Env:** `z.object({ DATABASE_URL: z.url(), ... })` parsed in `env.ts`; fail fast at build.
- **Server Actions:** `safeParse` → return `{ error: fieldErrors }` for Ukrainian UX messages.
- **Coerce carefully:** `z.coerce.number()` can cause RHF type friction with Zod 4 — prefer explicit `Number()` in action or `valueAsNumber` on inputs.

### State management

| Concern | Recommendation |
|---------|----------------|
| Catalog, product detail | **React Server Components** + Prisma — no global client store |
| Filters | **nuqs** (URL = state) — SEO-friendly, back button works |
| Cart | **Server Actions** + DB/cookie; guest cart in httpOnly cookie, merge on login |
| Auth session | **Better Auth** client + server `auth.api.getSession` |
| Chat UI | **React Query** for thread list + optimistic messages; Pusher for live append |
| Admin tables | React Query or server pagination with URL `page` |

**Avoid:** Redux, MobX, Jotai for this scope — **YAGNI**.

**Optional:** **zustand** `5.0.x` only for transient UI (mobile filters drawer open state) if prop drilling hurts.

---

## Installation

```bash
# Scaffold (pin versions at init time)
npx create-next-app@16.2.6 . --typescript --tailwind --eslint --app --src-dir --turbopack

# UI
npx shadcn@latest init   # style: new-york, base color: neutral/zinc, cssVariables: true

# Core
npm install prisma@7.8.0 @prisma/client@7.8.0 @prisma/adapter-neon@7.8.0
npm install better-auth@1.6.11 @better-auth/prisma-adapter@1.6.11
npm install zod@4.4.3 react-hook-form@7.76.0 @hookform/resolvers@5.2.2
npm install nuqs@2.8.9 @tanstack/react-query@5.100.10
npm install cloudinary@2.10.0 next-cloudinary@6.17.5
npm install pusher@5.3.3 pusher-js@8.5.0
npm install date-fns slugify schema-dts lucide-react

# Dev
npm install -D prisma@7.8.0 vitest@4.1.6 @vitejs/plugin-react @testing-library/react@16.3.2
npm install -D @playwright/test@1.60.0 prettier@3.8.3 prettier-plugin-tailwindcss@0.6.2
npm install -D typescript@~5.8.0 @types/node @types/react @types/react-dom
```

```bash
# Prisma + Better Auth bootstrap
npx prisma init
npx @better-auth/cli@latest generate
npx prisma migrate dev
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Pusher** | **Ably** 2.21.x | Need richer chat SDK, history, presence out of the box |
| **Pusher** | **Socket.io** + VPS | Self-hosted, no Vercel, dedicated WS server |
| **Prisma filters** | **Meilisearch** 0.58.x | Large catalog, typo-tolerant search, facets at scale |
| **Neon** | **Supabase Postgres** (DB only) | Team already on Supabase; still use Prisma, not Supabase client for app data |
| **nuqs** | manual `useSearchParams` | Prototype only; loses type-safe parsers |
| **React Query** | **SWR** | Team preference; equivalent for admin/chat |
| **Vitest** | **Jest** | Corporate standard only |
| **Better Auth admin plugin** | Custom `role` middleware | Never — use official admin plugin for staff |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **NextAuth / Auth.js** as primary | User mandated Better Auth | Better Auth 1.6.x |
| **Supabase JS client** for app CRUD | Splits data layer with Prisma; mandate is Prisma | Prisma + optional Supabase **only** as Postgres host |
| **Convex**, **Firebase** DB | Not in stack; rework architecture | Prisma + Postgres |
| **Drizzle** | User mandated Prisma | Prisma 7 |
| **Socket.io on Vercel** | No long-lived connections in serverless | Pusher / Ably |
| **Algolia / Elasticsearch** | Overkill for single-store hundreds of SKUs | Postgres + indexes |
| **Redux / MobX** | Over-engineering | RSC + nuqs + Server Actions |
| **Stripe / LiqPay v1** | Explicitly out of scope (PROJECT.md) | Order notes + offline payment |
| **next-intl** | Single locale (Ukrainian only) | Hardcode UA copy; `lang="uk"` |
| **Multi-tenant marketplace plugins** | Single store | One seller model |
| **Pages Router** | Legacy; user specified App Router | App Router only |
| **Prisma 6** on greenfield | Prisma 7 is current; adapter pattern is standard | Prisma 7.8.x |
| **Zod 3** on greenfield | Zod 4 current; resolvers support both | Zod 4.4.x |
| **Untyped Cloudinary uploads** | Risk of broken gallery URLs | Signed `CldUploadWidget` + store `public_id` in DB |
| **Client-only product listing** | Kills SEO | RSC catalog + metadata |

---

## Stack Patterns by Variant

**If catalog &lt; 300 SKUs (expected for Lviv single store):**
- Postgres `WHERE` + B-tree indexes on `(categoryId)`, `(brand)`, `(price)`, `(condition)`, `(status)`
- `nuqs` for all filter dimensions in query string
- No search engine service

**If chat volume is low (1–2 managers):**
- One Pusher app; private channel `private-conversation-{id}`
- Messages table with `conversationId`, `senderId`, `body`, `createdAt`
- Admin inbox: React Query poll fallback if Pusher disconnects

**If SEO / local discovery is priority:**
- Static/ISR product URLs: `/katalog/[slug]`
- `LocalBusiness` JSON-LD with Lviv address, `areaServed`
- Google Search Console after launch

**If preview/staging:**
- Neon database branch per preview (or single staging DB)
- Separate Cloudinary folder/upload preset `staging`

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| next@16.2.x | react@19.2.x | Peer range `^19.0.0` |
| next@16.2.x | typescript@~5.8 | TS 6 unverified with full toolchain — pin 5.8 |
| eslint-config-next@16.2.x | next@16.2.x | Align majors |
| prisma@7.8.x | @prisma/client@7.8.x | Same version always |
| prisma@7.8.x | @prisma/adapter-neon@7.8.x | Lockstep with prisma package |
| better-auth@1.6.x | @better-auth/prisma-adapter@1.6.x | Match versions |
| @hookform/resolvers@5.2.x | zod@4.4.x | Requires resolvers ≥5.1 |
| next-cloudinary@6.17.x | next@16.x | Check release notes on upgrade |
| tailwindcss@4.3.x | shadcn (2025+ init) | Use `@theme inline` in globals.css |
| zod@4.x | better-auth | Confirm plugin schemas if customizing |

---

## Confidence Assessment

| Area | Level | Notes |
|------|-------|-------|
| Mandated core (Next, Prisma, Tailwind, shadcn, Cloudinary, Better Auth) | **HIGH** | User constraint + official docs |
| Version numbers (npm 2026-05-16) | **HIGH** | `npm view` on registry |
| Pusher for Vercel chat | **HIGH** | Documented serverless pattern; industry default |
| Prisma-only search for v1 | **HIGH** | SKU scale for single Lviv store |
| Neon + Prisma 7 adapter | **MEDIUM** | Prisma 7 config still evolving; validate `prisma.config.ts` on init |
| TypeScript 5.8 vs 6.0 | **MEDIUM** | TS 6 exists; Next ecosystem may lag |
| Zod 4 + RHF edge cases (`z.coerce`) | **MEDIUM** | Known issues; workarounds documented |
| EU region latency for Lviv | **MEDIUM** | Neon EU + Vercel edge helps; not benchmarked |

---

## Sources

| Source | What was verified | Confidence |
|--------|-------------------|------------|
| [npm registry](https://www.npmjs.com/) | Package versions (2026-05-16) | HIGH |
| [/vercel/next.js v16.1.6](https://github.com/vercel/next.js/tree/v16.1.6/docs) — Context7 | metadata, sitemap, generateStaticParams | HIGH |
| [/better-auth/better-auth](https://www.better-auth.com/docs) — Context7 | Prisma adapter, admin plugin | HIGH |
| [prisma.io docs](https://www.prisma.io/docs) — Context7 | fullTextSearchPostgres, Neon | HIGH |
| [/cloudinary-community/next-cloudinary](https://github.com/cloudinary-community/next-cloudinary) — Context7 | CldUploadWidget signed uploads | HIGH |
| [Prisma + Better Auth guide](https://www.prisma.io/docs/guides/authentication/better-auth/nextjs) | Integration steps | HIGH |
| [shadcn Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4) | Tailwind 4 + shadcn init | HIGH |
| [Ably Next.js + Vercel chat](https://ably.com/blog/realtime-chat-app-nextjs-vercel) | Serverless realtime pattern (applies to Pusher) | MEDIUM |
| [react-hook-form/resolvers PR #777](https://github.com/react-hook-form/resolvers/pull/777) | Zod 4 support | HIGH |

---

## Implications for Roadmap

1. **Foundation** — `create-next-app@16.2.x`, Tailwind 4, shadcn (airy tokens), Prisma 7 + Neon, Better Auth + admin role, Zod env.
2. **Catalog** — Schema + indexes; `nuqs` filters; RSC listing; Cloudinary upload in admin.
3. **Commerce** — Cart (cookie + user merge), checkout Server Actions, orders admin.
4. **Chat** — Prisma messages + Pusher; depends on auth.
5. **SEO pass** — metadata, sitemap, JSON-LD, ISR strategy.
6. **Quality** — Vitest on validations; Playwright on checkout + admin smoke.
7. **Deploy** — Vercel + Neon EU + env wiring from day one.

---
*Stack research for: Appliance Store Lviv (used appliances, single-store e-commerce)*  
*Researched: 2026-05-16*
