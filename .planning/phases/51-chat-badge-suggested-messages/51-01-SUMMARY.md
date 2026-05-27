---
phase: 51-chat-badge-suggested-messages
plan: "01"
subsystem: chat
tags: [tdd, red-baseline, test-stubs, chat-badge, suggested-messages]
dependency_graph:
  requires: []
  provides:
    - "RED baseline for CHAT-10 (badge) and CHAT-11 (suggested messages)"
    - "suggested-messages.test.tsx: 5 failing test stubs"
    - "chat.service.test.ts: countUnreadForBuyer describe block (2 failing)"
    - "storefront-fabs.test.tsx: badge render tests (2 failing)"
    - "chat-panel.test.tsx: mock renamed to unreadCount/clearUnreadCount"
  affects:
    - "src/components/chat/suggested-messages.tsx (Plan 04 creates this)"
    - "src/server/services/chat.service.ts (Plan 02 adds countUnreadForBuyer)"
    - "src/components/layout/storefront-fabs.tsx (Plan 03 migrates badge)"
    - "src/components/chat/chat-panel.tsx (Plan 04 wires SuggestedMessages)"
tech_stack:
  added: []
  patterns:
    - "vitest-environment jsdom pragma for component tests"
    - "@ts-expect-error comments for Wave 0 RED stub imports"
    - "vi.mocked(fn).mockReturnValue for component test mock overrides"
key_files:
  created:
    - src/components/chat/suggested-messages.test.tsx
  modified:
    - src/server/services/chat.service.test.ts
    - src/components/layout/storefront-fabs.test.tsx
    - src/components/chat/chat-panel.test.tsx
decisions:
  - "unreadCount badge test for '0' asserts no aria-label with '0 непрочитаних' (not brittle DOM count)"
  - "countUnreadForBuyer import uses @ts-expect-error — matches existing Wave 0 RED stub pattern"
metrics:
  duration: "12 minutes"
  completed: "2026-05-27"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 4
  files_created: 1
---

# Phase 51 Plan 01: Wave 0 TDD Red Baseline Summary

**One-liner:** Four test files establish RED baseline — failing stubs for CHAT-11 SuggestedMessages chips, CHAT-10 numeric unread badge, and countUnreadForBuyer service function.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create suggested-messages.test.tsx (CHAT-11 failing stubs) | eb4b4db | src/components/chat/suggested-messages.test.tsx |
| 2 | Update three existing test files — rename boolean mock + add failing tests | 84adb7a | src/server/services/chat.service.test.ts, src/components/layout/storefront-fabs.test.tsx, src/components/chat/chat-panel.test.tsx |

## What Was Built

**Task 1 — suggested-messages.test.tsx (new file):**
- 5 test cases covering CHAT-11 behavior: product chip render with "Пральна машина LG", 3 general chips when productContext is null, 4 chips total when productContext set, onSelect called with chip text on click, no product chip when productTitle is undefined
- Intentional RED: imports `SuggestedMessages` from a non-existent file; exits non-zero until Plan 04

**Task 2 — three existing test files updated:**
- `chat.service.test.ts`: Added `countUnreadForBuyer` describe block with 2 failing tests (import uses `@ts-expect-error`, RED until Plan 02)
- `storefront-fabs.test.tsx`: All 4 `unreadFromStore: false` mock returns renamed to `unreadCount: 0`; 3 new CHAT-10 badge tests added (CHAT-10-a with count 3, CHAT-10-b with count 0 no-badge, CHAT-10-c with count 10 → "9+")
- `chat-panel.test.tsx`: baseChatContext fields renamed — `unreadFromStore: false` → `unreadCount: 0` and `clearUnreadFromStore: vi.fn()` → `clearUnreadCount: vi.fn()`

## Verification Results

```
Test Files  3 failed | 1 passed (4)
Tests       7 failed | 49 passed (56)
```

Exit non-zero — correct RED baseline. Failing tests are the intentional new ones (countUnreadForBuyer import, badge render). Existing tests in chat-panel pass because mock rename is forward-compatible (duck-typed object).

Mock rename confirmed clean:
```
grep -c "unreadFromStore" storefront-fabs.test.tsx chat-panel.test.tsx
→ 0 each
```

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

- `suggested-messages.test.tsx` imports `SuggestedMessages` which does not exist yet — intentional stub. Plan 04 creates the component.
- `chat.service.test.ts` imports `countUnreadForBuyer` with `@ts-expect-error` — intentional stub. Plan 02 adds the export.

## Threat Flags

None — test files only; no production code or user data in scope.

## Self-Check: PASSED

- [x] src/components/chat/suggested-messages.test.tsx exists (created)
- [x] src/server/services/chat.service.test.ts contains countUnreadForBuyer describe block
- [x] src/components/layout/storefront-fabs.test.tsx has 0 occurrences of "unreadFromStore"
- [x] src/components/chat/chat-panel.test.tsx has 0 occurrences of "unreadFromStore" or "clearUnreadFromStore"
- [x] Commit eb4b4db exists (Task 1)
- [x] Commit 84adb7a exists (Task 2)
