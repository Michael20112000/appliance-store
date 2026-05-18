---
phase: 14-admin-chat-context-menu
plan: 02
subsystem: ui
tags: [react, admin-chat, lifecycle]
requires:
  - phase: 14-01
    provides: ContextMenu primitives (not used in thread; shared menu for wave 3)
provides:
  - useConversationLifecycleActions hook
  - ConversationLifecycleMenuItems (presentation-agnostic)
  - ConversationLifecycleDeleteDialog (UA copy)
  - chat-thread refactored to shared lifecycle
affects: [14-03]
tech-stack:
  added: []
  patterns: [shared lifecycle hook with D-14-08 refresh routing]
key-files:
  created:
    - src/components/chat/use-conversation-lifecycle-actions.ts
    - src/components/chat/conversation-lifecycle-menu-items.tsx
    - src/components/chat/conversation-lifecycle-delete-dialog.tsx
    - src/components/chat/conversation-lifecycle-menu-items.test.tsx
  modified: [src/components/chat/chat-thread.tsx]
key-decisions:
  - "D-14-04/08: afterArchiveOrDelete clears selection only when row id matches selectedConversationId"
  - "D-14-02: thread keeps DropdownMenu ⋮ unchanged"
patterns-established:
  - "ConversationLifecycleMenuItems accepts Item component for DropdownMenuItem or ContextMenuItem"
requirements-completed: [ADM-CHAT-01]
duration: 15min
completed: 2026-05-18
---

# Phase 14 Plan 02 Summary

**Extracted archive/unarchive/delete lifecycle into shared modules; thread ⋮ unchanged for users.**

## Self-Check: PASSED

- Vitest: `conversation-lifecycle-menu-items.test.tsx` (4 tests)
- chat-thread uses shared hook + menu items + delete dialog
