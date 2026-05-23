---
phase: 44-mobile-header-cleanup
plan: "02"
subsystem: storefront/auth
tags: [auth, pending-state, ux, header]
dependency_graph:
  requires: []
  provides: [sign-out-pending-state]
  affects: [storefront-auth-links]
tech_stack:
  added: []
  patterns: [useState-pending-pattern]
key_files:
  created: []
  modified:
    - src/components/layout/storefront-auth-links.tsx
decisions:
  - isPending not reset to false — component unmounts after router.push, making cleanup unnecessary
metrics:
  duration: "~5m"
  completed_date: "2026-05-23"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
---

# Phase 44 Plan 02: Sign-Out Pending State Summary

## One-liner

Sign-out button in storefront header shows "Виходимо..." and is disabled during the authClient.signOut() network request via useState(false) isPending flag.

## What Was Built

Added a pending/loading state to the "Вийти" sign-out button in `storefront-auth-links.tsx`. Clicking the button immediately sets `isPending=true`, disabling it and changing the label to "Виходимо..." to give users clear feedback that sign-out is in progress. After `authClient.signOut()` resolves, navigation proceeds via `router.push("/")` and the component unmounts, so no stuck loader is ever visible.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add isPending state to sign-out button | 45dc028 | src/components/layout/storefront-auth-links.tsx |

## Verification Results

1. Source assertion — pending state count: `grep -c "isPending"` returns 3 (useState declaration, disabled prop, ternary label)
2. Source assertion — button disabled: `disabled={isPending}` present on sign-out Button
3. Source assertion — no false reset: `grep "setIsPending(false)"` returns empty (correct)
4. TypeScript: no errors in storefront-auth-links.tsx (pre-existing test file errors unrelated to this plan)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — no new network endpoints, auth paths, or file access patterns introduced. The sign-out button was already calling `authClient.signOut()`; this plan only adds UI feedback for the existing call. Double-submit is prevented by `disabled={isPending}` (threat T-44-02-01 accepted as noted in plan).

## Self-Check: PASSED

- src/components/layout/storefront-auth-links.tsx: modified with isPending state
- Commit 45dc028 exists and contains the sign-out pending state changes
- No unexpected file deletions
