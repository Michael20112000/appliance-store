# Milestones

## v1.1 Engagement & Fixes (Shipped: 2026-05-17)

**Phases completed:** 4 phases, 20 plans, 40 tasks

**Key accomplishments:**

- Context-scoped brand lists and UAH price bounds from Prisma aggregates, shadcn Slider installed, catalog pages wired for plan 07-02 slider UI
- Dual-thumb price Slider (50 ₴ step) with throttled `cina-vid`/`cina-do` URL sync and mobile filter sheet reusing the same panel
- Silent invalid `brend` cleanup on category pages and removable active filter chips (brand, price, condition) synced via nuqs in the catalog toolbar
- Parser Vitest for one-sided `cina-vid`/`cina-do` bounds, operator manual checklist for five ROADMAP gates, catalog-filters-url e2e regression green
- Dashboard drafts deep-link to DRAFT products; admin shell migrated to shadcn Sidebar with mobile Sheet trigger, desktop icon collapse, and TanStack Table primitives installed for orders Data Table.
- Zod URL contract, paginated `listOrdersAdminPaginated` with raw-SQL `totalKopiyky` sort, and `adminOrdersUrl` for plain searchParams links — ready for RSC Data Table in plan 08-03.
- Admin orders page wired to `listOrdersAdminPaginated` with TanStack Data Table, Link-driven sort/pagination, and filter URL preservation (ADM-02 UI).
- ADM-03 satisfied: `/admin/kategorii` list table no longer shows Slug; category edit form still exposes slug via CategoryForm.
- Prisma ConversationStatus migration, chat service archive/delete guards, and admin server actions for CHAT-05/06 backend
- Active/Archive admin inbox tabs, thread lifecycle menu with Ukrainian delete confirmation, and list refresh after archive/unarchive/delete
- Buyer sees archived thread history with disabled composer and store-closed banner; API returns 403 CHAT_ARCHIVED; Vitest green and manual Phase 8 checklist added
- Nullable Category.imagePublicId/imageAlt in Prisma with category_image migration and updateCategoryImageSchema for admin uploads
- Admin updateCategoryImageAction persists Cloudinary public_id on Category and revalidates homepage `/` plus catalog paths
- Admin CategoryImageUpload with signed Cloudinary widget, 4:3 preview, and updateCategoryImageAction on upload, remove, and alt blur
- Homepage CategoryGrid shows Cloudinary images with 4:3 cards, «Без фото» placeholder, optional seed backfill, and operator manual checklist

**Known deferred items at close:** 3 (see STATE.md) — Phase 07 human UAT partial; v1.0 verification/UAT debt (phases 04, 06).

**Post-milestone UX (outside GSD):** auto slug, PDP gallery, admin products table UX.

---

## v1.0 Appliance Store MVP (Shipped: 2026-05-17)

**Phases completed:** 6 phases, 36 plans, 43 tasks

**Key accomplishments:**

- cloudinary@2.10.0 with fail-fast server config and admin-only POST /api/upload/sign for CldUploadWidget signed uploads
- Ukrainian admin category CRUD at `/admin/kategorii` with guarded delete, uk slug helpers, and storefront cache revalidation
- Ukrainian admin product CRUD at `/admin/tovary` with signed Cloudinary multi-image upload, cart/order delete guards, and storefront cache revalidation
- Admin order management at `/admin/zamovlennia` with linear status transitions, cancel inventory revert, and Ukrainian UI
- Admin dashboard with live stats, full sidebar shell, disabled Чати nav, and green RBAC/CRUD e2e smoke.
- Prisma Conversation/Message with migrated schema, tested chat.service (DB-first, 20/min rate limit), and Pusher singletons with optional env keys
- assertBuyerApi plus POST/GET messages and Pusher channel auth — DB-first send, secured private channels, 19 route tests
- Global buyer chat widget — FAB, panel, Pusher live append, PDP/kabinet entry points, guest login gate
- Admin split inbox at /admin/chaty — enabled Чати nav with unread badge, Pusher live thread, STORE replies
- Playwright suite for chat auth, persistence, PDP context, admin inbox — CI-safe without Pusher secrets
- GitHub Actions gate on main: lint, Vitest, and full Playwright e2e/ on localhost with Neon CI-branch secrets documented for operators.
- Playwright covers full buyer purchase path and automated SEO checks (uk lang, used-product JSON-LD, sitemap sold exclusion).
- App Router `robots.txt` blocks `/admin` and `/api/` with sitemap link; Vercel production env checklist and `.env.example` Production section in Ukrainian.
- Manual launch gate template filled; PERF-01 code review pass; operator approved CWV deferral on dev lab with preview re-run before prod.
- Remote-ready smoke spec (4 tests) and ordered deploy runbook; smoke green on localhost; production re-run documented.
- Removed duplicate Geist font, lazy-loaded chat UI, stabilized catalog thumbnails; docs updated for preview/prod lab; build and tests green.
- Preview live at `https://project-r4qzr.vercel.app`. Smoke 4/4 green. Mobile Lighthouse fail — production promote blocked.
- Recorded live origin, env verification note, and green Playwright smoke against `https://project-r4qzr.vercel.app`.
- Fixed mobile chat Sheet so message history scrolls with touch and close is a single header X.

**Known deferred items at close:** 4 (see STATE.md Deferred Items) — CWV Lighthouse, Phase 04 human UAT partial, stale verification docs.

**Known gaps (accepted tech debt):**

- Mobile Lighthouse on preview: LCP/CLS above v1 targets (documented in 06-VERIFICATION.md)
- REQUIREMENTS.md traceability was not checkbox-synced before archive (shipped features validated in PROJECT.md)

---
