---
gsd_state_version: 1.0
milestone: v2.3
milestone_name: Bugfixes & Small Features
status: planning
last_updated: "2026-05-23T00:00:00.000Z"
last_activity: 2026-05-23 — Milestone v2.3 started
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
**Current focus:** Defining requirements for v2.3

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-05-23 — Milestone v2.3 started

## Deferred Items

Items carried over from v2.2:

| Category | Item | Status |
|----------|------|--------|
| verification_gap | Phase 41 41-VERIFICATION.md | human_needed — user visually approved during execution |
| verification_gap | Phase 42 42-VERIFICATION.md | human_needed — user visually approved during execution |
| verification_gap | Phase 43 43-VERIFICATION.md | human_needed — user visually approved during execution |
| todo | bugfix-intake-TEMPLATE.md | template/acknowledged — not a real task |

## Accumulated Context

### Decisions

- Category edit mirrors product edit: auto-save + icon-trash, confirmed pattern
- useCategoryAutoSave snapshot from safeParse output — prevents schema transform drift
- CategoryForm mode-conditional: no Save/Delete in edit mode, create mode unchanged
- Social links are mock URLs (real URLs TBD by operator)
- Floating buttons (FAB) appear only on storefront, not admin pages
- ANIM-01 must respect prefers-reduced-motion
- v2.3: all floating buttons move to bottom-right corner in a column (callback → cart → chat); callback dialog z-index above all

### Blockers/Concerns

None.

## Operator Next Steps

- Run `/gsd:plan-phase 44` to start execution
