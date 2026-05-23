---
phase: 42-floating-action-buttons
plan: 01
subsystem: ui
tags: [react, nextjs, lucide-react, base-ui-dialog, testing-library, vitest, tdd]

# Dependency graph
requires:
  - phase: 42-floating-action-buttons
    provides: "Research phase — established FAB positioning/z-index conventions, phone formatting utilities, dialog pattern"
provides:
  - "StorefrontFabs client component with FAB-01 (persistent cart) and FAB-02 (callback dialog)"
  - "Full unit test coverage for both FABs via TDD RED→GREEN cycle"
affects: [42-floating-action-buttons-02]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "FAB wrapper as fixed bottom-left div with flex-col, gap-3, safe-area-inset padding"
    - "Callback FAB opens controlled Dialog (open/onOpenChange state) — no DialogTrigger needed"
    - "Cart FAB always visible (no early return at count=0); badge conditional on count > 0"
    - "TDD: hasSession=true in badge tests to prevent localStorage mock from overriding initialCartCount"

key-files:
  created:
    - src/components/layout/storefront-fabs.tsx
    - src/components/layout/storefront-fabs.test.tsx
  modified: []

key-decisions:
  - "StorefrontFabs uses hasSession=true in badge unit tests to prevent the guest localStorage sync effect from overriding initialCartCount with the mock value of 0"
  - "Phone regex in tests uses /97/ not /097/ — formatUaPhoneDisplay drops the leading 0 from 10-digit Ukrainian numbers"
  - "Callback dialog rendered inline in wrapper div (not at body root) to ensure portal works in JSDOM — @base-ui/react/dialog portal works correctly in tests"

patterns-established:
  - "Controlled Dialog pattern: open={state} onOpenChange={setter} — no DialogTrigger, button onClick sets state directly"
  - "FAB wrapper positioning: fixed bottom-6 left-6 z-[59] flex flex-col items-center gap-3 pb-[max(0px,env(safe-area-inset-bottom))]"

requirements-completed:
  - FAB-01
  - FAB-02

# Metrics
duration: 3min
completed: 2026-05-23
---

# Phase 42 Plan 01: StorefrontFabs Summary

**StorefrontFabs client component with persistent cart FAB and callback FAB opening @base-ui/react/dialog with store phones and CallbackRequestForm idPrefix="fab"**

## Performance

- **Duration:** 3 min
- **Started:** 2026-05-23T10:13:43Z
- **Completed:** 2026-05-23T10:16:26Z
- **Tasks:** 2 (TDD RED + GREEN)
- **Files modified:** 2

## Accomplishments

- Wrote 9 failing tests covering FAB-01 (cart always visible, badge logic, href) and FAB-02 (callback button, dialog open, phone display, form heading) — RED phase
- Implemented StorefrontFabs component satisfying all 9 tests — GREEN phase
- Cart FAB uses `href="/koszyk"`, badge shows only when count > 0 (capped at "9+"), no early return at count=0
- Callback dialog shows store phone list and CallbackRequestForm with idPrefix="fab" preventing DOM ID collision with footer form

## Task Commits

Each task was committed atomically:

1. **Task 1: RED — Write failing tests for StorefrontFabs** - `42bec35` (test)
2. **Task 2: GREEN — Implement StorefrontFabs component** - `de6f28a` (feat)

**Plan metadata:** committed with SUMMARY.md

_Note: TDD plan — test commit first, feat commit second._

## Files Created/Modified

- `src/components/layout/storefront-fabs.tsx` - StorefrontFabs client component (FAB-01 + FAB-02 in fixed bottom-left wrapper)
- `src/components/layout/storefront-fabs.test.tsx` - 9 unit tests covering all FAB-01 and FAB-02 behaviors

## Decisions Made

- `hasSession={true}` used in badge quantity tests (FAB-01-d, FAB-01-e) to prevent the guest localStorage sync `useEffect` from overriding `initialCartCount` with the mocked `getPendingItemCount()` value of 0
- Phone display test regex changed from `/097/` to `/97/` — `formatUaPhoneDisplay("0971112233")` outputs `+38 (97) 111-22-33`, dropping the leading zero from the area code

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed badge test assertions and phone display regex**
- **Found during:** Task 2 (GREEN — tests failing after component created)
- **Issue:** Two classes of test failure: (1) badge tests failing because `hasSession={false}` triggered localStorage sync which overwrote `initialCartCount` with mock value 0; (2) phone regex `/097/` didn't match `formatUaPhoneDisplay` output which drops the leading zero
- **Fix:** Changed badge tests to `hasSession={true}`; changed phone regex to `/97/`
- **Files modified:** `src/components/layout/storefront-fabs.test.tsx`
- **Verification:** All 9 tests pass (GREEN state confirmed)
- **Committed in:** `de6f28a` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - test correctness)
**Impact on plan:** Test assertions corrected to match actual component behavior. No scope creep.

## Issues Encountered

- `getPendingItemCount` mock returns 0; the guest sync `useEffect` ran immediately in tests with `hasSession={false}` and overwrote `initialCartCount`. Resolved by using `hasSession={true}` in tests that assert badge content based on `initialCartCount` prop.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `StorefrontFabs` component exported from `src/components/layout/storefront-fabs.tsx` and ready for Plan 02 layout wiring
- Props signature: `{ phones: PublicStorePhone[]; initialCartCount: number; hasSession: boolean }`
- No blockers

---
*Phase: 42-floating-action-buttons*
*Completed: 2026-05-23*
