---
phase: 51-chat-badge-suggested-messages
plan: "04"
subsystem: chat
tags: [tdd, green, chat-suggested-messages, prefill, chip-component]
dependency_graph:
  requires:
    - "51-01 (RED baseline — suggested-messages.test.tsx failing stubs)"
    - "51-02 (canSend in ChatContextValue)"
  provides:
    - "SuggestedMessages chip component (CHAT-11)"
    - "PanelBody with prefillText state and SuggestedMessages insertion"
    - "ChatComposer with prefillText prop and useEffect body prefill"
  affects:
    - "src/components/chat/suggested-messages.tsx (new file)"
    - "src/components/chat/chat-panel.tsx"
    - "src/components/chat/chat-composer.tsx"
tech_stack:
  added: []
  patterns:
    - "GENERAL_SUGGESTIONS as const array of 3 Ukrainian strings"
    - "product chip built from productContext.productTitle template string"
    - "prefillText state in PanelBody passed down via props"
    - "useEffect guard: if (!prefillText) return — prevents spurious setBody calls"
    - "onPrefillConsumed?.() pattern for optional callback invocation"
key_files:
  created:
    - src/components/chat/suggested-messages.tsx
  modified:
    - src/components/chat/chat-panel.tsx
    - src/components/chat/chat-composer.tsx
decisions:
  - "No 'use client' in suggested-messages.tsx — purely presentational, receives props only"
  - "prefillText state lives in PanelBody (not ChatProvider) — local UI state, not shared context"
  - "SuggestedMessages hidden when messages.length > 0 OR isLoading OR !canSend — prevents flash and archived-chat confusion"
  - "useEffect deps include onPrefillConsumed to satisfy React exhaustive-deps — stable reference from PanelBody arrow function is acceptable for this pattern"
metrics:
  duration: "8 minutes"
  completed: "2026-05-27"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 2
  files_created: 1
---

# Phase 51 Plan 04: SuggestedMessages Component and Prefill Wiring Summary

**One-liner:** New SuggestedMessages chip component renders product + 3 general Ukrainian suggestion chips; wired into PanelBody with prefillText state flowing into ChatComposer useEffect.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create SuggestedMessages component | f2c0e97 | src/components/chat/suggested-messages.tsx |
| 2 | Wire SuggestedMessages + prefill in chat-panel + chat-composer | c674cad | src/components/chat/chat-panel.tsx, src/components/chat/chat-composer.tsx |

## What Was Built

**Task 1 — suggested-messages.tsx (new file):**
- Exports `SuggestedMessages({ productContext, onSelect })` — no "use client" directive
- `GENERAL_SUGGESTIONS as const` with 3 Ukrainian strings: "Який у вас графік роботи?", "Де ви знаходитесь?", "Як оформити замовлення?"
- When `productContext?.productTitle` is set, prepends product chip: `Цікавить ${title} — є ще в наявності?`
- Each chip is a `<button type="button">` with `rounded-full border border-border bg-muted` classnames
- All 5 suggested-messages.test.tsx tests GREEN

**Task 2 — chat-panel.tsx (PanelBody mutations):**
- Added `canSend` to `useChat()` destructure
- Added `SuggestedMessages` import
- Added `const [prefillText, setPrefillText] = useState("")` in PanelBody
- SuggestedMessages rendered conditionally: `messages.length === 0 && !isLoading && canSend`
- `ChatComposer` updated: `<ChatComposer prefillText={prefillText} onPrefillConsumed={() => setPrefillText("")} />`

**Task 2 — chat-composer.tsx (prefill mutations):**
- Added `useEffect` to named React imports
- Changed `export function ChatComposer()` to `export function ChatComposer({ prefillText = "", onPrefillConsumed }: { prefillText?: string; onPrefillConsumed?: () => void; } = {})`
- Added `useEffect` after `fileInputRef`: sets `body` to `prefillText` and calls `onPrefillConsumed?.()` when `prefillText` is non-empty

## Verification Results

```
src/components/chat/ — Test Files 3 passed (3) | Tests 11 passed (11)
```

TypeScript: no errors in any modified file (`npx tsc --noEmit` — no output for chat-panel, chat-composer, suggested-messages).

Three general suggestions confirmed:
```
grep -c "Який у вас графік роботи\|Де ви знаходитесь\|Як оформити замовлення" suggested-messages.tsx
→ 3
```

Note: `chat.service.test.ts` has 3 pre-existing failures (`unarchiveConversation`, `claimGuestConversation`) — confirmed present before Plan 04 started, out of scope.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all production files are fully wired with real data flow.

## Threat Flags

None — chip text flows from static GENERAL_SUGGESTIONS const array and server-side productContext.productTitle; prefillText flows into body which is validated by existing sendMessageSchema before any DB write (T-51-09 accepted).

## Self-Check: PASSED

- [x] `src/components/chat/suggested-messages.tsx` exists (created)
- [x] `grep -c "use client" suggested-messages.tsx` returns 0
- [x] `grep -c "export function SuggestedMessages" suggested-messages.tsx` returns 1
- [x] `grep -c "GENERAL_SUGGESTIONS" suggested-messages.tsx` returns 2 (const + spread)
- [x] All 3 Ukrainian strings present in suggested-messages.tsx
- [x] `grep -c "SuggestedMessages" chat-panel.tsx` returns 2 (import + usage)
- [x] `grep -c "canSend" chat-panel.tsx` returns 2 (destructure + condition)
- [x] `grep -c "prefillText" chat-composer.tsx` returns 4 (param + prop + useEffect + dep)
- [x] `grep -c "useEffect" chat-composer.tsx` returns 2 (import + usage)
- [x] TypeScript: no errors for any modified file
- [x] All 5 suggested-messages.test.tsx tests GREEN
- [x] All 2 chat-panel.test.tsx tests GREEN
- [x] Commit f2c0e97 exists (Task 1)
- [x] Commit c674cad exists (Task 2)
