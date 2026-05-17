---
phase: 08-admin-ux-chat-lifecycle
plan: 06
subsystem: ui
tags: [nextjs, chat, admin, tabs, alert-dialog, server-actions]

requires:
  - phase: 08-05
    provides: ConversationStatus, admin chat lifecycle server actions
provides:
  - Admin chat Active/Archive tabs via view search param
  - Thread lifecycle dropdown and delete AlertDialog (UA copy)
  - URL sync for conversationId and router.refresh after mutations
affects:
  - 08-07

tech-stack:
  added: []
  patterns:
    - "view=active|archive on /admin/chaty with server-filtered lists"
    - "Link-styled shadcn tabs preserving conversationId"
    - "AdminChatProvider key={view} remount on tab switch"

key-files:
  created:
    - src/lib/admin-chat-url.ts
  modified:
    - src/app/(admin)/admin/chaty/page.tsx
    - src/components/chat/admin-chat-inbox.tsx
    - src/components/chat/admin-chat-provider.tsx
    - src/components/chat/conversation-list.tsx
    - src/components/chat/chat-thread.tsx
    - e2e/admin-chat.spec.ts

key-decisions:
  - "Tabs use URL links (D-08-18), not client-only state"
  - "Composer hidden when conversation ARCHIVED (plan Pitfall 4)"
  - "Provider remounts on view change via key={view}"

patterns-established:
  - "buildAdminChatHref(view, conversationId) centralizes admin chat URLs"
  - "clearSelectionAndRefresh after archive/delete clears URL selection"

requirements-completed: [CHAT-05, CHAT-06]

duration: 28min
completed: 2026-05-17
---

# Phase 08 Plan 06: Admin Chat Lifecycle UI Summary

**Active/Archive admin inbox tabs, thread lifecycle menu with Ukrainian delete confirmation, and list refresh after archive/unarchive/delete**

## Performance

- **Duration:** 28 min
- **Started:** 2026-05-17T17:00:00Z
- **Completed:** 2026-05-17T17:28:00Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- `/admin/chaty` reads `view=active|archive` and fetches OPEN or ARCHIVED conversations server-side
- Inbox shows **Активні** / **Архів** tabs with view-specific empty copy and unread highlight only on active list
- Thread header exposes archive, unarchive, and permanent delete (AlertDialog) with toasts and selection clear

## Task Commits

1. **Task 1: chaty page view=active|archive + filtered fetch** - `f9ebfd0` (feat)
2. **Task 2: Admin tabs + inbox wiring** - `744c515` (feat)
3. **Task 3: Thread lifecycle menu + delete AlertDialog** - `4b89944` (feat)

## Files Created/Modified

- `src/lib/admin-chat-url.ts` - Builds `/admin/chaty` URLs with view and optional conversationId
- `src/app/(admin)/admin/chaty/page.tsx` - Maps view param to `listConversationsForAdmin({ status })`
- `src/components/chat/admin-chat-inbox.tsx` - Tab links, view-specific empty states, validated initial selection
- `src/components/chat/admin-chat-provider.tsx` - view, URL selection sync, clearSelectionAndRefresh
- `src/components/chat/conversation-list.tsx` - Optional unread highlight and empty copy props
- `src/components/chat/chat-thread.tsx` - Dropdown lifecycle actions, delete dialog, archived composer hide
- `e2e/admin-chat.spec.ts` - Asserts Active/Archive tabs visible

## Deviations from Plan

None - plan executed as written.

## Self-Check: PASSED

- FOUND: src/lib/admin-chat-url.ts
- FOUND: src/app/(admin)/admin/chaty/page.tsx
- FOUND: src/components/chat/admin-chat-inbox.tsx
- FOUND: src/components/chat/chat-thread.tsx
- FOUND: commit f9ebfd0
- FOUND: commit 744c515
- FOUND: commit 4b89944
