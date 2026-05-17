---
phase: 05-realtime-chat
plan: 03
subsystem: ui
tags: [nextjs, pusher, chat, nuqs, shadcn, storefront]

requires:
  - phase: 05-realtime-chat
    plan: 02
    provides: POST/GET messages API, Pusher auth, assertBuyerApi
provides:
  - Global ChatProvider with FAB + panel on storefront
  - nuqs chat=open deep link and product context
  - Pusher message:new live append with reconnect refetch
  - PDP and kabinet entry points with guest login gate
affects: [05-04, 05-05]

tech-stack:
  added: [shadcn scroll-area, textarea, avatar]
  patterns:
    - Single Pusher subscribe in ChatProvider when panel open
    - RSC ChatProviderGate preloads conversation + unread for FAB
    - Optimistic buyer send with POST /api/chat/messages ACK

key-files:
  created:
    - src/lib/chat/search-params.ts
    - src/server/actions/chat.actions.ts
    - src/components/chat/chat-provider.tsx
    - src/components/chat/chat-provider-gate.tsx
    - src/components/chat/chat-fab.tsx
    - src/components/chat/chat-panel.tsx
    - src/components/chat/message-list.tsx
    - src/components/chat/message-bubble.tsx
    - src/components/chat/chat-composer.tsx
    - src/components/chat/product-context-banner.tsx
    - src/components/chat/open-chat-button.tsx
  modified:
    - src/app/(storefront)/layout.tsx
    - src/app/(storefront)/kabinet/page.tsx
    - src/app/(storefront)/tovar/[slug]/page.tsx

key-decisions:
  - "D-05-03: FAB fixed bottom-right z-[60], panel z-[61] w-[380px] desktop"
  - "D-05-16: Only ChatProvider subscribes to private-conversation channel"
  - "D-05-17: Disconnected banner + refetch on reconnect; no polling interval"
  - "ChatProviderGate inside NuqsAdapter with Suspense for useSearchParams"

patterns-established:
  - "Pattern: Guest openPanel uses /uviity?callbackUrl=pathname+search like cart"
  - "Pattern: Desktop fixed panel + mobile Sheet gated by matchMedia (max-width 767px)"

requirements-completed: [CHAT-01, CHAT-02, CHAT-03]

duration: 28min
completed: 2026-05-17
---

# Phase 05 Plan 03: Storefront Chat Widget Summary

**Global buyer chat widget — FAB, panel, Pusher live append, PDP/kabinet entry points, guest login gate**

## Performance

- **Duration:** ~28 min
- **Started:** 2026-05-17T15:00:00Z
- **Completed:** 2026-05-17T15:28:00Z
- **Tasks:** 3
- **Files modified:** 17

## Accomplishments

- ChatProvider owns open state (`?chat=open`), history fetch, markBuyerRead, and sole Pusher subscription
- Widget UI per 05-UI-SPEC: FAB size-14, desktop panel 380×520, mobile bottom sheet, UA copy
- Storefront wired: layout gate, kabinet «Відкрити чат», PDP «Запитати про цей товар» with product banner context
- Composer optimistic send via POST; conversation created on first message; dedupe on message:new

## Task Commits

1. **Task 1: nuqs + ChatProvider + Pusher subscribe lifecycle** - `d0e5c6e` (feat)
2. **Task 2: Chat UI components (FAB, panel, messages, composer)** - `6e8449b` (feat)
3. **Task 3: Storefront integration — layout, kabinet, PDP** - `c5e77c5` (feat)

## Files Created/Modified

- `src/components/chat/chat-provider.tsx` - Context, Pusher lifecycle, guest redirect
- `src/components/chat/chat-provider-gate.tsx` - RSC session + conversation preload
- `src/components/chat/chat-panel.tsx` - Desktop fixed panel / mobile Sheet
- `src/components/chat/chat-composer.tsx` - POST send, optimistic UI, error mapping
- `src/app/(storefront)/layout.tsx` - ChatProviderGate inside NuqsAdapter
- `src/app/(storefront)/kabinet/page.tsx` - Messages section + OpenChatButton
- `src/app/(storefront)/tovar/[slug]/page.tsx` - PDP chat CTA with product context

## Decisions Made

- ChatProviderGate wraps storefront children inside NuqsAdapter (required for `chat=open` nuqs)
- Suspense boundary around gate for `useSearchParams` in ChatProvider
- Mobile Sheet only when `matchMedia (max-width: 767px)` to avoid desktop overlay

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Suspense for useSearchParams**
- **Found during:** Task 3 (layout integration)
- **Issue:** Next.js requires Suspense when client components call `useSearchParams`
- **Fix:** Wrapped `ChatProviderGate` in `<Suspense fallback={null}>` in storefront layout
- **Files modified:** `src/app/(storefront)/layout.tsx`
- **Committed in:** `c5e77c5`

**2. [Rule 2 - Missing critical functionality] matchMedia gate for Sheet**
- **Found during:** Task 2 (ChatPanel)
- **Issue:** Sheet overlay would block desktop when panel open on large screens
- **Fix:** `useIsMobile()` opens Sheet only below md breakpoint
- **Files modified:** `src/components/chat/chat-panel.tsx`
- **Committed in:** `6e8449b`

---

**Total deviations:** 2 auto-fixed (Rule 2)
**Impact on plan:** Required for correct Next.js and responsive behavior; no scope creep.

## Issues Encountered

None blocking. `npm run build` passed after implementation.

## User Setup Required

Pusher public env (`NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`) required for live updates; history still works via GET after reload without Pusher.

## Next Phase Readiness

- Ready for **05-04**: admin inbox reusing MessageList, MessageBubble, ChatComposer patterns
- Ready for **05-05**: E2E / verification of buyer widget flows

## Self-Check: PASSED

- FOUND: src/components/chat/chat-provider.tsx
- FOUND: src/components/chat/chat-fab.tsx
- FOUND: src/app/(storefront)/layout.tsx
- FOUND: d0e5c6e, 6e8449b, c5e77c5

---
*Phase: 05-realtime-chat*
*Completed: 2026-05-17*
