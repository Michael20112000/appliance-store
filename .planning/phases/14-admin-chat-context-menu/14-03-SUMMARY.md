---
phase: 14-admin-chat-context-menu
plan: 03
subsystem: ui
tags: [playwright, context-menu, admin-chat]
requires:
  - phase: 14-02
    provides: shared lifecycle hook and menu items
provides:
  - Desktop inbox right-click ContextMenu (mobile gated off)
  - Playwright RCM + mobile + left-click e2e
  - 14-MANUAL-CHECKLIST.md
affects: []
tech-stack:
  added: []
  patterns: [enableContextMenu prop from useIsMobile 767px]
key-files:
  created: [.planning/phases/14-admin-chat-context-menu/14-MANUAL-CHECKLIST.md]
  modified:
    - src/components/chat/conversation-list.tsx
    - src/components/chat/admin-chat-inbox.tsx
    - e2e/admin-chat.spec.ts
key-decisions:
  - "D-14-09/10: ContextMenu subtree omitted entirely when enableContextMenu=false"
  - "D-14-03: preventDefault on row contextmenu for desktop"
patterns-established:
  - "ConversationListRow per-row hook + delete dialog for RCM"
requirements-completed: [ADM-CHAT-01]
duration: 20min
completed: 2026-05-18
---

# Phase 14 Plan 03 Summary

**Desktop ПКМ on `/admin/chaty` inbox rows opens lifecycle menu; mobile uses thread ⋮ only.**

## Self-Check: PASSED

- Playwright: `e2e/admin-chat.spec.ts` — 4 passed (right-click desktop, mobile no menu, left-click selects)
- Manual checklist: `14-MANUAL-CHECKLIST.md` (5 rows)
