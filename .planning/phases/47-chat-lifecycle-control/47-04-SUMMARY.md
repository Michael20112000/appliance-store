---
phase: 47-chat-lifecycle-control
plan: "04"
subsystem: chat
tags: [wave-3, green, chat-lifecycle, pusher, guest-claim, archived-banner]
dependency_graph:
  requires:
    - phase: 47-02
      provides: archiveConversationAction broadcasts conversation:closed Pusher event
    - phase: 47-03
      provides: POST /api/chat/new and POST /api/chat/claim routes
  provides:
    - ChatProvider binds conversation:closed Pusher event and sets status ARCHIVED
    - ChatProvider guest claim effect (fires once on hasSession transition, clears localStorage on success)
    - ArchivedChatBanner with Чат завершено heading and interactive Почати новий чат button
  affects:
    - src/components/chat/chat-panel.tsx (renders ArchivedChatBanner when conversationStatus === ARCHIVED)
tech_stack:
  added: []
  patterns:
    - useRef guard pattern for one-shot effects (claimAttemptedRef — prevents StrictMode double-fire)
    - Pusher event handler with conversationId guard (T-47-pusher-spoof mitigation)
    - resetMessages before setConversationId pattern (prevents render with stale messages + new ID)
key_files:
  created: []
  modified:
    - src/components/chat/chat-provider.tsx
    - src/components/chat/archived-chat-banner.tsx
decisions:
  - "claimAttemptedRef.current set to true BEFORE async call (RESEARCH.md Pitfall 7 — prevents StrictMode double-fire)"
  - "conversation:closed handler does NOT add conversationStatus to Pusher useEffect deps (RESEARCH.md Pitfall 2 — avoids re-subscription loop)"
  - "resetMessages exposed in ChatContextValue so ArchivedChatBanner can clear messages without direct setMessages access"
  - "resetMessages called before setConversationId in handleStartNew to prevent a render with old messages + new conversationId"
  - "guestToken sent in POST /api/chat/new body only if present in context (T-47-banner-guestToken — no cross-user disclosure)"
metrics:
  duration: "~8 minutes"
  completed: "2026-05-25T16:45:00Z"
  tasks_completed: 2
  files_changed: 2
---

# Phase 47 Plan 04: Client Widget — Pusher Close Event + Guest Claim + ArchivedChatBanner Summary

**ChatProvider binds conversation:closed Pusher event and adds guest claim effect; ArchivedChatBanner upgraded with Чат завершено heading and working Почати новий чат button — all Phase 47 CHAT-04/05/02 behaviors wired end-to-end**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-25T16:37:00Z
- **Completed:** 2026-05-25T16:45:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- **ChatProvider** now handles real-time conversation closure: `conversation:closed` Pusher event bound inside the existing Pusher useEffect; handler validates `payload.conversationId === conversationId` (T-47-pusher-spoof mitigation), then calls `setConversationStatus("ARCHIVED")` in the same render cycle; cleanup unbinds alongside `message:new`
- **ChatProvider** has a guest claim effect: fires when `hasSession` transitions to `true`, reads `chat_guest_token` from localStorage, calls `POST /api/chat/claim`, clears localStorage and context state on success; `claimAttemptedRef` prevents double-fire in React StrictMode
- **ChatProvider** now exposes `resetMessages: () => void` in `ChatContextValue` (needed by ArchivedChatBanner to clear messages before starting a new conversation)
- **ArchivedChatBanner** upgraded from static display to interactive component: heading text changed to "Чат завершено", "Почати новий чат" button calls `POST /api/chat/new` with optional guestToken, transitions ChatProvider state to new conversationId + status OPEN + empty messages; button is disabled while request is in-flight

## Task Commits

1. **Task 1: Extend ChatProvider** — `1ccb0aa` (feat)
2. **Task 2: Upgrade ArchivedChatBanner** — `ae3b532` (feat)

## Files Created/Modified

- `src/components/chat/chat-provider.tsx` — Added conversation:closed Pusher binding + claimAttemptedRef claim effect + resetMessages
- `src/components/chat/archived-chat-banner.tsx` — Rewritten: use client directive, useChat hook, handleStartNew, Чат завершено heading, Почати новий чат button

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all behaviors are fully implemented and wired end-to-end.

## Threat Flags

None — changes are entirely within the planned trust boundaries:
- T-47-pusher-spoof: MITIGATED — handler checks `payload.conversationId !== conversationId`
- T-47-claim-double: ACCEPTED — claimAttemptedRef prevents double-fire; updateMany is idempotent
- T-47-banner-guestToken: ACCEPTED — guestToken sent only when present in context; server validates UUID format

## Self-Check: PASSED

- `src/components/chat/chat-provider.tsx` — exists, modified
- `src/components/chat/archived-chat-banner.tsx` — exists, modified
- `grep -c "conversation:closed" src/components/chat/chat-provider.tsx` — returns 2
- `grep -c "claimAttemptedRef" src/components/chat/chat-provider.tsx` — returns 3
- `grep -c "resetMessages" src/components/chat/chat-provider.tsx` — returns 4
- `grep "^\"use client\"" src/components/chat/archived-chat-banner.tsx` — returns the directive
- `grep -c "Чат завершено" src/components/chat/archived-chat-banner.tsx` — returns 1
- `grep -c "Почати новий чат" src/components/chat/archived-chat-banner.tsx` — returns 1
- `npx tsc --noEmit 2>&1 | grep "archived-chat-banner"` — returns empty (no errors)
- `npx tsc --noEmit 2>&1 | grep "chat-provider.tsx"` — returns only pre-existing @/generated/prisma/client module resolution error (not introduced by this plan)
- `npx vitest run` — 7 failed | 58 passed (7 pre-existing failures, 0 new failures)
- Commit 1ccb0aa — verified
- Commit ae3b532 — verified

## Phase 47 Readiness

All three Phase 47 requirements (CHAT-04, CHAT-05, CHAT-02) are now wired end-to-end:
- CHAT-04: Admin archives conversation → Pusher event → ChatProvider sets ARCHIVED → ArchivedChatBanner shown, input blocked
- CHAT-05: ArchivedChatBanner "Почати новий чат" → POST /api/chat/new → new conversationId + OPEN status + empty messages
- CHAT-02: User logs in with active guestToken → claim effect → POST /api/chat/claim → conversation linked to account

Ready for Plan 47-05 (human UAT).
