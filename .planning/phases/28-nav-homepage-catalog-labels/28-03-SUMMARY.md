---
phase: 28-nav-homepage-catalog-labels
plan: 03
subsystem: ui
tags: [catalog, homepage, badges]
requires: []
provides:
  - formatCategoryCountBadge helper with UA singular/plural display rules
  - Category cards show product count badges
affects: [homepage, category-grid]
tech-stack:
  added: []
  patterns: [testable pure formatter for display counts]
key-files:
  created:
    - src/lib/catalog/format.test.ts
  modified:
    - src/lib/catalog/format.ts
    - src/components/home/category-grid.tsx
key-decisions:
  - "count===1 shows «1 товар»; count>=2 shows digits only"
patterns-established:
  - "Badge in CardTitle row; zero-count categories still filtered server-side"
requirements-completed: [HOME-05]
duration: 12min
completed: 2026-05-20
---

# Phase 28 Plan 03 Summary

**Homepage category cards show availability counts using the same pipeline as the mobile drawer.**

## Accomplishments
- Added `formatCategoryCountBadge` with Vitest coverage
- Category grid badges in title row; «Переглянути» description kept
- `categoriesWithAvailableProducts` filter unchanged

## Self-Check: PASSED
