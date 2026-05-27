---
phase: 52-chat-structural-refactor
reviewed: 2026-05-28T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - src/components/chat/chat-panel.test.tsx
  - src/components/chat/chat-provider.tsx
  - src/components/ui/drawer.tsx
  - src/components/chat/chat-panel.tsx
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 52: Code Review Report

**Reviewed:** 2026-05-28T00:00:00Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Reviewed the four files introduced by the chat structural refactor: `chat-provider.tsx` (state management and Pusher integration), `chat-panel.tsx` (desktop widget + mobile drawer rendering), `drawer.tsx` (base-ui drawer primitives wrapper), and `chat-panel.test.tsx` (Vitest/RTL test suite).

The overall architecture is sound. No security vulnerabilities were found. Four quality warnings surfaced — two are logic bugs that can cause silent data loss or a stale-read, and two are correctness gaps in error handling. Three informational items round out the review.

---

## Warnings

### WR-01: Raw string literal bypasses the `GUEST_CHAT_TOKEN_KEY` constant in two places

**File:** `src/components/chat/chat-provider.tsx:156` and `:262`
**Issue:** `GUEST_CHAT_TOKEN_KEY` is defined at line 78 as `"chat_guest_token"`. The constant is used correctly at lines 276, 427, 441, and 453 — but two call sites (the `openPanel` token-generation path and the guest-restore `useEffect`) hard-code the string literal `"chat_guest_token"` directly. If the key name is ever changed, these two paths will diverge silently: the guest token will be written under one key and read from another, causing the widget to treat every returning guest as brand-new.

**Fix:**
```ts
// line 156 — inside openPanel
localStorage.setItem(GUEST_CHAT_TOKEN_KEY, token);   // was: "chat_guest_token"

// line 262 — inside the mount useEffect
const stored = localStorage.getItem(GUEST_CHAT_TOKEN_KEY);  // was: "chat_guest_token"
```

---

### WR-02: Initial `setIsDisconnected` check omits the `"failed"` Pusher state

**File:** `src/components/chat/chat-provider.tsx:402-405`
**Issue:** When the Pusher effect first runs it snapshots the current connection state to decide whether to set `isDisconnected = true`. The snapshot check (lines 402-405) tests for `"disconnected"` and `"unavailable"` only, omitting `"failed"`. The `handleStateChange` listener at line 363-368 correctly treats `"failed"` as a disconnected state. If Pusher is already in state `"failed"` at mount time — which happens when the auth endpoint returned an error on the initial connect — the UI will not show the disconnection banner on first render, leaving the user with a silently non-functional chat.

**Fix:**
```ts
setIsDisconnected(
  pusher.connection.state === "disconnected" ||
    pusher.connection.state === "unavailable" ||
    pusher.connection.state === "failed",   // add this line
);
```

---

### WR-03: `subscribedChannelRef` is written but never read — stale channel guard is dead code

**File:** `src/components/chat/chat-provider.tsx:129`, `:400`, `:413`
**Issue:** `subscribedChannelRef` is assigned when a Pusher channel is subscribed (line 400) and cleared in cleanup (line 413), but it is never consulted anywhere. Its apparent intent was to prevent double-subscription to the same channel, yet the guard logic was never written. This means if a channel is somehow subscribed twice (e.g., during React Strict Mode double-invoke in development), events would be handled twice and unread counts would double-increment. The ref is dead weight in production but masks a real correctness gap.

**Fix:** Either remove the ref entirely (accepting that React's cleanup handles single-subscription), or add the guard:
```ts
// at the top of the Pusher useEffect, before subscribe
if (subscribedChannelRef.current === channelName) return;
```

---

### WR-04: `handleNewChat` in `HistoryDrawer` is an unhandled async function — thrown errors are swallowed silently

**File:** `src/components/chat/history-drawer.tsx:68-80`
**Issue:** `handleNewChat` is declared `async` and called via `void handleNewChat()` on line 93. The function's `fetch` call has no `try/catch`. If the network fails (connection error, timeout, or DNS failure), the thrown `TypeError` becomes an unhandled promise rejection. React does not surface these to an error boundary — the user clicks "Новий чат", nothing happens, and there is no feedback.

**Fix:**
```ts
const handleNewChat = async () => {
  try {
    const response = await fetch("/api/chat/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    if (!response.ok) return;
    const data = (await response.json()) as { conversationId: string };
    resetMessages();
    setConversationId(data.conversationId);
    setConversationStatus("OPEN");
    closeHistory();
  } catch {
    // surface an error state or show a toast here
  }
};
```

---

## Info

### IN-01: Desktop panel renders `HistoryDrawer` unconditionally even when `hasSession=false`

**File:** `src/components/chat/chat-panel.tsx:192-197`, `:215-220`
**Issue:** Both the desktop and mobile branches always render `<HistoryDrawer />` inside the panel (inside `role="dialog"`). `HistoryDrawer` immediately fires a `fetch("/api/chat/conversations")` on mount (history-drawer.tsx line 44-57). For a guest user, this fetch will either return a 401 or an empty list, but the fetch is made regardless. The `HistoryDrawer` is only visually reachable when `hasSession=true` (the menu button is gated), but it is always mounted and always fires a network request.

**Fix:** Conditionally render `HistoryDrawer` only when `hasSession` is true:
```tsx
{hasSession ? (
  <div className={cn("absolute inset-y-0 ...", ...)}>
    <HistoryDrawer />
  </div>
) : null}
```

---

### IN-02: `clearUnreadCount` is called in two overlapping `useEffect`s

**File:** `src/components/chat/chat-provider.tsx:309`, `:417-421`
**Issue:** When `isOpen` becomes `true` and `conversationId` is non-null, `clearUnreadCount` is called inside the messages-loading `useEffect` (line 309, after a successful fetch), **and** unconditionally inside a separate `useEffect` (lines 417-421) that runs on every `isOpen` change. On the happy path both fire on the same render cycle — the second is redundant. On the error path (fetch fails), only the second one fires, which is the intended behaviour; but the duplication makes the control flow harder to reason about and risks the count being cleared before messages actually load in future refactors.

**Fix:** Remove the standalone `useEffect` at lines 417-421 and rely solely on the `clearUnreadCount()` call inside the loading effect, moving it outside the `conversationId` guard if needed to cover the "no conversation yet" case.

---

### IN-03: Test `matchMedia` stub returns `matches: true` for every query in the mobile tests, not just the intended `(max-width: 767px)` query

**File:** `src/components/chat/chat-panel.test.tsx:118`
**Issue:** The mobile `beforeEach` stubs `matchMedia` to return `matches: true` for **all** queries. If any future code in the render tree calls `matchMedia` with a different media query (e.g., a dark-mode check or a `prefers-reduced-motion` check), it will also receive `true`, potentially rendering unexpected branches. This is a test-quality issue rather than a product bug today, but it will cause silent false positives if additional `matchMedia` calls are added to the component tree.

**Fix:** Narrow the stub to match only the viewport query the test cares about:
```ts
value: vi.fn().mockImplementation((query: string) => ({
  matches: query === "(max-width: 767px)",
  // ...
})),
```

---

_Reviewed: 2026-05-28T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
