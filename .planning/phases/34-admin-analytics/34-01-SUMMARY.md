---
phase: 34-admin-analytics
plan: "01"
subsystem: server/services/test
tags: [tdd, analytics, vitest, prisma]
dependency_graph:
  requires: []
  provides:
    - "src/server/services/admin-analytics.service.test.ts — test contract for analytics service"
  affects:
    - "src/server/services/admin-analytics.service.ts — Plan 02 must satisfy these tests"
tech_stack:
  added: []
  patterns:
    - "vi.mock('@/lib/db') with prisma.$queryRaw for $queryRaw-based analytics queries"
    - "BigInt() literals in mock data (matching actual Prisma $queryRaw return type)"
    - "TDD RED phase: test file imports non-existent service (expected module-not-found)"
key_files:
  created:
    - "src/server/services/admin-analytics.service.test.ts"
  modified: []
decisions:
  - "Used BigInt() literals in mock data to match what Prisma $queryRaw actually returns from PostgreSQL COUNT/SUM aggregates"
  - "Mocked callbackRequest.count as vi.fn() alongside $queryRaw — matches the three-query parallel fetch shape expected from the service"
  - "getDashboardAnalyticsPreview test asserts .length === 30 to enforce fixed 30-day window contract"
metrics:
  duration: "92s"
  completed: "2026-05-20"
  tasks_completed: 1
  tasks_total: 1
  files_created: 1
  files_modified: 0
---

# Phase 34 Plan 01: Analytics Service Test Scaffold Summary

**One-liner:** Vitest RED-phase scaffold with 5 tests covering getAnalyticsData shape, BigInt conversion, zero-fill, KPI totals, and getDashboardAnalyticsPreview 30-day contract.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create admin-analytics.service.test.ts with contract stubs | 140b8d0 | src/server/services/admin-analytics.service.test.ts |

## What Was Built

Created `src/server/services/admin-analytics.service.test.ts` — a Wave 0 test scaffold that defines the contract Plan 02 must satisfy.

**Test structure:**

- `describe("getAnalyticsData")` — 4 tests:
  1. Returns correct KPI totals from `$queryRaw` results (orders + revenue + callbacks summed)
  2. BigInt count values are converted to `number` (not `BigInt`)
  3. BigInt revenue values are converted to `number` (not `BigInt`)
  4. Zero-fills missing days to produce a full N-day array (`ordersByDay.length === 7` for `days=7`)

- `describe("getDashboardAnalyticsPreview")` — 1 test:
  1. Returns `ordersByDay` and `revenueByDay` each with 30 entries when DB returns empty arrays

**Mock setup** follows the exact pattern from `admin-order.service.test.ts`:
- `vi.mock("@/lib/db")` with `prisma.order.count`, `prisma.callbackRequest.count`, `prisma.$queryRaw`
- `mockResolvedValueOnce` chaining for the two-call `$queryRaw` pattern (order rows, then revenue rows)
- BigInt literals (`BigInt(3)`, `BigInt(6000)`) matching actual Prisma `$queryRaw` return types

## Verification

Running `npx vitest run src/server/services/admin-analytics.service.test.ts` produces:

```
FAIL  src/server/services/admin-analytics.service.test.ts
Error: Cannot find module '/src/server/services/admin-analytics.service'
```

This is the expected RED state. The test file itself is syntactically valid TypeScript — the only error is the missing service module that Plan 02 will implement.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- [x] `src/server/services/admin-analytics.service.test.ts` — confirmed created
- [x] Commit `140b8d0` — confirmed in git log
- [x] vitest run produces module-not-found error (not test-logic error) — confirmed
- [x] 5 test cases present: 4 under getAnalyticsData, 1 under getDashboardAnalyticsPreview — confirmed
- [x] BigInt() used in mock data — confirmed
- [x] vi.mock("@/lib/db") present — confirmed

## Known Stubs

None — this plan creates a test file only. No production code with stubs.

## Threat Flags

No new security-relevant surface introduced — test file only, no production code, no network endpoints, no auth paths.
