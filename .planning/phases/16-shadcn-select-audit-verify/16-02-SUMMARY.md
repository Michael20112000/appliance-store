---
phase: 16-shadcn-select-audit-verify
plan: "02"
subsystem: admin-forms
tags: [shadcn, react-hook-form, select, admin]
dependency_graph:
  requires: []
  provides: [admin-form-selects]
  affects: [product-form]
tech_stack:
  added: []
  patterns: [RHF Controller + shadcn Select]
key_files:
  modified:
    - src/components/admin/product-form.tsx
decisions:
  - "D-16-03: RHF Controller + Select applied to all three form selects"
  - "D-16-04: no shared wrapper — inline Controller per field"
  - "D-16-09: w-full triggers on all form selects"
metrics:
  duration: "~5 min"
  completed: "2026-05-19"
---

# Phase 16 Plan 02: Migrate Product Form Selects Summary

**One-liner:** Replaced three native `<select>` elements in product-form.tsx with RHF `Controller` + shadcn `Select` primitives, preserving UA labels and w-full width.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Controller selects for categoryId, condition, status | c5612b4 | src/components/admin/product-form.tsx |

## What Was Built

- Added `Controller` import from `react-hook-form` alongside `useForm`
- Added `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` imports from `@/components/ui/select`
- **categoryId** — `Controller` wrapping `Select` with `SelectItem` per category option
- **condition** — `Controller` wrapping `Select` with `conditionLabelUa(condition)` labels for each `CONDITIONS` entry
- **status** (when `!isSold`) — `Controller` wrapping `Select` with «Чернетка» / «В наявності» Ukrainian labels
- Each `SelectTrigger` has `id` matching its `Label htmlFor` and `className="w-full"` per D-16-09
- `form.register("categoryId")`, `form.register("condition")`, `form.register("status")` replaced by `field.onChange` / `field.value` via Controller render prop

## Threat Mitigations Applied

| ID | Threat | Mitigation Applied |
|----|--------|--------------------|
| T-16-02-01 | RHF field not updated on Select change | `field.onChange` used as `onValueChange` for all three selects |
| T-16-02-02 | Invalid enum string from Select | `SelectItem value` matches existing enum strings only (no free-text input) |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — no new network endpoints, auth paths, or schema changes introduced.

## Self-Check

- [x] `src/components/admin/product-form.tsx` exists and has three `Controller` blocks
- [x] No `<select` substring in file — verified with `! grep -q '<select'`
- [x] `SelectTrigger className="w-full"` on all three form selects
- [x] `npx tsc --noEmit` — zero errors in product-form.tsx (pre-existing test errors are unrelated)
- [x] Commit c5612b4 exists
