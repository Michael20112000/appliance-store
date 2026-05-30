# Milestones

## v3.1 UX Polish & Fixes (Shipped: 2026-05-30)

**Phases completed:** 4 phases, 15 plans

**Key accomplishments:**

- Cart and wishlist replaced as page navigations — both open as right-side Sheet drawers via DrawerProvider; all five entry points (StorefrontFabs, CartNavLink, GuestCartNavLink, WishlistNavLink, PdpCartFab) converted from Link to button
- Numeric unread badge on chat FAB shows count of unread admin messages; resets to zero on chat open via countUnreadForBuyer service
- SuggestedMessages chip component shows product-contextual chip + 3 general Ukrainian chips on new chat open; clicking prefills ChatComposer via prefillText state in PanelBody
- Mobile chat replaced with Base UI Drawer (swipeDirection=down, swipe-to-close); desktop retains Sheet panel — same ChatPanel branch handles both
- Chat history panel changed from content-swap to CSS translate overlay (absolute inset-y-0 left-0 translate-x-0/-translate-x-full) — PanelBody stays mounted, real-time state preserved
- Chat persistence achieved by replacing nuqs isOpen URL param with plain useState(false) — chat survives storefront page navigation, closes only on explicit X press
- Admin /admin/tovary gains live ProductSearchInput (debounced router.replace, page=1 reset, isMountedRef guard) with q param wired through existing Zod listAdminProductsSchema

**Stats:** 97 commits · 58 files changed · +2880/−239 lines · 3 days (2026-05-27 → 2026-05-30)

---

## v3.0 Chat & Engagement (Shipped: 2026-05-26)

**Phases completed:** 4 phases, 16 plans

**Key accomplishments:**

- Unauthenticated users can open chat widget and send messages without registering; session persisted via localStorage `chat_guest_token`; guest appears as "Гість" in admin inbox
- Admin closes chat with real-time Pusher notification ("Чат завершено"); input locks; "Почати новий чат" CTA on closure
- Guest conversation automatically claimed by account on login via POST /api/chat/claim with $transaction TOCTOU guard
- Authenticated users access in-widget conversation history drawer via Menu button; conversation switching and "Новий чат" creation from drawer
- Auth users and admin can send image attachments (jpg/png/webp, ≤10 MB) via signed Cloudinary preset `chat-attachments`; guests remain text-only

**Known gaps at close:** REQUIREMENTS.md checkbox sync gap — CHAT-01, CHAT-03, CHAT-06–09 were `Pending` in traceability but confirmed shipped by UAT summaries (46-05, 47-05, 48-03, 49-03).

---

## v2.3 Bugfixes & Small Features (Shipped: 2026-05-24)

**Phases completed:** 2 phases, 4 plans, 1 tasks

**Key accomplishments:**

- One-liner:
- One-liner:

---

## v2.2 Bugfixes & Small Features (Shipped: 2026-05-23)

**Phases completed:** 3 phases, 6 plans, 10 tasks

**Key accomplishments:**

- One-liner:
- StorefrontFabs client component with persistent cart FAB and callback FAB opening @base-ui/react/dialog with store phones and CallbackRequestForm idPrefix="fab"
- StorefrontFabs injected into storefront layout RSC with server-side phone contacts and session-conditional cart count, completing FAB-01 and FAB-02 wiring
- Vitest RED-phase scaffolds: 5 tests for addressExternalMapUrl embed detection (3 failing) and 4 tests for normalizeSliderBounds grid snapping (all failing — import error)
- normalizeSliderBounds 50-UAH grid snap for price slider + isEmbedMapUrl guard to fix footer address link from embed iframe URL to navigable Google Maps URL
- 150ms CSS opacity fade-in on storefront page navigation via @keyframes + .page-transition class in globals.css and a plain div wrapper in the storefront RSC layout

---

## v2.1 Fixes & UX (Shipped: 2026-05-21)

**Phases completed:** 4 phases, 7 plans, 0 tasks

**Key accomplishments:**

- Callback notes on active rows auto-save after 400ms with inline «Збереження…» / «Збережено» — no save button or success toast.
- Categories table shows live № after DnD and a Дії column with «Додати товар» (novyi?categoryId) and confirmed delete without leaving the list.
- One-liner:
- One-liner:

---

## v2.0 Polish, UX & Admin analytics (Shipped: 2026-05-21)

**Phases completed:** 9 phases, 26 plans, 32 tasks

**Key accomplishments:**

- Mobile drawer now mirrors header auth: guests see Увійти/Реєстрація, signed-in users see Кабінет/Вийти below the callback form.
- Storefront hash links scroll smoothly with header offset on `#kategorii`; reduced motion disables animation.
- Homepage category cards show availability counts using the same pipeline as the mobile drawer.
- Catalog sort dropdown uses one Ukrainian label map; toolbar duplication bug fixed.
- Catalog list cards load up to five preview images with a desktop-only hover crossfade stack; mobile and reduced-motion stay on the first image.
- PDP lightbox tuned for momentum drag with nearest-slide snap — no instant jump on reopen when already aligned
- PDP in-cart state shows «Вже в кошику» with icon-only remove; a PDP-only cart FAB above chat links to /koszyk when count ≥ 1.
- Server-side «Схожі товари» on PDP: category-scoped price bands with ±20%/±40% fallbacks, Fisher–Yates shuffle, up to four ProductCards with wishlist when logged in.
- FOOT-05 responsive footer — desktop map left, contacts+callback right, mobile action-first stack, centered © on md+
- Admin order status selects now show correct stock errors, actionable hints, and per-status trigger accents — BUG-24 list UNKNOWN mapping fixed without changing reserve-on-confirm.
- Task 1 — Dashboard action buttons:
- Installed @dnd-kit/core@6.3.1, @dnd-kit/sortable@10.0.0, and @dnd-kit/utilities@3.2.2 after human package legitimacy verification
- One-liner:
- One-liner:
- One-liner:
- One-liner:
- Prisma time-series analytics service with $queryRaw day-bucketing, BigInt conversion, zero-fill, and shadcn recharts chart component installed — all 5 vitest tests green
- One-liner:
- Two "use client" chart components created: AnalyticsCharts with paired h-[220px] LineCharts (orders + revenue with formatRevenue tooltip) and AnalyticsDashboardPreview with paired h-[120px] mini-charts + KPI row + Детальна аналітика link — zero TypeScript errors, 5 analytics tests green.
- Resumed after Claude Code session limit at wave 3/3. Analytics page and dashboard preview wired; kopiyky→UAH revenue fix; human UAT approved.
- Wave 0 Nyquist tests lock admin callback list, status, note, and archive rules before backend implementation.
- Prisma migration and admin callback service/actions implement archive gate, note null normalization, and active/archive listing.
- Operators manage callback requests on `/admin/dzvinky`; store settings no longer embeds the callback table.
- Vitest unit test scaffold for getAdminSidebarCounts() with 7 RED tests covering all five count queries, filter rules D-01/D-03/D-05, and parallel execution mapping
- Service `admin-sidebar.service.ts` implementing `getAdminSidebarCounts()` with `AdminSidebarBadgeCounts` type — all 7 Wave 0 unit tests turned GREEN via parallel Promise.all with correct D-01/D-03/D-05/D-08 filters

---

## v1.5 Incremental polish & operator UX (Shipped: 2026-05-19)

**Phases completed:** 6 phases, 8 plans, 19 tasks

**Key accomplishments:**

- Admin order status options and API now respect pickup vs Lviv delivery — wrong fulfillment statuses are hidden and rejected.
- Admin category edit toolbar and list «Товари» column link operators to filtered products without breaking row-click edit.
- Edit product page auto-saves with debounced server actions, category-aware back navigation, and header AlertDialog delete — create flow unchanged.
- Homepage «Категорії» now hides empty categories and omits the whole section when nothing is in stock — same rules as the header nav.
- Store contacts and callback requests live in PostgreSQL; footer, mobile drawer, homepage JsonLd, and admin settings all read the same source.
- UAT-01 closed: operator purge/empty checklist, guest checkout + admin order smoke, BUG-18…23 verified; `27-UAT-REPORT.md` recommends ship.

**Known deferred items at close:** 5 (see STATE.md Deferred Items) — legacy UAT phases 04/07/18; `prisma/seed.test.ts` P2; stale `e2e/cart-auth.spec.ts`; `git stash@{0}`; template todo only.

---

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
