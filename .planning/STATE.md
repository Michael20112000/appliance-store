---
gsd_state_version: 1.0
milestone: v2.3
milestone_name: Bugfixes & Small Features
status: planned
last_updated: "2026-05-24T00:00:00.000Z"
last_activity: 2026-05-24 -- Phase 45 planned (2 plans)
progress:
  total_phases: 2
  completed_phases: 1
  total_plans: 4
  completed_plans: 2
  percent: 50
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-23)

**Core value:** Покупець швидко знаходить б/у техніку у Львові, оформлює замовлення і за потреби пише магазину в чат.
**Current focus:** Phase 45 — floating-ui-overhaul

## Current Position

Phase: 45 (floating-ui-overhaul) — READY TO EXECUTE
Plan: 0 of 2
Status: Phase 45 planned — 2 plans in 1 wave (parallel)
Last activity: 2026-05-24 -- Phase 45 planned (2 plans)

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
- v2.3: auth buttons removed from mobile header (available in drawer); burger is rightmost element
- v2.3: sign-out pending state shown in header button until session ends

### Blockers/Concerns

None.

## Operator Next Steps

- Run `/gsd:execute-phase 45` to execute the plans
