# Phase 51: Chat Badge & Suggested Messages - Pattern Map

**Mapped:** 2026-05-27
**Files analyzed:** 8 new/modified files
**Analogs found:** 8 / 8

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/chat/chat-provider.tsx` | provider | event-driven | self (existing file, targeted mutation) | exact |
| `src/components/chat/chat-provider-gate.tsx` | provider | request-response | self (existing file, targeted mutation) | exact |
| `src/server/services/chat.service.ts` | service | CRUD | `countUnreadForAdmin` in same file (line 320) | exact |
| `src/components/layout/storefront-fabs.tsx` | component | event-driven | self (cart FAB badge pattern in same file, lines 70-88) | exact |
| `src/components/chat/chat-fab.tsx` | component | event-driven | `storefront-fabs.tsx` chat FAB section | role-match |
| `src/components/chat/chat-panel.tsx` | component | request-response | self (PanelBody function, lines 87-138) | exact |
| `src/components/chat/chat-composer.tsx` | component | request-response | self (ChatComposer function, lines 72-285) | exact |
| `src/components/chat/suggested-messages.tsx` | component | event-driven | `src/components/chat/product-context-banner.tsx` | role-match |

---

## Pattern Assignments

### `src/components/chat/chat-provider.tsx` (provider, event-driven)

**Analog:** self — targeted mutation of four sites within the existing file

**Current context type shape** (lines 49-76) — shows all fields that must be renamed:
```typescript
type ChatContextValue = {
  hasSession: boolean;
  isOpen: boolean;
  messages: ChatMessage[];
  conversationId: string | null;
  conversationStatus: ConversationStatus | null;
  canSend: boolean;
  isLoading: boolean;
  loadError: string | null;
  isDisconnected: boolean;
  unreadFromStore: boolean;       // RENAME → unreadCount: number
  productContext: ProductChatContext | null;
  guestToken: string | null;
  openPanel: (options?: ProductChatContext) => void;
  closePanel: () => void;
  refetchMessages: () => Promise<void>;
  appendMessage: (message: ChatMessage) => void;
  replaceOptimisticMessage: (tempId: string, message: MessageDto) => void;
  removeOptimisticMessage: (tempId: string) => void;
  setConversationId: (id: string) => void;
  setConversationStatus: (status: ConversationStatus) => void;
  clearUnreadFromStore: () => void; // RENAME → clearUnreadCount: () => void
  resetMessages: () => void;
  updateGuestToken: (token: string) => void;
  panelView: "thread" | "history";
  openHistory: () => void;
  closeHistory: () => void;
};
```

**Props type** (lines 82-91) — `initialUnreadFromStore?: boolean` becomes `initialUnreadCount?: number`:
```typescript
type ChatProviderProps = {
  children?: ReactNode;
  hasSession: boolean;
  initialConversationId?: string;
  initialConversationStatus?: ConversationStatus;
  initialUnreadFromStore?: boolean;  // REPLACE with initialUnreadCount?: number
  phones: PublicStorePhone[];
  initialCartCount: number;
};
```

**State initialization** (line 107-128) — shows the boolean default that becomes `0`:
```typescript
// BEFORE (line 107-108):
initialUnreadFromStore = false,
// ...
const [unreadFromStore, setUnreadFromStore] = useState(initialUnreadFromStore);

// AFTER:
initialUnreadCount = 0,
// ...
const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
```

**appendMessage — STORE branch** (lines 186-194) — boolean set becomes increment:
```typescript
// BEFORE:
const appendMessage = useCallback((message: ChatMessage) => {
  setMessages((prev) => {
    if (prev.some((item) => item.id === message.id)) return prev;
    return [...prev, message];
  });
  if (message.senderRole === "STORE") {
    setUnreadFromStore(!isOpenRef.current);  // REPLACE
  }
}, []); // stable reference — reads isOpen via isOpenRef.current (WR-01)

// AFTER:
if (message.senderRole === "STORE" && !isOpenRef.current) {
  setUnreadCount((prev) => prev + 1);
}
```

**clearUnread callback** (lines 213-215) — boolean false becomes 0:
```typescript
// BEFORE:
const clearUnreadFromStore = useCallback(() => {
  setUnreadFromStore(false);
}, []);

// AFTER:
const clearUnreadCount = useCallback(() => setUnreadCount(0), []);
```

**useEffect that clears on open** (lines 430-434) — remove `hasSession` guard for client-side reset:
```typescript
// BEFORE:
useEffect(() => {
  if (isOpen && hasSession) {
    clearUnreadFromStore();
  }
}, [clearUnreadFromStore, hasSession, isOpen]);

// AFTER (client reset always; markBuyerReadAction still hasSession-gated in the other useEffect):
useEffect(() => {
  if (isOpen) {
    clearUnreadCount();
  }
}, [clearUnreadCount, isOpen]);
```

**useMemo value object** (lines 477-532) — rename both fields in the value object and dependency array:
```typescript
// In value object (line 488, 499):
unreadFromStore,      // REPLACE with unreadCount,
clearUnreadFromStore, // REPLACE with clearUnreadCount,

// In dependency array (lines 507-531):
unreadFromStore,      // REPLACE with unreadCount,
clearUnreadFromStore, // REPLACE with clearUnreadCount,
```

**useChat consumer hook** (lines 551-557) — unchanged, copy as-is:
```typescript
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
```

---

### `src/components/chat/chat-provider-gate.tsx` (provider, request-response)

**Analog:** self — targeted mutation of the unread initialization block

**Full current file** (lines 1-50):
```typescript
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { ConversationStatus } from "@/generated/prisma/client";
import { getConversationForBuyer } from "@/server/services/chat.service";
import { ChatProvider } from "@/components/chat/chat-provider";
import type { PublicStorePhone } from "@/server/services/store-settings.service";

export async function ChatProviderGate({
  children,
  phones,
  initialCartCount,
}: {
  children: React.ReactNode;
  phones: PublicStorePhone[];
  initialCartCount: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const hasSession = Boolean(session?.user);
  let initialConversationId: string | undefined;
  let initialConversationStatus: ConversationStatus | undefined;
  let initialUnreadFromStore = false;        // REPLACE

  if (session?.user) {
    const conversation = await getConversationForBuyer(session.user.id);
    if (conversation) {
      initialConversationId = conversation.id;
      initialConversationStatus = conversation.status;
      initialUnreadFromStore =               // REPLACE entire block
        conversation.lastMessageSender === "STORE" &&
        conversation.lastMessageAt !== null &&
        conversation.lastMessageAt > conversation.buyerLastReadAt;
    }
  }

  return (
    <ChatProvider
      hasSession={hasSession}
      initialConversationId={initialConversationId}
      initialConversationStatus={initialConversationStatus}
      initialUnreadFromStore={initialUnreadFromStore}  // RENAME prop
      phones={phones}
      initialCartCount={initialCartCount}
    >
      {children}
    </ChatProvider>
  );
}
```

**Import addition** — add `countUnreadForBuyer` to the service import line 4:
```typescript
import { getConversationForBuyer, countUnreadForBuyer } from "@/server/services/chat.service";
```

**Replacement block** — the three lines inside `if (conversation)` become:
```typescript
let initialUnreadCount = 0;
if (session?.user) {
  const conversation = await getConversationForBuyer(session.user.id);
  if (conversation) {
    initialConversationId = conversation.id;
    initialConversationStatus = conversation.status;
    initialUnreadCount = await countUnreadForBuyer(
      conversation.id,
      conversation.buyerLastReadAt,
    );
  }
}
// JSX prop rename: initialUnreadFromStore={initialUnreadFromStore}
//            → initialUnreadCount={initialUnreadCount}
```

---

### `src/server/services/chat.service.ts` (service, CRUD)

**Analog:** `countUnreadForAdmin` in the same file (lines 320-335)

**Existing analog — countUnreadForAdmin** (lines 320-335):
```typescript
export async function countUnreadForAdmin(): Promise<number> {
  return prisma.conversation.count({
    where: {
      status: "OPEN",
      lastMessageSender: "BUYER",
      lastMessageAt: { not: null },
      AND: [
        {
          lastMessageAt: {
            gt: prisma.conversation.fields.adminLastReadAt,
          },
        },
      ],
    },
  });
}
```

**Existing analog — markBuyerRead** (lines 313-318) — shows `buyerLastReadAt` field access:
```typescript
export async function markBuyerRead(conversationId: string) {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { buyerLastReadAt: new Date() },
  });
}
```

**New function to add** — insert after `markBuyerRead` (after line 318, before `countUnreadForAdmin`):
```typescript
export async function countUnreadForBuyer(
  conversationId: string,
  buyerLastReadAt: Date,
): Promise<number> {
  return prisma.message.count({
    where: {
      conversationId,
      senderRole: "STORE",
      createdAt: { gt: buyerLastReadAt },
    },
  });
}
```

**Note:** Uses `prisma.message.count` (not `prisma.conversation.count` like the admin version) because unread count for buyer is per-message within a known conversation, not across all conversations.

---

### `src/components/layout/storefront-fabs.tsx` (component, event-driven)

**Analog:** self — cart FAB badge pattern (lines 70-88) applied to chat FAB (lines 91-109)

**Cart FAB badge pattern** (lines 50, 70-88) — the exact pattern to replicate for chat:
```typescript
const badgeLabel = cartCount > 9 ? "9+" : String(cartCount);

// Cart FAB button with badge:
<button
  type="button"
  onClick={openCart}
  aria-label={cartCount > 0 ? `Кошик, ${cartCount} товарів` : "Кошик"}
  className={cn(
    "flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative",
  )}
>
  <ShoppingCart className="size-6" aria-hidden />
  {cartCount > 0 && (
    <Badge
      className="absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px]"
      aria-hidden
    >
      {badgeLabel}
    </Badge>
  )}
</button>
```

**Current chat FAB section** (lines 34, 91-109) — shows current destructure and dot indicator to replace:
```typescript
// Line 34 — destructure from useChat (add unreadCount, remove unreadFromStore):
const { isOpen: chatIsOpen, openPanel, unreadFromStore } = useChat();

// Lines 91-109 — chat FAB with dot (replace dot with Badge):
{!chatIsOpen && (
  <button
    type="button"
    onClick={() => openPanel()}
    className={cn(
      "flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative",
    )}
    aria-label="Відкрити чат з магазином"
  >
    <MessageSquare className="size-6" aria-hidden />
    {hasSession && unreadFromStore ? (   // REPLACE this entire conditional
      <span
        className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-primary ring-2 ring-background"
        aria-hidden
      />
    ) : null}
  </button>
)}
```

**After changes** — three mutations:
1. Destructure: `unreadCount` instead of `unreadFromStore` (line 34)
2. Add badge label const: `const chatBadgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);`
3. Replace dot `<span>` with `Badge` and update `aria-label`:
```typescript
aria-label={
  unreadCount > 0
    ? `Відкрити чат з магазином, ${unreadCount} непрочитаних`
    : "Відкрити чат з магазином"
}
// ...
{unreadCount > 0 && (
  <Badge
    className="absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px]"
    aria-hidden
  >
    {chatBadgeLabel}
  </Badge>
)}
```

**Note:** The button already has `relative` in its className (line 97) — no positional fix needed here (unlike `chat-fab.tsx`).

---

### `src/components/chat/chat-fab.tsx` (component, event-driven)

**Analog:** `src/components/layout/storefront-fabs.tsx` cart FAB badge pattern

**Full current file** (lines 1-31):
```typescript
"use client";

import { MessageSquare } from "lucide-react";
import { useChat } from "@/components/chat/chat-provider";
import { cn } from "@/lib/utils";

export function ChatFab() {
  const { isOpen, unreadFromStore, openPanel, hasSession } = useChat();

  if (isOpen) return null;

  return (
    <button
      type="button"
      onClick={() => openPanel()}
      className={cn(
        "fixed bottom-6 right-6 z-[60] flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
        "pb-[max(0px,env(safe-area-inset-bottom))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
      aria-label="Відкрити чат з магазином"
    >
      <MessageSquare className="size-6" aria-hidden />
      {hasSession && unreadFromStore ? (
        <span
          className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-primary ring-2 ring-background"
          aria-hidden
        />
      ) : null}
    </button>
  );
}
```

**Three mutations required:**
1. Add `Badge` import from `@/components/ui/badge`
2. Destructure `unreadCount` instead of `unreadFromStore` (remove `hasSession` from destructure if only used for the badge check)
3. Add `relative` to the button's second className string (currently missing — pitfall 5 from RESEARCH.md)
4. Replace `{hasSession && unreadFromStore ? <span ...> : null}` with the Badge pattern

**After changes:**
```typescript
"use client";

import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@/components/chat/chat-provider";
import { cn } from "@/lib/utils";

export function ChatFab() {
  const { isOpen, unreadCount, openPanel } = useChat();
  const chatBadgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  if (isOpen) return null;

  return (
    <button
      type="button"
      onClick={() => openPanel()}
      className={cn(
        "fixed bottom-6 right-6 z-[60] flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
        "pb-[max(0px,env(safe-area-inset-bottom))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative",
      )}
      aria-label={
        unreadCount > 0
          ? `Відкрити чат з магазином, ${unreadCount} непрочитаних`
          : "Відкрити чат з магазином"
      }
    >
      <MessageSquare className="size-6" aria-hidden />
      {unreadCount > 0 && (
        <Badge
          className="absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px]"
          aria-hidden
        >
          {chatBadgeLabel}
        </Badge>
      )}
    </button>
  );
}
```

---

### `src/components/chat/chat-panel.tsx` (component, request-response)

**Analog:** self — PanelBody function (lines 87-138); `productContext` conditional pattern (lines 123-127)

**Current PanelBody full function** (lines 87-138) — shows the exact insertion point and conditional pattern to copy:
```typescript
function PanelBody({
  useNativeScroll,
  stickyHeader = false,
}: {
  useNativeScroll?: boolean;
  stickyHeader?: boolean;
}) {
  const {
    messages,
    isLoading,
    loadError,
    isDisconnected,
    productContext,
    conversationStatus,
    refetchMessages,
    closePanel,
    isOpen,
  } = useChat();

  const isArchived = conversationStatus === "ARCHIVED";

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <PanelHeader onClose={closePanel} sticky={stickyHeader} />
      {isDisconnected ? (
        <div className="shrink-0">
          <DisconnectedBanner onRefresh={refetchMessages} />
        </div>
      ) : null}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        loadError={loadError}
        useNativeScroll={useNativeScroll}
        isPanelOpen={isOpen}
      />
      {productContext ? (             // ← use this conditional pattern as a template
        <div className="shrink-0">
          <ProductContextBanner context={productContext} />
        </div>
      ) : null}
      {isArchived ? (
        <div className="shrink-0">
          <ArchivedChatBanner />
        </div>
      ) : null}
      <div className="shrink-0">
        <ChatComposer />              // ← ChatComposer gets new props here
      </div>
    </div>
  );
}
```

**Mutations to PanelBody:**
1. Add `useState` to the React import (already imported via `useEffect, useState`)
2. Add `canSend` to the `useChat()` destructure
3. Add `prefillText` local state:
   ```typescript
   const [prefillText, setPrefillText] = useState("");
   ```
4. Add `SuggestedMessages` import at top of file
5. Insert SuggestedMessages between `<MessageList>` and `{productContext ? ...}`:
   ```typescript
   {messages.length === 0 && !isLoading && canSend ? (
     <div className="shrink-0">
       <SuggestedMessages
         productContext={productContext}
         onSelect={setPrefillText}
       />
     </div>
   ) : null}
   ```
6. Pass prefill props to ChatComposer:
   ```typescript
   <ChatComposer
     prefillText={prefillText}
     onPrefillConsumed={() => setPrefillText("")}
   />
   ```

---

### `src/components/chat/chat-composer.tsx` (component, request-response)

**Analog:** self — `ChatComposer` function (lines 72-285)

**Current function signature and state** (lines 72-100):
```typescript
export function ChatComposer() {
  const {
    conversationId,
    productContext,
    guestToken,
    canSend: canSendMessages,
    hasSession,
    appendMessage,
    replaceOptimisticMessage,
    removeOptimisticMessage,
    setConversationId,
    setConversationStatus,
  } = useChat();

  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
```

**useEffect import** — currently only `useRef, useState, type KeyboardEvent` imported (line 3); must add `useEffect`:
```typescript
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
```

**Two mutations:**
1. Add props to `ChatComposer` function signature:
   ```typescript
   export function ChatComposer({
     prefillText = "",
     onPrefillConsumed,
   }: {
     prefillText?: string;
     onPrefillConsumed?: () => void;
   } = {}) {
   ```

2. Add `useEffect` to consume `prefillText` — insert after the `fileInputRef` declaration (after line 91):
   ```typescript
   useEffect(() => {
     if (!prefillText) return;
     setBody(prefillText);
     onPrefillConsumed?.();
   }, [prefillText, onPrefillConsumed]);
   ```

**Core send pattern** (lines 118-193) — unchanged; no modifications to `send()` logic. The textarea `value={body}` already reads from `setBody` so prefill flows through correctly.

---

### `src/components/chat/suggested-messages.tsx` (component, event-driven) — NEW FILE

**Analog:** `src/components/chat/product-context-banner.tsx` — same role (presentational chip/banner), same data source (`productContext` from ChatContext)

**product-context-banner.tsx full file** (lines 1-24) — copy file structure, prop import pattern:
```typescript
import Link from "next/link";
import type { ProductChatContext } from "@/components/chat/chat-provider";

type ProductContextBannerProps = {
  context: ProductChatContext;
};

export function ProductContextBanner({ context }: ProductContextBannerProps) {
  if (!context.productTitle) return null;

  return (
    <div className="mx-3 mt-2 rounded-md border bg-card px-3 py-2 text-sm">
      <p className="line-clamp-2">Питання про: {context.productTitle}</p>
      {context.productSlug ? (
        <Link
          href={`/tovar/${context.productSlug}`}
          className="mt-1 inline-block text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Переглянути товар
        </Link>
      ) : null}
    </div>
  );
}
```

**New file to create** — `src/components/chat/suggested-messages.tsx`:
```typescript
import type { ProductChatContext } from "@/components/chat/chat-provider";

type SuggestedMessagesProps = {
  productContext: ProductChatContext | null;
  onSelect: (text: string) => void;
};

const GENERAL_SUGGESTIONS = [
  "Який у вас графік роботи?",
  "Де ви знаходитесь?",
  "Як оформити замовлення?",
] as const;

export function SuggestedMessages({ productContext, onSelect }: SuggestedMessagesProps) {
  const suggestions: string[] = [];

  if (productContext?.productTitle) {
    suggestions.push(`Цікавить ${productContext.productTitle} — є ще в наявності?`);
  }

  suggestions.push(...GENERAL_SUGGESTIONS);

  return (
    <div className="flex flex-wrap gap-2 px-4 py-3">
      {suggestions.map((text) => (
        <button
          key={text}
          type="button"
          onClick={() => onSelect(text)}
          className="rounded-full border border-border bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-muted/80 transition-colors"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
```

**Notes:**
- No shadcn/ui `Button` needed — plain `<button>` with Tailwind matches the chip pattern; avoids Button variant override complexity.
- Import of `ProductChatContext` type mirrors the `product-context-banner.tsx` import pattern exactly.
- No `"use client"` directive needed — this component has no hooks; it receives all data as props. Parent (`PanelBody`) is already a client component.

---

## Shared Patterns

### Context Field Rename — all consumer touch-points

**Source:** `src/components/chat/chat-provider.tsx` (authoritative definition)
**Apply to:** Every file that destructures `unreadFromStore` or calls `clearUnreadFromStore`

**Files to grep for rename:**
```bash
grep -rn "unreadFromStore\|clearUnreadFromStore" src/
```

Known consumers from codebase read:
- `src/components/layout/storefront-fabs.tsx` line 34 — destructures `unreadFromStore`
- `src/components/chat/chat-fab.tsx` line 8 — destructures `unreadFromStore`
- `src/components/chat/chat-panel.test.tsx` line 46 — `baseChatContext.unreadFromStore`
- `src/components/layout/storefront-fabs.test.tsx` line 44 — `useChat` mock `unreadFromStore`

All must change from `unreadFromStore: boolean` to `unreadCount: number`.

### Badge Rendering Pattern

**Source:** `src/components/layout/storefront-fabs.tsx` lines 50, 70-88 (cart FAB)
**Apply to:** chat FAB in `storefront-fabs.tsx` (lines 91-109) and `chat-fab.tsx`

```typescript
// Badge label capping at "9+"
const badgeLabel = count > 9 ? "9+" : String(count);

// Badge element (absolute-positioned, parent must have `relative`):
{count > 0 && (
  <Badge
    className="absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px]"
    aria-hidden
  >
    {badgeLabel}
  </Badge>
)}
```

### Conditional Panel Section Pattern

**Source:** `src/components/chat/chat-panel.tsx` lines 123-127
**Apply to:** `SuggestedMessages` insertion in PanelBody

```typescript
// Established pattern for optional panel sections:
{condition ? (
  <div className="shrink-0">
    <ComponentName prop={value} />
  </div>
) : null}
```

### Service Function Pattern

**Source:** `src/server/services/chat.service.ts` lines 313-335 (`markBuyerRead`, `countUnreadForAdmin`)
**Apply to:** new `countUnreadForBuyer` function

```typescript
// File-level imports (lines 1-12) — already has prisma and all types:
import { prisma } from "@/lib/db";

// Function signature convention: named export, async, typed return:
export async function functionName(param: Type): Promise<ReturnType> {
  return prisma.model.operation({ where: { ... } });
}
```

### Vitest Test File Structure — service tests

**Source:** `src/server/services/chat.service.test.ts` lines 1-55 (setup) and 240-261 (`countUnreadForAdmin` test)
**Apply to:** new `countUnreadForBuyer` tests in `chat.service.test.ts`

```typescript
// Mock setup for prisma.message.count (already in mock, line 44):
message: {
  create: vi.fn(),
  count: vi.fn(),
  findMany: vi.fn(),
},

// Test describe block pattern (copy from countUnreadForAdmin, lines 240-261):
describe("countUnreadForBuyer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("counts STORE messages in conversation after buyerLastReadAt", async () => {
    vi.mocked(prisma.message.count).mockResolvedValueOnce(2);

    const cutoff = new Date("2026-05-01T00:00:00.000Z");
    const count = await countUnreadForBuyer("conv-1", cutoff);

    expect(count).toBe(2);
    expect(prisma.message.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          conversationId: "conv-1",
          senderRole: "STORE",
          createdAt: { gt: cutoff },
        }),
      }),
    );
  });
});
```

### Vitest Test File Structure — component tests (jsdom)

**Source:** `src/components/chat/chat-panel.test.tsx` lines 1-110
**Apply to:** new `suggested-messages.test.tsx` and `chat-provider.test.tsx`

```typescript
/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

// Mock useChat before imports so hoisting works correctly
vi.mock("@/components/chat/chat-provider", () => ({
  useChat: () => mockUseChat(),
}));

// Import after mocks
import { ComponentName } from "@/components/chat/component-name";

describe("ComponentName", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("description", () => {
    render(<ComponentName prop={value} />);
    expect(screen.getByText("...")).toBeDefined();
  });
});
```

**Note for `suggested-messages.test.tsx`:** `SuggestedMessages` takes no `useChat()` call — it receives `productContext` and `onSelect` as props. No `useChat` mock needed. Use `fireEvent.click` for chip click test (pattern from `storefront-fabs.test.tsx` lines 82-98).

**Note for `chat-provider.test.tsx`:** Mocking Pusher and `nuqs` is complex. If deferring to integration, the Wave 0 gap is acceptable per RESEARCH.md.

---

## Test File Updates Required

### `src/components/chat/chat-panel.test.tsx` — update `baseChatContext`

**Source:** lines 34-62
**Change:** rename `unreadFromStore: false` → `unreadCount: 0` and `clearUnreadFromStore: vi.fn()` → `clearUnreadCount: vi.fn()` in `baseChatContext`.

```typescript
// BEFORE (line 46):
unreadFromStore: false,
// ...
clearUnreadFromStore: vi.fn(),

// AFTER:
unreadCount: 0,
// ...
clearUnreadCount: vi.fn(),
```

### `src/components/layout/storefront-fabs.test.tsx` — update mock and add badge tests

**Source:** lines 40-47 (useChat mock)
**Change:** rename `unreadFromStore` → `unreadCount` in all mock `useChat` return values (lines 41-46, 170-175, 182-187, 194-200).

```typescript
// BEFORE:
vi.mock("@/components/chat/chat-provider", () => ({
  useChat: vi.fn().mockReturnValue({
    isOpen: false,
    openPanel: vi.fn(),
    unreadFromStore: false,   // RENAME
    hasSession: false,
  }),
}));

// AFTER:
vi.mock("@/components/chat/chat-provider", () => ({
  useChat: vi.fn().mockReturnValue({
    isOpen: false,
    openPanel: vi.fn(),
    unreadCount: 0,           // number, not boolean
    hasSession: false,
  }),
}));
```

---

## No Analog Found

All files have analogs. No files require falling back to RESEARCH.md patterns exclusively.

---

## Metadata

**Analog search scope:** `src/components/chat/`, `src/components/layout/`, `src/server/services/`, test files
**Files read:** 11 source files + 3 test files
**Pattern extraction date:** 2026-05-27
