# Phase 37: Dashboard StatCards - Pattern Map

**Mapped:** 2026-05-21
**Files analyzed:** 1 (single-file RSC modification)
**Analogs found:** 1 / 1

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/app/(admin)/admin/page.tsx` | page (RSC) | request-response | `src/app/(admin)/admin/page.tsx` (current state) | exact — self-analog |

---

## Pattern Assignments

### `src/app/(admin)/admin/page.tsx` (RSC page, request-response)

**Analog:** `src/app/(admin)/admin/page.tsx` (current file, lines 1–72)

This is a direct extension of the existing file. Copy every pattern from it exactly — the modification is additive only.

**Imports pattern** (lines 1–8 of current file):

```typescript
import Link from "next/link";
import { Eye, Package, PackageX, Plus, ShoppingBag } from "lucide-react";
import { AnalyticsDashboardPreview } from "@/components/admin/analytics-dashboard-preview";
import { StatCard } from "@/components/admin/stat-card";
import { AdminRecentOrdersTable } from "@/components/admin/admin-recent-orders-table";
import { Button } from "@/components/ui/button";
import { getDashboardAnalyticsPreview } from "@/server/services/admin-analytics.service";
import { getAdminDashboardStats } from "@/server/services/admin-order.service";
```

**New imports to add** — extend the lucide-react import and add the sidebar service import:

```typescript
// extend lucide-react line:
import { Eye, MessageSquare, Package, PackageX, Phone, Plus, ShoppingBag } from "lucide-react";

// add after existing service imports:
import { getAdminSidebarCounts } from "@/server/services/admin-sidebar.service";
```

**Parallel fetch pattern** (lines 11–14 of current file — the Promise.all to extend):

```typescript
// CURRENT (lines 11-14):
const [stats, analyticsPreview] = await Promise.all([
  getAdminDashboardStats(),
  getDashboardAnalyticsPreview(),
]);

// MODIFIED — add getAdminSidebarCounts() as second element, shift analyticsPreview to third:
const [stats, sidebarCounts, analyticsPreview] = await Promise.all([
  getAdminDashboardStats(),
  getAdminSidebarCounts(),
  getDashboardAnalyticsPreview(),
]);
```

**StatCard grid pattern** (lines 20–39 of current file — the grid div to extend):

```tsx
// CURRENT (lines 20-39):
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <StatCard
    label="Нові замовлення"
    count={stats.pendingOrders}
    href="/admin/zamovlennia?filter=new"
    icon={ShoppingBag}
  />
  <StatCard
    label="Товари в наявності"
    count={stats.inStockProducts}
    href="/admin/tovary?stock=in_stock"
    icon={Package}
  />
  <StatCard
    label="Розпродано"
    count={stats.outOfStockProducts}
    href="/admin/tovary?stock=out_of_stock"
    icon={PackageX}
  />
</div>

// MODIFIED — append two StatCards inside the same div, no grid class changes:
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <StatCard
    label="Нові замовлення"
    count={stats.pendingOrders}
    href="/admin/zamovlennia?filter=new"
    icon={ShoppingBag}
  />
  <StatCard
    label="Товари в наявності"
    count={stats.inStockProducts}
    href="/admin/tovary?stock=in_stock"
    icon={Package}
  />
  <StatCard
    label="Розпродано"
    count={stats.outOfStockProducts}
    href="/admin/tovary?stock=out_of_stock"
    icon={PackageX}
  />
  <StatCard
    label="Нові дзвінки"
    count={sidebarCounts.unresolvedCallbacks}
    href="/admin/dzvinky"
    icon={Phone}
  />
  <StatCard
    label="Активні чати"
    count={sidebarCounts.unreadChats}
    href="/admin/chaty"
    icon={MessageSquare}
  />
</div>
```

**StatCard component contract** (from `src/components/admin/stat-card.tsx`, lines 5–11):

```typescript
type StatCardProps = {
  label: string;
  count: number;   // unresolvedCallbacks and unreadChats are both number — type-safe
  href?: string;   // always provide href so card renders as <Link> with hover styles
  className?: string;
  icon?: React.ElementType;  // pass Lucide component reference, not JSX: icon={Phone} not icon={<Phone />}
};
```

**Service return type** (from `src/server/services/admin-sidebar.service.ts`, lines 4–10):

```typescript
export type AdminSidebarBadgeCounts = {
  categories: number;
  products: number;
  pendingOrders: number;
  unreadChats: number;          // ADM-DASH-06
  unresolvedCallbacks: number;  // ADM-DASH-05
};
```

---

## Shared Patterns

### Authentication / Access Control
**Source:** `src/app/(admin)/admin/layout.tsx` (wraps all `/admin/*` pages)
**Apply to:** `src/app/(admin)/admin/page.tsx` (no action needed — layout already enforces `requireAdmin()`)

The page requires no per-file auth guard. Protection is inherited from the layout.

### Parallel Data Fetching
**Source:** `src/app/(admin)/admin/page.tsx` lines 11–14 (current `Promise.all`)
**Apply to:** Same file — extend the existing `Promise.all` array rather than adding a sequential `await`.

```typescript
// Pattern: all top-level data fetches in a single Promise.all, destructured in order
const [stats, sidebarCounts, analyticsPreview] = await Promise.all([
  getAdminDashboardStats(),
  getAdminSidebarCounts(),
  getDashboardAnalyticsPreview(),
]);
```

### Icon Import Convention
**Source:** `src/app/(admin)/admin/page.tsx` line 2 (current import)
**Apply to:** Same file — icons are imported directly from `lucide-react`, not re-exported from nav items.

```typescript
// All Lucide icons for the page come from a single named import:
import { Eye, MessageSquare, Package, PackageX, Phone, Plus, ShoppingBag } from "lucide-react";
```

---

## No Analog Found

None. The single modified file is its own best analog.

---

## Metadata

**Analog search scope:** `src/app/(admin)/admin/page.tsx`, `src/components/admin/stat-card.tsx`, `src/server/services/admin-sidebar.service.ts`
**Files scanned:** 4 (page, stat-card component, sidebar service, research doc)
**Pattern extraction date:** 2026-05-21
