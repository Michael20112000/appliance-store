# Phase 38 — Research: Dashboard Data Completeness

**Researched:** 2026-05-21  
**Phase:** 38-dashboard-data-completeness  
**Requirements:** ADM-DASH-07, ADM-DASH-08

## Summary

Dashboard already fetches the same analytics payload as `/admin/analityka` for 30 days (`getDashboardAnalyticsPreview()` → `getAnalyticsData(30)`). The gap is **presentation**: `AnalyticsDashboardPreview` renders mini charts (120px, no grid/axis/tooltip) while the analytics page uses `AnalyticsCharts` (220px, full recharts chrome). Fix: swap the component on `admin/page.tsx` and delete the preview-only file.

Recent orders already return full `AdminOrderSummaryDto` from `mapOrderSummary`; only `take: 5` limits rows. `AdminRecentOrdersTable` is a slim 4-column raw `<table>` with static `OrderStatusBadge`. The orders list page uses shadcn `Table`, 6 columns, and `OrderListStatusSelect` with status accent. Fix: bump `take` to 10 and refactor `AdminRecentOrdersTable` to mirror `OrdersDataTable` cells without sort/pagination/filter UI.

## Key Findings

### Charts (ADM-DASH-07)

| Layer | File | Notes |
|-------|------|-------|
| Dashboard RSC | `src/app/(admin)/admin/page.tsx` | Uses `AnalyticsDashboardPreview` |
| Full analytics | `src/app/(admin)/admin/analityka/page.tsx` | `AnalyticsCharts` under «Графіки» |
| Preview (delete) | `src/components/admin/analytics-dashboard-preview.tsx` | Sole consumer = dashboard |
| Full charts | `src/components/admin/analytics-charts.tsx` | Grid, XAxis, tooltip, h-[220px] |
| Service | `admin-analytics.service.ts` | `getDashboardAnalyticsPreview()` = `getAnalyticsData(30)` |

**Decision:** No service change. Replace preview component with `AnalyticsCharts` + section header matching analytics page chart block.

### Orders table (ADM-DASH-08)

| Layer | File | Notes |
|-------|------|-------|
| Dashboard table | `admin-recent-orders-table.tsx` | 4 cols, `OrderStatusBadge`, raw table |
| Full list | `orders-data-table.tsx` | 6 cols, `OrderListStatusSelect`, TanStack + pagination |
| Data | `getAdminDashboardStats()` | `findMany({ take: 5 })` → change to 10 |

**Decision:** Refactor `AdminRecentOrdersTable` to static shadcn `Table` (no TanStack) with same column order and cell markup as `OrdersDataTable`. No `AdminListPagination`, no `OrderListFilters`, no sortable headers.

## Plan Split

Two sequential plans — both touch `admin/page.tsx` in different sections; wave 2 depends on wave 1 to avoid merge conflicts in autonomous execution.

1. **38-01** — Charts (ADM-DASH-07)
2. **38-02** — Recent orders table (ADM-DASH-08)

## Risks

- `OrderListStatusSelect` on dashboard enables status changes inline (same as orders page) — intentional parity per requirement.
- Deleting `analytics-dashboard-preview.tsx` — grep confirms single import.

## Dependencies

- Phase 37 complete (dashboard page structure, Promise.all)
- Phase 34 shipped (`AnalyticsCharts`, `getAnalyticsData`)
