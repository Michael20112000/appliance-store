---
phase: 11-admin-list-row-ux
plan: 01
subsystem: ui
tags: [admin, a11y, vitest]
requires: []
provides:
  - Shared getAdminClickableRowProps + adminClickableRowClassName
  - useAdminClickableRow client hook
key-files:
  created:
    - src/lib/admin/clickable-table-row.ts
    - src/lib/admin/clickable-table-row.test.ts
    - src/lib/admin/use-admin-clickable-row.ts
  modified: []
requirements-completed: [UX-02]
completed: 2026-05-18
---

# Plan 11-01 Summary

**Shared admin clickable-row contract with Vitest coverage and a client hook for router navigation.**

## Accomplishments

- `getAdminClickableRowProps` — role=link, tabIndex=0, Enter/Space navigation
- `adminClickableRowClassName` — D-11-08 hover/focus tokens
- `useAdminClickableRow` — wraps helper with `router.push`
- Six unit tests (no DOM)

## Self-Check: PASSED
