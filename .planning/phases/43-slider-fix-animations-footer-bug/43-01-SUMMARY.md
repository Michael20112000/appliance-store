---
phase: 43-slider-fix-animations-footer-bug
plan: 01
subsystem: testing
tags: [vitest, tdd, catalog, store-map, slider]

requires: []
provides:
  - "RED-phase tests for addressExternalMapUrl embed URL detection (BUG-25)"
  - "RED-phase tests for normalizeSliderBounds 50 UAH grid snapping (SLIDER-01)"
affects:
  - 43-02

tech-stack:
  added: []
  patterns:
    - "TDD RED gate: vitest named imports, relative imports, type-stub with Parameters<typeof fn>[0]"

key-files:
  created:
    - src/lib/catalog/store-map.test.ts
    - src/components/catalog/catalog-filters.test.ts
  modified: []

key-decisions:
  - "Used Parameters<typeof addressExternalMapUrl>[0] type stub to avoid importing full service type"
  - "Test 5 for store-map (text-only fallback) passes under current implementation — 3 of 5 tests red (covers all embed bug cases)"

patterns-established:
  - "Vitest test files: named imports from vitest, relative import to module under test, no beforeEach/afterEach, one describe block"
  - "Type stub pattern: type Addr = Parameters<typeof fn>[0] and cast with as Addr"

requirements-completed:
  - SLIDER-01
  - BUG-25

duration: 5min
completed: 2026-05-23
---

# Phase 43 Plan 01: RED-Phase Test Scaffolds for BUG-25 and SLIDER-01

**Vitest RED-phase scaffolds: 5 tests for addressExternalMapUrl embed detection (3 failing) and 4 tests for normalizeSliderBounds grid snapping (all failing — import error)**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-05-23T17:15:00Z
- **Completed:** 2026-05-23T17:16:53Z
- **Tasks:** 2
- **Files modified:** 2 (both new)

## Accomplishments
- Created `src/lib/catalog/store-map.test.ts` with 5 tests for `addressExternalMapUrl` — Tests 2, 3, 4 fail (embed URL bug), Tests 1 and 5 pass (correct behavior already works)
- Created `src/components/catalog/catalog-filters.test.ts` with 4 tests for `normalizeSliderBounds` — all 4 fail because the function is not yet exported from catalog-filters.tsx
- RED state confirmed for both files; establishes Nyquist contract for Plan 02 implementations

## Task Commits

Each task was committed atomically:

1. **Task 1: Write failing tests for addressExternalMapUrl (BUG-25 RED)** - `d3f60e7` (test)
2. **Task 2: Write failing tests for normalizeSliderBounds (SLIDER-01 RED)** - `a42e14a` (test)

## Files Created/Modified
- `src/lib/catalog/store-map.test.ts` - 5 tests for addressExternalMapUrl embed detection; 3 RED (Tests 2-4), 2 GREEN (Tests 1, 5)
- `src/components/catalog/catalog-filters.test.ts` - 4 tests for normalizeSliderBounds grid snapping; all 4 RED (import error)

## Decisions Made
- Used `Parameters<typeof addressExternalMapUrl>[0]` type stub pattern to avoid importing `PublicStoreAddress` from the server service — keeps test files pure and dependency-free
- Did not add `beforeEach`/`afterEach` — plain `it()` blocks matching the `catalog-labels.test.ts` analog pattern

## Deviations from Plan

### Plan Spec Inconsistency (No Rule Applied)

**Plan acceptance criteria stated "at least 4 failing tests" for store-map.test.ts, but the test behaviors only support 3 failures.**

- **Found during:** Task 1 verification
- **Issue:** Test 5 (no mapUrl, no coords) tests the text-fallback path which works correctly in the current implementation — it was never buggy. The plan's "Tests 2-5 fail" claim was incorrect about Test 5.
- **Outcome:** 3 tests fail (Tests 2, 3, 4 — the actual embed-URL bug cases). Tests 1 and 5 pass. The RED contract for BUG-25 is correctly established — all buggy code paths are covered.
- **Files modified:** None — test behaviors followed spec literally

---

**Total deviations:** 1 plan spec inconsistency (no auto-fix needed — tests correctly reflect implementation reality)
**Impact on plan:** No scope impact. The 3 failing tests fully cover the BUG-25 bug surface. Plan 02 will make all tests pass.

## Issues Encountered
None — test files created cleanly, vitest ran without configuration changes.

## Known Stubs
None — test-only plan, no UI or data stubs.

## Threat Flags
None — test files only, no new network endpoints or trust boundaries introduced.

## Next Phase Readiness
- Plan 02 can begin immediately: two RED test contracts in place
- `src/lib/catalog/store-map.ts` needs `isEmbedMapUrl` guard and `addressExternalMapUrl` fix
- `src/components/catalog/catalog-filters.tsx` needs `normalizeSliderBounds` export

---
*Phase: 43-slider-fix-animations-footer-bug*
*Completed: 2026-05-23*
