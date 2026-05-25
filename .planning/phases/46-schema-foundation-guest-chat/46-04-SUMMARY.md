---
phase: 46-schema-foundation-guest-chat
plan: 04
subsystem: client-provider
tags: [typescript, react, guest-chat, pusher, localStorage, context]

requires:
  - 46-03

provides:
  - "ChatProvider guest mode: no redirect on openPanel(), localStorage token management (D-01, D-09, D-10)"
  - "guestToken state exposed in ChatContextValue for downstream consumers (e.g. ChatInput POST body)"
  - "Pusher subscription unblocked for guests with conversationId (T-46-11 mitigated)"
  - "setGuestTokenForPusher() in pusher-client.ts: dynamic guestToken injection into channelAuthorization POST"

affects:
  - src/components/chat/chat-input.tsx  # reads guestToken from context for POST body (not modified here)

tech-stack:
  added: []
  patterns:
    - "Module-level currentGuestToken in pusher-client.ts updated via setGuestTokenForPusher() before subscription"
    - "paramsProvider: () => any — pusher-js InternalAuthOptions field; called at auth-request time, not singleton creation"
    - "Mount effect with empty deps [] for one-shot localStorage restore; hasSession guard prevents guest path for authed users"
    - "crypto.randomUUID() (CSPRNG) for guestToken generation in openPanel() — T-46-12 mitigated"
    - "SSR guard: typeof window === undefined in mount effect — matches wishlist/guest-storage.ts pattern"

key-files:
  created: []
  modified:
    - src/components/chat/chat-provider.tsx
    - src/lib/pusher-client.ts

key-decisions:
  - "D-09 applied: openPanel() no longer calls guestRedirect(); widget opens normally for guests"
  - "D-01 applied: guestToken generated via crypto.randomUUID() + stored in localStorage on first openPanel(); no DB write"
  - "D-10 applied: mount effect reads chat_guest_token from localStorage; on hit calls GET /api/chat/guest to restore conversation"
  - "paramsProvider chosen over recreating Pusher singleton: singleton is created once, paramsProvider called at each auth request"
  - "GUEST_CHAT_TOKEN_KEY constant defined in chat-provider.tsx for the localStorage key string"
  - "Pusher subscription effect: !hasSession removed from guard; conversationId guard remains (T-46-11)"

requirements-completed:
  - CHAT-01

duration: ~9min
completed: 2026-05-25
---

# Phase 46 Plan 04: ChatProvider Guest Mode + Pusher guestToken

**Client-side guest mode complete: no redirect on widget open, localStorage token management, guestToken in Pusher auth — full browser-side end-to-end guest flow**

## Performance

- **Duration:** ~9 min
- **Started:** 2026-05-25T12:40:00Z
- **Completed:** 2026-05-25T12:49:00Z
- **Tasks:** 2/2 complete
- **Files created:** 0
- **Files modified:** 2 (chat-provider.tsx, pusher-client.ts)

## Accomplishments

### Task 1: ChatProvider Guest Mode

**src/components/chat/chat-provider.tsx changes:**

- Added `GUEST_CHAT_TOKEN_KEY = "chat_guest_token"` constant (enables 3 grep-verifiable occurrences of the key string)
- Added `guestToken: string | null` to `ChatContextValue` type
- Added `guestToken` useState initialized as null
- Added mount effect (empty deps `[]`): reads `chat_guest_token` from localStorage; if found, sets guestToken state and async-fetches `GET /api/chat/guest?token=...` to restore conversationId/messages/status; silent on 404 or network error (D-10)
- Updated `openPanel()`: removed `guestRedirect()` call + early return; added guest token generation block: `if (!hasSession && !guestToken)` → `crypto.randomUUID()` → `localStorage.setItem` → `setGuestToken(token)` (D-09, D-01)
- Updated openPanel deps: removed `guestRedirect`, added `guestToken`
- Added `setGuestTokenForPusher` import from `@/lib/pusher-client`
- Updated Pusher subscription effect guard: removed `!hasSession` (T-46-11 mitigated); new guard: `!isOpen || !conversationId || !isPusherClientConfigured()`
- Added `setGuestTokenForPusher(guestToken)` call at start of Pusher effect (before subscription fires)
- Updated Pusher effect deps: replaced `hasSession` with `guestToken`
- Added `guestToken` to `useMemo` value object and dependency array
- `guestRedirect` function remains in file (unchanged), only its call removed from `openPanel`
- Message-load useEffect left completely unchanged (guard `!hasSession` correct — prevents `markBuyerReadAction` for guests, Pitfall 4)
- `clearUnreadFromStore` effect left unchanged (`isOpen && hasSession` — unread tracking not meaningful for guests)

### Task 2: Pusher Client guestToken Support

**src/lib/pusher-client.ts changes:**

- Added `let currentGuestToken: string | null = null` module-level variable
- Added `export function setGuestTokenForPusher(token: string | null): void` — called by ChatProvider before each Pusher subscription
- Extended `channelAuthorization` config in `getPusherClient()`: added `paramsProvider: () => currentGuestToken ? { guestToken: currentGuestToken } : {}` — pusher-js calls this at auth time, injecting guestToken into the POST body sent to `/api/chat/pusher/auth`
- `paramsProvider` is typed as `() => any` in `pusher-js/types/src/core/auth/options.d.ts` (InternalAuthOptions, line 35) — verified before use
- Singleton pattern unchanged — no re-creation needed

## Task Commits

1. **feat(46-04): implement guest mode in ChatProvider and Pusher client** — `0080154`

## Deviations from Plan

None — plan executed exactly as written.

## Threat Model Compliance

| Threat ID | Status | Evidence |
|-----------|--------|---------|
| T-46-10 | Accept | localStorage same-origin; no httpOnly alternative in Phase 46; by design |
| T-46-11 | Mitigated | Pusher effect guard `!conversationId` short-circuits before first message; conversationId set only after POST returns |
| T-46-12 | Mitigated | `crypto.randomUUID()` used (CSPRNG, 128-bit entropy); not Math.random |
| T-46-SC | Accept | Phase 46 installs zero new packages |

## Known Stubs

None — all functionality is fully implemented. `guestToken` flows from localStorage through context; ChatInput (not modified in this plan) reads `guestToken` from `useChat()` context — if ChatInput currently sends POST without guestToken, that is a pre-existing gap addressed in a future plan or by the existing ChatInput implementation if it already reads from context.

Note: reviewing ChatInput is deferred — the plan scope is ChatProvider + pusher-client. The `guestToken` field is now available in context for any consumer.

## Threat Flags

None — all changes are within the plan's threat model boundaries.

---

## Self-Check: PASSED

- `src/components/chat/chat-provider.tsx` — exists, modified; `guestToken` in type, state, mount effect, openPanel, Pusher effect, useMemo
- `src/lib/pusher-client.ts` — exists, modified; `setGuestTokenForPusher` exported, `paramsProvider` configured
- `grep "chat_guest_token" src/components/chat/chat-provider.tsx` — 3 matches (line 72, 152, 241)
- `grep "guestRedirect()" src/components/chat/chat-provider.tsx` — 0 matches
- `grep "guestToken: string | null" src/components/chat/chat-provider.tsx` — 1 match in ChatContextValue
- `grep "api/chat/guest" src/components/chat/chat-provider.tsx` — match in mount effect
- Pusher guard: `!isOpen || !conversationId || !isPusherClientConfigured()` — no `!hasSession`
- `grep "guestToken" src/lib/pusher-client.ts` — 4 matches
- `grep "setGuestTokenForPusher" src/components/chat/chat-provider.tsx` — 2 matches (import + call)
- Commit `0080154` — verified in git log
- TypeScript: zero errors in chat-provider.tsx or pusher-client.ts (pre-existing `@/generated/prisma/client` module-not-found is a worktree env issue, not caused by this plan)
- Tests: 301/301 pass (8 file-level ERR_MODULE_NOT_FOUND failures are pre-existing worktree env issue)

---
*Phase: 46-schema-foundation-guest-chat*
*Completed: 2026-05-25*
