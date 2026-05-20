---
phase: 34-admin-analytics
plan: "05"
subsystem: app/admin
tags: [rsc, analytics, searchParams, dashboard-preview]

dependency_graph:
  requires:
    - "34-03 — PeriodSelector + nav"
    - "34-04 — AnalyticsCharts + AnalyticsDashboardPreview"
  provides:
    - "src/app/(admin)/admin/analityka/page.tsx — full analytics page (AN-01)"
    - "src/app/(admin)/admin/page.tsx — dashboard preview section (AN-02)"
  affects: []

tech_stack:
  added: []
  patterns:
    - "Async RSC searchParams Promise + days allowlist (7|30|90, default 30)"
    - "Parallel Promise.all for dashboard stats + analytics preview"
    - "Revenue KPI inline card (StatCard is number-only)"

key_files:
  created:
    - src/app/(admin)/admin/analityka/page.tsx
  modified:
    - src/app/(admin)/admin/page.tsx

decisions: []

metrics:
  duration: ~5min
  completed: "2026-05-20"
  tasks_completed: 2
  tasks_total: 3
  files_created: 1
  files_modified: 1
  human_verify: approved
---

# Phase 34 Plan 05: Page Wiring Summary

**Resumed after Claude Code session limit at wave 3/3. Analytics page and dashboard preview wired; kopiyky→UAH revenue fix; human UAT approved.**

## Tasks Completed

| Task | Name | Status | Files |
|------|------|--------|-------|
| 1 | Create /admin/analityka page | done | src/app/(admin)/admin/analityka/page.tsx |
| 2 | Insert AnalyticsDashboardPreview on /admin | done | src/app/(admin)/admin/page.tsx |
| 3 | Human verify | approved | 34-HUMAN-UAT.md |

## What Was Built

### Task 1: AnalitykaPage

- RSC at `/admin/analityka` with `metadata.title = "Аналітика"`
- `searchParams.days` allowlist: `7` / `90` / default `30`
- `getAnalyticsData(days)` → KPI grid (StatCard ×2 + revenue inline card) + PeriodSelector + AnalyticsCharts

### Task 2: Admin dashboard preview

- `Promise.all([getAdminDashboardStats(), getDashboardAnalyticsPreview()])`
- `<AnalyticsDashboardPreview />` inserted before «Останні замовлення»

## Verification

```
npx vitest run src/server/services/admin-analytics.service.test.ts → 5/5 passed
ReadLints on new pages → no issues
```

## Human verify (blocking)

1. `npm run dev`, login as admin
2. `/admin` — preview above orders, link to `/admin/analityka`
3. `/admin/analityka` — KPIs, period tabs (default 30), two charts
4. Sidebar «Аналітика» link works

## Deviations from Plan

None — implementation matches 34-05-PLAN.md spec.
