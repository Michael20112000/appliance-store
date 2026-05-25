---
phase: 46-schema-foundation-guest-chat
plan: 03
subsystem: api-routes
tags: [typescript, next.js, api-routes, guest-chat, pusher, rest]

requires:
  - 46-02

provides:
  - "GET /api/chat/guest?token={uuid} — unauthenticated restore endpoint (D-02)"
  - "POST /api/chat/messages extended with guestToken guest path (D-08, T-46-09 mitigated)"
  - "POST /api/chat/pusher/auth extended with guestToken DB verification (D-04, T-46-07 mitigated)"
  - "All authenticated paths in messages and pusher/auth routes unchanged"

affects:
  - 46-04
  - src/components/chat/chat-provider.tsx

tech-stack:
  added: []
  patterns:
    - "Guest path added after schema validation in POST /api/chat/messages — no early 401 on body parse"
    - "Body parsed BEFORE session check in pusher/auth so guestToken available in guest branch"
    - "DB lookup verifies conversation.guestToken === guestToken before authorizeChannel (T-46-07)"
    - "Unauthenticated GET endpoint: guestToken is the credential, no session dependency"

key-files:
  created:
    - src/app/api/chat/guest/route.ts
  modified:
    - src/app/api/chat/messages/route.ts
    - src/app/api/chat/pusher/auth/route.ts

key-decisions:
  - "D-02 applied: GET /api/chat/guest restore endpoint reads token from query params, returns conversationId+messages+status"
  - "D-04 applied: guestToken verified against Conversation.guestToken in DB before Pusher channel authorization"
  - "D-08 applied: POST /api/chat/messages guest branch uses guestToken as both guestToken and senderId fields"
  - "T-46-07 mitigated: conversation.guestToken !== guestToken check → 403 FORBIDDEN in pusher/auth"
  - "T-46-09 mitigated: guest path only accessible when !session?.user — session always checked first"
  - "T-46-08 mitigated: rate limiting enforced via guestToken as senderId in enforceRateLimit at service layer"
  - "Body parse order in pusher/auth: parseAuthBody moved before session check to enable guestToken access in guest branch"

requirements-completed:
  - CHAT-01

duration: 7min
completed: 2026-05-25
---

# Phase 46 Plan 03: Guest REST API Surface

**Three API routes wired for guest access: new GET restore endpoint + extended POST paths for messages and Pusher auth using guestToken as credential**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-05-25T12:30:00Z
- **Completed:** 2026-05-25T12:37:00Z
- **Tasks:** 2/2 complete
- **Files created:** 1 (src/app/api/chat/guest/route.ts)
- **Files modified:** 2 (messages/route.ts, pusher/auth/route.ts)

## Accomplishments

### Task 1: GET /api/chat/guest Restore Endpoint

- Created `src/app/api/chat/guest/route.ts` — new file
- GET handler: extracts `token` from URL query params
- No token → 400 `TOKEN_REQUIRED`
- Unknown token → 404 `NOT_FOUND`
- Known token → 200 `{ conversationId, messages, status }`
- No session/auth imports — guestToken is the only credential (D-02)
- Error handling: `ChatServiceError` → 500 with error code, unknown errors rethrown

### Task 2: Extend messages/route.ts and pusher/auth/route.ts

**messages/route.ts changes:**
- Removed early 401 guard on session (was at lines 59-61)
- Guest branch added after schema validation: `if (!session?.user)`
- No guestToken in guest context → 401 UNAUTHORIZED (T-46-09)
- Valid guestToken → `sendMessage({ guestToken, senderId: guestToken, senderRole: "BUYER", ... })`
- Pusher trigger pattern reused identically from authenticated path
- Rate limiting: `enforceRateLimit(guestToken)` called via service layer (T-46-08)
- All authenticated paths (admin + buyer) unchanged after guest branch

**pusher/auth/route.ts changes:**
- `AuthBody` type extended with `guestToken?: string`
- `parseAuthBody()` updated: both URL-encoded and JSON branches now parse `guestToken`
- `parseAuthBody(request)` call moved BEFORE session check
- `socketId` and `channelName` extraction moved BEFORE session check
- Hard 401 replaced with guest fallback branch:
  - No guestToken → 401 UNAUTHORIZED
  - Invalid channel → 400 INVALID_CHANNEL
  - DB lookup: `prisma.conversation.findUnique({ where: { id: conversationId }, select: { guestToken: true } })`
  - Token mismatch → 403 FORBIDDEN (T-46-07 mitigated)
  - Token match → `authorizeChannel(socketId, channelName)` → 200 auth response
- `import { prisma } from "@/lib/db"` added
- Authenticated path (assertConversationAccess + authorizeChannel) unchanged

## Task Commits

1. **feat(46-03): create GET /api/chat/guest restore endpoint** — `87cff52`
2. **feat(46-03): extend messages and pusher/auth routes for guest paths** — `2e39a8f`

## Deviations from Plan

None — plan executed exactly as written.

## Threat Model Compliance

| Threat ID | Status | Evidence |
|-----------|--------|---------|
| T-46-06 | Accept | UUID token has 2^122 entropy; 404 returns no info about valid tokens |
| T-46-07 | Mitigated | `conversation.guestToken !== guestToken` → 403 in pusher/auth guest branch |
| T-46-08 | Mitigated | `enforceRateLimit(guestToken)` called in `sendMessage` at service layer |
| T-46-09 | Mitigated | Guest path only when `!session?.user`; session checked first; guestToken rejected if session present |

## Known Stubs

None — all endpoints are fully implemented with real DB queries.

## Threat Flags

None — all new endpoints are within the plan's threat model.

---

## Self-Check: PASSED

- `src/app/api/chat/guest/route.ts` — exists, exports `GET`, no session imports
- `src/app/api/chat/messages/route.ts` — guestToken in guest branch confirmed
- `src/app/api/chat/pusher/auth/route.ts` — guestToken in AuthBody, parseAuthBody, POST handler; prisma imported; FORBIDDEN 403 confirmed
- Commit `87cff52` — verified in git log
- Commit `2e39a8f` — verified in git log
- TypeScript: zero errors in api/chat files (`npx tsc --noEmit 2>&1 | grep "api/chat"` returns nothing)
- Tests: 301/301 pass (8 file-level failures are pre-existing ERR_MODULE_NOT_FOUND in worktree env, not caused by these changes)

---
*Phase: 46-schema-foundation-guest-chat*
*Completed: 2026-05-25*
