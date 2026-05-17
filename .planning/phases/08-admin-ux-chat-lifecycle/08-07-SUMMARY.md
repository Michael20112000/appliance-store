---
phase: 08-admin-ux-chat-lifecycle
plan: 07
subsystem: ui
tags: [nextjs, chat, buyer, api, vitest]

requires:
  - phase: 08-05
    provides: CHAT_ARCHIVED guard in sendMessage
  - phase: 08-06
    provides: admin archive/delete UX
provides:
  - Buyer read-only archived chat with UA banner
  - GET messages returns conversation status; POST maps CHAT_ARCHIVED to 403
  - Phase 8 manual operator checklist (08-MANUAL-CHECKLIST.md)
affects: []

tech-stack:
  added: []
  patterns:
    - "canSend derived from conversationStatus !== ARCHIVED in ChatProvider"
    - "Defense in depth: disabled composer + API 403 CHAT_ARCHIVED"

key-files:
  created:
    - src/components/chat/archived-chat-banner.tsx
    - .planning/phases/08-admin-ux-chat-lifecycle/08-MANUAL-CHECKLIST.md
  modified:
    - src/components/chat/chat-provider.tsx
    - src/components/chat/chat-provider-gate.tsx
    - src/components/chat/chat-panel.tsx
    - src/components/chat/chat-composer.tsx
    - src/app/api/chat/messages/route.ts
    - src/app/api/chat/messages/route.test.ts
    - src/server/services/chat.service.ts

key-decisions:
  - "D-08-23: buyer ARCHIVED read-only + banner above composer"
  - "D-08-24: sendMessage/API reject ARCHIVED with 403 + UA message"
  - "D-08-25: reuse existing conversation id (no new row on open)"
  - "D-08-27: manual checklist for lifecycle; no archive/delete e2e"

patterns-established:
  - "GET /api/chat/messages returns { messages, status } after access check"
  - "ArchivedChatBanner role=status per UI-SPEC copy"

requirements-completed: [CHAT-05, CHAT-06]

duration: 25min
completed: 2026-05-17
---

# Phase 08 Plan 07: Buyer Archived Chat & Phase Verification Summary

**Buyer sees archived thread history with disabled composer and store-closed banner; API returns 403 CHAT_ARCHIVED; Vitest green and manual Phase 8 checklist added**

## Performance

- **Duration:** 25 min
- **Started:** 2026-05-17T17:05:35Z
- **Completed:** 2026-05-17T17:10:00Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- `ChatProvider` tracks `conversationStatus`; `canSend` false when `ARCHIVED`
- `ArchivedChatBanner` with UI-SPEC Ukrainian copy above disabled `ChatComposer`
- `POST /api/chat/messages` maps `CHAT_ARCHIVED` to 403 with service message; Vitest covered
- `08-MANUAL-CHECKLIST.md` covers all six ROADMAP Phase 8 criteria plus buyer read-only

## Task Commits

1. **Task 1: Buyer archived read-only UI (D-08-23, D-08-25)** - `ffc8f8e` (feat)
2. **Task 2: API route maps CHAT_ARCHIVED to 403 (D-08-24)** - `2b7009e` (test)
3. **Task 3: Vitest sweep + manual checklist (D-08-26, D-08-27)** - `36a65e9` (docs)

## Files Created/Modified

- `src/components/chat/archived-chat-banner.tsx` - Buyer archived state banner
- `src/components/chat/chat-provider.tsx` - Status, canSend, fetch status from API
- `src/components/chat/chat-provider-gate.tsx` - Initial status from server conversation
- `src/components/chat/chat-panel.tsx` - Renders banner when ARCHIVED
- `src/components/chat/chat-composer.tsx` - Disabled input, CHAT_ARCHIVED error mapping
- `src/app/api/chat/messages/route.ts` - GET status payload; POST 403 for CHAT_ARCHIVED
- `src/app/api/chat/messages/route.test.ts` - CHAT_ARCHIVED and GET status tests
- `src/server/services/chat.service.ts` - `assertConversationAccess` returns conversation
- `.planning/phases/08-admin-ux-chat-lifecycle/08-MANUAL-CHECKLIST.md` - Operator gate

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Task 1 commit missing route.ts**
- **Found during:** Task 1 commit
- **Issue:** First commit omitted API changes referenced in commit message
- **Fix:** Amended `ffc8f8e` to include `route.ts` GET status + POST mapping
- **Files modified:** `src/app/api/chat/messages/route.ts`

## Verification

- `npm test` — 143 passed (1 todo)
- `npm run build` — success
- Phase 8 Vitest sweep — 59 passed (4 files)
- `e2e/admin-chat.spec.ts` — unchanged (nav regression not observed)

## Self-Check: PASSED

- FOUND: src/components/chat/archived-chat-banner.tsx
- FOUND: .planning/phases/08-admin-ux-chat-lifecycle/08-MANUAL-CHECKLIST.md
- FOUND: commit ffc8f8e
- FOUND: commit 2b7009e
- FOUND: commit 36a65e9
