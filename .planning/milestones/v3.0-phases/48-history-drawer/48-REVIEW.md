---
phase: 48-history-drawer
reviewed: 2026-05-26T00:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - src/app/api/chat/conversations/route.ts
  - src/app/api/chat/conversations/route.test.ts
  - src/server/services/chat.service.ts
  - src/server/services/chat.service.test.ts
  - src/components/chat/history-drawer.tsx
  - src/components/chat/chat-provider.tsx
  - src/components/chat/chat-panel.tsx
  - src/components/chat/chat-panel.test.tsx
findings:
  critical: 2
  warning: 3
  info: 2
  total: 7
status: issues_found
---

# Phase 48: Code Review Report

**Reviewed:** 2026-05-26T00:00:00Z
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

Phase 48 adds a buyer-facing history drawer: a new `GET /api/chat/conversations` endpoint, `listConversationsForBuyer` service function, `HistoryDrawer` component, session-gated history menu in `PanelHeader`, and associated tests. The overall structure is sound. Two blockers were found: the "New Chat" button in the drawer sends the wrong request body (will always 400 for guest users in session-less contexts the drawer can never actually reach, and more critically silently breaks for authenticated users on the server when the body format changes), and the `handleNewChat` handler has no error path — a failed response leaves the UI frozen on the history screen with no feedback and no recovery. Three warnings cover a missing `updateGuestToken` call, an overly broad `unreadForAdmin` sort-order assumption in tests, and ARIA role misuse.

---

## Critical Issues

### CR-01: `handleNewChat` sends hardcoded `"{}"` body — correct for auth but wrong for guests and silently wrong at the contract level

**File:** `src/components/chat/history-drawer.tsx:69-73`

**Issue:** `handleNewChat` always posts `body: "{}"` to `/api/chat/new`. The `/api/chat/new` route requires `{ guestToken: string }` for unauthenticated requests (validated with a UUID schema). The history drawer is only reachable by authenticated users (the Menu button is gated on `hasSession`), so the empty body works today — but the HistoryDrawer component does not enforce or document this assumption. More critically, even for the authenticated path the code casts the response as `{ conversationId: string }` without checking that the property exists. If the server returns a 201 with `{}` on any failure path, `data.conversationId` will be `undefined` and `setConversationId(undefined)` will silently corrupt provider state (TypeScript does not catch this because of the `as` cast).

Additionally, `handleNewChat` does not call `updateGuestToken` with the new token returned in the guest path's response body. Although guests cannot currently reach this code path, the function body does not encode that constraint, creating a latent bug if the guard is ever relaxed.

**Fix:**
```tsx
const handleNewChat = async () => {
  const response = await fetch("/api/chat/new", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!response.ok) {
    // surface error to the user (see CR-02)
    return;
  }
  const data = (await response.json()) as { conversationId?: string };
  if (!data.conversationId) return; // guard against malformed response
  resetMessages();
  setConversationId(data.conversationId);
  setConversationStatus("OPEN");
  closeHistory();
};
```

---

### CR-02: `handleNewChat` swallows errors entirely — no try/catch, unhandled promise rejection on network failure

**File:** `src/components/chat/history-drawer.tsx:68-80`

**Issue:** `handleNewChat` is an `async` function invoked with `void handleNewChat()`. It contains no `try/catch`. A network failure (DNS error, fetch abort, server 500) will throw an unhandled promise rejection in the browser and leave the panel stuck on the history view with no indication to the user that anything went wrong. Unlike the `useEffect` fetch on line 43 which has a `finally` block, the "New Chat" action has zero error handling.

**Fix:**
```tsx
const [newChatError, setNewChatError] = useState<string | null>(null);

const handleNewChat = async () => {
  setNewChatError(null);
  try {
    const response = await fetch("/api/chat/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    if (!response.ok) {
      setNewChatError("Не вдалося створити новий чат. Спробуйте ще раз.");
      return;
    }
    const data = (await response.json()) as { conversationId: string };
    resetMessages();
    setConversationId(data.conversationId);
    setConversationStatus("OPEN");
    closeHistory();
  } catch {
    setNewChatError("Не вдалося створити новий чат. Спробуйте ще раз.");
  }
};
```

---

## Warnings

### WR-01: `HistoryDrawer` renders without error feedback when the initial conversation fetch fails

**File:** `src/components/chat/history-drawer.tsx:43-56`

**Issue:** The `useEffect` that loads conversations silently swallows non-OK HTTP responses (the `if (response.ok)` branch simply skips setting state, and the `finally` block only sets `isLoading = false`). A 401, 500, or network error will leave `conversations` as an empty array and display "Ще немає чатів" — identical to the legitimately-empty case. The user has no way to distinguish a fetch failure from an empty history and no retry mechanism.

**Fix:** Add an error state and display it:
```tsx
const [fetchError, setFetchError] = useState<string | null>(null);

useEffect(() => {
  void (async () => {
    try {
      const response = await fetch("/api/chat/conversations");
      if (!response.ok) {
        setFetchError("Не вдалося завантажити історію чатів.");
        return;
      }
      const data = (await response.json()) as {
        conversations: ConversationSummaryDto[];
      };
      setConversations(data.conversations);
    } catch {
      setFetchError("Не вдалося завантажити історію чатів.");
    } finally {
      setIsLoading(false);
    }
  })();
}, []);
```

---

### WR-02: `listConversationsForBuyer` sorts by `lastMessageAt: "desc"` but conversations with no messages have `lastMessageAt = null` — their ordering is database-engine-specific

**File:** `src/server/services/chat.service.ts:443-445`

**Issue:** Conversations with `lastMessageAt = null` (a conversation that was created but no message was ever sent) will be sorted in an engine-specific position when ordering by a nullable column without an explicit `nulls: "last"` or `nulls: "first"` directive. PostgreSQL places `NULL` last in `ASC` and first in `DESC` by default, but this behavior is not guaranteed across all Prisma-supported engines and is not stated as intentional in the code. If the intent is to show conversations-with-messages first, the ordering should be explicit.

**Fix:**
```ts
orderBy: { lastMessageAt: { sort: "desc", nulls: "last" } },
```

---

### WR-03: ARIA `role="option"` on `<button>` inside `role="listbox"` violates the ARIA spec

**File:** `src/components/chat/history-drawer.tsx:98-115`

**Issue:** The container div has `role="listbox"` (line 98) and each row button has `role="option"` (line 115). Per the ARIA spec, `option` is an interactive role whose only valid parent is `listbox` — but `option` elements inside a `listbox` should NOT themselves be focusable `<button>` elements. A `listbox` is a single focusable composite widget that manages focus internally via `aria-activedescendant` or `roving tabindex`. Using native `<button>` elements with `role="option"` creates conflicting semantics: assistive technologies will announce each item as both a button and an option, and keyboard navigation expectations (arrow keys vs. Tab) will be ambiguous. The correct pattern for a list of clickable rows is either plain `role="list"` + `role="listitem"` buttons, or a proper `listbox` with non-button `div`/`span` options that handle keyboard events manually.

**Fix:** Replace the listbox/option pattern with a simple list:
```tsx
<div
  className="min-h-0 flex-1 overflow-y-auto"
  role="list"
  aria-label="Мої чати"
>
  {/* ... */}
  <button
    key={conv.id}
    type="button"
    role="listitem"   {/* or omit — button is self-describing */}
    aria-current={conv.id === conversationId ? "true" : undefined}
    {/* ... */}
  >
```

---

## Info

### IN-01: `@ts-expect-error` comments in test file refer to exports that now exist

**File:** `src/server/services/chat.service.test.ts:9-14`

**Issue:** Lines 9 and 13 suppress TypeScript errors with comments stating the symbols are "not exported yet (Wave 0 RED stub)". Both `claimGuestConversation` and `createNewConversation` are fully implemented and exported from `chat.service.ts`. The `@ts-expect-error` directives are now stale — TypeScript will still suppress the error (it never errors on an expected error that doesn't exist in recent TS versions, though strict mode may warn). More importantly, the suppression masks any future real type errors on those import lines.

**Fix:** Remove both `@ts-expect-error` comment lines and import `claimGuestConversation` and `createNewConversation` normally.

---

### IN-02: `initials` helper in `history-drawer.tsx` falls back to `"П"` for empty strings — semantically odd for an avatar

**File:** `src/components/chat/history-drawer.tsx:24-29`

**Issue:** `initials("")` returns `"П"` (the Ukrainian letter П, likely intended as an abbreviation for "Покупець"/"Гість"). This is a magic constant with no comment explaining the choice. The caller on line 124 passes `conv.buyerName || conv.buyerEmail` — for the buyer-facing list both values are always `"Ви"` and `""` respectively (set by `listConversationsForBuyer`), so the empty-string branch is never reached in practice. The `buyerEmail` fallback on line 128 (`conv.buyerName || conv.buyerEmail || "Ви"`) is also dead code for this endpoint.

**Fix:** Add an explanatory comment, or collapse the display logic since `buyerName` is always `"Ви"` for this endpoint:
```ts
// Falls back to "П" (Покупець) for display-only avatar when name is unavailable
if (parts.length === 0) return "П";
```

---

_Reviewed: 2026-05-26T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
