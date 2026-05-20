# Phase 34: Admin Analytics - Pattern Map

**Mapped:** 2026-05-20
**Files analyzed:** 7 new/modified files
**Analogs found:** 7 / 7

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/server/services/admin-analytics.service.ts` | service | batch / transform | `src/server/services/admin-order.service.ts` | exact |
| `src/server/services/admin-analytics.service.test.ts` | test | — | `src/server/services/admin-order.service.test.ts` | exact |
| `src/app/(admin)/admin/analityka/page.tsx` | RSC page | request-response | `src/app/(admin)/admin/zamovlennia/page.tsx` | exact |
| `src/components/admin/period-selector.tsx` | component (client) | request-response | `src/components/admin/order-list-filters.tsx` | exact |
| `src/components/admin/analytics-charts.tsx` | component (client) | transform | `src/components/admin/orders-data-table.tsx` (client pattern) | role-match |
| `src/components/admin/analytics-dashboard-preview.tsx` | component (client) | transform | `src/components/admin/orders-data-table.tsx` (client pattern) | role-match |
| `src/components/admin/admin-nav-items.ts` | config | — | `src/components/admin/admin-nav-items.ts` (self) | exact |
| `src/app/(admin)/admin/page.tsx` | RSC page (modified) | request-response | `src/app/(admin)/admin/page.tsx` (self) | exact |

---

## Pattern Assignments

### `src/server/services/admin-analytics.service.ts` (service, batch/transform)

**Analog:** `src/server/services/admin-order.service.ts`

**Imports pattern** (lines 1–3):
```typescript
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
```

**Core $queryRaw pattern** (lines 182–214 of analog — `fetchOrderIdsByTotalKopiyky`):
```typescript
// Existing $queryRaw usage in the codebase — copy this structure for date-bucketed queries
const rows = await prisma.$queryRaw<Array<{ id: string }>>`
  SELECT o.id
  FROM "Order" o
  LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
  GROUP BY o.id
  ORDER BY COALESCE(SUM(oi."priceSnapshot" * oi.quantity), 0) ${orderDirection}
  OFFSET ${skip}
  LIMIT ${take}
`;
return rows.map((row) => row.id);
```

**Parallel Promise.all pattern** (lines 134–153 of analog — `getAdminDashboardStats`):
```typescript
const [pendingOrders, inStockProducts, outOfStockProducts, recentOrders] =
  await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { quantity: { gte: 1 } } }),
    prisma.product.count({ where: { quantity: 0 } }),
    prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { items: true } }),
  ]);
return { pendingOrders, inStockProducts, outOfStockProducts, recentOrders: recentOrders.map(mapOrderSummary) };
```

**CallbackRequest count pattern** (from `src/server/services/callback-request.service.ts` lines 15–22):
```typescript
const since = new Date(Date.now() - CALLBACK_RATE_LIMIT_WINDOW_MS);
const recent = await prisma.callbackRequest.count({
  where: {
    ipAddress,
    createdAt: { gte: since },
  },
});
```

**BigInt conversion requirement** — `$queryRaw` returns `bigint` for `COUNT(*)` and `SUM()`. Always convert inline:
```typescript
rows.map(r => ({ day: r.day.toString().slice(0, 10), value: Number(r.count) }))
```

**Named export pattern** — all functions are named exports (no default export), types exported alongside:
```typescript
export type DayPoint = { day: string; value: number };
export type AnalyticsData = { kpi: { ... }; ordersByDay: DayPoint[]; revenueByDay: DayPoint[] };
export async function getAnalyticsData(days: 7 | 30 | 90): Promise<AnalyticsData> { ... }
export async function getDashboardAnalyticsPreview(): Promise<{ ... }> { ... }
```

---

### `src/server/services/admin-analytics.service.test.ts` (test)

**Analog:** `src/server/services/admin-order.service.test.ts`

**Mock setup pattern** (lines 1–28 of analog):
```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
import { getAnalyticsData, getDashboardAnalyticsPreview } from "./admin-analytics.service";

vi.mock("@/lib/db", () => ({
  prisma: {
    order: { count: vi.fn() },
    callbackRequest: { count: vi.fn() },
    $queryRaw: vi.fn(),
  },
}));
```

**$queryRaw mock pattern** (lines 234–257 of analog):
```typescript
vi.mocked(prisma.$queryRaw)
  .mockResolvedValueOnce([{ day: new Date("2026-05-01"), count: BigInt(3) }])
  .mockResolvedValueOnce([{ day: new Date("2026-05-01"), revenue: BigInt(6000) }]);
vi.mocked(prisma.callbackRequest.count).mockResolvedValueOnce(2);

const result = await getAnalyticsData(30);
expect(result.kpi.totalOrders).toBe(3);
expect(result.kpi.totalRevenue).toBe(6000);
expect(result.kpi.totalCallbacks).toBe(2);
```

**Test suite structure** — `describe` + `it` per concern, `beforeEach(vi.clearAllMocks)` when multiple tests mutate mocks:
```typescript
describe("getAnalyticsData", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("returns correct kpi totals from $queryRaw results", async () => { ... });
  it("BigInt values are converted to number", async () => { ... });
  it("zero-fills missing days to produce full N-day array", async () => { ... });
});
describe("getDashboardAnalyticsPreview", () => {
  it("uses fixed 30-day window", async () => { ... });
});
```

---

### `src/app/(admin)/admin/analityka/page.tsx` (RSC page, request-response)

**Analog:** `src/app/(admin)/admin/zamovlennia/page.tsx`

**Imports pattern** (lines 1–8 of analog):
```typescript
import type { Metadata } from "next";
import { PeriodSelector } from "@/components/admin/period-selector";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { StatCard } from "@/components/admin/stat-card";
import { getAnalyticsData } from "@/server/services/admin-analytics.service";
```

**Async searchParams pattern** (lines 14–26 of analog):
```typescript
type PageProps = {
  searchParams: Promise<{ days?: string }>;
};

export default async function AnalitykaPage({ searchParams }: PageProps) {
  const { days: rawDays } = await searchParams;
  const days = rawDays === "7" ? 7 : rawDays === "90" ? 90 : 30; // allowlist validation
  const data = await getAnalyticsData(days);
  // ...
}
```

**Page layout pattern** (lines 33–59 of `src/app/(admin)/admin/page.tsx`):
```typescript
return (
  <div className="space-y-8">
    <h1 className="text-2xl font-semibold md:text-3xl">Аналітика</h1>
    {/* KPI cards grid */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"> ... </div>
    {/* Period selector */}
    <PeriodSelector active={days} />
    {/* Charts */}
    <AnalyticsCharts data={data} />
  </div>
);
```

**Section heading pattern** (from `src/app/(admin)/admin/nalashtuvannia/page.tsx` line 25):
```typescript
<section className="space-y-4">
  <h2 className="text-lg font-semibold">Графіки</h2>
  ...
</section>
```

**Metadata export** (line 10 of analog):
```typescript
export const metadata: Metadata = { title: "Аналітика" };
```

---

### `src/components/admin/period-selector.tsx` (component, client, request-response)

**Analog:** `src/components/admin/order-list-filters.tsx`

**Full file pattern** (lines 1–64 of analog):
```typescript
// order-list-filters.tsx is a server component that renders Link-based tab buttons
// period-selector.tsx follows the same Link navigation pattern but is "use client"
// because it needs usePathname/useSearchParams for active-state detection
// OR it can be a server component receiving `active` as a prop from the RSC page.

import Link from "next/link";
import { cn } from "@/lib/utils";

// Active filter styling (lines 50–57 of analog):
className={cn(
  "rounded-md border px-3 py-1.5 text-sm transition-colors",
  active === filter.key
    ? "border-primary bg-primary text-primary-foreground"
    : "border-border bg-background text-muted-foreground hover:text-foreground",
)}
```

**Props pattern** — receive `active` as a typed prop, derive `href` from query param:
```typescript
type PeriodSelectorProps = { active: 7 | 30 | 90 };
const periods = [7, 30, 90] as const;

export function PeriodSelector({ active }: PeriodSelectorProps) {
  return (
    <div className="flex gap-2">
      {periods.map(p => (
        <Link key={p} href={`?days=${p}`}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm transition-colors",
            active === p
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:text-foreground",
          )}>
          {p} днів
        </Link>
      ))}
    </div>
  );
}
```

Note: `order-list-filters.tsx` is a server component; `period-selector.tsx` can also be a server component since it receives `active` as a prop from the RSC page and only uses `<Link>` — no client-side state needed. Do NOT add `"use client"` unless `useSearchParams`/`usePathname` is actually required.

---

### `src/components/admin/analytics-charts.tsx` (component, "use client", transform)

**Analog:** `src/components/admin/orders-data-table.tsx` (for the `"use client"` boundary pattern)

**"use client" directive + imports pattern** (lines 1–36 of analog):
```typescript
"use client";

import { Line, LineChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { DayPoint } from "@/server/services/admin-analytics.service";
```

**Props-only data flow** — RSC passes serialized data as props; client component never fetches:
```typescript
type AnalyticsChartsProps = {
  ordersByDay: DayPoint[];
  revenueByDay: DayPoint[];
};

export function AnalyticsCharts({ ordersByDay, revenueByDay }: AnalyticsChartsProps) { ... }
```

**ChartConfig pattern** (from RESEARCH.md Pattern 2):
```typescript
const ordersChartConfig = {
  value: { label: "Замовлень", color: "var(--chart-1)" },
} satisfies ChartConfig;

const revenueChartConfig = {
  value: { label: "Виручка (грн)", color: "var(--chart-2)" },
} satisfies ChartConfig;
```

**ChartContainer + LineChart pattern** (from RESEARCH.md Pattern 2):
```typescript
<ChartContainer config={ordersChartConfig} className="h-[220px] w-full">
  <LineChart data={ordersByDay} accessibilityLayer>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="day" tickLine={false} tickMargin={8} axisLine={false}
           tickFormatter={(v: string) => v.slice(5)} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Line dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
  </LineChart>
</ChartContainer>
```

**CSS chart variables** — already defined in `src/app/globals.css` (lines 27–31):
```css
--chart-1: oklch(0.87 0 0);
--chart-2: oklch(0.556 0 0);
/* … through --chart-5 */
```

---

### `src/components/admin/analytics-dashboard-preview.tsx` (component, "use client", transform)

**Analog:** Same `"use client"` + compact rendering pattern as `analytics-charts.tsx`

**"use client" + compact mini-chart pattern** (from RESEARCH.md Pattern 2 mini variant):
```typescript
"use client";

import { Line, LineChart } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import Link from "next/link";
import type { DayPoint } from "@/server/services/admin-analytics.service";

type AnalyticsDashboardPreviewProps = {
  ordersByDay: DayPoint[];
  revenueByDay: DayPoint[];
  totalOrders: number;
  totalRevenue: number;
};

export function AnalyticsDashboardPreview({ ordersByDay, revenueByDay, totalOrders, totalRevenue }: AnalyticsDashboardPreviewProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Аналітика (30 днів)</h2>
        <Link href="/admin/analityka" className="text-sm text-muted-foreground hover:text-foreground">
          Детальна аналітика →
        </Link>
      </div>
      {/* KPI row + mini charts (h-[120px], no axes) */}
      <ChartContainer config={ordersChartConfig} className="h-[120px] w-full">
        <LineChart data={ordersByDay}>
          <Line dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartContainer>
    </section>
  );
}
```

**Section insertion point** in `src/app/(admin)/admin/page.tsx` (line 50) — insert the preview `<section>` block before the existing `<section className="space-y-4">` containing «Останні замовлення».

---

### `src/components/admin/admin-nav-items.ts` (config — modified)

**Analog:** Self — lines 1–17 of the file.

**Current nav items structure** (lines 1–17):
```typescript
import {
  FolderTree,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
} from "lucide-react";

export const adminNavItems = [
  { href: "/admin", label: "Панель", icon: LayoutDashboard },
  { href: "/admin/kategorii", label: "Категорії", icon: FolderTree },
  { href: "/admin/tovary", label: "Товари", icon: Package },
  { href: "/admin/zamovlennia", label: "Замовлення", icon: ShoppingBag },
  { href: "/admin/chaty", label: "Чати", icon: MessageSquare },
  { href: "/admin/nalashtuvannia", label: "Налаштування", icon: Settings },
] as const;
```

**Change:** Add `BarChart2` import from `lucide-react` and insert analytics entry before «Налаштування»:
```typescript
{ href: "/admin/analityka", label: "Аналітика", icon: BarChart2 },
```

---

### `src/app/(admin)/admin/page.tsx` (RSC page — modified)

**Analog:** Self — lines 1–60 of the file.

**Existing import block** (lines 1–6):
```typescript
import Link from "next/link";
import { Eye, Package, PackageX, Plus, ShoppingBag } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { AdminRecentOrdersTable } from "@/components/admin/admin-recent-orders-table";
import { Button } from "@/components/ui/button";
import { getAdminDashboardStats } from "@/server/services/admin-order.service";
```

**Add these imports:**
```typescript
import { AnalyticsDashboardPreview } from "@/components/admin/analytics-dashboard-preview";
import { getDashboardAnalyticsPreview } from "@/server/services/admin-analytics.service";
```

**Change to function body** — add parallel fetch and section insertion:
```typescript
export default async function AdminDashboardPage() {
  const [stats, analyticsPreview] = await Promise.all([
    getAdminDashboardStats(),
    getDashboardAnalyticsPreview(),
  ]);
  // ...
  // Insert before line 50 (<section className="space-y-4"> Останні замовлення):
  <AnalyticsDashboardPreview
    ordersByDay={analyticsPreview.ordersByDay}
    revenueByDay={analyticsPreview.revenueByDay}
    totalOrders={analyticsPreview.kpi.totalOrders}
    totalRevenue={analyticsPreview.kpi.totalRevenue}
  />
}
```

---

## Shared Patterns

### Admin Layout / Auth Guard
**Source:** `src/app/(admin)/admin/layout.tsx` lines 12–16
**Apply to:** No new files need this — the layout already wraps all `/admin/*` routes via `requireAdmin()`. New page at `/admin/analityka` is automatically protected.
```typescript
await requireAdmin();
```

### Async searchParams (Next.js 15)
**Source:** `src/app/(admin)/admin/zamovlennia/page.tsx` lines 14–25
**Apply to:** `src/app/(admin)/admin/analityka/page.tsx`
```typescript
type PageProps = {
  searchParams: Promise<{ days?: string }>;
};
export default async function AnalitykaPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  // ... parse rawParams
}
```

### Page Root Layout
**Source:** `src/app/(admin)/admin/page.tsx` line 12; `src/app/(admin)/admin/kategorii/page.tsx` line 10
**Apply to:** `src/app/(admin)/admin/analityka/page.tsx`
```typescript
<div className="space-y-8">
  <h1 className="text-2xl font-semibold md:text-3xl">Аналітика</h1>
  ...
</div>
```

### Section Heading
**Source:** `src/app/(admin)/admin/page.tsx` line 51; `src/app/(admin)/admin/nalashtuvannia/page.tsx` line 25
**Apply to:** Both analytics page sections and dashboard preview section
```typescript
<section className="space-y-4">
  <h2 className="text-lg font-semibold">…</h2>
  ...
</section>
```

### KPI Grid with StatCard
**Source:** `src/app/(admin)/admin/page.tsx` lines 15–34; `src/components/admin/stat-card.tsx` lines 1–43
**Apply to:** `src/app/(admin)/admin/analityka/page.tsx` (KPI cards row)
```typescript
// StatCard accepts: label: string, count: number, href?: string, icon?: React.ElementType
// For revenue (string value "1 200 грн"), create a separate AnalyticsKpiCard
// that accepts value: string — do NOT mutate StatCard's count: number type
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <StatCard label="Замовлень" count={data.kpi.totalOrders} />
  {/* Revenue: inline card or AnalyticsKpiCard with value: string */}
  <StatCard label="Дзвінків" count={data.kpi.totalCallbacks} />
</div>
```

### "use client" Boundary Pattern
**Source:** `src/components/admin/orders-data-table.tsx` line 1
**Apply to:** `analytics-charts.tsx`, `analytics-dashboard-preview.tsx`
```typescript
"use client";
// Place at top of file — required for all recharts/ChartContainer usage
```

### Prisma $queryRaw with Prisma.sql (conditional direction)
**Source:** `src/server/services/admin-order.service.ts` lines 182–214
**Apply to:** `src/server/services/admin-analytics.service.ts`
```typescript
// Use tagged template literal for parameterized queries (safe from injection)
const rows = await prisma.$queryRaw<Array<{ day: Date | string; count: bigint }>>`
  SELECT DATE("createdAt") AS day, COUNT(*) AS count
  FROM "Order"
  WHERE "createdAt" >= ${sinceDate}
  GROUP BY DATE("createdAt")
  ORDER BY day ASC
`;
```

### Revenue Formatter (D-02)
**Source:** `src/components/admin/orders-data-table.tsx` lines 52–56 (date formatter pattern)
**Apply to:** `analytics-charts.tsx` tooltip, `analytics-dashboard-preview.tsx` KPI display
```typescript
// Pattern: locale-aware formatting via Intl (analogous to date formatter in orders-data-table.tsx)
function formatRevenue(grn: number): string {
  return grn.toLocaleString("uk-UA", { maximumFractionDigits: 0 }) + " грн";
}
```

### Test Mock Pattern for Prisma
**Source:** `src/server/services/admin-order.service.test.ts` lines 16–28
**Apply to:** `src/server/services/admin-analytics.service.test.ts`
```typescript
vi.mock("@/lib/db", () => ({
  prisma: {
    order: { count: vi.fn() },
    callbackRequest: { count: vi.fn() },
    $queryRaw: vi.fn(),
  },
}));
```

---

## No Analog Found

All files have close matches in the codebase. The `ChartContainer`/`LineChart` component internals have no existing analog (shadcn chart not yet installed), but RESEARCH.md Pattern 2 provides the exact code template to use after `npx shadcn@latest add chart` is run.

| File / concern | Reason |
|----------------|--------|
| `src/components/ui/chart.tsx` | Does not exist yet — installed via `npx shadcn@latest add chart`. Use RESEARCH.md Pattern 2 for the API. |

---

## Metadata

**Analog search scope:** `src/app/(admin)/`, `src/components/admin/`, `src/server/services/`, `src/app/globals.css`
**Files scanned:** 12 source files read in full
**Pattern extraction date:** 2026-05-20
