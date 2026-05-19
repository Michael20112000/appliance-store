# Phase 18: Product Delete from List — Research

**Researched:** 2026-05-19  
**Domain:** Admin products table (`/admin/tovary`), inline delete with row-click isolation  
**Confidence:** HIGH (codebase); MEDIUM (e2e scope — optional per ROADMAP)

## Summary

Phase 18 adds a **«Дії»** column with a ghost **Trash** icon on `AdminProductsTable`. Row navigation to `/admin/tovary/[id]` must remain for all other cells. Delete must reuse **`deleteProduct`** guards (`PRODUCT_IN_CART`, `PRODUCT_IN_ACTIVE_ORDER`) and Ukrainian error copy from `product-form.tsx`.

**Critical finding:** `deleteProductAction` in `product.actions.ts` calls **`redirect("/admin/tovary")`** on success. That pattern fits the **edit form** flow but breaks **inline list delete** (needs `router.refresh()` + toast, no redirect). Implement a **list-safe action** (e.g. `deleteProductFromListAction`) that returns `{ ok: true }` after `revalidateAdminProductPaths()` / storefront revalidation — same as today minus `redirect`.

**Confirm UX:** `product-form` uses `window.confirm` with copy: *«Видалити товар? Дію не можна скасувати, якщо товар не в кошику чи активному замовленні.»* ROADMAP asks for **confirm dialog** — use **shadcn `AlertDialog`** (parity with `order-list-status-select.tsx` cancel flow), same Ukrainian strings.

**Row isolation:** `ProductListStatusSelect` already uses `data-admin-row-interactive`, `stopPropagation` on trigger, and `suppressAdminRowNavigation` on close. Delete button should follow the same pattern; `clickable-table-row.ts` treats `button` as interactive — still add explicit `stopPropagation` on click/pointerdown for Vitest + portal safety.

**Primary recommendation:** New `ProductListDeleteButton` client component; `deleteProductFromListAction`; extend `admin-products-table.tsx` with `<th>Дії</th>` + cell; Vitest on stopPropagation; manual checklist row for delete → row gone after refresh.

<validation_architecture>
## Validation Architecture

### Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | Vitest 3.x + jsdom |
| Config | `vitest.config.ts` |
| Quick run | `npm run test -- src/components/admin/product-list-delete-button.test.tsx` |
| Full suite | `npm run test` |
| Estimated runtime | ~15s component; ~60s full |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Command | File |
|--------|----------|-----------|---------|------|
| ADM-PRD-04 | Delete click does not invoke row `onNavigate` | unit | `npm run test -- product-list-delete` | `product-list-delete-button.test.tsx` |
| ADM-PRD-04 | Success path refreshes list (manual/e2e) | manual | checklist | `18-MANUAL-CHECKLIST.md` |
| ADM-PRD-04 | Guards return toast errors | unit (optional) | mock action | same test file or action test |

### Sampling Rate

- After each task commit: targeted Vitest for touched files
- After wave 1: `npm run test`
- Before verify-work: `npm run build && npm run test`

### Wave 0

Not required — Vitest + AlertDialog + sonner already in project.

### Manual-Only

| Behavior | Why |
|----------|-----|
| Full delete → row disappears | Needs DB + admin session |
| Cart/order guard toasts | Needs seeded cart/order |

</validation_architecture>

## Standard Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Table | `admin-products-table.tsx` | Add column; keep `getAdminClickableRowProps` |
| Delete UI | `Button variant="ghost" size="icon"` + `lucide-react` `Trash2` | Match admin icon buttons |
| Confirm | shadcn `AlertDialog` | Not `window.confirm` on list |
| Feedback | `sonner` toast | Same as `product-list-status-select` |
| Server | `deleteProduct` service | No schema change |
| Action | New list action without redirect | Refactor shared try/catch + `mapProductError` |

## Codebase Patterns

### Analog: `product-list-status-select.tsx`

- `useTransition` + `startTransition`
- `toast.success` / `toast.error` + shared `errorMessages` keys
- `data-admin-row-interactive` wrapper
- `onClick` / `onPointerDown` → `stopPropagation`
- `suppressAdminRowNavigation()` before async work
- `router.refresh()` on success

### Analog: `order-list-status-select.tsx`

- `AlertDialog` for destructive confirm
- `AlertDialogAction` with `variant` destructive styling via className

### Row click: `clickable-table-row.ts`

- `ADMIN_ROW_INTERACTIVE_SELECTOR` includes `button` — delete inside `data-admin-row-interactive` is sufficient for click guard
- Vitest should still assert explicit `stopPropagation` on trigger (ROADMAP #4)

### Edit form delete (do not break)

- `product-form.tsx` keeps `deleteProductAction` + `window.confirm` + redirect to list
- Optional later: migrate form to shared confirm component — **out of scope** unless trivial extract

## Architecture Decision

```
AdminProductsTable (server list props)
└── ProductListDeleteButton (client, per row)
    ├── Trash Button → opens AlertDialog
    ├── AlertDialog confirm → deleteProductFromListAction(id)
    └── toast + router.refresh() | toast.error
```

**Shared module (optional, YAGNI):** Extract `PRODUCT_DELETE_CONFIRM_TITLE/DESCRIPTION` + `productDeleteErrorMessages` to `src/lib/admin/product-delete-messages.ts` only if both form and list need same strings in one PR — minimum: duplicate confirm string in list component matching form verbatim.

## API / Action Shape

```ts
// Proposed — planner to finalize name
export async function deleteProductFromListAction(id: string) {
  await requireAdmin();
  // validate id
  try {
    await deleteProduct(id);
    revalidateAdminProductPaths();
    revalidatePath("/katalog");
    revalidatePath("/");
    return { ok: true as const };
  } catch (error) {
    return mapProductError(error);
  }
}
```

Keep `deleteProductAction` unchanged for edit page redirect behavior.

## Error Codes (existing)

| Code | UA toast (from product-form) |
|------|------------------------------|
| PRODUCT_IN_CART | Товар у кошику покупця — приберіть його з кошиків перед видаленням. |
| PRODUCT_IN_ACTIVE_ORDER | Товар у активному замовленні — завершіть або скасуйте замовлення. |
| PRODUCT_NOT_FOUND | Товар не знайдено. |
| UNKNOWN | Не вдалося зберегти товар. Спробуйте ще раз. |

Success toast suggestion: **«Товар видалено»** (list context; form redirects so no toast today).

## Files to Touch

| File | Change |
|------|--------|
| `src/server/actions/admin/product.actions.ts` | Add list delete action |
| `src/components/admin/product-list-delete-button.tsx` | New |
| `src/components/admin/product-list-delete-button.test.tsx` | New |
| `src/components/admin/admin-products-table.tsx` | «Дії» column + component |
| `.planning/phases/18-product-delete-from-list/18-MANUAL-CHECKLIST.md` | Manual gate |

**No** `prisma/schema.prisma` changes.

## Risks

| Risk | Mitigation |
|------|------------|
| Reusing `deleteProductAction` causes redirect | New action without redirect |
| Row navigates on delete click | stopPropagation + interactive wrapper + test |
| AlertDialog ghost-click opens edit | `suppressAdminRowNavigation` on dialog close |
| Status Select + Delete both in row | Both use `data-admin-row-interactive` |

## E2E

No existing `e2e/admin-products.spec.ts` found. ROADMAP allows **manual** delete verification. Optional: add Playwright test in follow-up — not required if manual checklist passes.

## RESEARCH COMPLETE
