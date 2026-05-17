---
phase: 05-realtime-chat
plan: 02
subsystem: api
tags: [nextjs, pusher, chat, route-handlers, vitest, auth]

requires:
  - phase: 05-realtime-chat
    plan: 01
    provides: chat.service, Pusher singletons, sendMessageSchema
provides:
  - assertBuyerApi JSON guard for chat API routes
  - POST/GET /api/chat/messages with DB-first Pusher trigger
  - POST /api/chat/pusher/auth with IDOR-safe channel authorization
  - Route unit tests (19 cases) without live Pusher network
affects: [05-03, 05-04, 05-05]

tech-stack:
  added: []
  patterns:
    - upload/sign-style route error mapping (401/403/404/429/503)
    - Pusher trigger after sendMessage success only; payload omits senderId
    - Admin STORE / buyer BUYER senderRole set server-side only

key-files:
  created:
    - src/app/api/chat/messages/route.ts
    - src/app/api/chat/messages/route.test.ts
    - src/app/api/chat/pusher/auth/route.ts
    - src/app/api/chat/pusher/auth/route.test.ts
  modified:
    - src/lib/permissions.ts

key-decisions:
  - "D-05-14: trigger message:new only after sendMessage returns (DB committed)"
  - "D-05-15: pusher/auth calls assertConversationAccess before authorizeChannel"
  - "D-05-18: route maps ChatRateLimitError to 429 with UA copy per product spec"
  - "D-05-20: ignore client senderRole; admin requires conversationId in body"

patterns-established:
  - "Pattern: ChatSession type exported from permissions for route + service alignment"
  - "Pattern: pusher/auth accepts JSON and x-www-form-urlencoded (pusher-js)"

requirements-completed: [CHAT-02, CHAT-03, AUTH-03]

duration: 18min
completed: 2026-05-17
---

# Phase 05 Plan 02: Chat API Routes Summary

**assertBuyerApi plus POST/GET messages and Pusher channel auth — DB-first send, secured private channels, 19 route tests**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-05-17T14:12:00Z
- **Completed:** 2026-05-17T14:15:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- `assertBuyerApi()` mirrors `assertAdminApi` with JSON 401 (no redirect)
- Messages API: buyer/admin POST, GET history (limit 50), rate-limit 429 UA copy
- Pusher auth: session + `assertConversationAccess` before `authorizeChannel`
- TDD: RED test commits then GREEN feat commits for both routes

## Task Commits

1. **Task 1: assertBuyerApi + permissions tests** - `7462cec` (feat)
2. **Task 2: POST /api/chat/pusher/auth** - `b8b688e` (test), `3e3cc9f` (feat)
3. **Task 3: POST/GET /api/chat/messages + DB-first trigger** - `055e3e0` (test), `74bffdc` (feat)

## Files Created/Modified

- `src/lib/permissions.ts` - `assertBuyerApi`, `ChatSession` type
- `src/app/api/chat/pusher/auth/route.ts` - Private channel authorization
- `src/app/api/chat/pusher/auth/route.test.ts` - Auth route unit tests (8)
- `src/app/api/chat/messages/route.ts` - Send/history + Pusher trigger
- `src/app/api/chat/messages/route.test.ts` - Messages route unit tests (11)

## Decisions Made

- Pusher event payload uses id, conversationId, body, senderRole, createdAt (no senderId on wire)
- Admin POST without `conversationId` returns `CONVERSATION_ID_REQUIRED` (400)
- Guest blocked with 401 on both messages and pusher auth (AUTH-03)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

Pusher env vars from 05-01 still required for live trigger/auth (503 until configured). Unit tests mock Pusher.

## Next Phase Readiness

- Ready for **05-03**: storefront `ChatProvider`, FAB, composer calling `POST /api/chat/messages`
- Ready for **05-04**: admin inbox using same API + Pusher subscribe

## Self-Check: PASSED

- FOUND: src/lib/permissions.ts
- FOUND: src/app/api/chat/messages/route.ts
- FOUND: src/app/api/chat/pusher/auth/route.ts
- FOUND: 7462cec, b8b688e, 3e3cc9f, 055e3e0, 74bffdc
- Tests: 19 passed (messages + pusher auth routes)

---
*Phase: 05-realtime-chat*
*Completed: 2026-05-17*
