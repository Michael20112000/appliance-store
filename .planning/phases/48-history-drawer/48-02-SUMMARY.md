---
phase: 48-history-drawer
plan: "02"
subsystem: chat
tags:
  - tdd
  - green-pass
  - chat-service
  - api-route
dependency_graph:
  requires:
    - "48-01 RED stubs for listConversationsForBuyer and GET /api/chat/conversations"
  provides:
    - "listConversationsForBuyer exported from chat.service.ts"
    - "GET /api/chat/conversations route (auth-gated)"
  affects:
    - src/server/services/chat.service.ts
    - src/app/api/chat/conversations/route.ts
    - src/server/services/chat.service.test.ts
tech_stack:
  added: []
  patterns:
    - "Prisma findMany with select projection (no extra user lookup for buyer history)"
    - "auth.api.getSession guard pattern — session.user.id never from client input"
key_files:
  created:
    - src/app/api/chat/conversations/route.ts
  modified:
    - src/server/services/chat.service.ts
    - src/server/services/chat.service.test.ts
decisions:
  - "listConversationsForBuyer uses select projection (id, userId, status, lastMessagePreview, lastMessageAt) — no extra user table lookup needed because buyerName and buyerEmail are placeholders"
  - "Removed @ts-expect-error Wave 0 RED stub comment from chat.service.test.ts import after function was exported"
metrics:
  duration: "180s"
  completed_date: "2026-05-26"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
  files_created: 1
---

# Phase 48 Plan 02: Backend — listConversationsForBuyer + GET Route Summary

**One-liner:** GREEN implementation of listConversationsForBuyer (no isActive filter, buyerName "Ви" placeholders) and auth-gated GET /api/chat/conversations route turning 5 RED stubs from Plan 01 GREEN.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add listConversationsForBuyer to chat.service.ts | 4f29d9f | src/server/services/chat.service.ts, src/server/services/chat.service.test.ts |
| 2 | Create GET /api/chat/conversations route | c139add | src/app/api/chat/conversations/route.ts |

## GREEN State Verification

**chat.service.test.ts — listConversationsForBuyer (3 tests):**
- "calls prisma.conversation.findMany with where: { userId }" — PASS
- "returns conversations sorted desc by lastMessageAt" — PASS
- "does NOT filter by isActive in the where clause" — PASS

**conversations/route.test.ts (2 tests):**
- "returns 401 when no session (CHAT-07 auth guard)" — PASS
- "returns 200 with conversations array for authenticated user" — PASS

**Pre-existing failures unchanged:** 3 chat.service failures (unarchiveConversation, claimGuestConversation x2) remain RED — pre-existing before Phase 48. chat-panel.test.tsx RED stub remains RED for Plan 03.

## Deviations from Plan

**1. [Rule 2 - Missing] Removed redundant @ts-expect-error from test import**
- Found during: Task 1 done-criteria check
- Issue: After exporting listConversationsForBuyer, the `@ts-expect-error` Wave 0 RED stub comment on line 23 of chat.service.test.ts became a TypeScript error (TS2578: Unused '@ts-expect-error' directive)
- Fix: Removed the `@ts-expect-error` directive from the import — included in Task 1 commit
- Files modified: src/server/services/chat.service.test.ts

All other plan instructions executed exactly as written.

## Known Stubs

- `buyerName: "Ви"` — placeholder per plan spec (real name lookup not needed for buyer's own history view)
- `buyerEmail: ""` — placeholder per plan spec
- `unreadForAdmin: false` — placeholder per plan spec (buyer history view does not need admin read state)

These are intentional design stubs documented in the plan's must_haves. Plan 03 (HistoryDrawer UI component) consumes this data and will display buyerName as-is.

## Threat Flags

No new security-relevant surface beyond what was planned. The GET /api/chat/conversations route implements T-48-02-01 and T-48-02-02 mitigations as specified:
- Auth check before service call (401 for unauthenticated)
- listConversationsForBuyer filters by session.user.id from server session, not client-supplied param

## Self-Check: PASSED

- [x] src/server/services/chat.service.ts modified (4f29d9f) — listConversationsForBuyer exported
- [x] src/app/api/chat/conversations/route.ts created (c139add) — GET handler exported
- [x] src/server/services/chat.service.test.ts modified (4f29d9f) — @ts-expect-error removed
- [x] All 3 commits exist in git log: 4f29d9f, c139add
- [x] listConversationsForBuyer: 3 tests GREEN
- [x] GET /api/chat/conversations: 2 tests GREEN
- [x] No new TypeScript errors in modified/created files
