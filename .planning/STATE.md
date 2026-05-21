---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: milestone
status: completed
stopped_at: Phase 36 context gathered
last_updated: "2026-05-21T11:21:06.377Z"
last_activity: 2026-05-21 -- Phase 36 marked complete
progress:
  total_phases: 9
  completed_phases: 9
  total_plans: 26
  completed_plans: 26
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-20)

**Core value:** Покупець швидко знаходить б/у техніку у Львові, оформлює замовлення і за потреби пише магазину в чат.
**Current focus:** Phase 36 — admin-sidebar-badges

## Current Position

Phase: 36 — COMPLETE
Plan: 1 of 3
Status: Phase 36 complete
Last activity: 2026-05-21 -- Phase 36 marked complete

### Shipped on `main` (checkpoint 2026-05-19)

| Work | Commits area |
|------|----------------|
| Phases 17–19 (admin chat scroll, list delete, db purge) | merged to main |
| Phase 20 guest checkout | 2a4ddfb |
| v1.4 operator bugs BUG-01…11 | 40deedf |
| Hotfixes (categories.ts, product-form JSX, suppressAdminRowNavigation, header keys) | d00a11c…bf591ba |

## Performance Metrics

**Velocity:** see milestone archives v1.0–v1.3

## Accumulated Context

### Decisions

- Bugfixes: **intake → plan → execute** — see `.planning/BUGFIX-WORKFLOW.md`
- Guest checkout: localStorage cart + `guestAccessToken` (phase 20)
- Do **not** merge `git stash@{0}` (catalog pagination WIP) without a dedicated plan
- Phase 33: SortableRow sub-component extracted above AdminCategoriesTable for clean useSortable usage per row
- Phase 33: DnD listeners on GripVertical icon only (not tr) — prevents click-vs-drag conflict
- Phase 33: No DragOverlay used — opacity:0.5 on isDragging row sufficient for low-row admin table
- [Phase ?]: 34-02: Revenue query covers ALL orders regardless of status (D-01) — no WHERE o.status filter in $queryRaw
- Phase 34: priceSnapshot is kopiyky — analytics converts via kopiykyToRevenueUah before formatRevenue (D-02)
- Phase 34: client chart components import @/lib/admin/analytics only (never admin-analytics.service — Prisma bundle leak)

### Pending Todos

- `/gsd-verify-work` — conversational UAT (optional follow-up)

### Blockers/Concerns

- Ad-hoc multi-bug chat fixes caused regressions (partial stash merge, missing exports) — mitigated by workflow above

## Deferred Items

Items acknowledged and deferred at milestone v1.5 close on 2026-05-19:

| Category | Item | Status |
|----------|------|--------|
| uat_gaps | Phase 04, 07, 18 HUMAN-UAT partial | deferred |
| verification_gaps | Phases 04, 06, 07, 12, 13, 18 VERIFICATION | human_needed / gaps_found |
| test | `prisma/seed.test.ts` out-of-stock count | P2 — document after seed |
| e2e | `e2e/cart-auth.spec.ts` guest redirect expectations | P2 — contradicts guest checkout |
| wip | `git stash@{0}` catalog pagination | deferred — CAT-WIP-01 |
| todos | bugfix-intake-TEMPLATE.md | template only |
| perf | CWV / Lighthouse targets | v2 PERF-01 |

Items acknowledged at v1.4 milestone close (2026-05-19):

| Category | Item | Status |
|----------|------|--------|
| uat_gaps | Phase 04, 07 HUMAN-UAT partial | deferred |
| uat_gaps | Phase 19 purge UAT | closed in phase 27 |
| verification_gaps | Phases 04, 06, 07, 12, 13, 18, 19 VERIFICATION | human_needed / gaps_found |
| todos | bugfix-intake-TEMPLATE.md | template only |
| Phase 33-admin-categories-dnd-links P01 | 5min | 2 tasks | 2 files |
| Phase 34-admin-analytics P02 | 8min | 1 tasks | 4 files |

## Session Continuity

Last session: 2026-05-21T09:41:39.591Z
Stopped at: Phase 36 context gathered
Resume: `/gsd-plan-phase 34` (Phase 34: Admin analytics) or `/gsd-new-milestone` if milestone review needed

## Operator Next Steps

1. `/gsd-discuss-phase 28` або `/gsd-plan-phase 28` — старт Phase 28
2. BUG-24 (ASL-20260519-0013) — у Phase 31
3. Push tag `v1.5` to remote if not yet pushed
