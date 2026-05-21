# Milestone v2.1 — Project Summary

**Generated:** 2026-05-21
**Purpose:** Team onboarding and project review

---

## 1. Project Overview

**Appliance Store Lviv** is an online shop for used (б/у) household appliances in Lviv, Ukraine. Customers browse a filtered catalog (price, brand, condition), place orders as guests or with accounts (pickup or Lviv delivery), add to favorites, see contacts and callback in the footer and mobile drawer, and chat with the store in real-time. The admin panel provides full CRUD for products and categories with DnD sorting, delivery-aware order statuses, auto-save product/category editing, sales analytics, callback management (Дзвінки), and sidebar badges.

**Core value:** Покупець швидко знаходить б/у техніку у Львові, оформлює замовлення і за потреби пише магазину в чат.

**Live:** https://project-r4qzr.vercel.app

**v2.1 milestone goal:** Admin UX completeness sprint — dashboard StatCards for calls and chats, full analytics charts on /admin, recent orders table parity, callback note auto-save, categories table row numbers and action buttons, category edit page auto-save + icon-trash delete button.

**Status at v2.1 close:** All 4 phases complete, all 9 requirements shipped, all automated tests passing. Phase 40 has 4 browser-only behavioral checks flagged as `human_needed`; user confirmed manual pass.

---

## 2. Architecture & Technical Decisions

- **`getAdminSidebarCounts()` reused on dashboard (Phase 37)**
  - **Why:** The Phase 36 service already aggregates 5 badge queries via `Promise.all`. Calling it again in the dashboard's `Promise.all` adds zero duplicate DB queries and lets calls/chats StatCards share the exact same data as the sidebar badges.
  - **Phase:** 37

- **Mirror pattern: category edit = product edit (Phase 40)**
  - **Why:** Product edit was already battle-tested. Mirroring it for categories meant zero design decisions — read the product analog, substitute types. Fast to implement, zero ambiguity, identical UX.
  - **Phase:** 40

- **`useCategoryAutoSave` snapshot from `safeParse(initialValues).data` — not raw `initialValues` (Phase 40)**
  - **Why:** Schema transforms (e.g., `sortOrder` coercion) can produce a different snapshot value than what the user typed. Using `safeParse().data` as the init snapshot ensures the "unchanged" dedup check compares the same representation the server will see, preventing ghost saves on first edit.
  - **Phase:** 40

- **`CategoryForm` mode-conditional buttons — edit mode has no Save/Delete (Phase 40)**
  - **Why:** Auto-save hooks handle persistence in edit mode. Keeping a visible Save button alongside auto-save creates user confusion ("did my change save?"). The submit button is wrapped in `{mode === "create" ? <Button> : null}`, keeping create mode completely unchanged.
  - **Phase:** 40

- **TDD RED→GREEN on hooks before integration (Phases 39–40)**
  - **Why:** In Phase 39, the RED gate caught a `saveChainRef` async chain issue and a snapshot dedup edge case that would have been invisible in a browser until production. In Phase 40, it caught a double-Promise.resolve flush requirement in the error toast test. Tests ran before any component wiring.
  - **Phase:** 39, 40

- **Static shadcn Table (not TanStack) for dashboard recent orders (Phase 38)**
  - **Why:** The dashboard table is display-only (no sorting, filtering, or pagination). TanStack Table adds setup cost only justified when those features are needed. A plain shadcn `<Table>` gives identical visual parity with `/admin/zamovlennia` at a fraction of the complexity.
  - **Phase:** 38

- **`deleteCategoryFromListAction` for table delete vs `deleteCategoryAction` for edit redirect (Phase 39)**
  - **Why:** The full `deleteCategoryAction` always redirects — which breaks the categories list page (user would be redirected away after deleting a row). A dedicated `deleteCategoryFromListAction` revalidates paths and returns `{ ok }` without redirect, allowing the table to remove the row locally via `setLocalCategories`.
  - **Phase:** 39

- **`useCallbackNoteAutoSave` 400ms debounce (not 500ms) (Phase 39)**
  - **Why:** CALL-05 explicitly requires 400ms. This differs from the 500ms product/category auto-save. The value comes from the requirement, not convention.
  - **Phase:** 39

---

## 3. Phases Delivered

| Phase | Name | Status | One-Liner |
|-------|------|--------|-----------|
| 37 | Dashboard StatCards | Complete | Two new StatCards (Нові дзвінки + Активні чати) on /admin reusing Phase 36 sidebar counts — no extra DB queries |
| 38 | Dashboard Data Completeness | Complete | Full AnalyticsCharts on /admin (replaced mini preview) + 6-column recent orders table (max 10, row click) matching /admin/zamovlennia |
| 39 | Calls Auto-save & Categories Table Actions | Complete | Callback note auto-saves 400ms with inline status; categories table gains live № column and Дії (add product + delete with AlertDialog) |
| 40 | Category Edit UX | Complete | Category edit page auto-saves 500ms (TDD RED→GREEN) with icon-trash delete button — identical UX to /admin/tovary/[id] |

---

## 4. Requirements Coverage

| ID | Requirement | Status |
|----|-------------|--------|
| ADM-DASH-05 | StatCard «Нові дзвінки» on /admin with count of new/unread callbacks | ✅ Complete |
| ADM-DASH-06 | StatCard «Активні чати» on /admin with count of unread chat messages | ✅ Complete |
| ADM-DASH-07 | Dashboard shows full analytics charts identical to /admin/analityka | ✅ Complete |
| ADM-DASH-08 | Dashboard recent orders table: 6 columns, max 10 rows, row navigation, no filter/pagination | ✅ Complete |
| CALL-05 | Callback note auto-saves via 400ms throttle; no «Зберегти» button | ✅ Complete |
| ADM-CAT-07 | Categories table shows live № column, updates after DnD reorder | ✅ Complete |
| ADM-CAT-08 | Categories table Дії column: «Додати товар» (new product with preselected category) + «Видалити» (AlertDialog confirmation) | ✅ Complete |
| ADM-CAT-09 | Category edit page auto-saves changes without Save button — identical behavior to /admin/tovary/[id] | ✅ Complete |
| ADM-CAT-10 | Category edit delete replaced with icon-only ghost trash button in top-right page header | ✅ Complete |

**Coverage: 9/9 requirements shipped.**

---

## 5. Key Decisions Log

| ID | Decision | Phase | Rationale |
|----|----------|-------|-----------|
| D-01 (37) | Reuse `getAdminSidebarCounts()` in dashboard Promise.all | 37 | Zero duplicate queries; sidebar badges and dashboard StatCards share one DB round-trip |
| D-02 (38) | Delete `analytics-dashboard-preview.tsx`, use `AnalyticsCharts` directly | 38 | ADM-DASH-07 requires identical charts; maintaining a separate preview component diverges over time |
| D-03 (38) | Static shadcn Table for recent orders, `take: 10` | 38 | Display-only table; TanStack overhead not justified |
| D-04 (39) | 400ms debounce for callback note (not 500ms) | 39 | CALL-05 explicitly requires 400ms |
| D-05 (39) | Success auto-save: inline status only, no toast | 39 | Matches product edit UX — quiet success, toast on error only |
| D-06 (39) | `№` column = `index + 1` in `localCategories`, not DB `sortOrder` | 39 | After DnD the DB value lags until commit; local index reflects the visual order instantly |
| D-07 (39) | `deleteCategoryFromListAction` (no redirect) vs `deleteCategoryAction` (redirect) | 39 | Table-side delete must not navigate away; only the edit page should redirect on delete |
| D-08 (40) | Mirror `ProductEditPageContent` / `ProductEditHeader` patterns exactly | 40 | Proven architecture; zero design cost; identical UX for admin |
| D-09 (40) | Snapshot init from `safeParse(initialValues).data` | 40 | Prevents schema-transform-induced ghost saves on first keystroke |
| D-10 (40) | TDD RED→GREEN for `useCategoryAutoSave` and `CategoryEditDeleteButton` | 40 | Caught saveChainRef async flush issue and AlertDialog cleanup issues before integration |
| D-11 (40) | Submit button in `CategoryForm` wrapped in `{mode === "create" ? ... : null}` | 40 | Edit mode: auto-save hook owns persistence. Create mode: unchanged RHF submit flow |
| D-12 (40) | `CategoryEditHeader` has `"use client"` — receives `onNavigateBack` function prop from client parent | 40 | Next.js serialization: function props cannot be passed from server to client components |

---

## 6. Tech Debt & Deferred Items

### Known at Milestone Close

| Category | Item | Severity | Notes |
|----------|------|----------|-------|
| Verification gap | Phase 40 browser-only behavioral checks (auto-save timing, AlertDialog flow, flush-before-navigate, create-mode regression) | Low | Code evidence and unit tests all VERIFIED; human_needed is standard for any UI phase. User confirmed manual pass on 2026-05-21. |
| Template file | `bugfix-intake-TEMPLATE.md` | None | Not a real task — operator intake template |

### Pre-existing (carried forward, not introduced in v2.1)

| Item | Notes |
|------|-------|
| `prisma/seed.test.ts` 3 failures | Seed count mismatch (missing out-of-stock products); tracked as P2, non-blocking |
| DnD hydration mismatch (`aria-describedby DndDescribedBy-0/1`) | Known upstream `@dnd-kit` SSR issue; mitigated with `suppressHydrationWarning` if needed |
| Playwright guest-auth e2e stale | Specs need update for current auth flow; excluded from UAT gate |

### Process Lessons (from Retrospective)

- **REQUIREMENTS.md traceability should be updated by the executor immediately on plan completion** — not at milestone close. Requires manual grep for `Pending` rows that should be `Complete`.
- **Worktree HEAD check must be the executor's first action.** Phase 40 had an accidental commit to main repo (not the worktree), requiring a revert + redo (~2 extra commits).
- **`useMemo(initialValues)` in parent components (WR-02)** — always memoize objects passed as hook deps across render cycles to prevent re-triggering debounced saves.

### Deferred Features (not in v2.2 scope yet)

| Feature | Requirement ID | Status |
|---------|---------------|--------|
| Core Web Vitals / Lighthouse | PERF-01 | Deferred post-v3.0 |
| Google Search Console + custom domain | SEO-01/02 | Deferred post-v3.0 |
| Product reviews | REV-01/02 | Deferred post-v3.0 |
| Pagination / seed merge from stash | CAT-WIP-01 | Deferred |

---

## 7. Getting Started

- **Run the project:** `npm run dev` → http://localhost:3000
- **Admin panel:** http://localhost:3000/admin (requires admin account)
- **Live preview:** https://project-r4qzr.vercel.app
- **Run tests:** `npm test` (Vitest; 329 tests pass as of v2.1)
- **Reset DB:** `npm run db:purge` then `npm run db:seed` — purge preserves auth + store contacts

**Key directories:**

| Directory | Purpose |
|-----------|---------|
| `src/app/(admin)/admin/` | Admin pages (RSC) — dashboard, orders, categories, analytics, dzvinky, chaty |
| `src/app/(storefront)/` | Customer-facing pages — homepage, catalog, PDP, cart, checkout |
| `src/components/admin/` | Admin UI components — StatCard, tables, forms, auto-save headers |
| `src/server/services/` | Business logic services (TDD-first for all admin services) |
| `src/server/actions/admin/` | Server actions — product, category, order, callback CRUD |
| `src/hooks/admin/` | Admin React hooks — use-product-auto-save, use-category-auto-save, use-callback-note-auto-save |
| `src/server/validators/` | Zod schemas — upsertCategorySchema, upsertProductSchema, etc. |
| `.planning/milestones/` | Archived milestone artifacts (ROADMAP, REQUIREMENTS, phase artifacts) |

**Where to look first:**
- Dashboard: `src/app/(admin)/admin/page.tsx` — RSC, single `Promise.all` for all dashboard data
- Category edit page: `src/app/(admin)/admin/kategorii/[id]/page.tsx` → `CategoryEditPageContent` → `CategoryForm` (auto-save) + `CategoryEditHeader` (icon-trash)
- Auto-save pattern: `src/hooks/admin/use-category-auto-save.ts` or `use-product-auto-save.ts`
- Sidebar badges: `src/server/services/admin-sidebar.service.ts` — `getAdminSidebarCounts()`
- Bugfix process: `.planning/BUGFIX-WORKFLOW.md`

---

## Stats

- **Timeline:** 2026-05-21 → 2026-05-21 (single-day sprint)
- **Phases:** 4 / 4 complete
- **Plans:** 7 / 7 complete
- **Commits:** 48 (v2.0..v2.1)
- **Files changed:** 66 (+7,730 / -356)
- **Contributors:** Michael Ivashko
- **Test suite at close:** 329 passing (3 pre-existing seed failures excluded)

---

*Generated by `/gsd:milestone-summary` — 2026-05-21*
*Artifacts read: v2.1-ROADMAP.md, v2.1-REQUIREMENTS.md, PROJECT.md, RETROSPECTIVE.md, STATE.md, phases 37–40 SUMMARY + VERIFICATION + CONTEXT files*
