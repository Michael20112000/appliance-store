# Phase 3: Cart & Checkout - Pattern Map

**Mapped:** 2026-05-17
**Files analyzed:** 24 (create/modify for Phase 3)
**Analogs found:** 18 / 24

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `prisma/schema.prisma` | model | CRUD schema | `prisma/schema.prisma` (`Product`, `Category`) | exact |
| `src/types/cart.ts` | model | transform | `src/types/catalog.ts` | exact |
| `src/types/order.ts` | model | transform | `src/types/catalog.ts` | exact |
| `src/server/validators/cart.ts` | utility | transform | `src/server/validators/product.ts` | exact |
| `src/server/validators/order.ts` | utility | transform | `src/server/validators/product.ts` | exact |
| `src/lib/cart/guest-cookie.ts` | utility | file-I/O | — | **no analog** |
| `src/lib/permissions.ts` | middleware | request-response | `requireAdmin()` in same file | exact |
| `src/server/services/cart.service.ts` | service | CRUD | `src/server/services/catalog.service.ts` | exact |
| `src/server/services/order.service.ts` | service | CRUD + transaction | `catalog.service.ts` + `PITFALLS.md` | role-match |
| `src/server/services/cart.service.test.ts` | test | unit | `src/server/services/catalog.service.test.ts` | exact |
| `src/server/services/order.service.test.ts` | test | unit | `catalog.service.test.ts` | exact |
| `src/server/actions/cart.actions.ts` | controller | request-response | `.planning/research/ARCHITECTURE.md` (first `use server`) | **no analog** |
| `src/server/actions/order.actions.ts` | controller | request-response | `ARCHITECTURE.md` | **no analog** |
| `src/app/(storefront)/koszyk/page.tsx` | route | request-response + CRUD read | `src/app/(storefront)/kabinet/page.tsx` | exact |
| `src/app/(storefront)/zamovlennia/page.tsx` | route | request-response | `kabinet/page.tsx` + `auth-form.tsx` | role-match |
| `src/app/(storefront)/zamovlennia/pidtverdzhennia/page.tsx` | route | request-response | `kabinet/page.tsx` | role-match |
| `src/app/(storefront)/kabinet/page.tsx` | route | CRUD read | same file (extend) | exact |
| `src/app/(storefront)/tovar/[slug]/page.tsx` | route | request-response | same file + `product-card.tsx` | exact |
| `src/components/cart/add-to-cart-button.tsx` | component | request-response | `auth-form.tsx` (client + action) | role-match |
| `src/components/cart/cart-line-list.tsx` | component | transform | `product-card.tsx` + `price-display.tsx` | role-match |
| `src/components/cart/checkout-form.tsx` | component | request-response | `auth-form.tsx` | exact |
| `src/components/layout/store-header.tsx` | component | request-response | same file + `store-header-auth.tsx` | exact |
| `src/components/layout/cart-badge.tsx` | component | transform | `ui/badge.tsx` + `StoreHeaderAuth` | role-match |
| `e2e/cart-checkout.spec.ts` | test | e2e | `e2e/auth.spec.ts` + `e2e/product-pdp.spec.ts` | exact |

---

## Pattern Assignments

### `prisma/schema.prisma` (model, CRUD schema)

**Analog:** `prisma/schema.prisma` (lines 101-134 `Product` / `ProductImage`)

**Product conventions to extend** (lines 101-121):

```prisma
model Product {
  id          String           @id @default(cuid())
  title       String
  slug        String           @unique
  price       Int
  status      ProductStatus    @default(DRAFT)
  // ...
  @@index([status, categoryId])
}
```

**Add per `.planning/research/ARCHITECTURE.md` (lines 202-307):** `OrderStatus`, `DeliveryType`, `Cart`, `CartItem`, `Order`, `OrderItem`. Use `@default(cuid())` on app entities; `price` / `priceSnapshot` as **Int kopiyky** (same as `Product.price`). Add `cartItems CartItem[]` and `orderItems OrderItem[]` on `Product`. Index `@@index([userId])` on `Order`, `@@unique([cartId, productId])` on `CartItem`.

**Status field:** Keep existing `ProductStatus` (`AVAILABLE | SOLD | DRAFT`) — checkout sets `SOLD` atomically (PITFALLS #1), not a separate `isPublished` flag.

---

### `src/server/validators/cart.ts` + `order.ts` (utility, transform)

**Analog:** `src/server/validators/product.ts`

```typescript
import { z } from "zod";

export const catalogFiltersSchema = z.object({
  q: z.string().max(100).optional(),
  minPrice: z.number().int().nonnegative().optional(),
  // ...
});

export const listProductsSchema = z.object({
  page: z.number().int().min(1).max(1000).default(1),
  pageSize: z.number().int().min(1).max(24).default(24),
});
```

**Apply:** `addToCartSchema` (`productId: z.cuid()`, `quantity: z.number().int().min(1).max(1)` for unique used units), `updateCartItemSchema`, `checkoutSchema` with `customerPhone`, `customerName`, `deliveryType: z.enum(["PICKUP", "LVIV_DELIVERY"])`, conditional `deliveryAddress` when `LVIV_DELIVERY`. Ukrainian error strings like auth-form, not English defaults.

---

### `src/server/services/cart.service.ts` (service, CRUD)

**Analog:** `src/server/services/catalog.service.ts`

**Imports + Prisma** (lines 1-9, 107-124):

```typescript
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { catalogFiltersSchema, listProductsSchema } from "../validators/product";

// ...
const [total, items] = await Promise.all([
  prisma.product.count({ where }),
  prisma.product.findMany({
    where,
    include: cardInclude,
    orderBy: orderByForSort(options.sort),
    skip: (page - 1) * pageSize,
    take: pageSize,
  }),
]);
```

**Public scope filter** (lines 23-29) — mirror for cart lines:

```typescript
export function buildPublicProductWhere(/* ... */): Prisma.ProductWhereInput {
  return {
    status: PUBLIC_STATUS,
    // ...
  };
}
```

**Cart service rules:**
- `getCartForUser(userId)` — `findUnique` on `Cart` where `userId`, `include` product + first image (same `cardInclude` shape as catalog).
- `addToCart(userId, productId, qty)` — verify product `status === "AVAILABLE"` before upsert; reject SOLD/DRAFT.
- `mergeGuestCartIntoUser(userId, guestItems)` — CART-03; call after login from auth callback or dedicated action.
- Pure TS, **no** `"use server"`, **no** React imports.
- Map DB rows to DTOs in `types/cart.ts` (like `mapToCard` lines 59-75).

---

### `src/server/services/order.service.ts` (service, CRUD + transaction)

**Analog:** `catalog.service.ts` (reads) + `.planning/research/PITFALLS.md` Pitfall #1 (writes)

**Transaction pattern (from PITFALLS — implement in service):**

```typescript
await prisma.$transaction(async (tx) => {
  for (const item of cartItems) {
    const updated = await tx.product.updateMany({
      where: { id: item.productId, status: "AVAILABLE" },
      data: { status: "SOLD" },
    });
    if (updated.count !== 1) {
      throw new Error("PRODUCT_UNAVAILABLE");
    }
  }
  const order = await tx.order.create({ data: { /* snapshots */ } });
  await tx.cartItem.deleteMany({ where: { cartId } });
  return order;
});
```

**Snapshots:** `OrderItem.titleSnapshot`, `priceSnapshot` at order time (ARCHITECTURE.md lines 298-307). Generate human `orderNumber` in service. No Stripe / `pending_payment` state (PITFALLS #7).

---

### `src/server/services/cart.service.test.ts` + `order.service.test.ts` (test, unit)

**Analog:** `src/server/services/catalog.service.test.ts`

```typescript
import { describe, expect, it } from "vitest";
import { buildPublicProductWhere } from "./catalog.service";

describe("buildPublicProductWhere", () => {
  it("always filters AVAILABLE status", () => {
    const where = buildPublicProductWhere({});
    expect(where.status).toBe("AVAILABLE");
  });
});
```

**Apply:** Unit-test pure helpers (`canAddProductToCart`, `mergeCartItems`, checkout validation) without DB. Optional integration tests after seed — same style as `prisma/seed.test.ts` if needed.

---

### `src/server/actions/cart.actions.ts` + `order.actions.ts` (controller, request-response)

**Analog:** None in repo (`grep "use server"` → 0). **Target:** `.planning/research/ARCHITECTURE.md` Pattern 1 (lines 133-144)

```typescript
// server/actions/cart.actions.ts
"use server";
import { requireBuyer } from "@/lib/permissions";
import { addToCart } from "@/server/services/cart.service";
import { revalidatePath } from "next/cache";

export async function addToCartAction(productId: string, qty: number) {
  const user = await requireBuyer();
  await addToCart(user.id, productId, qty);
  revalidatePath("/koszyk");
  revalidatePath("/", "layout"); // header badge
}
```

**Conventions (first actions in codebase):**
- Top of file: `"use server"`.
- Thin wrappers: Zod `safeParse` → Ukrainian field errors → service call.
- `revalidatePath("/koszyk")`, `revalidatePath("/zamovlennia")`, `revalidatePath("/kabinet")` after mutations.
- `redirect()` from `next/navigation` after successful checkout (order confirmation).
- **Never** import `prisma` in actions — only services.
- `nextCookies()` already in `src/lib/auth.ts` (line 16) — required for cookie writes from actions.

---

### `src/lib/permissions.ts` — add `requireBuyer()` (middleware, request-response)

**Analog:** `requireAdmin()` (lines 5-15) + `kabinet/page.tsx` (lines 14-18)

```typescript
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
// kabinet/page.tsx
const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user) {
  redirect("/uviity");
}
```

**Add:**

```typescript
export async function requireBuyer() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/uviity");
  }
  return session;
}
```

Use `requireBuyer()` in **all** cart/order actions. Pages `/koszyk`, `/zamovlennia` can inline same check as kabinet OR call `requireBuyer()`.

**ROADMAP #1:** Unauthenticated add-to-cart → redirect `/uviity` (optional `?next=/tovar/...`). Do **not** rely on `proxy.ts` — matcher is `/admin` only (`src/proxy.ts` lines 4-18).

---

### `src/lib/cart/guest-cookie.ts` (utility, file-I/O)

**Analog:** None. **Spec:** `.cursor/rules/gsd.mdc` line 119 — guest cart in **httpOnly cookie**, merge on login (CART-03).

**Planner:** Use `cookies()` from `next/headers` in Server Actions only; JSON schema validated with same Zod as DB cart lines. Merge invoked from login success path (`auth-form.tsx` `router.push` is client — trigger merge via server action post-sign-in or Better Auth hook). No client-readable cart cookie.

---

### `src/app/(storefront)/koszyk/page.tsx` (route, request-response)

**Analog:** `src/app/(storefront)/kabinet/page.tsx`

```typescript
export const metadata: Metadata = {
  title: "Особистий кабінет",
};

export default async function CabinetPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/uviity");
  }
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold">Особистий кабінет</h1>
```

**Apply:**
- `metadata.title`: `"Кошик"`.
- `max-w-2xl` or `max-w-6xl` if line-item grid — prefer `max-w-6xl` when showing product thumbnails (catalog list uses `max-w-6xl` in `katalog/page.tsx` line 51).
- Fetch cart via `getCartForUser(session.user.id)` service — **not** inline `prisma` in page.
- Empty state: Ukrainian copy + `Link` with `buttonVariants()` (PDP line 109-111).
- CTA «Оформити замовлення» → `/zamovlennia`.

---

### `src/app/(storefront)/zamovlennia/page.tsx` (route, request-response)

**Analog:** `kabinet/page.tsx` (auth gate) + `src/components/auth/auth-form.tsx` (form UI)

**Page shell:** Same session gate as koszyk.

**Form:** Extract `CheckoutForm` client component — mirror `auth-form.tsx`:
- `"use client"`, `react-hook-form`, `zodResolver`, `useState` for `error`, `useRouter`.
- `Label`, `Input`, `Button`, `Alert` from `@/components/ui/*`.
- Radio/select for `PICKUP` vs `LVIV_DELIVERY`; show address field only for delivery (CHK-02).
- Submit calls `submitOrderAction` → `redirect` to `/zamovlennia/pidtverdzhennia?order=...`.

**Copy:** Explicit offline payment — no card UI (REQUIREMENTS CHK-03, PITFALLS #7).

---

### `src/app/(storefront)/kabinet/page.tsx` (route, CRUD read) — extend

**Analog:** Same file; replace placeholder copy (lines 24-26).

**List orders:** `order.service.listOrdersForUser(userId)` — simple table/cards, Ukrainian status labels. Link to confirmation or order detail. Layout stays `max-w-2xl` (CHK-04).

---

### `src/app/(storefront)/tovar/[slug]/page.tsx` — add CTA (route, modify)

**Analog:** Existing PDP (lines 109-111) + future `AddToCartButton`

```typescript
<Link href="/katalog" className={cn(buttonVariants(), "inline-flex")}>
  До каталогу
</Link>
```

**Replace/add:** `AddToCartButton` with `productId`, `disabled` when not AVAILABLE (service already filters; handle race gracefully). Primary `Button` next to secondary «До каталогу». Session: pass `session` from page-level `getSession` or let button call action that redirects.

---

### `src/components/cart/add-to-cart-button.tsx` (component, request-response)

**Analog:** `src/components/auth/auth-form.tsx` (lines 37-78)

```typescript
"use client";
// ...
const onSubmit = form.handleSubmit(async (values) => {
  setError(null);
    // ...
  router.push("/kabinet");
  router.refresh();
});
```

**Apply:** `onClick` → `addToCartAction(productId, 1)` → `router.refresh()` for header badge. Show `Alert` on error («Товар уже продано»). `min-h-11` on `Button` (touch target, auth-form line 130).

---

### `src/components/cart/cart-line-list.tsx` (component, transform)

**Analog:** `src/components/catalog/product-card.tsx` + `price-display.tsx`

**Thumbnail + title** (product-card lines 24-52):

```typescript
<Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
  <div className="relative aspect-[4/3] w-full bg-muted">
    <OptimizedImage src={...} alt={...} fill className="object-cover" />
  </div>
  <PriceDisplay priceKopiyky={product.price} className="text-lg" />
```

**Cart line:** Row layout (not full card link); `formatPriceKopiyky` from `@/lib/catalog/format`; quantity stepper + remove `Button variant="outline"`. Server Component parent passes serialized cart DTO.

---

### `src/components/layout/store-header.tsx` + `cart-badge.tsx` (component)

**Analog:** `store-header.tsx` (lines 16-20, 47-74) + `store-header-auth.tsx` + `ui/badge.tsx`

**Server session fetch** (store-header.tsx):

```typescript
export async function StoreHeader() {
  const session = await auth.api.getSession({ headers: await headers() });
```

**Add:** When `session`, `getCartItemCount(userId)` in service (or `_count` on cart). Pass count to client `CartBadge` beside `StoreHeaderAuth`.

**Badge** (`ui/badge.tsx` lines 7-12):

```typescript
variant: {
  default: "bg-primary text-primary-foreground ...",
```

Use `Badge` on icon link `href="/koszyk"`, `aria-label` Ukrainian («Кошик, N товарів»). Icon: `ShoppingCart` from `lucide-react` (project already uses `MenuIcon` in header).

**Client refresh:** After cart mutations, `revalidatePath("/", "layout")` so `StoreHeader` re-fetches count.

---

### `e2e/cart-checkout.spec.ts` (test, e2e)

**Analog:** `e2e/auth.spec.ts` + `e2e/product-pdp.spec.ts`

```typescript
// auth.spec.ts — register flow
await page.goto("/reiestratsiia");
await page.getByLabel("Email").fill(email);
await page.getByRole("button", { name: "Створити обліковий запис" }).click();
await expect(page).toHaveURL(/\/kabinet/);

// product-pdp.spec.ts — navigate from catalog
await page.goto("/katalog/kholodylnyky");
await page.locator('main a[href^="/tovar/"]').first().click();
```

**Flow to implement:**
1. Guest click add-to-cart → lands on `/uviity` (AUTH-03 / ROADMAP #1).
2. Register/login → PDP → add to cart → `/koszyk` shows line.
3. Checkout → confirmation copy (no payment).
4. `/kabinet` lists order.
5. Optional: two-browser race on same product — only one checkout succeeds.

Use Ukrainian button/heading names in `getByRole`.

---

## Shared Patterns

### Layered server boundary (RSC → Action → Service → Prisma)

**Source:** `.planning/research/ARCHITECTURE.md` lines 124-130  
**Apply to:** All Phase 3 writes

Pages and Server Components call **services** for reads. Mutations go **Action → Service → Prisma**. No `prisma` in `app/` or `components/`.

---

### Session check (buyer)

**Source:** `src/app/(storefront)/kabinet/page.tsx` lines 14-18  
**Apply to:** `/koszyk`, `/zamovlennia`, cart actions

```typescript
const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user) {
  redirect("/uviity");
}
```

---

### Admin session check (do not copy for cart)

**Source:** `src/lib/permissions.ts` + `src/app/(admin)/admin/layout.tsx`  
**Apply to:** Phase 4 only for order admin

```typescript
if (!session?.user || session.user.role !== "admin") {
  redirect("/uviity");
}
```

---

### Zod at service boundary

**Source:** `src/server/services/catalog.service.ts` lines 26, 97-100

```typescript
const filters = catalogFiltersSchema.parse(input);
const { page, pageSize } = listProductsSchema.parse({ ... });
```

Parse action input in action **or** service — pick one layer; catalog parses in service.

---

### Price display (kopiyky)

**Source:** `src/lib/catalog/format.ts` lines 9-12, `src/components/catalog/price-display.tsx`

```typescript
export function formatPriceKopiyky(kopiyky: number): string {
  const uah = Math.round(kopiyky / 100);
  return `${uah.toLocaleString("uk-UA")} ₴`;
}
```

Use for line totals, cart summary, order history — never float math in UI.

---

### Storefront layout width

**Source:** `src/app/(storefront)/katalog/page.tsx` line 51, `tovar/[slug]/page.tsx` line 38

```typescript
className="mx-auto max-w-6xl px-4 py-12 sm:px-6"
```

---

### Ukrainian UI copy

**Source:** All storefront components  
**Apply to:** Button «Додати в кошик», «Оформити замовлення», delivery labels «Самовивіз» / «Доставка по Львову», confirmation without payment promise.

---

### Path aliases

**Source:** Throughout `src/`

```typescript
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/server/actions/cart.actions.ts` | controller | request-response | First `"use server"` files in repo — follow ARCHITECTURE.md |
| `src/server/actions/order.actions.ts` | controller | request-response | Same |
| `src/lib/cart/guest-cookie.ts` | utility | file-I/O | No cookie helpers yet; gsd.mdc specifies httpOnly guest cart |
| `src/app/(storefront)/zamovlennia/pidtverdzhennia/page.tsx` | route | request-response | No order confirmation page exists |
| `revalidatePath` usage | cache | — | Zero matches in `src/` today — establish paths in first actions |

**Planner action:** Use ARCHITECTURE.md + PITFALLS.md for actions, guest cookie, and checkout transaction.

---

## Metadata

**Analog search scope:** `src/server/`, `src/app/(storefront)/`, `src/components/`, `src/lib/`, `prisma/`, `e2e/`, `.planning/research/ARCHITECTURE.md`, `.planning/research/PITFALLS.md`  
**Files scanned:** 61 TS/TSX + Prisma schema  
**Pattern extraction date:** 2026-05-17

---

## PATTERN MAPPING COMPLETE

**Phase:** 3 - Cart & Checkout  
**Files classified:** 24  
**Analogs found:** 18 / 24

### Coverage
- Files with exact analog: 11
- Files with role-match analog: 7
- Files with no analog: 6

### Key Patterns Identified
- **Services:** Copy `catalog.service.ts` — Zod parse, `prisma` from `@/lib/db`, DTO mappers, `AVAILABLE` guard on every cart touch.
- **Actions:** First in repo — thin `"use server"` + `requireBuyer()` + `revalidatePath` per ARCHITECTURE.md.
- **Auth pages:** Same gate as `kabinet/page.tsx`; `requireBuyer()` parallels `requireAdmin()`.
- **Checkout:** Prisma `$transaction` + `updateMany` on `status: AVAILABLE` (PITFALLS #1).
- **UI:** `auth-form.tsx` for checkout; `product-card`/`PriceDisplay` for lines; `StoreHeader` session + `Badge` for cart link.
- **Tests:** Vitest like `catalog.service.test.ts`; Playwright like `auth.spec.ts` chained with `product-pdp.spec.ts`.

### File Created
`.planning/phases/03-cart-checkout/03-PATTERNS.md`

### Ready for Planning
Pattern mapping complete. Planner can reference analog patterns in PLAN.md files.
