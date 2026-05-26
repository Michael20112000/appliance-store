# Phase 47: Chat Lifecycle Control - Pattern Map

**Mapped:** 2026-05-25
**Files analyzed:** 8 new/modified files
**Analogs found:** 8 / 8

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/server/services/chat.service.ts` | service | CRUD + transaction | `src/server/services/chat.service.ts` (self — extend) | exact |
| `src/server/actions/admin/chat.actions.ts` | server action | request-response | `src/server/actions/admin/chat.actions.ts` (self — extend) | exact |
| `src/server/actions/chat.actions.ts` | server action | request-response | `src/server/actions/chat.actions.ts` (self — extend) | exact |
| `src/lib/auth.ts` | config | event-driven (hook) | `src/lib/auth.ts` (self — extend) | exact |
| `src/app/api/chat/new/route.ts` | API route | request-response | `src/app/api/chat/guest/route.ts` | role-match |
| `src/app/api/chat/claim/route.ts` | API route | request-response | `src/app/api/chat/messages/route.ts` | role-match |
| `src/components/chat/archived-chat-banner.tsx` | component | event-driven | `src/components/chat/chat-panel.tsx` | role-match |
| `src/components/chat/chat-provider.tsx` | provider | event-driven (Pusher) | `src/components/chat/chat-provider.tsx` (self — extend) | exact |

---

## Pattern Assignments

### `src/server/services/chat.service.ts` — extend: `archiveConversation`, add `createNewConversation`, add `claimGuestConversation`

**Analog:** `src/server/services/chat.service.ts` (self)

**Imports pattern** (lines 1–8):
```typescript
import type {
  ConversationStatus,
  MessageSender,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type {
  ConversationSummaryDto,
  MessageDto,
} from "@/types/chat";
```

**Error class pattern** (lines 26–44):
```typescript
export class ChatServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ChatServiceError";
  }
}
```

**Existing `archiveConversation` to extend** (lines 324–329):
```typescript
// CURRENT — only sets status. Phase 47: add isActive: false
export async function archiveConversation(conversationId: string) {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: "ARCHIVED" },  // <-- add isActive: false here
  });
}
```

**`$transaction` pattern to copy for `createNewConversation`** (lines 239–262 — `sendMessage`):
```typescript
const message = await prisma.$transaction(async (tx) => {
  const created = await tx.message.create({ data: { ... } });
  await tx.conversation.update({ where: { id: conversation.id }, data: { ... } });
  return created;
});
```

**`updateMany` + unique-violation pattern** (lines 82–89, 104–120 — `getOrCreateConversation`):
```typescript
function isUniqueViolation(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "P2002"
  );
}
// ...
try {
  return await prisma.conversation.create({ data: { ... } });
} catch (error) {
  if (isUniqueViolation(error)) { return prisma.conversation.findFirstOrThrow(...); }
  throw error;
}
```

**`findFirst` with `isActive: true` guard** (lines 95–97, 150–152):
```typescript
const existing = await prisma.conversation.findFirst({
  where: { userId, isActive: true },
});
// and:
return prisma.conversation.findFirst({ where: { userId, isActive: true } });
```

---

### `src/server/actions/admin/chat.actions.ts` — extend: `archiveConversationAction` to add Pusher trigger

**Analog:** `src/server/actions/admin/chat.actions.ts` (self) + `src/app/api/chat/messages/route.ts` for Pusher pattern

**Full current file** (lines 1–43):
```typescript
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/permissions";
import {
  archiveConversation,
  deleteConversation,
  unarchiveConversation,
} from "@/server/services/chat.service";

const conversationIdSchema = z
  .string()
  .cuid("Невірний ідентифікатор розмови");

function revalidateAdminChat() {
  revalidatePath("/admin/chaty");
  revalidatePath("/", "layout");
}

export async function archiveConversationAction(conversationId: string) {
  await requireAdmin();
  const id = conversationIdSchema.parse(conversationId);
  await archiveConversation(id);
  revalidateAdminChat();
  return { ok: true as const };
}
```

**Pusher trigger pattern to add** (from `src/app/api/chat/messages/route.ts` lines 91–99 and 144–153):
```typescript
try {
  await getPusherServer().trigger(
    conversationChannel(message.conversationId),
    "message:new",
    pusherPayload(message),
  );
} catch (error) {
  if (!(error instanceof PusherNotConfiguredError)) {
    throw error;
  }
}
```

**New imports to add to the action file:**
```typescript
import {
  conversationChannel,
  getPusherServer,
  PusherNotConfiguredError,
} from "@/lib/pusher-server";
```

**Combined `archiveConversationAction` pattern (after extension):**
```typescript
export async function archiveConversationAction(conversationId: string) {
  await requireAdmin();
  const id = conversationIdSchema.parse(conversationId);
  await archiveConversation(id);

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

---

### `src/app/api/chat/new/route.ts` — new: POST endpoint for buyer starting a new chat

**Analog:** `src/app/api/chat/guest/route.ts` (same route role, simpler) + `src/app/api/chat/messages/route.ts` (auth + guest dual-path)

**Auth + body-parse pattern** (from `messages/route.ts` lines 54–73):
```typescript
export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "INVALID_BODY" }, { status: 400 });
  }
  // ... validate body ...
}
```

**Zod UUID validation** (from `messages/route.ts` body parse pattern + `guest/route.ts` line 14 regex):
```typescript
const parsed = z.object({ guestToken: z.string().uuid() }).safeParse(body);
if (!parsed.success) {
  return Response.json({ error: "INVALID_TOKEN" }, { status: 400 });
}
```

**Full new file structure:**
- Import `headers` from `"next/headers"`, `auth` from `"@/lib/auth"`, `z` from `"zod"`, `createNewConversation` from `"@/server/services/chat.service"`
- Session check: if `session?.user` → call `createNewConversation({ userId: session.user.id })`
- Guest path: parse `guestToken` from body with `z.string().uuid()` → `createNewConversation({ guestToken })`
- Return `Response.json({ conversationId: conversation.id }, { status: 201 })`

---

### `src/app/api/chat/claim/route.ts` — new: POST endpoint for guest-to-account claim

**Analog:** `src/app/api/chat/messages/route.ts` (session check pattern) + `src/lib/permissions.ts` (`assertBuyerApi`)

**Session guard pattern for API routes** (from `permissions.ts` lines 44–55):
```typescript
export async function assertBuyerApi(): Promise<Response | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  return null;
}
```

**Inline session check pattern** (from `messages/route.ts` lines 54–57, 74):
```typescript
const session = await auth.api.getSession({ headers: await headers() });
// ...
if (!session?.user) {
  // guest path or 401
}
```

**Full new file structure:**
- Import `headers` from `"next/headers"`, `auth` from `"@/lib/auth"`, `z` from `"zod"`, `claimGuestConversation` from `"@/server/services/chat.service"`
- Call `auth.api.getSession({ headers: await headers() })`; return 401 if no session
- Parse `guestToken` with `z.object({ guestToken: z.string().uuid() }).safeParse(body)`; return 400 if invalid
- Call `await claimGuestConversation(parsed.data.guestToken, session.user.id)`
- Return `Response.json({ ok: true })`

---

### `src/components/chat/archived-chat-banner.tsx` — extend: add `"use client"`, button, handler

**Analog:** `src/components/chat/chat-panel.tsx` (client component with button + onClick + `useChat`)

**`"use client"` + hooks pattern** (from `chat-provider.tsx` line 1 and `chat-panel.tsx` line 1):
```typescript
"use client";

import { useState } from "react";
import { useChat } from "@/components/chat/chat-provider";
import { Button } from "@/components/ui/button";
```

**Button with loading state pattern** (from `chat-panel.tsx` lines 38–47 — the close button):
```typescript
<Button
  type="button"
  variant="outline"
  size="icon"
  className="size-9 shrink-0"
  onClick={onClose}
  aria-label="Закрити чат"
>
  <X className="size-4" />
</Button>
```

**Async click handler with `useState(false)` loading guard** (from `chat-provider.tsx` `openPanel` callback style):
```typescript
const [isStarting, setIsStarting] = useState(false);

const handleStartNew = async () => {
  setIsStarting(true);
  try {
    // ... fetch POST /api/chat/new ...
  } finally {
    setIsStarting(false);
  }
};
```

**`useChat()` destructuring** (from `chat-panel.tsx` — uses `useChat()` from provider):
```typescript
const { conversationId, guestToken, setConversationId, setConversationStatus } = useChat();
```

**Current banner JSX to update** (full file lines 1–15):
```typescript
// current — no "use client", no button, text needs updating
export function ArchivedChatBanner() {
  return (
    <div role="status" className="border-b border-border bg-muted px-4 py-3">
      <p className="text-sm font-semibold text-foreground">
        Діалог закрито магазином  {/* → change to: Чат завершено */}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Ви можете переглядати історію, але нові повідомлення надіслати не можна.
      </p>
    </div>
  );
}
```

Note: The current file has no `"use client"` directive (verified: line 1 is the function declaration directly). Adding an `onClick` button requires `"use client"` at the top.

---

### `src/components/chat/chat-provider.tsx` — extend: bind `conversation:closed` in Pusher useEffect, add claim effect

**Analog:** `src/components/chat/chat-provider.tsx` (self)

**Existing Pusher useEffect structure to extend** (lines 331–405):
```typescript
useEffect(() => {
  if (!isOpen || !conversationId || !isPusherClientConfigured()) {
    return;
  }

  setGuestTokenForPusher(guestToken);

  let cancelled = false;
  const channelName = `private-conversation-${conversationId}`;
  const pusher = getPusherClient();

  const handleMessage = (payload: PusherMessagePayload) => {
    if (cancelled || payload.conversationId !== conversationId) return;
    appendMessage({ ... });
  };

  const channel = pusher.subscribe(channelName);
  channel.bind("message:new", handleMessage);
  // ...
  return () => {
    cancelled = true;
    channel.unbind("message:new", handleMessage);
    // ...
    pusher.unsubscribe(channelName);
  };
}, [appendMessage, conversationId, guestToken, hasSession, isOpen, refetchMessages, refetchMessagesForGuest]);
```

**New `handleClose` to bind inside the existing useEffect** — mirrors `handleMessage` pattern exactly:
```typescript
// Add INSIDE the existing Pusher useEffect, after handleMessage is declared:
const handleClose = (payload: { conversationId: string }) => {
  if (cancelled || payload.conversationId !== conversationId) return;
  setConversationStatus("ARCHIVED");
};

channel.bind("conversation:closed", handleClose);
// In the return cleanup:
channel.unbind("conversation:closed", handleClose);
```

**`useRef` pattern for one-shot effect** (existing pattern at lines 125–126):
```typescript
const wasDisconnectedRef = useRef(false);
const subscribedChannelRef = useRef<string | null>(null);
// → same pattern for: const claimAttemptedRef = useRef(false);
```

**Guest token localStorage pattern** (from existing guest restore effect lines 266–294):
```typescript
useEffect(() => {
  if (hasSession) return;
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem("chat_guest_token");
    if (!stored) return;
    setGuestToken(stored);
    void (async () => {
      try {
        const response = await fetch(`/api/chat/guest?token=${encodeURIComponent(stored)}`);
        if (!response.ok) return;
        const data = await response.json() as { ... };
        setConversationId(data.conversationId);
        // ...
      } catch { }
    })();
  } catch { }
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

**Claim effect to add** (mirrors the guest restore effect above, fires when `hasSession` becomes true):
```typescript
const claimAttemptedRef = useRef(false);

useEffect(() => {
  if (!hasSession || claimAttemptedRef.current) return;
  if (typeof window === "undefined") return;

  const stored = localStorage.getItem(GUEST_CHAT_TOKEN_KEY);
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
        localStorage.removeItem(GUEST_CHAT_TOKEN_KEY);
        setGuestToken(null);
        setGuestTokenForPusher(null);
      }
    } catch {
      // claim failure is non-fatal — silently continue
    }
  })();
}, [hasSession]);
```

**`setMessages` pattern** (line 116 + usage in `fetchMessages` line 224):
```typescript
// Used to reset messages when new conversation starts:
setMessages([]);
setConversationStatus("OPEN");
setConversationId(newId);
// Pusher useEffect re-subscribes automatically because conversationId is in its deps
```

---

### `src/lib/auth.ts` — extend: add `databaseHooks` (Option A, lower priority)

**Analog:** `src/lib/auth.ts` (self)

**Current `betterAuth` call** (lines 8–20):
```typescript
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  plugins: [
    admin({ defaultRole: "buyer" }),
    nextCookies(),
  ],
  trustedOrigins: getTrustedAuthOrigins(),
});
```

**Pattern to add (if Option A chosen):**
```typescript
databaseHooks: {
  session: {
    create: {
      after: async (session, ctx) => {
        // ctx may be null for programmatically created sessions — always guard
        try {
          // read guestToken from cookie: ctx?.request?.headers?.get("cookie")
          // then call claimGuestConversation(guestToken, session.userId)
        } catch {
          // never block session creation
        }
      },
    },
  },
},
```

Note: RESEARCH.md strongly recommends Option B (client-triggered `POST /api/chat/claim`) over Option A due to `ctx` null-ability. `auth.ts` extension is only needed for Option A.

---

## Shared Patterns

### Session authentication in API routes
**Source:** `src/app/api/chat/messages/route.ts` lines 54–57 and `src/lib/permissions.ts` lines 44–55
**Apply to:** `src/app/api/chat/new/route.ts`, `src/app/api/chat/claim/route.ts`
```typescript
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user) {
  return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
}
```

### Pusher trigger with `PusherNotConfiguredError` guard
**Source:** `src/app/api/chat/messages/route.ts` lines 90–100 and `src/lib/pusher-server.ts` lines 3–11
**Apply to:** `src/server/actions/admin/chat.actions.ts`
```typescript
import {
  conversationChannel,
  getPusherServer,
  PusherNotConfiguredError,
} from "@/lib/pusher-server";

try {
  await getPusherServer().trigger(
    conversationChannel(id),
    "conversation:closed",
    { conversationId: id },
  );
} catch (error) {
  if (!(error instanceof PusherNotConfiguredError)) throw error;
}
```

### Zod validation in API routes
**Source:** `src/server/validators/chat.ts` (used in `messages/route.ts` line 66) and inline in `guest/route.ts` line 14
**Apply to:** `src/app/api/chat/new/route.ts`, `src/app/api/chat/claim/route.ts`
```typescript
import { z } from "zod";

const parsed = z.object({ guestToken: z.string().uuid() }).safeParse(body);
if (!parsed.success) {
  return Response.json({ error: "INVALID_TOKEN" }, { status: 400 });
}
```

### Body parse guard
**Source:** `src/app/api/chat/messages/route.ts` lines 59–64
**Apply to:** `src/app/api/chat/new/route.ts`, `src/app/api/chat/claim/route.ts`
```typescript
let body: unknown;
try {
  body = await request.json();
} catch {
  return Response.json({ error: "INVALID_BODY" }, { status: 400 });
}
```

### Server action structure (`"use server"` + `requireAdmin` + zod + return `{ ok: true }`)
**Source:** `src/server/actions/admin/chat.actions.ts` lines 1–27
**Apply to:** Any new buyer server action in `src/server/actions/chat.actions.ts`
```typescript
"use server";

import { requireAdmin } from "@/lib/permissions"; // or requireBuyer for buyer actions
import { z } from "zod";

const conversationIdSchema = z.string().cuid("Невірний ідентифікатор розмови");

export async function someAction(conversationId: string) {
  await requireAdmin(); // or requireBuyer()
  const id = conversationIdSchema.parse(conversationId);
  // ... service call ...
  revalidateAdminChat();
  return { ok: true as const };
}
```

### `$transaction` with `updateMany` for atomicity
**Source:** `src/server/services/chat.service.ts` lines 239–262 (`sendMessage` `$transaction`)
**Apply to:** `createNewConversation` in `chat.service.ts`
```typescript
return prisma.$transaction(async (tx) => {
  await tx.conversation.updateMany({
    where: { userId: input.userId, isActive: true },
    data: { isActive: false },
  });
  return tx.conversation.create({
    data: { userId: input.userId, isActive: true },
  });
});
```

### Pusher event handler binding pattern in `ChatProvider`
**Source:** `src/components/chat/chat-provider.tsx` lines 345–360 (`handleMessage` + `channel.bind`)
**Apply to:** `conversation:closed` handler added to the same Pusher useEffect
```typescript
const handleClose = (payload: { conversationId: string }) => {
  if (cancelled || payload.conversationId !== conversationId) return;
  setConversationStatus("ARCHIVED");
};

channel.bind("conversation:closed", handleClose);
// cleanup:
channel.unbind("conversation:closed", handleClose);
```

---

## No Analog Found

All files have close analogs. No entries.

---

## Metadata

**Analog search scope:** `src/server/services/`, `src/server/actions/`, `src/app/api/chat/`, `src/components/chat/`, `src/lib/`
**Files scanned:** 10
**Pattern extraction date:** 2026-05-25
