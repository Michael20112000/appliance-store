---
phase: 17-admin-chat-inbox-layout
plan: 02
subsystem: ui
tags: [nextjs, tailwind, admin-chat, scroll, overflow, message-list]

requires:
  - phase: 17-admin-chat-inbox-layout plan 01
    provides: flex-1 min-h-0 grid column wrappers from admin-chat-inbox
provides:
  - ConversationList full-height column shell with native list scroll
  - ChatThread overflow-hidden column with MessageList scroll props
affects:
  - 17-admin-chat-inbox-layout plan 03+ (manual verification checklist)

tech-stack:
  added: []
  patterns:
    - "Shared ConversationListColumn shell for loading/empty/populated branches"
    - "Admin thread: ScrollArea desktop, native overflow on mobile via useIsMobile"
    - "isPanelOpen gates MessageList auto-scroll when a conversation is selected"

key-files:
  created: []
  modified:
    - src/components/chat/conversation-list.tsx
    - src/components/chat/chat-thread.tsx

key-decisions:
  - "Reused @/hooks/use-mobile for admin thread useNativeScroll (D-17-12 discretion)"
  - "List scroll on inner listbox only; no ScrollArea in ConversationList (D-17-13)"

patterns-established:
  - "ConversationListColumn: flex min-h-0 flex-1 flex-col overflow-hidden border-r"
  - "Populated listbox: flex-1 min-h-0 overflow-y-auto with listbox ARIA"

requirements-completed: [ADM-CHAT-02]

duration: 18min
completed: 2026-05-19
---

# Phase 17 Plan 02: Internal Scroll in List & Thread Summary

**Admin chat list and thread columns scroll inside bounded panels; MessageList uses native scroll on mobile and auto-scroll when a conversation is open.**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-05-19T14:10:00Z
- **Completed:** 2026-05-19T14:28:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- `ConversationList` uses a shared `ConversationListColumn` shell for loading, empty, and populated states (D-17-07, D-17-14)
- Populated branch scrolls via inner listbox `flex-1 min-h-0 overflow-y-auto` without ScrollArea (D-17-13)
- Empty and loading states fill panel height with centered or skeleton content
- `ChatThread` root uses `overflow-hidden`; header and disconnect banner are `shrink-0`
- `MessageList` receives `useNativeScroll={isMobile}` and `isPanelOpen={Boolean(selectedConversationId)}`
- Context menu, lifecycle menu, composer placement, and mark-read effect unchanged (D-17-16)

## Task Commits

Each task was committed atomically:

1. **Task 1: ConversationList full-height column and native scroll** - `6fe4155` (feat)
2. **Task 2: ChatThread column flex and MessageList scroll wiring** - `9ea5533` (feat)

**Plan metadata:** `d7daa06` (docs: complete plan)

## Files Created/Modified

- `src/components/chat/conversation-list.tsx` - Shared column shell; native scroll listbox; full-height empty/loading
- `src/components/chat/chat-thread.tsx` - overflow-hidden column; mobile native scroll; isPanelOpen auto-scroll

## Decisions Made

- Imported `useIsMobile` from `@/hooks/use-mobile` instead of duplicating matchMedia hook from inbox
- No changes to `message-list.tsx` — existing flex/scroll classes sufficient

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Project-wide `npm run lint` reports pre-existing errors in unrelated files; changed chat files pass targeted ESLint

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Internal scroll leaves wired; manual desktop/mobile verification on `/admin/chaty` remains for phase checklist
- Plan 03 or phase verification can exercise long list + long thread scroll behavior

## Self-Check: PASSED

- FOUND: `src/components/chat/conversation-list.tsx`
- FOUND: `src/components/chat/chat-thread.tsx`
- FOUND: `6fe4155`
- FOUND: `9ea5533`

---
*Phase: 17-admin-chat-inbox-layout*
*Completed: 2026-05-19*
