---
phase: 32-admin-dashboard-polish
plan: "01"
subsystem: admin-ui
tags: [admin, dashboard, icons, buttons, stat-card]
dependency_graph:
  requires: []
  provides: [dashboard-button-icons, stat-card-icon-prop]
  affects: [src/app/(admin)/admin/page.tsx, src/components/admin/stat-card.tsx]
tech_stack:
  added: []
  patterns: [lucide-react icon prop pattern, React.ElementType icon prop]
key_files:
  created: []
  modified:
    - src/app/(admin)/admin/page.tsx
    - src/components/admin/stat-card.tsx
decisions:
  - "Omit size prop on both buttons (not variant=default) to match tovary page Add button pattern exactly"
  - "Use icon?: React.ElementType in StatCardProps for type-safe polymorphic icon passing"
  - "Wrap StatCard content in <div className='relative'> to enable absolute-positioned top-right icon"
metrics:
  duration: "8 minutes"
  completed: "2026-05-20"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 32 Plan 01: Admin Dashboard Polish Summary

## One-Liner

Added Plus/Eye icons to dashboard action buttons (blue primary + outline), and wired ShoppingBag/Package/PackageX icons top-right on the three StatCards via a new optional `icon?: React.ElementType` prop.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update dashboard action buttons (ADM-DASH-03) | 5aa0a0f | src/app/(admin)/admin/page.tsx |
| 2 | Add icon prop to StatCard and wire dashboard icons (ADM-DASH-04) | b88191e | src/components/admin/stat-card.tsx, src/app/(admin)/admin/page.tsx |

## What Was Built

**Task 1 — Dashboard action buttons:**
- "Додати товар": removed `size="sm"` and `variant="outline"`, added `<Plus className="size-4" aria-hidden />` before text. Now renders as blue primary button matching the tovary page Add button pattern.
- "Переглянути замовлення": removed `size="sm"`, kept `variant="outline"`, added `<Eye className="size-4" aria-hidden />` before text.
- Imported `Eye` and `Plus` from `lucide-react`.

**Task 2 — StatCard icon prop:**
- Added `import type React from "react"` to stat-card.tsx.
- Extended `StatCardProps` with `icon?: React.ElementType`.
- Destructured `icon: Icon` from props; wrapped content in `<div className="relative">`.
- Conditionally renders `<Icon className="absolute top-0 right-0 size-5 text-muted-foreground" aria-hidden />` when `icon` prop is provided.
- StatCards without `icon` prop are unaffected (no regression).
- Dashboard wired: `icon={ShoppingBag}` on "Нові замовлення", `icon={Package}` on "Товари в наявності", `icon={PackageX}` on "Розпродано".
- Imported `ShoppingBag`, `Package`, `PackageX` from `lucide-react` in `admin/page.tsx`.

## Verification Results

- `npx tsc --noEmit`: zero new errors in modified files (pre-existing test file errors unaffected).
- Grep confirms all five icon names in `admin/page.tsx` imports.
- Grep confirms `icon?: React.ElementType` and `size-5` in `stat-card.tsx`.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — purely presentational changes, no new network endpoints, auth paths, or data model changes.

## Self-Check: PASSED

- src/app/(admin)/admin/page.tsx: exists and contains Plus, Eye, ShoppingBag, Package, PackageX imports
- src/components/admin/stat-card.tsx: exists and contains `icon?: React.ElementType` and `size-5`
- Commit 5aa0a0f: Task 1 (button icons)
- Commit b88191e: Task 2 (StatCard icon prop + dashboard wiring)
