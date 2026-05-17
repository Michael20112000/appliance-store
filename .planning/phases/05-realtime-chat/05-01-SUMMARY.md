---
phase: 05-realtime-chat
plan: 01
subsystem: database
tags: [prisma, pusher, chat, zod, vitest]

requires:
  - phase: 03-cart-checkout
    provides: Prisma migration workflow, service layer patterns
provides:
  - Conversation and Message Prisma models with add_chat migration
  - chat.service domain layer (send, unread, read cursors, rate limit)
  - Pusher server/client singletons and env schema
  - sendMessageSchema Zod validator
affects: [05-02, 05-03, 05-04, 05-05]

tech-stack:
  added: [pusher@5.3.3, pusher-js@8.5.0]
  patterns:
    - DB-first send in transaction; Pusher trigger deferred to API routes (05-02)
    - Prisma column compare for admin unread count
    - getOrCreateConversation P2002 race handling (cart pattern)

key-files:
  created:
    - prisma/migrations/20260517110649_add_chat/migration.sql
    - src/server/services/chat.service.ts
    - src/server/services/chat.service.test.ts
    - src/server/validators/chat.ts
    - src/server/validators/chat.test.ts
    - src/types/chat.ts
    - src/lib/pusher-server.ts
    - src/lib/pusher-client.ts
  modified:
    - prisma/schema.prisma
    - package.json
    - src/lib/env.ts
    - src/lib/env.test.ts

key-decisions:
  - "One Conversation per buyer (userId @unique); product context stored once when null"
  - "Rate limit 20 messages / 60s per senderId via Prisma count (no Redis)"
  - "sendMessage does not call Pusher — routes trigger after DB commit in 05-02"

patterns-established:
  - "Pattern: chat.service mirrors cart getOrCreate + admin list sort by lastMessageAt"
  - "Pattern: PusherNotConfiguredError mirrors CloudinaryNotConfiguredError"

requirements-completed: [CHAT-03, CHAT-02]

duration: 12min
completed: 2026-05-17
---

# Phase 05 Plan 01: Chat Data Layer Summary

**Prisma Conversation/Message with migrated schema, tested chat.service (DB-first, 20/min rate limit), and Pusher singletons with optional env keys**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-05-17T11:06:00Z
- **Completed:** 2026-05-17T11:11:00Z
- **Tasks:** 3
- **Files modified:** 12

## Accomplishments

- Applied `add_chat` migration on dev Neon DB (`Conversation`, `Message`, `MessageSender`)
- Installed official Pusher SDKs at pinned versions
- Domain service: get-or-create thread, send with denormalized preview, admin unread count, read cursors, access control
- Validators and lazy Pusher server/client modules ready for 05-02 API routes

## Task Commits

1. **Task 1: Install Pusher + Prisma chat schema + migrate** - `f2c4bd4` (feat)
2. **Task 2: chat types, validators, env + Pusher singletons** - `15ac807` (feat)
3. **Task 3: chat.service + unit tests** - `eb9ba16` (test), `5042bd1` (feat)

## Files Created/Modified

- `prisma/schema.prisma` - MessageSender enum, Conversation, Message models
- `prisma/migrations/20260517110649_add_chat/migration.sql` - Applied migration SQL
- `src/server/services/chat.service.ts` - Core chat domain API
- `src/lib/pusher-server.ts` - Server singleton + `conversationChannel()`
- `src/lib/pusher-client.ts` - Client singleton with `/api/chat/pusher/auth`
- `src/server/validators/chat.ts` - `sendMessageSchema` (max 2000 chars)
- `src/types/chat.ts` - MessageDto, ConversationSummaryDto

## Decisions Made

- Followed D-05-14: no Pusher import in service layer; routes own trigger after commit
- Unread for admin uses Prisma `lastMessageAt > adminLastReadAt` field comparison
- Production/CI: apply migration with `npx prisma migrate deploy` (non-TTY)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] getOrCreateConversation returned undefined when re-fetching existing row**
- **Found during:** Task 3 (unit tests)
- **Issue:** Existing conversation path always called `findUniqueOrThrow` without mock, breaking tests and redundant DB round-trip
- **Fix:** Return existing row directly unless product context needs backfill
- **Files modified:** `src/server/services/chat.service.ts`
- **Committed in:** `5042bd1`

**2. [Rule 1 - Bug] Vitest mock isolation for assertConversationAccess**
- **Found during:** Task 3 (unit tests)
- **Issue:** `clearAllMocks` left stale `findUnique` implementations across tests
- **Fix:** Use `resetAllMocks` in sensitive describes; stable mock return values
- **Files modified:** `src/server/services/chat.service.test.ts`
- **Committed in:** `5042bd1`

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Test-driven fixes only; no scope change.

## Issues Encountered

None blocking. Pusher env vars remain optional until dashboard app is configured (expected per RESEARCH).

## User Setup Required

Add to `.env` when enabling realtime in 05-02+:

- `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`
- `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`

Create a Pusher Channels app at https://pusher.com and use the same key/cluster for server and public client vars.

## Next Phase Readiness

- Ready for **05-02**: `POST /api/chat/messages`, `POST /api/chat/pusher/auth` wiring `chat.service` + `getPusherServer().trigger`
- Pusher credentials required before live realtime verification; DB layer works without Pusher

## Self-Check: PASSED

- FOUND: prisma/migrations/20260517110649_add_chat/migration.sql
- FOUND: src/server/services/chat.service.ts
- FOUND: src/lib/pusher-server.ts
- FOUND: f2c4bd4, 15ac807, eb9ba16, 5042bd1
- Tests: 20 passed (chat.service, validators, env)

---
*Phase: 05-realtime-chat*
*Completed: 2026-05-17*
