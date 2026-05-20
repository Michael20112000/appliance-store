---
phase: 34-admin-analytics
plan: "03"
subsystem: components/admin
tags: [analytics, nav, period-selector, server-component]
dependency_graph:
  requires:
    - "34-01 — analytics service test scaffold (AN-01 contract)"
  provides:
    - "src/components/admin/admin-nav-items.ts — updated with Аналітика entry pointing to /admin/analityka"
    - "src/components/admin/period-selector.tsx — PeriodSelector server component for 7/30/90-day toggle"
  affects:
    - "src/components/admin/admin-nav.tsx — re-exports adminNavItems; Аналітика appears in sidebar automatically"
    - "src/app/(admin)/admin/analityka/page.tsx — Plan 05 imports PeriodSelector from this file"
tech_stack:
  added: []
  patterns:
    - "Server component with active prop receives typed 7|30|90 value from RSC page and renders Link-based tab toggle"
    - "lucide-react BarChart2 icon added to adminNavItems alongside existing icons"
    - "cn() + conditional class string for active/inactive link styling (mirrors order-list-filters.tsx)"
key_files:
  created:
    - "src/components/admin/period-selector.tsx"
  modified:
    - "src/components/admin/admin-nav-items.ts"
decisions:
  - "PeriodSelector is a server component (no 'use client') — receives active as prop from RSC page, renders only Link elements; no client-side state required"
  - "Аналітика nav entry inserted before Налаштування (Settings) to preserve logical grouping of operational vs settings items"
metrics:
  duration: "~6m"
  completed: "2026-05-20"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 1
---

# Phase 34 Plan 03: Admin Nav Entry + PeriodSelector Summary

**One-liner:** Added Аналітика sidebar nav link (BarChart2 icon, /admin/analityka) and created PeriodSelector server component with 7/30/90-day Link-based toggle using border-primary active state.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add Аналітика nav item to admin-nav-items.ts | da68f26 | src/components/admin/admin-nav-items.ts |
| 2 | Create PeriodSelector component | 2d29457 | src/components/admin/period-selector.tsx |

## What Was Built

### Task 1: Аналітика Nav Entry

Updated `src/components/admin/admin-nav-items.ts`:
- Added `BarChart2` to the lucide-react import (alphabetically ordered with existing imports)
- Inserted `{ href: "/admin/analityka", label: "Аналітика", icon: BarChart2 }` before the Налаштування entry
- `as const` and existing item order preserved

The admin sidebar re-exports this array via `admin-nav.tsx` — Аналітика appears automatically in the sidebar for all admin users.

### Task 2: PeriodSelector Component

Created `src/components/admin/period-selector.tsx`:
- **Server component** — no `"use client"` directive (receives `active: 7 | 30 | 90` as a prop from the RSC analytics page)
- Renders a `<div className="flex gap-2">` with 3 `<Link>` elements for periods [7, 30, 90]
- Each link href: `?days={N}` (URL navigation triggers RSC re-fetch — no client state)
- Label format: `{N} днів` (e.g., "7 днів", "30 днів", "90 днів")
- Active link: `border-primary bg-primary text-primary-foreground` (matches order-list-filters.tsx pattern)
- Inactive link: `border-border bg-background text-muted-foreground hover:text-foreground`

## Verification

```
grep -c "analityka" src/components/admin/admin-nav-items.ts → 1
grep -c "BarChart2" src/components/admin/admin-nav-items.ts → 2 (import + usage)
grep -c "PeriodSelector" src/components/admin/period-selector.tsx → 2 (type + function)
npx tsc --noEmit → no errors from admin-nav-items.ts or period-selector.tsx
```

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- [x] `src/components/admin/admin-nav-items.ts` — confirmed modified with BarChart2 import and Аналітика entry
- [x] `src/components/admin/period-selector.tsx` — confirmed created
- [x] Commit `da68f26` — confirmed in git log
- [x] Commit `2d29457` — confirmed in git log
- [x] No "use client" in period-selector.tsx — confirmed (grep -c returns 0)
- [x] PeriodSelector export count = 2 (type + function) — confirmed
- [x] Active link has border-primary bg-primary classes — confirmed
- [x] Аналітика entry precedes Налаштування in nav items array — confirmed

## Known Stubs

None — both files are complete implementations with no placeholder data or TODO comments.

## Threat Flags

No new security-relevant surface introduced. The Аналітика nav link is only visible inside the admin layout which already gates all `/admin/*` routes via `requireAdmin()` (T-34-P03-01: accepted, per plan threat model). PeriodSelector uses only literal period values (7, 30, 90) as hrefs — no user input injection surface.
