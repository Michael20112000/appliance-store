---
phase: 08-admin-ux-chat-lifecycle
plan: 01
subsystem: ui
tags: [shadcn, sidebar, tanstack-table, nextjs, admin]

requires: []
provides:
  - Dashboard drafts StatCard links to DRAFT product filter
  - shadcn Sidebar admin shell with mobile Sheet and desktop icon collapse
  - UI primitives table, pagination, tabs, and @tanstack/react-table for plan 02
affects: [08-02, 08-03, 08-04]

tech-stack:
  added: [@tanstack/react-table, shadcn sidebar, shadcn pagination, shadcn tabs, shadcn table]
  patterns: [SidebarProvider + AppSidebar client shell, server requireAdmin + unread count in layout]

key-files:
  created:
    - src/components/admin/app-sidebar.tsx
    - src/components/admin/admin-sidebar-shell.tsx
    - src/components/admin/admin-nav-items.ts
    - src/components/ui/sidebar.tsx
    - src/components/ui/pagination.tsx
    - src/hooks/use-mobile.ts
  modified:
    - src/app/(admin)/admin/page.tsx
    - src/app/(admin)/admin/layout.tsx
    - src/components/admin/admin-nav.tsx
    - package.json

key-decisions:
  - "AdminSidebarShell client wrapper holds TooltipProvider + SidebarProvider (shadcn sidebar tooltips require provider)"
  - "Nav items extracted to admin-nav-items.ts; admin-nav.tsx deprecated re-export only"

patterns-established:
  - "Admin layout: server requireAdmin + countUnreadForAdmin → AdminSidebarShell(unreadChatCount) → children card"
  - "AppSidebar: collapsible=icon, SidebarRail, SidebarMenuButton render=Link, min-h-11 touch targets"

requirements-completed: [FIX-01, ADM-01]

duration: 18min
completed: 2026-05-17
---

# Phase 8 Plan 01: Admin Sidebar Foundation Summary

**Dashboard drafts deep-link to DRAFT products; admin shell migrated to shadcn Sidebar with mobile Sheet trigger, desktop icon collapse, and TanStack Table primitives installed for orders Data Table.**

## Performance

- **Duration:** 18 min
- **Started:** 2026-05-17T16:35:00Z
- **Completed:** 2026-05-17T16:53:07Z
- **Tasks:** 3
- **Files modified:** 14

## Accomplishments

- StatCard «Чернетки» on `/admin` links to `/admin/tovary?status=DRAFT` (FIX-01)
- Installed shadcn `sidebar`, `table`, `pagination`, `tabs` and `@tanstack/react-table@^8.21.3`
- Replaced CSS grid admin shell with `SidebarProvider` + `AppSidebar` (icon collapse, `SidebarRail`, mobile `SidebarTrigger`)
- Preserved `requireAdmin()`, `countUnreadForAdmin()`, nav items, unread badge, «На сайт», and «Вийти» behavior

## Task Commits

1. **Task 1: FIX-01 — StatCard drafts href** - `4a85ad2` (fix)
2. **Task 2: Install shadcn + TanStack Table** - `716ac85` (chore)
3. **Task 3: AppSidebar + SidebarProvider layout** - `16356a5` (feat)

**Plan metadata:** pending (docs commit after this file)

## Files Created/Modified

- `src/app/(admin)/admin/page.tsx` - Drafts StatCard href with `status=DRAFT`
- `src/components/ui/sidebar.tsx` - shadcn Sidebar primitives
- `src/components/ui/pagination.tsx`, `table.tsx`, `tabs.tsx` - shared UI for plan 02+
- `src/components/admin/app-sidebar.tsx` - Migrated nav, badge, footer actions
- `src/components/admin/admin-sidebar-shell.tsx` - Client shell (TooltipProvider, SidebarProvider, mobile header)
- `src/app/(admin)/admin/layout.tsx` - Server auth + unread count; renders AdminSidebarShell
- `src/components/admin/admin-nav-items.ts` - Shared nav item definitions
- `src/components/admin/admin-nav.tsx` - Deprecated re-export of nav items

## Decisions Made

- Used `AdminSidebarShell` client component so `TooltipProvider` wraps collapsed-icon tooltips without touching root layout
- Extracted `adminNavItems` to a dedicated module to avoid duplicating nav config between deprecated `admin-nav` and `AppSidebar`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] AdminSidebarShell for TooltipProvider**
- **Found during:** Task 3
- **Issue:** shadcn `SidebarMenuButton` tooltips require `TooltipProvider`; server layout cannot host it alone
- **Fix:** Added `admin-sidebar-shell.tsx` wrapping `TooltipProvider` + `SidebarProvider` + mobile header
- **Files modified:** `src/components/admin/admin-sidebar-shell.tsx`, `src/app/(admin)/admin/layout.tsx`
- **Committed in:** `16356a5`

**2. [Rule 3 - Blocking] shadcn CLI interactive overwrite prompt**
- **Found during:** Task 2
- **Issue:** `npx shadcn add` stalled on `button.tsx` overwrite prompt
- **Fix:** Re-ran with `--overwrite` flag
- **Committed in:** `716ac85`

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 blocking)
**Impact on plan:** No scope creep; layout verify grep uses `AdminSidebarShell` instead of inline `SidebarProvider` in `layout.tsx` (equivalent behavior).

## Issues Encountered

- `npm run lint` exits non-zero due to pre-existing project errors (e.g. `e2e/global-setup.js`, chat/cart effects) and new shadcn `use-mobile.ts` hook pattern — not introduced by admin sidebar logic. `npm run build` passes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 08-02 can implement orders Data Table using installed `table`, `pagination`, and `@tanstack/react-table`
- Admin chrome ready for chat lifecycle tabs/actions in later plans

## Self-Check: PASSED

- FOUND: `src/components/admin/app-sidebar.tsx`
- FOUND: `src/components/ui/sidebar.tsx`
- FOUND: `src/app/(admin)/admin/layout.tsx`
- FOUND: commits `4a85ad2`, `716ac85`, `16356a5` via `git log`

---
*Phase: 08-admin-ux-chat-lifecycle*
*Completed: 2026-05-17*
