---
phase: 48-history-drawer
verified: 2026-05-26T15:00:00Z
status: human_needed
score: 7/7 automated must-haves verified
overrides_applied: 0
human_verification:
  - test: "Guest cannot see the menu icon in the widget header"
    expected: "With user logged out, open the chat widget — only the X close button appears in the header, no three-line menu icon"
    why_human: "Auth guard renders {hasSession ? <MenuButton /> : null} — automated tests confirm the React conditional, but only a browser session test confirms hasSession is correctly false for a real guest user"
  - test: "Authenticated user sees the Menu icon and clicking it opens history panel inside the widget"
    expected: "Log in, open chat widget, click the three-line menu icon — the view switches to a panel titled 'Мої чати' listing past conversations, entirely within the widget (no full-screen overlay, no new page)"
    why_human: "panelView state switch is client-side; automated test confirms button render; the in-widget appearance and layout can only be confirmed visually"
  - test: "Clicking a conversation row switches to that thread without closing the widget"
    expected: "In the history panel, click a past conversation — the widget remains open and switches to the message thread for that conversation"
    why_human: "handleSelect calls resetMessages + setConversationId + setConversationStatus + closeHistory — the sequence of state transitions and resulting UX requires a running browser to confirm"
  - test: "'Новий чат' button creates a new conversation and opens it in message view"
    expected: "In the history panel, click 'Новий чат' — the widget switches to an empty message thread (no previous messages, composer enabled)"
    why_human: "handleNewChat calls POST /api/chat/new and wires the returned conversationId into state; end-to-end behavior requires a dev server with real DB"
  - test: "Closing the widget and reopening resets to thread view, not history view"
    expected: "While in the history drawer, click X to close the widget, then reopen it via the chat FAB — the widget opens in the message thread view, not the history panel"
    why_human: "closePanel sets panelView('thread') — automated code review confirms the call, but actual widget-close-and-reopen cycle requires a browser test"
  - test: "Full test suite at or below baseline failure count"
    expected: "npx vitest run shows 5 failed | 380 passed — no new failures introduced by Phase 48"
    why_human: "Already verified programmatically — PASS (5 failures, all pre-existing). No human action needed for this check."
---

# Phase 48: History Drawer Verification Report

**Phase Goal:** Authenticated users can access their full conversation history from within the chat widget using a menu button that opens an in-widget panel
**Verified:** 2026-05-26T15:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Authenticated user sees a menu icon in the widget header; not visible to guests | ✓ VERIFIED | `PanelHeader` in `chat-panel.tsx` lines 40-51: `{hasSession ? <Button aria-label="Відкрити меню чатів">...</Button> : null}`; `chat-panel.test.tsx` tests both states GREEN |
| 2 | Clicking menu icon opens panel inside widget showing past conversations | ✓ VERIFIED (code) / ? HUMAN (runtime) | `openHistory` sets `panelView="history"`; `ChatPanel` renders `<HistoryDrawer />` when `panelView==="history"` (lines 174, 190); `HistoryDrawer` fetches `/api/chat/conversations` on mount |
| 3 | Clicking a conversation switches message view to that thread without closing the widget | ✓ VERIFIED (code) / ? HUMAN (runtime) | `handleSelect` in `history-drawer.tsx` lines 59-66: calls `resetMessages()`, `setConversationId(id)`, `setConversationStatus(conv.status)`, `closeHistory()` — no panel close, only panelView reset |
| 4 | "Новий чат" button creates a new conversation and opens it in message view | ✓ VERIFIED (code) / ? HUMAN (runtime) | `handleNewChat` in `history-drawer.tsx` lines 68-80: `POST /api/chat/new`, sets new `conversationId`, `status="OPEN"`, calls `closeHistory()` |

**Score:** 7/7 automated must-haves verified (all plan must_haves from 48-01, 48-02, 48-03 pass)

---

### Plan Must-Haves Summary

#### Plan 01 Must-Haves (TDD RED stubs)

| Truth | Status | Evidence |
|-------|--------|---------|
| RED stubs exist for listConversationsForBuyer in chat.service.test.ts | ✓ VERIFIED | `describe("listConversationsForBuyer")` block with 3 tests present; stubs were RED before Plan 02 |
| RED stubs exist for GET /api/chat/conversations in route.test.ts | ✓ VERIFIED | `src/app/api/chat/conversations/route.test.ts` exists with 2 tests |
| RED stubs exist for PanelHeader Menu icon visibility in chat-panel.test.tsx | ✓ VERIFIED | `src/components/chat/chat-panel.test.tsx` exists with 2 tests |

#### Plan 02 Must-Haves (backend implementation)

| Truth | Status | Evidence |
|-------|--------|---------|
| listConversationsForBuyer returns all conversations (no isActive filter) | ✓ VERIFIED | `chat.service.ts` lines 439-465: `where: { userId }` with no `isActive` field; test GREEN |
| listConversationsForBuyer ordered lastMessageAt desc, capped at 50 | ✓ VERIFIED | `orderBy: { lastMessageAt: "desc" }, take: 50` present |
| Each item has buyerName: "Ви", buyerEmail: "", unreadForAdmin: false | ✓ VERIFIED | Lines 455-464: hardcoded placeholder values as per spec |
| GET /api/chat/conversations returns 401 for unauthenticated | ✓ VERIFIED | `route.ts` lines 7-9; route.test.ts 401 test GREEN |
| GET /api/chat/conversations returns { conversations: [...] } for auth users | ✓ VERIFIED | `route.ts` lines 10-11; route.test.ts 200 test GREEN |

#### Plan 03 Must-Haves (client UI)

| Truth | Status | Evidence |
|-------|--------|---------|
| Authenticated user sees Menu icon button in widget header | ✓ VERIFIED | `chat-panel.tsx` line 40-51; `chat-panel.test.tsx` auth test GREEN |
| Guest does not see Menu icon button | ✓ VERIFIED | `chat-panel.tsx` line 40; `chat-panel.test.tsx` guest test GREEN |
| Clicking Menu icon opens history panel (panelView → "history") | ✓ VERIFIED | `openHistory = useCallback(() => setPanelView("history"), [])` in `chat-provider.tsx` line 159; PanelHeader `onClick={openHistory}` |
| History panel shows conversations fetched from GET /api/chat/conversations | ✓ VERIFIED | `history-drawer.tsx` lines 43-57: `useEffect([], fetch("/api/chat/conversations"))` |
| Clicking a conversation switches to that thread | ✓ VERIFIED (code) | `handleSelect` calls setConversationId + closeHistory |
| "Новий чат" creates new conversation | ✓ VERIFIED (code) | `handleNewChat` calls POST /api/chat/new |
| Closing widget resets to thread view | ✓ VERIFIED | `closePanel` in `chat-provider.tsx` line 153-157 calls `setPanelView("thread")` |

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/server/services/chat.service.test.ts` | Unit tests for listConversationsForBuyer | ✓ VERIFIED | 3 tests, all GREEN; `describe("listConversationsForBuyer")` block present |
| `src/app/api/chat/conversations/route.test.ts` | Unit tests for GET /api/chat/conversations | ✓ VERIFIED | 2 tests, all GREEN |
| `src/components/chat/chat-panel.test.tsx` | Tests for PanelHeader menu icon guard | ✓ VERIFIED | 2 tests, all GREEN |
| `src/server/services/chat.service.ts` | `listConversationsForBuyer` exported function | ✓ VERIFIED | Lines 439-465; substantive Prisma query; exported |
| `src/app/api/chat/conversations/route.ts` | GET handler for buyer conversation history | ✓ VERIFIED | 12 lines; auth-gated; calls listConversationsForBuyer |
| `src/components/chat/chat-provider.tsx` | panelView state + openHistory/closeHistory in ChatContextValue | ✓ VERIFIED | Type lines 70-72; state line 129; callbacks lines 159-160; useMemo lines 505-507, 531-533 |
| `src/components/chat/chat-panel.tsx` | PanelHeader with auth-gated Menu; ChatPanel branching on panelView | ✓ VERIFIED | Menu button lines 40-51; panelView branch lines 174, 190 |
| `src/components/chat/history-drawer.tsx` | HistoryDrawer with header, list, new-chat button | ✓ VERIFIED | Substantive: 141 lines with fetch, handleSelect, handleNewChat, full JSX |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `chat.service.test.ts` | `chat.service.ts` | import `listConversationsForBuyer` | ✓ WIRED | Import on line 22 of test; no @ts-expect-error (removed after Plan 02) |
| `conversations/route.test.ts` | `conversations/route.ts` | dynamic import `{ GET }` | ✓ WIRED | Line 23 of route.test.ts; route.ts exists and exports GET |
| `conversations/route.ts` | `chat.service.ts` | `import { listConversationsForBuyer }` | ✓ WIRED | Line 3 of route.ts; called on line 10 |
| `conversations/route.ts` | `@/lib/auth` | `auth.api.getSession` | ✓ WIRED | Line 2 import; line 6 call |
| `chat-panel.tsx` | `chat-provider.tsx` | `useChat()` — panelView, hasSession, openHistory | ✓ WIRED | Line 26: `const { hasSession, openHistory } = useChat()`; line 155: `const { isOpen, closePanel, panelView } = useChat()` |
| `history-drawer.tsx` | `/api/chat/conversations` | `fetch` on mount `useEffect` | ✓ WIRED | Line 46: `fetch("/api/chat/conversations")` inside `useEffect([], ...)` |
| `history-drawer.tsx` | `chat-provider.tsx` | `useChat()` — setConversationId, resetMessages, closeHistory | ✓ WIRED | Lines 33-38: destructured from `useChat()`; used in handleSelect (lines 62-65) and handleNewChat (lines 77-79) |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `history-drawer.tsx` | `conversations` (state) | `fetch("/api/chat/conversations")` → `GET()` → `listConversationsForBuyer(userId)` → `prisma.conversation.findMany` | Yes — Prisma query with `where: { userId }, orderBy, take: 50` | ✓ FLOWING |
| `chat-panel.tsx` | `panelView` | `useState("thread")` in ChatProvider; `openHistory` sets it to "history" | N/A — UI state, not external data | ✓ FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| listConversationsForBuyer GREEN (3 tests) | `npx vitest run src/server/services/chat.service.test.ts --reporter=verbose` | 3 PASS for listConversationsForBuyer describe block | ✓ PASS |
| GET /api/chat/conversations GREEN (2 tests) | `npx vitest run src/app/api/chat/conversations/route.test.ts` | 2 PASS | ✓ PASS |
| PanelHeader Menu visibility GREEN (2 tests) | `npx vitest run src/components/chat/chat-panel.test.tsx` | 2 PASS | ✓ PASS |
| Full suite no regressions | `npx vitest run` | 5 failed / 380 passed — all 5 failures are pre-existing (3 from Phase 47 stubs + 2 from seed.test.ts) | ✓ PASS |
| No TypeScript errors in Phase 48 files | `npx tsc --noEmit` | 0 errors in Phase 48 files; all TS errors are pre-existing in unrelated test fixtures | ✓ PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| CHAT-06 | 48-01, 48-03 | Menu icon in widget header, visible only to authenticated users | ✓ SATISFIED | `PanelHeader` `{hasSession ? <Button aria-label="Відкрити меню чатів"> : null}`; tests GREEN |
| CHAT-07 | 48-01, 48-02, 48-03 | History drawer shows list of past conversations; clicking one switches to that thread | ✓ SATISFIED (code) / ? HUMAN (runtime) | `listConversationsForBuyer` + GET route + `HistoryDrawer` fetch + `handleSelect` all wired |
| CHAT-08 | 48-03 | "Новий чат" button in drawer creates new conversation | ✓ SATISFIED (code) / ? HUMAN (runtime) | `handleNewChat` in `history-drawer.tsx` calls `POST /api/chat/new` and wires response |

All 3 requirements declared in PLAN frontmatter are accounted for. No orphaned requirements — REQUIREMENTS.md maps CHAT-06/07/08 to Phase 48 and all 3 are covered.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `chat.service.ts` | 8 | `// @ts-expect-error — not exported yet (Wave 0 RED stub)` on `claimGuestConversation` | ℹ Info | Pre-existing from Phase 47; not introduced by Phase 48 |
| `chat.service.ts` | 12 | `// @ts-expect-error — not exported yet (Wave 0 RED stub)` on `createNewConversation` | ℹ Info | Pre-existing from Phase 47; not introduced by Phase 48 |

No debt markers (`TBD`, `FIXME`, `XXX`) were found in any Phase 48 files. The `@ts-expect-error` comments are from Phase 47 RED stubs still pending implementation.

**Implementation deviation noted (not a blocker):** `history-drawer.tsx` uses a custom inline conversation list (with `Avatar`, `Skeleton`, `button` rows) rather than the `ConversationList` component the plan's interfaces section referenced. The behavior is equivalent — conversations render with selection, empty state, and loading state all handled. This is an acceptable deviation; the plan's key link required `fetch → /api/chat/conversations` wiring, which is present.

---

### Human Verification Required

The executor completed tasks 1 and 2 of Plan 03 but Plan 03's `checkpoint:human-verify` (Task 3) is pending. The following 5 behavioral checks require a running dev server:

**1. CHAT-06 Guest guard**

**Test:** Open the chat widget while logged out.
**Expected:** Only the X close button is visible in the widget header — no three-line menu icon.
**Why human:** The `hasSession` prop originates from a server component; automated tests mock it. A real guest browser session is the only way to confirm server-side prop evaluation.

**2. CHAT-06 Auth menu icon + CHAT-07 History panel**

**Test:** Log in as a user with at least one past conversation; open the chat widget; click the three-line menu icon.
**Expected:** The menu icon is visible next to the X button. Clicking it switches the view inside the widget to a panel titled "Мої чати" showing a list of past conversations. The widget does not close, navigate, or resize.
**Why human:** In-widget visual layout, list rendering with real data, and absence of full-page navigation cannot be verified without a browser.

**3. CHAT-07 Thread switch**

**Test:** In the history panel, click on a past conversation.
**Expected:** The panel switches back to the message thread view showing that conversation's messages. Widget remains open.
**Why human:** Requires a real DB with message history and a live Pusher channel subscription in a browser.

**4. CHAT-08 New chat**

**Test:** Open the history drawer; click "Новий чат".
**Expected:** A new empty message thread opens inside the widget (no prior messages, composer enabled).
**Why human:** `POST /api/chat/new` creates a DB record; the response must wire through state to produce the correct UI. Requires a running backend.

**5. Close + reopen resets view**

**Test:** While in the history drawer, click X to close. Reopen via chat FAB.
**Expected:** Widget opens in thread view, not history panel.
**Why human:** Tests the full open/close/reopen cycle through `closePanel → setPanelView("thread")` with real browser state, not the isolated unit being tested.

---

### Gaps Summary

No automated gaps. All 7/7 automated must-haves are verified against the actual codebase. The 5 human verification items listed above are the only open items, driven by the pending `checkpoint:human-verify` from Plan 03 Task 3.

The phase is code-complete pending human UAT sign-off.

---

_Verified: 2026-05-26T15:00:00Z_
_Verifier: Claude (gsd-verifier)_
