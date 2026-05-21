---
phase: 36-admin-sidebar-badges
plan: 02
subsystem: server-services
tags: [prisma, admin, sidebar, badges, tdd, green]

# Dependency graph
requires:
  - phase: 36-admin-sidebar-badges
    plan: 01
    provides: Failing Vitest unit tests for getAdminSidebarCounts() — RED state
  - phase: 35-callback-calls
    provides: CallbackRequest schema with archivedAt and PENDING status
provides:
  - getAdminSidebarCounts() aggregated service function — all 7 Wave 0 tests GREEN
  - AdminSidebarBadgeCounts type exported for Wave 2 components
affects:
  - 36-admin-sidebar-badges plan 03 (Wave 2: props refactor and badge render)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Promise.all parallel count queries — no N+1, all five concurrent"
    - "Delegate unreadChats to countUnreadForAdmin() from chat.service (D-08)"
    - "status: 'PENDING' string literal for both order and callbackRequest filters"

key-files:
  created:
    - src/server/services/admin-sidebar.service.ts
  modified: []

key-decisions:
  - "No try/catch — Prisma errors propagate to caller (consistent with callback-request.service.ts pattern)"
  - "No where clause on category.count() and product.count() — total counts per D-03"
  - "status: 'PENDING', archivedAt: null combined in single callbackRequest.count for D-05"

requirements-completed:
  - ADM-NAV-01

# Metrics
duration: 2min
completed: 2026-05-21
---

# Phase 36 Plan 02: Admin Sidebar Badges — Implementation Summary

**Service `admin-sidebar.service.ts` implementing `getAdminSidebarCounts()` with `AdminSidebarBadgeCounts` type — all 7 Wave 0 unit tests turned GREEN via parallel Promise.all with correct D-01/D-03/D-05/D-08 filters**

## Performance

- **Duration:** 2 min
- **Completed:** 2026-05-21
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Created `src/server/services/admin-sidebar.service.ts` with exported type `AdminSidebarBadgeCounts` and async function `getAdminSidebarCounts()`
- All 7 Wave 0 unit tests now GREEN (7 passed, 0 failed)
- Parallel execution via `Promise.all` — all five count queries run concurrently (D-06, no N+1)
- Filter correctness verified by test assertions: D-01 (PENDING orders), D-03 (no where on category/product), D-05 (PENDING + archivedAt=null callbacks), D-08 (countUnreadForAdmin delegation)

## Task Commits

1. **Task 1: Implement admin-sidebar.service.ts (GREEN)** - `048898e` (feat)

## Files Created/Modified

- `src/server/services/admin-sidebar.service.ts` — 23 lines; exports `AdminSidebarBadgeCounts` type and `getAdminSidebarCounts()` function

## Decisions Made

- No try/catch block added — consistent with `callback-request.service.ts` and `admin-order.service.ts` which let Prisma errors propagate to the caller
- Used `"PENDING"` string literal (not enum import) for both `order.status` and `callbackRequest.status` filters — consistent with existing service patterns in the codebase
- Minimal implementation — exactly what tests expect, no extra logic

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

Pre-existing test failures in worktree environment: 9 test files fail due to `Cannot find package '@/generated/prisma/client'` — this is an infrastructure issue with the unbuilt Prisma client in the worktree, not caused by this implementation. The 7 admin-sidebar unit tests all pass. These pre-existing failures existed before this plan's changes.

## Known Stubs

None — service has no stubs; all five count queries are wired to real Prisma calls (mocked in tests, real in production).

## Threat Flags

None — service performs read-only COUNT queries server-side; never exported as API route; T-36-02 (information disclosure) mitigated via requireAdmin() in caller layout.tsx per plan threat model.

## Self-Check

- [x] `src/server/services/admin-sidebar.service.ts` exists
- [x] Commit `048898e` exists: `feat(36-02): implement admin-sidebar.service.ts (GREEN)`
- [x] `export type AdminSidebarBadgeCounts` present in file
- [x] `export async function getAdminSidebarCounts(` present in file
- [x] `Promise.all([` present in file (D-06)
- [x] `status: "PENDING", archivedAt: null` present in file (D-05)
- [x] `countUnreadForAdmin` imported from `"@/server/services/chat.service"` (D-08)
- [x] `npx vitest run admin-sidebar.service.test.ts` — 7 passed, 0 failed

## Self-Check: PASSED

---
*Phase: 36-admin-sidebar-badges*
*Completed: 2026-05-21*
