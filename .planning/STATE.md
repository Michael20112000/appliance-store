---
gsd_state_version: 1.0
milestone: v3.0
milestone_name: Chat & Engagement
status: planning
last_updated: "2026-05-24T14:06:41.309Z"
last_activity: 2026-05-24
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-23)

**Core value:** Покупець швидко знаходить б/у техніку у Львові, оформлює замовлення і за потреби пише магазину в чат.
**Current focus:** v3.0 Chat & Engagement — defining requirements

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-05-24 — Milestone v3.0 started

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

### Blockers/Concerns

None.

## Operator Next Steps

- Run `/gsd:plan-phase 46` to start planning the first phase of v3.0
