---
phase: 11-admin-list-row-ux
plan: 02
subsystem: ui
requires:
  - plan: 11-01
provides:
  - Products table on shared row helper
  - Plus CTA on products list
key-files:
  modified:
    - src/components/admin/admin-products-table.tsx
    - src/app/(admin)/admin/tovary/page.tsx
requirements-completed: [ADM-PRD-01, UX-02]
completed: 2026-05-18
---

# Plan 11-02 Summary

**Products admin table refactored to shared clickable rows; «Додати товар» shows Plus icon.**

## Self-Check: PASSED
