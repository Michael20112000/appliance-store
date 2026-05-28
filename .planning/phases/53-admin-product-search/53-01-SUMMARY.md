---
phase: 53-admin-product-search
plan: "01"
subsystem: admin-product-search
tags:
  - tdd
  - testing
  - wave-0
dependency_graph:
  requires: []
  provides:
    - "Failing tests for ProductSearchInput (RED gate)"
    - "Extended buildAdminProductWhere q-filter test coverage"
  affects:
    - src/components/admin/product-search-input.tsx
tech_stack:
  added: []
  patterns:
    - "jsdom + vi.useFakeTimers + fireEvent for debounce testing"
    - "vi.mock(next/navigation) with router.replace mock"
    - "TDD RED-state import-fail pattern for Wave 0"
key_files:
  created:
    - src/components/admin/product-search-input.test.tsx
  modified:
    - src/server/services/admin-product.service.test.ts
decisions:
  - "mockReplace captured before describe block and reset in beforeEach via vi.fn() reassignment — ensures each test gets a fresh mock"
  - "vi.useFakeTimers() in beforeEach / vi.useRealTimers() in afterEach — controls 300ms debounce without real time delays"
  - "Test 5 (prop sync) uses rerender without fake timers — useEffect runs synchronously in jsdom after rerender"
metrics:
  duration: "63s"
  completed_date: "2026-05-28"
  tasks_completed: 2
  files_created: 1
  files_modified: 1
---

# Phase 53 Plan 01: Failing Test Stubs for ProductSearchInput Summary

**One-liner:** Wave 0 RED-state test stubs for ProductSearchInput (5 jsdom tests) plus 3 new q-filter cases for buildAdminProductWhere (all GREEN).

## What Was Built

**Task 1: Failing unit tests for ProductSearchInput (RED state)**

Created `src/components/admin/product-search-input.test.tsx` with:
- `/** @vitest-environment jsdom */` directive as first line
- 5 test cases covering: render placeholder, debounce router.replace with q param, clear q on empty input, page reset to 1, prop sync via useEffect
- `vi.mock("next/navigation", ...)` returning `{ replace: mockReplace }` (not refresh)
- `vi.useFakeTimers()` / `vi.useRealTimers()` pattern for debounce control
- File fails at import with "Failed to resolve import './product-search-input'" — correct RED state

**Task 2: Extended buildAdminProductWhere q-filter tests (GREEN)**

Appended 3 new `it(...)` cases to existing `describe("buildAdminProductWhere", ...)` in `src/server/services/admin-product.service.test.ts`:
- Test A: single-char q (length < 2) — no OR property
- Test B: q="Samsung" — OR array length 3, title/brand/description with insensitive mode
- Test C: whitespace-only q — no OR property (trim guard)
- All 7 tests pass (4 existing + 3 new)

## Verification Results

- `npx vitest run src/components/admin/product-search-input.test.tsx` — exits non-zero (RED, import fails — expected)
- `npx vitest run src/server/services/admin-product.service.test.ts` — exits zero, 7 tests pass

## Deviations from Plan

None — plan executed exactly as written.

## TDD Gate Compliance

- RED gate: `test(53-01): add failing unit tests for ProductSearchInput (RED)` commit `170b033`
- GREEN gate: `feat(53-01): extend buildAdminProductWhere tests with q-filter cases` commit `ea616a4` (Task 2 tests are GREEN against already-implemented backend code)
- No REFACTOR gate needed

## Known Stubs

None — this plan creates test files only, no implementation or UI stubs.

## Threat Flags

None — this plan creates test files only; no new network endpoints, auth paths, or schema changes.

## Self-Check: PASSED

- `src/components/admin/product-search-input.test.tsx` — FOUND
- `src/server/services/admin-product.service.test.ts` (modified) — FOUND
- Commit `170b033` — FOUND
- Commit `ea616a4` — FOUND
