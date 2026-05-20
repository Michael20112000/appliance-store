---
phase: 33-admin-categories-dnd-links
plan: "03"
subsystem: admin-actions
tags: [server-action, auth, validation, reorder, dnd]
dependency_graph:
  requires: [33-02]
  provides: [reorderCategoriesAction]
  affects: [category.actions.ts]
tech_stack:
  added: []
  patterns: [requireAdmin-guard, inline-validation, revalidateCategoryPaths]
key_files:
  created: []
  modified:
    - src/server/actions/admin/category.actions.ts
decisions:
  - "Inline string[] validation (not Zod) — matches deleteCategoryAction simplicity"
  - "No isRedirectError check in catch — reorderCategoriesAction does not call redirect()"
  - "revalidateCategoryPaths() called with no slug arg per D-08 (covers / and /admin/kategorii)"
metrics:
  duration: 3min
  completed: "2026-05-20T14:52:00Z"
  tasks_completed: 1
  files_changed: 1
---

# Phase 33 Plan 03: reorderCategoriesAction Server Action Summary

**One-liner:** `reorderCategoriesAction` added to category.actions.ts with requireAdmin guard, inline string[] validation (INVALID_INPUT), reorderCategories service call, and revalidateCategoryPaths().

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add reorderCategoriesAction to category.actions.ts | dfcd843 | src/server/actions/admin/category.actions.ts |

## Implementation Details

### Task 1: reorderCategoriesAction Server Action

Modified `src/server/actions/admin/category.actions.ts` in two places:

1. Added `reorderCategories` to the named import block from `@/server/services/admin-catalog.service` (alphabetical position between `deleteCategory` and `updateCategory`).

2. Appended `reorderCategoriesAction` after `deleteCategoryAction`:
   - `await requireAdmin()` — first statement, satisfies T-33-04 (Elevation of Privilege mitigation)
   - Inline `!Array.isArray(orderedIds) || orderedIds.some((id) => typeof id !== "string")` — returns `{ ok: false, error: "INVALID_INPUT" }` — satisfies T-33-05 (Tampering mitigation)
   - `try { await reorderCategories(orderedIds); revalidateCategoryPaths(); return { ok: true } }` — service delegation + path revalidation per D-08
   - `catch { return { ok: false, error: "UNKNOWN" } }` — no `isRedirectError` check (action never calls `redirect()`)

## Verification Results

- `grep -n "export async function reorderCategoriesAction" src/server/actions/admin/category.actions.ts` — found at line 104
- All four strings present: `reorderCategoriesAction`, `requireAdmin`, `INVALID_INPUT`, `revalidateCategoryPaths`
- `reorderCategories` import added to service import block
- Full test suite: 215 passed; 8 test file failures are pre-existing `@/generated/prisma/client` missing in worktree environment (documented in 33-02-SUMMARY.md) — out of scope

## Deviations from Plan

None — plan executed exactly as written.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes. This plan adds a "use server" boundary function that enforces `requireAdmin()` — no new trust boundary surfaces.

## Self-Check: PASSED

- [x] `src/server/actions/admin/category.actions.ts` contains `export async function reorderCategoriesAction(` at line 104
- [x] Function body contains `await requireAdmin()` as first statement
- [x] Function body contains `Array.isArray(orderedIds)` validation
- [x] Function body contains `await reorderCategories(orderedIds)`
- [x] Function body contains `revalidateCategoryPaths()` with no arguments
- [x] Import block includes `reorderCategories`
- [x] Commit dfcd843 exists
- [x] 215 tests pass
