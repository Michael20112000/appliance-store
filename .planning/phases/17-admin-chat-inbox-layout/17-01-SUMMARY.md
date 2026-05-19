---
phase: 17-admin-chat-inbox-layout
plan: 01
subsystem: ui
tags: [nextjs, tailwind, flex-layout, admin-chat, min-h-0]

requires: []
provides:
  - Admin shell min-h-0 flex height chain from main to page children
  - AdminChatInbox page flex-1 grid without calc(100dvh) min-height
  - Column wrapper shells for list/thread (scroll foundation for plan 02)
affects:
  - 17-admin-chat-inbox-layout plan 02 (column scroll leaves)
  - admin routes using AdminSidebarShell

tech-stack:
  added: []
  patterns:
    - "flex min-h-0 flex-1 flex-col chain for bounded viewport scroll"
    - "shrink-0 page chrome (H1 + tabs) above flex-1 overflow-hidden grid"

key-files:
  created: []
  modified:
    - src/components/admin/admin-sidebar-shell.tsx
    - src/components/chat/admin-chat-inbox.tsx

key-decisions:
  - "Shell propagates min-h-0 only on structural ancestors; children opt into flex-1 (AdminChatInbox)"
  - "gap-6 replaces space-y-6 for equivalent spacing per D-17-03"

patterns-established:
  - "Admin page chrome: shrink-0 H1 + tabs, flex-1 min-h-0 overflow-hidden grid"
  - "Grid columns wrapped in flex min-h-0 flex-col overflow-hidden shells"

requirements-completed: [ADM-CHAT-02]

duration: 25min
completed: 2026-05-19
---

# Phase 17 Plan 01: Admin Shell & Inbox Height Chain Summary

**Admin shell and `/admin/chaty` establish a flex-1/min-h-0 viewport chain so the inbox grid fills space under fixed H1 + tabs without calc(100dvh) hacks.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-05-19T12:36:00Z
- **Completed:** 2026-05-19T13:01:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- `AdminSidebarShell` main and inner card use `min-h-0` flex column; removed `min-h-[calc(100dvh-3rem)]`
- `AdminChatInbox` page root uses `flex min-h-0 flex-1 flex-col gap-6` with shrink-0 H1 and tabs
- Inbox grid uses `flex-1 min-h-0 overflow-hidden` and `md:grid-cols-[320px_1fr]`
- List and thread columns wrapped in `min-h-0 flex-col overflow-hidden` containers
- Mobile split logic (`showList` / `showThread`) unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: AdminSidebarShell flex height chain** - `54ff2db` (feat)
2. **Task 2: AdminChatInbox page flex and grid column wrappers** - `f64dd71` (feat)

**Plan metadata:** `362a277` (docs: complete plan)

## Files Created/Modified

- `src/components/admin/admin-sidebar-shell.tsx` - `min-h-0` on main + inner card; removed calc min-height
- `src/components/chat/admin-chat-inbox.tsx` - flex page layout, column wrappers, calc grid min-height removed

## Decisions Made

- Followed D-17-04–06 and D-17-14: structural shell only; inbox page opts into `flex-1`
- Page and column wrappers use plain `div` only (no framer-motion)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Agent branch namespace for commits**
- **Found during:** Task 1 pre-commit
- **Issue:** Executor started on `main`; commit guard requires `worktree-agent-*` branch
- **Fix:** Created `worktree-agent-17-01-admin-chat-layout` before first commit
- **Files modified:** none (git only)
- **Verification:** HEAD assertion passed; commits on agent branch

None - layout changes match plan after branch setup.

## Issues Encountered

- Initial edit introduced mismatched `motion.div` tags in inbox file — corrected to plain `div` before commit (no runtime impact)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Height chain from shell → page → grid is in place for plan 02 (ConversationList / ChatThread internal scroll leaves)
- Manual scroll verification (D-17-15) deferred to plan 02 + phase checklist

## Self-Check: PASSED

- FOUND: `src/components/admin/admin-sidebar-shell.tsx`
- FOUND: `src/components/chat/admin-chat-inbox.tsx`
- FOUND: `54ff2db`
- FOUND: `f64dd71`
- FOUND: `362a277`

---
*Phase: 17-admin-chat-inbox-layout*
*Completed: 2026-05-19*
