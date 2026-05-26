---
phase: 47-chat-lifecycle-control
reviewed: 2026-05-25T00:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - src/app/api/chat/claim/route.test.ts
  - src/app/api/chat/claim/route.ts
  - src/app/api/chat/new/route.ts
  - src/components/chat/archived-chat-banner.tsx
  - src/components/chat/chat-provider.tsx
  - src/server/actions/admin/chat.actions.test.ts
  - src/server/actions/admin/chat.actions.ts
  - src/server/services/chat.service.test.ts
  - src/server/services/chat.service.ts
findings:
  critical: 3
  warning: 4
  info: 2
  total: 9
status: issues_found
---

# Phase 47: Code Review Report

**Reviewed:** 2026-05-25T00:00:00Z
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Phase 47 adds chat lifecycle control: archiving/unarchiving conversations (admin), creating new conversations from the archived banner (buyer/guest), and claiming guest conversations on login. The service layer and admin action layer are generally sound, but three correctness bugs were found: `unarchiveConversation` silently fails to restore the conversation to the active query set, `claimGuestConversation` makes two separate non-atomic DB calls that can race, and `ArchivedChatBanner` silently swallows errors without user feedback. Four additional warnings cover incomplete test coverage, a missing `try/catch` around localStorage reads, stale `conversationId` state after a claim, and an unused constant in the service.

---

## Critical Issues

### CR-01: `unarchiveConversation` does not restore `isActive`, making unarchived conversations invisible

**File:** `src/server/services/chat.service.ts:382-387`

`archiveConversation` sets both `status: "ARCHIVED"` and `isActive: false` (line 327). However `unarchiveConversation` only sets `status: "OPEN"`, leaving `isActive` as `false`. All buyer-facing queries filter on `isActive: true` (`getConversationForBuyer` line 151, `getOrCreateConversation` line 96, `resolveConversationForSend` line 266). After unarchiving, the conversation is permanently invisible to the buyer — they can never load messages or send again even though the admin believes it is open again.

**Fix:**
```ts
export async function unarchiveConversation(conversationId: string) {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: "OPEN", isActive: true },
  });
}
```

The test at `chat.service.test.ts:339-351` only asserts `status: "OPEN"` and does not assert `isActive: true`, so the bug passes tests undetected.

---

### CR-02: `claimGuestConversation` has a TOCTOU race — two unrelated DB calls with no transaction

**File:** `src/server/services/chat.service.ts:361-380`

The claim logic first reads whether the user has an existing active conversation (`findFirst`, line 365), then conditionally writes via `updateMany` (lines 370-378). These are two separate, non-atomic operations. A concurrent request creating a new authenticated conversation between the read and write causes the guest conversation to be linked to the user **without** setting `isActive: false`, leaving the user with two active conversations (`existingActive` was absent at check time, but now exists). The `resolveConversationForSend` path would then pick whichever `findFirst` returns first, silently dropping messages.

**Fix:** Wrap both operations in a `prisma.$transaction`:
```ts
export async function claimGuestConversation(
  guestToken: string,
  userId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existingActive = await tx.conversation.findFirst({
      where: { userId, isActive: true },
    });
    if (existingActive) {
      await tx.conversation.updateMany({
        where: { guestToken },
        data: { userId, guestToken: null, isActive: false },
      });
    } else {
      await tx.conversation.updateMany({
        where: { guestToken },
        data: { userId, guestToken: null },
      });
    }
  });
}
```

---

### CR-03: `claimGuestConversation` does not update `conversationId` state in `ChatProvider` after a successful claim — buyer's panel shows no messages

**File:** `src/components/chat/chat-provider.tsx:436-460`

After a successful claim, the effect removes the token from localStorage and clears `guestToken` and Pusher token state (lines 451-455), but never updates `conversationId`. On mount the provider loaded the `conversationId` from the guest endpoint (line 286). After claim, the conversation's `guestToken` column is set to `null` by the server, but the client still holds the old `conversationId` in state. When the buyer opens the panel, `fetchMessages` fires against `GET /api/chat/messages?conversationId=<id>`, which calls `assertConversationAccess`. That function checks `conversation.userId === session.user.id` (line 458 of the service) — this check now passes because the claim linked the userId, so data loads correctly in this flow.

However, if the buyer had **no prior guest conversation** (`conversationId` is `null` at claim time), the claim clears `guestToken` from state but the conversation created via `POST /api/chat/new` during the guest session is now claimed. The provider never fetches the newly-claimed `conversationId` for the authenticated session. The buyer opens the chat, has no `conversationId` in state, and falls through to the "no conversation" branch — the claimed history is invisible until a page reload triggers the SSR `initialConversationId` prop.

**Fix:** After a successful claim, fetch the user's active conversation and set `conversationId`:
```ts
if (res.ok) {
  localStorage.removeItem(GUEST_CHAT_TOKEN_KEY);
  // Fetch the now-claimed conversation so the panel shows history without reload
  const claimedRes = await fetch("/api/chat/messages?conversationId=...");
  // or simply reload to let SSR re-hydrate initialConversationId:
  router.refresh();
  setGuestToken(null);
  setGuestTokenForPusher(null);
}
```

---

## Warnings

### WR-01: `ArchivedChatBanner.handleStartNew` silently swallows errors — user receives no feedback on failure

**File:** `src/components/chat/archived-chat-banner.tsx:17-37`

When `fetch("/api/chat/new")` returns a non-OK response, the handler executes `return` with no error feedback (line 25). The button re-enables (`setIsStarting(false)` in `finally`), but the user sees nothing — no toast, no error message. A network failure or 400/500 from the server leaves the UI in the same "Чат завершено" state with no indication of what went wrong.

**Fix:**
```ts
if (!res.ok) {
  toast.error("Не вдалося створити новий чат. Спробуйте ще раз.");
  return;
}
```

---

### WR-02: `POST /api/chat/claim` has no error handling — service exceptions surface as unhandled 500s

**File:** `src/app/api/chat/claim/route.ts:25-27`

`claimGuestConversation` is called with no `try/catch`. If the DB is unavailable or the Prisma call throws, the Next.js runtime catches the unhandled exception and returns a generic 500 with a stack trace in development. While the client treats claim failure as non-fatal (chat-provider.tsx line 456), the route should still return a structured error rather than crashing the runtime handler.

**Fix:**
```ts
try {
  await claimGuestConversation(parsed.data.guestToken, session.user.id);
} catch {
  return Response.json({ error: "CLAIM_FAILED" }, { status: 500 });
}
return Response.json({ ok: true });
```

---

### WR-03: `POST /api/chat/new` has no error handling — service exceptions surface as unhandled 500s

**File:** `src/app/api/chat/new/route.ts:17-33`

Both calls to `createNewConversation` (lines 17 and 27) are unguarded. `createNewConversation` calls `prisma.$transaction`, which can throw Prisma errors or constraint violations not covered by the P2002 race handling inside the service (guest branch uses `updateMany` which never throws P2002). An unhandled DB error escapes the route handler entirely.

**Fix:** Wrap both conversation creation calls in a shared `try/catch`:
```ts
try {
  if (session?.user) {
    const conversation = await createNewConversation({ userId: session.user.id });
    return Response.json({ conversationId: conversation.id }, { status: 201 });
  }
  // ... guest path ...
} catch {
  return Response.json({ error: "INTERNAL_ERROR" }, { status: 500 });
}
```

---

### WR-04: `openPanel` reads `localStorage` in the main React render path without a `try/catch` guard on `crypto.randomUUID`

**File:** `src/components/chat/chat-provider.tsx:158-166`

The comment on line 163 says "private mode or crypto not available — continue without token", and the `try/catch` does cover `crypto.randomUUID()`. However, the outer `try` also wraps `localStorage.setItem` — if `setItem` throws (private browsing quota), the `catch` silently continues, leaving the token generated by `crypto.randomUUID()` in memory as `guestToken` state but **not persisted**. On the next page load the token is gone, so the guest's conversation is orphaned and unrecoverable without a claim. This is an edge case but is a silent data loss for the guest session.

The `updateGuestToken` function (line 424-432) has the same pattern correctly — it persists first and only calls `setGuestToken` after (implicitly, since `setItem` may throw and the state update still runs). The fix is to set state only when persistence succeeds, or accept the in-memory-only token and document that behavior explicitly.

---

## Info

### IN-01: `chat.service.test.ts` imports use `@ts-expect-error` suppression that is now stale

**File:** `src/server/services/chat.service.test.ts:9-14`

Lines 9-10 and 13-14 use `// @ts-expect-error — not exported yet (Wave 0 RED stub)` for `claimGuestConversation` and `createNewConversation`. Both functions are now exported from `chat.service.ts` (lines 331 and 361). The `@ts-expect-error` directives are stale — TypeScript will now emit an "Unused '@ts-expect-error' directive" error in strict mode, which becomes a compile failure under `noUnusedLocals` / `--strict`. Remove both suppressions.

**Fix:** Delete the two `// @ts-expect-error` comment lines (lines 9-10 and 13-14).

---

### IN-02: `CONVERSATION_CHANNEL_RE` regex uses `{20,30}` but CUIDs are fixed at 25 characters

**File:** `src/server/services/chat.service.ts:23-25`

The regex `private-conversation-([a-z0-9]{20,30})` is overly permissive. Prisma CUIDs are exactly 25 characters (`c` + 24 alphanumeric). A range of `{20,30}` accepts IDs that are not valid CUIDs, which could allow an attacker who controls channel names to craft a channel name that parses to a truncated or padded ID that bypasses the `assertConversationAccess` lookup. The impact is low because the looked-up `conversationId` would simply not be found in the DB, but tightening the regex closes the ambiguity.

**Fix:**
```ts
const CONVERSATION_CHANNEL_RE = /^private-conversation-([a-z0-9]{25})$/i;
```

---

_Reviewed: 2026-05-25T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
