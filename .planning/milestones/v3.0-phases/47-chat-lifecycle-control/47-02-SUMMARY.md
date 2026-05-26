---
phase: 47-chat-lifecycle-control
plan: "02"
subsystem: chat
tags: [tdd, wave-1, green, chat-lifecycle, pusher, guest-claim, prisma-transaction]
dependency_graph:
  requires:
    - phase: 47-01
      provides: Wave 0 RED test stubs for CHAT-02/04/05 in chat.service.test.ts and chat.actions.test.ts
  provides:
    - archiveConversation sets both status=ARCHIVED and isActive=false atomically
    - createNewConversation using $transaction (userId + guestToken paths)
    - claimGuestConversation idempotent guest-to-user linking
    - archiveConversationAction broadcasts conversation:closed Pusher event (PusherNotConfiguredError swallowed)
  affects:
    - src/app/api/chat/claim/route.ts (Plan 47-03 builds claimGuestConversation call here)
    - buyer chat widget (Plan 47-04 handles conversation:closed event from Pusher)
tech_stack:
  added: []
  patterns:
    - prisma.$transaction for atomic deactivate-old + create-new conversation pattern
    - Pusher try/catch with PusherNotConfiguredError-only swallow (non-blocking side effect)
    - vi.hoisted() for mockFn declarations used inside vi.mock() factory scope
key_files:
  created: []
  modified:
    - src/server/services/chat.service.ts
    - src/server/services/chat.service.test.ts
    - src/server/actions/admin/chat.actions.ts
    - src/server/actions/admin/chat.actions.test.ts
key_decisions:
  - "Pre-existing 'archiveConversation sets status ARCHIVED' test updated to use objectContaining (necessary to accommodate new isActive field without breaking the test)"
  - "vi.hoisted() used to fix mockTrigger initialization order in chat.actions.test.ts (vi.mock factory runs before const declarations)"
patterns-established:
  - "Wave 1 GREEN pattern: implement service layer, run wave-0 test stubs, all go GREEN"
  - "Pusher side-effect pattern: DB commit first, Pusher trigger after, PusherNotConfiguredError silently swallowed"
requirements-completed: [CHAT-04, CHAT-05, CHAT-02]
duration: 4min
completed: "2026-05-25"
---

# Phase 47 Plan 02: Service Layer Implementation Summary

**archiveConversation extended with isActive=false, createNewConversation and claimGuestConversation added with $transaction and idempotent updateMany; Pusher conversation:closed wired into archiveConversationAction**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-05-25T16:29:00Z
- **Completed:** 2026-05-25T16:31:45Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- All 8 Wave 0 RED stubs from Plan 47-01 are now GREEN (33 service tests + 1 action test)
- `createNewConversation` atomically deactivates all existing active conversations for the owner and creates a new one using `prisma.$transaction`
- `claimGuestConversation` links a guestToken conversation to a userId via `updateMany` — sets `isActive: false` when user already has an active conversation, preserving isActive otherwise
- `archiveConversationAction` now triggers `conversation:closed` on the Pusher channel after DB archive, silently swallowing `PusherNotConfiguredError`

## Task Commits

1. **Task 1: Extend chat.service.ts** - `a2f5382` (feat)
2. **Task 2: Extend archiveConversationAction with Pusher** - `b7c48a1` (feat)

## Files Created/Modified

- `src/server/services/chat.service.ts` - Added `createNewConversation`, `claimGuestConversation`; extended `archiveConversation` with `isActive: false`
- `src/server/services/chat.service.test.ts` - Updated pre-existing exact-match test to use `objectContaining` (Rule 1 fix)
- `src/server/actions/admin/chat.actions.ts` - Added Pusher imports + try/catch trigger block in `archiveConversationAction`
- `src/server/actions/admin/chat.actions.test.ts` - Fixed `mockTrigger` declaration to use `vi.hoisted()` (Rule 3 fix)

## Decisions Made

- Used `objectContaining` in the pre-existing `archiveConversation sets status ARCHIVED` test to allow the new `isActive: false` field without breaking the pre-existing assertion
- Used `vi.hoisted()` to declare `mockTrigger` — vitest hoists `vi.mock()` calls to the top of the file, so `const mockTrigger = vi.fn()` declared after `vi.mock()` in source order is not yet initialized when the factory runs

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Pre-existing archiveConversation test used exact toHaveBeenCalledWith that would fail after adding isActive: false**
- **Found during:** Task 1 (chat.service.ts implementation)
- **Issue:** Test at line 315 checked `data: { status: "ARCHIVED" }` exactly — adding `isActive: false` to the update would make this fail
- **Fix:** Changed to `expect.objectContaining({ data: expect.objectContaining({ status: "ARCHIVED" }) })`
- **Files modified:** src/server/services/chat.service.test.ts
- **Verification:** All 33 tests GREEN
- **Committed in:** a2f5382 (Task 1 commit)

**2. [Rule 3 - Blocking] vi.hoisted required for mockTrigger in chat.actions.test.ts**
- **Found during:** Task 2 (running chat.actions.test.ts after implementation)
- **Issue:** `const mockTrigger = vi.fn()` declared at module scope after `vi.mock()` — since vitest hoists vi.mock to top, the factory ran before mockTrigger was initialized, causing `ReferenceError: Cannot access 'mockTrigger' before initialization`
- **Fix:** Changed `const mockTrigger = vi.fn()` to `const mockTrigger = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))`
- **Files modified:** src/server/actions/admin/chat.actions.test.ts
- **Verification:** 1/1 test GREEN
- **Committed in:** b7c48a1 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 Rule 1 bug, 1 Rule 3 blocking)
**Impact on plan:** Both auto-fixes necessary for correct test behavior. No scope creep.

## Issues Encountered

- Wave 0 test file had a vitest hoisting bug (`mockTrigger` not using `vi.hoisted`) — fixed as Rule 3 blocking deviation. This was latent in the RED stub (when the action had no Pusher call the test failed at the assertion, masking the hoisting issue; now that the action calls Pusher, the module loads and the hoisting error surfaced).

## Known Stubs

None — all Wave 0 stubs from Plan 47-01 are now GREEN. No new stubs introduced.

## Threat Flags

None — no new network endpoints, no new trust boundaries. The Pusher trigger is a side-effect of an existing admin-only action, consistent with the threat model in the plan.

## Self-Check: PASSED

- `src/server/services/chat.service.ts` — exists, modified with createNewConversation + claimGuestConversation exported
- `src/server/actions/admin/chat.actions.ts` — exists, modified with Pusher trigger
- Commit a2f5382 — verified
- Commit b7c48a1 — verified
- `npx vitest run src/server/services/chat.service.test.ts` — 33/33 passed
- `npx vitest run src/server/actions/admin/chat.actions.test.ts` — 1/1 passed

## Next Phase Readiness

- Service layer complete: Plan 47-03 can add the `POST /api/chat/claim` route calling `claimGuestConversation`
- Pusher broadcast in place: Plan 47-04 client widget can subscribe to `conversation:closed` on the channel
- No blockers

---
*Phase: 47-chat-lifecycle-control*
*Completed: 2026-05-25*
