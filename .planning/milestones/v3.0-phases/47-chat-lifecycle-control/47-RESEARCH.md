# Phase 47: Chat Lifecycle Control - Research

**Researched:** 2026-05-25
**Domain:** Real-time Pusher event broadcasting, Better Auth databaseHooks, Prisma service-layer transaction patterns, Next.js App Router API routes
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CHAT-02 | When a guest registers or logs in, their guest conversation is automatically linked to the account (messages preserved) | Better Auth `databaseHooks.session.create.after` fires on first login — resolved via new `POST /api/chat/claim` endpoint called from hook or a dedicated server action triggered client-side post-login |
| CHAT-04 | Admin can close a chat; within ~1 second the open buyer widget shows "Чат завершено" and input is locked | Admin action `archiveConversationAction` already exists and sets `status="ARCHIVED"`. Phase 47 adds Pusher broadcast of `conversation:closed` event in the same server action / API call so the buyer's open `ChatProvider` receives the real-time update and calls `setConversationStatus("ARCHIVED")` |
| CHAT-05 | After chat is closed, the user sees a "Почати новий чат" button; clicking it opens a new active conversation | Requires: (1) updating `ArchivedChatBanner` to add a button, (2) a `createNewConversation` service function that sets old conversation `isActive=false` and creates a new one, (3) service-layer enforcement of one `isActive=true` per user (deferred from Phase 46) |
</phase_requirements>

---

## Summary

Phase 47 addresses three distinct capabilities: real-time chat close notification (CHAT-04), a "start new chat" button post-close (CHAT-05), and guest-to-account conversation claim on login (CHAT-02).

**CHAT-04** is the simplest to implement: `archiveConversation()` in `chat.service.ts` already sets `status="ARCHIVED"`. The missing piece is broadcasting a Pusher `conversation:closed` event on the same channel (`private-conversation-{id}`) after the DB update. The admin `archiveConversationAction` server action must be extended to call `getPusherServer().trigger()`, and the buyer's `ChatProvider` must bind a `conversation:closed` handler that calls `setConversationStatus("ARCHIVED")`. The `ChatComposer`'s `canSend` guard already locks input when `conversationStatus === "ARCHIVED"`, so the UI update is automatic.

**CHAT-05** requires: (1) updating `ArchivedChatBanner` to show a "Почати новий чат" button, (2) a new `createNewConversation(userId | guestToken)` service function that atomically sets the current active conversation to `isActive=false` and creates a new one (this is where D-06 from Phase 46 finally gets implemented — service-layer uniqueness enforcement via `$transaction`), (3) a new API endpoint `POST /api/chat/new` or server action `createNewConversationAction` that the buyer can call.

**CHAT-02** (guest-to-account claim) is the most architecturally interesting. Better Auth exposes `databaseHooks.session.create.after` in `betterAuth({ databaseHooks: { session: { create: { after } } } })` — confirmed in the installed `@better-auth/core` types. When a guest logs in, a new session is created; the hook fires with the session record (including `userId`). The hook can read a `guestToken` from a cookie (set client-side before login) and call a new `claimGuestConversation(guestToken, userId)` service function. Alternatively, the claim can be triggered via a dedicated `POST /api/chat/claim` API route called by the client after successful login (using `auth-client.ts`'s `useSession()` hook to detect the transition from unauthenticated to authenticated). Both approaches are viable; the databaseHook approach is fully server-side and avoids a second network round-trip.

**Primary recommendation:** Implement in three independent work units: (1) CHAT-04 real-time close event — extend `archiveConversationAction` + ChatProvider binding; (2) CHAT-05 new-chat button — update banner + new service function + new action/endpoint; (3) CHAT-02 guest claim — Better Auth databaseHook + `claimGuestConversation` service function.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Real-time close broadcast (CHAT-04) | API / Backend | — | Pusher `trigger()` is always server-side; called from server action after DB update |
| Buyer widget receives close event (CHAT-04) | Browser / Client | — | `ChatProvider` useEffect binds `conversation:closed` on Pusher channel; sets `conversationStatus` |
| "Почати новий чат" button (CHAT-05) | Browser / Client | — | `ArchivedChatBanner` component; click triggers server action or fetch |
| New conversation creation logic (CHAT-05) | API / Backend | Database / Storage | `createNewConversation()` service function; runs `$transaction` to deactivate old + create new |
| Guest-to-account claim trigger (CHAT-02) | API / Backend | Browser / Client | Better Auth `databaseHooks.session.create.after` for server-side; client fallback via `POST /api/chat/claim` |
| Guest claim DB update (CHAT-02) | Database / Storage | — | `claimGuestConversation(guestToken, userId)` sets `userId`, clears `guestToken`, updates `isActive` if needed |
| `isActive=false` enforcement on conversation close (CHAT-04) | API / Backend | Database / Storage | When admin closes a conversation, `isActive` should be set to `false` so `getConversationForBuyer` does not return the closed one; service-layer `$transaction` |

---

## Standard Stack

This phase installs **zero new packages**. All dependencies are already installed.

### Core (already installed)

| Library | Installed Version | Purpose | Why Used |
|---------|------------------|---------|----------|
| `pusher` (server) | `^5.3.3` [VERIFIED: npm registry] | Broadcast `conversation:closed` event to buyer channel | Already used in `/api/chat/messages/route.ts` |
| `pusher-js` (client) | `^8.5.0` [VERIFIED: npm registry] | Bind `conversation:closed` handler in `ChatProvider` | Already used in `chat-provider.tsx` |
| `better-auth` | installed [VERIFIED: node_modules] | `databaseHooks.session.create.after` for guest claim on login | Already used as auth system |
| `prisma` / `@prisma/client` | `7.8.0` [VERIFIED: npm registry] | `$transaction` for atomic new-conversation creation | Already used throughout |
| `zod` | `^4.4.3` [VERIFIED: npm registry] | Validation in new API endpoints / actions | Already used in `sendMessageSchema` |

### No New Installations

```bash
# No npm install needed for Phase 47
npm list pusher pusher-js better-auth prisma zod --depth=0
```

---

## Package Legitimacy Audit

> Phase 47 installs no new packages. All packages are pre-installed and in production use.

| Package | Registry | Age | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|
| `pusher` 5.3.3 | npm | 10+ yrs | N/A (pre-installed) | Approved |
| `pusher-js` 8.5.0 | npm | 10+ yrs | N/A (pre-installed) | Approved |
| `better-auth` | npm | 1+ yr | N/A (pre-installed) | Approved |
| `prisma` 7.8.0 | npm | 6+ yrs | N/A (pre-installed) | Approved |
| `zod` 4.4.3 | npm | 4+ yrs | N/A (pre-installed) | Approved |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
CHAT-04: Admin closes chat
  Admin browser
    └─ handleArchive() in use-conversation-lifecycle-actions.ts
         └─ archiveConversationAction(conversationId)  [Server Action]
              └─ archiveConversation(id)  [chat.service.ts]
                   ├─ prisma.conversation.update({ status:"ARCHIVED", isActive:false })
                   └─ getPusherServer().trigger(
                         "private-conversation-{id}",
                         "conversation:closed",
                         { conversationId }
                      )

  Buyer browser (ChatProvider — open widget)
    └─ useEffect Pusher subscription
         └─ channel.bind("conversation:closed", handler)
              └─ setConversationStatus("ARCHIVED")
                   └─ canSend = false (existing guard)
                   └─ ArchivedChatBanner renders (existing guard in ChatPanel)

CHAT-05: Buyer starts new chat after close
  Buyer browser (ArchivedChatBanner)
    └─ "Почати новий чат" button click
         └─ fetch POST /api/chat/new  OR  createNewConversationAction()
              └─ createNewConversation({ userId?, guestToken? })  [chat.service.ts]
                   └─ $transaction:
                        ├─ update current active conversation: isActive=false
                        └─ create new Conversation: isActive=true, status=OPEN
              └─ returns { conversationId }
         └─ ChatProvider: setConversationId(newId), setConversationStatus("OPEN"), setMessages([])

CHAT-02: Guest registers/logs in → conversation claimed
  Option A (Better Auth databaseHook — server-side):
    Browser (guest, sends messages then registers)
      └─ localStorage has "chat_guest_token"
           └─ Before sign-up form submit: client writes guestToken to a short-lived cookie
                └─ POST /api/auth/sign-up  → Better Auth creates user + session
                     └─ databaseHooks.session.create.after(session, ctx)  [auth.ts]
                          └─ Read guestToken cookie from ctx.request headers
                               └─ claimGuestConversation(guestToken, session.userId)
                                    └─ prisma.conversation.update({ userId, guestToken:null })

  Option B (Client-triggered claim — simpler, no cookie needed):
    Browser (guest, sends messages then registers)
      └─ useSession() detects session change: null → user
           └─ If localStorage.getItem("chat_guest_token"):
                └─ POST /api/chat/claim { guestToken }  (with session cookie now set)
                     └─ requireBuyer() validates session
                          └─ claimGuestConversation(guestToken, session.userId)
                               └─ prisma.conversation.update({ userId, guestToken:null })
                          └─ localStorage.removeItem("chat_guest_token")
                          └─ setConversationId from response / keep existing
```

### Recommended Project Structure

No new directories needed. Changes to existing files + two new files:

```
src/
├── server/
│   └── services/
│       └── chat.service.ts        # NEW: claimGuestConversation, createNewConversation
│   └── actions/
│       ├── admin/
│       │   └── chat.actions.ts    # EXTEND: archiveConversationAction → also trigger Pusher
│       └── chat.actions.ts        # MAYBE: createNewConversationAction (buyer action)
├── lib/
│   └── auth.ts                    # EXTEND: add databaseHooks.session.create.after (CHAT-02 Option A)
└── app/
    └── api/
        └── chat/
            ├── claim/
            │   └── route.ts       # NEW (if Option B): POST /api/chat/claim
            └── new/
                └── route.ts       # NEW (if endpoint not action): POST /api/chat/new
src/components/
└── chat/
    ├── archived-chat-banner.tsx   # EXTEND: add "Почати новий чат" button + handler
    └── chat-provider.tsx          # EXTEND: bind "conversation:closed" Pusher event
```

### Pattern 1: Pusher broadcast from Server Action (CHAT-04)

**What:** Server action calls Pusher `trigger()` after the DB update. Mirrors the existing pattern in `/api/chat/messages/route.ts`.

**When to use:** Any time a server-side mutation needs real-time notification to connected clients.

**Example:**
```typescript
// Source: src/server/actions/admin/chat.actions.ts (extending archiveConversationAction)
import { getPusherServer, conversationChannel, PusherNotConfiguredError } from "@/lib/pusher-server";

export async function archiveConversationAction(conversationId: string) {
  await requireAdmin();
  const id = conversationIdSchema.parse(conversationId);
  await archiveConversation(id);  // sets status=ARCHIVED, isActive=false

  // Notify buyer's open widget in real-time
  try {
    await getPusherServer().trigger(
      conversationChannel(id),
      "conversation:closed",
      { conversationId: id },
    );
  } catch (error) {
    if (!(error instanceof PusherNotConfiguredError)) throw error;
  }

  revalidateAdminChat();
  return { ok: true as const };
}
```

### Pattern 2: Client-side Pusher event binding (CHAT-04)

**What:** Add `conversation:closed` handler in the Pusher `useEffect` in `ChatProvider`. Reuses the existing subscription effect pattern.

**Example:**
```typescript
// Source: src/components/chat/chat-provider.tsx (extending existing Pusher useEffect)
const handleClose = (payload: { conversationId: string }) => {
  if (cancelled || payload.conversationId !== conversationId) return;
  setConversationStatus("ARCHIVED");
};

channel.bind("conversation:closed", handleClose);
// ...in cleanup:
channel.unbind("conversation:closed", handleClose);
```

### Pattern 3: createNewConversation with D-06 enforcement (CHAT-05)

**What:** Atomic transaction that deactivates the current active conversation and creates a new one. This is where D-06's service-layer uniqueness enforcement is implemented.

**Example:**
```typescript
// Source: src/server/services/chat.service.ts (new function)
export async function createNewConversation(
  input: { userId: string } | { guestToken: string }
): Promise<{ id: string }> {
  return prisma.$transaction(async (tx) => {
    // Deactivate current active conversation
    if ("userId" in input) {
      await tx.conversation.updateMany({
        where: { userId: input.userId, isActive: true },
        data: { isActive: false },
      });
      return tx.conversation.create({
        data: { userId: input.userId, isActive: true },
      });
    } else {
      // Guest: guestToken stays — same guest can start fresh
      await tx.conversation.updateMany({
        where: { guestToken: input.guestToken, isActive: true },
        data: { isActive: false },
      });
      return tx.conversation.create({
        data: { guestToken: input.guestToken, isActive: true },
      });
    }
  });
}
```

**Why `updateMany` not `update`:** After Phase 46, `isActive=true` uniqueness is service-enforced not DB-enforced. `updateMany` is defensive — it handles any data inconsistency without throwing.

### Pattern 4: claimGuestConversation (CHAT-02)

**What:** Called when a guest user logs in. Links their guestToken conversation to their new userId. Clears `guestToken` so the conversation is now user-owned.

**Example:**
```typescript
// Source: src/server/services/chat.service.ts (new function)
export async function claimGuestConversation(
  guestToken: string,
  userId: string,
): Promise<void> {
  // Check if user already has an active conversation — don't create duplicates
  const userActive = await prisma.conversation.findFirst({
    where: { userId, isActive: true },
  });

  if (userActive) {
    // User already has an active conversation — guest conv becomes inactive history
    // Update guestToken conv: set userId (for history) but isActive=false
    await prisma.conversation.updateMany({
      where: { guestToken, isActive: true },
      data: { userId, guestToken: null, isActive: false },
    });
  } else {
    // Claim the guest conversation as the user's active conversation
    await prisma.conversation.updateMany({
      where: { guestToken },
      data: { userId, guestToken: null },
    });
  }
}
```

**Note:** `updateMany` by `guestToken` (not `update` by `{ guestToken }` unique key) is used because after claim, `guestToken` becomes `null` — the unique constraint means only one row matches. `updateMany` is equally safe here and avoids a throw on not-found.

### Pattern 5: Better Auth databaseHook for session.create (CHAT-02 Option A)

**What:** Better Auth fires `databaseHooks.session.create.after` every time a new session is created (on sign-in and sign-up). Add the hook in `auth.ts`.

**Confirmed from:** `@better-auth/core/dist/types/init-options.d.mts` — `databaseHooks.session.create.after` exists [VERIFIED: node_modules].

**Challenge:** The hook receives the `session` object (with `userId`) but NOT the HTTP request body (the guest token must come from somewhere). Reading a cookie from `ctx` requires checking what `GenericEndpointContext` exposes. Safer alternative: **Option B** — client calls `POST /api/chat/claim` immediately after login.

**Example (Option B — recommended):**
```typescript
// Pattern: client detects session presence after login, then calls claim
// In a component that mounts after auth (e.g., post-login redirect page, or ChatProvider):
// After auth-client detects session creation (useSession hook changes from null to user),
// read guestToken from localStorage and POST to /api/chat/claim.

// POST /api/chat/claim route:
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await request.json();
  const guestToken = z.string().uuid().safeParse(body?.guestToken);
  if (!guestToken.success) return Response.json({ error: "INVALID_TOKEN" }, { status: 400 });

  await claimGuestConversation(guestToken.data, session.user.id);
  return Response.json({ ok: true });
}
```

**Client trigger point:** `ChatProvider` mount effect — after the guest token restore effect, add an effect that checks `hasSession && guestToken` (i.e., user just logged in while guest token exists in localStorage) and auto-calls the claim endpoint. This handles the case where a guest opens chat, sends messages, then logs in WITHOUT leaving the page.

### Anti-Patterns to Avoid

- **Broadcasting `conversation:closed` from the service function:** The service layer (`chat.service.ts`) has no knowledge of Pusher. Keep Pusher calls in the action layer (`chat.actions.ts`) or API route, not the service. Mirrors the existing pattern in `POST /api/chat/messages/route.ts`.
- **Adding a new `CLOSED` enum value to `ConversationStatus`:** The phase goal uses "closed" as a UX concept, but the existing `ARCHIVED` status already means the same thing — admin-terminated conversation. Adding `CLOSED` would require a schema migration with no functional gain. Use `ARCHIVED` as-is.
- **Blocking the Better Auth `databaseHooks.session.create.after` hook with a slow DB call:** The hook is synchronous from Better Auth's perspective — if it throws, the session creation may fail. Wrap in try/catch and log errors; never let claim failure block login.
- **Resetting `guestToken` in the Pusher client singleton when claim completes:** After claim, `setGuestTokenForPusher(null)` should be called. The conversation is now user-owned and the Pusher auth for the channel will use the session instead of guestToken.
- **Not clearing localStorage after successful claim:** `localStorage.removeItem("chat_guest_token")` must be called after successful claim; otherwise, on next page load the guest restore effect runs and gets a 404 (the guestToken was cleared on the conversation).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Real-time close notification | Polling the status endpoint | `pusher.trigger("conversation:closed")` | Sub-second delivery; polling adds 500ms+ latency and hammers the DB |
| One-active-conversation-per-user invariant | Application-level `if` checks scattered across code | `$transaction` with `updateMany` in `createNewConversation()` | Atomic — prevents race condition where two tabs simultaneously create conversations |
| Guest claim idempotency | Manual deduplication | `updateMany({ where: { guestToken } })` — no-ops if already claimed | `updateMany` returns count; if 0, conversation was already claimed; safe to re-call |
| UUID validation of guestToken in claim endpoint | Regex | `z.string().uuid()` (Zod v4 — already used in project) | Consistent with existing `sendMessageSchema.guestToken` validation |

**Key insight:** The close notification infrastructure (Pusher trigger → client bind) is already half-built. The message route shows the trigger pattern; the ChatProvider already handles the received data. Phase 47 is wiring an event name across the existing channel.

---

## Common Pitfalls

### Pitfall 1: archiveConversationAction is a "use server" function — Pusher trigger is async but action must remain serializable

**What goes wrong:** Server actions in Next.js must serialize their return value. The `getPusherServer().trigger()` call returns a Promise. If awaited inside the action, it adds latency before the action returns. If not properly awaited, the trigger may not fire before the response is sent.

**Why it happens:** Server actions are similar to RPC — they run on the server and return to the client. Async operations within them must be properly awaited.

**How to avoid:** `await getPusherServer().trigger(...)` before `revalidateAdminChat()`. Wrap in the same try/catch pattern used in the messages route — catch `PusherNotConfiguredError` and silently continue; re-throw other errors. Do not fire-and-forget.

**Warning signs:** `conversation:closed` event never arrives in buyer widget; no error in server logs.

### Pitfall 2: ChatProvider's Pusher useEffect doesn't update `conversationStatus` for already-open panels

**What goes wrong:** The buyer's panel is open. Admin closes the chat. The `conversation:closed` Pusher event arrives. `setConversationStatus("ARCHIVED")` is called. BUT: if the `useEffect` re-runs due to `conversationStatus` changing (and `conversationStatus` is in the dependency array), it could unsubscribe and re-subscribe, missing the event or causing a loop.

**Why it happens:** The existing Pusher `useEffect` depends on `[appendMessage, conversationId, guestToken, hasSession, isOpen, refetchMessages, refetchMessagesForGuest]`. Adding `setConversationStatus` as a handler that calls a state setter triggers a re-render but NOT a re-subscription (the deps don't include `conversationStatus`). This is correct behavior.

**How to avoid:** The `conversation:closed` handler should call `setConversationStatus("ARCHIVED")` — a React state dispatch that is stable across renders. Do NOT add `conversationStatus` to the Pusher effect dependency array.

**Warning signs:** Infinite re-subscription loop in Pusher debug console; "Disconnect and reconnect" cycling.

### Pitfall 3: createNewConversation for guests must use the current active conversationId in ChatProvider

**What goes wrong:** Guest closes a conversation and starts a new one. The `createNewConversation({ guestToken })` call on the backend sets the old conversation's `isActive=false` and creates a new one. The client calls `setConversationId(newId)`. BUT: the Pusher subscription must also switch to the new channel (`private-conversation-{newId}`). If `conversationId` in state is updated, the Pusher `useEffect` will re-run (it depends on `conversationId`) and subscribe to the new channel — this is correct.

**Why it happens:** The existing Pusher effect correctly reacts to `conversationId` changes.

**How to avoid:** After `createNewConversation` returns the new `conversationId`: call `setConversationId(newId)`, `setConversationStatus("OPEN")`, `setMessages([])`. The Pusher effect cleanup and re-subscribe will happen automatically.

**Warning signs:** Buyer still subscribed to the old closed channel after starting a new conversation.

### Pitfall 4: Guest claim race condition — user logs in from two tabs simultaneously

**What goes wrong:** Two tabs are open. Both have the same `guestToken` in localStorage. Both call `POST /api/chat/claim` simultaneously. Both call `claimGuestConversation(guestToken, userId)`. First call: `updateMany({ where: { guestToken } })` updates 1 row. Second call: `updateMany({ where: { guestToken } })` — `guestToken` is now `null` on that row, so 0 rows updated. Idempotent — no problem.

**Why it happens:** `updateMany` with `where: { guestToken }` matches only if `guestToken` still equals the token. After first claim sets `guestToken=null`, the second call finds 0 rows and succeeds silently.

**How to avoid:** No action needed — `updateMany` is inherently idempotent for this use case.

**Warning signs:** Duplicate conversations in user account history (should NOT happen with this pattern).

### Pitfall 5: Better Auth databaseHook Option A — `ctx` does not reliably expose request cookies

**What goes wrong:** Trying to read the guest token from a cookie inside `databaseHooks.session.create.after` requires access to the HTTP request. `GenericEndpointContext` from Better Auth does expose a request object in many endpoints, but it is typed as `null`-able and may not be available when the session is created programmatically (e.g., via admin impersonation).

**Why it happens:** Better Auth's `GenericEndpointContext` is `null` for programmatically created sessions.

**How to avoid:** Use **Option B** (client-triggered `POST /api/chat/claim` after successful login). This is simpler, more robust, and does not depend on Better Auth internals. If Option A is chosen, always null-check `ctx` and fail silently.

**Warning signs:** `TypeError: Cannot read properties of null (reading 'request')` in server logs on login.

### Pitfall 6: `isActive` not set to `false` when archiving — creates orphaned active conversation

**What goes wrong:** Phase 46 added `isActive` to gates on "active conversation" lookups (`findFirst({ where: { userId, isActive: true } })`). If `archiveConversation()` only sets `status="ARCHIVED"` (current behavior) but does NOT set `isActive=false`, then after archiving, `getConversationForBuyer(userId)` still returns the ARCHIVED conversation. When the user tries to send a new message, `assertConversationOpen()` throws `CHAT_ARCHIVED`. But when they start a new one (CHAT-05), `getConversationForBuyer` still returns the old archived one.

**Why it happens:** `isActive=true` was added in Phase 46 for future-proofing, but `archiveConversation()` was not updated to set `isActive=false`.

**How to avoid:** Update `archiveConversation()` in `chat.service.ts` to set `isActive=false` alongside `status="ARCHIVED"` in the same `update` call.

**Warning signs:** After admin archives a chat, `getConversationForBuyer(userId)` returns the archived conversation; creating a new conversation for the same user fails or creates a second `isActive=true` row.

### Pitfall 7: ChatProvider claim effect fires every render if `hasSession` is a dependency

**What goes wrong:** The claim effect that fires `POST /api/chat/claim` when `hasSession === true && guestToken !== null` runs once on mount. If `hasSession` or `guestToken` are in the deps array and either changes mid-session (e.g., session refresh), the claim fires again. But the second `updateMany` call finds 0 rows (guestToken already null) — idempotent, but generates a wasted network call.

**How to avoid:** Use a `useRef` to track whether claim has already been attempted in this session. Set it to `true` after the first POST; don't re-call if already attempted.

---

## Code Examples

### Extended archiveConversation service function (sets isActive=false)

```typescript
// Source: src/server/services/chat.service.ts (current + modification)
export async function archiveConversation(conversationId: string) {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: "ARCHIVED", isActive: false },  // isActive=false added
  });
}
```

### conversation:closed Pusher handler in ChatProvider

```typescript
// Source: src/components/chat/chat-provider.tsx (inside existing Pusher useEffect)
const handleClose = (payload: { conversationId: string }) => {
  if (cancelled || payload.conversationId !== conversationId) return;
  setConversationStatus("ARCHIVED");
};

channel.bind("conversation:closed", handleClose);
// In cleanup:
channel.unbind("conversation:closed", handleClose);
```

### ArchivedChatBanner with "Почати новий чат" button

```typescript
// Source: src/components/chat/archived-chat-banner.tsx (extending current banner)
"use client";

import { useState } from "react";
import { useChat } from "@/components/chat/chat-provider";
import { Button } from "@/components/ui/button";

export function ArchivedChatBanner() {
  const { conversationId, guestToken, setConversationId, setConversationStatus, appendMessage } = useChat();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartNew = async () => {
    setIsStarting(true);
    try {
      const res = await fetch("/api/chat/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentConversationId: conversationId, guestToken }),
      });
      if (!res.ok) return;
      const data = await res.json() as { conversationId: string };
      setConversationId(data.conversationId);
      setConversationStatus("OPEN");
      // Messages are reset by the existing fetch effect that runs when conversationId changes
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div role="status" className="border-b border-border bg-muted px-4 py-3">
      <p className="text-sm font-semibold text-foreground">Чат завершено</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Ви можете переглядати історію, але нові повідомлення надіслати не можна.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        disabled={isStarting}
        onClick={() => void handleStartNew()}
      >
        Почати новий чат
      </Button>
    </div>
  );
}
```

**Note:** The text "Чат завершено" is specified in the success criteria. The current banner says "Діалог закрито магазином" — update text to match requirement.

### POST /api/chat/new route (CHAT-05)

```typescript
// Source: pattern from src/app/api/chat/messages/route.ts
// src/app/api/chat/new/route.ts
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createNewConversation } from "@/server/services/chat.service";
import { z } from "zod";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  if (session?.user) {
    const conversation = await createNewConversation({ userId: session.user.id });
    return Response.json({ conversationId: conversation.id }, { status: 201 });
  }

  // Guest path
  const parsed = z.object({ guestToken: z.string().uuid() }).safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "INVALID_TOKEN" }, { status: 400 });
  }
  const conversation = await createNewConversation({ guestToken: parsed.data.guestToken });
  return Response.json({ conversationId: conversation.id }, { status: 201 });
}
```

### POST /api/chat/claim route (CHAT-02 Option B)

```typescript
// src/app/api/chat/claim/route.ts
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { claimGuestConversation } from "@/server/services/chat.service";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = z.object({ guestToken: z.string().uuid() }).safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "INVALID_TOKEN" }, { status: 400 });
  }

  await claimGuestConversation(parsed.data.guestToken, session.user.id);
  return Response.json({ ok: true });
}
```

### Guest claim effect in ChatProvider (CHAT-02)

```typescript
// Source: src/components/chat/chat-provider.tsx (new useEffect after existing mount effect)
const claimAttemptedRef = useRef(false);

useEffect(() => {
  // Fire when user just logged in and a guestToken exists in localStorage
  if (!hasSession || claimAttemptedRef.current) return;
  if (typeof window === "undefined") return;

  const stored = localStorage.getItem("chat_guest_token");
  if (!stored) return;

  claimAttemptedRef.current = true;
  void (async () => {
    try {
      const res = await fetch("/api/chat/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestToken: stored }),
      });
      if (res.ok) {
        localStorage.removeItem("chat_guest_token");
        setGuestToken(null);
        setGuestTokenForPusher(null);
        // Conversation is now user-owned; SSR will load it on next page transition
        // or we can trigger a refetch here
      }
    } catch {
      // Claim failed — silently continue; user can still see their messages
      // The guest conversation still has their messages visible via guestToken
    }
  })();
}, [hasSession]); // only runs when hasSession changes to true
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `archiveConversation()` only sets `status="ARCHIVED"` | Phase 47: also sets `isActive=false` | Phase 47 | Enables `getConversationForBuyer` to skip closed conversations; prerequisite for CHAT-05 |
| `ArchivedChatBanner` is static — no action button | Phase 47: adds "Почати новий чат" button | Phase 47 | CHAT-05 fulfilled |
| No real-time close notification for buyer | Phase 47: `conversation:closed` Pusher event | Phase 47 | CHAT-04 fulfilled — ~1 second delivery |
| Guest conversation lives in guestToken forever | Phase 47: `claimGuestConversation` links to userId | Phase 47 | CHAT-02 fulfilled — messages preserved on login |
| D-06 deferred to Phase 47 (no filtered unique index) | Service-layer `$transaction` in `createNewConversation` | Phase 47 | One-active-conversation invariant enforced in code |

**Deprecated/outdated:**
- `archiveConversation()` without `isActive=false`: update it in Phase 47 to include `isActive: false`.
- `ArchivedChatBanner` as a pure display component: it becomes interactive in Phase 47 (add `"use client"` directive if not already, add button + handler).
- Current text "Діалог закрито магазином" in `ArchivedChatBanner`: success criteria requires "Чат завершено" — update the heading text.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Better Auth `databaseHooks.session.create.after` is available and fires on both sign-in and sign-up | Patterns #5 | Verified in `@better-auth/core/dist/types/init-options.d.mts` [VERIFIED: node_modules] — risk is LOW |
| A2 | `getPusherServer().trigger()` can be called from a Next.js Server Action (not just API route handlers) | Patterns #1 | The existing pattern in `messages/route.ts` is an API route; server actions run in the same server environment. `pusher` npm package uses Node.js `https` — works in both. [ASSUMED] — test in Wave 0 |
| A3 | `GenericEndpointContext` in Better Auth's `databaseHooks.session.create.after` exposes request headers needed to read a cookie (for Option A) | Patterns #5 | Explicitly noted as NOT reliable — this is why Option B is recommended |
| A4 | `updateMany({ where: { guestToken } })` correctly handles the claim race condition idempotently | Patterns #4 | Reasoning: `guestToken` is unique; after first claim sets it to null, second call finds 0 rows. [ASSUMED] — logical but not integration-tested |
| A5 | `ArchivedChatBanner` does not currently have `"use client"` — adding a button requires it | Code Examples | Verified: current file has no `"use client"` directive (it's a pure JSX component with no hooks or event handlers). Adding a button with `onClick` requires `"use client"` [VERIFIED: codebase read] |

---

## Open Questions

1. **Should claim happen in ChatProvider or on a dedicated page?**
   - What we know: The success criterion says "after login, that conversation appears in their account history with all prior messages intact." The claim can fire either from `ChatProvider`'s mount effect (if the chat widget is still open after login) or from a post-login redirect page.
   - What's unclear: If the user logs in via the `/uviity` auth page (which redirects away from the storefront), the `ChatProvider` unmounts during login. On return, the mount effect with `hasSession=true` will fire the claim.
   - Recommendation: The `hasSession` dependency approach in ChatProvider handles both cases. Include the claim effect in `ChatProvider` — it fires on any remount after login, regardless of navigation path.

2. **Should `createNewConversation` reset messages in ChatProvider client state?**
   - What we know: When `conversationId` changes in `ChatProvider`, the existing `useEffect` that loads messages fires (`!isOpen || !hasSession` guard). But for guests (`!hasSession`), the message-load effect does NOT fire — only the guest restore endpoint is used.
   - What's unclear: Whether the messages state is cleared when `setConversationId(newId)` is called.
   - Recommendation: `ArchivedChatBanner`'s handler should explicitly call `setMessages([])` (via a new context action) OR the messages-load effect should be made guest-aware. Simplest: the "start new chat" handler resets messages in client state before setting the new conversation ID.

3. **Does the `conversation:closed` Pusher event need to be sent on `unarchiveConversationAction` too?**
   - What we know: Unarchive (reopen) is an admin operation. If a buyer's widget is open and shows the archived banner, should it automatically flip back to OPEN if admin unarchives?
   - What's unclear: Whether this is in scope for Phase 47. The requirements only specify CHAT-04 (close) and CHAT-05 (new chat). Unarchive is existing functionality.
   - Recommendation: Out of scope for Phase 47. Do not add a `conversation:reopened` event — it is not required by CHAT-04 or CHAT-05.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Pusher (server, `PUSHER_APP_ID` etc.) | CHAT-04 real-time close | ✓ | App ID 2155856, cluster eu (from Phase 46 research) | Graceful: `PusherNotConfiguredError` caught + ignored |
| Pusher (client, `NEXT_PUBLIC_PUSHER_KEY`) | CHAT-04 buyer widget | ✓ | Set in env | isPusherClientConfigured() guard |
| Better Auth `databaseHooks` | CHAT-02 Option A | ✓ | Verified in @better-auth/core types | Option B (client POST) |
| PostgreSQL / Prisma | All | ✓ | Neon hosted, Prisma 7.8.0 | — |

**Missing dependencies with no fallback:** None.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npx vitest run src/server/services/chat.service.test.ts` |
| Full suite command | `npx vitest run` |

### Baseline

368 tests pass, 2 fail (pre-existing `prisma/seed.test.ts` — unrelated to Phase 47). Phase 47 must not increase the failure count.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHAT-04 | `archiveConversation` sets `isActive=false` alongside `status=ARCHIVED` | unit | `npx vitest run src/server/services/chat.service.test.ts` | ✅ extend existing test |
| CHAT-04 | `archiveConversationAction` triggers Pusher `conversation:closed` event | unit | `npx vitest run src/server/actions/admin/chat.actions.test.ts` | ❌ Wave 0 |
| CHAT-05 | `createNewConversation({ userId })` deactivates old + creates new in $transaction | unit | `npx vitest run src/server/services/chat.service.test.ts` | ❌ Wave 0 |
| CHAT-05 | `createNewConversation({ guestToken })` works for guest | unit | `npx vitest run src/server/services/chat.service.test.ts` | ❌ Wave 0 |
| CHAT-02 | `claimGuestConversation(guestToken, userId)` links conversation to user | unit | `npx vitest run src/server/services/chat.service.test.ts` | ❌ Wave 0 |
| CHAT-02 | `claimGuestConversation` is idempotent (second call is no-op) | unit | `npx vitest run src/server/services/chat.service.test.ts` | ❌ Wave 0 |
| CHAT-02 | `claimGuestConversation` when user already has active conversation: guest conv becomes inactive | unit | `npx vitest run src/server/services/chat.service.test.ts` | ❌ Wave 0 |
| CHAT-02 | `POST /api/chat/claim` returns 401 without session | unit | `npx vitest run src/app/api/chat/claim/route.test.ts` | ❌ Wave 0 |
| CHAT-04 | `conversationStatus === "ARCHIVED"` → `canSend === false` (existing behavior) | unit | Already tested via chat.service tests | ✅ existing |

### Sampling Rate

- **Per task commit:** `npx vitest run src/server/services/chat.service.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green (excluding 2 pre-existing seed failures) before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/server/services/chat.service.test.ts` — add tests for `claimGuestConversation` (3 cases) and `createNewConversation` (2 cases)
- [ ] `src/server/actions/admin/chat.actions.test.ts` — test that `archiveConversationAction` triggers Pusher (mock `getPusherServer`)
- [ ] `src/app/api/chat/claim/route.test.ts` — basic auth guard test (requires session)
- [ ] Extend existing `archiveConversation` test in `chat.service.test.ts` to assert `isActive=false`

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `requireAdmin()` gates close action; `requireBuyer()` / session check gates claim endpoint |
| V3 Session Management | yes | Session transitions (guest → user) must not expose guest token to other users; claim clears `guestToken` from DB |
| V4 Access Control | yes | Admin-only: archive action. Buyer-only: claim, new-chat endpoints. Guest: new-chat by guestToken |
| V5 Input Validation | yes | `z.string().uuid()` for guestToken; `z.string().cuid()` for conversationId in all endpoints |
| V6 Cryptography | no | No new crypto in Phase 47 |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Non-admin calling `archiveConversationAction` | Elevation of Privilege | `requireAdmin()` at action top — throws 401/403 before DB access |
| Guest token used by malicious party to claim someone else's conversation | Spoofing | `claimGuestConversation` runs only when session exists (verified userId); token validated as UUID; after claim, token is cleared |
| Buyer calls `POST /api/chat/claim` with another user's guestToken | Tampering | Claim links token to the authenticated `session.user.id` — can only claim conversations the attacker controls the token for (requires knowing the UUID, 2^122 entropy) |
| Race condition on `createNewConversation` from two tabs | DoS / Data Integrity | `$transaction` with `updateMany` is atomic; second call creates a second new conversation — acceptable (user just gets two new empty conversations; old one is deactivated) |
| `conversation:closed` event spoofed by a client | Tampering | Not possible — clients cannot trigger server-side Pusher events on `private-*` channels; only server can `trigger()` |

---

## Sources

### Primary (HIGH confidence)

- `src/server/services/chat.service.ts` — current service functions, confirmed `archiveConversation` sets only `status` (not `isActive`); confirmed `isUniqueViolation` pattern; read directly
- `src/server/actions/admin/chat.actions.ts` — current `archiveConversationAction` without Pusher trigger; read directly
- `src/components/chat/chat-provider.tsx` — Pusher `useEffect` structure, existing event bindings, `conversationStatus` state flow; read directly
- `src/components/chat/archived-chat-banner.tsx` — current static banner, no `"use client"`, no button; read directly
- `src/components/chat/chat-panel.tsx` — `isArchived` guard; read directly
- `src/app/api/chat/messages/route.ts` — confirmed Pusher trigger pattern in API route; read directly
- `src/lib/pusher-server.ts` — `conversationChannel()` helper and `PusherNotConfiguredError`; read directly
- `node_modules/@better-auth/core/dist/types/init-options.d.mts` lines 1079-1150 — `databaseHooks.session.create.after` type definition; read directly [VERIFIED: node_modules]
- `prisma/schema.prisma` — confirmed `ConversationStatus` enum has only `OPEN` and `ARCHIVED` (no `CLOSED`); `isActive Boolean @default(true)` confirmed present; read directly
- `vitest.config.ts` — test framework confirmed Vitest 4.1.6; read directly

### Secondary (MEDIUM confidence)

- Phase 46 Research (`46-RESEARCH.md`) — D-06 service-layer enforcement deferred to Phase 47 confirmed; architectural patterns for Pusher auth carry forward
- Phase 46 Plan 04 Summary (`46-04-SUMMARY.md`) — confirmed `setGuestTokenForPusher` export and `paramsProvider` pattern in pusher-client.ts

---

## Metadata

**Confidence breakdown:**

- CHAT-04 (real-time close): HIGH — Pusher trigger pattern confirmed in codebase; `conversation:closed` event name is new but follows established pattern exactly
- CHAT-05 (new chat button): HIGH — `createNewConversation` logic is straightforward service function; `ArchivedChatBanner` modification is minimal
- CHAT-02 (guest claim): MEDIUM-HIGH — Option B (client-triggered) is confirmed viable; Option A (Better Auth hook) has a known risk (ctx null-ability) documented
- Architecture patterns: HIGH — all derived directly from reading actual production code

**Research date:** 2026-05-25
**Valid until:** 2026-06-25 (stable stack; Pusher API and Better Auth internals are unlikely to change meaningfully in 30 days)
