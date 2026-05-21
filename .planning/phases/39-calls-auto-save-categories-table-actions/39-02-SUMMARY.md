---
phase: 39-calls-auto-save-categories-table-actions
plan: 02
subsystem: ui
tags: [react, admin, categories, server-actions]

requires: []
provides:
  - Categories table № column and Дії (add product + delete)
affects: [admin-categories]

tech-stack:
  added: []
  patterns:
    - "deleteCategoryFromListAction — list delete without redirect (mirror products)"

key-files:
  created:
    - src/server/actions/admin/category.actions.test.ts
    - src/components/admin/category-table-delete-button.tsx
    - src/components/admin/category-table-delete-button.test.tsx
  modified:
    - src/server/actions/admin/category.actions.ts
    - src/components/admin/admin-categories-table.tsx
    - src/components/admin/admin-categories-table.test.tsx

key-decisions:
  - "Table uses deleteCategoryFromListAction; edit form keeps deleteCategoryAction redirect"
  - "Row removal via setLocalCategories filter — no router.refresh on delete"

patterns-established:
  - "CategoryTableDeleteButton mirrors ProductListDeleteButton with text «Видалити»"

requirements-completed: [ADM-CAT-07, ADM-CAT-08]

duration: 20min
completed: 2026-05-21
---

# Phase 39 Plan 02 Summary

**Categories table shows live № after DnD and a Дії column with «Додати товар» (novyi?categoryId) and confirmed delete without leaving the list.**

## Accomplishments
- `deleteCategoryFromListAction` revalidates paths and returns `{ ok }` without redirect
- `CategoryTableDeleteButton` with AlertDialog and row navigation guards
- `AdminCategoriesTable` column order № → grip → Назва → Товари → Дії

## Self-Check: PASSED
- `npm test` on category.actions, delete button, and table tests — 9/9
- Table delete uses list action only
