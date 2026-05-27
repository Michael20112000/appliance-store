---
gsd_state_version: 1.0
milestone: v3.1
milestone_name: UX Polish & Fixes
status: executing
last_updated: "2026-05-27T11:01:28.085Z"
last_activity: 2026-05-27 -- Phase 50 execution started
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 5
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-26)

**Core value:** Покупець швидко знаходить б/у техніку у Львові, оформлює замовлення і за потреби пише магазину в чат.
**Current focus:** Phase 50 — cart-wishlist-drawers

## Current Position

Phase: 50 (cart-wishlist-drawers) — EXECUTING
Plan: 1 of 5
Status: Executing Phase 50

```
Progress: [          ] 0% (0/4 phases)
```

Last activity: 2026-05-27 -- Phase 50 execution started

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

- Run `/gsd:execute-phase 50` — execute all 5 plans (4 waves)
