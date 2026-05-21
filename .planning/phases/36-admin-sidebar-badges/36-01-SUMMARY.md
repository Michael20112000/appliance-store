---
phase: 36-admin-sidebar-badges
plan: 01
subsystem: testing
tags: [vitest, prisma, admin, sidebar, badges, tdd]

# Dependency graph
requires:
  - phase: 35-callback-calls
    provides: CallbackRequest schema with archivedAt and PENDING status; callback service patterns
  - phase: 33-admin-categories-dnd-links
    provides: admin sidebar component patterns
provides:
  - Failing Vitest unit tests for getAdminSidebarCounts() — RED state established for Wave 1 GREEN pass
affects:
  - 36-admin-sidebar-badges plan 02 (implementation driven by these tests)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TDD RED: test file imports non-existent service to cause import-level failure"
    - "vi.mock('chat.service') for countUnreadForAdmin to avoid transitive Prisma field reference complexity"
    - "conversation.fields mock required when testing code that calls countUnreadForAdmin (uses prisma.conversation.fields.adminLastReadAt)"

key-files:
  created:
    - src/server/services/admin-sidebar.service.test.ts
  modified: []

key-decisions:
  - "Mock countUnreadForAdmin from chat.service rather than threading prisma.conversation.fields through DB mock — cleaner isolation"
  - "Use toHaveBeenCalledWith() (no args) to assert category.count and product.count are called with no where filter"
  - "Test parallel execution by mocking all five returns with distinct values and asserting each maps correctly"

patterns-established:
  - "Pattern: vi.mock chat.service separately when testing services that call countUnreadForAdmin"

requirements-completed:
  - ADM-NAV-01

# Metrics
duration: 1min
completed: 2026-05-21
---

# Phase 36 Plan 01: Admin Sidebar Badges — Failing Tests Summary

**Vitest unit test scaffold for getAdminSidebarCounts() with 7 RED tests covering all five count queries, filter rules D-01/D-03/D-05, and parallel execution mapping**

## Performance

- **Duration:** 1 min
- **Started:** 2026-05-21T10:49:21Z
- **Completed:** 2026-05-21T10:50:19Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Created `src/server/services/admin-sidebar.service.test.ts` with 7 test cases in RED state
- Tests verify shape, filter correctness for all 5 count queries, and parallel execution mapping
- Confirmed RED state: import fails with "Cannot find module './admin-sidebar.service'" (service not yet created)

## Task Commits

1. **Task 1: Write failing unit tests for getAdminSidebarCounts()** - `8c3dfee` (test)

**Plan metadata:** (committed below)

## Files Created/Modified

- `src/server/services/admin-sidebar.service.test.ts` - 7 failing Vitest tests covering all ADM-NAV-01 filter rules

## Decisions Made

- Mocked `countUnreadForAdmin` from chat.service independently (not via DB mock) to avoid threading the complex `prisma.conversation.fields.adminLastReadAt` field reference through the test mock — cleaner isolation, matches how chat.service.test.ts tests unreadChats separately
- Used `toHaveBeenCalledWith()` (no arguments) for category.count and product.count assertions to verify absence of `where` filter (D-03)
- Used 7 test cases (plan required 6+): shape, categories, products, pendingOrders, unreadChats, unresolvedCallbacks, parallel execution

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Known Stubs

None - this is a test-only file; no data wiring stubs applicable.

## Threat Flags

None - test file is never deployed to production; contains only mock values (T-36-01 accepted in plan threat model).

## Next Phase Readiness

- RED gate established — Wave 1 (plan 36-02) can create `admin-sidebar.service.ts` and drive it GREEN
- All filter rules documented in test assertions: D-01 (PENDING orders), D-03 (total counts), D-05 (PENDING + archivedAt=null callbacks), D-08 (countUnreadForAdmin delegation)
- Wave 1 must make all 7 tests pass to satisfy ADM-NAV-01

## Self-Check

- [x] `src/server/services/admin-sidebar.service.test.ts` exists
- [x] Commit `8c3dfee` exists: `test(36-01): add failing unit tests for getAdminSidebarCounts()`
- [x] Tests exit non-zero (RED state confirmed — import failure on missing service module)

## Self-Check: PASSED

---
*Phase: 36-admin-sidebar-badges*
*Completed: 2026-05-21*
