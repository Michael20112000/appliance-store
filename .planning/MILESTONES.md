# Milestones

## v1.4 Bugfix stabilization (Shipped: 2026-05-19)

**Phases completed:** 5 phases, 8 plans, 16 tasks

**Key accomplishments:**

- Admin shell and `/admin/chaty` establish a flex-1/min-h-0 viewport chain so the inbox grid fills space under fixed H1 + tabs without calc(100dvh) hacks.
- Admin chat list and thread columns scroll inside bounded panels; MessageList uses native scroll on mobile and auto-scroll when a conversation is open.
- ADM-CHAT-02 verified via manual checklist approval, Playwright scroll gate, and post-fix regression on admin list pages.
- Inline product delete on `/admin/tovary` with list-safe server action, confirm dialog, and «Дії» column without breaking row navigation.
- Vitest locks delete control row-navigation isolation; manual checklist documents DB/session delete flows.
- Guarded `db:purge` wipes all business PostgreSQL rows in FK order while Better Auth tables stay intact.
- Storefront survives full business purge with existing empty UX; manual checklist signed for public routes.
- BUG-12…17 verified on main; CI green after minimal test fixes; intake wave 1–2 closed.

**Known deferred items at close:** 12 (see STATE.md Deferred Items) — legacy UAT/verification from phases 04–07, 12–13, 18–19; template todo only.

---

## v1.2 Polish & UX (Shipped: 2026-05-19)

**Phases completed:** 6 phases, 21 plans, 15 tasks

**Key accomplishments:**

- Shared admin clickable-row contract with Vitest coverage and a client hook for router navigation.
- Products admin table refactored to shared clickable rows; «Додати товар» shows Plus icon.
- Orders table: removed «Відкрити» column; body rows navigate to order detail via shared helper.
- Categories list: client table with row-click edit route, no «Редагувати» column, Plus on create.
- Dashboard «Останні замовлення» uses client table with row-click; «Відкрити» removed; manual checklist in place.
- Product.quantity added to PostgreSQL with NOT NULL DEFAULT 1; migration applied and Prisma 7.8.0 client regenerated for downstream services.
- Atomic checkout decrements `Product.quantity` with conditional SOLD; cart, catalog, and wishlist reject or hide zero-stock AVAILABLE listings without exposing quantity on storefront.
- Zod enforces create quantity 1–999 and edit 0–999; admin create/update persist `quantity` and zero-stock AVAILABLE listings become SOLD.
- Admin form and products table expose integer stock (Кількість); Playwright verifies create/list/checkout decrement while storefront catalog and PDP stay quantity-free.
- Installed shadcn `context-menu` primitives for desktop inbox right-click menus.
- Extracted archive/unarchive/delete lifecycle into shared modules; thread ⋮ unchanged for users.
- Desktop ПКМ on `/admin/chaty` inbox rows opens lifecycle menu; mobile uses thread ⋮ only.
- Shared catalog page size (16) and non-empty category filter wired into service layer and sitemap.
- Storefront navigation and catalog sidebar hide empty categories and show shadcn Badge counts.
- Catalog listing paginates 16 products per page with admin-style controls and URL clamp for `сторінка`.
- Storefront catalog sort/brand and admin product-form selects migrated to shadcn Select with nuqs and RHF Controller.
- Verification gate: zero native selects in components, slug UI compliant, build and tests green.

**Known deferred items at close:** 8 (see STATE.md) — prior-milestone UAT/verification debt (phases 04, 06, 07) plus phases 12–13 human_needed verification docs.

---

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
