---
phase: 11-admin-list-row-ux
plan: 03
subsystem: ui
requires:
  - plan: 11-01
provides:
  - Orders list row-click without actions column
key-files:
  modified:
    - src/components/admin/orders-data-table.tsx
requirements-completed: [ADM-ORD-01, UX-02]
completed: 2026-05-18
---

# Plan 11-03 Summary

**Orders table: removed «Відкрити» column; body rows navigate to order detail via shared helper.**

## Self-Check: PASSED
