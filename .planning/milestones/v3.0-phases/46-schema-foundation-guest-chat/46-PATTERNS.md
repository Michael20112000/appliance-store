# Phase 46: Schema Foundation + Guest Chat - Pattern Map

**Mapped:** 2026-05-25
**Files analyzed:** 8 new/modified files
**Analogs found:** 8 / 8

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `prisma/schema.prisma` | config | CRUD | `prisma/schema.prisma` (existing Conversation model, lines 223–241) | exact (self-extension) |
| `src/types/chat.ts` | model | transform | `src/types/chat.ts` existing `ConversationSummaryDto` (self-extension) | exact (self-extension) |
| `src/server/validators/chat.ts` | utility | transform | `src/server/validators/chat.ts` existing `sendMessageSchema` (self-extension) | exact (self-extension) |
| `src/server/services/chat.service.ts` | service | CRUD | `src/server/services/chat.service.ts` (self-extension) | exact (self-extension) |
| `src/app/api/chat/guest/route.ts` | route | request-response | `src/app/api/chat/messages/route.ts` GET handler (lines 132–159) | role-match |
| `src/app/api/chat/messages/route.ts` | route | request-response | `src/app/api/chat/messages/route.ts` POST handler (self-extension) | exact (self-extension) |
| `src/app/api/chat/pusher/auth/route.ts` | route | request-response | `src/app/api/chat/pusher/auth/route.ts` (self-extension) | exact (self-extension) |
| `src/components/chat/chat-provider.tsx` | provider | event-driven | `src/components/chat/chat-provider.tsx` (self-extension) | exact (self-extension) |

---

## Pattern Assignments

### `prisma/schema.prisma` — Conversation model (config)

**Analog:** `prisma/schema.prisma` lines 223–241 (current Conversation model)

**Current model state** (lines 223–241):
```prisma
model Conversation {
  id                  String             @id @default(cuid())
  userId              String             @unique
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

  @@index([updatedAt])
  @@index([lastMessageAt])
  @@index([status, lastMessageAt])
}
```

**Generator block** (lines 4–7) — must be extended if using `partialIndexes`:
```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
  // ADD if using filtered unique: previewFeatures = ["partialIndexes"]
}
```

**Target state — apply D-05 changes in this exact order:**
1. `userId String @unique` → `userId String?` (remove `@unique`)
2. Add `guestToken String? @unique`
3. Add `isActive Boolean @default(true)`
4. Add `@@index([userId, isActive])`
5. D-06 constraint: service-layer enforcement is recommended for Phase 46 (see RESEARCH.md open question 1). The `@@unique([userId], where: { isActive: true })` filtered index requires `previewFeatures = ["partialIndexes"]` in the generator block; if omitted, Prisma throws a schema validation error.

**Verify migration SQL contains:** `DROP INDEX "Conversation_userId_key"` (Pitfall 1).

---

### `src/types/chat.ts` — ConversationSummaryDto (model)

**Analog:** `src/types/chat.ts` lines 15–24 (current DTO)

**Current type** (lines 15–24):
```typescript
export type ConversationSummaryDto = {
  id: string;
  userId: string;           // <-- becomes string | null after migration
  status: ConversationStatus;
  buyerName: string;
  buyerEmail: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadForAdmin: boolean;
};
```

**Change required:** `userId: string` → `userId: string | null`

Also update `assertConversationAccess` return type in `chat.service.ts` (line 344) — its declared return includes `userId: string`; after migration the Prisma-inferred type is `string | null`.

---

### `src/server/validators/chat.ts` — sendMessageSchema (utility, transform)

**Analog:** `src/server/validators/chat.ts` lines 1–16 (existing schema)

**Current schema** (lines 1–16):
```typescript
import { z } from "zod";

export const sendMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Повідомлення не може бути порожнім")
    .max(2000, "Повідомлення занадто довге (максимум 2000 символів)"),
  conversationId: z
    .string()
    .cuid("Невірний ідентифікатор розмови")
    .optional(),
  productId: z.string().cuid("Невірний ідентифікатор товару").optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
```

**Change required:** Add `guestToken` field using `z.string().uuid()` (confirmed working in this project's Zod v4):
```typescript
guestToken: z.string().uuid("Невірний гостьовий токен").optional(),
```

**Test file pattern** (from `src/server/validators/chat.test.ts` lines 1–35):
```typescript
import { describe, expect, it } from "vitest";
import { sendMessageSchema } from "./chat";

describe("sendMessageSchema", () => {
  it("accepts optional guestToken as UUID", () => {
    const result = sendMessageSchema.safeParse({
      body: "Привіт",
      guestToken: "123e4567-e89b-12d3-a456-426614174000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects guestToken that is not a UUID", () => {
    const result = sendMessageSchema.safeParse({
      body: "Привіт",
      guestToken: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });
});
```

---

### `src/server/services/chat.service.ts` — multiple functions (service, CRUD)

**Analog:** `src/server/services/chat.service.ts` (entire file, 366 lines)

#### Error constants pattern (lines 11–13) — extend with new codes:
```typescript
export const CONVERSATION_NOT_FOUND = "CONVERSATION_NOT_FOUND";
export const FORBIDDEN = "FORBIDDEN";
export const CHAT_RATE_LIMIT = "CHAT_RATE_LIMIT";
export const CHAT_ARCHIVED = "CHAT_ARCHIVED";
// ADD:
export const GUEST_TOKEN_INVALID = "GUEST_TOKEN_INVALID";
export const GUEST_NOT_FOUND = "GUEST_NOT_FOUND";
```

#### isUniqueViolation guard pattern (lines 80–87) — reuse as-is:
```typescript
function isUniqueViolation(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "P2002"
  );
}
```

#### getOrCreateConversation — D-07 update (lines 89–115):
```typescript
// BEFORE (line 93):
const existing = await prisma.conversation.findUnique({ where: { userId } });
// AFTER (D-07):
const existing = await prisma.conversation.findFirst({
  where: { userId, isActive: true },
});

// BEFORE catch block (line 111):
return prisma.conversation.findUniqueOrThrow({ where: { userId } });
// AFTER (D-07):
return prisma.conversation.findFirstOrThrow({
  where: { userId, isActive: true },
});
```

#### getConversationForBuyer — D-07 update (lines 144–146):
```typescript
// BEFORE:
export async function getConversationForBuyer(userId: string) {
  return prisma.conversation.findUnique({ where: { userId } });
}
// AFTER (D-07):
export async function getConversationForBuyer(userId: string) {
  return prisma.conversation.findFirst({ where: { userId, isActive: true } });
}
```

#### New function: getGuestConversation (follows getConversationForBuyer pattern):
```typescript
export async function getGuestConversation(guestToken: string) {
  return prisma.conversation.findUnique({ where: { guestToken } });
}
```

#### New function: getOrCreateGuestConversation (follows getOrCreateConversation pattern, lines 89–115):
```typescript
export async function getOrCreateGuestConversation(
  guestToken: string,
  context?: ProductContext,
) {
  const existing = await prisma.conversation.findUnique({
    where: { guestToken },
  });
  if (existing) return existing;

  try {
    return await prisma.conversation.create({
      data: {
        guestToken,
        isActive: true,
        contextProductId: context?.productId,
        contextProductTitle: context?.productTitle,
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return prisma.conversation.findUniqueOrThrow({ where: { guestToken } });
    }
    throw error;
  }
}
```

#### resolveConversationForSend — extend guest path (lines 228–250):
```typescript
// Current function ends with:
  if (!input.userId) {
    throw new ChatServiceError(
      CONVERSATION_NOT_FOUND,
      "Потрібен userId або conversationId",
    );
  }
  return getOrCreateConversation(input.userId, input.productContext);
}

// AFTER — add guestToken branch before the userId check:
  if (input.guestToken) {
    return getOrCreateGuestConversation(input.guestToken, input.productContext);
  }

  if (!input.userId) {
    throw new ChatServiceError(
      CONVERSATION_NOT_FOUND,
      "Потрібен userId, guestToken або conversationId",
    );
  }
  return getOrCreateConversation(input.userId, input.productContext);
}
```

Also add `guestToken?: string` to `SendMessageInput` type (lines 176–183).

#### listConversationsForAdmin — D-07 + CHAT-03 update (lines 303–337):
```typescript
// BEFORE (line 313–316):
const users = await prisma.user.findMany({
  where: { id: { in: conversations.map((c) => c.userId) } },
  select: { id: true, name: true, email: true },
});

// AFTER — filter nulls (D-07, Pitfall 3):
const userIds = conversations
  .map((c) => c.userId)
  .filter((id): id is string => id !== null);

const users = await prisma.user.findMany({
  where: { id: { in: userIds } },
  select: { id: true, name: true, email: true },
});
const userById = new Map(users.map((u) => [u.id, u]));

// BEFORE in map (line 320):
const buyer = userById.get(conversation.userId);
// AFTER:
const buyer = conversation.userId ? userById.get(conversation.userId) : null;

// BEFORE fallback (line 330):
buyerName: buyer?.name ?? "Покупець",
// AFTER (CHAT-03):
buyerName: buyer?.name ?? "Гість",
```

#### assertConversationAccess — update return type for nullable userId (lines 344–365):
```typescript
// BEFORE return type annotation (line 344):
): Promise<{ id: string; userId: string; status: ConversationStatus }>

// AFTER:
): Promise<{ id: string; userId: string | null; status: ConversationStatus }>

// BEFORE ownership check (line 360):
if (conversation.userId !== session.user.id) {
// AFTER — null userId means guest conversation, always forbidden for non-admin:
if (!conversation.userId || conversation.userId !== session.user.id) {
```

---

### `src/app/api/chat/guest/route.ts` — NEW file (route, request-response)

**Analog:** `src/app/api/chat/messages/route.ts` GET handler (lines 132–159)

**Imports pattern** — follow messages/route.ts import structure:
```typescript
import {
  getGuestConversation,
  listMessages,
} from "@/server/services/chat.service";
```

**Core pattern** (modeled on GET /api/chat/messages, lines 132–159):
```typescript
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

**No session check** — this endpoint is intentionally unauthenticated (the guestToken is the credential). No `auth.api.getSession()` call.

**Error handling pattern** — follow the `Response.json({ error: "CODE" }, { status: N })` pattern used throughout messages/route.ts (lines 35–52).

---

### `src/app/api/chat/messages/route.ts` — extend POST handler (route, request-response)

**Analog:** `src/app/api/chat/messages/route.ts` POST handler (lines 54–130)

**Session check extension** (lines 54–60) — replace hard 401 with guest path:
```typescript
// BEFORE:
if (!session?.user) {
  return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
}

// AFTER — allow guests with guestToken:
// (session check deferred; guestToken presence drives the guest path)
```

**Guest branch in POST handler** — insert after parsing validated body:
```typescript
// When no session: require guestToken from validated body
if (!session?.user) {
  if (!parsed.data.guestToken) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  // Guest send path — guestToken is senderId for rate limiting (Pitfall 6)
  try {
    const message = await sendMessage({
      guestToken: parsed.data.guestToken,
      senderId: parsed.data.guestToken,
      senderRole: "BUYER",
      body: parsed.data.body,
      productContext: parsed.data.productId
        ? { productId: parsed.data.productId }
        : undefined,
    });

    try {
      await getPusherServer().trigger(
        conversationChannel(message.conversationId),
        "message:new",
        pusherPayload(message),
      );
    } catch (error) {
      if (!(error instanceof PusherNotConfiguredError)) throw error;
    }

    return Response.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof ChatRateLimitError) {
      return Response.json(
        { error: CHAT_RATE_LIMIT, message: RATE_LIMIT_MESSAGE },
        { status: 429 },
      );
    }
    if (error instanceof ChatServiceError) {
      return mapChatServiceError(error);
    }
    throw error;
  }
}
// ... existing authenticated path continues unchanged
```

**Admin guard** (lines 80–85) — unchanged; admin path requires session and conversationId.

**Pusher trigger pattern** (lines 105–115) — reuse exactly as-is for guest path.

**Error handling** — reuse `mapChatServiceError` (lines 35–52) for both guest and auth paths.

---

### `src/app/api/chat/pusher/auth/route.ts` — extend for guest auth (route, request-response)

**Analog:** `src/app/api/chat/pusher/auth/route.ts` (entire file, 91 lines)

**AuthBody type extension** (lines 12–15):
```typescript
// BEFORE:
type AuthBody = {
  socket_id?: string;
  channel_name?: string;
};

// AFTER (D-04):
type AuthBody = {
  socket_id?: string;
  channel_name?: string;
  guestToken?: string;
};
```

**parseAuthBody extension** (lines 17–40) — add `guestToken` parsing in both branches:
```typescript
// In the URLSearchParams branch:
return {
  socket_id: params.get("socket_id") ?? undefined,
  channel_name: params.get("channel_name") ?? undefined,
  guestToken: params.get("guestToken") ?? undefined,   // ADD
};

// In the JSON branch:
return {
  socket_id: typeof json.socket_id === "string" ? json.socket_id : undefined,
  channel_name: typeof json.channel_name === "string" ? json.channel_name : undefined,
  guestToken: typeof json.guestToken === "string" ? json.guestToken : undefined,  // ADD
};
```

**POST handler guest path** — replace the early 401 (lines 47–49) with a guest fallback:
```typescript
// BEFORE (line 47):
if (!session?.user) {
  return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
}

// AFTER (D-04):
if (!session?.user) {
  // Guest path: verify guestToken owns this conversation
  const guestToken = body.guestToken;
  if (!guestToken) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const conversationId = parseConversationChannel(channelName);
  if (!conversationId) {
    return Response.json({ error: "INVALID_CHANNEL" }, { status: 400 });
  }
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { guestToken: true },
  });
  if (!conversation || conversation.guestToken !== guestToken) {
    return Response.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  try {
    const authResponse = getPusherServer().authorizeChannel(socketId, channelName);
    return Response.json(authResponse);
  } catch (error) {
    if (error instanceof PusherNotConfiguredError) {
      return Response.json({ error: "PUSHER_NOT_CONFIGURED" }, { status: 503 });
    }
    throw error;
  }
}
```

**Import addition:** Add `prisma` import from `@/lib/db` — follow the same import pattern already used in `chat.service.ts` (line 5).

**socketId/channelName extraction** (lines 51–62) — must happen before the session check, or be repeated in the guest branch. The `body` must be parsed before the `!session?.user` check so it is available for the guest path.

---

### `src/components/chat/chat-provider.tsx` — remove redirect + add localStorage (provider, event-driven)

**Analog:** `src/components/chat/chat-provider.tsx` (entire file, 396 lines)

**localStorage guest token pattern** — follow `src/lib/wishlist/guest-storage.ts` (lines 31–54):
```typescript
// SSR guard + try/catch (guest-storage.ts lines 31–49):
function readRaw(): GuestWishlist {
  if (typeof window === "undefined") {
    return { v: 1, items: [] };
  }
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    // ...
  } catch {
    return { v: 1, items: [] };
  }
}
```

**New state** — add after existing `useState` declarations (lines 106–118):
```typescript
const [guestToken, setGuestToken] = useState<string | null>(null);
```

**Mount effect for guest token** — D-10, add as a new `useEffect` with empty dependency array:
```typescript
useEffect(() => {
  if (hasSession) return;
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem("chat_guest_token");
    if (stored) {
      setGuestToken(stored);
      void (async () => {
        const res = await fetch(
          `/api/chat/guest?token=${encodeURIComponent(stored)}`,
        );
        if (res.ok) {
          const data = (await res.json()) as {
            conversationId: string;
            messages: MessageDto[];
            status: ConversationStatus;
          };
          setConversationId(data.conversationId);
          setMessages(data.messages);
          setConversationStatus(data.status);
        }
        // 404 = no DB record yet; keep token for first Send
      })();
    }
  } catch {
    // localStorage unavailable (private mode etc.) — silent fail
  }
}, []); // run once on mount
```

**openPanel — remove redirect, add token generation** (lines 140–159):
```typescript
// BEFORE (lines 140–158):
const openPanel = useCallback(
  (options?: ProductChatContext) => {
    if (!hasSession) {
      guestRedirect();    // <-- REMOVE this block
      return;
    }
    // ...
  },
  [guestRedirect, hasSession, setQuery],
);

// AFTER (D-09, D-10):
const openPanel = useCallback(
  (options?: ProductChatContext) => {
    if (!hasSession && !guestToken) {
      // Generate token on first panel open — no DB write
      if (typeof window !== "undefined") {
        try {
          const token = crypto.randomUUID();
          localStorage.setItem("chat_guest_token", token);
          setGuestToken(token);
        } catch {
          // localStorage unavailable — continue without token
        }
      }
    }

    if (options?.productId || options?.productTitle || options?.productSlug) {
      setProductContext(options);
      void setQuery({ chat: "open", productId: options.productId ?? null });
      return;
    }

    void setQuery({ chat: "open" });
  },
  [guestToken, hasSession, setQuery],
);
```

**guestRedirect function** (lines 127–133) — can be left in place (no other callers); just remove the call from `openPanel`.

**Messages load effect** (lines 224–257) — the existing guard `if (!isOpen || !hasSession) return;` prevents `markBuyerReadAction` from firing for guests (Pitfall 4). Verify this guard remains unchanged.

**Pusher subscription effect** (lines 259–323) — guard `!hasSession` at line 260 currently blocks guests from subscribing. For Phase 46, guests should be able to subscribe after first message returns a `conversationId`. Update the guard:
```typescript
// BEFORE (line 260):
if (!isOpen || !hasSession || !conversationId || !isPusherClientConfigured()) {
  return;
}

// AFTER — guests with a conversationId can subscribe:
if (!isOpen || !conversationId || !isPusherClientConfigured()) {
  return;
}
```

Guest Pusher auth will use the `guestToken` in the auth request body. The Pusher client sends auth requests to `/api/chat/pusher/auth` automatically; it must be configured to include `guestToken` in the POST body. Follow the Pusher client `channelAuthorization` config if it exists — otherwise `pusher-js` sends a standard form-encoded POST which the extended `parseAuthBody` can read.

**Context value** — add `guestToken` to the context if `ChatPanel` or `ChatInput` needs it for `POST /api/chat/messages`. Check if `guestToken` needs to be exposed through `ChatContextValue`. If so, add `guestToken: string | null` to the type and `useMemo` value.

**Pusher client auth headers for guestToken** — the Pusher client needs to include `guestToken` in its auth POST. Check if `getPusherClient()` in `src/lib/pusher-client.ts` supports `channelAuthorization.params` or `headers` config. If so, pass `guestToken` as a custom param when the guest subscribes.

---

## Shared Patterns

### Error Response Formatting
**Source:** `src/app/api/chat/messages/route.ts` lines 35–52
**Apply to:** `src/app/api/chat/guest/route.ts`, extended guest path in `messages/route.ts` and `pusher/auth/route.ts`
```typescript
function mapChatServiceError(error: ChatServiceError): Response {
  if (error.code === FORBIDDEN) {
    return Response.json({ error: FORBIDDEN }, { status: 403 });
  }
  if (error.code === CHAT_ARCHIVED) {
    return Response.json(
      { error: CHAT_ARCHIVED, message: error.message },
      { status: 403 },
    );
  }
  if (error.code === CONVERSATION_NOT_FOUND) {
    return Response.json(
      { error: CONVERSATION_NOT_FOUND },
      { status: 404 },
    );
  }
  return Response.json({ error: error.code }, { status: 400 });
}
```

### Upsert Race-Condition Guard
**Source:** `src/server/services/chat.service.ts` lines 80–87 (`isUniqueViolation`)
**Apply to:** `getOrCreateGuestConversation` in `chat.service.ts`
```typescript
function isUniqueViolation(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "P2002"
  );
}
```

### localStorage SSR Guard
**Source:** `src/lib/wishlist/guest-storage.ts` lines 31–49 (`readRaw`)
**Apply to:** guest token read/write in `chat-provider.tsx`
```typescript
if (typeof window === "undefined") {
  return { v: 1, items: [] };   // swap for `return null` in chat context
}
try {
  const raw = localStorage.getItem(KEY);
  // ...
} catch {
  return /* safe default */;
}
```

### Session Retrieval Pattern
**Source:** `src/app/api/chat/messages/route.ts` lines 54–60
**Apply to:** All API routes that need to fall back to guest path when no session
```typescript
const session = await auth.api.getSession({
  headers: await headers(),
});
// Note: for guest-capable routes, session may be null — do NOT 401 immediately
```

### Zod UUID Validation
**Source:** `src/server/validators/chat.ts` lines 1–16 (extension point)
**Apply to:** `guestToken` field in `sendMessageSchema`
```typescript
guestToken: z.string().uuid("Невірний гостьовий токен").optional(),
```
`z.string().uuid()` is confirmed working in Zod v4.4.3 installed in this project.

### Prisma Nullable Field Pattern
**Source:** `prisma/schema.prisma` — existing nullable fields throughout (e.g., `contextProductId String?`, `lastMessageAt DateTime?`)
**Apply to:** `userId String?` and `guestToken String? @unique` in the Conversation model migration

---

## No Analog Found

All files have close analogs in the codebase. No external patterns required.

---

## Key Pitfalls for Planner

| # | File | Risk | Mitigation |
|---|------|------|------------|
| P1 | `prisma/schema.prisma` | `DROP INDEX "Conversation_userId_key"` silently omitted in migration SQL | Inspect `migration.sql` before applying; confirm the DROP INDEX line is present |
| P2 | `chat-provider.tsx` | Pusher subscribes to `private-conversation-null` before first message | `!conversationId` short-circuit in Pusher effect prevents this; set `conversationId` state after first POST returns |
| P3 | `src/types/chat.ts` | `ConversationSummaryDto.userId` still typed `string` after migration | Change to `string \| null`; TypeScript will surface all callers that need updating |
| P4 | `chat-provider.tsx` | `markBuyerReadAction` called for guests (no session → 401) | Existing `if (!isOpen \|\| !hasSession) return;` guard in load effect prevents this; verify it remains |
| P5 | `prisma/schema.prisma` | `partialIndexes` preview feature missing → filtered `@@unique` silently ignored or throws | Use service-layer enforcement for Phase 46; defer filtered unique to Phase 47 |
| P6 | `chat-provider.tsx` | Pusher client doesn't send `guestToken` in auth POST body by default | Investigate `getPusherClient()` config in `src/lib/pusher-client.ts` for `channelAuthorization.params` or custom headers |

---

## Metadata

**Analog search scope:** `src/server/services/`, `src/app/api/chat/`, `src/components/chat/`, `src/lib/wishlist/`, `src/lib/order/`, `src/types/`, `src/server/validators/`, `prisma/`
**Files scanned:** 10
**Pattern extraction date:** 2026-05-25
