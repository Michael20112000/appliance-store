# Phase 4: Admin Operations - Research

**Researched:** 2026-05-17
**Domain:** Admin CRUD (categories, products, multi-image Cloudinary), order fulfillment, RBAC
**Confidence:** HIGH (codebase + Prisma schema + next-cloudinary docs verified)

## Summary

Phase 4 delivers the **store operator control plane**: Ukrainian admin routes under `/admin/*`, CRUD for categories and products (including multi-image Cloudinary uploads), and order list/detail with status changes. **AUTH-04 is already implemented** — `requireAdmin()` in `src/app/(admin)/admin/layout.tsx` and `src/lib/permissions.ts` redirect non-admins to `/uviity`. Every admin **mutation** must call `requireAdmin()` again (defense in depth per PITFALLS #2).

**Service split (do not bloat `catalog.service.ts`):** keep `catalog.service.ts` **public-read only** (`PUBLIC_STATUS = AVAILABLE`). Add three admin services aligned with `04-PATTERNS.md`:

| Service | Owns |
|---------|------|
| `admin-catalog.service.ts` | Category CRUD, slug helpers, delete guards |
| `admin-product.service.ts` | Product CRUD, images, status, slug, delete guards |
| `admin-order.service.ts` | List all orders, status transitions, **SOLD → AVAILABLE on CANCELLED** |

**Cloudinary:** Use existing `next-cloudinary` `CldUploadWidget` with `signatureEndpoint` pointing to a **Route Handler** (`POST`), not a Server Action — the widget performs `fetch` to sign params. Signing uses `cloudinary.utils.api_sign_request` from the official **`cloudinary` npm SDK** (not bundled in `next-cloudinary`). This is the **one likely new dependency**; all other stack pieces are already installed.

**ADM-05 (chat admin)** is **out of scope** for Phase 4 — defer to Phase 5 per ROADMAP; show disabled nav only.

**Primary recommendation:** Implement thin `admin/*.actions.ts` + the three admin services + `app/api/upload/sign/route.ts` + Ukrainian routes (`/admin/kategorii`, `/admin/tovary`, `/admin/zamovlennia`); on order cancel, transactionally revert linked products from `SOLD` to `AVAILABLE`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Admin RBAC (AUTH-04) | Frontend Server (layout + actions) | Route Handler (upload sign) | Session + `role === "admin"`; never trust middleware cookie alone |
| Category CRUD (ADM-01) | API / Backend (`admin-catalog.service`) | Frontend Server (forms/actions) | Business rules: slug uniqueness, delete guards |
| Product CRUD (ADM-02) | API / Backend (`admin-product.service`) | Frontend Server | Status, pricing kopiyky, category link |
| Cloudinary upload (ADM-03) | Route Handler (sign) + Browser (widget) | Server Actions (persist `ProductImage`) | Widget needs HTTP signature endpoint [CITED: next-cloudinary signed uploads] |
| Image metadata in DB | API / Backend (`admin-product.service`) | — | `ProductImage` rows; no blobs in Postgres |
| Order list/status (ADM-04) | API / Backend (`admin-order.service`) | Frontend Server | Inventory revert on cancel in `$transaction` |
| Storefront catalog reads | Frontend Server (RSC) | — | Unchanged `catalog.service` public filters |
| Cache freshness after edits | Frontend Server (`revalidatePath`) | — | Admin mutations invalidate `/katalog`, `/tovar/[slug]`, layout |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Next.js** | **16.2.6** (installed) | App Router, Route Handlers, Server Actions | Phase 1–3 pattern |
| **Prisma** | **7.8.0** (installed) | Category, Product, ProductImage, Order | Schema already has enums and relations |
| **Better Auth** | **1.6.11** (installed) | Session; `user.role` admin/buyer | `requireAdmin()` verified in codebase |
| **next-cloudinary** | **6.17.5** (installed) | `CldUploadWidget`, `CldImage` | ADM-03; signed upload via `signatureEndpoint` [CITED: /cloudinary-community/next-cloudinary] |
| **cloudinary** | **2.10.0** (registry) | `api_sign_request` in sign route | Official SDK for signatures; **not yet in package.json** — add for Phase 4 |
| **Zod** | **4.4.3** (installed) | Admin validators | Same as cart/checkout |
| **react-hook-form** | **7.76.0** (installed) | Admin forms | `checkout-form.tsx` analog |
| **slugify** | **1.6.6** (installed) | UA slugs | Same as `prisma/seed.ts` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Vitest** | **4.1.6** | Unit tests | Slug helpers, transition guards, delete guards |
| **Playwright** | **1.60.0** | E2E | `e2e/admin-rbac.spec.ts` exists; extend CRUD smoke |
| **shadcn/ui** | CLI latest | Table, Dialog, Select, Sidebar | Per `04-UI-SPEC.md` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| **`cloudinary` SDK sign route** | Hand-rolled HMAC | Error-prone; violates Don't Hand-Roll |
| **Route Handler sign** | Server Action for sign | `CldUploadWidget` cannot call Server Actions for signature |
| **Unsigned upload preset** | Signed uploads | Quota abuse (PITFALLS #5); reject for production |
| **Monolithic `admin.service.ts`** | Split catalog/product/order | Harder to test; blurs public vs admin queries |
| **English admin URLs** (`/admin/products`) | Ukrainian (`/admin/tovary`) | Breaks project UA URL convention; PATTERNS uses Ukrainian |

**Installation (Phase 4):**

```bash
npm install cloudinary@2.10.0
```

No other new packages required if `cloudinary` is added. `CldUploadWidget` ships with `next-cloudinary` (already installed).

**Version verification (2026-05-17):** `npm view next-cloudinary version` → 6.17.5; `npm view cloudinary version` → 2.10.0; `npm view slugify version` → 1.6.9 (package.json pins 1.6.6).

## Package Legitimacy Audit

> slopcheck unavailable at research time — packages below tagged conservatively.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| (none new if sign hand-rolled) | — | — | — | — | not run | Avoid — use SDK |
| **cloudinary** | npm | ~14 yrs (created 2012) | very high | github.com/cloudinary/cloudinary_npm | not run | **Recommended add** — official signing SDK |
| next-cloudinary | npm | installed 6.17.5 | high | github.com/cloudinary-community/next-cloudinary | not run | Already approved |
| slugify | npm | installed 1.6.6 | high | github.com/simov/slugify | not run | Already approved |

**Packages removed due to slopcheck [SLOP] verdict:** none  
**Packages flagged [SUS]:** none  

*Planner: if `cloudinary` install is skipped, gate upload tasks behind `checkpoint:human-verify` and document manual signature implementation risk.*

## Architecture Patterns

### System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Browser (admin client components)                                             │
│  CategoryForm / ProductForm / ProductImageUploader (CldUploadWidget)          │
│    └─ fetch POST /api/upload/sign ─────────────────────────────────────┐     │
│  OrderStatusSelect → updateOrderStatusAction ───────────────────────────┤     │
└─────────────────────────────────────────────────────────────────────────┼─────┘
                                                                            │
                    ┌───────────────────────────────────────────────────────▼────┐
                    │ Next.js Server Actions (admin/*.actions.ts)                   │
                    │  requireAdmin() · Zod · revalidatePath(/katalog, /tovar, …)   │
                    └───────────────────────────┬────────────────────────────────────┘
                                                │
         ┌──────────────────┬───────────────────┼───────────────────┬──────────────┐
         ▼                  ▼                   ▼                   ▼              ▼
 ┌───────────────┐  ┌────────────────┐  ┌────────────────┐  ┌─────────────┐  ┌──────────┐
 │ admin-catalog │  │ admin-product  │  │ admin-order    │  │ catalog     │  │ POST     │
 │ .service      │  │ .service       │  │ .service       │  │ .service    │  │ /api/    │
 │ categories    │  │ products+images│  │ status+revert  │  │ (public)    │  │ upload/  │
 └───────┬───────┘  └────────┬───────┘  └────────┬───────┘  └─────────────┘  │ sign     │
         │                   │                   │                            └────┬─────┘
         └───────────────────┴───────────────────┴─────────────────────────────────┘
                                                │
                                                ▼
                                       ┌─────────────────┐
                                       │ PostgreSQL       │
                                       │ Category Product │
                                       │ ProductImage     │
                                       │ Order OrderItem  │
                                       └─────────────────┘
                                                │
                         CldUploadWidget success ▼
                                       ┌─────────────────┐
                                       │ Cloudinary CDN   │
                                       │ (public_id only  │
                                       │  stored in DB)   │
                                       └─────────────────┘
```

### Recommended Project Structure

```
src/
├── app/
│   ├── (admin)/admin/
│   │   ├── layout.tsx              # requireAdmin + sidebar shell
│   │   ├── page.tsx                # dashboard stats
│   │   ├── kategorii/              # ADM-01
│   │   ├── tovary/                 # ADM-02, ADM-03
│   │   └── zamovlennia/            # ADM-04
│   └── api/upload/sign/route.ts    # signed upload (admin only)
├── server/
│   ├── services/
│   │   ├── catalog.service.ts      # PUBLIC reads only — do not extend for admin
│   │   ├── admin-catalog.service.ts
│   │   ├── admin-product.service.ts
│   │   ├── admin-order.service.ts
│   │   └── media.service.ts        # optional: Cloudinary destroy on product delete
│   ├── actions/admin/
│   │   ├── category.actions.ts
│   │   ├── product.actions.ts
│   │   └── order.actions.ts
│   └── validators/
│       ├── category.ts
│       ├── admin-product.ts
│       └── admin-order.ts
├── components/admin/               # forms, tables, uploader
└── lib/
    ├── permissions.ts              # requireAdmin (exists)
    └── cloudinary.ts               # server-only cloudinary.config()
```

### Pattern 1: Service split (admin vs public catalog)

**What:** `catalog.service.ts` keeps `PUBLIC_STATUS = AVAILABLE` for storefront. Admin writes live in dedicated services.

**When to use:** Any admin list/create/update/delete.

**Why:** Prevents accidental exposure of `DRAFT`/`SOLD` on storefront; keeps Phase 2 catalog tests stable.

```typescript
// admin-product.service.ts — list includes all statuses
const where: Prisma.ProductWhereInput = {
  ...(filters.status && { status: filters.status }),
  ...(filters.categoryId && { categoryId: filters.categoryId }),
  // NO status: AVAILABLE filter
};
```

### Pattern 2: Cloudinary signed upload (Route Handler + widget)

**What:** Admin-only `POST /api/upload/sign` returns `{ signature }` for `paramsToSign`. Client `CldUploadWidget` uses `signatureEndpoint="/api/upload/sign"`. After `onSuccess`, Server Action saves `ProductImage` rows.

**When to use:** ADM-03 multi-image product form.

**Env:** `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (server-only secret) — already in `.env.example`; make required in sign route via `getEnv()` or explicit check.

```typescript
// app/api/upload/sign/route.ts
// Source: https://github.com/cloudinary-community/next-cloudinary/blob/main/docs/pages/clduploadwidget/signed-uploads.mdx
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/permissions";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  await requireAdmin();
  const { paramsToSign } = await request.json();
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!,
  );
  return Response.json({ signature });
}
```

```tsx
// components/admin/product-image-uploader.tsx (client)
// Source: [CITED: /cloudinary-community/next-cloudinary — CldUploadWidget signed uploads]
import { CldUploadWidget } from "next-cloudinary";

<CldUploadWidget
  signatureEndpoint="/api/upload/sign"
  options={{ multiple: true, maxFiles: 8, sources: ["local"] }}
  onSuccess={(result) => {
    const info = result.info;
    if (typeof info === "object" && info && "public_id" in info) {
      onUploaded({
        cloudinaryPublicId: info.public_id,
        width: info.width,
        height: info.height,
      });
    }
  }}
>
  {({ open }) => <Button type="button" onClick={() => open()}>Додати фото</Button>}
</CldUploadWidget>
```

**Two-phase save (recommended):** Create product as `DRAFT` first → upload images → attach `ProductImage` rows → set `AVAILABLE` when ready. Reduces orphan uploads (PITFALLS #5).

### Pattern 3: Order status transitions + inventory revert

**What:** `updateOrderStatus` runs in `prisma.$transaction`. When new status is `CANCELLED`, for each `OrderItem` with `productId`, `updateMany` product `SOLD → AVAILABLE` (only where still `SOLD`).

**When to use:** ADM-04; resolves Phase 3 assumption A4 (deferred revert).

**Allowed transitions (v1 — linear fulfillment):**

| From | Allowed next |
|------|----------------|
| `PENDING` | `CONFIRMED`, `CANCELLED` |
| `CONFIRMED` | `READY_FOR_PICKUP`, `OUT_FOR_DELIVERY`, `CANCELLED` |
| `READY_FOR_PICKUP` | `COMPLETED`, `CANCELLED` |
| `OUT_FOR_DELIVERY` | `COMPLETED`, `CANCELLED` |
| `COMPLETED` | — (terminal) |
| `CANCELLED` | — (terminal) |

Reject illegal jumps in service with `INVALID_STATUS_TRANSITION` (do not rely on UI alone).

```typescript
// admin-order.service.ts
await prisma.$transaction(async (tx) => {
  const order = await tx.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: true },
  });
  assertTransitionAllowed(order.status, newStatus);

  if (newStatus === "CANCELLED") {
    for (const item of order.items) {
      if (!item.productId) continue;
      await tx.product.updateMany({
        where: { id: item.productId, status: "SOLD" },
        data: { status: "AVAILABLE" },
      });
    }
  }

  await tx.order.update({ where: { id: orderId }, data: { status: newStatus } });
});
```

**Note:** Checkout already sets `AVAILABLE → SOLD` in `order.service.ts` `createOrderFromCart`. Admin must **not** set product `SOLD` manually on the product form — only via orders.

### Pattern 4: Slug rules (categories & products)

**What:** Reuse seed pattern: `slugify(text, { lower: true, strict: true, locale: "uk" })`. Centralize in `lib/slug.ts` or service helper `uniqueSlug(base, exists)`.

| Event | Rule |
|-------|------|
| **Category create** | Auto slug from `name` if slug empty |
| **Category update** | Keep existing slug by default; allow manual slug edit with uniqueness check |
| **Product create** | Auto slug from `title`; on collision append `-2`, `-3`, … (not status suffix — seed uses status suffix only for demo data) |
| **Product update** | **Do not** auto-change slug when title changes (PDP URLs stable); optional explicit slug field for admin |
| **Uniqueness** | `prisma.*.findUnique({ where: { slug } })` before create; on update exclude self `id` |

```typescript
// prisma/seed.ts pattern [VERIFIED: codebase]
import slugify from "slugify";

export function slugFromTitle(title: string) {
  return slugify(title, { lower: true, strict: true, locale: "uk" });
}
```

### Pattern 5: Delete guards

| Entity | Guard | Error code | UX |
|--------|-------|------------|-----|
| **Category** | `products.count({ categoryId }) > 0` | `CATEGORY_HAS_PRODUCTS` | «Спочатку перемістіть або видаліть товари» |
| **Product** | `cartItem` exists for `productId` | `PRODUCT_IN_CART` | «Товар у кошику покупця — приберіть з кошиків» |
| **Product** | `orderItem` linked to order with `status NOT IN (CANCELLED, COMPLETED)` | `PRODUCT_IN_ACTIVE_ORDER` | «Товар у активному замовленні» |
| **Product** (soft alternative) | — | — | Prefer `status: DRAFT` hide instead of hard delete when history exists |

**Cart check query:**

```typescript
const inCart = await prisma.cartItem.count({ where: { productId } });
if (inCart > 0) throw new Error("PRODUCT_IN_CART");
```

### Pattern 6: Ukrainian admin routes

**What:** Mirror storefront UA paths; prefix `/admin`.

| Route | Page |
|-------|------|
| `/admin` | Dashboard |
| `/admin/kategorii` | Category list |
| `/admin/kategorii/novyi` | New category |
| `/admin/kategorii/[id]` | Edit category |
| `/admin/tovary` | Product list (all statuses) |
| `/admin/tovary/novyi` | New product |
| `/admin/tovary/[id]` | Edit product + images |
| `/admin/zamovlennia` | Order list |
| `/admin/zamovlennia/[orderNumber]` | Order detail + status |

**Note:** `04-UI-SPEC.md` draft uses English paths (`/admin/products`) — **override with Ukrainian paths above** for implementation (matches `04-PATTERNS.md` and storefront `/katalog`, `/tovar`).

### Anti-Patterns to Avoid

- **Extending `catalog.service` for admin writes:** Blurs PUBLIC_STATUS invariant.
- **Server Action as signature endpoint:** `CldUploadWidget` needs Route Handler.
- **Unsigned upload preset in client:** PITFALLS #5 — production must be signed.
- **Middleware-only admin security:** Layout + every action/handler must call `requireAdmin()`.
- **Deleting category with products:** Orphan risk / FK errors — guard in service.
- **Manual `SOLD` on product form:** Bypasses order audit trail.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cloudinary upload signatures | Custom HMAC | `cloudinary.utils.api_sign_request` | Parameter ordering/timestamp edge cases |
| Admin image picker | Raw `<input type="file">` + manual API | `CldUploadWidget` + sign route | Progress, validation, CDN integration |
| Slug transliteration | Custom Cyrillic map | `slugify` locale `uk` | Already in seeds |
| Order status labels | Hardcoded strings in 5 places | Shared `ORDER_STATUS_LABELS` map | Match `order-history-card.tsx` |
| Data tables | Custom grid | shadcn `Table` + `AdminDataTable` wrapper | Accessibility, density per UI-SPEC |

**Key insight:** Phase 4 is mostly **wiring existing schema and stack** — the risk is RBAC gaps and inventory/status bugs, not missing libraries.

## Common Pitfalls

### Pitfall 1: Admin RBAC only in layout

**What goes wrong:** Buyer invokes Server Action or `/api/upload/sign` directly.  
**How to avoid:** `requireAdmin()` first line in every admin action and sign route (already pattern in `cart.actions.ts` with `requireBuyer`).  
**Warning signs:** E2E passes layout test but API accepts buyer cookie.

### Pitfall 2: Orphan Cloudinary assets

**What goes wrong:** Upload succeeds, product save fails — billed storage clutter.  
**How to avoid:** DRAFT-first product; optional `media.service` destroy on delete; folder prefix `appliance-store/products/{productId}`.  
**Warning signs:** Many assets in Cloudinary console not in `ProductImage` table.

### Pitfall 3: Slug change breaks SEO / shared links

**What goes wrong:** Auto-updating slug on title edit 404s `/tovar/[slug]`.  
**How to avoid:** Immutable slug after publish unless admin explicitly edits slug field.  
**Warning signs:** Sitemap URLs 404 after edit.

### Pitfall 4: Cancel order without inventory revert

**What goes wrong:** Product stays `SOLD`, catalog hides unit though order cancelled.  
**How to avoid:** Transaction block in Pattern 3; UI confirm copy per UI-SPEC.  
**Warning signs:** Cancelled orders still show «Продано» on PDP.

### Pitfall 5: Delete product in active cart

**What goes wrong:** Cart 500 or ghost line items.  
**How to avoid:** `PRODUCT_IN_CART` guard; cart.service already prunes non-AVAILABLE on read.  
**Warning signs:** Checkout errors after admin delete.

## Code Examples

### requireAdmin (existing)

```19:28:src/lib/permissions.ts
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

### Checkout SOLD transition (mirror for cancel revert)

```115:123:src/server/services/order.service.ts
    for (const line of cart.items) {
      const updated = await tx.product.updateMany({
        where: { id: line.productId, status: "AVAILABLE" },
        data: { status: "SOLD" },
      });

      if (updated.count === 0) {
        throw new Error("PRODUCT_UNAVAILABLE");
      }
```

### Admin action skeleton

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import { updateCategory } from "@/server/services/admin-catalog.service";
import { upsertCategorySchema } from "@/server/validators/category";

export async function updateCategoryAction(input: unknown) {
  await requireAdmin();
  const data = upsertCategorySchema.parse(input);
  const category = await updateCategory(data);
  revalidatePath("/admin/kategorii");
  revalidatePath("/katalog");
  revalidatePath(`/katalog/${category.slug}`);
  return { ok: true as const };
}
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `isPublished` boolean | `ProductStatus` DRAFT/AVAILABLE/SOLD | Admin form uses enum |
| Phase 1 delivery-only Cloudinary | Signed admin upload in Phase 4 | Enable `CLOUDINARY_API_SECRET` server-side |
| Manual DB fix on cancel (A4) | `admin-order.service` revert | ADM-04 closes inventory loop |
| English admin URLs in UI-SPEC draft | Ukrainian `/admin/tovary` etc. | Consistent with storefront |

**Deprecated/outdated:**

- Unsigned `CLOUDINARY_UPLOAD_PRESET` in `NEXT_PUBLIC_*` — reject (PITFALLS #5).
- Single `admin.service.ts` — use split services per domain.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Add `cloudinary@2.10.0` as only new package | Standard Stack | Must hand-roll sign or skip uploads |
| A2 | Ukrainian admin paths (`/admin/tovary`) override UI-SPEC English | Routes | Planner follows wrong UI-SPEC paths |
| A3 | Linear order status transitions (table above) | Order pattern | Store wants arbitrary status jumps |
| A4 | Hard delete blocked when product in cart | Delete guards | Prefer force-delete + cart cleanup |
| A5 | Slug stable on product title edit | Slug rules | SEO redirects needed instead |
| A6 | Cloudinary destroy on product delete is optional MVP | Pitfall 2 | Orphan assets acceptable short-term |

## Open Questions

1. **Upload preset name in Cloudinary dashboard**
   - What we know: Signed uploads can use upload preset configured in Cloudinary console.
   - What's unclear: Exact preset name / folder policy for this project account.
   - Recommendation: Document preset name in `.env.example` as `CLOUDINARY_UPLOAD_PRESET` (server-only or public preset name only); create preset restricted to admin folder.

2. **Hard delete vs soft hide for sold products**
   - What we know: Orders keep `OrderItem` snapshots; `productId` can be set null on delete.
   - Recommendation: Default to `DRAFT` hide; hard delete only when guards pass.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Next/Prisma | ✓ | v24.14.0 | — |
| PostgreSQL/Neon | Prisma models | ✓ (Phase 1–3) | — | — |
| Better Auth + admin user | AUTH-04, E2E | ✓ | 1.6.11 | Seed `ADMIN_EMAIL` / `ADMIN_PASSWORD` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | CldImage + widget | ✓ (env schema) | — | Block ADM-03 |
| `CLOUDINARY_API_KEY` / `SECRET` | Sign route | optional in `env.ts` | — | **Required for uploads** — fail fast in sign route |
| Cloudinary account + upload preset | ADM-03 | ? (human) | — | Use seed public IDs in dev only |
| slopcheck | package audit | ✗ | — | Manual npm verify |

**Missing dependencies with no fallback:**

- Cloudinary credentials without preset — admin cannot upload new images (can still CRUD with seed `public_id`s).

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 + Playwright 1.60.0 |
| Config file | `vitest.config.ts`, `playwright.config.ts` |
| Quick run | `npm test` |
| Full E2E | `npm run test:e2e` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| AUTH-04 | Non-admin cannot access `/admin` | e2e | `npx playwright test e2e/admin-rbac.spec.ts` | ✅ |
| ADM-01 | Category CRUD | e2e + unit | `e2e/admin-crud.spec.ts` (Wave 0) | ❌ Wave 0 |
| ADM-02 | Product CRUD + status | e2e + unit | same + `admin-product.service.test.ts` | ❌ Wave 0 |
| ADM-03 | Multi-image upload | e2e (mock sign) or manual | sign route unit test | ❌ Wave 0 |
| ADM-04 | Order status + cancel revert | unit + e2e | `admin-order.service.test.ts` | ❌ Wave 0 |
| — | Buyer cannot POST `/api/upload/sign` | e2e | extend `admin-rbac.spec.ts` | ❌ Wave 0 |
| — | `CATEGORY_HAS_PRODUCTS` delete guard | unit | vitest | ❌ Wave 0 |
| — | `PRODUCT_IN_CART` delete guard | unit | vitest | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test -- src/server/services/admin-order.service.test.ts`
- **Per wave merge:** `npm test && npx playwright test e2e/admin-rbac.spec.ts e2e/admin-crud.spec.ts`
- **Phase gate:** E2E green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/server/services/admin-catalog.service.test.ts` — slug + delete guard
- [ ] `src/server/services/admin-order.service.test.ts` — cancel `SOLD→AVAILABLE`, illegal transition
- [ ] `e2e/admin-crud.spec.ts` — admin login → create category → product → visible on `/katalog`
- [ ] `e2e/admin-rbac.spec.ts` — extend: buyer `POST /api/upload/sign` → 401/redirect
- [ ] `cloudinary` package install + `lib/cloudinary.ts` if not in Wave 1 plan

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes | Better Auth session |
| V3 Session Management | yes | HTTP-only cookies; server `getSession` |
| V4 Access Control | yes | `requireAdmin()` on layout, actions, sign route |
| V5 Input Validation | yes | Zod per entity; allowlist status transitions |
| V6 Cryptography | yes (signing) | Cloudinary SDK signing; secret server-only |

### Known Threat Patterns

| Pattern | STRIDE | Mitigation |
|---------|--------|------------|
| Admin bypass via API | Elevation | `requireAdmin()` on every mutation + sign route |
| Unsigned upload abuse | Tampering / DoS | Signed uploads only; no secret in client |
| Mass assignment on product | Tampering | Zod allowlist; price in kopiyky server-side |
| Order status tampering | Tampering | Transition matrix in service |
| IDOR on orders (buyer) | Elevation | Buyer routes keep `userId` filter; admin uses separate service |

## Project Constraints (from .cursor/rules/)

- **Stack locked:** Next.js App Router, Prisma + PostgreSQL, Better Auth, Tailwind/shadcn, Cloudinary, Ukrainian-only UI.
- **Business:** Single-store used appliances; no online payment v1.
- **Architecture:** `server/services` + thin Server Actions; no Prisma in client components.
- **Roles:** `buyer` default; `admin` for `/admin/*`.
- **Cloudinary:** `next-cloudinary` for delivery; signed admin uploads; `CLOUDINARY_API_SECRET` never in `NEXT_PUBLIC_*`.

## Vertical MVP Slices (recommended plan order)

| Slice | Delivers | Requirements |
|-------|----------|--------------|
| **04-01** | `cloudinary` + sign route + env hardening | ADM-03 infra |
| **04-02** | `admin-catalog.service` + category pages/actions | ADM-01 |
| **04-03** | `admin-product.service` + product CRUD + uploader | ADM-02, ADM-03 |
| **04-04** | `admin-order.service` + order pages | ADM-04 |
| **04-05** | E2E + unit tests, revalidatePath sweep | AUTH-04 proof |

**Parallelization:** 04-02 can start before upload route if products use seed images first; 04-03 blocked on 04-01 for real uploads.

**Out of scope:** ADM-05 chat admin → Phase 5 (disabled nav only).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-04 | Admin role; `/admin` only for admin | Existing `requireAdmin()` + layout; repeat in all actions/sign route |
| ADM-01 | Category CRUD | `admin-catalog.service.ts` + `/admin/kategorii/*` + delete guard |
| ADM-02 | Product CRUD (fields + status) | `admin-product.service.ts` + `/admin/tovary/*`; keep catalog public reads separate |
| ADM-03 | Multi-photo Cloudinary | `CldUploadWidget` + `POST /api/upload/sign` + `ProductImage` rows |
| ADM-04 | Orders list + status change | `admin-order.service.ts` + cancel reverts `SOLD→AVAILABLE` |
| ADM-05 | Chat admin | **Deferred Phase 5** — not in Phase 4 plans |
</phase_requirements>

## Sources

### Primary (HIGH confidence)

- [next-cloudinary signed uploads](https://github.com/cloudinary-community/next-cloudinary/blob/main/docs/pages/clduploadwidget/signed-uploads.mdx) — App Router sign route, `signatureEndpoint` [Context7 `/cloudinary-community/next-cloudinary`]
- [Cloudinary authentication signatures](https://cloudinary.com/documentation/authentication_signatures) — why signed uploads
- `prisma/schema.prisma` — Category, Product, ProductImage, OrderStatus
- `src/server/services/catalog.service.ts` — PUBLIC_STATUS pattern
- `src/server/services/order.service.ts` — SOLD at checkout
- `src/lib/permissions.ts`, `src/app/(admin)/admin/layout.tsx` — AUTH-04
- `.planning/research/ARCHITECTURE.md` — admin + Cloudinary Pattern 4
- `.planning/research/PITFALLS.md` — #1 inventory, #2 admin RBAC, #5 Cloudinary
- `.planning/phases/04-admin-operations/04-PATTERNS.md` — file-level analog map

### Secondary (MEDIUM confidence)

- `.planning/phases/04-admin-operations/04-UI-SPEC.md` — admin UI density (route names superseded by Ukrainian paths)
- `.planning/phases/03-cart-checkout/03-RESEARCH.md` — OrderStatus enum, A4 cancel revert deferral

## Metadata

**Confidence breakdown:**

- Standard stack: **HIGH** — versions from `package.json` + npm registry; `cloudinary` add is documented official path
- Architecture: **HIGH** — matches implemented Phase 1–3 patterns and PATTERNS map
- Pitfalls: **HIGH** — aligned with PITFALLS.md and codebase

**Research date:** 2026-05-17  
**Valid until:** 2026-06-17 (stable admin CRUD domain)
