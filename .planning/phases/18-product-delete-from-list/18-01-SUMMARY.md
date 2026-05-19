---
phase: 18-product-delete-from-list
plan: 01
subsystem: admin-ui
tags: [nextjs, server-actions, alert-dialog, admin-products]

requires: []
provides:
  - deleteProductFromListAction (no redirect)
  - ProductListDeleteButton with AlertDialog
  - «Дії» column on admin products table
affects: [admin-tovary]

key-files:
  created:
    - src/components/admin/product-list-delete-button.tsx
  modified:
    - src/server/actions/admin/product.actions.ts
    - src/components/admin/admin-products-table.tsx

requirements-completed: [ADM-PRD-04]

completed: 2026-05-19
---

# Phase 18 Plan 01 Summary

**Inline product delete on `/admin/tovary` with list-safe server action, confirm dialog, and «Дії» column without breaking row navigation.**

## Accomplishments

- Added `deleteProductFromListAction` — same guards as edit delete, returns `{ ok: true }` without redirect
- `ProductListDeleteButton` — ghost Trash, UA AlertDialog, toasts, `stopPropagation` + `suppressAdminRowNavigation`
- `AdminProductsTable` — last column **Дії** wired per row

## Self-Check: PASSED

- deleteProductFromListAction has no `redirect(`
- Touched files pass `eslint` directly
- `deleteProductAction` unchanged for edit form
