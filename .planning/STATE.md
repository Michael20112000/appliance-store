---
gsd_state_version: 1.0
milestone: v3.0
milestone_name: Chat & Engagement
status: completed
last_updated: "2026-05-26T21:00:00.000Z"
last_activity: 2026-05-26 -- Phase 49 UAT passed, closed
progress:
  total_phases: 4
  completed_phases: 4
  total_plans: 16
  completed_plans: 16
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-25)

**Core value:** Покупець швидко знаходить б/у техніку у Львові, оформлює замовлення і за потреби пише магазину в чат.
**Current focus:** Milestone v3.0 complete — all 4 phases shipped

## Current Position

Phase: 49 — COMPLETE
Plan: 3 of 3
Status: Milestone v3.0 complete
Last activity: 2026-05-26 -- Phase 49 UAT passed, closed

## Deferred Items

Items acknowledged and deferred at milestone close on 2026-05-24:

| Category | Item | Status |
|----------|------|--------|
| todos | bugfix-intake-TEMPLATE.md | template — not a real task |
| uat_gaps | 45-HUMAN-UAT.md | partial — user approved manually |
| verification_gaps | 41-VERIFICATION.md | human_needed — user approved during v2.2 execution |
| verification_gaps | 42-VERIFICATION.md | human_needed — user approved during v2.2 execution |
| verification_gaps | 43-VERIFICATION.md | human_needed — user approved during v2.2 execution |
| verification_gaps | 44-VERIFICATION.md | human_needed — user approved during v2.3 execution |
| verification_gaps | 45-VERIFICATION.md | human_needed — user approved during v2.3 execution |

## Accumulated Context

### Decisions

- Category edit mirrors product edit: auto-save + icon-trash, confirmed pattern
- useCategoryAutoSave snapshot from safeParse output — prevents schema transform drift
- CategoryForm mode-conditional: no Save/Delete in edit mode, create mode unchanged
- Social links are mock URLs (real URLs TBD by operator)
- Floating buttons (FAB) appear only on storefront, not admin pages
- ANIM-01 must respect prefers-reduced-motion
- v2.3: all floating buttons move to bottom-right corner in a column (callback → cart → chat); callback dialog z-index above all
- v2.3: auth buttons removed from mobile header (available in drawer); burger is rightmost element
- v2.3: sign-out pending state shown in header button until session ends
- v3.0: guest chat uses localStorage `chat_guest_token`; no redirect to /uviity on widget open
- v3.0: Conversation.userId @unique removed in Phase 46 — hard prerequisite for all later phases
- v3.0: Pusher guest auth via guestToken param on /api/pusher/auth (not a new channel type)
- v3.0: file uploads use signed Cloudinary preset `chat-attachments` (not unsigned); server validates type + size
- v3.0: history drawer is in-widget view-state switch on mobile (not side-slide Sheet)
- v3.0: Phase 48 and Phase 49 are independent and can be planned/executed in parallel
- v3.0/47: claimGuestConversation wrapped in $transaction (TOCTOU race fix)
- v3.0/47: unarchiveConversation must set isActive: true (not just status: "OPEN")
- v3.0/47: router.refresh() after claim — SSR re-hydrates initialConversationId

### Blockers/Concerns

None.

## Operator Next Steps

- Run `/gsd:plan-phase 48` — History Drawer
- Run `/gsd:plan-phase 49` — File Attachments (parallel with 48)
