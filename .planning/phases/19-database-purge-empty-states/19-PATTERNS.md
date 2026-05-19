# Phase 19: Database Purge & Empty States — Pattern Map

**Mapped:** 2026-05-19  
**Files analyzed:** 9 (6 create/modify + 3 audit-only touchpoints)  
**Analogs found:** 8 / 9

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `prisma/purge-business-data.ts` | config (CLI script) | batch (ordered deleteMany) | `prisma/seed.ts` + `prisma/seed-products.ts` | exact |
| `package.json` (`db:purge` script) | config | — | `package.json` (`prisma.seed`) | exact |
| `README.md` (operator subsection) | config/docs | — | `README.md` CI section + `.planning/phases/06-polish-launch/06-ENV-CHECKLIST.md` | role-match |
| `prisma/purge-business-data.test.ts` (optional) | test | batch (mocked) | `src/server/services/admin-order.service.test.ts` + `src/server/services/chat.service.test.ts` | role-match |
| `19-MANUAL-CHECKLIST.md` | test (manual) | request-response (smoke) | `18-MANUAL-CHECKLIST.md` | exact |
| Fix-only admin/storefront routes | component/route | request-response | Existing empty branches (audit) | exact (no new UI) |
| `src/server/services/admin-order.service.ts` | service | CRUD (read/count) | — (audit only) | exact |
| Storefront empty components/pages | component/route | request-response | `category-grid.tsx`, `katalog/page.tsx`, `cart-empty.tsx` | exact (verify only) |
| `src/app/(admin)/admin/tovary/novyi/page.tsx` | route | request-response | Same file (D-19-21 guard exists) | exact |

---

## Pattern Assignments

### `prisma/purge-business-data.ts` (config, batch delete)

**Analog (bootstrap + lifecycle):** `prisma/seed.ts`  
**Analog (FK-safe delete order):** `prisma/seed-products.ts`  
**Analog (interactive transaction):** `src/server/services/order.service.ts`

**Imports + dotenv + prisma client** (`prisma/seed.ts` lines 1–4):

```typescript
import "dotenv/config";
import slugify from "slugify";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/db";
```

Purge script should use only:

```typescript
import "dotenv/config";
import { prisma } from "../src/lib/db";
```

(`src/lib/db.ts` throws if `DATABASE_URL` missing — lines 9–12.)

**Script lifecycle** (`prisma/seed.ts` lines 96–103):

```typescript
main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Prefer static `import { prisma }` + `.finally(() => prisma.$disconnect())` like `prisma/backfill-category-images.ts` (lines 43–50) over dynamic import in `backfill-product-galleries.ts`.

**Operator script header comment** (`prisma/backfill-category-images.ts` lines 6–9):

```typescript
/**
 * Backfill category showcase images (null imagePublicId only) + standard alt text.
 * Run: npx tsx prisma/backfill-category-images.ts
 */
```

Extend with: FK order, `--confirm` / `CONFIRM_DB_PURGE=yes`, production gate, Cloudinary not purged, optional seed after.

**FK-safe child-before-parent deletes** (`prisma/seed-products.ts` lines 41–43, 81–86):

```typescript
const ids = legacy.map((p) => p.id);
await prisma.cartItem.deleteMany({ where: { productId: { in: ids } } });
await prisma.product.deleteMany({ where: { id: { in: ids } } });
```

```typescript
await prisma.cartItem.deleteMany({
  where: { product: orphanProductWhere },
});
await prisma.product.deleteMany({
  where: orphanProductWhere,
});
```

Phase 19 uses **unscoped** `deleteMany({})` in fixed D-19-01 order inside one transaction (not `where: { in: ids }`).

**Interactive `$transaction` with `tx`** (`src/server/services/order.service.ts` lines 224–232):

```typescript
const result = await prisma.$transaction(async (tx) => {
  const created = await createOrderInTransaction(tx, lines, data, { userId });
  await tx.cartItem.deleteMany({
    where: {
      cart: { userId },
    },
  });
  return created;
});
```

Map purge steps to `tx.message.deleteMany({})`, … `tx.category.deleteMany({})`; accumulate `{ count }` per step for stdout (D-19-09).

**Stdout reporting** (`prisma/backfill-category-images.ts` lines 36–40):

```typescript
    updated += 1;
    console.log(`✓ ${category.name}`);
  }

  console.log(`Done. Updated ${updated}/${categories.length} categories.`);
```

Purge: log each table + count; sum total; final Cloudinary warning line.

**Guards (no codebase analog — implement per RESEARCH skeleton):**

```typescript
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
    console.error(
      "Refusing purge in production without ALLOW_PRODUCTION_PURGE=yes",
    );
    process.exit(1);
  }
}
```

Call `assertPurgeAllowed()` at top of `main()` before any `deleteMany`.

**Do not copy from seed:** `auth.api.signUpEmail`, upserts, Cloudinary uploads — purge is delete-only; never invoke `seedProducts()`.

---

### `package.json` — `db:purge` script (config)

**Analog:** existing `prisma.seed` entry (lines 14–16):

```json
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
```

**Pattern to add** under `"scripts"`:

```json
"db:purge": "tsx prisma/purge-business-data.ts"
```

Keep **separate** from `"prisma"."seed"` (D-19-06, D-19-15). `tsx` already in `devDependencies` (^4.19.4).

---

### `README.md` — operator subsection (config/docs)

**Analog (in-repo operator docs structure):** `.planning/phases/06-polish-launch/06-ENV-CHECKLIST.md` (tables + bash blocks)

**Analog (root README section placement):** existing `## Continuous Integration` block (lines 23–36):

```markdown
## Continuous Integration

Every push and pull request to `main` runs lint, Vitest, and Playwright against **localhost** (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).
```

Add new section e.g. `## Оператор: очистка БД (dev/staging)` with:

1. Backup note (`pg_dump` / Neon branch — not automated)
2. `CONFIRM_DB_PURGE=yes npm run db:purge` (and prod: `ALLOW_PRODUCTION_PURGE=yes`)
3. Warning: full `npx prisma db seed` re-runs `seedProducts()` (80+ products + Cloudinary)
4. Optional admin refill via `/admin/tovary`
5. Note: `npm test` / `prisma/seed.test.ts` expect seeded data — re-seed before tests

Match tone: Ukrainian headings where UI is UK; short imperative steps like ENV checklist.

---

### `prisma/purge-business-data.test.ts` (optional test)

**Analog (prisma test location):** `vitest.config.ts` lines 12–16:

```typescript
    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "prisma/**/*.test.ts",
    ],
```

**Analog (mock prisma):** `src/server/services/admin-order.service.test.ts` lines 17–28, 41–55:

```typescript
vi.mock("@/lib/db", () => ({
  prisma: {
    order: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    product: {
      count: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));
```

```typescript
describe("getAdminDashboardStats", () => {
  it("returns pending, product counts, and recent orders", async () => {
    vi.mocked(prisma.order.count).mockResolvedValueOnce(4);
    // ...
    const stats = await getAdminDashboardStats();
    expect(stats.pendingOrders).toBe(4);
```

For purge: export `assertPurgeAllowed` (or pure `isPurgeConfirmed(env, argv)`) for unit tests without hitting DB; mock `prisma.$transaction` like `chat.service.test.ts` lines 179–185:

```typescript
    vi.mocked(prisma.$transaction).mockImplementationOnce(async (fn) => {
      const tx = {
        message: { create: vi.fn().mockResolvedValue(message) },
        conversation: { update: vi.fn().mockResolvedValue({}) },
      };
      return fn(tx as never);
    });
```

Extend `tx` mock with `deleteMany: vi.fn().mockResolvedValue({ count: 0 })` per model; assert call order matches D-19-01.

**No analog** for `process.exit` in tests — test pure guard helpers; integration idempotency = manual checklist + dev DB.

**Contrast:** `prisma/seed.test.ts` hits real DB — do **not** use as purge test template (expects ≥8 categories after seed).

---

### `19-MANUAL-CHECKLIST.md` (manual test)

**Analog:** `18-MANUAL-CHECKLIST.md` (full structure)

**Title + metadata:**

```markdown
# Phase 18 — Product Delete from List — Manual Checklist

**Requirement:** ADM-PRD-04  
**Run after:** Plans 18-01 and 18-02 (list delete UI + Vitest)
```

Phase 19 template:

```markdown
# Phase 19 — Database Purge & Empty States — Manual Checklist

**Requirements:** DATA-01, DATA-02  
**Run after:** Plan 19-01 (`db:purge` + guards); smoke on purged dev DB
```

**Prerequisites block** (lines 6–10 pattern):

```markdown
## Prerequisites

- `npm run dev` running
- Purge executed: `CONFIRM_DB_PURGE=yes npm run db:purge` on dev DB
- Admin still signs in (auth tables untouched)
- Optional: note if `npx prisma db seed` was run after purge
```

**Route checklist** (D-19-18) — one checkbox per route, console clean:

| Route | Expected (no 500) |
|-------|-------------------|
| `/` | Hero + HowToBuy; no `CategoryGrid` |
| `/katalog` | Dashed empty grid + price filter message |
| `/katalog/[slug]` | 404 for missing slug OK |
| `/koszyk` | `CartEmpty` |
| `/obrane` | `WishlistEmptyState` (optional, D-19-13) |
| `/admin` | StatCards `0`, «Замовлень ще немає» |
| `/admin/tovary` | «Товарів не знайдено…» |
| `/admin/kategorii` | «Немає категорій» |
| `/admin/zamovlennia` | «Замовлень ще немає…» (filter=all) |
| `/admin/chaty` | Inbox empty title/body |
| `/admin/tovary/novyi` | Category hint, no form |

**Sign-off table** — copy from `17-MANUAL-CHECKLIST.md` lines 59–66 or `18-MANUAL-CHECKLIST.md` lines 37–41.

---

### Fix-only routes (audit — copy existing empty branches, do not redesign)

Only patch if smoke finds 500 or blank screen without copy (D-19-20, D-19-21).

#### Storefront homepage — `src/components/home/category-grid.tsx`

**Analog:** same file (lines 15–21):

```typescript
export async function CategoryGrid() {
  const { categories: categoriesWithCounts } = await listCategoriesWithProductCounts();
  const categories = categoriesWithAvailableProducts(categoriesWithCounts);

  if (categories.length === 0) {
    return null;
  }
```

D-19-11: no new marketing block.

#### Catalog — `src/app/(storefront)/katalog/page.tsx`

**Analog:** `ProductGrid` empty prop (lines 98–114):

```typescript
          <ProductGrid
            products={result.items}
            hasSession={Boolean(session?.user)}
            wishlistedProductIds={wishlistedProductIds}
            empty={
              <div className="rounded-lg border border-dashed p-10 text-center">
                <h2 className="text-lg font-medium">Товарів не знайдено</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {parsed.q
                    ? "Спробуйте інші ключові слова або скиньте фільтри."
                    : "Спробуйте змінити фільтри."}
                </p>
                <Link href="/katalog" className={cn(buttonVariants(), "mt-6 inline-flex")}>
                  Скинути фільтри
                </Link>
              </div>
            }
          />
```

#### Category slug 404 — `src/app/(storefront)/katalog/[slug]/page.tsx`

**Analog** (lines 63–66):

```typescript
  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }
```

After purge all slugs → 404 (acceptable per D-19-18).

#### Price filter empty — `src/components/catalog/catalog-filters.tsx`

**Analog** (lines 96–98, 246–249):

```typescript
  const bounds = priceBounds ?? null;
  const hasPriceBounds = bounds != null;
```

```typescript
        {!hasPriceBounds ? (
          <p className="text-sm text-muted-foreground">
            Немає товарів для фільтра ціни
          </p>
```

#### Cart — `src/components/cart/cart-empty.tsx`

**Analog** (lines 5–15):

```typescript
export function CartEmpty() {
  return (
    <div className="rounded-lg border border-dashed p-10 text-center">
      <h2 className="text-lg font-medium">Кошик порожній</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Додайте товари з каталогу — ми збережемо їх тут до оформлення.
      </p>
      <Link href="/katalog" className={cn(buttonVariants(), "mt-6 inline-flex")}>
        До каталогу
      </Link>
    </div>
  );
}
```

#### Wishlist — `src/components/wishlist/wishlist-page-content.tsx`

**Analog** (lines 17–22, 44–50):

```typescript
  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Обране</h1>
        <WishlistEmptyState />
      </div>
    );
  }
```

#### Header — `src/components/layout/store-header.tsx`

**Analog** (lines 17–19):

```typescript
  const { categories: categoriesWithCounts } = await listCategoriesWithProductCounts();
  const availableCategories = categoriesWithAvailableProducts(categoriesWithCounts);
  const headerNavCategories = availableCategories.slice(0, 4);
```

Empty array → dropdown may be empty; must not throw.

#### Admin dashboard — `src/app/(admin)/admin/page.tsx`

**Analog** (lines 7–8, 47–48):

```typescript
  const stats = await getAdminDashboardStats();
```

```typescript
        {stats.recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Замовлень ще немає</p>
```

**Service backing zeros** — `src/server/services/admin-order.service.ts` (lines 121–139):

```typescript
export async function getAdminDashboardStats() {
  const [pendingOrders, availableProducts, draftProducts, recentOrders] =
    await Promise.all([
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { status: "AVAILABLE" } }),
      prisma.product.count({ where: { status: "DRAFT" } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
    ]);

  return {
    pendingOrders,
    availableProducts,
    draftProducts,
    recentOrders: recentOrders.map(mapOrderSummary),
  };
}
```

#### Admin lists — products / categories / orders

**Products** — `src/app/(admin)/admin/tovary/page.tsx` (94–97):

```typescript
      {result.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Товарів не знайдено. Створіть перший товар або змініть фільтри.
        </p>
```

**Categories** — `src/app/(admin)/admin/kategorii/page.tsx` (20–21):

```typescript
      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">Немає категорій</p>
```

**Orders** — `src/app/(admin)/admin/zamovlennia/page.tsx` (42–46):

```typescript
      {result.total === 0 && params.filter === "all" ? (
        <p className="text-sm text-muted-foreground">
          Замовлень ще немає. Коли покупець оформить замовлення, воно з&apos;явиться
          тут.
        </p>
```

#### Admin chat — `src/components/chat/admin-chat-inbox.tsx`

**Analog** (lines 83–88):

```typescript
  const emptyTitle =
    view === "archive" ? "Архів порожній" : "Немає активних діалогів";
  const emptyBody =
    view === "archive"
      ? "Архівовані діалоги зʼявляться тут після архівації."
      : "Коли покупець напише, діалог зʼявиться тут.";
```

#### New product at 0 categories — `src/app/(admin)/admin/tovary/novyi/page.tsx`

**Analog** (lines 12–20) — satisfies D-19-21:

```typescript
  if (categories.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Новий товар</h1>
        <p className="text-sm text-muted-foreground">
          Спочатку створіть хоча б одну категорію в розділі «Категорії».
        </p>
      </div>
    );
  }
```

---

## Shared Patterns

### Prisma CLI scripts (all `prisma/*.ts` operators)

**Source:** `prisma/seed.ts`, `prisma/backfill-category-images.ts`  
**Apply to:** `purge-business-data.ts`

| Concern | Pattern |
|---------|---------|
| Env | `import "dotenv/config"` first line |
| Client | `import { prisma } from "../src/lib/db"` |
| Entry | `async function main()` + `main().catch(...).finally(disconnect)` |
| Logging | `console.log` / `console.error`; `process.exit(1)` on failure |

### Admin empty UI (no shared `EmptyState` component)

**Source:** admin list pages above  
**Apply to:** fix-only if missing copy

```typescript
<p className="text-sm text-muted-foreground">…український copy…</p>
```

### Storefront empty UI (dashed border card)

**Source:** `src/components/cart/cart-empty.tsx`, `katalog/page.tsx` `ProductGrid` empty  
**Apply to:** fix-only storefront gaps

```typescript
<div className="rounded-lg border border-dashed p-10 text-center">
  <h2 className="text-lg font-medium">…</h2>
  <p className="mt-2 text-sm text-muted-foreground">…</p>
```

### Hide empty categories (Phase 15)

**Source:** `src/lib/catalog/categories.ts` (lines 1–5)

```typescript
export function categoriesWithAvailableProducts<T extends { productCount: number }>(
  categories: T[],
): T[] {
  return categories.filter((category) => category.productCount > 0);
}
```

Used on homepage, header, catalog filters — consistent after purge.

### Batch array transaction (alternative style)

**Source:** `src/server/services/admin-product.service.ts` (lines 330–346)

```typescript
  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId } }),
    ...(normalized.length > 0
      ? [
          prisma.productImage.createMany({
```

Purge prefers **interactive** callback form (like `order.service.ts`) for sequential counts in one atomic unit.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `assertPurgeAllowed` / production env guards | utility | — | No `CONFIRM_*` or `ALLOW_PRODUCTION_*` patterns in repo; use RESEARCH skeleton |
| HTTP/admin purge endpoint | — | — | Intentionally absent (CLI-only per research) |

---

## Metadata

**Analog search scope:** `prisma/`, `package.json`, `README.md`, `src/server/services/*.ts`, `src/app/(admin)/`, `src/app/(storefront)/`, `src/components/{home,catalog,cart,wishlist,chat,layout}/`, `.planning/phases/{17,18}*/`  
**Files scanned:** ~25  
**Pattern extraction date:** 2026-05-19

## PATTERN MAPPING COMPLETE

**Phase:** 19 — Database Purge & Empty States  
**Files classified:** 9  
**Analogs found:** 8 / 9

### Coverage
- Files with exact analog: 7 (`purge` script family, `package.json`, manual checklist, empty-state touchpoints)
- Files with role-match analog: 2 (`README` operator docs, optional Vitest)
- Files with no analog: 1 (env guard helpers — greenfield)

### Key Patterns Identified
- Operator scripts: `dotenv/config` + `src/lib/db` prisma + `main().catch.exit(1).finally($disconnect)` — copy from `seed.ts` / backfills.
- FK deletes: always `cartItem` (and other children) before `product`; full wipe uses ordered `deleteMany({})` in one `$transaction(async (tx) => …)`.
- `db:purge` is a sibling of `prisma.seed`, not merged with seed.
- DATA-02 is mostly verification: admin uses `text-muted-foreground` paragraphs; storefront uses dashed empty cards or `CategoryGrid` → `null`.
- Optional tests: mock `@/lib/db` like service tests; do not mirror `prisma/seed.test.ts` DB integration for purge.

### File Created
`.planning/phases/19-database-purge-empty-states/19-PATTERNS.md`

### Ready for Planning
Pattern mapping complete. Planner can reference analog patterns in PLAN.md files.
