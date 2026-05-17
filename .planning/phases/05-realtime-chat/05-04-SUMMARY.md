---
phase: 05-realtime-chat
plan: 04
subsystem: ui
tags: [nextjs, pusher, chat, admin, shadcn]

requires:
  - phase: 05-realtime-chat
    plan: 02
    provides: messages API, Pusher auth
  - phase: 05-realtime-chat
    plan: 03
    provides: MessageList, MessageBubble, ChatComposer patterns
provides:
  - Admin /admin/chaty split inbox with conversation list
  - Enabled Чати nav with server-side unread badge
  - Admin reply as STORE via shared composer patterns
  - markAdminReadAction with layout revalidation for badge
affects: [05-05]

tech-stack:
  added: []
  patterns:
    - AdminChatProvider sole Pusher subscribe site for admin (D-05-16)
    - RSC listConversationsForAdmin + client thread state
    - markAdminReadAction revalidates /admin/chaty and layout

key-files:
  created:
    - src/app/(admin)/admin/chaty/page.tsx
    - src/components/chat/admin-chat-inbox.tsx
    - src/components/chat/admin-chat-provider.tsx
    - src/components/chat/conversation-list.tsx
    - src/components/chat/chat-thread.tsx
  modified:
    - src/app/(admin)/admin/layout.tsx
    - src/components/admin/admin-nav.tsx
    - src/server/actions/chat.actions.ts
    - src/components/chat/message-bubble.tsx
    - src/components/chat/message-list.tsx
    - src/components/chat/chat-composer.tsx

key-decisions:
  - "D-05-10: Чати nav enabled at /admin/chaty"
  - "D-05-12: Unread badge from countUnreadForAdmin in admin layout RSC"
  - "D-05-16: AdminChatProvider owns Pusher lifecycle, not ChatThread"
  - "D-05-20: Buyer name on buyer bubbles in admin thread; STORE as Магазин"

patterns-established:
  - "Pattern: Admin inbox mobile toggles list vs thread via selectedConversationId"
  - "Pattern: AdminChatComposer POST with conversationId for STORE role"

requirements-completed: [CHAT-04, ADM-05]

duration: 35min
completed: 2026-05-17
---

# Phase 05 Plan 04: Admin Chat Inbox Summary

**Admin split inbox at /admin/chaty — enabled Чати nav with unread badge, Pusher live thread, STORE replies**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-05-17T14:20:00Z
- **Completed:** 2026-05-17T14:55:00Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments

- Admin layout passes `countUnreadForAdmin()` to nav; Чати link replaces «Незабаром» with badge cap 99+
- `/admin/chaty` RSC page lists all buyer conversations sorted by `lastMessageAt`
- Desktop 320px list + thread; mobile list ↔ thread with «До списку»
- `AdminChatProvider` subscribes to `private-conversation-{id}`; `ChatThread` marks read and sends admin replies

## Task Commits

1. **Task 1: Admin layout unread prop + enable Чати nav** - `9fc96a3` (feat)
2. **Task 2: /admin/chaty page + conversation list** - `c978151` (feat)
3. **Task 3: ChatThread admin reply + mark read** - `5f70be0` (feat)

## Files Created/Modified

- `src/app/(admin)/admin/chaty/page.tsx` - RSC inbox entry, `listConversationsForAdmin`
- `src/components/chat/admin-chat-provider.tsx` - Pusher + messages context for admin
- `src/components/chat/admin-chat-inbox.tsx` - Split layout orchestrator
- `src/components/chat/conversation-list.tsx` - Buyer rows with unread styling
- `src/components/chat/chat-thread.tsx` - Thread header, mark read, message list
- `src/components/chat/chat-composer.tsx` - `AdminChatComposer` for STORE POST
- `src/components/admin/admin-nav.tsx` - Enabled Чати + unread badge
- `src/server/actions/chat.actions.ts` - `markAdminReadAction`

## Decisions Made

- Unread badge is server-only (no client polling) per RESEARCH pitfall 4
- `markedReadRef` avoids duplicate mark-read calls on strict mode re-mount
- Extended `MessageBubble` / `MessageList` with optional buyer label for admin view

## Deviations from Plan

None — plan executed as written.

## Issues Encountered

None blocking. `npm run build` and `chat.service.test.ts` passed after implementation.

## User Setup Required

Same Pusher env as buyer widget (`NEXT_PUBLIC_PUSHER_*`) for live admin thread updates.

## Next Phase Readiness

- Ready for **05-05**: E2E admin chat + RBAC on `/admin/chaty`

## Self-Check: PASSED

- FOUND: src/app/(admin)/admin/chaty/page.tsx
- FOUND: src/components/chat/admin-chat-inbox.tsx
- FOUND: src/components/chat/admin-chat-provider.tsx
- FOUND: src/components/chat/chat-thread.tsx
- FOUND: 9fc96a3, c978151, 5f70be0

---
*Phase: 05-realtime-chat*
*Completed: 2026-05-17*
