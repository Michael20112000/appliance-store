---
phase: 51-chat-badge-suggested-messages
verified: 2026-05-27T16:30:00Z
status: human_needed
score: 13/13 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Open chat panel when unread messages exist — verify numeric badge is visible on FAB before opening"
    expected: "FAB shows numeric badge (e.g. '3') not a dot; clicking FAB opens panel and badge disappears"
    why_human: "Badge rendering depends on ChatContext.unreadCount from SSR hydration; requires session + actual unread messages in DB"
  - test: "Open new chat with no prior messages — verify suggested message chips appear"
    expected: "3 general chips visible: 'Який у вас графік роботи?', 'Де ви знаходитесь?', 'Як оформити замовлення?'"
    why_human: "Chip visibility depends on messages.length === 0 && !isLoading && canSend at runtime; can't verify without browser render"
  - test: "Open chat from product detail page — verify product chip appears alongside 3 general chips"
    expected: "4 chips total: product chip 'Цікавить {productTitle} — є ще в наявності?' plus 3 general chips"
    why_human: "productContext is passed via openPanel() options from PDP; requires real product page navigation"
  - test: "Click a suggested message chip — verify it pre-fills the composer textarea without sending"
    expected: "Textarea shows chip text; message list remains empty; send button is enabled but message not sent"
    why_human: "prefillText useEffect behavior requires real DOM interaction to confirm textarea receives the value"
  - test: "After chip click fills textarea, send the message — verify chips disappear"
    expected: "After sending, messages.length > 0, SuggestedMessages component no longer renders"
    why_human: "End-to-end state transition (empty → sent) requires real Pusher/API integration"
  - test: "Badge count cap: accumulate 10+ unread messages — verify badge shows '9+'"
    expected: "Badge displays '9+' not '10' or higher numeric value"
    why_human: "Requires 10 STORE messages after buyerLastReadAt in the DB with panel closed"
---

# Phase 51: Chat Badge & Suggested Messages Verification Report

**Phase Goal:** Replace the boolean chat unread dot with a numeric badge (CHAT-10) and add suggested-message chips to the empty chat panel (CHAT-11).
**Verified:** 2026-05-27T16:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `countUnreadForBuyer(conversationId, buyerLastReadAt)` exists and returns STORE message count | VERIFIED | `chat.service.ts` lines 320-331: exported async function using `prisma.message.count` with `senderRole: "STORE"` and `createdAt: { gt: buyerLastReadAt }` |
| 2 | `ChatProviderGate` passes `initialUnreadCount: number` (not boolean) to `ChatProvider` | VERIFIED | `chat-provider-gate.tsx` lines 27-47: `let initialUnreadCount = 0`, calls `countUnreadForBuyer`, passes `initialUnreadCount={initialUnreadCount}` to `ChatProvider` |
| 3 | `ChatContext.unreadCount` is a `number`; `clearUnreadCount` resets it to 0 | VERIFIED | `chat-provider.tsx` line 59: `unreadCount: number` in type; line 70: `clearUnreadCount: () => void`; lines 213-215: `useCallback(() => { setUnreadCount(0) }, [])` |
| 4 | `appendMessage` increments `unreadCount` when `senderRole` is `STORE` and panel is closed | VERIFIED | `chat-provider.tsx` lines 191-193: `if (message.senderRole === "STORE" && !isOpenRef.current) { setUnreadCount((prev) => prev + 1); }` |
| 5 | `clearUnreadCount` is called unconditionally on panel open (no `hasSession` guard) | VERIFIED | `chat-provider.tsx` lines 430-434: `useEffect(() => { if (isOpen) { clearUnreadCount(); } }, [clearUnreadCount, isOpen]);` — no `hasSession` guard |
| 6 | When `unreadCount > 0`, a numeric `Badge` appears on the chat FAB in `StorefrontFabs` | VERIFIED | `storefront-fabs.tsx` lines 107-114: `{unreadCount > 0 && (<Badge ...>{chatBadgeLabel}</Badge>)}` |
| 7 | When `unreadCount > 9`, the Badge shows `'9+'` | VERIFIED | `storefront-fabs.tsx` line 51: `const chatBadgeLabel = unreadCount > 9 ? "9+" : String(unreadCount)` |
| 8 | When `unreadCount === 0`, no Badge appears | VERIFIED | Guard `{unreadCount > 0 && ...}` in both FAB files; falsy check prevents render |
| 9 | Chat FAB button has `relative` in its className; chat FAB `aria-label` includes unread count when > 0 | VERIFIED | `storefront-fabs.tsx` line 98: `"...focus-visible:ring-ring relative"`; lines 100-104: conditional Ukrainian aria-label. `chat-fab.tsx` line 20-21: `relative` in cn() string; lines 22-26: same conditional aria-label pattern |
| 10 | `SuggestedMessages` renders product chip when `productContext.productTitle` is set | VERIFIED | `suggested-messages.tsx` lines 16-18: `if (productContext?.productTitle) { suggestions.push(\`Цікавить ${productContext.productTitle} — є ще в наявності?\`); }` |
| 11 | `SuggestedMessages` renders 3 general chips always | VERIFIED | `suggested-messages.tsx` lines 8-12: `GENERAL_SUGGESTIONS as const` with 3 Ukrainian strings; line 19: `suggestions.push(...GENERAL_SUGGESTIONS)` |
| 12 | Chips hidden when `messages.length > 0` or `isLoading` or `!canSend` | VERIFIED | `chat-panel.tsx` line 126: `{messages.length === 0 && !isLoading && canSend ? (<div className="shrink-0"><SuggestedMessages .../>` |
| 13 | Clicking a chip pre-fills `ChatComposer` textarea with chip text | VERIFIED | `chat-panel.tsx` line 128: `onSelect={setPrefillText}`; `chat-composer.tsx` lines 93-97: `useEffect(() => { if (!prefillText) return; setBody(prefillText); onPrefillConsumed?.(); }, [prefillText, onPrefillConsumed])` |

**Score:** 13/13 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/server/services/chat.service.ts` | `countUnreadForBuyer` export | VERIFIED | Exists; substantive prisma.message.count query; imported by chat-provider-gate.tsx |
| `src/components/chat/chat-provider-gate.tsx` | SSR unread count hydration via `initialUnreadCount` | VERIFIED | Calls `countUnreadForBuyer`; passes `initialUnreadCount` prop |
| `src/components/chat/chat-provider.tsx` | `ChatContextValue.unreadCount: number` | VERIFIED | Type field confirmed; state initialized with `initialUnreadCount`; `clearUnreadCount` callback resets to 0 |
| `src/components/layout/storefront-fabs.tsx` | Numeric Badge on chat FAB | VERIFIED | Badge renders with `chatBadgeLabel`; 9+ cap; `unreadCount` from `useChat()`; `relative` on button |
| `src/components/chat/chat-fab.tsx` | Numeric Badge on standalone chat FAB | VERIFIED | Badge import + render; `relative` added; `hasSession` guard removed; matches storefront-fabs pattern |
| `src/components/chat/suggested-messages.tsx` | `SuggestedMessages` chip component | VERIFIED | Exports `SuggestedMessages`; GENERAL_SUGGESTIONS const; product chip template; no "use client" |
| `src/components/chat/chat-panel.tsx` | `PanelBody` with `prefillText` state + `SuggestedMessages` insertion | VERIFIED | `prefillText` state; `SuggestedMessages` imported and conditionally rendered; `ChatComposer` receives both props |
| `src/components/chat/chat-composer.tsx` | `ChatComposer` accepts `prefillText` prop | VERIFIED | Prop destructured with default `""`; `useEffect` sets `body` and calls `onPrefillConsumed?.()` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `chat-provider-gate.tsx` | `chat.service.ts` | `countUnreadForBuyer` import | WIRED | Line 5: `import { countUnreadForBuyer, ... } from "@/server/services/chat.service"` |
| `chat-provider.tsx` | `ChatContextValue` type | `unreadCount: number` field | WIRED | Line 59: typed as `number`; line 128 state; lines 213-215 callback; lines 430-434 useEffect |
| `storefront-fabs.tsx` | `ChatContext.unreadCount` | `useChat()` destructure | WIRED | Line 34: `const { isOpen: chatIsOpen, openPanel, unreadCount } = useChat()` |
| `chat-fab.tsx` | `src/components/ui/badge.tsx` | Badge import | WIRED | Line 4: `import { Badge } from "@/components/ui/badge"` |
| `chat-panel.tsx` | `suggested-messages.tsx` | `SuggestedMessages` import + render in PanelBody | WIRED | Line 11: import; line 128: `<SuggestedMessages productContext={productContext} onSelect={setPrefillText} />` |
| `chat-panel.tsx` | `chat-composer.tsx` | `prefillText` prop + `onPrefillConsumed` callback | WIRED | Line 142: `<ChatComposer prefillText={prefillText} onPrefillConsumed={() => setPrefillText("")} />` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `storefront-fabs.tsx` Badge | `unreadCount` | `ChatProvider` state ← `countUnreadForBuyer` (SSR) or `appendMessage` increment (client) | Yes — `prisma.message.count` query in `countUnreadForBuyer` | FLOWING |
| `chat-fab.tsx` Badge | `unreadCount` | Same `ChatContext` as above | Yes | FLOWING |
| `SuggestedMessages` chips | `productContext` | `ChatProvider.openPanel()` options or null | Yes — set at openPanel call with server-side product data | FLOWING |
| `ChatComposer` textarea | `body` via `prefillText` | `setPrefillText` callback from `SuggestedMessages.onSelect` | Yes — chip click sets body via useEffect | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `countUnreadForBuyer` function exists and is exported | `grep -c "export async function countUnreadForBuyer" src/server/services/chat.service.ts` | 1 | PASS |
| No legacy `unreadFromStore` in context files | `grep -c "unreadFromStore" chat-provider.tsx chat-provider-gate.tsx storefront-fabs.tsx chat-fab.tsx` | 0 for all 4 files | PASS |
| Dot span pattern removed from both FABs | `grep "size-3 rounded-full" storefront-fabs.tsx chat-fab.tsx` | no output (exit 1) | PASS |
| `SuggestedMessages` exported from new file | `grep -c "export function SuggestedMessages" suggested-messages.tsx` | 1 | PASS |
| `prefillText` flows through chat-panel to chat-composer | `grep -c "prefillText" chat-panel.tsx && grep -c "prefillText" chat-composer.tsx` | 3 (panel), 4 (composer) | PASS |
| No unresolved debt markers (TBD/FIXME/XXX) in phase files | `grep -rn "TBD\|FIXME\|XXX" <all 8 files>` | no output | PASS |

### Probe Execution

No probe scripts declared or found for this phase. Step 7c: SKIPPED (no probe files).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| CHAT-10 | Plans 01, 02, 03 | Buyer sees unread message count on chat FAB/button | SATISFIED | `unreadCount: number` in `ChatContext`; numeric `Badge` in both FAB components; SSR hydration via `countUnreadForBuyer`; increment in `appendMessage` |
| CHAT-11 | Plans 01, 02, 04 | Suggested messages shown when opening new chat — 1 contextual + 2-3 general | SATISFIED | `SuggestedMessages` component with 3 general + optional product chip; wired into `PanelBody` with correct show/hide conditions; chip click prefills composer |

Both requirements marked `[x]` complete in `REQUIREMENTS.md` traceability table.

### Anti-Patterns Found

No blockers or warnings detected:

- No `TBD`, `FIXME`, or `XXX` markers in any phase-modified file
- No `return null` / placeholder stubs in production paths
- No hardcoded empty arrays/objects flowing to rendering
- No `use client` added to `suggested-messages.tsx` (correct — pure props component)
- No `hasSession` guard on `clearUnreadCount` useEffect (intentional per T-51-04)
- `initialUnreadCount` defaults to `0` (not `undefined`) — correct numeric default

### Human Verification Required

The following 6 items require browser runtime verification:

#### 1. Numeric badge visible on FAB with unread messages

**Test:** Have an admin send a message to a buyer's conversation while the buyer panel is closed. Reload the storefront as the buyer.
**Expected:** Chat FAB displays a numeric badge (e.g. "3") in the top-right corner, not a dot. Badge is absent when count is 0.
**Why human:** Badge renders from `ChatContext.unreadCount` which is SSR-hydrated from DB; requires real session + unread messages.

#### 2. General suggested message chips appear on empty chat

**Test:** Open the chat panel as any user (session or guest) with no prior messages.
**Expected:** 3 chip buttons visible: "Який у вас графік роботи?", "Де ви знаходитесь?", "Як оформити замовлення?"
**Why human:** Chip visibility depends on `messages.length === 0 && !isLoading && canSend` at runtime; requires real panel load.

#### 3. Product chip appears when opening chat from product page

**Test:** On a product detail page, click "Написати в чат" (or equivalent). Open the chat panel.
**Expected:** 4 chips total — first chip is "Цікавить {product name} — є ще в наявності?" followed by 3 general chips.
**Why human:** `productContext` is set via `openPanel({ productTitle, ... })` call from the PDP; requires real navigation flow.

#### 4. Chip click pre-fills textarea without sending

**Test:** With an empty chat panel showing chips, click any chip button.
**Expected:** Textarea receives the chip's text; message list remains empty; no message is sent automatically.
**Why human:** `prefillText` useEffect sets `body` state; requires real DOM interaction to confirm textarea reflects the value.

#### 5. Chips disappear after sending a message

**Test:** After chip click fills textarea, submit the message.
**Expected:** Message appears in list; chip row is no longer rendered (messages.length > 0 hides chips).
**Why human:** State transition requires real API call + Pusher event or optimistic update to be visible.

#### 6. Badge cap at "9+" with 10+ unread messages

**Test:** Accumulate 10 or more STORE messages in a buyer conversation while panel is closed.
**Expected:** Badge shows "9+" not "10" or higher.
**Why human:** Requires accumulating 10+ Pusher-delivered messages or SSR-hydrated count ≥ 10; not testable with grep.

---

### Gaps Summary

No gaps found. All 13 must-haves verified at all four levels (exists, substantive, wired, data flowing). Both requirements CHAT-10 and CHAT-11 satisfied.

Human verification items are visual/behavioral runtime checks that cannot be verified programmatically — they do not indicate implementation defects.

---

_Verified: 2026-05-27T16:30:00Z_
_Verifier: Claude (gsd-verifier)_
