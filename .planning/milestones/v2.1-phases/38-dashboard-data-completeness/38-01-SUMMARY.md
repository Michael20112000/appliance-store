---
phase: 38-dashboard-data-completeness
plan: 01
subsystem: admin-ui
tags: [admin, dashboard, analytics-charts, nextjs]
requirements: [ADM-DASH-07]
---

# Plan 38-01 Summary — Full AnalyticsCharts on dashboard

## What Was Built

Replaced mini `AnalyticsDashboardPreview` on `/admin` with the same `AnalyticsCharts` component used on `/admin/analityka` (ADM-DASH-07):

- **`src/app/(admin)/admin/page.tsx`** — section «Графіки» with link «Детальна аналітика →»; passes `ordersByDay` / `revenueByDay` from `getDashboardAnalyticsPreview()`
- **Deleted** `src/components/admin/analytics-dashboard-preview.tsx` — no remaining imports

## Key Decisions

- No new analytics queries — reuses existing `analyticsPreview` in `Promise.all`
- KPI totals not passed to charts (component does not accept them)

## Verification

- `npx vitest run src/server/services/admin-analytics.service.test.ts` — pass
- `rg analytics-dashboard-preview` — zero hits in `src/`
- Human verify: **approved** (2026-05-21) — charts match `/admin/analityka?days=30`, link OK

## Self-Check: PASSED (automated)

## Files Modified

- `src/app/(admin)/admin/page.tsx`
- `src/components/admin/analytics-dashboard-preview.tsx` (deleted)
