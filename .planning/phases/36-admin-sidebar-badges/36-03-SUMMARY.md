---
phase: 36-admin-sidebar-badges
plan: 03
subsystem: admin-ui
tags: [admin, sidebar, badges, react, nextjs, props-chain]
---

# Plan 36-03 Summary — Wire sidebar badge pipeline

## What Was Built

Wired the complete badge display pipeline across three files:

- **`src/app/(admin)/admin/layout.tsx`** — replaced `countUnreadForAdmin()` with `getAdminSidebarCounts()`, passes `badgeCounts: AdminSidebarBadgeCounts` to `AdminSidebarShell` (single parallel fetch, no N+1)
- **`src/components/admin/admin-sidebar-shell.tsx`** — updated `AdminSidebarShellProps` type from `unreadChatCount: number` to `badgeCounts: AdminSidebarBadgeCounts`; bridges prop to `AppSidebar`; zero `unreadChatCount` references remain
- **`src/components/admin/app-sidebar.tsx`** — replaced chat-only badge logic with a `badgeConfig` map for all five nav items; renders `SidebarMenuBadge` conditionally per item with correct styling

## Key Decisions

- `badgeConfig` record keyed by nav href — avoids per-item if/else and makes adding future badges a single line
- Categories/products: `bg-muted text-muted-foreground` (grey, D-04 — informational count, not urgent)
- Orders/chats/callbacks: `bg-destructive text-destructive-foreground` (red — attention required)
- Hidden at count=0 (D-02); capped at "99+" for counts > 99
- Per-item Ukrainian `aria-label` strings when badge is visible

## Verification

- TypeScript: clean across all three modified files (`npx tsc --noEmit`)
- Unit tests: 7/7 still green (`npx vitest run src/server/services/admin-sidebar.service.test.ts`)
- Human verify: **approved** — badges visible in browser with correct grey/red styling per nav item

## Self-Check: PASSED

## Files Modified

- `src/app/(admin)/admin/layout.tsx`
- `src/components/admin/admin-sidebar-shell.tsx`
- `src/components/admin/app-sidebar.tsx`

## Commits

- `7473830` refactor(36-03): refactor layout.tsx and AdminSidebarShell props chain
- `326a8e4` feat(36-03): render five badge-eligible nav items in AppSidebar
