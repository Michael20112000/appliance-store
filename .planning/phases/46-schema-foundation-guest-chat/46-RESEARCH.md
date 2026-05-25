# Phase 46: Schema Foundation + Guest Chat - Research

**Researched:** 2026-05-25
**Domain:** Prisma schema migration, guest session management (localStorage), Pusher private-channel auth extension, Next.js App Router API routes
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Lazy creation — `Conversation` is created in DB only on first message Send. `guestToken` UUID is generated on widget open and stored in `localStorage`, but no DB write until Send.
- **D-02:** On widget open, if `localStorage` has `chat_guest_token`, attempt `GET /api/chat/guest?token={token}` to restore existing conversation. If 404, generate a new token (no DB write yet).
- **D-03:** Display name is always `"Гість"` — no token prefix or sequential number. `listConversationsForAdmin` falls back to `"Гість"` when `userId` is null.
- **D-04:** Same channel pattern `private-conversation-{conversationId}`. Extend `/api/chat/pusher/auth` to accept `guestToken` in the request body alongside `socket_id` and `channel_name`. No new channel type.
- **D-05:** Migration steps in order: (1) make `userId` nullable `String?`; (2) remove `@unique` from `userId`; (3) add `guestToken String? @unique`; (4) add `isActive Boolean @default(true)`; (5) add composite index `@@index([userId, isActive])`.
- **D-06:** Filtered unique constraint on `(userId, isActive)` where `isActive = true`. Implemented as Prisma `@@unique([userId, isActive])` with application-level enforcement (Prisma 7 `partialIndexes` preview feature available — see findings). Fallback: enforce in service layer via `$transaction`.
- **D-07:** All existing `getOrCreateConversation(userId)` and `getConversationForBuyer(userId)` calls updated to `findFirst({ where: { userId, isActive: true } })`.
- **D-08:** `POST /api/chat/messages` extended to accept `guestToken` in request body when no session. Service resolves conversation by `guestToken`. Rate limiting uses guestToken as `senderId` (IP as fallback).
- **D-09:** `openPanel()` no longer calls `guestRedirect()` for unauthenticated users. Widget opens normally for guests.
- **D-10:** On mount, `ChatProvider` reads `localStorage.getItem('chat_guest_token')`. If present, calls restore endpoint. If absent and guest opens panel, generates `crypto.randomUUID()` and stores it — no DB write yet.

### Claude's Discretion

- Rate limiting by IP for guests (vs guestToken) — implementation detail for planner to decide.
- Guest registration nudge UI — Phase 46 can include a simple static hint but not a hard requirement.

### Deferred Ideas (OUT OF SCOPE)

- Chat closing — Phase 47.
- Guest→account migration — Phase 47.
- History drawer — Phase 48.
- File attachments — Phase 49.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CHAT-01 | Незареєстрований користувач може відкрити чат-віджет і надсилати текстові повідомлення без реєстрації; сесія зберігається через localStorage (`chat_guest_token`) | D-01, D-02, D-08, D-09, D-10 — schema + localStorage + API extension pattern |
| CHAT-03 | У адмінській панелі гостьовий користувач відображається як "Гість" | D-03 — `listConversationsForAdmin` service fallback from `"Покупець"` to `"Гість"` for null userId |
</phase_requirements>

---

## Summary

Phase 46 is a pure extension of the existing chat system. No new infrastructure (Pusher, Cloudinary, Better Auth) is needed. The work falls into four areas: (1) a Prisma schema migration, (2) a new `GET /api/chat/guest` restore endpoint + extension of `POST /api/chat/messages` and `POST /api/chat/pusher/auth`, (3) service-layer function updates in `chat.service.ts`, and (4) `ChatProvider` guest mode (no redirect, localStorage token management).

The codebase already has an excellent precedent for guest token patterns via `Order.guestAccessToken` (UUID, stored as httpOnly cookie) and `guest-storage.ts` for localStorage management (used by the guest wishlist). Both patterns should guide implementation. The existing `isUniqueViolation()` upsert guard in `chat.service.ts` is directly reusable for the guest conversation creation race condition. The `parseAuthBody()` in the Pusher auth route already supports both form-encoded and JSON bodies — it only needs the `guestToken` field added to its type and parsing logic.

**Primary recommendation:** Implement the Prisma migration first, then update the service layer, then add/extend API routes, then update `ChatProvider`. Each step is independently testable and the order prevents TypeScript compile errors from cascading.

A critical detail: `Conversation.userId` is currently typed as non-nullable in `ConversationSummaryDto` (`userId: string`). After migration it becomes `String?` in the schema — the DTO type and all callers that pass `userId` to `prisma.user.findMany` must filter nulls, otherwise the Prisma query receives `undefined` values in the `in` clause.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Schema migration (guestToken, nullable userId, isActive) | Database / Storage | — | DDL change lives in Prisma schema + migration SQL |
| Guest conversation create/restore | API / Backend | — | DB write happens server-side; guestToken is validated against DB |
| Pusher channel authorization for guests | API / Backend | — | `private-*` auth is always server-side; guestToken is verified in DB before authorizing |
| localStorage token management (generate, read, write) | Browser / Client | — | `localStorage` is client-only; `crypto.randomUUID()` runs in browser |
| `openPanel()` guest mode (no redirect) | Browser / Client | Frontend Server (SSR) | Client component (`chat-provider.tsx`); `hasSession` prop still comes from SSR gate |
| "Гість" display name in admin inbox | API / Backend | — | Service layer fallback in `listConversationsForAdmin`; no component change needed |
| Rate limiting for guest messages | API / Backend | — | `enforceRateLimit(senderId)` uses guestToken as senderId string |

---

## Standard Stack

This phase installs **zero new packages**. All dependencies are already installed.

### Core (already installed)

| Library | Installed Version | Purpose | Why Used |
|---------|------------------|---------|----------|
| `prisma` | `^7.8.0` (7.8.0 installed) [VERIFIED: npm registry] | Schema migration CLI + ORM | Project standard |
| `@prisma/client` | `^7.8.0` (7.8.0 installed) [VERIFIED: npm registry] | DB queries with type safety | Project standard |
| `pusher` (server) | `^5.3.3` [VERIFIED: npm registry] | Server-side Pusher channel auth | Already used in `/api/chat/pusher/auth` |
| `pusher-js` (client) | `^8.5.0` [VERIFIED: npm registry] | Client-side Pusher subscription | Already used in `chat-provider.tsx` |
| `zod` | `^4.4.3` [VERIFIED: npm registry] | Request body validation schemas | Already used in `sendMessageSchema` |
| `crypto` (built-in) | Node 24.14.0 built-in [VERIFIED: node --version] | `crypto.randomUUID()` for guestToken generation | No install; available in both Node and browser environments |

### No New Installations

```bash
# No npm install needed for Phase 46
# Confirm existing versions:
npm list prisma @prisma/client pusher pusher-js zod --depth=0
```

---

## Package Legitimacy Audit

> slopcheck was not available at research time. Phase 46 installs no new packages, so the legitimacy audit is vacuous — all packages above are already installed and in production use.

| Package | Registry | Age | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|
| `prisma` 7.8.0 | npm | 6+ yrs | N/A (pre-installed) | Approved |
| `@prisma/client` 7.8.0 | npm | 6+ yrs | N/A (pre-installed) | Approved |
| `pusher` 5.3.3 | npm | 10+ yrs | N/A (pre-installed) | Approved |
| `pusher-js` 8.5.0 | npm | 10+ yrs | N/A (pre-installed) | Approved |
| `zod` 4.4.3 | npm | 4+ yrs | N/A (pre-installed) | Approved |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
Browser (Guest)
  │
  ├─ Widget opens
  │    └─ localStorage.getItem('chat_guest_token')
  │         ├─ Found → GET /api/chat/guest?token={token}
  │         │             └─ DB lookup by guestToken
  │         │                  ├─ Found → return conversationId + messages
  │         │                  └─ 404  → widget shows empty (new session)
  │         └─ Not found → crypto.randomUUID() stored in localStorage (no DB write)
  │
  ├─ Guest types and presses Send (first message)
  │    └─ POST /api/chat/messages { body, guestToken } (no session cookie)
  │         └─ Service: resolveConversationForSend
  │              └─ No conversationId, no userId → guestToken path
  │                   └─ prisma.conversation.create({ guestToken, isActive:true })
  │                        └─ On P2002 → findUnique({ where: { guestToken } })
  │                   └─ senderId = guestToken for rate limiting
  │
  ├─ Guest sends subsequent messages
  │    └─ POST /api/chat/messages { body, guestToken }
  │         └─ resolveConversationForSend finds existing by guestToken
  │
  └─ Pusher real-time (after conversation exists)
       └─ Client subscribes to private-conversation-{conversationId}
            └─ POST /api/chat/pusher/auth { socket_id, channel_name, guestToken }
                 └─ No session → check guestToken vs DB
                      ├─ Match → authorizeChannel()
                      └─ No match → 403

Admin (Browser)
  └─ GET /admin/chaty (admin inbox)
       └─ listConversationsForAdmin()
            └─ userId IS NULL → buyerName = "Гість", buyerEmail = ""
```

### Recommended Project Structure

No new directories needed. All changes are to existing files:

```
prisma/
├── schema.prisma              # Conversation model changes (D-05, D-06)
└── migrations/
    └── YYYYMMDDHHMMSS_guest_chat_schema/
        └── migration.sql      # Generated by prisma migrate dev

src/
├── types/
│   └── chat.ts                # ConversationSummaryDto: userId → string | null
├── server/
│   ├── services/
│   │   └── chat.service.ts    # All service changes (D-07, D-08, CHAT-03)
│   └── validators/
│       └── chat.ts            # sendMessageSchema: add guestToken field
└── app/
    └── api/
        └── chat/
            ├── guest/
            │   └── route.ts   # NEW: GET handler to restore guest conversation
            ├── messages/
            │   └── route.ts   # Extend POST: guestToken path when no session
            └── pusher/
                └── auth/
                    └── route.ts # Extend POST: guestToken fallback auth path
src/components/
└── chat/
    └── chat-provider.tsx      # D-09, D-10: remove redirect, add localStorage
```

### Pattern 1: Guest Token Generation and Restore (localStorage)

**What:** On mount, `ChatProvider` reads `localStorage.getItem('chat_guest_token')`. Generates UUID on first panel open if absent. Calls restore endpoint if token exists. No DB write until first Send.

**When to use:** `hasSession === false` in `ChatProvider`

**Example (follows `guest-storage.ts` pattern in codebase):**
```typescript
// Source: src/lib/wishlist/guest-storage.ts (established project pattern)
// Analogous pattern for chat_guest_token

const GUEST_CHAT_TOKEN_KEY = "chat_guest_token";

function readGuestToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GUEST_CHAT_TOKEN_KEY);
}

function writeGuestToken(token: string): void {
  localStorage.setItem(GUEST_CHAT_TOKEN_KEY, token);
}

function ensureGuestToken(): string {
  const existing = readGuestToken();
  if (existing) return existing;
  const token = crypto.randomUUID();
  writeGuestToken(token);
  return token;
}
```

### Pattern 2: Guest Conversation Create (upsert guard)

**What:** When no session and no existing conversation, create one on first message. Reuse `isUniqueViolation()` guard to handle race conditions.

**Example (extends existing pattern at chat.service.ts line ~80):**
```typescript
// Source: src/server/services/chat.service.ts (established upsert guard pattern)
async function getOrCreateGuestConversation(guestToken: string) {
  const existing = await prisma.conversation.findUnique({
    where: { guestToken },
  });
  if (existing) return existing;

  try {
    return await prisma.conversation.create({
      data: { guestToken, isActive: true },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return prisma.conversation.findUniqueOrThrow({ where: { guestToken } });
    }
    throw error;
  }
}
```

### Pattern 3: Pusher Auth Extension for Guests

**What:** Extend `parseAuthBody()` to include `guestToken`. When no session, verify `guestToken` matches `Conversation.guestToken` in DB before calling `authorizeChannel()`.

**Example:**
```typescript
// Source: src/app/api/chat/pusher/auth/route.ts (extending existing parseAuthBody)
type AuthBody = {
  socket_id?: string;
  channel_name?: string;
  guestToken?: string;   // NEW
};

// In POST handler — after existing session path fails:
if (!session?.user) {
  const guestToken = body.guestToken;
  if (!guestToken) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const conversationId = parseConversationChannel(channelName);
  if (!conversationId) {
    return Response.json({ error: "INVALID_CHANNEL" }, { status: 400 });
  }
  // Verify guestToken owns this conversation
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { guestToken: true },
  });
  if (!conversation || conversation.guestToken !== guestToken) {
    return Response.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const authResponse = getPusherServer().authorizeChannel(socketId, channelName);
  return Response.json(authResponse);
}
```

### Pattern 4: listConversationsForAdmin with Nullable userId (CHAT-03)

**What:** After migration, `userId` is `String?`. The existing `prisma.user.findMany({ where: { id: { in: conversations.map(c => c.userId) } } })` will receive nulls. Filter them out and use `"Гість"` as fallback.

**Example:**
```typescript
// Source: src/server/services/chat.service.ts (updating listConversationsForAdmin)
const userIds = conversations
  .map((c) => c.userId)
  .filter((id): id is string => id !== null);

const users = await prisma.user.findMany({
  where: { id: { in: userIds } },
  select: { id: true, name: true, email: true },
});
const userById = new Map(users.map((u) => [u.id, u]));

// In the map:
const buyer = conversation.userId ? userById.get(conversation.userId) : null;
return {
  ...
  buyerName: buyer?.name ?? "Гість",   // WAS: "Покупець"
  buyerEmail: buyer?.email ?? "",
};
```

### Pattern 5: Schema Migration (Prisma 7)

**What:** Prisma 7.8.0 with PostgreSQL. `partialIndexes` is a preview feature — must enable in generator block to use `@@unique` with `where` filter.

**Prisma schema changes:**
```prisma
// Source: CONTEXT.md D-05, D-06 + Prisma docs [CITED: prisma.io/docs/orm/prisma-schema/data-model/indexes]
generator client {
  provider        = "prisma-client"
  output          = "../src/generated/prisma"
  previewFeatures = ["partialIndexes"]   // ADD if using filtered unique
}

model Conversation {
  id                  String             @id @default(cuid())
  userId              String?                                  // WAS: String @unique — nullable, non-unique
  guestToken          String?            @unique               // NEW
  isActive            Boolean            @default(true)        // NEW
  status              ConversationStatus @default(OPEN)
  contextProductId    String?
  contextProductTitle String?
  buyerLastReadAt     DateTime           @default(now())
  adminLastReadAt     DateTime           @default(now())
  lastMessageAt       DateTime?
  lastMessagePreview  String?
  lastMessageSender   MessageSender?
  messages            Message[]
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  @@index([userId, isActive])
  @@index([updatedAt])
  @@index([lastMessageAt])
  @@index([status, lastMessageAt])
  // Filtered unique: at most one isActive=true conversation per userId
  // Option A (if partialIndexes preview enabled):
  @@unique([userId], where: { isActive: true })
  // Option B (if D-06 falls back to service layer): remove the @@unique line above;
  // enforce via $transaction in createNewConversation (Phase 47)
}
```

**Migration command:**
```bash
npx prisma migrate dev --name guest_chat_schema
npx prisma generate
```

### Anti-Patterns to Avoid

- **Putting `guestToken` in the Pusher channel name:** The channel is `private-conversation-{conversationId}` (cuid2, 24 chars, matches `CONVERSATION_CHANNEL_RE`). A UUID (36 chars with hyphens, 32 without) would NOT match the existing regex. Keep channel name unchanged — guestToken is only used for DB auth verification in the auth endpoint.
- **Writing to DB on widget open:** D-01 is explicit: no DB write until Send. Opening the widget should only read localStorage and optionally call the restore GET endpoint.
- **Non-atomic guest conversation creation:** Always use the `isUniqueViolation` guard. Two tabs can open simultaneously and race to create the first conversation.
- **Passing `undefined` in `prisma.user.findMany({ where: { id: { in: [...] } } })` after nullable migration:** Filter nulls from `conversations.map(c => c.userId)` before the user lookup query.
- **Registering in-widget Pusher subscription before conversation exists:** Guest starts with no `conversationId`. Subscribe only after the first POST returns a `conversationId`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Unique token generation | Custom ID scheme | `crypto.randomUUID()` (built-in) | Cryptographically random, 128-bit entropy, available in both Node and browser; already used in project (`Order.guestAccessToken` pattern) |
| Race condition on guest conversation create | Manual try/catch + delay | `isUniqueViolation()` guard already in `chat.service.ts` | Handles Prisma P2002 code; pattern proven in `getOrCreateConversation` |
| Request body parsing for Pusher auth | New parser | Extend existing `parseAuthBody()` in `/api/chat/pusher/auth/route.ts` | Already handles `application/x-www-form-urlencoded` and JSON; just add `guestToken` to the `AuthBody` type |
| UUID validation in request schemas | Regex validation | `z.string().uuid()` in Zod v4 | Confirmed working in this project's Zod version |
| localStorage guest state management | Raw localStorage calls | Follow `guest-storage.ts` pattern (try/catch, SSR guard `typeof window === "undefined"`) | Established project pattern; handles SSR correctly |

**Key insight:** Every building block for guest chat already exists in the codebase. This phase connects them, not rebuilds them.

---

## Common Pitfalls

### Pitfall 1: `userId @unique` constraint not dropped — migration must be explicit
**What goes wrong:** Prisma will not automatically drop `@unique` when you change `String` to `String?` — it must be explicitly removed in the schema. If forgotten, `prisma migrate dev` generates SQL that still has the unique constraint, and later phases that create a second conversation per user (Phase 47) throw P2002.
**Why it happens:** Prisma treats `@unique` as a separate constraint from nullability.
**How to avoid:** Verify the generated SQL in `migration.sql` before applying — confirm `DROP INDEX "Conversation_userId_key"` is present.
**Warning signs:** Migration diff shows `ALTER COLUMN` but no `DROP INDEX` for `userId`.

### Pitfall 2: Guest Pusher subscription fires before conversationId exists
**What goes wrong:** `ChatProvider` currently subscribes to Pusher when `conversationId` is non-null and `isOpen` is true. For guests, `conversationId` is null until the first message is sent. If the subscription effect fires with a null ID, it silently subscribes to `private-conversation-null` (which will fail auth).
**Why it happens:** The Pusher subscription `useEffect` depends on `conversationId`. After the first POST returns a `conversationId`, `setConversationId()` must be called and will trigger re-subscribe correctly.
**How to avoid:** Ensure the `useEffect` guard `!conversationId` short-circuits subscription. After first Send, the POST response contains `conversationId`; call `setConversationId(message.conversationId)`.
**Warning signs:** Pusher debug console shows subscription to `private-conversation-null`.

### Pitfall 3: `ConversationSummaryDto.userId` typed as `string` not `string | null`
**What goes wrong:** TypeScript will flag `conversation.userId` as non-nullable, but after migration it's `String?` in the schema. The generated Prisma types will reflect `string | null`. If `ConversationSummaryDto` still says `userId: string`, type errors emerge in DTO mapping and callers.
**Why it happens:** The DTO was written before nullable userId was planned.
**How to avoid:** Update `ConversationSummaryDto` in `src/types/chat.ts` to `userId: string | null`. Update `assertConversationAccess` return type similarly.
**Warning signs:** TypeScript compile error `Type 'string | null' is not assignable to type 'string'` in `listConversationsForAdmin`.

### Pitfall 4: markBuyerReadAction server action breaks for guests
**What goes wrong:** `markBuyerReadAction` calls `requireBuyer()` (requires session) then `getConversationForBuyer(session.user.id)` (uses userId). For guests there is no session — calling this action from `ChatProvider` when `isOpen` changes would 401 or throw.
**Why it happens:** `ChatProvider` calls `markBuyerReadAction(conversationId)` in the `useEffect` that runs on open+load. Currently gated by `!hasSession` in that effect.
**How to avoid:** The existing guard `if (!isOpen || !hasSession) return;` in the messages-load effect already prevents this for guests. Verify the guest code path does NOT call `markBuyerReadAction`. Add a `GET /api/chat/guest?token={token}` endpoint that handles message fetch without session instead.
**Warning signs:** 401 errors in dev console when guest opens panel.

### Pitfall 5: Filtered unique constraint for `(userId, isActive=true)` — preview feature
**What goes wrong:** D-06 requires a DB-level constraint preventing two `isActive=true` conversations per user. Prisma 7's `@@unique` with `where` filter requires `previewFeatures = ["partialIndexes"]` in the generator. If forgotten, Prisma silently ignores the `where` clause or throws a schema validation error.
**Why it happens:** `partialIndexes` is not in the current generator config — `prisma/schema.prisma` has no `previewFeatures` line.
**How to avoid:** Add `previewFeatures = ["partialIndexes"]` to the generator block before adding the filtered `@@unique`. Run `prisma generate` and `prisma migrate dev` together. Alternatively, use the service-layer fallback (D-06 explicitly allows this).
**Warning signs:** `prisma migrate dev` error: "The `where` argument is not allowed without the `partialIndexes` preview feature."

### Pitfall 6: Guest rate limiting — guestToken as senderId is 36-char UUID
**What goes wrong:** `enforceRateLimit(senderId)` counts recent `Message` records by `senderId`. For guests, senderId is the guestToken (UUID). The `Message.senderId` field is `String` with no length constraint — UUID fits fine. BUT if the same guest sends from multiple tabs, each tab has the same guestToken, so rate limiting works correctly across tabs.
**Why it happens:** Not a bug — just needs to be verified as intentional.
**How to avoid:** Confirm `Message.senderId` has no length constraint in schema (it doesn't — `String` without `@db.VarChar`). Use guestToken directly as senderId for guests.

---

## Code Examples

### GET /api/chat/guest restore endpoint (new file)

```typescript
// Source: pattern from src/app/api/chat/messages/route.ts
// src/app/api/chat/guest/route.ts

import { getGuestConversation, listMessages } from "@/server/services/chat.service";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return Response.json({ error: "TOKEN_REQUIRED" }, { status: 400 });
  }

  const conversation = await getGuestConversation(token);
  if (!conversation) {
    return Response.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const messages = await listMessages(conversation.id, { limit: 50 });
  return Response.json({
    conversationId: conversation.id,
    messages,
    status: conversation.status,
  });
}
```

### Extended sendMessageSchema with guestToken

```typescript
// Source: src/server/validators/chat.ts (extending existing schema)
export const sendMessageSchema = z.object({
  body: z.string().trim().min(1).max(2000),
  conversationId: z.string().cuid().optional(),
  productId: z.string().cuid().optional(),
  guestToken: z.string().uuid().optional(),   // NEW
});
```

### ChatProvider mount effect (guest token logic)

```typescript
// Source: src/components/chat/chat-provider.tsx (adding to existing useEffect pattern)
// Add state:
const [guestToken, setGuestToken] = useState<string | null>(null);

// On mount (client only):
useEffect(() => {
  if (hasSession) return; // auth users: no guest token needed
  const stored = localStorage.getItem("chat_guest_token");
  if (stored) {
    setGuestToken(stored);
    // Attempt to restore existing conversation
    void (async () => {
      const res = await fetch(`/api/chat/guest?token=${encodeURIComponent(stored)}`);
      if (res.ok) {
        const data = await res.json();
        setConversationId(data.conversationId);
        setMessages(data.messages);
        setConversationStatus(data.status);
      }
      // 404 = new guest, keep token in localStorage but no DB record yet
    })();
  }
}, []); // run once on mount

// In openPanel (D-09, D-10):
const openPanel = useCallback((options?: ProductChatContext) => {
  // REMOVED: if (!hasSession) { guestRedirect(); return; }
  if (!hasSession && !guestToken) {
    const token = crypto.randomUUID();
    localStorage.setItem("chat_guest_token", token);
    setGuestToken(token);
  }
  // ... rest of openPanel unchanged
}, [guestToken, hasSession, setQuery]);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `Conversation.userId @unique` (one convo per user) | `userId String?` + `isActive Boolean` (multiple per user) | Phase 46 migration | Enables Phase 47 multi-convo, Phase 48 history drawer |
| `openPanel()` redirects guests to `/uviity` | `openPanel()` opens widget for guests; guestToken manages session | Phase 46 | CHAT-01 fulfilled |
| `"Покупець"` fallback in admin inbox | `"Гість"` fallback for null userId | Phase 46 | CHAT-03 fulfilled |
| Pusher auth requires Better Auth session | Pusher auth accepts `guestToken` as fallback | Phase 46 | Guests get real-time after first message |

**Deprecated/outdated:**
- `guestRedirect()` call in `openPanel()`: remove entirely. The function itself can remain for other uses (none currently) but the call in `openPanel` is removed.
- `getConversationForBuyer(userId)` using `findUnique({ where: { userId } })`: must become `findFirst({ where: { userId, isActive: true } })` after migration. Both the service function and `ChatProviderGate` call it.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Prisma's `partialIndexes` preview feature is usable with `@@unique([userId], where: { isActive: true })` syntax (object literal form) | Standard Stack / Patterns | If syntax is wrong, D-06 falls back to service-layer enforcement — acceptable per CONTEXT.md |
| A2 | `Message.senderId` field has no length constraint in PostgreSQL (supports 36-char UUID for guest senderId) | Common Pitfalls #6 | UUID fits in `TEXT` column (Prisma default for `String`); confirmed no `@db.VarChar` in schema |
| A3 | Existing `isOpen && !hasSession` guard in the `useEffect` that calls `markBuyerReadAction` correctly prevents the action from firing for guests | Common Pitfalls #4 | If guard is wrong, 401 errors on guest panel open; verified guard at `chat-provider.tsx` line ~225 |

---

## Open Questions (RESOLVED)

1. **D-06: Use `partialIndexes` preview or service-layer enforcement?**
   - What we know: `partialIndexes` is available in Prisma 7 but requires adding `previewFeatures = ["partialIndexes"]` to the generator — not currently in `schema.prisma`. The syntax for filtered unique on a nullable field (`@@unique([userId], where: { isActive: true })`) should work on PostgreSQL.
   - What's unclear: Whether Prisma's object-literal `where` form correctly handles `null` exclusion (i.e., does the partial index only cover non-null userIds?).
   - RESOLVED: Service-layer enforcement in Phase 46 (no `partialIndexes` preview flag). Phase 46 has at most one `isActive=true` per user because the migration sets all existing rows to `true` and no new-conversation creation happens until Phase 47. The filtered unique constraint is deferred to Phase 47 when `createNewConversation()` is built.

2. **Should `ChatProviderGate` SSR still call `getConversationForBuyer` after the schema change?**
   - What we know: `getConversationForBuyer(userId)` currently uses `findUnique({ where: { userId } })`. After migration this must become `findFirst({ where: { userId, isActive: true } })`. Guest users have no session so SSR skips this call.
   - What's unclear: Whether the function rename (`getConversationForBuyer` → still works but with different query) is a single edit or requires a new function name.
   - RESOLVED: Keep the function name, update its internals only. `findFirst({ where: { userId, isActive: true } })` replaces `findUnique({ where: { userId } })`. No callers other than `ChatProviderGate` and `markBuyerReadAction` exist — both continue calling the same function signature.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| PostgreSQL (Neon) | Prisma migration | ✓ | Neon hosted | — |
| Prisma CLI | Schema migration | ✓ | 7.8.0 | — |
| Pusher (server credentials) | Pusher auth extension | ✓ | App ID 2155856, cluster eu | — |
| Pusher (client env vars) | Client subscription | ✓ | `NEXT_PUBLIC_PUSHER_KEY` set | — |
| Node.js | `crypto.randomUUID()` | ✓ | 24.14.0 | — |
| Browser `crypto.randomUUID()` | guestToken generation | ✓ | Available in all modern browsers | `uuid` npm package (not needed) |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npx vitest run src/server/validators/chat.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHAT-01 | `sendMessageSchema` accepts `guestToken` UUID field | unit | `npx vitest run src/server/validators/chat.test.ts` | ✅ (extend existing) |
| CHAT-01 | `getOrCreateGuestConversation` creates conversation on first message | unit | `npx vitest run src/server/services/chat.service.test.ts` | ❌ Wave 0 |
| CHAT-01 | `getOrCreateGuestConversation` returns existing conversation on retry | unit | `npx vitest run src/server/services/chat.service.test.ts` | ❌ Wave 0 |
| CHAT-01 | `GET /api/chat/guest` returns 404 for unknown token | unit | `npx vitest run src/server/services/chat.service.test.ts` | ❌ Wave 0 |
| CHAT-03 | `listConversationsForAdmin` uses `"Гість"` fallback when userId is null | unit | `npx vitest run src/server/services/chat.service.test.ts` | ❌ Wave 0 |

### Baseline Test Status

The existing Vitest suite has 2 pre-existing failures in `prisma/seed.test.ts` (dev database not fully seeded — unrelated to Phase 46). All 356 other tests pass. Phase 46 must not add to the failure count.

### Sampling Rate

- **Per task commit:** `npx vitest run src/server/validators/chat.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green (excluding the 2 pre-existing seed failures) before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/server/services/chat.service.test.ts` — covers CHAT-01 service logic (getOrCreateGuestConversation, getGuestConversation, listConversationsForAdmin null fallback)
- [ ] Extend `src/server/validators/chat.test.ts` — add guestToken UUID validation tests

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | guestToken is a 128-bit UUID (crypto.randomUUID) — sufficient entropy; no session cookie for guests |
| V3 Session Management | yes | localStorage token persists across page loads; cleared on explicit clear; no cross-tab sync needed in Phase 46 |
| V4 Access Control | yes | Pusher auth: guestToken verified against `Conversation.guestToken` in DB before `authorizeChannel()`; unauthorized token = 403 |
| V5 Input Validation | yes | `guestToken` validated as UUID via `z.string().uuid()` in `sendMessageSchema`; reject non-UUID tokens at API boundary |
| V6 Cryptography | yes | `crypto.randomUUID()` — CSPRNG, never hand-roll UUID generation |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Guest token enumeration (brute-force Pusher auth) | Information Disclosure | UUID has 2^122 entropy; DB lookup on every Pusher auth; rate limiting on POST /api/chat/messages by guestToken |
| Guest message flood (spam) | DoS | `enforceRateLimit(guestToken)` — 20 msgs/min window; IP as secondary fallback |
| Malformed guestToken in request body | Tampering | `z.string().uuid()` in Zod schema rejects non-UUID; no DB query on invalid token |
| Missing auth on guest message endpoint | Elevation of Privilege | POST /api/chat/messages with guestToken: conversation is resolved only if `Conversation.guestToken === token`; guests cannot read or write to other conversations |
| XSS access to localStorage token | Information Disclosure | Acceptable by design (localStorage is same-origin accessible); httpOnly cookie alternative deferred to Phase 47 if needed |

---

## Sources

### Primary (HIGH confidence)

- `prisma/schema.prisma` — current `Conversation` model (line 223): `userId String @unique`, `Message` model (line 243) — read and analyzed directly
- `src/server/services/chat.service.ts` — all service functions analyzed for update scope
- `src/app/api/chat/messages/route.ts` — existing POST handler analyzed for extension
- `src/app/api/chat/pusher/auth/route.ts` — `parseAuthBody()` and auth flow analyzed
- `src/components/chat/chat-provider.tsx` — `openPanel()`, `guestRedirect()`, and all effects analyzed
- `src/components/chat/chat-provider-gate.tsx` — SSR gate calling `getConversationForBuyer`
- `src/lib/wishlist/guest-storage.ts` — established localStorage guest pattern in this codebase
- `src/lib/order/guest-order-access.ts` — established guest token (UUID) pattern in this codebase
- `src/types/chat.ts` — `ConversationSummaryDto` type analyzed for nullable userId impact
- `src/server/validators/chat.ts` + `chat.test.ts` — schema extension point confirmed

### Secondary (MEDIUM confidence)

- [Prisma Docs — Indexes (partialIndexes preview)](https://www.prisma.io/docs/orm/prisma-schema/data-model/indexes) — confirmed `partialIndexes` is a preview feature; syntax for `@@unique` with `where` verified [CITED: prisma.io/docs]

### Tertiary (LOW confidence — already resolved by locked decisions)

- ARCHITECTURE.md (`.planning/research/`) — Phase 46 build order and schema migration details; HIGH confidence (codebase-derived)
- PITFALLS.md (`.planning/research/`) — Pitfalls 1, 2, 9 apply to Phase 46; HIGH confidence (codebase-derived)
- FEATURES.md (`.planning/research/`) — CHAT-01, CHAT-03 feature dependency graph; HIGH confidence

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — zero new packages; all libraries already installed and in production
- Schema migration: HIGH — Prisma 7.8.0 installed, existing migration pattern confirmed, SQL generation predictable
- Architecture patterns: HIGH — all patterns derived directly from existing codebase code, not assumptions
- Pitfalls: HIGH — three critical pitfalls confirmed by reading actual code paths
- Validation: HIGH — Vitest infrastructure confirmed working (356/358 tests pass in 6.34s)

**Research date:** 2026-05-25
**Valid until:** 2026-06-25 (stable stack; only risk is Pusher API changes — negligible)
