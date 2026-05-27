---
phase: 51-chat-badge-suggested-messages
plan: "02"
subsystem: chat
tags: [tdd, green, chat-badge, unread-count, service-layer]
dependency_graph:
  requires:
    - "51-01 (RED baseline — countUnreadForBuyer test stubs)"
  provides:
    - "countUnreadForBuyer export in chat.service.ts"
    - "ChatContextValue.unreadCount: number (replaces boolean unreadFromStore)"
    - "ChatProviderGate SSR hydration via countUnreadForBuyer"
  affects:
    - "src/components/layout/storefront-fabs.tsx (Plan 03 adds numeric badge render)"
    - "src/components/chat/chat-panel.tsx (Plan 04 uses clearUnreadCount)"
tech_stack:
  added: []
  patterns:
    - "countUnreadForBuyer: prisma.message.count with senderRole+createdAt filter"
    - "unread counter increment via setUnreadCount((prev) => prev + 1)"
    - "clearUnreadCount useEffect fires on isOpen without hasSession guard"
key_files:
  created: []
  modified:
    - src/server/services/chat.service.ts
    - src/components/chat/chat-provider.tsx
    - src/components/chat/chat-provider-gate.tsx
    - src/components/chat/chat-fab.tsx
    - src/components/layout/storefront-fabs.tsx
    - src/server/services/chat.service.test.ts
decisions:
  - "countUnreadForBuyer uses prisma.message.count (not conversation.count) — counts STORE messages after buyerLastReadAt"
  - "appendMessage increment is guard-and-increment (prev + 1) not boolean toggle — allows multiple unread accumulation"
  - "clearUnreadCount useEffect removes hasSession guard — in-memory counter resets for all users on panel open (server write stays gated)"
metrics:
  duration: "15 minutes"
  completed: "2026-05-27"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 6
  files_created: 0
---

# Phase 51 Plan 02: Unread Count Migration Summary

**One-liner:** Boolean unread flag replaced with numeric counter — countUnreadForBuyer service function added, ChatProvider migrated to unreadCount: number, ChatProviderGate calls service for SSR hydration.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add countUnreadForBuyer to chat.service.ts | c1c2d7c | src/server/services/chat.service.ts |
| 2 | Migrate unreadFromStore → unreadCount in ChatProvider + ChatProviderGate | 8bbf706 | src/components/chat/chat-provider.tsx, src/components/chat/chat-provider-gate.tsx, src/components/chat/chat-fab.tsx, src/components/layout/storefront-fabs.tsx, src/server/services/chat.service.test.ts |

## What Was Built

**Task 1 — countUnreadForBuyer (chat.service.ts):**
- Exported async function inserted after `markBuyerRead`, before `countUnreadForAdmin`
- Signature: `(conversationId: string, buyerLastReadAt: Date): Promise<number>`
- Body: `prisma.message.count` with `where: { conversationId, senderRole: "STORE", createdAt: { gt: buyerLastReadAt } }`
- Both Wave 0 RED stubs for countUnreadForBuyer turned GREEN

**Task 2 — ChatProvider + ChatProviderGate migration (8 touch-points):**
- `ChatContextValue`: `unreadFromStore: boolean` → `unreadCount: number`; `clearUnreadFromStore` → `clearUnreadCount`
- `ChatProviderProps`: `initialUnreadFromStore?: boolean` → `initialUnreadCount?: number` (default `0`)
- `useState`: initialized with `initialUnreadCount` (number, default 0)
- `appendMessage` STORE branch: guard-and-increment form `if (senderRole === "STORE" && !isOpenRef.current) { setUnreadCount((prev) => prev + 1) }`
- `clearUnreadCount` resets to `0` via `useCallback`
- `useEffect` on `[isOpen]`: fires `clearUnreadCount()` when `isOpen` is true — no `hasSession` guard
- `useMemo` value object and deps array updated
- `ChatProviderGate`: calls `countUnreadForBuyer(conversation.id, conversation.buyerLastReadAt)` for SSR hydration, passes `initialUnreadCount` to `ChatProvider`

## Verification Results

```
countUnreadForBuyer > counts STORE messages in conversation after buyerLastReadAt  ✓
countUnreadForBuyer > returns 0 when no STORE messages after buyerLastReadAt       ✓
```

TypeScript: no errors in any of the 5 modified production files.

Rename completeness:
```
grep -rn "unreadFromStore|clearUnreadFromStore" chat-provider.tsx chat-provider-gate.tsx
→ no output (zero occurrences)
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated consumer files referencing renamed context fields**
- **Found during:** Task 2 TypeScript check
- **Issue:** `chat-fab.tsx` and `storefront-fabs.tsx` both destructured `unreadFromStore` from `useChat()` — TypeScript error TS2339 after type rename
- **Fix:** Updated both files to use `unreadCount` with `> 0` comparison instead of truthy boolean check
- **Files modified:** `src/components/chat/chat-fab.tsx`, `src/components/layout/storefront-fabs.tsx`
- **Commit:** 8bbf706

**2. [Rule 1 - Bug] Removed stale @ts-expect-error directives from service test file**
- **Found during:** Task 2 TypeScript check
- **Issue:** `chat.service.test.ts` had `@ts-expect-error` comments for `claimGuestConversation`, `countUnreadForBuyer`, and `createNewConversation` — all three are now exported, causing TS2578 "Unused '@ts-expect-error' directive" errors
- **Fix:** Removed all three `@ts-expect-error` lines; the functions are real exports
- **Files modified:** `src/server/services/chat.service.test.ts`
- **Commit:** 8bbf706

## Known Stubs

None — all production files are wired with real implementations.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundaries introduced. countUnreadForBuyer receives conversationId exclusively from server-side `getConversationForBuyer(session.user.id)` as specified in T-51-02.

## Self-Check: PASSED

- [x] `src/server/services/chat.service.ts` exports `countUnreadForBuyer` (grep returns 1)
- [x] `grep -c "unreadFromStore" src/components/chat/chat-provider.tsx` returns 0
- [x] `grep -c "unreadFromStore" src/components/chat/chat-provider-gate.tsx` returns 0
- [x] `grep -c "unreadCount: number" src/components/chat/chat-provider.tsx` returns 1
- [x] `grep -c "initialUnreadCount" src/components/chat/chat-provider-gate.tsx` returns 3
- [x] clearUnreadCount useEffect contains no `hasSession` in deps: `}, [clearUnreadCount, isOpen]);`
- [x] Commit c1c2d7c exists (Task 1)
- [x] Commit 8bbf706 exists (Task 2)
