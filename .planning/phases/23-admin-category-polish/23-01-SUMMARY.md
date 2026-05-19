---
phase: 23-admin-category-polish
plan: 01
subsystem: ui
tags: [admin, categories, lucide-react, next-link, vitest]

requires: []
provides:
  - Icon toolbar on category edit (Eye, Plus)
  - «Товари» list column with «Переглянути (N)» filtered products link
affects: [admin-catalog]

tech-stack:
  added: []
  patterns:
    - stopPropagation on nested Link in clickable admin rows
    - adminProductsUrl for category-scoped product list

key-files:
  created:
    - src/components/admin/admin-categories-table.test.tsx
  modified:
    - src/app/(admin)/admin/kategorii/[id]/page.tsx
    - src/components/admin/admin-categories-table.tsx
    - e2e/admin-categories.spec.ts

key-decisions:
  - "Visible Ukrainian button text with aria-hidden icons (D-01)"
  - "Product count in muted parentheses after link, including zero (D-06)"

patterns-established:
  - "Category list: row click → edit; «Переглянути» link → filtered /admin/tovary"

requirements-completed: [ADM-CAT-03, ADM-CAT-04]

duration: 25min
completed: 2026-05-19
---

# Phase 23 Plan 01 Summary

**Admin category edit toolbar and list «Товари» column link operators to filtered products without breaking row-click edit.**

## Performance

- **Duration:** ~25 min
- **Completed:** 2026-05-19
- **Tasks:** 4/4
- **Files modified:** 4

## Accomplishments

- Edit page: `Eye` + `Plus` icons before «Переглянути товари» / «Додати товар»; hrefs unchanged
- List: header «Товари», cell `Link` via `adminProductsUrl({ categoryId })`, muted `(N)` suffix
- Vitest: link href and row vs link navigation behavior
- E2E: toolbar visibility + list «Переглянути» navigates to filtered products

## Task Commits

1. **Task 1: Edit category toolbar icons** - `a4cdb39` (feat)
2. **Task 2: List «Товари» column** - `7e3ba89` (feat)
3. **Task 3: Vitest** - `04280b1` (test)
4. **Task 4: E2E smoke** - `d81ccb3` (test)

## Files Created/Modified

- `src/app/(admin)/admin/kategorii/[id]/page.tsx` - toolbar icons ADM-CAT-03
- `src/components/admin/admin-categories-table.tsx` - products column ADM-CAT-04
- `src/components/admin/admin-categories-table.test.tsx` - navigation guard tests
- `e2e/admin-categories.spec.ts` - extended create/delete flow

## Self-Check: PASSED

- [x] Eye/Plus on edit toolbar; links preserve categoryId query
- [x] List «Товари» / «Переглянути (N)» with stopPropagation
- [x] `npx vitest run src/components/admin/admin-categories-table.test.tsx` green

## Deviations

None.

## Issues Encountered

Pre-existing `tsc --noEmit` project errors unrelated to this plan; plan verify used vitest for component test.
