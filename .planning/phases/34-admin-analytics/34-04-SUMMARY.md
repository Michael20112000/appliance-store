---
phase: 34-admin-analytics
plan: "04"
subsystem: components/admin
tags: [recharts, shadcn-chart, analytics, use-client, line-chart]

dependency_graph:
  requires:
    - "34-02 — admin-analytics.service.ts with DayPoint, formatRevenue, getAnalyticsData"
    - "34-03 — PeriodSelector and nav wiring"
  provides:
    - "src/components/admin/analytics-charts.tsx — AnalyticsCharts (2 full h-[220px] LineCharts)"
    - "src/components/admin/analytics-dashboard-preview.tsx — AnalyticsDashboardPreview (2 mini h-[120px] LineCharts + KPI + link)"
  affects:
    - "34-05 — analytics page and dashboard page wire these components"

tech_stack:
  added: []
  patterns:
    - '"use client" client boundary for recharts/ChartContainer — DOM-dependent rendering'
    - "ChartConfig + ChartContainer + var(--color-value) CSS variable binding pattern"
    - "formatRevenue() applied in ChartTooltipContent formatter prop for revenue display"
    - "Mini-chart pattern: h-[120px] LineChart with no axes/grid/tooltip (purely visual)"

key_files:
  created:
    - src/components/admin/analytics-charts.tsx
    - src/components/admin/analytics-dashboard-preview.tsx
  modified: []

decisions:
  - "AnalyticsCharts uses space-y-2 wrapper divs with h3 headings per plan spec; grid gap-6 md:grid-cols-2 outer container"
  - "Revenue tooltip uses ChartTooltipContent formatter prop: (value) => formatRevenue(value as number)"
  - "Mini-charts have no CartesianGrid, XAxis, or ChartTooltip — purely visual trend per D-08"
  - "AnalyticsDashboardPreview: KPI row displays totalOrders (integer) and formatRevenue(totalRevenue) side-by-side"

metrics:
  duration: ~10min
  completed: "2026-05-20"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 0
---

# Phase 34 Plan 04: Analytics Chart Components Summary

**Two "use client" chart components created: AnalyticsCharts with paired h-[220px] LineCharts (orders + revenue with formatRevenue tooltip) and AnalyticsDashboardPreview with paired h-[120px] mini-charts + KPI row + Детальна аналітика link — zero TypeScript errors, 5 analytics tests green.**

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create AnalyticsCharts component | d187f49 | src/components/admin/analytics-charts.tsx |
| 2 | Create AnalyticsDashboardPreview component | 2fa7e14 | src/components/admin/analytics-dashboard-preview.tsx |

## What Was Built

### Task 1: AnalyticsCharts

Created `src/components/admin/analytics-charts.tsx`:
- `"use client"` directive (recharts is DOM-dependent)
- Props: `{ ordersByDay: DayPoint[], revenueByDay: DayPoint[] }`
- Two `ChartConfig` constants: `ordersChartConfig` (chart-1) and `revenueChartConfig` (chart-2)
- Returns a `grid gap-6 md:grid-cols-2` container with two chart sections:
  - Orders chart: `h-[220px]` LineChart with CartesianGrid, XAxis (tickFormatter slices to MM-DD), ChartTooltip, Line
  - Revenue chart: same structure, but ChartTooltipContent uses `formatter={(value) => formatRevenue(value as number)}` to display "1 200 грн" in tooltip per D-02

### Task 2: AnalyticsDashboardPreview

Created `src/components/admin/analytics-dashboard-preview.tsx`:
- `"use client"` directive
- Props: `{ ordersByDay: DayPoint[], revenueByDay: DayPoint[], totalOrders: number, totalRevenue: number }`
- Two `ChartConfig` constants (same as AnalyticsCharts)
- Returns a `<section className="space-y-4">` containing:
  - Header row: "Аналітика (30 днів)" h2 + `<Link href="/admin/analityka">Детальна аналітика →</Link>`
  - KPI row: totalOrders (plain integer) + formatRevenue(totalRevenue) as `text-2xl font-semibold tabular-nums`
  - Two mini-charts in `grid gap-4 md:grid-cols-2`: h-[120px] LineCharts with NO axes, no grid, no tooltips (purely visual per D-08)

## Verification

```
npx tsc --noEmit | grep analytics-charts          → no output (0 errors)
npx tsc --noEmit | grep analytics-dashboard-preview → no output (0 errors)
npx vitest run ...admin-analytics.service.test.ts → 5/5 passed
npm test → 219 tests passed (pre-existing failures unaffected)
```

## Deviations from Plan

None — plan executed exactly as written. Both components implement the exact spec: heights, class names, formatter prop, KPI row structure, link href, and no-axis mini-chart pattern all match the plan requirements.

## Known Stubs

None — both components are fully implemented with no placeholder data, TODO comments, or hardcoded empty values.

## Threat Flags

No new security-relevant surface introduced. Both components:
- Receive serialized `DayPoint[]` (plain numbers + strings) as props from server components
- Use recharts SVG rendering — no eval(), no dangerouslySetInnerHTML
- No network requests, no auth surface, no user-controlled values reach the DOM

Per plan threat model T-34-P04-01 and T-34-P04-02: accepted, no mitigation required.

## Self-Check: PASSED

- [x] `src/components/admin/analytics-charts.tsx` — FOUND
- [x] `src/components/admin/analytics-dashboard-preview.tsx` — FOUND
- [x] First line `"use client"` in both files — CONFIRMED
- [x] `AnalyticsCharts` export — CONFIRMED
- [x] `AnalyticsDashboardPreview` export — CONFIRMED
- [x] Two `h-[220px]` ChartContainer elements in analytics-charts.tsx — CONFIRMED
- [x] Two `h-[120px]` ChartContainer elements in analytics-dashboard-preview.tsx — CONFIRMED
- [x] No XAxis/CartesianGrid/ChartTooltip in mini-charts — CONFIRMED
- [x] `href="/admin/analityka"` with "Детальна аналітика →" — CONFIRMED
- [x] `formatRevenue(totalRevenue)` in KPI row — CONFIRMED
- [x] `formatRevenue` in revenue tooltip formatter — CONFIRMED
- [x] Commit `d187f49` — FOUND
- [x] Commit `2fa7e14` — FOUND
- [x] 5 analytics service tests green — CONFIRMED
