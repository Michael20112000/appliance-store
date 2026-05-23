---
gsd_state_version: 1.0
milestone: v2.3
milestone_name: Bugfixes & Small Features
status: executing
last_updated: "2026-05-23T18:41:25.550Z"
last_activity: 2026-05-23 -- Phase 44 execution started
progress:
  total_phases: 2
  completed_phases: 0
  total_plans: 2
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-23)

**Core value:** Покупець швидко знаходить б/у техніку у Львові, оформлює замовлення і за потреби пише магазину в чат.
**Current focus:** Phase 44 — mobile-header-cleanup

## Current Position

Phase: 44 (mobile-header-cleanup) — EXECUTING
Plan: 1 of 2
Status: Executing Phase 44
Last activity: 2026-05-23 -- Phase 44 execution started

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

- Run `/gsd:execute-phase 44` to execute the plans
