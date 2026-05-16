# Walking Skeleton — Appliance Store Lviv

**Phase:** 1  
**Generated:** 2026-05-16

## Capability Proven End-to-End

Користувач відкриває задеплоєний на Vercel український застосунок, бачить головну з seed-категоріями з Neon, реєструється email+паролем, після перезавантаження залишається в `/kabinet`; адмін із seed-обліковкою проходить server-side guard на `/admin`; hero показує зображення через Cloudinary `f_auto,q_auto`.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js **16.2.x** App Router (`src/`), Turbopack dev | Locked stack; RSC для публічних сторінок і SEO |
| Data layer | **Neon Postgres EU** + Prisma **7.8** + `@prisma/adapter-neon` | Serverless parity з Vercel; `DIRECT_URL` для migrate |
| Local DB | **Neon dev branch** (не Docker) | Parity з preview/production (D-18, user directive) |
| Auth | **Better Auth** 1.6 — email/password, admin plugin, `nextCookies` | AUTH-02/05; seed-only admin (D-07) |
| UI | shadcn **new-york**, Tailwind v4 `@theme`, Geist Sans, **light only** | UI-02/03 (D-01–D-04) |
| Media | **next-cloudinary** delivery-only wrapper | PERF-01; upload Phase 4 |
| Admin RBAC | `requireAdmin()` у `(admin)/admin/layout.tsx` + `proxy.ts` cookie redirect | Server-side role, не proxy-only (D-13) |
| Deployment | **Vercel** + env з першого PR | D-20 |
| Directory layout | `src/app/(storefront)/`, `src/app/(admin)/admin/`, `src/lib/`, `src/components/` | D-10, ARCHITECTURE.md |

## Stack Touched in Phase 1

- [x] Project scaffold (Next 16, TypeScript ~5.8, ESLint, Vitest + Playwright Wave 0)
- [x] Routing — `/`, `/katalog/[slug]`, `/uviity`, `/reiestratsiia`, `/kabinet`, `/admin`
- [x] Database — Category read на головній; User/Session via Better Auth + seed admin
- [x] UI — storefront shell, auth forms, hero + category grid
- [x] Deployment — Vercel preview URL + Neon dev branch

## Out of Scope (Deferred to Later Slices)

- OAuth / magic link (D deferred)
- Dark mode (D-04)
- Повний каталог, PDP, фільтри, search — **Phase 2**
- Кошик, checkout — **Phase 3**
- CRUD адмінки, signed Cloudinary upload — **Phase 4**
- Realtime chat — **Phase 5**
- LocalBusiness JSON-LD, sitemap polish — **Phase 2 / 6**

## Subsequent Slice Plan

| Phase | User capability |
|-------|-----------------|
| 2 | Каталог, PDP, пошук, фільтри в URL, SEO meta/JSON-LD |
| 3 | Кошик + checkout без онлайн-оплати |
| 4 | Admin CRUD + Cloudinary signed upload |
| 5 | Realtime чат |
| 6 | E2E gate, CWV, production hardening |
