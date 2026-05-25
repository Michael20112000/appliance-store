---
phase: 47-chat-lifecycle-control
plan: "01"
subsystem: chat
tags: [tdd, wave-0, red-stubs, chat-lifecycle, pusher, guest-claim]
dependency_graph:
  requires: []
  provides:
    - RED test stubs for CHAT-04 isActive enforcement in archiveConversation
    - RED test stubs for CHAT-05 createNewConversation (userId + guestToken paths)
    - RED test stubs for CHAT-02 claimGuestConversation (basic, idempotent, user-already-active)
    - RED test stub for archiveConversationAction Pusher conversation:closed trigger
    - RED test stub for POST /api/chat/claim 401-without-session auth guard
  affects:
    - src/server/services/chat.service.ts (implementations targeted by stubs in Plans 47-02, 47-03)
    - src/server/actions/admin/chat.actions.ts (Pusher trigger targeted in Plan 47-02)
    - src/app/api/chat/claim/route.ts (route targeted in Plan 47-03)
tech_stack:
  added: []
  patterns:
    - TDD Wave 0 RED stubs pattern (test files created before implementation)
    - vi.mock with @ts-expect-error for not-yet-exported functions
    - prisma.conversation.updateMany mock added to existing mock setup
key_files:
  created:
    - src/server/actions/admin/chat.actions.test.ts
    - src/app/api/chat/claim/route.test.ts
  modified:
    - src/server/services/chat.service.test.ts
decisions:
  - "Used @ts-expect-error imports for claimGuestConversation/createNewConversation so TypeScript allows importing unexported symbols"
  - "Used valid CUID format in archiveConversationAction test to bypass Zod parse; test is RED because trigger has 0 calls"
  - "Added updateMany to prisma conversation mock to support claimGuestConversation test assertions"
metrics:
  duration: "~2 minutes"
  completed: "2026-05-25T16:26:09Z"
  tasks_completed: 2
  files_changed: 3
---

# Phase 47 Plan 01: Wave 0 RED Stubs — Chat Lifecycle Control Summary

**One-liner:** Wave 0 RED test stubs for CHAT-02/04/05 — 6 new failing tests in 3 files establish Nyquist-compliant gate before any implementation.

## What Was Built

Three test files now contain RED stubs targeting all Phase 47 behaviors:

### Task 1: Extended chat.service.test.ts

Extended the existing test file with:
- **isActive=false assertion** on `archiveConversation` (RED: current impl only sets `status="ARCHIVED"`)
- **createNewConversation({ userId })** stub: asserts `$transaction` called, new conv returned
- **createNewConversation({ guestToken })** stub: same pattern for guest path
- **claimGuestConversation basic** stub: asserts `updateMany` called with `userId`, `guestToken: null`
- **claimGuestConversation idempotent** stub: second call (count=0) does not throw
- **claimGuestConversation user-already-active** stub: asserts `isActive: false` in update data

Added `updateMany` to the prisma mock setup and imported `createNewConversation` + `claimGuestConversation` with `@ts-expect-error` (not exported yet — causes TypeError at runtime = RED).

Result: 6 new tests RED, 27 pre-existing tests GREEN.

### Task 2: Created chat.actions.test.ts + claim/route.test.ts

**chat.actions.test.ts:** Tests that `archiveConversationAction` calls `getPusherServer().trigger(channel, "conversation:closed", { conversationId })`. Mocks `requireAdmin`, `archiveConversation`, `revalidatePath`, and `getPusherServer`. Test is RED because the action has no Pusher call yet (trigger called 0 times).

**claim/route.test.ts:** Tests that `POST /api/chat/claim` returns 401 when session is null. Import fails entirely because `src/app/api/chat/claim/route.ts` does not exist — RED at module resolution level.

## Verification Results

| File | Exit Code | New Tests | Pre-existing |
|------|-----------|-----------|--------------|
| `chat.service.test.ts` | non-zero | 6 RED | 27 GREEN |
| `chat.actions.test.ts` | non-zero | 1 RED | — |
| `claim/route.test.ts` | non-zero | 0 (import error) | — |

## Deviations from Plan

None — plan executed exactly as written.

Note: `chat.actions.test.ts` uses a valid CUID (`clh3vjq8e0000qz3e8q8q8q8q`) to pass the `conversationIdSchema.parse()` Zod validation in the action, allowing the test to fail at the correct assertion (trigger not called). This is consistent with the plan's intent — the test is RED because Pusher trigger has 0 calls, not because of a validation error.

## Known Stubs

All test files in this plan are intentionally stub files (Wave 0). They will go GREEN when their respective implementation plans complete:

| Stub | Goes GREEN when |
|------|-----------------|
| `isActive=false` assertion in archiveConversation | Plan 47-02 (service update) |
| `createNewConversation` stubs | Plan 47-02 (new service function) |
| `claimGuestConversation` stubs | Plan 47-03 (new service function) |
| `archiveConversationAction` Pusher trigger stub | Plan 47-02 (action update) |
| `claim/route.test.ts` import + 401 stub | Plan 47-03 (route creation) |

## Threat Flags

None — no production code modified, no new network endpoints, no trust boundary changes in this plan.

## Self-Check: PASSED

- `src/server/services/chat.service.test.ts` — exists, modified
- `src/server/actions/admin/chat.actions.test.ts` — exists, created
- `src/app/api/chat/claim/route.test.ts` — exists, created
- Commit 4be659f — exists
- Commit 6ad5779 — exists
