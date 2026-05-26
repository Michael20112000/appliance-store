# Phase 48: History Drawer - Pattern Map

**Mapped:** 2026-05-26
**Files analyzed:** 8 (5 modified + 3 new)
**Analogs found:** 8 / 8

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/types/chat.ts` | model/types | — | `src/types/chat.ts` (self) | exact — add new type |
| `src/server/services/chat.service.ts` | service | CRUD | `listConversationsForAdmin` in same file (lines 397–437) | exact |
| `src/app/api/chat/conversations/route.ts` | route | request-response | `src/app/api/chat/messages/route.ts` GET (lines 171–198) | exact |
| `src/components/chat/chat-provider.tsx` | provider | event-driven | self (lines 112–178) — add `panelView` state alongside existing state fields | exact |
| `src/components/chat/chat-panel.tsx` | component | request-response | self (lines 18–49, 139–180) — extend `PanelHeader` + `ChatPanel` | exact |
| `src/components/chat/history-drawer.tsx` | component | request-response | `src/components/chat/archived-chat-banner.tsx` (fetch + context + button pattern) | role-match |
| `src/server/services/chat.service.test.ts` | test | — | same file (lines 1–108) — extend describe block | exact |
| `src/app/api/chat/conversations/route.test.ts` | test | — | `src/app/api/chat/claim/route.test.ts` | exact |

---

## Pattern Assignments

### `src/types/chat.ts` (model/types — extend)

**Analog:** `src/types/chat.ts` lines 15–24 (existing `ConversationSummaryDto`)

**Current shape** (lines 15–24):
```typescript
export type ConversationSummaryDto = {
  id: string;
  userId: string | null;
  status: ConversationStatus;
  buyerName: string;
  buyerEmail: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadForAdmin: boolean;
};
```

**Decision from RESEARCH.md:** Do NOT define a separate `BuyerConversationSummaryDto`. Instead, `listConversationsForBuyer` returns `ConversationSummaryDto[]` with `buyerName: "Ви"`, `buyerEmail: ""`, `unreadForAdmin: false` so that `ConversationList` can consume it without TypeScript errors and without changes to the component.

No new type needs to be added to `types/chat.ts`. The existing `ConversationSummaryDto` import is sufficient for `history-drawer.tsx` and `conversations/route.ts`.

---

### `src/server/services/chat.service.ts` (service, CRUD — extend)

**Analog:** `listConversationsForAdmin` in same file (lines 397–437)

**Import pattern** (lines 1–9 of file — already in place):
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

**Core pattern to copy — `listConversationsForAdmin`** (lines 397–437):
```typescript
export async function listConversationsForAdmin(options: {
  status: ConversationStatus;
}): Promise<ConversationSummaryDto[]> {
  const conversations = await prisma.conversation.findMany({
    where: { status: options.status },
    orderBy: { lastMessageAt: "desc" },
  });

  if (conversations.length === 0) return [];

  // ... user lookup omitted (buyer version skips this)

  return conversations.map((conversation) => {
    return {
      id: conversation.id,
      userId: conversation.userId,
      status: conversation.status,
      buyerName: buyer?.name ?? "Гість",
      buyerEmail: buyer?.email ?? "",
      lastMessagePreview: conversation.lastMessagePreview,
      lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
      unreadForAdmin,
    };
  });
}
```

**New function to add** (place after `listConversationsForAdmin`):
```typescript
export async function listConversationsForBuyer(
  userId: string,
): Promise<ConversationSummaryDto[]> {
  const rows = await prisma.conversation.findMany({
    where: { userId },                    // NO isActive filter — show all history
    orderBy: { lastMessageAt: "desc" },
    take: 50,                             // safety cap per RESEARCH.md open question
    select: {
      id: true,
      userId: true,
      status: true,
      lastMessagePreview: true,
      lastMessageAt: true,
    },
  });

  return rows.map((c) => ({
    id: c.id,
    userId: c.userId,
    status: c.status,
    buyerName: "Ви",          // placeholder — ConversationList shows this as display name
    buyerEmail: "",            // placeholder — ConversationList skips email row when empty
    lastMessagePreview: c.lastMessagePreview,
    lastMessageAt: c.lastMessageAt?.toISOString() ?? null,
    unreadForAdmin: false,     // placeholder — irrelevant for buyer self-view
  }));
}
```

**Key differences from admin version:**
- `where: { userId }` only — no `status` filter, no `isActive` filter
- No user lookup join (buyer is already the viewer)
- Fixed placeholder fields for `buyerName`, `buyerEmail`, `unreadForAdmin`
- `take: 50` safety cap

---

### `src/app/api/chat/conversations/route.ts` (route, request-response — new)

**Analog:** `GET` handler in `src/app/api/chat/messages/route.ts` (lines 171–198)

**Auth + session pattern** (lines 171–179):
```typescript
export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  // ...
}
```

**Import pattern** (lines 1–20 of `messages/route.ts`, trimmed to what's needed):
```typescript
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { listConversationsForBuyer } from "@/server/services/chat.service";
```

**New route** — simpler than messages route (no params, no error mapping needed):
```typescript
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { listConversationsForBuyer } from "@/server/services/chat.service";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const conversations = await listConversationsForBuyer(session.user.id);
  return Response.json({ conversations });
}
```

Note: No `request: Request` parameter — this route takes no query params.
No try/catch needed — `listConversationsForBuyer` does not throw `ChatServiceError`.

---

### `src/components/chat/chat-provider.tsx` (provider, event-driven — modify)

**Analog:** Existing state declarations and callbacks in same file (lines 112–178)

**State declaration pattern to follow** (lines 112–126):
```typescript
const [conversationId, setConversationId] = useState<string | null>(
  initialConversationId ?? null,
);
const [conversationStatus, setConversationStatus] =
  useState<ConversationStatus | null>(initialConversationStatus ?? null);
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [isLoading, setIsLoading] = useState(false);
// ... etc
```

**Callback pattern to follow — `closePanel`** (lines 149–152):
```typescript
const closePanel = useCallback(() => {
  void setQuery({ chat: null, productId: null });
  setProductContext(null);
}, [setQuery]);
```

**Three changes to make:**

1. Add `panelView` state after the existing state block (after line 126):
```typescript
const [panelView, setPanelView] = useState<"thread" | "history">("thread");
```

2. Add `openHistory` / `closeHistory` callbacks (after `closePanel`):
```typescript
const openHistory = useCallback(() => setPanelView("history"), []);
const closeHistory = useCallback(() => setPanelView("thread"), []);
```

3. Extend `closePanel` to reset view (RESEARCH.md Pitfall 2):
```typescript
const closePanel = useCallback(() => {
  void setQuery({ chat: null, productId: null });
  setProductContext(null);
  setPanelView("thread");   // reset so next open shows thread, not history
}, [setQuery]);
```

4. Extend `ChatContextValue` type (lines 46–70) — add three fields:
```typescript
type ChatContextValue = {
  // ... existing fields ...
  panelView: "thread" | "history";
  openHistory: () => void;
  closeHistory: () => void;
};
```

5. Add to `useMemo` value object (lines 463–511) and dependency array:
```typescript
panelView,
openHistory,
closeHistory,
```

---

### `src/components/chat/chat-panel.tsx` (component, request-response — modify)

**Analog:** Existing `PanelHeader` (lines 18–49) and `ChatPanel` (lines 139–180) in same file

**Current `PanelHeader`** (lines 18–49):
```typescript
function PanelHeader({
  onClose,
  sticky = false,
}: {
  onClose: () => void;
  sticky?: boolean;
}) {
  return (
    <div
      className={
        sticky
          ? "relative z-20 flex shrink-0 items-start justify-between border-b border-border bg-background px-4 py-3"
          : "flex shrink-0 items-start justify-between border-b border-border px-4 py-3"
      }
    >
      <div className="min-w-0 pr-2">
        <p className="text-sm font-semibold">Чат з магазином</p>
        <p className="text-xs text-muted-foreground">Відповімо якнайшвидше</p>
      </div>
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
    </div>
  );
}
```

**Modified `PanelHeader`** — add `Menu` button between title and X:
```typescript
// Add to import at line 3: Menu from "lucide-react"
import { Menu, X } from "lucide-react";

function PanelHeader({ onClose, sticky = false }: { onClose: () => void; sticky?: boolean }) {
  const { hasSession, openHistory } = useChat();
  return (
    <div className={sticky ? "relative z-20 flex shrink-0 items-start justify-between border-b border-border bg-background px-4 py-3" : "flex shrink-0 items-start justify-between border-b border-border px-4 py-3"}>
      <div className="min-w-0 flex-1 pr-2">   {/* note: add flex-1 so title doesn't push buttons off */}
        <p className="text-sm font-semibold">Чат з магазином</p>
        <p className="text-xs text-muted-foreground">Відповімо якнайшвидше</p>
      </div>
      {hasSession ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          onClick={openHistory}
          aria-label="Відкрити меню чатів"
        >
          <Menu className="size-4" />
        </Button>
      ) : null}
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
    </div>
  );
}
```

**Current `ChatPanel` render logic** (lines 139–180):
```typescript
export function ChatPanel() {
  const { isOpen, closePanel } = useChat();
  const isMobile = useIsMobile();

  return (
    <>
      <div ... aria-hidden={!isOpen}>
        <div className={isOpen ? "pointer-events-auto fixed ..." : "hidden"} role="dialog">
          {isOpen ? <PanelBody useNativeScroll={false} /> : null}
        </div>
      </div>
      <Sheet open={isOpen && isMobile} onOpenChange={(open) => !open && closePanel()}>
        <SheetContent ...>
          <SheetHeader className="sr-only"><SheetTitle>Чат з магазином</SheetTitle></SheetHeader>
          <PanelBody useNativeScroll stickyHeader />
        </SheetContent>
      </Sheet>
    </>
  );
}
```

**Modified `ChatPanel`** — branch on `panelView`:
```typescript
import { HistoryDrawer } from "@/components/chat/history-drawer";

export function ChatPanel() {
  const { isOpen, closePanel, panelView } = useChat();
  const isMobile = useIsMobile();

  const content = panelView === "history" ? <HistoryDrawer /> : null;  // HistoryDrawer manages its own header
  // PanelBody is used when panelView === "thread"

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[61] hidden md:block" aria-hidden={!isOpen}>
        <div className={isOpen ? "pointer-events-auto fixed bottom-6 right-6 flex h-[min(520px,calc(100dvh-7rem))] w-[380px] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl pb-[max(0px,env(safe-area-inset-bottom))]" : "hidden"}
          role="dialog" aria-modal="true" aria-label="Чат з магазином">
          {isOpen
            ? panelView === "history"
              ? <HistoryDrawer />
              : <PanelBody useNativeScroll={false} />
            : null}
        </div>
      </div>
      <Sheet open={isOpen && isMobile} onOpenChange={(open) => !open && closePanel()}>
        <SheetContent side="bottom" showCloseButton={false} className="flex h-[80dvh] max-h-[80dvh] min-h-0 flex-col gap-0 overflow-hidden rounded-t-2xl border-t p-0 pb-[max(0px,env(safe-area-inset-bottom))] md:hidden data-[side=bottom]:h-[80dvh]">
          <SheetHeader className="sr-only"><SheetTitle>Чат з магазином</SheetTitle></SheetHeader>
          {panelView === "history"
            ? <HistoryDrawer />
            : <PanelBody useNativeScroll stickyHeader />}
        </SheetContent>
      </Sheet>
    </>
  );
}
```

Note: `HistoryDrawer` renders its own header row (back + title + new chat button) — it does NOT use `PanelHeader`. `PanelHeader` stays inside `PanelBody` only.

---

### `src/components/chat/history-drawer.tsx` (component, request-response — new)

**Analog:** `src/components/chat/archived-chat-banner.tsx` (client component with `useChat`, fetch call, button)

**"use client" + import pattern** from `archived-chat-banner.tsx` (lines 1–6):
```typescript
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useChat } from "@/components/chat/chat-provider";
import { Button } from "@/components/ui/button";
```

**Fetch + state pattern** from `archived-chat-banner.tsx` (lines 17–39):
```typescript
const [isStarting, setIsStarting] = useState(false);

const handleStartNew = async () => {
  setIsStarting(true);
  try {
    const res = await fetch("/api/chat/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...(guestToken ? { guestToken } : {}) }),
    });
    if (!res.ok) {
      toast.error("Не вдалося створити новий чат. Спробуйте ще раз.");
      return;
    }
    const data = (await res.json()) as { conversationId: string; guestToken?: string };
    // ... update state
  } finally {
    setIsStarting(false);
  }
};
```

**Overflow layout pattern** from `chat-panel.tsx` `PanelBody` (lines 93–94):
```typescript
<div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
```

**Full `HistoryDrawer` component** (combines the above patterns):
```typescript
"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useChat } from "@/components/chat/chat-provider";
import { ConversationList } from "@/components/chat/conversation-list";
import { Button } from "@/components/ui/button";
import type { ConversationSummaryDto } from "@/types/chat";

export function HistoryDrawer() {
  const {
    conversationId,
    setConversationId,
    setConversationStatus,
    resetMessages,
    closeHistory,
  } = useChat();

  const [conversations, setConversations] = useState<ConversationSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/chat/conversations");
      if (!res.ok) { setIsLoading(false); return; }
      const data = (await res.json()) as { conversations: ConversationSummaryDto[] };
      setConversations(data.conversations);
      setIsLoading(false);
    })();
  }, []);

  const handleSelect = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;
    resetMessages();
    setConversationId(id);
    setConversationStatus(conv.status);
    closeHistory();
  };

  const handleNewChat = async () => {
    const res = await fetch("/api/chat/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    if (!res.ok) return;
    const data = (await res.json()) as { conversationId: string };
    resetMessages();
    setConversationId(data.conversationId);
    setConversationStatus("OPEN");
    closeHistory();
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {/* Header row — replaces PanelHeader for this view */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <Button variant="ghost" size="sm" onClick={closeHistory}>
          <ArrowLeft className="mr-1 size-4" /> Назад
        </Button>
        <p className="text-sm font-semibold">Мої чати</p>
        <Button variant="outline" size="sm" onClick={() => void handleNewChat()}>
          <Plus className="mr-1 size-4" /> Новий чат
        </Button>
      </div>
      {/* Scrollable list — min-h-0 + flex-1 enables scroll within fixed-height container */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ConversationList
          conversations={conversations}
          selectedId={conversationId}
          isLoading={isLoading}
          enableContextMenu={false}
          showUnreadHighlight={false}
          onSelect={handleSelect}
          emptyTitle="Ще немає чатів"
          emptyBody="Розпочніть розмову з магазином."
        />
      </div>
    </div>
  );
}
```

**Key constraint:** `ConversationList` wraps its content in `ConversationListColumn` which uses `border-r border-border`. This may add an unwanted right border inside the drawer. If it visually conflicts, the solution is to override with a wrapper that clips it — but test first as the border may be invisible against the panel's own border.

---

### `src/server/services/chat.service.test.ts` (test — extend)

**Analog:** Existing `describe("getOrCreateConversation")` block (lines 64–108)

**Mock setup pattern** (lines 29–54 — already in place, no change needed):
```typescript
vi.mock("@/lib/db", () => ({
  prisma: {
    conversation: {
      fields: { adminLastReadAt: "adminLastReadAt" },
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      findFirst: vi.fn(),
      findFirstOrThrow: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    // ...
  },
}));
```

**`describe` block pattern to follow** (lines 64–108):
```typescript
describe("getOrCreateConversation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns existing conversation", async () => {
    const existing = { id: "conv-1", userId: "buyer-1" };
    vi.mocked(prisma.conversation.findFirst).mockResolvedValueOnce(existing as never);
    const result = await getOrCreateConversation("buyer-1");
    expect(result).toEqual(existing);
    expect(prisma.conversation.create).not.toHaveBeenCalled();
  });
});
```

**New RED stub to add** (import `listConversationsForBuyer` with `@ts-expect-error` per existing pattern at line 9–10):
```typescript
// At top of file, add to import block:
// @ts-expect-error — not exported yet (Wave 0 RED stub)
listConversationsForBuyer,
```

**New `describe` block for `listConversationsForBuyer`:**
```typescript
describe("listConversationsForBuyer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all conversations for userId sorted by lastMessageAt desc (CHAT-07)", async () => {
    const rows = [
      { id: "conv-2", userId: "buyer-1", status: "OPEN", lastMessagePreview: "b", lastMessageAt: new Date("2026-05-26") },
      { id: "conv-1", userId: "buyer-1", status: "ARCHIVED", lastMessagePreview: "a", lastMessageAt: new Date("2026-05-25") },
    ];
    vi.mocked(prisma.conversation.findMany).mockResolvedValueOnce(rows as never);

    const result = await listConversationsForBuyer("buyer-1");

    expect(prisma.conversation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "buyer-1" } }),
    );
    expect(result).toHaveLength(2);
    expect(result[0]!.id).toBe("conv-2");
    expect(result[0]!.buyerName).toBe("Ви");
    expect(result[0]!.buyerEmail).toBe("");
    expect(result[0]!.unreadForAdmin).toBe(false);
  });

  it("does not filter by isActive — returns archived conversations (CHAT-07)", async () => {
    vi.mocked(prisma.conversation.findMany).mockResolvedValueOnce([] as never);
    await listConversationsForBuyer("buyer-1");
    const call = vi.mocked(prisma.conversation.findMany).mock.calls[0]![0] as { where: object };
    expect(call.where).not.toHaveProperty("isActive");
  });
});
```

---

### `src/app/api/chat/conversations/route.test.ts` (test — new)

**Analog:** `src/app/api/chat/claim/route.test.ts` (lines 1–33)

**Mock setup pattern** (lines 1–18 of `claim/route.test.ts`):
```typescript
import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue(null),
    },
  },
}));

vi.mock("@/server/services/chat.service", () => ({
  claimGuestConversation: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "@/app/api/chat/claim/route";
```

**New test file** (follows same pattern, adapted for GET):
```typescript
import { describe, expect, it, vi } from "vitest";

const getSession = vi.fn().mockResolvedValue(null);
const listConversationsForBuyer = vi.fn().mockResolvedValue([]);

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => getSession(...args),
    },
  },
}));

vi.mock("@/server/services/chat.service", () => ({
  listConversationsForBuyer: (...args: unknown[]) => listConversationsForBuyer(...args),
}));

import { GET } from "@/app/api/chat/conversations/route";

describe("GET /api/chat/conversations", () => {
  it("returns 401 when no session (CHAT-07)", async () => {
    getSession.mockResolvedValueOnce(null);
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns conversation list for authenticated user (CHAT-07)", async () => {
    getSession.mockResolvedValueOnce({ user: { id: "buyer-1" } });
    const convs = [{ id: "conv-1", buyerName: "Ви" }];
    listConversationsForBuyer.mockResolvedValueOnce(convs);

    const response = await GET();
    const body = (await response.json()) as { conversations: unknown[] };

    expect(response.status).toBe(200);
    expect(body.conversations).toEqual(convs);
    expect(listConversationsForBuyer).toHaveBeenCalledWith("buyer-1");
  });
});
```

Note: `GET` takes no `request` parameter — call it as `GET()` not `GET(request)`.

---

## Shared Patterns

### Authentication guard
**Source:** `src/app/api/chat/messages/route.ts` lines 171–179
**Apply to:** `src/app/api/chat/conversations/route.ts`
```typescript
const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user) {
  return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
}
```

### Client component fetch-on-mount
**Source:** `src/components/chat/chat-provider.tsx` lines 271–294 (guest restore effect)
**Apply to:** `src/components/chat/history-drawer.tsx`
```typescript
useEffect(() => {
  void (async () => {
    // fetch then setState
  })();
}, []); // mount-only — no deps
```

### `useChat()` context consumption
**Source:** `src/components/chat/archived-chat-banner.tsx` lines 9–15
**Apply to:** `src/components/chat/history-drawer.tsx`, `PanelHeader` in `chat-panel.tsx`
```typescript
const {
  guestToken,
  setConversationId,
  setConversationStatus,
  resetMessages,
  updateGuestToken,
} = useChat();
```

### State + `useCallback` + `useMemo` pattern
**Source:** `src/components/chat/chat-provider.tsx` lines 149–152, 463–511
**Apply to:** New `openHistory` / `closeHistory` callbacks in `chat-provider.tsx`
```typescript
const openHistory = useCallback(() => setPanelView("history"), []);
const closeHistory = useCallback(() => setPanelView("thread"), []);
// Then add both to value object AND dependency array in useMemo
```

### Flex scroll container (fixed-height panel safe)
**Source:** `src/components/chat/chat-panel.tsx` `PanelBody` line 94
**Apply to:** `src/components/chat/history-drawer.tsx` outer div + list wrapper
```typescript
// Outer: full height, no overflow
<div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
// Inner scrollable area:
<div className="min-h-0 flex-1 overflow-y-auto">
```

### Vitest route mock structure
**Source:** `src/app/api/chat/claim/route.test.ts` lines 1–33
**Apply to:** `src/app/api/chat/conversations/route.test.ts`
- Hoist `vi.mock()` before dynamic `import` of the route
- Use `vi.fn()` per function so each test can call `mockResolvedValueOnce`
- Test 401 first, then happy path

---

## No Analog Found

None. All files have a close match in the existing codebase.

---

## Metadata

**Analog search scope:** `src/server/services/`, `src/app/api/chat/`, `src/components/chat/`, `src/types/`
**Files scanned:** 10 source files + 3 test files
**Pattern extraction date:** 2026-05-26
