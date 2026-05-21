---
phase: 40-category-edit-ux
plan: "01"
subsystem: admin-hooks-components
tags: [tdd, auto-save, delete-button, category, admin]
dependency_graph:
  requires: []
  provides:
    - useCategoryAutoSave hook with SaveStatus type
    - CategoryEditDeleteButton component
  affects:
    - Plan 02: category edit page wrapper wires these two primitives
tech_stack:
  added: []
  patterns:
    - RHF useWatch + createDebounce + saveChainRef serialization (mirror of product auto-save)
    - AlertDialog + useTransition delete button (mirror of product-edit-delete-button)
key_files:
  created:
    - src/hooks/admin/use-category-auto-save.ts
    - src/hooks/admin/use-category-auto-save.test.ts
    - src/components/admin/category-edit-delete-button.tsx
    - src/components/admin/category-edit-delete-button.test.tsx
  modified: []
decisions:
  - Used double Promise.resolve() flush in error toast test to fully drain the saveChainRef async chain
  - Added afterEach cleanup() to delete button tests to prevent DOM accumulation between tests
metrics:
  duration: "~8 minutes"
  completed: "2026-05-21"
  tasks_completed: 2
  files_created: 4
---

# Phase 40 Plan 01: Category Edit UX — Auto-Save Hook + Delete Button Summary

**One-liner:** JWT-free category auto-save hook (500ms debounce, schema guard, snapshot dedup, generation guard) and ghost-icon delete button with AlertDialog — both TDD RED/GREEN.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 RED | useCategoryAutoSave — failing tests | 726b0e3 | use-category-auto-save.test.ts |
| 1 GREEN | useCategoryAutoSave — implementation | 9fd283d | use-category-auto-save.ts (+ updated test) |
| 2 RED | CategoryEditDeleteButton — failing tests | 59c944b | category-edit-delete-button.test.tsx |
| 2 GREEN | CategoryEditDeleteButton — implementation | ca76c76 | category-edit-delete-button.tsx (+ updated test) |

## Verification

```
npx vitest run src/hooks/admin/use-category-auto-save.test.ts src/components/admin/category-edit-delete-button.test.tsx
```

Result: 8 passed (5 hook + 3 delete button)

## Acceptance Criteria Check

- [x] `use-category-auto-save.ts` exports `useCategoryAutoSave` and `SaveStatus`
- [x] `DEBOUNCE_MS = 500` (not 400)
- [x] imports `updateCategoryAction` from `@/server/actions/admin/category.actions`
- [x] imports `upsertCategorySchema` from `@/server/validators/category`
- [x] imports `createDebounce` from `@/lib/debounce`
- [x] `runSave` calls `upsertCategorySchema.safeParse` for both snapshot init and save comparison
- [x] No `toast.success` call inside the hook (error-only toasts, D-04)
- [x] `category-edit-delete-button.tsx` exports `CategoryEditDeleteButton`
- [x] imports `deleteCategoryFromListAction` (NOT `deleteCategoryAction`)
- [x] Button `variant="ghost"` `size="icon"` `aria-label="Видалити категорію"`
- [x] `AlertDialogTitle` renders "Видалити категорію?"
- [x] `router.push("/admin/kategorii")` called on success
- [x] `toast.error` with CATEGORY_HAS_PRODUCTS message on failure
- [x] 8 total unit tests pass

## TDD Gate Compliance

- RED gate (test commit): 726b0e3, 59c944b
- GREEN gate (feat commit): 9fd283d, ca76c76
- Both gates present in correct order

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Error toast test required double Promise.resolve() flush**
- **Found during:** Task 1 GREEN
- **Issue:** Single `await Promise.resolve()` after `vi.advanceTimersByTime(500)` was insufficient to drain the full saveChainRef async chain (Promise.then + inner await createDebounce callback sequence requires 2 microtask ticks)
- **Fix:** Separated setValue and timer advance into separate `act()` blocks; added `await Promise.resolve(); await Promise.resolve()` to fully flush
- **Files modified:** `src/hooks/admin/use-category-auto-save.test.ts`
- **Commit:** 9fd283d

**2. [Rule 1 - Bug] Delete button tests required afterEach cleanup()**
- **Found during:** Task 2 GREEN
- **Issue:** Tests 2 and 3 failed with "Found multiple elements with role button and name Видалити категорію" because @testing-library does not auto-cleanup between tests in vitest without explicit `cleanup()` or `@testing-library/react` auto-setup
- **Fix:** Added `afterEach(() => cleanup())` import and call to test file
- **Files modified:** `src/components/admin/category-edit-delete-button.test.tsx`
- **Commit:** ca76c76

**3. [Rule 1 - Bug] Accidental commit to main repo**
- **Found during:** Task 1 RED (path resolution)
- **Issue:** First Write call used `/Users/michael_ivashko/WebStormProjects/web/appliance-store/` (main repo) instead of worktree path; the test file and git commit landed on `main`
- **Fix:** Reverted with `git revert` on main repo; re-created file and committed correctly in worktree
- **Files modified:** None (revert + redo)
- **Commit:** 59bed89 (revert on main)

## Known Stubs

None. Both files are fully wired: hook connects to real `updateCategoryAction`, component connects to real `deleteCategoryFromListAction`.

## Threat Flags

None. No new network endpoints, auth paths, or schema changes introduced. All trust boundary mitigations (requireAdmin in actions, upsertCategorySchema.safeParse guard in hook) were pre-existing per T-40-01 through T-40-04.
