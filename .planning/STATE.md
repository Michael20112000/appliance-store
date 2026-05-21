---
gsd_state_version: 1.0
milestone: v2.1
milestone_name: Fixes & UX
status: phase_complete_pending_verify
stopped_at: Phase 37 plan 37-01 executed — human verify pending
last_updated: "2026-05-21T15:55:00.000Z"
last_activity: 2026-05-21 -- Phase 37 plan 37-01 implementation complete
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 1
  completed_plans: 1
  percent: 25
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-21)

**Core value:** Покупець швидко знаходить б/у техніку у Львові, оформлює замовлення і за потреби пише магазину в чат.
**Current focus:** Phase 37 — dashboard-statcards (human verify) → Phase 38

## Current Position

Phase: 37 (dashboard-statcards) — PLAN COMPLETE, human verify pending
Plan: 1 of 1 complete
Status: Awaiting human checkpoint on /admin StatCards
Last activity: 2026-05-21 -- 37-01 implemented (5 StatCards, getAdminSidebarCounts in Promise.all)

Progress: [██░░░░░░░░] 25% (1/4 plans in milestone)

## Performance Metrics

**Velocity:** See milestone archives v1.0–v2.0

## Accumulated Context

### Decisions

- Phase 34: shadcn recharts — client chart components import @/lib/admin/analytics only (never admin-analytics.service — Prisma bundle leak)
- Phase 34: priceSnapshot is kopiyky — analytics converts via kopiykyToRevenueUah before formatRevenue
- Phase 36: Single aggregated fetch for sidebar — Promise.all 5 queries, no N+1 per nav render
- Phase 37: Dashboard reuses getAdminSidebarCounts() — same counts as sidebar badges, single Promise.all on page load

### Pending Todos

- Human verify Phase 37: `/admin` — 5 StatCards, click «Нові дзвінки» → /admin/dzvinky, «Активні чати» → /admin/chaty
- `/gsd-verify-phase 37` after human approval
- `/gsd-plan-phase 38` — Dashboard Data Completeness (next phase)

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
Stopped at: Claude Code session limit during Phase 37 execution
Resume: Human verify /admin StatCards, then `/gsd-verify-phase 37` or `/gsd-plan-phase 38`
