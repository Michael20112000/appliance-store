---
phase: 48-history-drawer
plan: "01"
subsystem: chat
tags:
  - tdd
  - red-stubs
  - chat-service
  - api-route
  - chat-panel
dependency_graph:
  requires: []
  provides:
    - "RED test stubs for listConversationsForBuyer (chat.service.test.ts)"
    - "RED test stubs for GET /api/chat/conversations (route.test.ts)"
    - "RED test stubs for PanelHeader Menu icon visibility (chat-panel.test.tsx)"
  affects:
    - src/server/services/chat.service.ts
    - src/app/api/chat/conversations/route.ts
    - src/components/chat/chat-panel.tsx
tech_stack:
  added: []
  patterns:
    - "@ts-expect-error Wave 0 RED stub import pattern"
    - "Vitest + React Testing Library for component RED stubs"
    - "vi.fn() hoisting pattern for auth mock (auth.api.getSession)"
key_files:
  created:
    - src/app/api/chat/conversations/route.test.ts
    - src/components/chat/chat-panel.test.tsx
  modified:
    - src/server/services/chat.service.test.ts
decisions:
  - "PanelHeader is internal — ChatPanel (exported) rendered in tests; desktop view shows PanelBody when isOpen=true"
  - "window.matchMedia stubbed in beforeEach to avoid jsdom errors from useIsMobile hook"
  - "auth mock uses auth.api.getSession passthrough pattern (matches all existing route tests)"
  - "Route test suite-level fail (module-not-found) counts as RED for conversations/route.test.ts"
metrics:
  duration: "165s"
  completed_date: "2026-05-26"
  tasks_completed: 3
  tasks_total: 3
  files_modified: 1
  files_created: 2
---

# Phase 48 Plan 01: RED Test Stubs — History Drawer Summary

**One-liner:** Three Wave 0 RED test stubs establish TDD feedback loop for listConversationsForBuyer service function, GET /api/chat/conversations route, and PanelHeader Menu icon guard.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | RED stub — extend chat.service.test.ts with listConversationsForBuyer | 10f045e | src/server/services/chat.service.test.ts |
| 2 | RED stub — create route.test.ts for GET /api/chat/conversations | a0a2522 | src/app/api/chat/conversations/route.test.ts |
| 3 | RED stub — create chat-panel.test.tsx for Menu icon visibility | c1cabb1 | src/components/chat/chat-panel.test.tsx |

## RED State Verification

**chat.service.test.ts:**
- 3 new `listConversationsForBuyer` tests all FAIL: `TypeError: listConversationsForBuyer is not a function`
- `@ts-expect-error` import line added successfully

**conversations/route.test.ts:**
- Suite-level RED: `Error: Cannot find package '@/app/api/chat/conversations/route'` (route.ts does not exist)
- 2 tests defined (auth guard 401, happy path 200)

**chat-panel.test.tsx:**
- Test 1 (guest, no menu): passes (acceptable — no Menu button exists, query correctly returns null)
- Test 2 (auth, sees menu): FAILS with `getByRole` not finding button (RED as required)

**Full suite:** 7 total test failures (3 pre-existing chat.service + 3 new listConversationsForBuyer + 1 new chat-panel). Route test fails at suite level (module not found). All within allowed range (baseline + 7).

## Deviations from Plan

None — plan executed exactly as written.

The only note: the plan spec said `getSession` from `@/lib/auth` but the existing codebase uses `auth.api.getSession`. The route test correctly matches the actual codebase pattern (auth.api.getSession via vi.fn() passthrough), consistent with all other route tests in the project.

## Known Stubs

None — this plan only creates test stubs; no production code was written.

## Threat Flags

No new security-relevant surface introduced. Test-only file changes only.

## Self-Check: PASSED

- [x] src/server/services/chat.service.test.ts modified (10f045e) — confirmed
- [x] src/app/api/chat/conversations/route.test.ts created (a0a2522) — confirmed
- [x] src/components/chat/chat-panel.test.tsx created (c1cabb1) — confirmed
- [x] All 3 commits exist in git log
- [x] listConversationsForBuyer tests: 3 RED failures
- [x] conversations route test: RED (module not found)
- [x] chat-panel test: 1 RED failure (auth-visible button not found)
