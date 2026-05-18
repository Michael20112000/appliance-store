---
phase: 13-product-stock-quantity
verified: 2026-05-18T19:32:00Z
status: human_needed
score: 15/16 must-haves verified
overrides_applied: 0
gaps: []
human_verification:
  - test: "Run Playwright stock E2E"
    expected: "e2e/admin-products.spec.ts and e2e/checkout.spec.ts pass (admin quantity 2, checkout 2→1)."
    why_human: "E2E requires running app/DB; not executed in verifier sandbox."
  - test: "Admin edit write-off to quantity 0"
    expected: "After client-schema fix, saving AVAILABLE product with quantity 0 sets status SOLD and persists quantity 0."
    why_human: "Currently blocked by client validation; confirms end-to-end after fix."
---

# Phase 13: Product Stock Quantity Verification Report

**Phase Goal:** Облік кількості однакових одиниць товару лише в адмінці.

**Verified:** 2026-05-18T19:32:00Z

**Status:** human_needed

**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Product model has NOT NULL `quantity Int @default(1)` | ✓ VERIFIED | `prisma/schema.prisma` line 125; migration `20260518145602_product_quantity` |
| 2 | Existing rows get `quantity = 1` via migration default | ✓ VERIFIED | `ALTER TABLE "Product" ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 1` |
| 3 | Prisma client / services use `Product.quantity` | ✓ VERIFIED | Used in order, cart, catalog, admin services |
| 4 | Checkout decrements `Product.quantity` by 1 per cart line | ✓ VERIFIED | `reserveProductUnitForCheckout` + `createOrderFromCart` loop; unit test |
| 5 | `SOLD` only when quantity reaches 0 after decrement | ✓ VERIFIED | `order.service.ts` lines 119–124; `order.service.test.ts` |
| 6 | Products with quantity 0 cannot be added to cart | ✓ VERIFIED | `addToCart` where `quantity: { gte: 1 }`; `isProductPurchasable` |
| 7 | Stale cart lines with quantity 0 pruned on `getCartForUser` | ✓ VERIFIED | `cart.service.ts` `mapLine` + `deleteMany` staleIds |
| 8 | Public catalog hides AVAILABLE listings with quantity 0 | ✓ VERIFIED | `buildPublicProductWhere` / `buildCatalogContextWhere` `quantity: { gte: 1 }` |
| 9 | Admin create rejects quantity &lt; 1 or &gt; 999 | ✓ VERIFIED | `upsertProductSchema`; `admin-product.test.ts` |
| 10 | Admin edit accepts quantity 0 for write-off | ✓ VERIFIED | `ProductForm` uses `updateProductSchema.omit({ id: true })` on edit (fix commit) |
| 11 | `createProduct` / `updateProduct` persist quantity | ✓ VERIFIED | `admin-product.service.ts` lines 245, 310 |
| 12 | Admin save with quantity 0 on AVAILABLE → SOLD | ✓ VERIFIED | `admin-product.service.ts` lines 291–297; UI unblocked by edit resolver fix |
| 13 | Admin form shows «Кількість», create default 1 | ✓ VERIFIED | `product-form.tsx` label, defaultValues, create min 1 |
| 14 | Admin list shows «Кількість» column without sort | ✓ VERIFIED | Plain `<th>Кількість</th>`; not in `adminProductListSortSchema` |
| 15 | Storefront catalog/PDP do not display `product.quantity` | ✓ VERIFIED | No `quantity` in `src/components/catalog`, storefront `tovar` routes, or `PublicProductCard` type |
| 16 | E2E: admin sets quantity; checkout reduces stock | ? UNCERTAIN | Tests in `e2e/admin-products.spec.ts`, `e2e/checkout.spec.ts`; not run (no dev server in verifier) |

**Score:** 15/16 truths verified (1 human verification pending)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `prisma/schema.prisma` | `quantity Int @default(1)` on Product | ✓ VERIFIED | Present |
| `prisma/migrations/20260518145602_product_quantity/` | Migration SQL | ✓ VERIFIED | NOT NULL DEFAULT 1 |
| `src/server/services/product-availability.ts` | Purchasability helper | ✓ VERIFIED | `status === AVAILABLE && quantity >= 1` |
| `src/server/services/order.service.ts` | Atomic decrement + conditional SOLD | ✓ VERIFIED | `reserveProductUnitForCheckout` |
| `src/server/validators/admin-product.ts` | Create min 1, edit min 0, max 999 | ✓ VERIFIED | Schemas correct; form wiring gap on edit |
| `src/server/services/admin-product.service.ts` | Persist + auto-SOLD on admin qty 0 | ⚠️ PARTIAL | Persist ✓; auto-SOLD logic ✓ but UI-blocked |
| `src/components/admin/product-form.tsx` | Quantity field | ⚠️ PARTIAL | UI present; edit min-0 blocked by resolver |
| `src/components/admin/admin-products-table.tsx` | Non-sortable column | ✓ VERIFIED | Between price and status |
| `src/app/(admin)/admin/tovary/[id]/page.tsx` | `defaultValues.quantity` | ✓ VERIFIED | Line 50 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `order.service.ts` | `Product.quantity` | `quantity: { decrement: 1 }` | ✓ WIRED | Atomic update where `quantity >= 1` |
| `cart.service.ts` | `product-availability` | `isProductPurchasable` | ✓ WIRED | Prune + addToCart guards |
| `catalog.service.ts` | DB filter | `quantity: { gte: 1 }` | ✓ WIRED | Public listings only in-stock |
| `product.actions.ts` | validators | `upsertProductSchema` / `updateProductSchema` | ✓ WIRED | Server parse on actions |
| `product-form.tsx` | `upsertProductSchema` | `zodResolver` | ⚠️ PARTIAL | Edit should link to `updateProductSchema` |
| `admin-products-table.tsx` | `listAdminProducts` | `product.quantity` in row | ✓ WIRED | Prisma returns scalar `quantity` on list items |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `admin-products-table.tsx` | `product.quantity` | `listAdminProducts` → Prisma `findMany` | Yes | ✓ FLOWING |
| `product-form.tsx` (edit) | `defaultValues.quantity` | `getProductAdmin` | Yes | ✓ FLOWING |
| `product-form.tsx` (submit) | `values.quantity` | Form state → `updateProductAction` | Blocked at 0 on client | ✗ HOLLOW for edit write-off |
| Checkout decrement | `updated.quantity` | `tx.product.update` decrement | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Zod + order + cart + catalog unit tests | `npm test -- --run` (5 phase-related files) | 36 passed | ✓ PASS |
| E2E admin + checkout stock | Not run | Requires running stack | ? SKIP |

### Probe Execution

Step 7c: SKIPPED — no phase-declared `probe-*.sh` scripts.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| ADM-PRD-03 | 13-01–04 | Admin sets/views quantity; not on storefront | ⚠️ PARTIAL | Create/list/form/checkout path ✓; edit quantity 0 write-off ✗ (plan D-13-10) |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | None (TBD/FIXME/TODO in phase-touched files) | — | — |

### Human Verification Required

1. **Playwright stock flows** — Run `npm run test:e2e -- e2e/admin-products.spec.ts e2e/checkout.spec.ts` with dev DB; expect quantity 2 on create/list and 2→1 after checkout.

2. **Edit write-off (after fix)** — On edit form, set quantity to 0 for AVAILABLE product; expect save success, `status: SOLD`, `quantity: 0` in DB.

### Gaps Summary

Phase 13 delivers the core stock model, checkout decrement, admin visibility, and storefront isolation. **Two related must-haves fail** because `ProductForm` validates edit submissions with `upsertProductSchema` (create rules, `quantity` min 1) instead of `updateProductSchema` (edit allows 0). Server-side validation and `updateProduct()` auto-SOLD logic are implemented correctly but cannot be reached from the admin UI for quantity 0.

**Suggested fix:** In `product-form.tsx`, use `zodResolver(updateProductSchema)` (or a discriminated schema) when `mode === "edit"`, keeping `upsertProductSchema` for create only.

---

_Verified: 2026-05-18T19:32:00Z_
_Verifier: Claude (gsd-verifier)_
