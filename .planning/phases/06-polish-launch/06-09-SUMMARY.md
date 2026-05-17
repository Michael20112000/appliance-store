---
phase: 06-polish-launch
plan: 09
subsystem: chat
tags: [mobile, scroll, sheet, gap-closure, uat]

requires:
  - phase: 06-05
    provides: chat widget on storefront
provides:
  - Mobile Sheet chat with native touch scroll
  - Single close control (header X only)
affects: []

tech-stack:
  added: []
  patterns:
    - "useNativeScroll on MessageList for mobile Sheet"

key-files:
  created: []
  modified:
    - src/components/chat/chat-panel.tsx
    - src/components/chat/message-list.tsx

key-decisions:
  - "Mobile uses overflow-y-auto instead of ScrollArea for reliable iOS/Android touch scroll"

patterns-established:
  - "PanelBody flex min-h-0 chain for Sheet + desktop dialog"

requirements-completed: []

duration: 15min
completed: 2026-05-17
---

# Phase 6 Plan 09: Mobile chat scroll (UAT gap) Summary

**Fixed mobile chat Sheet so message history scrolls with touch and close is a single header X.**

## Changes

- `chat-panel.tsx`: `PanelBody` wrapped in `flex min-h-0 flex-1 flex-col overflow-hidden`; mobile `SheetContent` gets `min-h-0`, `showCloseButton={false}`; passes `useNativeScroll` on mobile.
- `message-list.tsx`: when `useNativeScroll`, renders `overflow-y-auto overscroll-contain` container instead of `ScrollArea`; keeps `scrollIntoView` on new messages.

## Verification

- `npm test`: 108 passed (1 pre-existing seed category count failure unrelated to chat).
- Manual: DevTools iPhone — open chat with 8+ messages, scroll thread, close via header X (operator).

## Self-Check: PASSED

- [x] `chat-panel.tsx` and `message-list.tsx` modified
- [x] Native scroll path only on mobile Sheet
- [x] Desktop still uses ScrollArea
