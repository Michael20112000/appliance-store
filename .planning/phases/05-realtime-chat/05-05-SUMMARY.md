---
phase: 05-realtime-chat
plan: 05
subsystem: testing
tags: [playwright, e2e, pusher, chat, env]

requires:
  - phase: 05-realtime-chat
    plan: 03
    provides: storefront chat widget E2E targets
  - phase: 05-realtime-chat
    plan: 04
    provides: admin /admin/chaty inbox
provides:
  - Playwright coverage for CHAT-01–04 and AUTH-03 chat gates
  - hasPusherSecrets() helper for optional live realtime tests
  - Documented Pusher variables in .env.example
  - DB-first message POST without Pusher (CI-safe persistence)
affects: [06-polish-launch]

tech-stack:
  added: []
  patterns:
    - E2E registerBuyer + openChatFab helpers mirroring checkout flow
    - Optional chat-realtime.spec skipped when Pusher secrets absent
    - Message POST 201 even when Pusher trigger unavailable

key-files:
  created:
    - e2e/chat-auth.spec.ts
    - e2e/chat-persistence.spec.ts
    - e2e/chat-widget.spec.ts
    - e2e/admin-chat.spec.ts
    - e2e/chat-realtime.spec.ts
    - e2e/helpers/pusher.ts
    - e2e/helpers/buyer.ts
  modified:
    - e2e/admin-rbac.spec.ts
    - .env.example
    - src/app/api/chat/messages/route.ts
    - src/lib/pusher-client.ts
    - src/components/chat/chat-provider.tsx
    - src/components/chat/admin-chat-provider.tsx

key-decisions:
  - "D-05-17: Live Pusher E2E optional via hasPusherSecrets()"
  - "Persistence E2E does not require Pusher; POST persists then best-effort trigger"

patterns-established:
  - "Pattern: openChatFab no-ops when dialog already open (post-reload ?chat=open)"
  - "Pattern: sendBuyerChatMessage asserts POST 201 before UI text"

requirements-completed: [CHAT-01, CHAT-02, CHAT-03, CHAT-04, AUTH-03]

duration: 55min
completed: 2026-05-17
---

# Phase 05 Plan 05: Chat E2E & Env Gate Summary

**Playwright suite for chat auth, persistence, PDP context, admin inbox — CI-safe without Pusher secrets**

## Performance

- **Duration:** ~55 min
- **Started:** 2026-05-17T11:43:25Z
- **Completed:** 2026-05-17T12:38:00Z
- **Tasks:** 3
- **Files modified:** 14

## E2E Test Counts

| Spec | Tests | CI (no Pusher) |
|------|-------|----------------|
| `e2e/chat-auth.spec.ts` | 4 | 4 run |
| `e2e/chat-persistence.spec.ts` | 1 | 1 run |
| `e2e/chat-widget.spec.ts` | 1 | 1 run |
| `e2e/admin-chat.spec.ts` | 1 | 1 run |
| `e2e/admin-rbac.spec.ts` | 1 (extended) | 1 run |
| `e2e/chat-realtime.spec.ts` | 1 | skipped |
| **Total** | **9** | **8 required green** |

## Accomplishments

- Guest FAB → `/uviity?callbackUrl=`; guest POST messages → 401
- Buyer kabinet + FAB open chat dialog; unique message survives reload
- PDP «Запитати про цей товар» shows «Питання про:» banner
- Admin `/admin/chaty` h1 + enabled «Чати» nav; buyer blocked from admin chat
- `.env.example` documents six Pusher variables
- Phase gate: `npm test` + required chat Playwright specs green; `prisma migrate status` up to date

## Task Commits

1. **Task 1: E2E auth gates + helper** - `79e1ebe` (test)
2. **Task 2: E2E persistence + widget + admin RBAC** - `2a55e38` (test)
3. **Task 3: .env.example + phase verification gate** - `c928a9e` (docs)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Critical] Message POST returned 503 without Pusher — broke persistence E2E**
- **Found during:** Task 2 Playwright run
- **Issue:** `sendMessage` succeeded but `getPusherServer().trigger` threw `PusherNotConfiguredError`, client got 503 and dropped optimistic UI
- **Fix:** Wrap trigger in try/catch; return 201 when only Pusher missing; updated route unit test
- **Files modified:** `src/app/api/chat/messages/route.ts`, `route.test.ts`
- **Commit:** `2a55e38`

**2. [Rule 2 - Critical] Client threw when opening chat without `NEXT_PUBLIC_PUSHER_*`**
- **Found during:** Task 2 E2E after POST fix
- **Issue:** `getPusherClient()` threw in `ChatProvider` / `AdminChatProvider` subscribe effects
- **Fix:** `isPusherClientConfigured()` guard; skip WebSocket subscribe when unset
- **Files modified:** `src/lib/pusher-client.ts`, `chat-provider.tsx`, `admin-chat-provider.tsx`
- **Commit:** `2a55e38`

**3. [Rule 1 - Test] admin-rbac still expected disabled «Незабаром» nav**
- **Found during:** Task 2
- **Issue:** Phase 05-04 enabled «Чати» link
- **Fix:** Assert «Чати» link visible; buyer `/admin/chaty` → `/uviity`
- **Files modified:** `e2e/admin-rbac.spec.ts`
- **Commit:** `2a55e38`

---

**Total deviations:** 3 auto-fixed (2× Rule 2, 1× Rule 1)
**Impact on plan:** Required for CI-green persistence without secrets; no scope expansion.

## Optional Pusher Live Test

`e2e/chat-realtime.spec.ts` uses `test.skip(!hasPusherSecrets())`. In CI without secrets: **skipped**. With full Pusher env: two-browser buyer+admin instant delivery.

## User Setup Required

None for required E2E. Optional live test needs all six Pusher vars in `.env`.

## Self-Check: PASSED

- FOUND: e2e/chat-auth.spec.ts
- FOUND: e2e/chat-persistence.spec.ts
- FOUND: e2e/helpers/pusher.ts
- FOUND: .env.example (Pusher section)
- FOUND: 79e1ebe, 2a55e38, c928a9e

---
*Phase: 05-realtime-chat*
*Completed: 2026-05-17*
