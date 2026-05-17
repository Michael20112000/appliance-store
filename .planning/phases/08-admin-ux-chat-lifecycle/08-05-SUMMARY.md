---
phase: 08-admin-ux-chat-lifecycle
plan: 05
subsystem: database
tags: [prisma, chat, conversation-status, server-actions, vitest]

requires:
  - phase: 08-01
    provides: admin shell and chat routes
provides:
  - ConversationStatus enum and migration
  - Chat service lifecycle (archive/unarchive/delete, guards)
  - Admin server actions for chat lifecycle
affects:
  - 08-06
  - 08-07

tech-stack:
  added: []
  patterns:
    - "ConversationStatus OPEN | ARCHIVED with hard delete"
    - "sendMessage CHAT_ARCHIVED guard before transaction"
    - "countUnreadForAdmin OPEN-only"

key-files:
  created:
    - prisma/migrations/20260517165509_conversation_status/migration.sql
    - src/server/actions/admin/chat.actions.ts
  modified:
    - prisma/schema.prisma
    - src/server/services/chat.service.ts
    - src/server/services/chat.service.test.ts
    - src/types/chat.ts
    - src/app/(admin)/admin/chaty/page.tsx

key-decisions:
  - "Hard delete via prisma.conversation.delete (D-08-16)"
  - "Active inbox defaults to OPEN until 08-06 tabs"

patterns-established:
  - "listConversationsForAdmin({ status }) filters inbox by lifecycle"
  - "Admin lifecycle actions: requireAdmin + cuid + revalidate chaty + layout"

requirements-completed: [CHAT-05, CHAT-06]

duration: 22min
completed: 2026-05-17
---

# Phase 08 Plan 05: Chat Lifecycle Backend Summary

**Prisma ConversationStatus migration, chat service archive/delete guards, and admin server actions for CHAT-05/06 backend**

## Performance

- **Duration:** 22 min
- **Started:** 2026-05-17T16:54:00Z
- **Completed:** 2026-05-17T16:57:01Z
- **Tasks:** 3 (+ migration checkpoint)
- **Files modified:** 6

## Accomplishments

- `ConversationStatus` enum (`OPEN` | `ARCHIVED`) on `Conversation` with composite index `[status, lastMessageAt]`
- Migration `20260517165509_conversation_status` applied to Neon Postgres
- `chat.service.ts` lifecycle: filter by status, archive/unarchive, hard delete, `CHAT_ARCHIVED` on send, OPEN-only unread
- Vitest coverage extended (20 tests passing)
- `archiveConversationAction`, `unarchiveConversationAction`, `deleteConversationAction` with `requireAdmin` and path revalidation

## Task Commits

1. **Task 1: Prisma ConversationStatus schema** - `337411c` (feat)
2. **Migration checkpoint** - `024322a` (chore)
3. **Task 2 RED: failing lifecycle tests** - `4b246bc` (test)
4. **Task 2 GREEN: chat service lifecycle** - `0acce6d` (feat)
5. **Task 3: admin chat lifecycle actions** - `34590fd` (feat)

## Files Created/Modified

- `prisma/schema.prisma` - `ConversationStatus` enum, `status` field, index
- `prisma/migrations/20260517165509_conversation_status/migration.sql` - DB migration SQL
- `src/server/services/chat.service.ts` - lifecycle API and ARCHIVED send guard
- `src/server/services/chat.service.test.ts` - lifecycle and guard unit tests
- `src/types/chat.ts` - `status` on `ConversationSummaryDto`
- `src/server/actions/admin/chat.actions.ts` - admin archive/unarchive/delete actions
- `src/app/(admin)/admin/chaty/page.tsx` - passes `{ status: "OPEN" }` until 08-06 tabs

## Decisions Made

- Followed D-08-15 through D-08-25 from CONTEXT/RESEARCH (hard delete, no soft-delete, same row on getOrCreate)
- Admin inbox page keeps OPEN-only list until plan 08-06 adds `view=active|archive`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Default OPEN filter on admin chaty page**
- **Found during:** Task 2 (service signature change)
- **Issue:** `listConversationsForAdmin()` now requires `{ status }`; existing RSC page would not typecheck
- **Fix:** `listConversationsForAdmin({ status: "OPEN" })` on `/admin/chaty`
- **Files modified:** `src/app/(admin)/admin/chaty/page.tsx`
- **Committed in:** `0acce6d`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minimal compile-time fix; archive tab wiring deferred to 08-06 as planned.

## TDD Gate Compliance

- RED: `4b246bc` test(08-05)
- GREEN: `0acce6d` feat(08-05)
- REFACTOR: not required

## Issues Encountered

- `npm run lint` exits non-zero due to pre-existing project errors (unrelated files); new/changed files have no linter issues.
- Migration checkpoint completed in automation via `npx prisma migrate dev --name conversation_status` (no operator pause required).

## User Setup Required

None - migration applied during execution.

## Next Phase Readiness

- **08-06:** Wire admin tabs (`view=active|archive`), thread dropdown actions to new server actions
- **08-07:** Buyer read-only composer when `status === ARCHIVED` (server guard already enforced)

## Self-Check: PASSED

- FOUND: prisma/schema.prisma
- FOUND: prisma/migrations/20260517165509_conversation_status/migration.sql
- FOUND: src/server/services/chat.service.ts
- FOUND: src/server/services/chat.service.test.ts
- FOUND: src/types/chat.ts
- FOUND: src/server/actions/admin/chat.actions.ts
- FOUND: commits 337411c, 024322a, 4b246bc, 0acce6d, 34590fd

---
*Phase: 08-admin-ux-chat-lifecycle*
*Completed: 2026-05-17*
