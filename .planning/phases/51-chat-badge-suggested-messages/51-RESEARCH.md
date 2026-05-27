# Phase 51: Chat Badge & Suggested Messages - Research

**Researched:** 2026-05-27
**Domain:** Chat UI — unread badge, numeric count tracking, suggested message chips
**Confidence:** HIGH (all claims verified against the live codebase)

---

## Summary

Phase 51 adds two user-facing improvements to the existing chat widget. First, a numeric unread-message badge on the chat FAB (replacing the current boolean dot indicator). Second, a row of suggested-message chips that appear in the chat panel before the user sends their first message — one product-specific chip if the chat was opened from a product page, plus two or three general-purpose chips.

The existing `ChatProvider` already tracks `unreadFromStore: boolean` and `productContext`. Both need targeted extensions: the boolean becomes a count, and the chat panel's empty-state area gains a chip row component. No new packages are required — `Badge` (shadcn/ui, already installed), `Button` (already installed), and plain `useState` are sufficient.

The main architectural risk is the unread count: the schema tracks `buyerLastReadAt` per-conversation but has no server-side buyer unread-count function. Three count sources exist and must be coordinated: SSR initial count (from `ChatProviderGate`), in-memory increment via Pusher `message:new` events, and reset-to-zero on panel open (via `markBuyerReadAction`).

**Primary recommendation:** Evolve `unreadFromStore: boolean` to `unreadCount: number` in `ChatContext`, update all four touch-points (type, state init, appendMessage, clearUnread), add a `countUnreadForBuyer` service function, and pass `initialUnreadCount` from `ChatProviderGate`. For suggested messages, add a pure `SuggestedMessages` component rendered inside `PanelBody` when `messages.length === 0 && !isLoading && canSend`.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CHAT-10 | Buyer sees a numeric unread-message count badge on the FAB/chat-open button when admin has sent unread messages | Schema has `buyerLastReadAt`; need `countUnreadForBuyer` service fn + evolve `unreadFromStore: boolean` → `unreadCount: number` in ChatContext |
| CHAT-11 | When opening a new chat, buyer sees suggested messages: one product-specific chip (if on product page) + 2–3 general chips; clicking pre-fills or sends; chips disappear after first send | `productContext` already flows from `openPanel()` into `ChatProvider`; need new `SuggestedMessages` component + `messageSent` state to hide chips |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Unread count — SSR initial value | API / Backend (ChatProviderGate) | — | `buyerLastReadAt` lives in DB; needs server query at page load |
| Unread count — realtime increment | Browser / Client (ChatProvider) | — | Pusher `message:new` already arrives in `appendMessage`; increment counter there |
| Unread count — reset | API / Backend + Client | — | `markBuyerReadAction` writes `buyerLastReadAt`; client clears local count |
| Badge rendering | Browser / Client (StorefrontFabs) | — | Reads `unreadCount` from ChatContext |
| Suggested messages — chip list | Browser / Client (SuggestedMessages component) | — | Purely presentational; reads `productContext` from ChatContext |
| Suggested messages — product context | Browser / Client (ChatProvider) | — | `productContext` already set by `openPanel({productId, productTitle, productSlug})` |
| Suggested messages — general texts | Browser / Client (hardcoded constants) | — | Static Ukrainian strings; no CMS/API needed for v1 |
| "Chips disappear after first send" | Browser / Client (ChatComposer or SuggestedMessages) | — | Track whether any message has been sent in local or context state |

---

## Standard Stack

### Core (all already installed — no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React useState/useCallback | — | Unread count state, suggestion sent flag | Already in use throughout chat |
| shadcn/ui `Badge` | already installed | Numeric badge on FAB | Cart FAB uses same `Badge` — established pattern |
| shadcn/ui `Button` | already installed | Suggestion chip buttons | Consistent with chat composer buttons |
| Prisma client | already installed | `countUnreadForBuyer` query | All DB access goes through Prisma |
| Pusher-js | already installed | Realtime increment when admin sends | Existing `message:new` event handler in ChatProvider |

### No new packages required

This phase is a pure UI/logic extension of existing infrastructure. The Package Legitimacy Audit section is omitted because no external packages are installed.

---

## Architecture Patterns

### System Architecture Diagram

```
Admin sends message
       │
       ▼
POST /api/chat/messages ──► Pusher trigger "message:new"
                                    │
                                    ▼
                           ChatProvider.appendMessage()
                                    │
                          if senderRole === "STORE"
                          && !isOpen → unreadCount += 1
                                    │
                                    ▼
                           StorefrontFabs reads unreadCount
                           └─ Badge shows count (>0)

User opens chat (isOpen=true)
       │
       ├─► fetchMessages() called
       ├─► markBuyerReadAction(conversationId) called
       └─► clearUnreadCount() → unreadCount = 0
           └─► Badge disappears

─────────────────────────────────────────────────

openPanel({ productId, productTitle, productSlug })
       │
       ▼
productContext set in ChatProvider
       │
       ▼
PanelBody renders SuggestedMessages
  when: messages.length === 0 && !isLoading && canSend
       │
  ┌────┴────────────────────────────┐
  │ Product chip (if productContext) │  General chips (always)
  │ "Цікавить [product.title]?"     │  "Графік роботи?"
  └─────────────────────────────────┘  "Де знаходитесь?"
                                       "Як оформити замовлення?"
       │ click
       ▼
  ChatComposer.setBody(text) OR send() directly
  + setMessageSent(true) → chips disappear
```

### Recommended Project Structure (files to modify/create)

```
src/
├── components/chat/
│   ├── chat-provider.tsx          MODIFY — unreadFromStore:bool → unreadCount:number
│   ├── chat-provider-gate.tsx     MODIFY — pass initialUnreadCount (number)
│   ├── chat-panel.tsx             MODIFY — pass setMessageSent / messageSent to SuggestedMessages
│   ├── chat-composer.tsx          MODIFY — accept optional onFirstSend callback
│   ├── storefront-fabs.tsx        MODIFY — render numeric Badge on chat FAB
│   ├── chat-fab.tsx               MODIFY — render numeric Badge (if standalone FAB still used)
│   └── suggested-messages.tsx     CREATE — new chip-row component
├── server/services/
│   └── chat.service.ts            MODIFY — add countUnreadForBuyer()
```

**Note on chat-fab.tsx:** Comparing `storefront-fabs.tsx` and `chat-fab.tsx` — both render the chat FAB. `StorefrontFabs` is the one mounted in `ChatProvider` and is the primary FAB. `chat-fab.tsx` appears to be a standalone/legacy component. Both must be updated to avoid divergence.

### Pattern 1: Boolean → Numeric Count Migration in ChatContext

**What:** Replace `unreadFromStore: boolean` with `unreadCount: number` throughout ChatContext. All boolean check sites become `unreadCount > 0`.
**When to use:** Whenever the spec changes from "has unread" to "how many unread".

```typescript
// Source: verified codebase — chat-provider.tsx current pattern
// BEFORE
const [unreadFromStore, setUnreadFromStore] = useState(initialUnreadFromStore);
// AFTER
const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

// appendMessage (BEFORE)
if (message.senderRole === "STORE") {
  setUnreadFromStore(!isOpenRef.current);
}
// appendMessage (AFTER)
if (message.senderRole === "STORE" && !isOpenRef.current) {
  setUnreadCount((prev) => prev + 1);
}

// clearUnreadCount (AFTER)
const clearUnreadCount = useCallback(() => setUnreadCount(0), []);
```

**Context shape change:**
```typescript
// BEFORE
type ChatContextValue = {
  unreadFromStore: boolean;
  clearUnreadFromStore: () => void;
  // ...
};
// AFTER
type ChatContextValue = {
  unreadCount: number;
  clearUnreadCount: () => void;
  // ...
};
```

### Pattern 2: SSR Unread Count from ChatProviderGate

**What:** `ChatProviderGate` queries the DB for the buyer's unread count at SSR time and passes it as `initialUnreadCount: number` to `ChatProvider`.

```typescript
// Source: verified codebase — chat-provider-gate.tsx current pattern + extension
// Current (boolean):
let initialUnreadFromStore = false;
if (session?.user) {
  const conversation = await getConversationForBuyer(session.user.id);
  if (conversation) {
    initialUnreadFromStore =
      conversation.lastMessageSender === "STORE" &&
      conversation.lastMessageAt !== null &&
      conversation.lastMessageAt > conversation.buyerLastReadAt;
  }
}

// New (numeric) — requires new service function:
let initialUnreadCount = 0;
if (session?.user) {
  const conversation = await getConversationForBuyer(session.user.id);
  if (conversation) {
    initialUnreadCount = await countUnreadForBuyer(conversation.id, conversation.buyerLastReadAt);
  }
}
```

### Pattern 3: New Service Function — countUnreadForBuyer

**What:** Counts STORE messages in a conversation sent after `buyerLastReadAt`.

```typescript
// Source: verified codebase — chat.service.ts (analogous to countUnreadForAdmin pattern)
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

### Pattern 4: Badge Rendering on FAB

**What:** Show a numeric badge on the chat FAB matching the pattern used for cart FAB.

```typescript
// Source: verified codebase — storefront-fabs.tsx cart FAB pattern
// Cart pattern (reference):
{cartCount > 0 && (
  <Badge
    className="absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px]"
    aria-hidden
  >
    {badgeLabel}
  </Badge>
)}

// Chat FAB pattern (proposed):
const chatBadgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);
{unreadCount > 0 && (
  <Badge
    className="absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px]"
    aria-hidden
  >
    {chatBadgeLabel}
  </Badge>
)}
```

**Note:** The current chat FAB renders a 3px dot (`size-3 rounded-full`). Replace with Badge. The FAB button already has `relative` in `storefront-fabs.tsx` but NOT in `chat-fab.tsx` — add `relative` to chat-fab.tsx's button className.

**Guest users:** CHAT-10 says "admin sends messages the user has not read" — guests CAN have unread messages too. However, the current `unreadFromStore` boolean already gates on `hasSession`. The schema `buyerLastReadAt` exists on Conversation regardless of auth status. For v1, show badge for both authenticated and guest users when `unreadCount > 0` — remove the `hasSession &&` guard on the chat badge (but keep it on auth-gated features like file upload). The badge dot in current code has `hasSession && unreadFromStore` — this needs to change for the numeric badge since guests also get admin replies.

### Pattern 5: SuggestedMessages Component

**What:** A chip-row rendered in PanelBody when the chat has no messages yet.

```typescript
// Source: verified codebase — SuggestedMessages is a NEW component
// Placement: inside PanelBody, between MessageList (empty state) and ChatComposer

type SuggestedMessagesProps = {
  productContext: ProductChatContext | null;
  onSelect: (text: string) => void; // pre-fills composer OR sends directly
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

**Disappear condition:** Chips must disappear once the user sends their first message. Track this with `messageSent: boolean` state. Two options:

- **Option A (recommended):** Track in `PanelBody` local state. `messageSent` is `messages.length > 0` — this is already available and requires zero new state. When `messages.length > 0`, do not render `SuggestedMessages`. This is the simplest correct implementation.
- **Option B:** Add `messageSent` as explicit local state, set on `onSelect`. Adds complexity without benefit over Option A.

**Decision: Use `messages.length === 0 && !isLoading` as the show condition.** No extra state needed.

**Click behavior:** Pre-fill the composer textarea (not auto-send). This matches the success criterion "pre-fills the input or sends it directly" — pre-fill is safer UX; user can review before sending. Implement by lifting `body` / `setBody` up from `ChatComposer` OR passing an `onPrefill` callback into `ChatComposer` via context or prop.

**Integration point:** `ChatComposer` currently owns `body` state internally. To allow `SuggestedMessages` to set the body, the cleanest approach is:
- Add `prefillText?: string` prop to `ChatComposer` (or expose `setBody` via a ref / forwardRef pattern)
- Or: lift `body` state into `PanelBody` / `ChatContext` — simpler if using context

Recommended: lift the suggestion click handler into `PanelBody` using a local `prefillBody` state passed down to ChatComposer as a controlled prop initial value. `ChatComposer` resets it after consuming.

Alternatively: use a `useRef<{ setBody: (v: string) => void } | null>` in PanelBody, expose it via `useImperativeHandle` on ChatComposer. This keeps ChatComposer's internal state clean.

**Simplest correct approach:** Add `onPrefill` callback prop to `ChatComposer`'s parent, store desired text in `PanelBody` local state as `prefillText: string`, pass to `ChatComposer` which calls `setBody(prefillText)` in a `useEffect` when it changes, then clears `prefillText` via callback.

### Anti-Patterns to Avoid

- **Storing unread count in server DB as a separate field:** The existing `buyerLastReadAt` + a DB count query is sufficient. Don't add a `buyerUnreadCount` column to the schema — it would require updating on every message send and creating a migration.
- **Re-fetching messages to compute unread count after panel open:** `markBuyerReadAction` is already called; don't over-fetch.
- **Showing suggestions after user has sent a message:** Check `messages.length === 0`, not a separate boolean — avoids stale state bugs.
- **Product-specific suggestion when productContext has no title:** Guard with `productContext?.productTitle` not just `productContext?.productId`.
- **Hardcoding suggestions in both Ukrainian and English:** All UI text is Ukrainian-only (project constraint from REQUIREMENTS.md scope).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Numeric badge UI | Custom CSS pill | shadcn/ui `Badge` with `absolute -right-0.5 -top-0.5` | Cart FAB already uses this; consistent look |
| Unread DB count query | Manual SQL | `prisma.message.count({ where: { senderRole: "STORE", createdAt: { gt: buyerLastReadAt } } })` | Prisma handles index-optimized count; `@@index([conversationId, createdAt])` already exists |
| Realtime unread increment | Polling / SSE | Existing Pusher `message:new` handler in `appendMessage` | Pusher is already subscribed for the conversation |

---

## Common Pitfalls

### Pitfall 1: forgetting chat-fab.tsx alongside storefront-fabs.tsx

**What goes wrong:** Both `chat-fab.tsx` and `storefront-fabs.tsx` render the chat FAB. Only updating one leaves a stale dot indicator.
**Why it happens:** The `ChatFab` component exists but `StorefrontFabs` is the one actually rendered inside `ChatProvider`. `chat-fab.tsx` may be unused but should still be updated if it's imported anywhere.
**How to avoid:** Grep for imports of `ChatFab` — if unused, update anyway for consistency. If used, update both.
**Warning signs:** Badge shows on one FAB but not the other.

### Pitfall 2: unreadCount stays non-zero after guest opens chat

**What goes wrong:** `clearUnreadCount()` is called via `markBuyerReadAction` which calls `requireBuyer()` — this throws for guests. The `isOpen && hasSession` guard in `chat-provider.tsx` (line 431-434) prevents calling `markBuyerReadAction` for guests.
**Why it happens:** `markBuyerReadAction` has a `requireBuyer()` auth check that blocks guests.
**How to avoid:** For guests, reset `unreadCount` to 0 client-side when panel opens (`isOpen` becomes true) without calling the server action — the guest's `unreadCount` is only in-memory anyway. The `useEffect` at line 430-434 that does `clearUnreadFromStore()` on open for `hasSession` must be extended: call `clearUnreadCount()` regardless of `hasSession` (the server action is the separate concern). The existing structure shows `clearUnreadFromStore()` is called when `isOpen && hasSession` — this should become `isOpen` (always).
**Warning signs:** Guest badge stays non-zero after opening chat.

### Pitfall 3: unreadCount inflated by messages already seen

**What goes wrong:** `countUnreadForBuyer` counts ALL STORE messages after `buyerLastReadAt`, but `buyerLastReadAt` defaults to `now()` on conversation creation. If the user immediately opens the chat and `markBuyerReadAction` is NOT called (e.g., network error), the count stays wrong.
**Why it happens:** Server-side count and client-side in-memory count can drift.
**How to avoid:** The server-side count is the source of truth for SSR hydration. Pusher increments are additive. `clearUnreadCount()` resets to 0 immediately on panel open (optimistic) — the server write may still be in-flight but UX is correct.
**Warning signs:** Count flickers or shows wrong number on page reload.

### Pitfall 4: SuggestedMessages visible on archived/existing conversations

**What goes wrong:** Chips appear even when a user re-opens a chat that already has messages (e.g. switching conversations in history drawer).
**Why it happens:** `messages.length === 0` is true briefly during loading (isLoading=true).
**How to avoid:** Guard is `messages.length === 0 && !isLoading && canSend`. `isLoading` prevents flicker during fetch; `canSend` hides chips on archived chats.
**Warning signs:** Chips flash then disappear on conversation switch.

### Pitfall 5: relative positioning missing on chat FAB button

**What goes wrong:** The `Badge` with `absolute` positioning needs its parent to be `position: relative`. `storefront-fabs.tsx` already has `relative` in the cart FAB button but the chat FAB button may not.
**Why it happens:** The chat FAB button `className` in `storefront-fabs.tsx` (line 95-108) does NOT include `relative` in the current implementation.
**How to avoid:** Add `relative` to chat FAB button `className` alongside existing classes.
**Warning signs:** Badge appears at page corner instead of button corner.

---

## Code Examples

### countUnreadForBuyer (new service function)

```typescript
// chat.service.ts — analogous to countUnreadForAdmin (line 320)
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

### ChatProviderGate — pass initialUnreadCount

```typescript
// chat-provider-gate.tsx — replace boolean with count
let initialUnreadCount = 0;
if (session?.user) {
  const conversation = await getConversationForBuyer(session.user.id);
  if (conversation) {
    initialUnreadCount = await countUnreadForBuyer(
      conversation.id,
      conversation.buyerLastReadAt,
    );
    // keep initialConversationId / initialConversationStatus unchanged
  }
}
// Pass to ChatProvider:
// initialUnreadCount={initialUnreadCount}
```

### ChatProvider — unreadCount state

```typescript
// Replace:
const [unreadFromStore, setUnreadFromStore] = useState(initialUnreadFromStore);
// With:
const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

// appendMessage update:
if (message.senderRole === "STORE" && !isOpenRef.current) {
  setUnreadCount((prev) => prev + 1);
}

// clearUnreadCount:
const clearUnreadCount = useCallback(() => setUnreadCount(0), []);

// useEffect: clear on open (was hasSession-gated, now unconditional for client reset)
useEffect(() => {
  if (isOpen) {
    clearUnreadCount();
    // markBuyerReadAction still only called when hasSession (in the other useEffect)
  }
}, [clearUnreadCount, isOpen]);
```

### StorefrontFabs — numeric badge

```typescript
// storefront-fabs.tsx — chat FAB section
const chatBadgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

{!chatIsOpen && (
  <button
    type="button"
    onClick={() => openPanel()}
    className={cn(
      "flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative", // add "relative"
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
)}
```

### SuggestedMessages component placement in PanelBody

```typescript
// chat-panel.tsx — PanelBody, between MessageList and ProductContextBanner/Composer

// New prop/callback for suggestion prefill:
const [prefillText, setPrefillText] = useState("");

// In render:
{messages.length === 0 && !isLoading && canSend && (
  <div className="shrink-0">
    <SuggestedMessages
      productContext={productContext}
      onSelect={setPrefillText}
    />
  </div>
)}

// Pass prefillText to ChatComposer:
<ChatComposer prefillText={prefillText} onPrefillConsumed={() => setPrefillText("")} />
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Boolean dot `unreadFromStore` | Numeric `unreadCount` badge | Phase 51 | Buyer sees exact message count |
| No suggested messages | Contextual chip row | Phase 51 | Reduces friction for first message |

---

## File Inventory — All Files to Touch

| File | Change Type | What Changes |
|------|-------------|--------------|
| `src/server/services/chat.service.ts` | MODIFY | Add `countUnreadForBuyer(conversationId, buyerLastReadAt)` |
| `src/components/chat/chat-provider-gate.tsx` | MODIFY | Replace `initialUnreadFromStore: boolean` with `initialUnreadCount: number`; call `countUnreadForBuyer` |
| `src/components/chat/chat-provider.tsx` | MODIFY | `unreadFromStore: bool` → `unreadCount: number`; update `appendMessage`; update `clearUnread*`; update props type; update context value type |
| `src/components/layout/storefront-fabs.tsx` | MODIFY | Replace dot with `Badge`; add `relative` to chat FAB; update aria-label |
| `src/components/chat/chat-fab.tsx` | MODIFY | Same badge upgrade (consistency; check if actually used) |
| `src/components/chat/chat-panel.tsx` | MODIFY | Add `prefillText` state in `PanelBody`; render `SuggestedMessages`; pass `prefillText` to `ChatComposer` |
| `src/components/chat/chat-composer.tsx` | MODIFY | Accept `prefillText?: string` + `onPrefillConsumed?: () => void` props; `useEffect` to call `setBody(prefillText)` when non-empty |
| `src/components/chat/suggested-messages.tsx` | CREATE | New chip-row component |

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest + @testing-library/react |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npx vitest run src/components/chat/suggested-messages.test.tsx src/server/services/chat.service.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHAT-10 | `countUnreadForBuyer` returns correct count | unit | `npx vitest run src/server/services/chat.service.test.ts` | Exists (extend) |
| CHAT-10 | `unreadCount` in context increments on STORE message when panel closed | unit (jsdom) | `npx vitest run src/components/chat/chat-provider.test.tsx` | Does not exist — Wave 0 gap |
| CHAT-10 | Badge renders with count when `unreadCount > 0` in StorefrontFabs | unit (jsdom) | `npx vitest run src/components/layout/storefront-fabs.test.tsx` | Exists (extend) |
| CHAT-10 | Badge hidden when `unreadCount === 0` | unit (jsdom) | Same as above | Exists (extend) |
| CHAT-11 | `SuggestedMessages` renders product chip when `productContext.productTitle` set | unit (jsdom) | `npx vitest run src/components/chat/suggested-messages.test.tsx` | Does not exist — Wave 0 gap |
| CHAT-11 | `SuggestedMessages` renders general chips (3 items) when no productContext | unit (jsdom) | Same as above | Does not exist — Wave 0 gap |
| CHAT-11 | Chips not visible when `messages.length > 0` | unit (jsdom) via chat-panel test | `npx vitest run src/components/chat/chat-panel.test.tsx` | Exists (extend) |
| CHAT-11 | `onSelect` called with chip text on click | unit (jsdom) | `npx vitest run src/components/chat/suggested-messages.test.tsx` | Does not exist — Wave 0 gap |

### Sampling Rate

- **Per task commit:** `npx vitest run src/components/chat/ src/server/services/chat.service.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/components/chat/suggested-messages.test.tsx` — covers CHAT-11 chip render and click
- [ ] `src/components/chat/chat-provider.test.tsx` — covers CHAT-10 unread count increment/reset (optional if chat-provider is complex to mock; planner may defer to integration)

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Pusher (pusher-js) | Realtime unread increment | Verified in package.json | 5.x | Unread count only updates on page reload without Pusher (acceptable) |
| Prisma client | countUnreadForBuyer | Verified in package.json | current | — |
| shadcn/ui Badge | Numeric badge | `src/components/ui/badge.tsx` exists | current | — |

---

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes (suggested message text) | Suggested messages are hardcoded constants — no user input reaches the DB via this path until user clicks Send (which goes through existing `sendMessageSchema` validation) |
| V4 Access Control | yes | `countUnreadForBuyer` must receive `conversationId` from server-side `getConversationForBuyer` — no client-supplied IDs bypass ownership check |

**No new threat vectors introduced.** The suggested messages are static strings selected from a constant array; clicking one pre-fills the existing `ChatComposer` textarea which already validates length (2000 char max) and goes through `POST /api/chat/messages` validation pipeline.

---

## Open Questions (RESOLVED)

1. **Should guests see the numeric unread badge?**
   - What we know: Current code gates the dot on `hasSession`. Guests CAN receive admin replies and have `buyerLastReadAt` in their conversation.
   - What's unclear: Whether the operator wants guests to see the badge (they might not know the guest has a conversation).
   - Recommendation: Show badge for guests too — removes the `hasSession &&` guard on the badge (but not on auth-gated actions like markBuyerReadAction). Guests' unread count is in-memory only (not SSR-initialized, since `ChatProviderGate` only queries for `session?.user`). Guests get realtime increments via Pusher when chat is open. This is acceptable for v1.
   - **RESOLVED:** Guests see the badge — Plan 03 removes the `hasSession &&` guard on the badge.

2. **Pre-fill vs. auto-send on chip click**
   - What we know: Success criteria says "pre-fills the input or sends it directly"
   - Recommendation: Pre-fill only. Auto-send skips user review and is harder to undo. The success criteria "or" allows either choice.
   - **RESOLVED:** Pre-fill chosen — Plan 04 implements `prefillText` prop passed to ChatComposer.

3. **General suggested messages — exact Ukrainian text**
   - What we know: Requirements mention "графік роботи, адреса" as examples.
   - Recommendation (hardcode these 3): `"Який у вас графік роботи?"`, `"Де ви знаходитесь?"`, `"Як оформити замовлення?"`. Planner should confirm with user or define as constants that can be easily changed.
   - **RESOLVED:** Hardcoded as `GENERAL_SUGGESTIONS` constant in Plans 01 and 04: `["Який у вас графік роботи?", "Де ви знаходитесь?", "Як оформити замовлення?"]`.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `chat-fab.tsx` is still in use (not dead code) | File Inventory | If unused, still update it for consistency; no risk either way |
| A2 | General suggested messages are the 3 Ukrainian strings listed | Code Examples | Planner or user should confirm exact text before implementation |
| A3 | Pre-fill (not auto-send) is the preferred chip-click behavior | Architecture Patterns | Low risk; either approach satisfies the success criteria |

---

## Sources

### Primary (HIGH confidence — verified against live codebase)

- `src/components/chat/chat-provider.tsx` — full ChatContext type, `unreadFromStore` boolean, `appendMessage`, `clearUnreadFromStore`, Pusher subscription
- `src/components/chat/chat-provider-gate.tsx` — SSR initial state computation, `initialUnreadFromStore` boolean derivation
- `src/components/layout/storefront-fabs.tsx` — chat FAB rendering, existing Badge pattern on cart FAB
- `src/components/chat/chat-fab.tsx` — standalone chat FAB with current dot indicator
- `src/server/services/chat.service.ts` — `countUnreadForAdmin` (model for buyer equivalent), `markBuyerRead`, `buyerLastReadAt`
- `src/server/actions/chat.actions.ts` — `markBuyerReadAction` (auth-gated)
- `prisma/schema.prisma` — `Conversation` model with `buyerLastReadAt`, `lastMessageSender`, `lastMessageAt`
- `src/components/chat/chat-panel.tsx` — `PanelBody` layout, integration point for `SuggestedMessages`
- `src/components/chat/chat-composer.tsx` — internal `body` state, `send()` flow
- `src/components/chat/product-context-banner.tsx` — existing `productContext` usage pattern
- `src/components/ui/badge.tsx` — Badge component available
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-pathname.md` — usePathname (Next.js 16.2.6 App Router)

### Secondary (MEDIUM confidence)

- `.planning/STATE.md` — confirmed Phase 50 complete, `v3.1/50` decisions about DrawerProvider integration

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies verified in package.json and codebase
- Architecture: HIGH — full codebase read, exact file paths and line references documented
- Pitfalls: HIGH — derived from reading actual implementation, not training data
- Test infrastructure: HIGH — vitest.config.ts, existing test files read

**Research date:** 2026-05-27
**Valid until:** 2026-06-27 (stable codebase; only invalidated by concurrent chat changes)
