---
gsd_state_version: 1.0
milestone: v2.1
milestone_name: Fixes & UX
status: ready_for_next_phase
stopped_at: Phase 37 complete — ready for Phase 38 planning
last_updated: "2026-05-21T15:56:00.000Z"
last_activity: 2026-05-21 -- Phase 37 verified (human approved)
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 1
  completed_plans: 1
  percent: 25
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-21)

**Core value:** Покупець швидко знаходить б/у техніку у Львові, оформлює замовлення і за потреби пише магазину в чат.
**Current focus:** Phase 38 — dashboard-data-completeness

## Current Position

Phase: 37 complete ✅ → Phase 38 next
Plan: —
Status: Ready for `/gsd-plan-phase 38`
Last activity: 2026-05-21 -- Phase 37 verification passed (human approved)

Progress: [██░░░░░░░░] 25% (1/4 phases in v2.1)

## Performance Metrics

**Velocity:** See milestone archives v1.0–v2.0

## Accumulated Context

### Decisions

- Phase 34: shadcn recharts — client chart components import @/lib/admin/analytics only (never admin-analytics.service — Prisma bundle leak)
- Phase 34: priceSnapshot is kopiyky — analytics converts via kopiykyToRevenueUah before formatRevenue
- Phase 36: Single aggregated fetch for sidebar — Promise.all 5 queries, no N+1 per nav render
- Phase 37: Dashboard reuses getAdminSidebarCounts() — same counts as sidebar badges, single Promise.all on page load

### Pending Todos

- `/gsd-plan-phase 38` — Dashboard Data Completeness (ADM-DASH-07, ADM-DASH-08)

### Blockers/Concerns

None for v2.1.

## Deferred Items

Items acknowledged and deferred at milestone v2.0 close on 2026-05-21:

| Category | Item | Status |
|----------|------|--------|
| verification_gaps | Phases 28, 32, 33 VERIFICATION human_needed | deferred — visually approved in session |
| uat_gaps | Phase 28 (1 pending scenario), Phase 32 (3 pending) | deferred |
| dnd | aria-describedby hydration mismatch in SortableRow | P2 — known @dnd-kit SSR issue |
| test | prisma/seed.test.ts 3 failures (out-of-stock counts) | P2 — pre-existing seed state |

## Session Continuity

Last session: 2026-05-21
Stopped at: Phase 37 shipped — human approved
Resume: `/gsd-plan-phase 38`
