---
phase: 47-chat-lifecycle-control
plan: "03"
subsystem: chat
tags: [api-routes, wave-2, green, chat-lifecycle, guest-claim, new-conversation]
dependency_graph:
  requires:
    - phase: 47-02
      provides: createNewConversation and claimGuestConversation exported from chat.service.ts
    - phase: 47-01
      provides: Wave 0 RED stub for POST /api/chat/claim returning 401
  provides:
    - POST /api/chat/new — creates new conversation for authenticated user or guest
    - POST /api/chat/claim — links guest conversation to authenticated account
    - Wave 0 claim route stub is GREEN
  affects:
    - src/app/api/chat/claim/route.test.ts (mock added for Prisma import fix)
tech_stack:
  added: []
  patterns:
    - Next.js route handler: session-check + body-parse-guard + zod-uuid + service-call
    - Guest/auth path branching in POST /api/chat/new (session determines path)
    - UUID validation via z.string().uuid() before service call
key_files:
  created:
    - src/app/api/chat/new/route.ts
    - src/app/api/chat/claim/route.ts
  modified:
    - src/app/api/chat/claim/route.test.ts
decisions:
  - "POST /api/chat/new uses session presence to branch: authenticated gets userId from session; guest provides guestToken in body"
  - "POST /api/chat/claim requires auth first (T-47-claim-auth), userId always from session (T-47-claim-spoof)"
  - "No try/catch around claimGuestConversation — updateMany is idempotent; unexpected DB errors bubble to Next.js error handler"
  - "claim/route.test.ts needed @/server/services/chat.service mock to fix Prisma import error when route.ts was added"
metrics:
  duration: "~5 minutes"
  completed: "2026-05-25T19:40:00Z"
  tasks_completed: 2
  files_changed: 3
---

# Phase 47 Plan 03: API Routes — POST /api/chat/new and POST /api/chat/claim Summary

**POST /api/chat/new and POST /api/chat/claim created following the established session-check + body-parse + zod-uuid + service-call pattern; Wave 0 claim route stub is GREEN**

## Performance

- **Duration:** ~5 min
- **Tasks:** 2
- **Files modified/created:** 3

## Accomplishments

- `POST /api/chat/new` created: handles both authenticated users (userId from session) and guests (guestToken UUID from body); returns `{ conversationId }` with HTTP 201
- `POST /api/chat/claim` created: requires session (returns 401 otherwise), validates guestToken as UUID (returns 400 otherwise), calls `claimGuestConversation` and returns `{ ok: true }` with HTTP 200
- Wave 0 stub (`route.test.ts` — "returns 401 when no session") is now GREEN (1/1 passed)
- All threat mitigations from T-47-claim-auth and T-47-claim-spoof are in place

## Task Commits

1. **Task 1: POST /api/chat/new route** — `0731fa4` (feat)
2. **Task 2: POST /api/chat/claim route** — `fc24c90` (feat)

## Files Created/Modified

- `src/app/api/chat/new/route.ts` — New route: session + body-parse + UUID validation + createNewConversation
- `src/app/api/chat/claim/route.ts` — New route: auth gate + body-parse + UUID validation + claimGuestConversation
- `src/app/api/chat/claim/route.test.ts` — Added `vi.mock("@/server/services/chat.service")` to fix Prisma import error (Rule 3)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] claim/route.test.ts missing chat.service mock caused Prisma import error**
- **Found during:** Task 2 (running route.test.ts after creating route.ts)
- **Issue:** The Wave 0 stub mocked `@/lib/auth` and `next/headers` but not `@/server/services/chat.service`. When route.ts was created and imported by the test, it triggered the real chat.service import chain → Prisma client import → `PrismaNeon` error (not available in test environment)
- **Fix:** Added `vi.mock("@/server/services/chat.service", () => ({ claimGuestConversation: vi.fn().mockResolvedValue(undefined) }))` to the test file
- **Files modified:** src/app/api/chat/claim/route.test.ts
- **Verification:** `npx vitest run src/app/api/chat/claim/route.test.ts` exits 0 (1/1 passed)
- **Committed in:** fc24c90 (Task 2 commit)

**Total deviations:** 1 auto-fixed (Rule 3 blocking)

## Known Stubs

None — all routes are fully implemented. Wave 0 stubs for the claim route are GREEN.

## Threat Flags

None — both routes follow the established session-check + UUID-validation pattern. No new trust boundaries beyond what was planned in the threat model.

- T-47-claim-auth: MITIGATED — `if (!session?.user) return 401` at route entry
- T-47-claim-spoof: MITIGATED — `z.string().uuid()` rejects non-UUID tokens; userId from session only
- T-47-new-guest: MITIGATED — `z.string().uuid()` validates guest token format

## Self-Check: PASSED

- `src/app/api/chat/new/route.ts` — exists, contains `export async function POST`
- `src/app/api/chat/claim/route.ts` — exists, contains `export async function POST`
- `npx vitest run src/app/api/chat/claim/route.test.ts` — 1/1 passed (Wave 0 stub GREEN)
- `npx vitest run` — 7 pre-existing failures, 0 new failures (58 test files passed)
- `grep "createNewConversation" src/app/api/chat/new/route.ts` — has output
- `grep "claimGuestConversation" src/app/api/chat/claim/route.ts` — has output
- `grep "UNAUTHORIZED" src/app/api/chat/claim/route.ts` — has output
- Commit 0731fa4 — verified
- Commit fc24c90 — verified

## Next Phase Readiness

- Both HTTP endpoints are live: Plan 47-04 client widget can call `POST /api/chat/new` to start a new conversation after closure and `POST /api/chat/claim` to link a guest conversation on login
- No blockers
