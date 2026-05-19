---
status: human_needed
phase: 18-product-delete-from-list
verified: 2026-05-19
score: 5/5
---

# Phase 18 Verification

## Must-haves

| Truth | Status | Evidence |
|-------|--------|----------|
| «Дії» column with Trash + UA aria-label | ✓ | `admin-products-table.tsx` header **Дії**, `aria-label="Видалити товар"` |
| Trash opens confirm without row navigation | ✓ | `stopPropagation` + Vitest; AlertDialog controlled |
| Confirm delete → toast + refresh, no redirect | ✓ | `deleteProductFromListAction` + `toast.success` + `router.refresh()` |
| Cart/order guards → UA error toasts | ✓ | Shared `errorMessages` + `mapProductError` |
| Other cells still navigate to edit | ✓ | Row `getAdminClickableRowProps` unchanged |

## Automated

- `eslint` on touched source files: pass
- `npm run test -- product-list-delete`: pass
- `npm run build`: pass

## Human verification

See `18-MANUAL-CHECKLIST.md` — operator sign-off required for delete happy path and optional guard scenarios.
