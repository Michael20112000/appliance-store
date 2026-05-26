# Phase 48: History Drawer - Research

**Researched:** 2026-05-26
**Domain:** In-widget view-state management, buyer conversation history API, React state pattern
**Confidence:** HIGH

---

## Summary

Phase 48 adds a history drawer to the buyer-facing chat widget. Authenticated users get a menu
icon in the widget header; clicking it flips the widget's view from the message thread to a
conversation history panel. From the panel they can tap any past conversation to switch to it,
or create a new one. Guests see no menu icon and no history panel.

The architecture decision (locked in STATE.md) is that this is a **view-state switch inside the
existing `ChatPanel`** — not a shadcn `Sheet` sliding in from the side, not a new page, and not
full-screen. The widget container stays fixed at its current size; only the content area changes.
This pattern is already proven in the admin inbox (`AdminChatInbox` / `AdminChatProvider`).

Three new pieces are needed: (1) a new service function `listConversationsForBuyer` and a new
`GET /api/chat/conversations` route to return the buyer's full history, (2) a view-state field
(`"thread" | "history"`) added to `ChatProvider`/`ChatContext`, and (3) a new
`HistoryDrawer` component rendered inside `ChatPanel` when the view is `"history"`.
No new npm packages are required — `Menu` and `Plus` icons exist in `lucide-react@1.16.0`,
`ConversationList` already renders the list row UX, and `createNewConversation` already exists
in `chat.service.ts`.

**Primary recommendation:** Extend `ChatProvider` with a `panelView` state (`"thread" |
"history"`), add `listConversationsForBuyer` to the service, create `GET /api/chat/conversations`,
build `HistoryDrawer` as a sibling of `PanelBody` inside `ChatPanel`, and add a `Menu` icon
button to `PanelHeader` gated on `hasSession`.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CHAT-06 | Menu icon in widget header, auth-only; clicking opens in-widget drawer | New `panelView` state in `ChatProvider`; `Menu` icon from lucide-react; `hasSession` guard already in context |
| CHAT-07 | Drawer shows past conversations; tapping one switches to it | New `listConversationsForBuyer` service fn + `GET /api/chat/conversations`; `ConversationList` component reusable |
| CHAT-08 | New chat can be created from the drawer | `createNewConversation({userId})` already exists; "Новий чат" button calls it and switches panelView back to `"thread"` |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md / AGENTS.md)

- This is **Next.js 16.2.6** — APIs, file structure, and conventions may differ from training data. Read `node_modules/next/dist/docs/` before writing any code; heed deprecation notices.
- No skill files found in `.claude/skills/` or `.agents/skills/`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Menu icon visibility guard | Browser / Client | — | `hasSession` is already in `ChatContext`; pure conditional render |
| View-state switch (thread ↔ history) | Browser / Client | — | Local React state in `ChatProvider`; no URL change needed |
| Fetch buyer conversation list | API / Backend | — | Auth-gated GET endpoint; access control enforced server-side |
| Render conversation history list | Browser / Client | — | Reuse `ConversationList` component |
| Switch active conversation (load messages) | Browser / Client | API / Backend | Client calls `fetchMessages(id)` already available; API already handles `assertConversationAccess` |
| Create new conversation from drawer | Browser / Client | API / Backend | `POST /api/chat/new` already exists with userId path |

---

## Standard Stack

### Core (all already installed — no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `lucide-react` | 1.16.0 [VERIFIED: local node_modules] | `Menu`, `Plus`, `ArrowLeft` icons | Already used throughout chat components |
| `react` | 19.2.4 [VERIFIED: local node_modules] | State management (`useState`, `useCallback`) | Project stack |
| shadcn `Button` | installed [VERIFIED: local] | Menu toggle, Новий чат, back button | Used in `PanelHeader`, `ArchivedChatBanner` |
| shadcn `Skeleton` | installed [VERIFIED: local] | Loading state for history list | Already used in `ConversationList` |

### No New Packages

This phase installs zero npm packages. All required UI primitives, icons, and service utilities
exist in the project.

---

## Package Legitimacy Audit

No packages to install. Section not applicable.

---

## Architecture Patterns

### System Architecture Diagram

```
User (auth)                User (auth)
     |                          |
[Menu icon click]       [Conversation row tap]
     |                          |
     v                          v
ChatProvider                ChatProvider
  panelView: "history"        setConversationId(id)
     |                        panelView: "thread"
     v                          |
ChatPanel                    ChatPanel
  <HistoryDrawer>           <PanelBody>
     |                          |
     v                          v
GET /api/chat/conversations  GET /api/chat/messages
     |                          |
listConversationsForBuyer    listMessages + assertConversationAccess
     |                          |
prisma.conversation.findMany  prisma.message.findMany
  where: { userId }
```

### Recommended Project Structure (new files only)

```
src/
├── app/api/chat/
│   └── conversations/
│       └── route.ts          # GET — buyer conversation list
├── components/chat/
│   └── history-drawer.tsx    # HistoryDrawer component
└── server/services/
    └── chat.service.ts       # extend: listConversationsForBuyer (new fn)
```

Files to MODIFY (not create):

```
src/
├── types/chat.ts                        # add BuyerConversationSummaryDto
├── server/services/chat.service.ts      # add listConversationsForBuyer
├── components/chat/chat-provider.tsx    # add panelView state + openHistory/closeHistory
├── components/chat/chat-panel.tsx       # add HistoryDrawer branch in render
└── server/services/chat.service.test.ts # add RED stubs for listConversationsForBuyer
```

### Pattern 1: View-State Switch in ChatProvider

**What:** Add `panelView: "thread" | "history"` state to `ChatProvider`. Default is `"thread"`.
Expose `openHistory()` and `closeHistory()` callbacks. `openPanel()` always resets to `"thread"`.

**When to use:** Any time the widget content area needs to swap between two full-height views
without URL changes or new layout nesting.

**Implementation sketch:**

```typescript
// Source: chat-provider.tsx (project codebase pattern)
const [panelView, setPanelView] = useState<"thread" | "history">("thread");

const openHistory = useCallback(() => setPanelView("history"), []);
const closeHistory = useCallback(() => setPanelView("thread"), []);

// Reset to thread whenever panel opens fresh
const openPanel = useCallback(
  (options?: ProductChatContext) => {
    setPanelView("thread");
    // ... existing logic
  },
  [guestToken, hasSession, setQuery],
);
```

Export `panelView`, `openHistory`, `closeHistory` through `ChatContextValue`.

### Pattern 2: History Drawer Component

**What:** `HistoryDrawer` is a full-height flex-column that fetches conversations from
`GET /api/chat/conversations` on mount and renders a header row (back arrow + title + "Новий чат"
button) followed by the conversation list.

**Key behaviour:**
- On mount: fetch `GET /api/chat/conversations` (auth-only; 401 if guest)
- Conversation row tap: call `setConversationId(id)`, `setConversationStatus(conv.status)`,
  `resetMessages()`, then call `closeHistory()` to flip back to thread view
- "Новий чат" button: `POST /api/chat/new` (existing endpoint), then call
  `setConversationId(data.conversationId)`, `setConversationStatus("OPEN")`, `resetMessages()`,
  `closeHistory()`

```typescript
// Source: archived-chat-banner.tsx pattern (project codebase)
"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useChat } from "@/components/chat/chat-provider";
import { ConversationList } from "@/components/chat/conversation-list";
import { Button } from "@/components/ui/button";
import type { BuyerConversationSummaryDto } from "@/types/chat";

export function HistoryDrawer() {
  const {
    conversationId,
    setConversationId,
    setConversationStatus,
    resetMessages,
    closeHistory,
  } = useChat();

  const [conversations, setConversations] = useState<BuyerConversationSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/chat/conversations");
      if (!res.ok) { setIsLoading(false); return; }
      const data = await res.json() as { conversations: BuyerConversationSummaryDto[] };
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
    const res = await fetch("/api/chat/new", { method: "POST",
      headers: { "Content-Type": "application/json" }, body: "{}" });
    if (!res.ok) return;
    const data = await res.json() as { conversationId: string };
    resetMessages();
    setConversationId(data.conversationId);
    setConversationStatus("OPEN");
    closeHistory();
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <Button variant="ghost" size="sm" onClick={closeHistory}>
          <ArrowLeft className="mr-1 size-4" /> Назад
        </Button>
        <p className="text-sm font-semibold">Мої чати</p>
        <Button variant="outline" size="sm" onClick={() => void handleNewChat()}>
          <Plus className="mr-1 size-4" /> Новий чат
        </Button>
      </div>
      {/* List */}
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

### Pattern 3: PanelHeader Menu Icon (auth-only)

**What:** Add a `Menu` icon button to `PanelHeader`, visible only when `hasSession` is true.
Place it between the title block and the existing `X` close button.

```typescript
// Source: chat-panel.tsx PanelHeader (project codebase)
import { Menu, X } from "lucide-react";
import { useChat } from "@/components/chat/chat-provider";

function PanelHeader({ onClose, sticky = false }: { onClose: () => void; sticky?: boolean }) {
  const { hasSession, openHistory } = useChat();
  return (
    <div className={sticky ? "..." : "..."}>
      <div className="min-w-0 flex-1 pr-2">
        <p className="text-sm font-semibold">Чат з магазином</p>
        <p className="text-xs text-muted-foreground">Відповімо якнайшвидше</p>
      </div>
      {hasSession ? (
        <Button
          type="button" variant="ghost" size="icon" className="size-9 shrink-0"
          onClick={openHistory} aria-label="Відкрити меню чатів"
        >
          <Menu className="size-4" />
        </Button>
      ) : null}
      <Button
        type="button" variant="outline" size="icon" className="size-9 shrink-0"
        onClick={onClose} aria-label="Закрити чат"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
```

### Pattern 4: Service Function `listConversationsForBuyer`

**What:** New function in `chat.service.ts` querying `prisma.conversation.findMany` for all
conversations belonging to the authenticated user (any `isActive` value, any `status`), ordered
by `lastMessageAt desc`.

**Returns:** `BuyerConversationSummaryDto[]` — a simpler shape than `ConversationSummaryDto`
(no `buyerEmail`, no `unreadForAdmin`; includes `status`, `lastMessagePreview`, `lastMessageAt`).

```typescript
// Source: pattern from listConversationsForAdmin in chat.service.ts
export async function listConversationsForBuyer(
  userId: string,
): Promise<BuyerConversationSummaryDto[]> {
  const rows = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { lastMessageAt: "desc" },
    select: {
      id: true,
      status: true,
      isActive: true,
      lastMessagePreview: true,
      lastMessageAt: true,
      createdAt: true,
    },
  });

  return rows.map((c) => ({
    id: c.id,
    status: c.status,
    isActive: c.isActive,
    lastMessagePreview: c.lastMessagePreview,
    lastMessageAt: c.lastMessageAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
  }));
}
```

### Pattern 5: `GET /api/chat/conversations` Route

**What:** Auth-only route. Returns `{ conversations: BuyerConversationSummaryDto[] }`.
Follows the same pattern as `GET /api/chat/messages` (session check → service call → JSON).

```typescript
// Source: GET /api/chat/messages pattern (project codebase)
// src/app/api/chat/conversations/route.ts
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

### Pattern 6: ChatPanel Conditional Render

**What:** `ChatPanel` reads `panelView` from context and renders either `<PanelBody>` or
`<HistoryDrawer>` inside the same fixed container. No layout changes to the container itself.

```typescript
// Source: chat-panel.tsx PanelBody branching (project codebase)
export function ChatPanel() {
  const { isOpen, closePanel, panelView } = useChat();
  const isMobile = useIsMobile();

  const content = panelView === "history" ? <HistoryDrawer /> : <PanelBody />;

  return (
    <>
      {/* Desktop */}
      <div className="pointer-events-none fixed inset-0 z-[61] hidden md:block" aria-hidden={!isOpen}>
        <div className={isOpen ? "pointer-events-auto fixed ..." : "hidden"} role="dialog" ...>
          {isOpen ? content : null}
        </div>
      </div>
      {/* Mobile Sheet */}
      <Sheet open={isOpen && isMobile} onOpenChange={(open) => !open && closePanel()}>
        <SheetContent ...>
          <SheetHeader className="sr-only"><SheetTitle>Чат з магазином</SheetTitle></SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    </>
  );
}
```

Note: `PanelBody` currently takes `useNativeScroll` and `stickyHeader` props.
`HistoryDrawer` does not need these — it manages its own scroll.

### Anti-Patterns to Avoid

- **Opening history via Sheet side-slide:** Locked decision: in-widget view-state switch, not `Sheet`.
- **Fetching conversations on every render of `HistoryDrawer`:** Fetch on mount in a `useEffect`; no refetch unless user explicitly triggers new chat or drawer re-opens.
- **Reusing `ConversationSummaryDto`:** That type has `buyerName`, `buyerEmail`, `unreadForAdmin` — fields that don't apply to buyer self-view. Define `BuyerConversationSummaryDto` in `types/chat.ts` to avoid leaking admin-shaped data to buyer endpoints.
- **Calling `markBuyerReadAction` when switching conversations in history:** That action guards against `conversation.id !== active conversation id`. With history switching the read mark on each historical conversation is unnecessary — don't try to reuse it.
- **Resetting `panelView` to "history" after panel close:** Always reset to "thread" in `closePanel()` so the next open shows the chat, not the history list.
- **Exposing `isActive: false` conversations without labeling them:** In the drawer, show an "(Архівовано)" badge on rows where `status === "ARCHIVED"` so users understand they can view but not send.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Conversation list row UI | Custom list row | `ConversationList` component (already exists) | Handles loading skeleton, empty state, selection highlight |
| Create new conversation logic | Custom POST | `POST /api/chat/new` already exists | Already handles the userId path and deactivates old active conv |
| Auth-gating of API routes | Custom session check | `auth.api.getSession` + `headers()` pattern | Every other chat route uses this exact pattern |
| Access control for history messages | Custom user-id check | `assertConversationAccess` in service | Already enforces `conversation.userId === session.user.id` |
| Icon for menu button | Custom SVG | `Menu` from lucide-react (installed) | Matches existing icon usage pattern |

**Key insight:** The admin inbox already implements the two-pane view-state switch pattern
(`ConversationList` + `ChatThread`). The buyer history drawer is a simpler single-pane version
of the same idea. Reuse aggressively.

---

## Common Pitfalls

### Pitfall 1: `ConversationList` expects `ConversationSummaryDto` shape

**What goes wrong:** Passing `BuyerConversationSummaryDto[]` directly to `ConversationList`
causes TypeScript errors because `ConversationSummaryDto` has `buyerName`, `buyerEmail`,
`unreadForAdmin` fields not present in the buyer shape.

**Why it happens:** The component was built for the admin inbox which needs buyer identity info.

**How to avoid:** Either (a) populate `buyerName` and `buyerEmail` with placeholder values
("Ви", "") in `listConversationsForBuyer` so the DTO satisfies `ConversationSummaryDto`, or
(b) build a lightweight `HistoryConversationRow` component without identity display. Option (a)
is simpler and `ConversationList` already handles empty email gracefully.

**Recommendation:** Option (a): make `listConversationsForBuyer` return `ConversationSummaryDto`-
shaped objects with `buyerName: "Ви"`, `buyerEmail: ""`, `unreadForAdmin: false`.
This avoids a new type and reuses the existing component without modification.

### Pitfall 2: `panelView` not reset on `closePanel`

**What goes wrong:** User opens history, closes widget, reopens — lands on history panel
instead of message thread.

**Why it happens:** `closePanel` only clears the URL query state (`chat: null`) but doesn't
reset `panelView`.

**How to avoid:** Add `setPanelView("thread")` inside `closePanel`:
```typescript
const closePanel = useCallback(() => {
  void setQuery({ chat: null, productId: null });
  setProductContext(null);
  setPanelView("thread");  // reset view
}, [setQuery]);
```

### Pitfall 3: Switching to a historical conversation triggers the existing `isOpen && hasSession` effect incorrectly

**What goes wrong:** When the user switches from history to a different conversation,
`setConversationId(id)` triggers the `useEffect` that calls `fetchMessages + markBuyerReadAction`.
`markBuyerReadAction` uses `getConversationForBuyer` which only returns the `isActive: true`
conversation. If the selected conversation is archived (inactive), the mark-read call silently
returns `{ ok: false }` with no side-effect — this is acceptable behaviour, not a bug.

**Why it happens:** `getConversationForBuyer` filters `isActive: true`.

**How to avoid:** No fix needed for the error path. But be aware: the `fetchMessages` call in
the effect works correctly for historical conversations because it uses `assertConversationAccess`,
which only checks `conversation.userId === session.user.id`, not `isActive`.

### Pitfall 4: History list shows only active conversation (isActive filter)

**What goes wrong:** If `listConversationsForBuyer` accidentally adds `isActive: true` filter,
users cannot see their archived conversations.

**Why it happens:** The existing `getConversationForBuyer` uses `isActive: true` because it
only needs the current active conversation. A copy-paste of that query would break history.

**How to avoid:** `listConversationsForBuyer` must omit `isActive` from the `where` clause.
The query is `{ userId }` only.

### Pitfall 5: Desktop widget height overflow when HistoryDrawer has long list

**What goes wrong:** The desktop widget is `h-[min(520px,calc(100dvh-7rem))]`. A long conversation
list can overflow if scroll is not set up correctly.

**Why it happens:** `ConversationList` uses `overflow-y-auto` on its inner div, but only if
the parent is `min-h-0 flex-1`. The outer drawer wrapper must also be `min-h-0 flex-1 overflow-hidden`.

**How to avoid:** `HistoryDrawer` outer div must be `flex h-full min-h-0 flex-1 flex-col overflow-hidden`.
The scrollable list div below the header must be `min-h-0 flex-1 overflow-y-auto`.

---

## Code Examples

### Verified pattern: assertConversationAccess for buyer access guard

```typescript
// Source: src/server/services/chat.service.ts (project codebase, verified)
// Used by GET /api/chat/messages to enforce buyer can only read own conversations
export async function assertConversationAccess(
  session: ChatSession,
  conversationId: string,
): Promise<{ id: string; userId: string | null; status: ConversationStatus }> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation) {
    throw new ChatServiceError(CONVERSATION_NOT_FOUND, "Розмову не знайдено");
  }
  if (session.user.role === "admin") return conversation;
  if (!conversation.userId || conversation.userId !== session.user.id) {
    throw new ChatServiceError(FORBIDDEN, "Немає доступу до цієї розмови");
  }
  return conversation;
}
```

History switching uses `GET /api/chat/messages?conversationId=X` which calls this exact guard —
no new access control code needed.

### Verified pattern: createNewConversation userId path

```typescript
// Source: src/server/services/chat.service.ts (project codebase, verified)
export async function createNewConversation(
  input: { userId: string } | { guestToken: string },
): Promise<{ id: string; guestToken?: string }> {
  return prisma.$transaction(async (tx) => {
    if ("userId" in input) {
      await tx.conversation.updateMany({
        where: { userId: input.userId, isActive: true },
        data: { isActive: false },
      });
      return tx.conversation.create({
        data: { userId: input.userId, isActive: true },
      });
    }
    // ... guest path omitted
  });
}
```

"Новий чат" from the history drawer calls `POST /api/chat/new` (no body needed for auth users).

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| History as side Sheet | In-widget view-state switch | Decided in v3.0 STATE.md | No new modal/sheet primitive needed |
| Admin-only conversation listing | Buyer-scoped conversation listing (new) | Phase 48 | New service fn + API route required |

**Deprecated/outdated:**
- Do NOT attempt to pass `guestToken` to the history API — history is auth-only (CHAT-06: visible only for authorized users).

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `ConversationList` can be reused for buyer history by passing `buyerName: "Ви"` placeholder | Code Examples, Don't Hand-Roll | Minor: would need a new `HistoryConversationRow` component; no breaking changes |
| A2 | Switching to an archived (historical) conversation via `setConversationId` correctly triggers `fetchMessages` via the existing `useEffect` | Architecture Patterns | Medium: if the effect has a guard that prevents loading archived conversations, a separate fetch call would be needed in `handleSelect` |

---

## Open Questions

1. **Should conversations in the history panel be paginated?**
   - What we know: `listConversationsForAdmin` fetches all at once; the DB index on `userId` makes this efficient. A user is unlikely to have more than 10-20 past conversations in this store context.
   - What's unclear: No page limit is specified in CHAT-07.
   - Recommendation: Fetch all (up to 50) on mount, no pagination for v1. Add `take: 50` to the Prisma query as a safety cap.

2. **Should the history drawer show the currently viewed conversation as selected/highlighted?**
   - What we know: `ConversationList` has `selectedId` prop that highlights the active row.
   - What's unclear: Not explicitly specified in requirements.
   - Recommendation: Pass `conversationId` from context as `selectedId` — consistent with admin inbox behaviour.

---

## Environment Availability

Step 2.6: SKIPPED — this phase installs no external dependencies. All tools (Prisma, Next.js, Vitest, Pusher) are already installed and confirmed running.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/server/services/chat.service.test.ts` |
| Full suite command | `npx vitest run` |

### Baseline (pre-phase 48)

Current test state: **5 failing / 378 total** — pre-existing failures unrelated to Phase 48:
- `chat.service.test.ts`: 3 failing (Phase 47 stubs not yet fully implemented)
- `prisma/seed.test.ts`: 2 failing (seed count assertions)

Phase 48 must not add new failures beyond this baseline.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHAT-06 | Menu icon hidden for guests | unit | `npx vitest run src/components/chat/chat-panel.test.tsx` | No — Wave 0 |
| CHAT-06 | Menu icon visible for auth users | unit | same | No — Wave 0 |
| CHAT-07 | `listConversationsForBuyer` returns all user convs sorted by date | unit | `npx vitest run src/server/services/chat.service.test.ts` | Yes (extend) |
| CHAT-07 | `GET /api/chat/conversations` returns 401 for guests | unit | `npx vitest run src/app/api/chat/conversations/route.test.ts` | No — Wave 0 |
| CHAT-07 | `GET /api/chat/conversations` returns conversation list for auth user | unit | same | No — Wave 0 |
| CHAT-08 | "Новий чат" button calls POST /api/chat/new and switches view to thread | manual UAT | — | manual |

### Sampling Rate

- **Per task commit:** `npx vitest run src/server/services/chat.service.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green (at or below baseline failure count) before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/server/services/chat.service.test.ts` — add RED stubs for `listConversationsForBuyer` (CHAT-07)
- [ ] `src/app/api/chat/conversations/route.test.ts` — covers CHAT-07 (401 guard + list response)
- [ ] `src/components/chat/chat-panel.test.tsx` — covers CHAT-06 (guest: no Menu icon; auth: Menu icon present)

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `auth.api.getSession` — already used in all chat API routes |
| V3 Session Management | no | No new session handling |
| V4 Access Control | yes | `assertConversationAccess` guards conversation message fetch; `GET /api/chat/conversations` returns only `userId === session.user.id` rows |
| V5 Input Validation | no | GET with no body; no user input to validate |
| V6 Cryptography | no | No new crypto |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Buyer reads another user's conversation history | Information Disclosure | `listConversationsForBuyer` filters by `userId`; `assertConversationAccess` enforces ownership on message fetch |
| Guest accesses history panel | Information Disclosure | `GET /api/chat/conversations` returns 401; `hasSession` gate hides Menu icon in UI |
| Buyer creates excessive new conversations via "Новий чат" | Denial of Service | Existing `POST /api/chat/new` does not rate-limit; this is acceptable for a single-admin store with authenticated users only |

---

## Sources

### Primary (HIGH confidence)

- Project codebase — `src/components/chat/chat-provider.tsx`, `chat-panel.tsx`, `chat-composer.tsx`, `archived-chat-banner.tsx`, `conversation-list.tsx`, `admin-chat-inbox.tsx` (all read in this session)
- Project codebase — `src/server/services/chat.service.ts`, `src/app/api/chat/new/route.ts`, `src/app/api/chat/messages/route.ts`, `src/types/chat.ts` (all read in this session)
- `.planning/STATE.md` — locked architectural decision: in-widget view-state switch
- `.planning/REQUIREMENTS.md` — CHAT-06, CHAT-07, CHAT-08 requirements text
- `node_modules/lucide-react` — confirmed `Menu` icon exists [VERIFIED: local node_modules]

### Secondary (MEDIUM confidence)

- Next.js docs at `node_modules/next/dist/docs/01-app/03-api-reference` — route handler structure matches existing project patterns [CITED: local docs]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new packages, all verified in local node_modules
- Architecture: HIGH — locked decision from STATE.md, pattern directly derived from admin inbox
- Service/API layer: HIGH — `listConversationsForBuyer` is a trivial extension of existing pattern
- UI component: HIGH — `HistoryDrawer` reuses `ConversationList` with no changes to the component
- Pitfalls: HIGH — derived from reading actual codebase code paths

**Research date:** 2026-05-26
**Valid until:** 2026-06-26 (stable codebase; no external library risk)
