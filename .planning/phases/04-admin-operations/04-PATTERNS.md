# Phase 4: Admin Operations - Pattern Map

**Mapped:** 2026-05-17
**Files analyzed:** 32 (create/modify for Phase 4)
**Analogs found:** 24 / 32

## File Classification (analogs)

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/permissions.ts` | middleware | request-response | same file (`requireAdmin`) | exact |
| `src/app/(admin)/admin/layout.tsx` | route | request-response | same file | exact |
| `src/app/(admin)/admin/page.tsx` | route | CRUD read | same file (dashboard stub) | exact |
| `src/server/validators/category.ts` | utility | transform | `src/server/validators/product.ts` | exact |
| `src/server/validators/admin-product.ts` | utility | transform | `product.ts` + `order.ts` (superRefine) | exact |
| `src/server/validators/admin-order.ts` | utility | transform | `src/server/validators/order.ts` | exact |
| `src/server/services/admin-catalog.service.ts` | service | CRUD | `src/server/services/catalog.service.ts` | exact |
| `src/server/services/admin-product.service.ts` | service | CRUD + transaction | `catalog.service.ts` + `order.service.ts` | role-match |
| `src/server/services/admin-order.service.ts` | service | CRUD + transaction | `src/server/services/order.service.ts` | exact |
| `src/server/services/media.service.ts` | service | file-I/O | — | **no analog** |
| `src/lib/cloudinary.ts` | utility | request-response | `.planning/research/ARCHITECTURE.md` Pattern 4 | **no analog** |
| `src/app/api/upload/sign/route.ts` | route | request-response | `src/app/api/auth/[...all]/route.ts` (thin handler) | partial |
| `src/server/actions/admin/category.actions.ts` | controller | request-response | `src/server/actions/cart.actions.ts` | exact |
| `src/server/actions/admin/product.actions.ts` | controller | request-response | `cart.actions.ts` + `order.actions.ts` | exact |
| `src/server/actions/admin/order.actions.ts` | controller | request-response | `src/server/actions/order.actions.ts` | exact |
| `src/types/admin.ts` | model | transform | `src/types/catalog.ts`, `src/types/order.ts` | exact |
| `src/app/(admin)/admin/kategorii/page.tsx` | route | CRUD read | `src/app/(storefront)/katalog/page.tsx` | role-match |
| `src/app/(admin)/admin/kategorii/novyi/page.tsx` | route | request-response | `zamovlennia/page.tsx` + form component | role-match |
| `src/app/(admin)/admin/kategorii/[id]/page.tsx` | route | CRUD read + write | category new/edit pages | role-match |
| `src/app/(admin)/admin/tovary/page.tsx` | route | CRUD read | `katalog/page.tsx` (list + empty state) | exact |
| `src/app/(admin)/admin/tovary/novyi/page.tsx` | route | request-response | checkout page shell | role-match |
| `src/app/(admin)/admin/tovary/[id]/page.tsx` | route | CRUD read + write | PDP + product form | role-match |
| `src/app/(admin)/admin/zamovlennia/page.tsx` | route | CRUD read | `kabinet/page.tsx` + `order-history-list.tsx` | exact |
| `src/app/(admin)/admin/zamovlennia/[orderNumber]/page.tsx` | route | CRUD read + write | confirmation page + checkout form | role-match |
| `src/components/admin/category-form.tsx` | component | request-response | `src/components/checkout/checkout-form.tsx` | exact |
| `src/components/admin/product-form.tsx` | component | request-response | `checkout-form.tsx` | exact |
| `src/components/admin/product-image-upload.tsx` | component | file-I/O | `OptimizedImage` + ARCHITECTURE Pattern 4 | partial |
| `src/components/admin/orders-table.tsx` | component | transform | `order-history-list.tsx` + `order-history-card.tsx` | exact |
| `src/components/admin/admin-nav.tsx` | component | transform | `store-header.tsx` (nav links) | role-match |
| `prisma/schema.prisma` | model | CRUD schema | same file (no new tables Phase 4) | exact |
| `e2e/admin-crud.spec.ts` | test | e2e | `e2e/admin-rbac.spec.ts` + `checkout.spec.ts` | exact |
| `src/server/services/admin-catalog.service.test.ts` | test | unit | `catalog.service.test.ts` | exact |

**Out of scope Phase 4:** `ADM-05` chat inbox → Phase 5 (`ROADMAP.md` Phase 5 owns chat UI).

---

## Server action pattern

| Concern | Source | Apply to |
|---------|--------|----------|
| File header | `cart.actions.ts` L1 | All `src/server/actions/admin/*.ts` |
| Auth guard | `cart.actions.ts` L18, `order.actions.ts` L11 | `requireAdmin()` not `requireBuyer()` |
| Validation | `cart.actions.ts` L19 | Zod `.parse()` / `.safeParse()` on input |
| Service delegation | `cart.actions.ts` L22 | No `prisma` in actions |
| Result shape | `cart.actions.ts` L24-28 | `{ ok: false, error: code }` for expected failures |
| Redirect | `order.actions.ts` L19 | Product save → redirect to edit/list |
| Redirect re-throw | `order.actions.ts` L21-23 | `isRedirectError` before catch |

**Canonical action skeleton** (merge `cart.actions.ts` + `order.actions.ts`):

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { requireAdmin } from "@/lib/permissions";
import { createCategory } from "@/server/services/admin-catalog.service";
import { upsertCategorySchema } from "@/server/validators/category";

function revalidateAdminCatalogPaths(slug?: string) {
  revalidatePath("/admin/kategorii");
  revalidatePath("/admin/tovary");
  revalidatePath("/katalog");
  if (slug) {
    revalidatePath(`/katalog/${slug}`);
    revalidatePath(`/tovar/${slug}`); // if product slug passed separately
  }
}

export async function createCategoryAction(input: unknown) {
  await requireAdmin();
  const data = upsertCategorySchema.parse(input);
  const category = await createCategory(data);
  revalidateAdminCatalogPaths(category.slug);
  redirect(`/admin/kategorii/${category.id}`);
}
```

**Per-action checklist:**
1. `"use server"` at top.
2. First line in body: `await requireAdmin()` (never trust layout alone — PITFALLS #2).
3. Parse with Zod schema from `server/validators/`.
4. Call **one** service function.
5. `revalidatePath` / shared helper (see table below).
6. `redirect()` after create, or `return { ok: true }` for inline status updates.

---

## Form pattern (checkout-form)

**Analog:** `src/components/checkout/checkout-form.tsx`

| Pattern | Lines | Admin apply |
|---------|-------|-------------|
| `"use client"` | 1 | All admin forms |
| `react-hook-form` + `zodResolver` | 4-6, 19-20 | Import schema from `server/validators/*` (types via `z.infer`) |
| Server action import | 7-8 | `createProductAction`, `updateCategoryAction`, etc. |
| Error `useState` + `Alert` | 18, 48-51 | Ukrainian messages |
| Conditional fields | 30, 89-99 | e.g. `status === "AVAILABLE"`; price in UAH input → kopiyky in action |
| Submit disabled | 111 | `form.formState.isSubmitting` |
| Native controls | 69-87 | Radio for status/delivery analogs; `select` for category |
| No `router.refresh` on success when action redirects | — | Prefer action `redirect()` like checkout |

```typescript
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutInput } from "@/server/validators/order";
import { submitCheckoutAction } from "@/server/actions/order.actions";
// ... Alert, Button, Input, Label

const onSubmit = form.handleSubmit(async (values) => {
  setError(null);
  const result = await submitCheckoutAction(values);
  if (result?.error === "CART_EMPTY") {
    setError("Кошик порожній...");
  }
});
```

**Admin product form extras:** hidden `productId` on edit; image upload subcomponent calls `fetch("/api/upload/sign")` then passes `cloudinaryPublicId` into `saveProductImagesAction` — keep upload **outside** RHF or use `setValue` for image array.

**Price input:** Display/edit UAH in form; convert `Math.round(uah * 100)` in action/service (storefront uses kopiyky — `formatPriceKopiyky` in `src/lib/catalog/format.ts`).

---

## List page pattern (catalog)

**Analog:** `src/app/(storefront)/katalog/page.tsx` + `katalog/[slug]/page.tsx`

| Pattern | Source lines | Admin list apply |
|---------|--------------|------------------|
| `metadata` / `generateMetadata` | `katalog/page.tsx` 26-33 | Static `title` on admin lists; `robots: noindex` from layout |
| Parallel data fetch | `katalog/page.tsx` 39-47 | `Promise.all([listAdminProducts(), listCategories()])` |
| Shell width | `katalog/page.tsx` 51 | `mx-auto max-w-6xl px-4 py-8 sm:px-6` (matches `admin/layout.tsx` L19-23) |
| Page title + subtitle | 52-57 | «Товари», «Категорії», «Замовлення» |
| Grid / sidebar | 59-79 | Admin: optional filter sidebar OR toolbar row only |
| Empty state | 66-76 | Ukrainian + `Link` + `buttonVariants()` |
| `notFound()` | `katalog/[slug]/page.tsx` 56-58 | Unknown category/product/order id |

```typescript
export default async function CatalogPage({ searchParams }: PageProps) {
  const [categories, brands, result] = await Promise.all([
    listCategories(),
    getDistinctBrands(),
    listPublicProducts({ filters, page: parsed.storinka, pageSize: 24, sort: parsed.sort }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Каталог б/у техніки</h1>
      {/* ProductGrid + empty */}
    </div>
  );
}
```

**Admin product list differences:**
- Call `listAdminProducts` (all statuses: `DRAFT`, `AVAILABLE`, `SOLD`) — mirror `buildPublicProductWhere` but **no** `PUBLIC_STATUS` filter (`catalog.service.ts` L11, L29).
- Table or card list with status badge (reuse labels from `order-history-card.tsx` STATUS pattern).
- CTA «Додати товар» → `/admin/tovary/novyi` with `buttonVariants()`.
- Pagination: reuse `listProductsSchema` from `product.ts` (offset OK for admin — ARCHITECTURE.md).

**Admin order list:** `listAllOrders()` service — `prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true } })` like `listOrdersForUser` (`order.service.ts` L8-13) without `userId` filter.

---

## Permissions

| Layer | File | Pattern | Notes |
|-------|------|---------|-------|
| Layout gate | `admin/layout.tsx` L14 | `await requireAdmin()` | Fails closed for all `/admin/*` children |
| Action gate | `permissions.ts` L19-28 | `requireAdmin()` in **every** mutation | Duplicate check intentional (PITFALLS #2) |
| Route handler | `api/upload/sign/route.ts` | `requireAdmin()` before signing | Cookie presence ≠ role |
| Proxy (coarse) | `src/proxy.ts` L4-14 | `getSessionCookie` → `/uviity` | **No role check** — do not rely on for RBAC |
| Buyer vs admin | `permissions.ts` L6-17 | `requireBuyer` uses `callbackUrl` | Admin redirects plain `/uviity` |

```typescript
// src/lib/permissions.ts L19-28
export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    redirect("/uviity");
  }

  return session;
}
```

```typescript
// src/app/(admin)/admin/layout.tsx L4-7, L14
export const metadata: Metadata = {
  title: "Адмін-панель",
  robots: { index: false, follow: false },
};
// ...
await requireAdmin();
```

**Role source:** `prisma/seed.ts` L49-51 sets `role: "admin"`; `src/lib/auth.ts` L13-15 Better Auth `admin({ defaultRole: "buyer" })`.

**E2E proof:** `e2e/admin-rbac.spec.ts` — buyer → `/admin` → `/uviity`; admin sees «Адмін-панель».

---

## revalidatePath conventions

| Trigger | Paths to revalidate | Notes |
|---------|---------------------|-------|
| Cart mutate (existing) | `/koszyk`, `/` layout | `cart.actions.ts` L12-14 |
| Checkout (existing) | `/koszyk`, `/kabinet`, `/` layout | `order.actions.ts` L16-18 |
| Category CRUD | `/admin/kategorii`, `/katalog`, `/katalog/[slug]` | New category affects nav (`store-header.tsx` lists categories) |
| Product create/update/delete | `/admin/tovary`, `/tovar/[slug]`, `/katalog`, `/` layout | PDP + listing; optional per-slug loop from cart lines pattern in 03-04-PLAN |
| Product status → AVAILABLE | above + sitemap path | `listPublicProductSlugsForSitemap` consumers |
| Order status change | `/admin/zamovlennia`, `/admin/zamovlennia/[orderNumber]`, `/kabinet` | Buyer history if status visible |
| Publish product (DRAFT→AVAILABLE) | all product paths | Same as product update |

**Helper pattern** (extend `revalidateCartPaths` style from `cart.actions.ts` L12-15):

```typescript
function revalidateStorefrontProduct(slug: string, categorySlug: string) {
  revalidatePath(`/tovar/${slug}`);
  revalidatePath(`/katalog/${categorySlug}`);
  revalidatePath("/katalog");
  revalidatePath("/");
}
```

**Future:** `revalidateTag('products')` per `02-RESEARCH.md` / ARCHITECTURE Pattern 5 — not used in `src/` yet; optional Phase 4 enhancement when catalog reads add `unstable_cache` tags.

**Do not** revalidate `/admin` layout for every mutation unless admin nav shows live counts.

---

## Test patterns

| Type | Analog | Apply |
|------|--------|-------|
| Unit (pure) | `catalog.service.test.ts` | Test `buildAdminProductWhere`, slug uniqueness helpers, status transition guards without DB |
| Unit (order) | same + `order.service` transaction | Test cancel releases `SOLD→AVAILABLE` logic in isolation if extracted pure function |
| E2E RBAC | `admin-rbac.spec.ts` | Extend after CRUD: buyer cannot POST admin actions (if exposed) |
| E2E CRUD | `checkout.spec.ts` + `auth.spec.ts` | Admin login via `ADMIN_EMAIL`/`ADMIN_PASSWORD` env; create category → product → verify on `/katalog` |
| E2E catalog | `product-pdp.spec.ts`, `helpers/catalog.ts` | After admin publishes product, PDP shows title/price |
| SEO guard | `catalog-seo.spec.ts` L21-27 | Sitemap still excludes `/admin` |

```typescript
// e2e/admin-rbac.spec.ts — pattern for admin session
await page.goto("/uviity");
await page.getByLabel("Email").fill(process.env.ADMIN_EMAIL ?? "...");
await page.getByRole("button", { name: "Увійти" }).click();
await page.goto("/admin");
await expect(page.getByText("Адмін-панель")).toBeVisible();
```

```typescript
// catalog.service.test.ts — unit test shape
import { describe, expect, it } from "vitest";
import { buildPublicProductWhere } from "./catalog.service";

describe("buildPublicProductWhere", () => {
  it("always filters AVAILABLE status", () => {
    const where = buildPublicProductWhere({});
    expect(where.status).toBe("AVAILABLE");
  });
});
```

**Admin E2E flow to add:** login as admin → create DRAFT product → upload image (mock sign route in CI or use seed Cloudinary id) → set AVAILABLE → open `/tovar/[slug]` as guest → visible in catalog.

---

## Pattern Assignments

### `src/server/services/admin-catalog.service.ts` (service, CRUD)

**Analog:** `src/server/services/catalog.service.ts`

**Imports + list** (L1-9, L107-124):

```typescript
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { catalogFiltersSchema, listProductsSchema } from "../validators/product";

const [total, items] = await Promise.all([
  prisma.product.count({ where }),
  prisma.product.findMany({ where, include: cardInclude, orderBy, skip, take }),
]);
```

**Category CRUD:** `prisma.category.create/update/delete`; slug via `slugify(name, { lower: true, strict: true, locale: "uk" })` — same as `prisma/seed.ts` L20-24. On delete: guard if `products.length > 0` → throw `CATEGORY_NOT_EMPTY`.

**Admin product list:** `where` without `status: AVAILABLE`; optional filters by status, categoryId, q.

---

### `src/server/services/admin-product.service.ts` (service, CRUD + transaction)

**Analog:** `catalog.service.ts` (reads/writes) + `order.service.ts` (transaction L99-143)

**Create product:** default `status: DRAFT`; generate unique slug from title (seed pattern).

**Images:** `ProductImage` rows — `cloudinaryPublicId`, `sortOrder`, `alt` (`schema.prisma` L139-149). On delete product: `onDelete: Cascade` on images; call Cloudinary destroy in `media.service` (PITFALLS #5).

**Never** set `SOLD` from admin form directly if product on active order — use order cancel flow.

---

### `src/server/services/admin-order.service.ts` (service, CRUD + transaction)

**Analog:** `src/server/services/order.service.ts`

**List all** (extend L8-27):

```typescript
export async function listOrdersForUser(userId: string): Promise<OrderSummaryDto[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  // map to DTO...
}
```

**Status update + cancel** (PITFALLS #1, `03-RESEARCH.md`):

```typescript
await prisma.$transaction(async (tx) => {
  if (newStatus === "CANCELLED") {
    for (const item of order.items) {
      if (item.productId) {
        await tx.product.updateMany({
          where: { id: item.productId, status: "SOLD" },
          data: { status: "AVAILABLE" },
        });
      }
    }
  }
  await tx.order.update({ where: { id }, data: { status: newStatus } });
});
```

Reuse `STATUS_LABELS` from `order-history-card.tsx` L5-12 for admin UI.

---

### `src/server/validators/category.ts` + `admin-product.ts` (utility, transform)

**Analog:** `src/server/validators/product.ts` + `order.ts`

```typescript
// product.ts
export const catalogFiltersSchema = z.object({
  q: z.string().max(100).optional(),
  // ...
});
export const listProductsSchema = z.object({
  page: z.number().int().min(1).max(1000).default(1),
  pageSize: z.number().int().min(1).max(24).default(24),
});
```

**Category:** `name` min 2, `slug` optional (auto), `description` optional, `sortOrder` int.

**Product:** reuse `productConditionSchema`, `productStatusSchema` from `product.ts` L3-4; `price` int kopiyky; `categoryId` cuid; `title`, `brand`, `description`; images array `z.array(z.object({ cloudinaryPublicId, alt, sortOrder }))`.

**Order status:** `z.enum` matching `OrderStatus` in schema.

---

### `src/app/api/upload/sign/route.ts` (route, request-response)

**Analog:** Thin handler like `api/auth/[...all]/route.ts`; auth like `requireAdmin`.

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
export const { GET, POST } = toNextJsHandler(auth);
```

**Apply:** `export async function POST(request: Request)` → `await requireAdmin()` → return signed Cloudinary params from `lib/cloudinary.ts` (ARCHITECTURE Pattern 4). Never expose `CLOUDINARY_API_SECRET` to client except signature params.

---

### `src/components/admin/*` forms and lists

**Form analog:** `checkout-form.tsx` (full table in **Form pattern** section).

**List analog:** `order-history-list.tsx` L8-26:

```typescript
export function OrderHistoryList({ orders }: OrderHistoryListProps) {
  if (orders.length === 0) {
    return <p className="text-muted-foreground">У вас ще немає замовлень...</p>;
  }
  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <li key={order.id}>
          <OrderHistoryCard order={order} />
        </li>
      ))}
    </ul>
  );
}
```

Admin orders: table with `orderNumber`, buyer email (join user), status select, link to detail.

---

## Shared Patterns

### Layered boundary (unchanged from Phase 3)

**Source:** `.planning/research/ARCHITECTURE.md` lines 124-130  
Admin pages → `requireAdmin` → action → service → prisma. No prisma in `app/` or `components/`.

### Slug generation

**Source:** `prisma/seed.ts` L20-24

```typescript
import slugify from "slugify";
const slug = slugify(name, { lower: true, strict: true, locale: "uk" });
```

Check uniqueness before create; append `-2`, `-3` on collision.

### Price (kopiyky)

**Source:** `src/lib/catalog/format.ts`, `Product.price` Int in schema  
Admin forms may show UAH; persist kopiyky.

### Ukrainian copy + admin noindex

**Source:** `admin/layout.tsx` metadata; all storefront components  
Admin UI Ukrainian; status labels shared with buyer order card where applicable.

### Cloudinary delivery (storefront unchanged)

**Source:** `src/components/media/optimized-image.tsx`  
Admin stores `cloudinaryPublicId` only; storefront keeps `OptimizedImage` / `CldImage`.

### Path aliases

```typescript
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/lib/cloudinary.ts` | utility | request-response | No server signing yet — ARCHITECTURE + PITFALLS #5 |
| `src/server/services/media.service.ts` | service | file-I/O | No destroy/upload helpers in repo |
| `src/app/api/upload/sign/route.ts` | route | request-response | Only `api/auth` exists |
| `src/components/admin/product-image-upload.tsx` | component | file-I/O | No `CldUploadWidget`; delivery-only `OptimizedImage` |
| `revalidateTag` | cache | — | Documented in research, zero usage in `src/` |

**Planner:** Implement upload sign route + `media.service` per ARCHITECTURE Pattern 4 before product image UI.

---

## Metadata

**Analog search scope:** `src/server/`, `src/app/(admin)/`, `src/app/(storefront)/katalog/`, `src/components/checkout/`, `src/components/account/`, `src/lib/permissions.ts`, `prisma/`, `e2e/`, `.planning/research/ARCHITECTURE.md`, `.planning/research/PITFALLS.md`, `.planning/phases/03-cart-checkout/03-PATTERNS.md`  
**Files scanned:** 78 TS/TSX + Prisma  
**Pattern extraction date:** 2026-05-17

---

## PATTERN MAPPING COMPLETE

**Phase:** 4 - Admin Operations  
**Files classified:** 32  
**Analogs found:** 24 / 32

### Coverage
- Files with exact analog: 16
- Files with role-match analog: 8
- Files with no analog: 8

### Key Patterns Identified
- **Services:** Split `admin-catalog`, `admin-product`, `admin-order` from public `catalog`/`order` services; keep Zod + DTO mapping.
- **Actions:** Same shell as `cart.actions.ts` / `order.actions.ts` with `requireAdmin()` and shared `revalidatePath` helpers.
- **Forms:** Copy `checkout-form.tsx` (RHF + Zod + server action + Alert).
- **Lists:** Copy `katalog/page.tsx` fetch/empty/layout; order UI from `order-history-*`.
- **Permissions:** Layout + every action + upload route; proxy is cookie-only.
- **Cancel order:** Transaction `SOLD → AVAILABLE` (PITFALLS #1).
- **Tests:** Vitest for where-builders; Playwright extend `admin-rbac.spec.ts`.

### File Created
`.planning/phases/04-admin-operations/04-PATTERNS.md`

### Ready for Planning
Pattern mapping complete. Planner can reference analog patterns in PLAN.md files.
