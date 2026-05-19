---
phase: 24-product-edit-auto-save-ux
plan: 01
subsystem: ui
tags: [react-hook-form, debounce, admin, auto-save, sonner]

requires:
  - phase: 23-admin-category-polish
    provides: deleteProductFromListAction and admin list AlertDialog patterns
provides:
  - createDebounce utility with flush/cancel
  - useProductAutoSave hook for edit product saves
  - ProductEditPageContent shell with header, back link, and delete
affects:
  - phase-25-storefront-category-filtering

tech-stack:
  added: []
  patterns:
    - Debounced RHF useWatch saves with snapshot diff and generation guard
    - Edit chrome separated from ProductForm (header/delete on shell)

key-files:
  created:
    - src/lib/debounce.ts
    - src/hooks/admin/use-product-auto-save.ts
    - src/components/admin/product-edit-page-content.tsx
    - src/components/admin/product-edit-header.tsx
    - src/components/admin/product-edit-delete-button.tsx
  modified:
    - src/components/admin/product-form.tsx
    - src/app/(admin)/admin/tovary/[id]/page.tsx

key-decisions:
  - "Auto-save status lifted to ProductEditPageContent via onSaveStatusChange callback"
  - "Blur flush only on title and description fields per D-08"

patterns-established:
  - "createDebounce(ms) mirrors createThrottle flush API for field blur flush"
  - "Edit delete uses deleteProductFromListAction + router.push with categoryId filter"

requirements-completed:
  - ADM-PRD-05

duration: 45min
completed: 2026-05-19
---

# Phase 24 Plan 01 Summary

**Edit product page auto-saves with debounced server actions, category-aware back navigation, and header AlertDialog delete — create flow unchanged.**

## Performance

- **Duration:** ~45 min
- **Completed:** 2026-05-19
- **Tasks:** 4
- **Files modified:** 10

## Accomplishments

- `createDebounce` + `useProductAutoSave` with validation gate, snapshot skip, stale-response guard, and inline save status
- Edit page shell: «Назад» with `adminProductsUrl({ categoryId })`, header trash delete, no sticky Save/На вітрині footer
- Vitest coverage for debounce, hook, and delete button

## Task Commits

1. **Task 1: createDebounce utility** - `4c982fb` (feat)
2. **Task 2: useProductAutoSave hook** - `2002f41` (feat)
3. **Task 3: edit page shell** - `26a8e4e` (feat)
4. **Task 4: wire form and page** - `1fc4bf4` (feat)

## Files Created/Modified

- `src/lib/debounce.ts` — debounce with flush/cancel
- `src/hooks/admin/use-product-auto-save.ts` — debounced `updateProductAction` orchestration
- `src/components/admin/product-edit-page-content.tsx` — client edit shell
- `src/components/admin/product-edit-header.tsx` — back link + save status
- `src/components/admin/product-edit-delete-button.tsx` — AlertDialog delete
- `src/components/admin/product-form.tsx` — edit auto-save, create footer preserved
- `src/app/(admin)/admin/tovary/[id]/page.tsx` — uses ProductEditPageContent

## Self-Check: PASSED

- [x] debounce.test.ts, use-product-auto-save.test.ts, product-edit-delete-button.test.ts pass
- [x] Edit form has no «На вітрині», window.confirm, or deleteProductAction
- [x] Create page still uses manual Save/Cancel footer
