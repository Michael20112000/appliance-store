---
phase: 46-schema-foundation-guest-chat
plan: 02
subsystem: service-layer
tags: [typescript, zod, prisma, chat, guest-chat, tdd, service]

requires:
  - 46-01

provides:
  - "ConversationSummaryDto.userId typed as string | null (nullable after schema migration)"
  - "sendMessageSchema extended with optional guestToken UUID field (T-46-03 mitigated)"
  - "getGuestConversation(guestToken) exported — Prisma findUnique by guestToken"
  - "getOrCreateGuestConversation(guestToken, context?) exported — P2002 race guard included"
  - "D-07: getOrCreateConversation uses findFirst({ userId, isActive: true })"
  - "D-07: getConversationForBuyer uses findFirst({ userId, isActive: true })"
  - "D-08: resolveConversationForSend has guestToken branch before userId check"
  - "CHAT-03: listConversationsForAdmin filters null userIds, uses Гість fallback"
  - "assertConversationAccess return type userId: string | null; null userId blocks buyer (T-46-04 mitigated)"
  - "GUEST_TOKEN_INVALID and GUEST_NOT_FOUND error constants exported"
  - "All 33 tests pass (6 validator + 27 service)"

affects:
  - 46-03
  - 46-04
  - 46-05
  - src/app/api/chat/messages/route.ts
  - src/app/api/chat/guest/route.ts

tech-stack:
  added: []
  patterns:
    - "D-07: findFirst({ userId, isActive: true }) replaces findUnique({ userId }) — mirrors getOrCreateGuestConversation pattern"
    - "P2002 race guard in getOrCreateGuestConversation reuses isUniqueViolation from getOrCreateConversation"
    - "guestToken branch added before userId check in resolveConversationForSend (D-08)"
    - "TDD RED→GREEN cycle for both tasks"

key-files:
  modified:
    - src/types/chat.ts
    - src/server/validators/chat.ts
    - src/server/validators/chat.test.ts
    - src/server/services/chat.service.ts
    - src/server/services/chat.service.test.ts

key-decisions:
  - "D-07 applied: findFirst({ userId, isActive: true }) for all userId-based conversation lookups — supports multiple conversations per user lifecycle"
  - "D-08 applied: guestToken branch resolves before userId check in resolveConversationForSend"
  - "CHAT-03: Гість used as buyerName fallback when userId is null in admin list view"
  - "T-46-04 mitigated: !conversation.userId check added to assertConversationAccess — null userId always FORBIDDEN for non-admin buyers"
  - "sendMessage test mock updated: findUnique → findFirst after D-07 change to getOrCreateConversation (Rule 1 auto-fix)"

requirements-completed:
  - CHAT-01
  - CHAT-03

duration: 8min
completed: 2026-05-25
---

# Phase 46 Plan 02: Data Layer — Types, Validators, Service Functions

**TypeScript types, Zod validators, and all service functions updated to support guest conversations — building blocks for Plan 46-03 API routes**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-25T09:15:44Z
- **Completed:** 2026-05-25T09:23:30Z
- **Tasks:** 2/2 complete
- **Files modified:** 5

## Accomplishments

### Task 1: Types and Validators (TDD)

- `src/types/chat.ts`: `ConversationSummaryDto.userId` changed from `string` to `string | null`
- `src/server/validators/chat.ts`: `guestToken: z.string().uuid("Невірний гостьовий токен").optional()` added to `sendMessageSchema` after `productId` field
- `src/server/validators/chat.test.ts`: 2 new test cases added — accepts valid UUID guestToken, rejects non-UUID guestToken
- All 6 validator tests pass

### Task 2: Service Functions (TDD)

- Added `GUEST_TOKEN_INVALID` and `GUEST_NOT_FOUND` error constants
- D-07: `getOrCreateConversation` now uses `findFirst({ userId, isActive: true })` and `findFirstOrThrow` in the P2002 catch
- D-07: `getConversationForBuyer` now uses `findFirst({ userId, isActive: true })`
- New exported function `getGuestConversation(guestToken)` — `findUnique({ where: { guestToken } })`
- New exported function `getOrCreateGuestConversation(guestToken, context?)` — upsert with P2002 guard
- D-08: `resolveConversationForSend` adds `if (input.guestToken)` branch before the userId check
- Local `SendMessageInput` type extended with `guestToken?: string`
- CHAT-03: `listConversationsForAdmin` now filters null userIds before `user.findMany`, uses `Гість` as fallback name
- `assertConversationAccess` return type updated to `userId: string | null`; ownership check updated: `!conversation.userId || conversation.userId !== session.user.id` (T-46-04 mitigated)
- All 27 service tests pass (no regressions in existing tests)

## Task Commits

Each task committed atomically with TDD RED → GREEN sequence:

1. **test(46-02): add failing tests for guestToken UUID validation** - `6bf1444` (RED)
2. **feat(46-02): update ConversationSummaryDto and sendMessageSchema** - `5472278` (GREEN)
3. **test(46-02): add failing tests for guest service functions and D-07/CHAT-03 fixes** - `0767328` (RED)
4. **feat(46-02): update chat.service.ts with guest functions and D-07/CHAT-03 fixes** - `8d93fc3` (GREEN)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] sendMessage test mock used findUnique after D-07 changed getOrCreateConversation to findFirst**
- **Found during:** Task 2 GREEN phase — `sendMessage > creates message and returns MessageDto` test failed
- **Issue:** The test mocked `prisma.conversation.findUnique` but `getOrCreateConversation` (called via `resolveConversationForSend`) now uses `findFirst`. The mock returned `undefined`, causing `assertConversationOpen` to fail with `Cannot read properties of undefined (reading 'status')`.
- **Fix:** Updated `vi.mocked(prisma.conversation.findUnique)` to `vi.mocked(prisma.conversation.findFirst)` in the `sendMessage` test
- **Files modified:** `src/server/services/chat.service.test.ts` (inline fix within GREEN commit)
- **Commit:** `8d93fc3`

## Threat Model Compliance

| Threat ID | Status | Evidence |
|-----------|--------|---------|
| T-46-03 | Mitigated | `z.string().uuid()` in sendMessageSchema rejects non-UUID tokens |
| T-46-04 | Mitigated | `!conversation.userId \|\| conversation.userId !== session.user.id` in assertConversationAccess |
| T-46-05 | Mitigated | `isUniqueViolation` P2002 guard in `getOrCreateGuestConversation` |

## Threat Flags

None — no new security-relevant surface beyond what is in the plan's threat model.

## Known Stubs

None — all functions are fully implemented with real Prisma queries.

---

## Self-Check: PASSED

- `src/types/chat.ts` — exists, `userId: string | null` confirmed
- `src/server/validators/chat.ts` — exists, `guestToken` field with `.uuid(` confirmed
- `src/server/validators/chat.test.ts` — exists, 6 tests pass
- `src/server/services/chat.service.ts` — exists, all exports confirmed
- `src/server/services/chat.service.test.ts` — exists, 27 tests pass
- Commits `6bf1444`, `5472278`, `0767328`, `8d93fc3` verified in git log

---
*Phase: 46-schema-foundation-guest-chat*
*Completed: 2026-05-25*
