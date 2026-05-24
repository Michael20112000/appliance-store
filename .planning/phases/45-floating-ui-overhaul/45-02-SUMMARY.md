---
phase: 45-floating-ui-overhaul
plan: "02"
subsystem: floating-ui
tags: [fab, chat, consolidation, tdd, client-component]
dependency_graph:
  requires: []
  provides: [FAB-04]
  affects:
    - src/components/layout/storefront-fabs.tsx
    - src/components/chat/chat-provider.tsx
    - src/components/chat/chat-provider-gate.tsx
    - src/app/(storefront)/layout.tsx
    - src/components/layout/storefront-fabs.test.tsx
tech_stack:
  added: []
  patterns:
    - Client component hook-in-provider: StorefrontFabs rendered inside ChatContext.Provider accesses useChat()
    - RSC prop threading: phones/initialCartCount flow layout → ChatProviderGate → ChatProvider → StorefrontFabs
    - TDD RED→GREEN: failing tests first, then implementation to pass
key_files:
  created: []
  modified:
    - src/components/layout/storefront-fabs.tsx
    - src/components/chat/chat-provider.tsx
    - src/components/chat/chat-provider-gate.tsx
    - src/app/(storefront)/layout.tsx
    - src/components/layout/storefront-fabs.test.tsx
decisions:
  - StorefrontFabs uses static import in ChatProvider (not dynamic) — rendered inside client component tree, no SSR issue
  - chatIsOpen/chatHasSession aliases avoid shadowing hasSession prop in StorefrontFabs function signature
  - as unknown as ReturnType<typeof useChat> cast for partial mock objects in tests
metrics:
  duration_minutes: 15
  completed_date: "2026-05-24"
  tasks_completed: 2
  files_modified: 5
---

# Phase 45 Plan 02: FAB Consolidation Summary

**One-liner:** Merged callback+cart+chat FABs into single bottom-right column (right-6, z-[49]) by moving StorefrontFabs render inside ChatContext.Provider and threading phones/initialCartCount through ChatProviderGate.

## What Was Built

Consolidated three floating action buttons (callback, cart, chat) from two separate positions into a single group at `bottom-6 right-6 z-[49]`. The chat FAB is now rendered inside `StorefrontFabs` (which itself is rendered inside `ChatContext.Provider`), giving it access to `useChat()` without circular imports. The callback dialog sits at `z-50`, correctly covering the FAB group.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add FAB-04 tests (TDD RED) | 7d2e770 | storefront-fabs.test.tsx |
| 2 | Implement FAB consolidation | 311ba64, f00cbe3 | storefront-fabs.tsx, chat-provider.tsx, chat-provider-gate.tsx, layout.tsx, storefront-fabs.test.tsx |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript cast in test mock return values**
- **Found during:** Task 2 (TypeScript check)
- **Issue:** `as ReturnType<typeof useChat>` cast raised TS2352 because the partial mock object doesn't sufficiently overlap with the full `ChatContextValue` type (which has 18 fields)
- **Fix:** Changed to `as unknown as ReturnType<typeof useChat>` — standard pattern for partial mock objects in Vitest
- **Files modified:** src/components/layout/storefront-fabs.test.tsx
- **Committed in:** Task 2 commit (311ba64)

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED (test) | 7d2e770 | PASS — FAB-04-a, FAB-04-b, FAB-04-d failing as expected |
| GREEN (feat) | 311ba64, f00cbe3 | PASS — all 13 tests pass |
| REFACTOR | N/A | Not needed |

## Known Stubs

None — all data flows are wired: phones and initialCartCount flow from server-fetched contacts/cart data in layout.tsx through ChatProviderGate → ChatProvider → StorefrontFabs.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes introduced. Changes are UI-layer prop threading only.

## Self-Check: PASSED

- [x] src/components/layout/storefront-fabs.tsx — exists, contains right-6, z-[49], useChat, chat button
- [x] src/components/chat/chat-provider.tsx — exists, no ChatFab, has StorefrontFabs render
- [x] src/components/chat/chat-provider-gate.tsx — exists, passes phones/initialCartCount
- [x] src/app/(storefront)/layout.tsx — exists, no StorefrontFabs import/JSX, ChatProviderGate has phones/initialCartCount props
- [x] src/components/layout/storefront-fabs.test.tsx — exists, 13 tests all green
- [x] Commits 7d2e770, 311ba64, f00cbe3 exist in git log
