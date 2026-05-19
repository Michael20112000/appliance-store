# Phase 19: Database Purge & Empty States — Research

**Researched:** 2026-05-19  
**Domain:** Prisma/PostgreSQL operator scripts, FK-safe bulk delete, empty-state regression audit  
**Confidence:** HIGH (codebase-verified); MEDIUM (purge script guards — pattern-standard, not yet implemented)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Scope purge**
- **D-19-01:** Delete **business tables only** in FK-safe order: `Message` → `Conversation` → `OrderItem` → `Order` → `CartItem` → `Cart` → `WishlistItem` → `ProductImage` → `Product` → `Category`.
- **D-19-02:** **Keep auth layer:** `User`, `Session`, `Account`, `Verification` — admin/buyer accounts remain; no re-signup after purge.
- **D-19-03:** Do **not** delete `User` by role; separate “purge users” is out of scope.
- **D-19-04:** One Prisma script (`prisma/purge-business-data.ts`) with `deleteMany` in a **transaction**; order as D-19-01; no whole-DB `TRUNCATE CASCADE`.
- **D-19-05:** Script is **idempotent** — re-run on empty tables exits successfully (0 rows deleted).

**Command safety**
- **D-19-06:** Dedicated npm script **`npm run db:purge`** → `tsx prisma/purge-business-data.ts` — never mixed with `prisma db seed`.
- **D-19-07:** Required explicit flag: **`--confirm`** or env **`CONFIRM_DB_PURGE=yes`** — otherwise exit 1 with message.
- **D-19-08:** **Block production by default:** if `NODE_ENV === "production"`, exit 1 unless **`ALLOW_PRODUCTION_PURGE=yes`**.
- **D-19-09:** Stdout report: tables + row counts deleted + reminder that **Cloudinary is not purged**.
- **D-19-10:** Operator docs: comment in purge script + README dev/staging subsection (backup → purge → optional seed).

**Homepage / storefront empty (after full purge)**
- **D-19-11:** Homepage: keep Phase 15 — `CategoryGrid` returns `null` when 0 categories with available products; Hero + HowToBuy only; no new “coming soon” block.
- **D-19-12:** `/katalog` and `/katalog/[slug]`: existing `ProductGrid` empty + price-filter copy (`priceBounds === null` → «Немає товарів для фільтра ціни») — do not change copy; ensure no 500.
- **D-19-13:** Cart / obrane: existing `CartEmpty` / `WishlistEmptyState` — no redesign; smoke after purge.
- **D-19-14:** Header / mobile nav: empty categories filtered (Phase 15); empty dropdown OK; must not crash.

**Post-purge operator workflow**
- **D-19-15:** `db:purge` does **not** auto-run seed — two separate operator steps.
- **D-19-16:** README flow: (1) DB backup if needed (2) `CONFIRM_DB_PURGE=yes npm run db:purge` (3) optional `npx prisma db seed` (4) add products via `/admin/tovary`.
- **D-19-17:** Admin login unchanged (`ADMIN_EMAIL` / password); seed only if operator wants 8 default categories from `seed.ts`.
- **D-19-18:** Manual smoke checklist (ROADMAP §5): `/`, `/katalog`, `/katalog/[slug]` (existing slug or 404 — not 500), `/koszyk`, `/admin`, `/admin/tovary`, `/admin/kategorii`, `/admin/zamovlennia`, `/admin/chaty`.

**Admin empty states (audit, not redesign)**
- **D-19-19:** Dashboard — StatCards at **0** + «Замовлень ще немає» — sufficient.
- **D-19-20:** Admin list routes — keep existing empty copy; fix only real **500/throw** at 0 rows.
- **D-19-21:** `/admin/tovary/novyi` at 0 categories — no 500; disabled submit or hint OK (minimal UX).

### Claude's Discretion

- README comment language (UK vs EN).
- Optional Vitest smoke on purge script (transaction mock) if plan time allows.
- Copy tweaks **only** if smoke finds 500 or blank screen without text.
- Manual checklist file format (`19-MANUAL-CHECKLIST.md`) — follow Phase 17/18.

### Deferred Ideas (OUT OF SCOPE)

- Cloudinary asset purge.
- Purge non-admin users.
- Marketing empty homepage block («Каталог наповнюється»).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | Operator can fully clear business data in PostgreSQL via one documented script/command; auth users preserved or documented | FK order + `purge-business-data.ts` + `db:purge` + guards (D-19-01…10); schema/migration FK audit below |
| DATA-02 | Storefront and admin work with empty DB: no 500, sensible empty states | Per-route audit below; most UI already implemented; fixes only if smoke fails |
</phase_requirements>

## Summary

Phase 19 is primarily an **operator tooling** deliverable: a guarded, transactional Prisma script that deletes all business entities while preserving Better Auth tables. The storefront and admin **already implement** most empty-state behavior from Phases 3–15 (catalog grids, cart/wishlist empties, admin list paragraphs, dashboard zeros, chat inbox empty titles, new-product page guard when no categories). Research found **no confirmed 500 paths** on the ROADMAP smoke routes at zero rows — the main execution risk is **implementing purge order incorrectly** (Postgres `RESTRICT` on `CartItem.productId` and `Product.categoryId`) or **operators confusing purge with seed**.

**Primary recommendation:** Ship `prisma/purge-business-data.ts` + `npm run db:purge` with env/argv guards first; run manual smoke on a purged dev DB; only add code fixes if smoke surfaces throws. Add `19-MANUAL-CHECKLIST.md` mirroring Phase 17/18. Optional Vitest tests for guard helpers and mocked `deleteMany` counts — not DB-integration tests against real Postgres in CI.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| FK-safe business data deletion | **Database / CLI script** (`prisma/*.ts`) | — | Destructive ops belong outside Next.js request path |
| Purge safety gates (confirm, prod block) | **CLI script** | — | Prevents accidental prod wipe from app code |
| Empty catalog / homepage UI | **Frontend Server (RSC)** | DB (zero rows) | Pages already handle `count === 0` / `null` bounds |
| Dashboard stats at zero | **API layer** (`getAdminDashboardStats`) | Admin RSC page | `count`/`findMany` return 0/[] without throw |
| Operator documentation | **Repo docs** (README + script header) | — | Not runtime feature |

## FK Delete Order

### Schema dependency graph [VERIFIED: `prisma/schema.prisma` + migrations]

| Child | Parent | DB `ON DELETE` | Must delete child before parent? |
|-------|--------|----------------|----------------------------------|
| `Message` | `Conversation` | CASCADE (from Conversation) | Yes — delete `Message` first **or** rely on deleting `Conversation` after messages |
| `Conversation` | — (no FK to Product; `contextProductId` is plain `String?`) | — | After messages |
| `OrderItem` | `Order` | CASCADE | Can delete `OrderItem` first **or** delete `Order` (cascades items) |
| `OrderItem` | `Product` | **SET NULL** | Items must be gone before `Product` if using product delete |
| `Order` | — (`userId` not a Prisma relation) | — | Before products if deleting items explicitly |
| `CartItem` | `Cart` | CASCADE | Delete items or cart |
| `CartItem` | `Product` | **RESTRICT** | **Must** delete all `CartItem` before `Product` |
| `Cart` | — (`userId` not a Prisma relation) | — | Safe after items |
| `WishlistItem` | `User` | CASCADE | Delete items only (keep `User`) |
| `WishlistItem` | `Product` | CASCADE | Must delete before `Product` |
| `ProductImage` | `Product` | CASCADE | Delete before or with product |
| `Product` | `Category` | **RESTRICT** (default) | Delete all products before categories |
| `Category` | — | — | Last business table |

**Auth tables (never purge):** `User`, `Session`, `Account`, `Verification`.

### Locked delete sequence (D-19-01)

Execute in one `prisma.$transaction`, in this order (each step `deleteMany({})` unless noted):

1. `prisma.message.deleteMany({})`
2. `prisma.conversation.deleteMany({})`
3. `prisma.orderItem.deleteMany({})`
4. `prisma.order.deleteMany({})`
5. `prisma.cartItem.deleteMany({})`
6. `prisma.cart.deleteMany({})`
7. `prisma.wishlistItem.deleteMany({})`
8. `prisma.productImage.deleteMany({})`
9. `prisma.product.deleteMany({})`
10. `prisma.category.deleteMany({})`

**Note:** Steps 3–4 and 5–6 could be shortened by deleting parent only (DB cascades children), but explicit child-first order matches CONTEXT, aids per-table counts in stdout (D-19-09), and matches Prisma docs pattern for multi-table wipes [CITED: https://www.prisma.io/docs/orm/prisma-client/queries/crud].

### Idempotency (D-19-05)

`deleteMany({})` on empty tables returns `{ count: 0 }` — no error. Transaction commits with all zeros on re-run.

## Purge Script Design

### File and entrypoint

| Item | Value |
|------|--------|
| Path | `prisma/purge-business-data.ts` |
| npm script | `"db:purge": "tsx prisma/purge-business-data.ts"` in `package.json` |
| Bootstrap | `import "dotenv/config"` (same as `prisma/seed.ts`, `prisma/backfill-product-galleries.ts`) |
| Client | `import { prisma } from "../src/lib/db"` [VERIFIED: existing pattern in `prisma/seed.ts`] |
| Shutdown | `.finally(() => prisma.$disconnect())` |

### Transaction pattern [CITED: Prisma CRUD — delete all tables]

```typescript
// Source: https://www.prisma.io/docs/orm/prisma-client/queries/crud
const steps: Array<{ label: string; run: () => Promise<{ count: number }> }> = [
  { label: "Message", run: () => prisma.message.deleteMany({}) },
  // ... D-19-01 order ...
];

await prisma.$transaction(async (tx) => {
  const report: Record<string, number> = {};
  for (const step of steps) {
    const { count } = await step.run.call(null).replace(prisma, tx); // use tx.message.deleteMany etc.
    report[step.label] = count;
  }
  return report;
});
```

**Implementation detail:** Map each model to `tx.message.deleteMany`, … inside **interactive** `$transaction(async (tx) => …)` so counts are sequential and atomic.

### Stdout report (D-19-09)

- Print table name + `count` per step.
- Final line: total rows deleted (sum).
- **Warning:** `Cloudinary assets were NOT deleted. Orphaned media may remain.`
- Exit `0` on success.

### What purge does **not** touch

- Better Auth tables.
- Guest cart **localStorage** (`appliance-cart-guest`) — client-only; stale IDs resolve to empty cart via `resolveGuestCartProducts` [VERIFIED: `src/server/services/cart.service.ts`].
- Cloudinary (explicitly out of scope per REQUIREMENTS).

## Safety Guards

| Guard | Condition | Exit |
|-------|-----------|------|
| Confirm (D-19-07) | `process.argv.includes("--confirm")` **OR** `process.env.CONFIRM_DB_PURGE === "yes"` | `1` + stderr: how to confirm |
| Production block (D-19-08) | `NODE_ENV === "production"` && `ALLOW_PRODUCTION_PURGE !== "yes"` | `1` + stderr |
| `DATABASE_URL` | Missing (via `src/lib/db`) | throw before delete |

**Argv parsing:** Prefer simple `argv.includes("--confirm")` — no new dependency.

**Discretion:** Log `NODE_ENV` and host hint (redact password) at start for operator confidence.

## Operator Workflow

### Recommended sequence (D-19-16, D-19-17)

1. **Backup** (optional): `pg_dump` / Neon branch snapshot — document in README; not automated in repo.
2. **Purge:** `CONFIRM_DB_PURGE=yes npm run db:purge` (dev/staging; production requires `ALLOW_PRODUCTION_PURGE=yes` as well).
3. **Optional seed:** `npx prisma db seed` — restores 8 categories, admin role, **and** `seedProducts()` (80+ products + Cloudinary uploads). Operators who only want category skeletons may need a slimmer seed in future; **out of scope** — document that full seed re-populates catalog.
4. **Refill:** Create products/categories via admin UI.

### Admin after purge

- **Login:** Works with existing `User`/`Account` rows [D-19-02].
- **Categories:** None until seed or manual create — `/admin/tovary/novyi` already shows hint [VERIFIED: `src/app/(admin)/admin/tovary/novyi/page.tsx` lines 12–20].

### README gap

Root `README.md` is still create-next-app boilerplate [VERIFIED]. Phase should add a short **«Оператор: очистка БД»** subsection (UK per project locale) — D-19-10.

## Empty-State Audit Findings (per route)

Audit method: static read of RSC pages/services; confidence **HIGH** unless noted. Goal: no code change unless smoke fails (D-19-20).

### Storefront

| Route | Empty behavior | 500 risk | Action for phase |
|-------|----------------|----------|------------------|
| `/` | `CategoryGrid` → `null` if no categories with `productCount > 0` [VERIFIED: `category-grid.tsx`]; Hero + HowToBuy always render | **LOW** | Smoke only (D-19-11) |
| `/katalog` | `listPublicProducts` → `total: 0`; `ProductGrid` dashed empty; `getCatalogPriceBounds` → `null` → «Немає товарів для фільтра ціни» [VERIFIED: `catalog-filters.tsx` L246–249]; `computeTotalPages(0)` → 1 page [VERIFIED: `lib/pagination.ts`] | **LOW** | Smoke only (D-19-12) |
| `/katalog/[slug]` | No category → `notFound()` (404) [VERIFIED: `[slug]/page.tsx` L63–66]; category with 0 products → same empty grid as catalog | **LOW** for valid slug after purge (no categories → all slugs 404) | Smoke with **non-existent** slug = 404 OK per D-19-18 |
| `/tovar/[slug]` | `notFound()` if no product | **LOW** | Optional smoke (not in D-19-18 list) |
| `/koszyk` (guest) | `GuestCartView` → `CartEmpty` if no pending IDs or resolved empty [VERIFIED] | **LOW** | Smoke (D-19-13) |
| `/koszyk` (auth) | Purge deletes `Cart` rows; `getOrCreateCart` creates empty cart → `CartEmpty` [VERIFIED: `koszyk/page.tsx`] | **LOW** | Smoke |
| `/obrane` | `listWishlistForUser` → empty lines → `WishlistEmptyState` [VERIFIED: `wishlist-page-content.tsx`] | **LOW** | Smoke (D-19-13) |
| Header / mobile nav | `categoriesWithAvailableProducts` → `[]`; only «Каталог» link [VERIFIED: `store-header.tsx`] | **LOW** | Smoke (D-19-14) |

### Admin

| Route | Empty behavior | 500 risk | Action for phase |
|-------|----------------|----------|------------------|
| `/admin` | `getAdminDashboardStats` uses `count`/`findMany` — zeros and `[]`; «Замовлень ще немає» [VERIFIED: `admin/page.tsx`, `admin-order.service.ts` L121–139] | **LOW** | Smoke (D-19-19) |
| `/admin/tovary` | «Товарів не знайдено…» [VERIFIED: L94–97] | **LOW** | Smoke |
| `/admin/kategorii` | «Немає категорій» [VERIFIED: L20–21] | **LOW** | Smoke |
| `/admin/zamovlennia` | «Замовлень ще немає…» when `filter=all` & `total=0` [VERIFIED: L42–46] | **LOW** | Smoke |
| `/admin/chaty` | `listConversationsForAdmin` → `[]`; inbox `emptyTitle` / `emptyBody` [VERIFIED: `admin-chat-inbox.tsx` L83–88] | **LOW** | Smoke |
| `/admin/tovary/novyi` | `categories.length === 0` → hint, no form [VERIFIED] — satisfies D-19-21 | **LOW** | Smoke |

### Phase 15 alignment [VERIFIED]

- `categoriesWithAvailableProducts()` in `src/lib/catalog/categories.ts` — filters `productCount > 0`.
- Used on homepage grid, header, mobile nav, catalog filters, sitemap — consistent hide-empty-categories behavior.

### Likely **no code changes** for DATA-02

Unless manual smoke finds a gap, DATA-02 is **verification + checklist**, not new UI.

## Standard Stack

### Core (no new packages)

| Library | Version | Purpose |
|---------|---------|---------|
| `tsx` | ^4.19.4 (dev) | Run `prisma/purge-business-data.ts` [VERIFIED: `package.json`] |
| `dotenv` | ^17.4.2 | Load `DATABASE_URL` in scripts |
| `@prisma/client` | ^7.8.0 | `deleteMany`, `$transaction` |
| Existing `prisma` CLI | ^7.8.0 | Migrations unchanged; seed separate |

**Installation:** None required — use existing dependencies.

## Package Legitimacy Audit

> Phase installs **no new** npm packages.

| Package | Disposition |
|---------|-------------|
| — | N/A |

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-table wipe | Raw SQL `TRUNCATE … CASCADE` | Ordered `deleteMany` in `$transaction` | Preserves auth tables; predictable; matches D-19-04 |
| Purge from admin UI | HTTP endpoint to wipe DB | CLI + env guards | Prevents remote exploit surface |
| Custom FK discovery | Runtime `information_schema` | Fixed order from schema | Small fixed graph; auditable |

## Common Pitfalls

### Pitfall 1: Deleting `Product` before `CartItem`
**What goes wrong:** Postgres `RESTRICT` on `CartItem_productId_fkey` — transaction abort.  
**How to avoid:** Follow D-19-01 order exactly [VERIFIED: migration `20260517091854_cart_order_models`].

### Pitfall 2: Confusing purge with seed
**What goes wrong:** Operator runs seed expecting wipe, or purge expecting categories.  
**How to avoid:** Separate `db:purge` script name; README warning (D-19-06, D-19-15).

### Pitfall 3: Full `prisma db seed` after “empty” purge
**What goes wrong:** `seed.ts` calls `seedProducts()` — repopulates 80+ products and uploads images.  
**How to avoid:** Document in README (D-19-16); operator intent must be explicit.

### Pitfall 4: `prisma/seed.test.ts` after purge
**What goes wrong:** Vitest DB tests expect ≥8 categories, ≥80 products [VERIFIED: `prisma/seed.test.ts`] — fail on empty DB until seed.  
**How to avoid:** Run `npx prisma db seed` before `npm test` if integration tests hit DB; purge script not invoked in CI.

### Pitfall 5: Guest cart localStorage after purge
**What goes wrong:** Stale product IDs in browser.  
**How to avoid:** Already handled — missing products skipped in `resolveGuestCartProducts`; UI shows `CartEmpty` when no lines.

## Code Examples

### Guard + transaction skeleton

```typescript
// Source: https://www.prisma.io/docs/orm/prisma-client/queries/crud
import "dotenv/config";
import { prisma } from "../src/lib/db";

function assertPurgeAllowed() {
  const confirmed =
    process.argv.includes("--confirm") ||
    process.env.CONFIRM_DB_PURGE === "yes";
  if (!confirmed) {
    console.error("Refusing purge: pass --confirm or set CONFIRM_DB_PURGE=yes");
    process.exit(1);
  }
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_PRODUCTION_PURGE !== "yes"
  ) {
    console.error("Refusing purge in production without ALLOW_PRODUCTION_PURGE=yes");
    process.exit(1);
  }
}

async function purgeBusinessData() {
  await prisma.$transaction(async (tx) => {
    const r = await tx.message.deleteMany({});
    // ... remaining models in D-19-01 order ...
    return r;
  });
}
```

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Accidental production purge | **HIGH** | D-19-07 + D-19-08 guards; code review |
| Orphan Cloudinary assets | **MEDIUM** | Stdout warning; documented out of scope |
| CI/e2e data loss if purge run on CI DB | **MEDIUM** | Document dev-only; never in workflow YAML |
| Stale bookmark `/katalog/old-slug` | **LOW** | 404 acceptable per D-19-18 |
| Buyer sessions with deleted cart rows | **LOW** | New empty cart on next visit |
| `seed.test.ts` false negatives on empty DB | **LOW** | Re-seed before tests |

## Validation Architecture

### Test framework [VERIFIED: `vitest.config.ts`, `package.json`]

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.6 |
| Config | `vitest.config.ts` |
| Quick run | `npm test` |
| E2E | `npm run test:e2e` (Playwright) — not required for purge unit tests |

### Phase requirements → test map

| Req ID | Behavior | Test type | Automated command | File exists? |
|--------|----------|-----------|-------------------|--------------|
| DATA-01 | Guards reject without confirm | unit | `npx vitest run prisma/purge-business-data.test.ts -x` | ❌ Wave 0 (discretionary) |
| DATA-01 | Delete order invoked in transaction | unit (mock `tx`) | same | ❌ discretionary |
| DATA-01 | Idempotent zero counts | manual / optional integration | operator on dev DB | — |
| DATA-02 | Routes render at empty DB | manual | `19-MANUAL-CHECKLIST.md` | ❌ Wave 0 |
| DATA-02 | Dashboard stats zeros | unit (existing) | `npx vitest run src/server/services/admin-order.service.test.ts -x` | ✅ |

### Sampling rate

- **Per task commit:** `npx vitest run prisma/purge-business-data.test.ts` (if added) or `npm test` for touched files
- **Per wave merge:** `npm test`
- **Phase gate:** Manual checklist signed + purge dry-run on dev DB

### Wave 0 gaps

- [ ] `prisma/purge-business-data.ts` — implementation
- [ ] `package.json` — `db:purge` script
- [ ] `README.md` — operator subsection
- [ ] `.planning/phases/19-database-purge-empty-states/19-MANUAL-CHECKLIST.md`
- [ ] Optional: `prisma/purge-business-data.test.ts` — guard + mock transaction order

## Security Domain

### Applicable ASVS categories

| ASVS Category | Applies | Standard control |
|---------------|---------|------------------|
| V4 Access Control | yes | Purge only via CLI, not web route; prod double-gate |
| V5 Input Validation | yes | Env/argv flags, no user input |
| V6 Cryptography | no | N/A |
| V10 Malicious code | yes | No `postinstall` scripts added; no new packages |

### Threat patterns

| Pattern | STRIDE | Mitigation |
|---------|--------|------------|
| Exposed wipe endpoint | Tampering | CLI-only (Don't Hand-Roll) |
| Prod data loss | Denial | `NODE_ENV` + `ALLOW_PRODUCTION_PURGE` |
| Leaked DB URL in logs | Info disclosure | Redact connection string in logs |

## Recommended Plan Split (waves/plans)

### Wave 1 — Purge tooling (DATA-01) — **Plan 19-01**

| Task | Deliverable |
|------|-------------|
| Implement `prisma/purge-business-data.ts` | Transaction, D-19-01 order, stdout report |
| Add `db:purge` to `package.json` | D-19-06 |
| Guards | `--confirm` / `CONFIRM_DB_PURGE`, production block |
| README + script header comments | D-19-10, D-19-16 |
| Optional Vitest | Guard + `tx` call order mock |

**Verification:** Run purge on dev DB clone; confirm auth user still logs in; `User` count unchanged.

### Wave 2 — Empty-state verification (DATA-02) — **Plan 19-02**

| Task | Deliverable |
|------|-------------|
| Create `19-MANUAL-CHECKLIST.md` | All D-19-18 routes + viewport notes |
| Manual smoke on purged DB | Sign checklist |
| Fix-only patches | Only if 500/blank found (D-19-20, D-19-21) |

**Verification:** All checklist items pass; no unhandled errors in dev console.

### Dependency

```
19-01 (purge script) → 19-02 (smoke on empty DB)
```

**Estimate:** 19-01 = core implementation; 19-02 = mostly QA/documentation if audit holds.

## Project Constraints (from .cursor/rules/)

- **Stack:** Next.js App Router, Prisma 7 + PostgreSQL, Better Auth, Ukrainian UI — purge must not break auth [VERIFIED: `gsd.mdc` / PROJECT.md].
- **Next.js:** Read `node_modules/next/dist/docs/` before API changes — phase unlikely to touch Next routes.
- **Commits:** Only when user/orchestrator requests (GSD executor handles).

## Assumptions Log

| # | Claim | Section | Risk if wrong |
|---|-------|---------|---------------|
| A1 | No code changes needed for DATA-02 on listed routes | Empty-State Audit | Smoke finds hidden 500 — need hotfix plan |
| A2 | `seed.ts` always runs full product seed | Operator Workflow | Operators may want category-only seed |

**If A1 wrong:** Plan 19-02 expands with targeted fixes.

## Open Questions

1. **Category-only seed after purge?**
   - What we know: `seed.ts` always runs `seedProducts()`.
   - Recommendation: Document only in README for v1.3; defer slim seed to backlog.

2. **E2E suite after purge?**
   - What we know: CI expects seeded data.
   - Recommendation: Note in checklist — run `prisma db seed` before `npm run test:e2e`.

## Environment Availability

| Dependency | Required by | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | `tsx`, Vitest | ✓ | (project uses 20+) | — |
| `DATABASE_URL` | purge script | ✓ (local dev) | — | Script throws if missing |
| PostgreSQL / Neon | Prisma | ✓ | Prisma 7.8 | — |
| slopcheck | Package audit | ✗ | — | No new packages |

## Sources

### Primary (HIGH confidence)
- `prisma/schema.prisma` — model relations
- `prisma/migrations/20260517091854_cart_order_models/migration.sql` — FK ON DELETE
- Phase touchpoint files listed in `19-CONTEXT.md`
- [Prisma CRUD — delete all records](https://www.prisma.io/docs/orm/prisma-client/queries/crud) — `$transaction` + `deleteMany`

### Secondary (MEDIUM confidence)
- `19-CONTEXT.md`, `.planning/ROADMAP.md` — success criteria alignment

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — no new deps; existing `tsx`/Prisma
- Architecture / FK order: **HIGH** — schema + migrations verified
- Empty states: **HIGH** — static audit; manual smoke still required (D-19-18)
- Pitfalls: **HIGH** for FK order; **MEDIUM** for operator workflow confusion

**Research date:** 2026-05-19  
**Valid until:** 2026-06-19 (stable domain)

## RESEARCH COMPLETE
