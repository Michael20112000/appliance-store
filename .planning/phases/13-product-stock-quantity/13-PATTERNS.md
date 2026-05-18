# Phase 13: Product Stock Quantity — Pattern Map

**Mapped:** 2026-05-18  
**Files analyzed:** 16 (14 required + 2 optional)  
**Analogs found:** 14 / 16

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `prisma/schema.prisma` | model | CRUD | `Category.sortOrder` on same file | exact |
| `prisma/migrations/*_product_quantity/` | migration | batch | `20260517191223_category_image/migration.sql` | exact |
| `src/server/services/order.service.ts` | service | transform (transaction) | same file (`$transaction` loop) | exact |
| `src/server/services/cart.service.ts` | service | CRUD + guard | same file (`addToCart`, `mapLine`) | exact |
| `src/server/validators/admin-product.ts` | utility (Zod) | transform | same file (`priceUah`) | exact |
| `src/server/services/admin-product.service.ts` | service | CRUD | same file (`price` / `createProduct`) | exact |
| `src/components/admin/product-form.tsx` | component | request-response | same file (`priceUah` field) | exact |
| `src/components/admin/admin-products-table.tsx` | component | request-response | same file (`price` column + non-sort `Фото`) | exact |
| `src/app/(admin)/admin/tovary/[id]/page.tsx` | route | request-response | same file (`priceUah` in `defaultValues`) | exact |
| `src/server/validators/admin-product.test.ts` | test | transform | same file (`priceUah` cases) | exact |
| `src/server/services/order.service.test.ts` | test | transform | `admin-order.service.test.ts` (`revertSoldProductsOnCancel` mocks) | role-match |
| `src/server/services/cart.service.test.ts` | test | transform | same file (`canAddProductToCart`) | exact |
| `e2e/admin-products.spec.ts` | test | request-response | same file (`Ціна (грн)` fill) | exact |
| `e2e/checkout.spec.ts` | test | request-response | same file (checkout happy path) | partial |
| `src/server/services/catalog.service.ts` (optional) | service | CRUD (read filter) | same file (`buildPublicProductWhere`) | exact |
| `src/server/services/wishlist.service.ts` (optional) | service | CRUD + guard | `cart.service.ts` `addToCart` | exact |
| `src/server/services/product-availability.ts` (new, optional) | utility | transform | `cart.service.ts` `canAddProductToCart` | partial |

---

## Pattern Assignments

### `prisma/schema.prisma` (model, CRUD)

**Analog:** `prisma/schema.prisma` — `Category.sortOrder`, `CartItem.quantity`

**Int field with default on domain model** (lines 112, 169):

```112:112:prisma/schema.prisma
  sortOrder     Int       @default(0)
```

```169:169:prisma/schema.prisma
  quantity  Int     @default(1)
```

**Product block to extend** (lines 118–141) — add `quantity Int @default(1)` after `price` or `status`; keep existing indexes; no change to `CartItem` / `OrderItem`.

```118:141:prisma/schema.prisma
model Product {
  id          String           @id @default(cuid())
  title       String
  slug        String           @unique
  description String?
  brand       String
  price       Int
  condition   ProductCondition
  status      ProductStatus    @default(DRAFT)
  categoryId  String
  // ... relations + indexes
}
```

---

### `prisma/migrations/*_product_quantity/` (migration, batch)

**Analog:** `prisma/migrations/20260517191223_category_image/migration.sql`

**AlterTable add nullable-ish columns** (project convention for additive migrations):

```1:3:prisma/migrations/20260517191223_category_image/migration.sql
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "imageAlt" TEXT,
ADD COLUMN     "imagePublicId" TEXT;
```

**Phase 13 expectation:** Prisma generates `ALTER TABLE "Product" ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 1;` — existing rows pick up `1` via default (D-13-02). Run `npx prisma migrate dev --name product_quantity` then `npx prisma generate`.

---

### `src/server/services/order.service.ts` (service, transform)

**Analog:** same file — existing `$transaction` + per-line product mutation; replace `updateMany → SOLD` only.

**Transaction shell** (lines 99–143):

```99:143:src/server/services/order.service.ts
  return prisma.$transaction(async (tx) => {
    const orderNumber = await generateOrderNumber(tx);

    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryType: data.deliveryType,
        deliveryAddress:
          data.deliveryType === "LVIV_DELIVERY" ? data.deliveryAddress : null,
        notes: data.notes ?? null,
      },
    });

    for (const line of cart.items) {
      const updated = await tx.product.updateMany({
        where: { id: line.productId, status: "AVAILABLE" },
        data: { status: "SOLD" },
      });

      if (updated.count === 0) {
        throw new Error("PRODUCT_UNAVAILABLE");
      }

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: line.productId,
          titleSnapshot: line.title,
          priceSnapshot: line.priceKopiyky,
          quantity: 1,
        },
      });
    }

    await tx.cartItem.deleteMany({
      where: {
        cart: { userId },
      },
    });

    return { orderNumber };
  });
```

**Replace inner loop with** (no in-repo analog — follow RESEARCH baseline):

- `tx.product.update` with `where: { id, status: "AVAILABLE", quantity: { gte: 1 } }`
- `data: { quantity: { decrement: 1 } }`, `select: { quantity: true }`
- catch Prisma not-found → `throw new Error("PRODUCT_UNAVAILABLE")` (same string as today)
- if `quantity === 0` after update → second `tx.product.update({ data: { status: "SOLD" } })`
- if `quantity > 0` → do **not** change `status`

**Extract helper** (planner discretion): `reserveProductUnitForCheckout(tx, productId)` next to `generateOrderNumber` for unit tests.

**Adjacent (do not change in phase 13):** `admin-order.service.ts` `revertSoldProductsOnCancel` still flips `SOLD → AVAILABLE` without restoring `quantity`.

---

### `src/server/services/cart.service.ts` (service, CRUD + guard)

**Analog:** same file

**Status constant + mapLine prune** (lines 5–37):

```5:37:src/server/services/cart.service.ts
const PUBLIC_STATUS = "AVAILABLE" as const;

function mapLine(item: CartItemWithProduct): CartLineDto | null {
  if (item.product.status !== PUBLIC_STATUS) return null;
  // ...
}
```

**Extend `mapLine`:** also return `null` when `item.product.quantity < 1` (stale cart line → same `staleIds` delete path in `getCartForUser`).

**addToCart guard** (lines 91–99):

```91:99:src/server/services/cart.service.ts
export async function addToCart(userId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, status: PUBLIC_STATUS },
    select: { id: true },
  });

  if (!product) {
    throw new Error("PRODUCT_UNAVAILABLE");
  }
```

**Extend where:** `quantity: { gte: 1 }` on `findFirst`.

**Purchasability helper** (lines 174–176) — extend signature or add sibling:

```174:176:src/server/services/cart.service.ts
export function canAddProductToCart(status: string): boolean {
  return status === PUBLIC_STATUS;
}
```

**Pattern:** `status === PUBLIC_STATUS && quantity >= 1` (or delegate to `isProductPurchasable` in new module).

---

### `src/server/validators/admin-product.ts` (utility, transform)

**Analog:** same file — `priceUah` coerce + int bounds

**Create schema field** (mirror `priceUah`, different min):

```20:21:src/server/validators/admin-product.ts
    priceUah: z.coerce.number().int().positive("Ціна має бути додатною"),
```

**Add to both schemas + transforms:**

- `upsertProductSchema`: `quantity: z.coerce.number().int().min(1, "Мінімум 1").max(999, "Максимум 999")`
- `updateProductSchema`: `quantity: z.coerce.number().int().min(0, "...").max(999, "...")`
- Include `quantity` in `.transform()` output objects (lines 22–31, 45–55)

**Do not** add `quantity` to `adminProductListSortSchema` / `listAdminProductsSchema` (D-13-12: no sort in v1.2).

---

### `src/server/services/admin-product.service.ts` (service, CRUD)

**Analog:** same file — `priceUah` → `price` kopiyky conversion

**Kopiyky conversion helper** (lines 38–40):

```38:40:src/server/services/admin-product.service.ts
export function priceUahToKopiyky(uah: number): number {
  return Math.round(uah * 100);
}
```

**Quantity needs no conversion** — persist raw `Int` on create/update:

```235:247:src/server/services/admin-product.service.ts
  return prisma.product.create({
    data: {
      title: data.title,
      slug,
      description: data.description ?? null,
      brand: data.brand,
      categoryId: data.categoryId,
      condition: data.condition,
      status: data.status ?? "DRAFT",
      price: priceUahToKopiyky(data.priceUah),
    },
    include: adminDetailInclude,
  });
```

**Add `quantity: data.quantity`** to `createProduct` and `updateProduct` `data` blocks.

**Optional auto-SOLD (research A2):** in `updateProduct`, when `data.quantity === 0` and resolved `status === "AVAILABLE"`, set `status: "SOLD"` before `prisma.product.update` — mirror checkout semantics.

**List:** `listAdminProducts` already returns full `Product` rows via `findMany` — `quantity` appears automatically once schema has field; extend `AdminProductListItem` type in table component only.

---

### `src/components/admin/product-form.tsx` (component, request-response)

**Analog:** same file — `priceUah` number input beside status

**Form defaults** (lines 72–82):

```72:82:src/components/admin/product-form.tsx
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      brand: defaultValues?.brand ?? "",
      categoryId: defaultValues?.categoryId ?? categories[0]?.id ?? "",
      condition: defaultValues?.condition ?? "GOOD",
      status:
        defaultValues?.status ??
        (currentStatus === "AVAILABLE" ? "AVAILABLE" : "DRAFT"),
      priceUah: defaultValues?.priceUah ?? 0,
    },
```

**Add:** `quantity: defaultValues?.quantity ?? 1` (create default 1).

**Price field pattern to copy for «Кількість»** (lines 205–220) — place in same grid row as price (D-13-11):

```205:220:src/components/admin/product-form.tsx
          <div className="space-y-2">
            <Label htmlFor="priceUah">Ціна (грн)</Label>
            <Input
              id="priceUah"
              type="number"
              min={1}
              step={1}
              className="tabular-nums"
              {...form.register("priceUah", { valueAsNumber: true })}
            />
            {form.formState.errors.priceUah ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.priceUah.message}
              </p>
            ) : null}
          </div>
```

**Quantity input:** `id="quantity"`, `Label` «Кількість», `min={mode === "create" ? 1 : 0}`, `max={999}`, `step={1}`, `tabular-nums`, `register("quantity", { valueAsNumber: true })`, error message from `form.formState.errors.quantity`.

**Note:** Edit mode uses `updateProductAction` with `UpsertProductInput` — ensure `updateProductSchema` accepts `quantity` and action passes it through (already uses spread from form values).

---

### `src/components/admin/admin-products-table.tsx` (component, request-response)

**Analog:** same file — sortable price column + **non-sortable** photo column

**Type — add `quantity: number`** to `AdminProductListItem` (lines 25–36):

```25:36:src/components/admin/admin-products-table.tsx
export type AdminProductListItem = {
  id: string;
  title: string;
  brand: string;
  price: number;
  status: ProductStatus;
  category: { name: string };
  images: {
```

**Non-sortable header** (lines 83–84) — copy for «Кількість» (no `AdminSortableTableHeader`, no `SORTABLE_COLUMNS` entry):

```83:84:src/components/admin/admin-products-table.tsx
            <th className="px-3 py-2 font-medium">Фото</th>
```

Insert `<th>Кількість</th>` after price header, before status (D-13-12).

**Body cell — price pattern** (lines 149–151):

```149:151:src/components/admin/admin-products-table.tsx
                <td className="px-3 py-2 tabular-nums">
                  {formatPriceKopiyky(product.price)}
                </td>
```

**Quantity cell:** `{product.quantity}` with `tabular-nums`; optional low-stock badge via `ProductStatusBadge` pattern in `product-status-badge.tsx` if discretion enabled.

---

### `src/app/(admin)/admin/tovary/[id]/page.tsx` (route, request-response)

**Analog:** same file — `priceUah` from DB

```42:50:src/app/(admin)/admin/tovary/[id]/page.tsx
        defaultValues={{
          title: product.title,
          description: product.description ?? "",
          brand: product.brand,
          categoryId: product.categoryId,
          condition: product.condition,
          status: product.status === "AVAILABLE" ? "AVAILABLE" : "DRAFT",
          priceUah: Math.round(product.price / 100),
        }}
```

**Add:** `quantity: product.quantity` (no /100 — raw units).

---

### `src/server/validators/admin-product.test.ts` (test, transform)

**Analog:** same file — `upsertProductSchema` + `priceUah`

```8:20:src/server/validators/admin-product.test.ts
describe("upsertProductSchema", () => {
  it("accepts valid product input with price in UAH", () => {
    const result = upsertProductSchema.parse({
      title: "Холодильник Samsung",
      brand: "Samsung",
      categoryId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      condition: "GOOD",
      status: "DRAFT",
      priceUah: 4500,
    });
    expect(result.priceUah).toBe(4500);
```

**Add cases:** create rejects `quantity: 0` and `1000`; edit (`updateProductSchema`) accepts `0`, rejects `1000`; import `updateProductSchema` in test file.

---

### `src/server/services/order.service.test.ts` (test, transform)

**Analog:** `src/server/services/admin-order.service.test.ts` — mocked `tx.product`

**Existing mock style for order numbers** (lines 13–17):

```13:17:src/server/services/order.service.test.ts
    const tx = {
      order: {
        findFirst: async () => ({ orderNumber: "ASL-20260517-0003" }),
      },
    };
```

**Implement `it.todo` replacement** (lines 36–38) with `vi.fn()` chain:

```117:136:src/server/services/admin-order.service.test.ts
describe("revertSoldProductsOnCancel", () => {
  it("updates each linked product from SOLD to AVAILABLE", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const tx = { product: { updateMany } };
    // ...
```

**Test matrix for `reserveProductUnitForCheckout`:**

1. decrement 2→1, no second status update  
2. decrement 1→0, second update sets `SOLD`  
3. `update` throws / not found → `PRODUCT_UNAVAILABLE`

---

### `src/server/services/cart.service.test.ts` (test, transform)

**Analog:** same file

```4:9:src/server/services/cart.service.test.ts
describe("canAddProductToCart", () => {
  it("allows AVAILABLE only", () => {
    expect(canAddProductToCart("AVAILABLE")).toBe(true);
    expect(canAddProductToCart("SOLD")).toBe(false);
```

**Extend:** `canAddProductToCart("AVAILABLE", 0)` false; `(..., 1)` true; or test `isProductPurchasable` if extracted.

---

### `e2e/admin-products.spec.ts` (test, request-response)

**Analog:** same file — fill price on create

```11:16:e2e/admin-products.spec.ts
  await page.getByLabel("Назва").fill(title);
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("Бренд").fill("E2E Brand");
  await page.getByLabel("Ціна (грн)").fill("3500");
  await page.getByLabel("Статус").selectOption("AVAILABLE");
```

**Add:** `await page.getByLabel("Кількість").fill("2")` (or assert default `1`); after save, list page shows quantity column (if navigating to `/admin/tovary`).

---

### `e2e/checkout.spec.ts` (test, request-response)

**Analog:** same file — single-item checkout (regression)

```7:28:e2e/checkout.spec.ts
test("buyer can checkout with pickup", async ({ page }) => {
  // register → catalog → add to cart → checkout → confirmation URL ASL-
```

**Extend (optional):** seed or admin-create product with `quantity: 2`, two sequential checkouts, second still succeeds, third fails or product stays `AVAILABLE` with `quantity: 1` after first sale — depends on seed helpers.

---

### `src/server/services/catalog.service.ts` (optional, service, CRUD read)

**Analog:** same file — `buildPublicProductWhere` / `buildCatalogContextWhere`

```32:39:src/server/services/catalog.service.ts
export function buildPublicProductWhere(
  input: CatalogFilters & { categoryId?: string },
): Prisma.ProductWhereInput {
  const filters = catalogFiltersSchema.parse(input);

  return {
    status: PUBLIC_STATUS,
    ...(input.categoryId && { categoryId: input.categoryId }),
```

**Add:** `quantity: { gte: 1 }` alongside `status: PUBLIC_STATUS` in `buildPublicProductWhere` and `buildCatalogContextWhere`.

**Test analog** — `catalog.service.test.ts` (lines 19–23):

```19:23:src/server/services/catalog.service.test.ts
  it("always filters AVAILABLE status", () => {
    const where = buildPublicProductWhere({});
    expect(where.status).toBe("AVAILABLE");
  });
```

Add assertion `expect(where.quantity).toEqual({ gte: 1 })`.

---

### `src/server/services/wishlist.service.ts` (optional, service, CRUD + guard)

**Analog:** `cart.service.ts` `addToCart`

```111:118:src/server/services/wishlist.service.ts
  const product = await prisma.product.findFirst({
    where: { id: productId, status: PUBLIC_STATUS },
    select: { id: true },
  });

  if (!product) {
    throw new Error("PRODUCT_UNAVAILABLE");
  }
```

**Same extension:** `quantity: { gte: 1 }` in `where`.

---

## Shared Patterns

### `PUBLIC_STATUS` + purchasability

**Source:** `src/server/services/cart.service.ts` (lines 5, 174–176)  
**Apply to:** `cart.service`, optional `catalog.service`, `wishlist.service`, storefront helpers

```5:5:src/server/services/cart.service.ts
const PUBLIC_STATUS = "AVAILABLE" as const;
```

Purchasable = `status === "AVAILABLE" && quantity >= 1`.

---

### Checkout unavailable error

**Source:** `src/server/services/order.service.ts` (lines 121–122), `cart.service.ts` (lines 97–98)  
**Apply to:** `order.service`, `cart.service`

```121:122:src/server/services/order.service.ts
      if (updated.count === 0) {
        throw new Error("PRODUCT_UNAVAILABLE");
```

Keep exact message string for existing UI/error mapping.

---

### Admin Zod coerce.number().int()

**Source:** `src/server/validators/admin-product.ts` (line 20)  
**Apply to:** `quantity` on create/update schemas

```20:20:src/server/validators/admin-product.ts
    priceUah: z.coerce.number().int().positive("Ціна має бути додатною"),
```

Ukrainian validation messages for min/max on `quantity`.

---

### Admin auth + action parse

**Source:** `src/server/actions/admin/product.actions.ts` (lines 68–73)

```68:73:src/server/actions/admin/product.actions.ts
export async function createProductAction(input: unknown) {
  await requireAdmin();
  const data = upsertProductSchema.parse(input);

  try {
    const product = await createProduct(data);
```

No action changes required if schemas/services pass `quantity` through.

---

### Prisma interactive transaction

**Source:** `src/server/services/order.service.ts` (line 99)  
**Apply to:** checkout decrement only (admin uses single-statement updates)

```99:99:src/server/services/order.service.ts
  return prisma.$transaction(async (tx) => {
```

---

### Storefront must not expose quantity (D-13-13)

**Source:** `src/types/catalog` / `PublicProductCard` — grep after implementation; do not add fields to card/PDP mappers in `catalog.service.ts`. Admin-only surfaces: form + table.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/server/services/product-availability.ts` (if created) | utility | transform | No shared purchasability module; closest is `canAddProductToCart(status)` only — use RESEARCH helper shape |
| Prisma `decrement` + conditional second update | service | transform | No existing `quantity: { decrement: 1 }` or P2025 handler in repo — implement per `13-RESEARCH.md` baseline |

---

## Metadata

**Analog search scope:** `prisma/`, `src/server/services/`, `src/server/validators/`, `src/components/admin/`, `src/app/(admin)/admin/tovary/`, `e2e/`  
**Files scanned:** ~25  
**Pattern extraction date:** 2026-05-18

## PATTERN MAPPING COMPLETE

**Phase:** 13 - Product Stock Quantity  
**Files classified:** 16  
**Analogs found:** 14 / 16

### Coverage
- Files with exact analog: 12
- Files with role-match analog: 2
- Files with no analog: 2 (new helper module optional; Prisma decrement pattern net-new)

### Key Patterns Identified
- Admin `quantity` mirrors `priceUah`: Zod coerce → service persist → form number input → table `tabular-nums` column (non-sortable like «Фото»).
- Checkout keeps `prisma.$transaction` loop but swaps `updateMany → SOLD` for atomic `decrement` + conditional `SOLD` when `quantity === 0`.
- Cart/wishlist/catalog guards extend existing `status: AVAILABLE` `findFirst` / `where` with `quantity: { gte: 1 }`; stale cart lines use existing `mapLine` prune path.
- Tests extend existing Vitest/Playwright files; order unit tests mock `tx.product` like `admin-order.service.test.ts`.

### File Created
`.planning/phases/13-product-stock-quantity/13-PATTERNS.md`

### Ready for Planning
Pattern mapping complete. Planner can reference analog patterns in PLAN.md files.
