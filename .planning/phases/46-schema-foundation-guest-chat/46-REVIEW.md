---
phase: 46-schema-foundation-guest-chat
reviewed: 2026-05-25T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - prisma/schema.prisma
  - src/app/api/chat/guest/route.ts
  - src/app/api/chat/messages/route.ts
  - src/app/api/chat/pusher/auth/route.ts
  - src/components/chat/chat-provider.tsx
  - src/lib/pusher-client.ts
  - src/server/services/chat.service.ts
  - src/server/services/chat.service.test.ts
  - src/server/validators/chat.ts
  - src/server/validators/chat.test.ts
  - src/types/chat.ts
findings:
  critical: 3
  warning: 4
  info: 3
  total: 10
status: issues_found
---

# Phase 46: Code Review Report

**Reviewed:** 2026-05-25T00:00:00Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

This phase introduces a guest chat schema (Conversation with nullable `userId`/`guestToken`), API routes for guest message sending and conversation restore, a Pusher auth endpoint extended for guests, and a ChatProvider that manages guest token lifecycle in localStorage. The core data model and service layer are structurally sound. Three blockers were found: guests who reconnect via Pusher hit the wrong (auth-required) API endpoint for message reload; the Pusher auth route's guest code path is entirely untested because the test file omits the required `prisma` mock; and the schema has no constraint preventing a `Conversation` row with both `userId` and `guestToken` null simultaneously, making zombie rows possible and undetectable at the DB layer. Four warnings cover a dead export, a stale-closure-induced Pusher churn, the lack of guest-path tests in two route test files, and no token format validation at the guest GET endpoint.

## Critical Issues

### CR-01: Guest reconnect calls auth-required endpoint — always 401 for guests

**File:** `src/components/chat/chat-provider.tsx:349`

**Issue:** `refetchMessages` (line 224) is the sole reconnect handler for Pusher's `connected` event after a disconnect (line 349). It calls `fetchMessages` (line 204), which unconditionally hits `GET /api/chat/messages?conversationId=…`. That endpoint requires a session (line 176 of `messages/route.ts`) and returns `401 UNAUTHORIZED` for guests. The Pusher subscription effect at line 302 has no `hasSession` guard, so guests with an active `conversationId` are subscribed and will hit this failure on every reconnect. The resulting 401 causes `fetchMessages` to `throw new Error("LOAD_FAILED")`, and `refetchMessages` catches it and calls `setLoadError(…)`, presenting "Не вдалося завантажити повідомлення" to the guest permanently after any network hiccup.

**Fix:** Introduce a guest-aware refetch inside the Pusher effect (or within `refetchMessages` itself) that routes guests to the guest endpoint:

```typescript
// In ChatProvider, replace the refetchMessages call inside handleStateChange
// with a branch that knows which endpoint to use:

const refetchMessagesForGuest = useCallback(async () => {
  if (!guestToken) return;
  try {
    const response = await fetch(
      `/api/chat/guest?token=${encodeURIComponent(guestToken)}`,
    );
    if (!response.ok) return;
    const data = (await response.json()) as {
      conversationId: string;
      messages: MessageDto[];
      status: ConversationStatus;
    };
    setMessages(data.messages);
    setConversationStatus(data.status);
    setLoadError(null);
  } catch {
    setLoadError("Не вдалося завантажити повідомлення. Спробуйте оновити сторінку.");
  }
}, [guestToken]);

// Inside handleStateChange in the Pusher effect:
if (states.current === "connected" && wasDisconnectedRef.current && conversationId) {
  wasDisconnectedRef.current = false;
  if (hasSession) {
    void refetchMessages();
  } else {
    void refetchMessagesForGuest();
  }
}
```

---

### CR-02: Pusher auth guest path is entirely untested (missing `prisma` mock)

**File:** `src/app/api/chat/pusher/auth/route.ts:71-77` / `src/app/api/chat/pusher/auth/route.test.ts`

**Issue:** The guest branch in the Pusher auth route (lines 60-94) issues a direct `prisma.conversation.findUnique` call to verify `guestToken` ownership. The corresponding test file (`route.test.ts`) does **not** mock `@/lib/db` at all. Any test exercising the guest path would either hit a real database or throw a module-resolution error. Since the test suite never provides `guestToken` in any request body, the entire guest authorization flow — including the `conversation.guestToken !== guestToken` comparison — has zero test coverage. A bug in this comparison could silently allow a guest to subscribe to any channel.

**Fix:** Add `@/lib/db` mock and guest-path test cases to `route.test.ts`:

```typescript
// Add to route.test.ts:
const findUniqueConversation = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    conversation: {
      findUnique: (...args: unknown[]) => findUniqueConversation(...args),
    },
  },
}));

// New test cases:
it("returns 401 when guest has no guestToken", async () => {
  getSession.mockResolvedValue(null);
  const res = await postAuth({ socket_id: "1.2", channel_name: CHANNEL });
  expect(res.status).toBe(401);
});

it("returns 403 when guestToken does not match conversation", async () => {
  getSession.mockResolvedValue(null);
  findUniqueConversation.mockResolvedValue({ guestToken: "correct-token" });
  parseConversationChannel.mockReturnValue(CONV_ID);
  const res = await postAuth({
    socket_id: "1.2",
    channel_name: CHANNEL,
    guestToken: "wrong-token",
  });
  expect(res.status).toBe(403);
});

it("authorizes guest with matching guestToken", async () => {
  getSession.mockResolvedValue(null);
  findUniqueConversation.mockResolvedValue({ guestToken: "uuid-match" });
  parseConversationChannel.mockReturnValue(CONV_ID);
  const res = await postAuth({
    socket_id: "1.2",
    channel_name: CHANNEL,
    guestToken: "uuid-match",
  });
  expect(res.status).toBe(200);
  expect(authorizeChannel).toHaveBeenCalledWith("1.2", CHANNEL);
});
```

---

### CR-03: Schema allows zombie `Conversation` rows (both `userId` and `guestToken` null)

**File:** `prisma/schema.prisma:224-244`

**Issue:** Both `userId` and `guestToken` are `String?` (nullable) with no `@@check` or application-level constraint enforcing that at least one is set. A row with both null is meaningless — it cannot be looked up by either identifier, admin listing shows it as "Гість" with no contact info, and it consumes quota in rate-limit counting. This is exploitable if any code path can trigger `prisma.conversation.create` without providing either field (e.g., a future code path that calls `sendMessage` with a `conversationId` of an already-existing but owner-less row). PostgreSQL supports `@@check` constraints via `@@schema` extensions; Prisma supports them via `@@check` in preview features, or they can be added via a raw migration.

**Fix:** Add a migration-level `CHECK` constraint:

```sql
-- In a new Prisma migration file:
ALTER TABLE "conversation"
  ADD CONSTRAINT "conversation_owner_required"
    CHECK ("userId" IS NOT NULL OR "guest_token" IS NOT NULL);
```

Until Prisma supports `@@check` in stable, add this as a raw SQL migration step and document it. Also add a guard in `getOrCreateConversation` and `getOrCreateGuestConversation` to assert the invariant at the service layer.

---

## Warnings

### WR-01: `appendMessage` depends on `isOpen`, causing Pusher to re-subscribe on every panel open/close

**File:** `src/components/chat/chat-provider.tsx:173-181`, `370`

**Issue:** `appendMessage` is declared with `useCallback` and `[isOpen]` in its dependency array (line 181) because it reads `isOpen` to decide whether to set `unreadFromStore`. The Pusher subscription effect (line 370) lists `appendMessage` as a dependency. This means every time `isOpen` toggles (user opens or closes the chat panel), `appendMessage` gets a new reference, which triggers the Pusher effect cleanup-and-rerun: the existing channel is unsubscribed and a new subscription is initiated. This causes an unnecessary Pusher channel churn (auth round-trip + subscribe) on every open/close cycle.

**Fix:** Use a ref to capture the current `isOpen` value inside `appendMessage`, removing the dep and stabilizing the callback:

```typescript
const isOpenRef = useRef(isOpen);
useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

const appendMessage = useCallback((message: ChatMessage) => {
  setMessages((prev) => {
    if (prev.some((item) => item.id === message.id)) return prev;
    return [...prev, message];
  });
  if (message.senderRole === "STORE") {
    setUnreadFromStore(!isOpenRef.current);
  }
}, []); // stable reference
```

---

### WR-02: Guest POST path in `messages/route.ts` has no test coverage

**File:** `src/app/api/chat/messages/route.ts:74-114` / `src/app/api/chat/messages/route.test.ts`

**Issue:** The test file's only "guest" test case (line 92) sends a request with no `guestToken`, confirming the `401` response. The actual guest-with-token path (lines 79-114) — which calls `sendMessage({ guestToken, senderId: guestToken, … })` and triggers Pusher — has no tests at all. Edge cases not covered: guest sends with valid UUID token, guest hits rate limit (429 path), guest sends to ARCHIVED conversation (403 path), Pusher not configured for guest send (201 fallback). A regression in the `guestToken` forwarding to `sendMessage` would pass the test suite undetected.

**Fix:** Add test cases in `route.test.ts`:

```typescript
it("returns 201 for guest with valid guestToken", async () => {
  getSession.mockResolvedValue(null);
  sendMessage.mockResolvedValue(messageDto);
  const res = await postMessages({
    body: "Привіт",
    guestToken: "123e4567-e89b-12d3-a456-426614174000",
  });
  expect(res.status).toBe(201);
  expect(sendMessage).toHaveBeenCalledWith(
    expect.objectContaining({ guestToken: "123e4567-e89b-12d3-a456-426614174000" })
  );
});

it("returns 429 when guest exceeds rate limit", async () => {
  getSession.mockResolvedValue(null);
  sendMessage.mockRejectedValue(new ChatRateLimitError());
  const res = await postMessages({
    body: "Спам",
    guestToken: "123e4567-e89b-12d3-a456-426614174000",
  });
  expect(res.status).toBe(429);
});
```

---

### WR-03: `socket_id` not validated against Pusher's required format

**File:** `src/app/api/chat/pusher/auth/route.ts:53-57`

**Issue:** Pusher requires `socket_id` to match the pattern `\d+\.\d+` (e.g. `"12345.67890"`). The route only checks that `socketId` is a non-empty string (via `!socketId`). Passing a malformed `socket_id` to `getPusherServer().authorizeChannel(socketId, channelName)` will cause Pusher's SDK to either generate a malformed HMAC signature or throw an unhandled error that propagates to the client as a 500. Depending on the Pusher SDK version, a crafted `socket_id` could also alter the HMAC input in unexpected ways.

**Fix:** Validate `socket_id` format before use:

```typescript
const SOCKET_ID_RE = /^\d+\.\d+$/;

if (!socketId || !channelName || !SOCKET_ID_RE.test(socketId)) {
  return Response.json({ error: "INVALID_BODY" }, { status: 400 });
}
```

---

### WR-04: `GET /api/chat/guest` accepts any string as token with no format validation

**File:** `src/app/api/chat/guest/route.ts:8-11`

**Issue:** The route reads `token` from the query string and passes it directly to `getGuestConversation(token)` → `prisma.conversation.findUnique({ where: { guestToken: token } })`. There is no format check (e.g., UUID validation). Any string — including very long inputs, special characters, or SQL-like patterns — is forwarded to Prisma. While Prisma parameterizes queries (no SQL injection risk), an unbounded string lookup still hits the database on every request with no guard. Combined with the absence of rate limiting on this endpoint, an attacker can spray arbitrary strings against the DB with zero friction. The `sendMessageSchema` validator already enforces UUID format for `guestToken` in POST; the GET endpoint should apply the same constraint.

**Fix:** Validate UUID format before the DB call:

```typescript
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const token = new URL(request.url).searchParams.get("token");

if (!token || !UUID_RE.test(token)) {
  return Response.json({ error: "TOKEN_REQUIRED" }, { status: 400 });
}
```

---

## Info

### IN-01: Dead exports — `GUEST_TOKEN_INVALID` and `GUEST_NOT_FOUND` are never used in production code

**File:** `src/server/services/chat.service.ts:15-16`

**Issue:** Both constants are exported but never imported by any production module (only suppressed in `chat.service.test.ts` via `void GUEST_TOKEN_INVALID; void GUEST_NOT_FOUND;` to silence lint). If they represent planned future error codes, they should be documented with a `// TODO:` comment. If they are leftover from a refactor, they should be removed.

**Fix:** Remove both exports if unused, or add a comment linking them to the open task:

```typescript
// Reserved for future account-linking flow (phase 47):
export const GUEST_TOKEN_INVALID = "GUEST_TOKEN_INVALID";
export const GUEST_NOT_FOUND = "GUEST_NOT_FOUND";
```

---

### IN-02: `guestRedirect` callback is defined but never called

**File:** `src/components/chat/chat-provider.tsx:132-138`

**Issue:** `guestRedirect` is created with `useCallback` (capturing `pathname`, `router`, `searchParams`) but is not referenced anywhere in the component body, the context value, or any JSX. The comment on line 147 (`// D-09: no redirect for guests — widget opens normally`) confirms the redirect was intentionally removed, but the dead callback was not cleaned up.

**Fix:** Delete the `guestRedirect` declaration and its imports of `usePathname`, `useRouter`, `useSearchParams` if those hooks are not used elsewhere.

```diff
- const guestRedirect = useCallback(() => {
-   const query = searchParams.toString();
-   const callbackUrl = encodeURIComponent(
-     `${pathname}${query ? `?${query}` : ""}`,
-   );
-   router.push(`/uviity?callbackUrl=${callbackUrl}`);
- }, [pathname, router, searchParams]);
```

Verify `usePathname`, `useRouter`, `useSearchParams` are still needed before removing their imports.

---

### IN-03: `senderId: ""` in Pusher-sourced messages is a type lie

**File:** `src/components/chat/chat-provider.tsx:323`

**Issue:** When a message arrives over Pusher, `handleMessage` constructs a `ChatMessage` with `senderId: ""` (empty string). The `MessageDto` type declares `senderId: string` (non-nullable, no `| ""` special-casing). Downstream code that reads `senderId` to display sender information or de-duplicate by sender will silently receive an empty string instead of a valid ID. The Pusher payload (`PusherMessagePayload` type, lines 85-91) intentionally omits `senderId` — either the type should reflect this with `senderId?: string`, or the payload should include `senderId` (it is available in the DB row).

**Fix:** Either extend `PusherMessagePayload` to include `senderId` and populate it in `pusherPayload()` in `messages/route.ts`:

```typescript
// In messages/route.ts pusherPayload:
function pusherPayload(message: MessageDto) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    body: message.body,
    senderRole: message.senderRole,
    senderId: message.senderId,   // add this
    createdAt: message.createdAt,
  };
}
```

Or mark `senderId` as optional in `MessageDto` and handle the absent case at usage sites.

---

_Reviewed: 2026-05-25T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
