---
phase: 48-history-drawer
plan: "03"
subsystem: chat
tags:
  - react
  - context
  - history-drawer
  - chat-panel
dependency_graph:
  requires:
    - "48-02 GREEN listConversationsForBuyer and GET /api/chat/conversations route"
  provides:
    - "ChatProvider panelView state with openHistory/closeHistory callbacks"
    - "PanelHeader auth-gated Menu icon button (CHAT-06)"
    - "HistoryDrawer component fetching /api/chat/conversations with ConversationList"
    - "ChatPanel branching on panelView: HistoryDrawer vs PanelBody"
  affects:
    - src/components/chat/chat-provider.tsx
    - src/components/chat/chat-panel.tsx
    - src/components/chat/history-drawer.tsx
tech_stack:
  added: []
  patterns:
    - "panelView state in ChatProvider: 'thread' | 'history' with reset-on-close guarantee"
    - "Auth-gated UI element pattern: {hasSession ? <Component /> : null} using context"
    - "HistoryDrawer fetch-on-mount pattern: useEffect with empty deps, setIsLoading in finally"
key_files:
  created:
    - src/components/chat/history-drawer.tsx
  modified:
    - src/components/chat/chat-provider.tsx
    - src/components/chat/chat-panel.tsx
    - src/components/chat/chat-panel.test.tsx
key_decisions:
  - "HistoryDrawer mocked in chat-panel.test.tsx (same pattern as MessageList, ChatComposer) to avoid Prisma generated client resolution failure in test env"
  - "panelView reset on closePanel ensures widget always opens to thread view (Pitfall 2 from RESEARCH.md)"

patterns-established:
  - "View-state switching inside widget: panelView 'thread'|'history' — no Sheet open/close, no navigation"

requirements-completed:
  - CHAT-06
  - CHAT-07
  - CHAT-08

duration: ~15min (tasks 1-2 complete; checkpoint 3 awaiting human UAT)
completed: 2026-05-26
---

# Phase 48 Plan 03: Client History Drawer Summary

**panelView state in ChatProvider + auth-gated Menu icon in PanelHeader + HistoryDrawer fetching /api/chat/conversations, wiring CHAT-06/07/08 end-to-end**

## Status

**PARTIAL — Tasks 1 and 2 complete. Task 3 (checkpoint:human-verify) awaiting user UAT.**

## Performance

- **Duration:** ~15 min (tasks 1-2)
- **Started:** 2026-05-26T14:09:00Z
- **Completed:** Tasks 1-2 done; checkpoint pending
- **Tasks:** 2/3 (task 3 is checkpoint:human-verify)
- **Files modified:** 4

## Accomplishments

- Extended ChatContextValue type with panelView, openHistory, closeHistory
- Added panelView state ("thread" by default) and callbacks to ChatProvider body and useMemo
- Extended closePanel to reset panelView to "thread" (guarantees widget always opens to thread view)
- Modified PanelHeader to render auth-gated Menu button using hasSession from useChat()
- Created HistoryDrawer with fetch-on-mount for /api/chat/conversations and ConversationList
- ChatPanel now branches on panelView: HistoryDrawer when "history", PanelBody otherwise
- All 2 chat-panel.test.tsx GREEN (guest: no Menu, auth: Menu visible)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend ChatProvider with panelView state and openHistory/closeHistory** - `6da7bd0` (feat)
2. **Task 2: Modify PanelHeader and ChatPanel; create HistoryDrawer** - `ea304f8` (feat)
3. **Task 3: Human UAT checkpoint** - awaiting

## Files Created/Modified

- `src/components/chat/chat-provider.tsx` - Added panelView state, openHistory, closeHistory, extended closePanel
- `src/components/chat/chat-panel.tsx` - Added Menu import+button in PanelHeader, HistoryDrawer import, panelView branching
- `src/components/chat/history-drawer.tsx` - New: fetch conversations on mount, ConversationList, handleSelect, handleNewChat
- `src/components/chat/chat-panel.test.tsx` - Added vi.mock for history-drawer; added panelView+closeHistory to baseChatContext

## Decisions Made

- HistoryDrawer mocked in chat-panel.test.tsx to prevent Prisma generated client resolution errors in test env (same mock pattern as MessageList, ChatComposer, ArchivedChatBanner)
- panelView reset on closePanel follows RESEARCH.md Pitfall 2 guidance to ensure close+reopen always shows thread view
- handleNewChat sends body: "{}" per plan spec; no toast on failure (arch decision from plan)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added vi.mock for HistoryDrawer in chat-panel.test.tsx**
- **Found during:** Task 2 (verification step)
- **Issue:** HistoryDrawer imports ConversationList which imports Prisma server-side code; test env cannot resolve `@/generated/prisma/client` (pre-existing env issue), causing the entire test file to fail to load
- **Fix:** Added `vi.mock("@/components/chat/history-drawer", ...)` alongside the existing mocks for MessageList, ChatComposer, ArchivedChatBanner, ProductContextBanner. Also added `panelView: "thread"` and `closeHistory: vi.fn()` to `baseChatContext` to satisfy the updated ChatContextValue type
- **Files modified:** src/components/chat/chat-panel.test.tsx
- **Verification:** Both chat-panel.test.tsx tests GREEN after fix
- **Committed in:** ea304f8 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - test environment import chain fix)
**Impact on plan:** Essential for tests to load; no scope creep. Same pattern used by all other chat subcomponent mocks in this test file.

## Issues Encountered

None beyond the deviation above.

## Threat Flags

No new security-relevant surface beyond what was planned. T-48-03-04 mitigation implemented: `{hasSession ? <MenuButton /> : null}` in PanelHeader — hasSession comes from server-rendered ChatProvider prop.

## Known Stubs

None. All wired to real data:
- HistoryDrawer fetches live data from /api/chat/conversations (implemented in Plan 02)
- handleSelect wires real setConversationId + setConversationStatus from ChatProvider
- handleNewChat calls real POST /api/chat/new

## Self-Check: PARTIAL (tasks 1-2 complete, awaiting human UAT for task 3)

- [x] src/components/chat/chat-provider.tsx modified (6da7bd0) — panelView, openHistory, closeHistory added
- [x] src/components/chat/chat-panel.tsx modified (ea304f8) — Menu button + HistoryDrawer wired
- [x] src/components/chat/history-drawer.tsx created (ea304f8) — HistoryDrawer component
- [x] src/components/chat/chat-panel.test.tsx modified (ea304f8) — mocks + baseChatContext updated
- [x] Both chat-panel.test.tsx tests GREEN: guest no Menu, auth user has Menu
- [x] No new test failures beyond pre-existing baseline (3 pre-existing: unarchiveConversation, claimGuestConversation x2)
- [ ] Human UAT (6 checks) — pending checkpoint:human-verify

## Next Phase Readiness

After user approves the UAT checkpoint, all three CHAT-06/07/08 requirements will be confirmed delivered. Phase 48 will be complete.

---
*Phase: 48-history-drawer*
*Partial summary — checkpoint:human-verify pending*
