---
phase: 33-admin-categories-dnd-links
plan: "02"
subsystem: admin-services
tags: [service, vitest, prisma, reorder, dnd]
dependency_graph:
  requires: [33-01]
  provides: [reorderCategories-service, reorderCategories-tests]
  affects: [admin-catalog.service.ts, admin-catalog-reorder.service.test.ts]
tech_stack:
  added: []
  patterns: [prisma-transaction-array-form, vitest-prisma-mock]
key_files:
  created:
    - src/server/services/admin-catalog-reorder.service.test.ts
  modified:
    - src/server/services/admin-catalog.service.ts
decisions:
  - "Used prisma.$transaction array form (not callback form) — all updates are independent, no intermediate reads needed"
  - "Separate test file admin-catalog-reorder.service.test.ts to keep existing admin-catalog.service.test.ts clean"
metrics:
  duration: 1min
  completed: "2026-05-20T14:49:47Z"
  tasks_completed: 2
  files_changed: 2
---

# Phase 33 Plan 02: reorderCategories Service + Vitest Tests Summary

**One-liner:** `reorderCategories` service method using prisma.$transaction array form with two passing Vitest unit tests asserting sortOrder assignment order.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add reorderCategories to admin-catalog.service.ts | efd8e8e | src/server/services/admin-catalog.service.ts |
| 2 | Write Vitest unit tests for reorderCategories | add98cf | src/server/services/admin-catalog-reorder.service.test.ts |

## Implementation Details

### Task 1: reorderCategories Service

Added `reorderCategories(orderedIds: string[]): Promise<void>` at the end of `admin-catalog.service.ts` (after `deleteCategory`). Uses the array form of `prisma.$transaction` — passes an array of `prisma.category.update` calls, each assigning `sortOrder: index + 1`. No existing functions were modified.

### Task 2: Vitest Unit Tests

Created `admin-catalog-reorder.service.test.ts` with:
- `vi.mock("@/lib/db")` mocking `prisma.category.update` and `prisma.$transaction` as `vi.fn()`
- `describe("reorderCategories")` with `beforeEach(() => vi.clearAllMocks())`
- Test 1 — "assigns sortOrder 1..n based on orderedIds array position": verifies `prisma.$transaction` called once with array of length 3
- Test 2 — "placing B before A assigns B sortOrder 1 and A sortOrder 2": wires `mockImplementation` to `Promise.all(ops)` and asserts `prisma.category.update` called with correct `where`/`data` args in order

Both tests pass (`2 passed`).

## Verification Results

- `grep -n "export async function reorderCategories" src/server/services/admin-catalog.service.ts` → line 219
- `npm test -- src/server/services/admin-catalog-reorder.service.test.ts` → 2 passed (0 failed)
- `npm test -- src/server/services/admin-catalog-reorder.service.test.ts src/server/services/admin-catalog.service.test.ts` → 10 passed (0 failed)
- Full suite: 215 tests pass; 8 test files fail due to pre-existing `@/generated/prisma/client` missing in worktree environment (Prisma client not generated) — out of scope for this plan

## Deviations from Plan

None — plan executed exactly as written. Both tasks completed with correct patterns.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. This plan adds a pure service function and its unit test — no trust boundary changes.

## Self-Check: PASSED

- [x] `src/server/services/admin-catalog.service.ts` contains `export async function reorderCategories` at line 219
- [x] `src/server/services/admin-catalog-reorder.service.test.ts` exists with `describe("reorderCategories"` and 2 `it(` blocks
- [x] Commit efd8e8e exists (Task 1)
- [x] Commit add98cf exists (Task 2)
- [x] `npm test -- src/server/services/admin-catalog-reorder.service.test.ts` → 2 passed
