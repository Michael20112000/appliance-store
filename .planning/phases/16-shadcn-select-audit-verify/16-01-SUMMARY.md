---
phase: 16-shadcn-select-audit-verify
plan: 01
subsystem: storefront-catalog
tags: [select, nuqs, shadcn, catalog, ux]
dependency_graph:
  requires: []
  provides: [shadcn-sort-select, shadcn-brand-select]
  affects: [catalog-toolbar, catalog-filters]
tech_stack:
  added: []
  patterns: [nuqs-controlled-select, sentinel-brand-filter]
key_files:
  created: []
  modified:
    - src/components/catalog/catalog-toolbar.tsx
    - src/components/catalog/catalog-filters.tsx
decisions:
  - "D-16-01: Migrated catalog-toolbar and catalog-filters native selects to shadcn Select"
  - "D-16-02: nuqs controlled Select with shallow: false for deep links"
  - "D-16-05: Sort onValueChange resets storinka to 1"
  - "D-16-06: Brand sentinel ALL_BRANDS='__all__' maps to brend: null"
  - "D-16-07: Sort SelectTrigger w-36"
  - "D-16-08: Brand SelectTrigger w-full"
metrics:
  duration: "~5 min"
  completed: "2026-05-19T08:51:03Z"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 16 Plan 01: Storefront Catalog Native Select Migration Summary

**One-liner:** Replaced native `<select>` in catalog-toolbar and catalog-filters with controlled shadcn Select components backed by nuqs, with sentinel-based brand null mapping.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | catalog-toolbar sort Select | 601045f | src/components/catalog/catalog-toolbar.tsx |
| 2 | catalog-filters brand Select | 6734806 | src/components/catalog/catalog-filters.tsx |

## What Was Built

**Task 1 — catalog-toolbar sort Select:**
- Removed native `<select>` for sort
- Added `Select/SelectTrigger/SelectContent/SelectItem/SelectValue` from `@/components/ui/select`
- `SelectTrigger className="w-36" aria-label="Сортування"`
- `onValueChange` with null guard resets `storinka: 1` on change
- Three items: `novi` → «Новіші», `cina-asc` → «Ціна ↑», `cina-desc` → «Ціна ↓»

**Task 2 — catalog-filters brand Select:**
- Added module-level `const ALL_BRANDS = "__all__"` sentinel
- Replaced native brand `<select>` with shadcn Select
- `value={params.brend ?? ALL_BRANDS}` controlled
- `onValueChange` maps `ALL_BRANDS` sentinel to `brend: null` (T-16-01-01)
- `SelectTrigger className="w-full"`
- First item: `ALL_BRANDS` → «Усі бренди»; remaining items from `brands` prop

## Verification

- `npm run build` exits 0 ✓
- No native `<select>` in either file ✓
- `aria-label="Сортування"` on sort trigger ✓
- `storinka: 1` reset on both sort and brand change ✓
- Sentinel maps to `brend: null` ✓

## Deviations from Plan

**1. [Rule 2 - Missing null check] Added null guard in catalog-toolbar onValueChange**
- **Found during:** Task 1
- **Issue:** Base UI's `onValueChange` passes `string | null`; the plan pattern lacked a null guard for the sort trigger
- **Fix:** Added `if (!value) return;` before `setParams` in toolbar's onValueChange
- **Files modified:** src/components/catalog/catalog-toolbar.tsx
- **Commit:** 601045f

**Note:** Both files arrived partially pre-modified (Select already in catalog-toolbar, Select already in catalog-filters per git diff). The executor verified correctness, applied the null guard deviation, and committed both files cleanly.

## Threat Mitigations Applied

| Threat | Status |
|--------|--------|
| T-16-01-01: `__all__` sentinel written to URL | ✓ Mitigated — sentinel maps to `null` in onValueChange |
| T-16-01-02: Sort value outside enum breaks parser | ✓ Mitigated — null guard + cast to union type |

## Known Stubs

None.

## Self-Check: PASSED

- `src/components/catalog/catalog-toolbar.tsx` exists ✓
- `src/components/catalog/catalog-filters.tsx` exists ✓
- Commit 601045f exists ✓
- Commit 6734806 exists ✓
- `npm run build` exits 0 ✓
