---
phase: 16-shadcn-select-audit-verify
plan: 01
subsystem: ui
tags: [shadcn, select, nuqs, catalog]

requires: []
provides:
  - shadcn Select on catalog sort and brand filter with nuqs
affects: [16-03]

tech-stack:
  added: []
  patterns:
    - "Controlled shadcn Select + useQueryStates setParams"
    - "Brand filter sentinel __all__ maps to brend null"

key-files:
  created: []
  modified:
    - src/components/catalog/catalog-toolbar.tsx
    - src/components/catalog/catalog-filters.tsx

key-decisions:
  - "Sort SelectTrigger w-36 with aria-label Сортування"
  - "ALL_BRANDS sentinel __all__ for empty brand filter"

patterns-established:
  - "Storefront catalog filters use shadcn Select instead of native select"

requirements-completed: [UX-01]

duration: 15min
completed: 2026-05-19
---

# Phase 16 Plan 01 Summary

**Storefront catalog sort and brand filters migrated to controlled shadcn Select with nuqs pagination reset.**

## Performance

- **Duration:** ~15 min
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Sort dropdown uses shadcn Select; changing sort resets `storinka` to 1
- Brand filter uses `__all__` sentinel; maps to `brend: null` in URL
- Zero native `<select>` in catalog toolbar and filters

## Task Commits

1. **Task 1: catalog-toolbar sort Select** — (pending commit)
2. **Task 2: catalog-filters brand Select** — (pending commit)

## Self-Check: PASSED

- `grep '<select'` on catalog-toolbar.tsx and catalog-filters.tsx: none
- `npm run build`: exit 0
