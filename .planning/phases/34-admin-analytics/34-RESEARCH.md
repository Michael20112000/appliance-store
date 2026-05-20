# Phase 34: Admin Analytics - Research

**Researched:** 2026-05-20
**Domain:** Admin dashboard analytics — Recharts via shadcn chart, Prisma time-series aggregation, RSC searchParams
**Confidence:** HIGH

## Summary

Phase 34 adds two analytics surfaces to the admin panel: a full analytics page at `/admin/analityka` (AN-01) and a compact preview section on the existing `/admin` dashboard (AN-02). All decisions have been locked in CONTEXT.md. The primary technical challenge is wiring Prisma time-series queries (day-grouped counts and revenue sums) to shadcn chart components that require a "use client" wrapper. The RSC architecture means server components fetch data and pass serialized arrays to client chart wrappers.

The shadcn `chart` component (wrapping recharts) is not yet installed — `npx shadcn@latest add chart` is required. Recharts is a peer dependency that will be auto-added. All other pieces exist: `StatCard`, `Tabs`, async searchParams pattern, `--chart-*` CSS variables in globals.css, and Prisma's `$queryRaw` for `DATE_TRUNC`-style grouping.

**Primary recommendation:** Install shadcn chart component, add `getAnalyticsData(days: 7|30|90)` to `admin-order.service.ts`, build a thin "use client" `<AnalyticsCharts>` component, and wire it into a new RSC page. Keep the dashboard preview as a separate lightweight component that calls a fixed-30-day variant.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| KPI aggregation (order count, revenue, callbacks) | API / Backend (Prisma service) | — | Server-only data, no client exposure needed |
| Time-series day bucketing | API / Backend (Prisma `$queryRaw`) | — | PostgreSQL `DATE_TRUNC` is the right place |
| Period selector (7/30/90 toggle) | Frontend Server (RSC searchParams) | Browser (Link nav) | searchParams → RSC re-fetch; no client state needed |
| Chart rendering | Browser / Client (`"use client"` wrapper) | — | Recharts is DOM-dependent, cannot run in RSC |
| Dashboard preview section | Frontend Server (RSC) | Browser (chart inner) | RSC fetches, passes data to client chart component |
| Sidebar nav link | Frontend Server (static config) | — | Static nav item addition |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | 3.8.1 [VERIFIED: npm registry] | SVG chart primitives (Line, Area, LineChart etc.) | Used by shadcn chart; official dep |
| shadcn chart | via `npx shadcn@latest add chart` [VERIFIED: ui.shadcn.com] | ChartContainer, ChartTooltip, ChartTooltipContent wrappers | Already-chosen stack (D-09); consistent design tokens |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^1.16.0 (installed) [VERIFIED: npm registry] | BarChart2 / TrendingUp icon for nav | Sidebar nav item for «Аналітика» |
| nuqs | ^2.8.9 (installed) | URL search param sync | NOT needed — admin layout has no NuqsAdapter; use plain Next.js `searchParams` prop |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn chart / recharts | Chart.js, Victory | User locked D-09 to recharts via shadcn — do not add another library |
| `$queryRaw` + DATE_TRUNC | Prisma `groupBy` | Prisma `groupBy` cannot group by computed date expression — `$queryRaw` is required for day buckets |
| searchParams (RSC) | nuqs `useQueryStates` | Admin layout has no NuqsAdapter; adding one is out of scope. Plain searchParams avoids that dependency. |

**Installation:**
```bash
npx shadcn@latest add chart
```
This auto-installs recharts as a peer dependency.

**Version verification:**
```
recharts: 3.8.1 (published 2015-08-07, active repository github.com/recharts/recharts)
```

## Package Legitimacy Audit

> slopcheck was not available at research time. Registry verification performed manually.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| recharts | npm | 10+ yrs (2015) | Very high (10M+/wk estimated) | github.com/recharts/recharts | [ASSUMED — slopcheck unavailable] | Approved — well-established library, official shadcn dep |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

*slopcheck was unavailable at research time. recharts is confirmed on npm registry (`npm view recharts version` → 3.8.1) and is the official dependency of shadcn/ui chart. It has been published since 2015 with an active GitHub repository. Planner should add a `checkpoint:human-verify` before the `npx shadcn add chart` install step as a precaution.*

## Architecture Patterns

### System Architecture Diagram

```
RSC Page /admin/analityka
  │
  ├─ await searchParams  →  days: 7 | 30 | 90 (default 30)
  │
  ├─ getAnalyticsData(days)   ←── admin-order.service.ts
  │     ├─ Prisma $queryRaw: ORDER count grouped by DATE(createdAt)
  │     ├─ Prisma $queryRaw: SUM(priceSnapshot × quantity) grouped by DATE(createdAt)
  │     └─ Prisma count: CallbackRequest WHERE createdAt >= now - days
  │
  ├─ <StatCard> × 3  (totalOrders, totalRevenue, callbackCount)  [server rendered]
  │
  ├─ <PeriodSelector days={days} />  [client component — Link-based tabs]
  │
  └─ <AnalyticsCharts data={chartData} />  ["use client", recharts]
        ├─ <LineChart> — orders per day
        └─ <LineChart/AreaChart> — revenue per day


RSC Page /admin (dashboard)
  │
  ├─ getAdminDashboardStats()  [existing]
  │
  ├─ getDashboardAnalyticsPreview()  [new — fixed 30 days]  ←── admin-order.service.ts
  │
  └─ <AnalyticsDashboardPreview data={previewData} />  [inserted before «Останні замовлення»]
        ├─ Mini KPI row (orders, revenue)
        ├─ <MiniLineChart height~120px, no axes>  ["use client"]
        └─ Link «Детальна аналітика →» /admin/analityka
```

### Recommended Project Structure

```
src/
├── app/(admin)/admin/
│   ├── page.tsx                     # add getDashboardAnalyticsPreview call + preview section
│   └── analityka/
│       └── page.tsx                 # new — analytics page (RSC, reads searchParams)
│
├── components/admin/
│   ├── analytics-charts.tsx         # "use client" — full AnalyticsCharts (2 LineCharts)
│   ├── analytics-dashboard-preview.tsx  # "use client" — mini charts for dashboard
│   └── period-selector.tsx          # "use client" — tab toggle that navigates via Link
│
└── server/services/
    └── admin-order.service.ts       # add getAnalyticsData() + getDashboardAnalyticsPreview()
```

### Pattern 1: Prisma Time-Series Aggregation with $queryRaw

**What:** Group orders by calendar day using PostgreSQL `DATE_TRUNC` or `DATE()`. Fill in zero-days for complete series.

**When to use:** Whenever grouping by computed date expression — Prisma's `groupBy` cannot handle this.

**Example:**
```typescript
// Source: existing $queryRaw pattern in admin-order.service.ts (fetchOrderIdsByTotalKopiyky)
// Adapted for date bucketing
type DayRow = { day: string; count: bigint }; // $queryRaw returns BigInt for aggregates

const sinceDate = new Date();
sinceDate.setDate(sinceDate.getDate() - days);

const rows = await prisma.$queryRaw<DayRow[]>`
  SELECT DATE("createdAt") AS day, COUNT(*) AS count
  FROM "Order"
  WHERE "createdAt" >= ${sinceDate}
  GROUP BY DATE("createdAt")
  ORDER BY day ASC
`;

// BigInt → number conversion is required after $queryRaw
const parsed = rows.map(r => ({
  day: r.day.toString().slice(0, 10), // "YYYY-MM-DD"
  count: Number(r.count),
}));
```

**Revenue query:**
```typescript
type RevenueRow = { day: string; revenue: bigint };

const revenueRows = await prisma.$queryRaw<RevenueRow[]>`
  SELECT DATE(o."createdAt") AS day,
         COALESCE(SUM(oi."priceSnapshot" * oi.quantity), 0) AS revenue
  FROM "Order" o
  LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
  WHERE o."createdAt" >= ${sinceDate}
  GROUP BY DATE(o."createdAt")
  ORDER BY day ASC
`;
```

**Zero-fill helper** — recharts needs a continuous array for smooth line charts:
```typescript
function fillDays(rows: { day: string; value: number }[], days: number) {
  const result: { day: string; value: number }[] = [];
  const map = new Map(rows.map(r => [r.day, r.value]));
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ day: key, value: map.get(key) ?? 0 });
  }
  return result;
}
```

### Pattern 2: shadcn ChartContainer + LineChart (client component)

**What:** Wrap recharts in shadcn's `ChartContainer` for theme-aware colors, responsive sizing, and accessible tooltip.

**When to use:** All chart rendering — client component only.

**Example:**
```typescript
// Source: [CITED: v3.shadcn.com/docs/components/chart]
"use client"

import { Line, LineChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  count: { label: "Замовлень", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function OrdersTrendChart({ data }: { data: { day: string; count: number }[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[220px] w-full">
      <LineChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} tickMargin={8} axisLine={false}
               tickFormatter={(v: string) => v.slice(5)} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line dataKey="count" stroke="var(--color-count)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  )
}
```

**Mini chart (dashboard preview, ~120px, no axes):**
```typescript
<ChartContainer config={chartConfig} className="h-[120px] w-full">
  <LineChart data={data}>
    <Line dataKey="count" stroke="var(--color-count)" strokeWidth={2} dot={false} />
  </LineChart>
</ChartContainer>
```

### Pattern 3: Period Selector via searchParams (RSC-driven)

**What:** A "use client" tab component that navigates via `<Link href="?days=7">` — the RSC page re-fetches data server-side on navigation.

**Why plain searchParams (not nuqs):** Admin layout has no `NuqsAdapter`. Adding it is out of scope. Plain Next.js `await searchParams` (async in Next.js 15+) is the established pattern in this project for admin pages.

```typescript
// RSC page
export default async function AnalitykaPage({ searchParams }: PageProps) {
  const { days: rawDays } = await searchParams;
  const days = rawDays === "7" ? 7 : rawDays === "90" ? 90 : 30; // default 30
  const data = await getAnalyticsData(days);
  return (
    <>
      <PeriodSelector active={days} />
      <AnalyticsCharts data={data} />
    </>
  );
}

// Client component — navigate via Link (no JS-state needed)
"use client"
import Link from "next/link";
export function PeriodSelector({ active }: { active: 7 | 30 | 90 }) {
  const periods = [7, 30, 90] as const;
  return (
    <div className="flex gap-2">
      {periods.map(p => (
        <Link key={p} href={`?days=${p}`}
          className={active === p ? "font-semibold underline" : "text-muted-foreground"}>
          {p} днів
        </Link>
      ))}
    </div>
  );
}
```

### Pattern 4: Revenue Display Formatting (D-02)

```typescript
// "1 200 грн" — whole numbers, space as thousands separator
function formatRevenue(grn: number): string {
  return grn.toLocaleString("uk-UA", { maximumFractionDigits: 0 }) + " грн";
  // or manually: grn.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " грн"
}
```

Note: `toLocaleString("uk-UA")` in Node.js requires ICU data — typically available on Vercel. The manual regex is a safe fallback.

### Anti-Patterns to Avoid

- **Prisma `groupBy` for date buckets:** Cannot group by `DATE(createdAt)` expression. Use `$queryRaw`.
- **Forgetting BigInt conversion:** `$queryRaw` returns BigInt for `COUNT(*)` and `SUM()`. Always call `Number(bigint)` before passing to components.
- **Passing BigInt to JSON:** `JSON.stringify` throws on BigInt. Convert before returning from service function.
- **Chart component in RSC:** Recharts is DOM-dependent. `ChartContainer` and all chart components require `"use client"`.
- **nuqs in admin layout:** Admin layout has no `NuqsAdapter`. Do not use `useQueryState` here.
- **Missing zero-fill:** Without filling empty days, line charts have gaps or skip dates. Always generate full day array.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chart rendering | Custom SVG charts | shadcn chart (recharts) | Accessibility, responsive, theme tokens — dozens of edge cases |
| Tooltip formatting | Custom tooltip div | `<ChartTooltipContent />` | Auto-formats, handles hover state, keyboard accessible |
| CSS chart colors | Custom color variables | `var(--chart-1)` … `var(--chart-5)` | Already defined in globals.css, dark mode aware |
| BigInt → number conversion | Custom serializer | Inline `Number(bigint)` | Straightforward; don't over-engineer |

**Key insight:** The entire charting surface area is solved by recharts via shadcn. The only custom code needed is data fetching (Prisma) and layout wiring.

## Common Pitfalls

### Pitfall 1: BigInt Serialization from $queryRaw

**What goes wrong:** `COUNT(*)` and `SUM()` in `$queryRaw` return JavaScript `BigInt` values. Passing BigInt to React props or `JSON.stringify` throws a `TypeError: Do not know how to serialize a BigInt`.

**Why it happens:** PostgreSQL returns numeric aggregates as 64-bit integers; Prisma preserves this as BigInt.

**How to avoid:** In the service function, immediately map over results with `Number(row.count)` before returning the array.

**Warning signs:** `TypeError: Do not know how to serialize a BigInt` at build or runtime.

### Pitfall 2: Zero Days in Chart Data

**What goes wrong:** If no orders exist on a given day, that day has no row in the `$queryRaw` result. Recharts connects adjacent points, creating jagged skips rather than a zero line.

**Why it happens:** `GROUP BY DATE(...)` only produces rows for dates that have data.

**How to avoid:** Use the `fillDays()` zero-fill helper to generate a complete N-day array before passing to the chart component.

**Warning signs:** Charts show < N data points when the full period should have N points.

### Pitfall 3: Revenue Calculation Scope (D-01)

**What goes wrong:** Filtering by status (e.g., only COMPLETED) gives lower revenue than expected.

**Why it happens:** D-01 explicitly requires ALL orders regardless of status.

**How to avoid:** Do NOT add a `WHERE o.status = 'COMPLETED'` clause. The query covers all statuses.

**Warning signs:** Revenue total much lower than operator expects.

### Pitfall 4: Chart Component Not "use client"

**What goes wrong:** `<ChartContainer>` or any recharts component imported in a Server Component causes a hydration or render error.

**Why it happens:** Recharts uses browser DOM APIs not available in RSC.

**How to avoid:** All files containing `ChartContainer`, `LineChart`, etc. must have `"use client"` at the top. Isolate them in dedicated component files; pass serialized data as props from RSC.

**Warning signs:** `Error: This module cannot be imported from a Server Component module` or similar RSC boundary violation.

### Pitfall 5: searchParams Opting Page into Dynamic Rendering

**What goes wrong:** The analytics page uses `await searchParams` which opts it into dynamic rendering — this is correct and expected but means no static generation.

**Why it happens:** searchParams is a request-time API per Next.js docs.

**How to avoid:** Accept this — admin pages are not statically generated. No `export const dynamic = "force-dynamic"` is needed; it happens automatically.

## Code Examples

### Full getAnalyticsData service function structure

```typescript
// Source: [ASSUMED] — pattern derived from existing $queryRaw usage in admin-order.service.ts

export type DayPoint = { day: string; value: number };

export type AnalyticsData = {
  kpi: { totalOrders: number; totalRevenue: number; totalCallbacks: number };
  ordersByDay: DayPoint[];
  revenueByDay: DayPoint[];
};

export async function getAnalyticsData(days: 7 | 30 | 90): Promise<AnalyticsData> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [orderRows, revenueRows, callbackCount] = await Promise.all([
    prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT DATE("createdAt") AS day, COUNT(*) AS count
      FROM "Order"
      WHERE "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY day ASC
    `,
    prisma.$queryRaw<Array<{ day: Date; revenue: bigint }>>`
      SELECT DATE(o."createdAt") AS day,
             COALESCE(SUM(oi."priceSnapshot" * oi.quantity), 0) AS revenue
      FROM "Order" o
      LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
      WHERE o."createdAt" >= ${since}
      GROUP BY DATE(o."createdAt")
      ORDER BY day ASC
    `,
    prisma.callbackRequest.count({ where: { createdAt: { gte: since } } }),
  ]);

  const ordersByDay = fillDays(
    orderRows.map(r => ({ day: r.day.toISOString().slice(0, 10), value: Number(r.count) })),
    days,
  );
  const revenueByDay = fillDays(
    revenueRows.map(r => ({ day: r.day.toISOString().slice(0, 10), value: Number(r.revenue) })),
    days,
  );

  return {
    kpi: {
      totalOrders: ordersByDay.reduce((s, r) => s + r.value, 0),
      totalRevenue: revenueByDay.reduce((s, r) => s + r.value, 0),
      totalCallbacks: callbackCount,
    },
    ordersByDay,
    revenueByDay,
  };
}
```

### StatCard extension for revenue display

The existing `StatCard` accepts `count: number`. For revenue, create a variant or a separate `RevenueCard` that accepts a formatted string, since `StatCard.count` is typed as `number` and doesn't support string formatting:

```typescript
// Option A: Extend StatCard with optional `value?: string` override
// Option B: Inline a styled div matching StatCard pattern for the revenue card
// Recommend Option B to avoid changing the existing StatCard contract
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| chart.js / custom SVG | shadcn chart (recharts) | shadcn chart GA ~2024 | Design-system-consistent, theme-aware |
| Sync `searchParams` | Async `Promise<searchParams>` | Next.js 15 | Must `await searchParams` in RSC |
| `params` sync | `await params` | Next.js 15 | Same |

**Deprecated/outdated:**
- Sync `searchParams` in Next.js page props: deprecated in Next.js 15, still works but will be removed. Project already uses async pattern — do not revert to sync access.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `DATE("createdAt")` works in PostgreSQL for grouping (not `DATE_TRUNC`) | Code Examples | Minor — both work in PG; `DATE_TRUNC('day', ...)` is more explicit alternative |
| A2 | `$queryRaw` returns day column as JS `Date` object | Code Examples | Row mapping `.toISOString().slice(0,10)` may need `r.day.toString()` if string returned |
| A3 | `toLocaleString("uk-UA")` is available in the Vercel Node.js runtime | Common Pitfalls | Could fall back to manual regex replacement |
| A4 | recharts weekly download count is "very high" | Package Legitimacy Audit | For legitimacy assessment only — package existence and age are verified |

## Open Questions (RESOLVED)

1. **$queryRaw day column type**
   - What we know: Prisma `$queryRaw` returns Date or string for `DATE()` casts depending on the PG driver
   - What's unclear: Whether `@prisma/adapter-neon` returns `Date` or string for a `DATE` column cast
   - Recommendation: Add a guard in the service: `typeof r.day === 'string' ? r.day.slice(0,10) : r.day.toISOString().slice(0,10)`
   - RESOLVED: Plan 34-02 uses a type guard `typeof r.day === "string" ? r.day.slice(0, 10) : r.day.toISOString().slice(0, 10)` for both order and revenue rows.

2. **StatCard revenue display**
   - What we know: `StatCard.count` is typed as `number` (integer display only)
   - What's unclear: Whether to extend `StatCard` props or create a separate `RevenueCard`
   - Recommendation: Create a small `<AnalyticsKpiCard>` that accepts `label: string` + `value: string` to avoid mutating the existing shared component
   - RESOLVED: Plan 34-05 uses Option B — an inline styled div matching the StatCard visual pattern for the revenue KPI, avoiding mutation of the shared `StatCard` component.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| recharts | shadcn chart | Not yet installed | (3.8.1 on npm) | Install via `npx shadcn add chart` |
| shadcn chart | ChartContainer | Not yet installed | (shadcn ^4.7.0 is installed) | Run CLI to add |
| PostgreSQL | Prisma $queryRaw | Assumed available | — | No fallback — project requires PG |
| lucide-react BarChart2 | Nav icon | Yes (^1.16.0) | confirmed via `node -e` | — |
| Tabs (shadcn) | Period selector | Yes | installed at src/components/ui/tabs.tsx | — |

**Missing dependencies with no fallback:**
- none (recharts installs via shadcn CLI)

**Missing dependencies with fallback:**
- recharts / shadcn chart: not installed, install step is the first implementation task

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest ^4.1.6 |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run src/server/services/admin-order.service.test.ts` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AN-01 | `getAnalyticsData(days)` returns correct structure with kpi, ordersByDay, revenueByDay | unit | `npx vitest run src/server/services/admin-analytics.service.test.ts` | No — Wave 0 gap |
| AN-01 | `fillDays()` zero-fills missing calendar days correctly | unit | `npx vitest run src/server/services/admin-analytics.service.test.ts` | No — Wave 0 gap |
| AN-01 | Analytics page renders at `/admin/analityka` (smoke) | manual | admin login → navigate to /admin/analityka | — |
| AN-02 | Dashboard preview appears before «Останні замовлення» | manual | admin login → check /admin page | — |

### Sampling Rate

- **Per task commit:** `npx vitest run src/server/services/admin-analytics.service.test.ts`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/server/services/admin-analytics.service.test.ts` — covers `getAnalyticsData` shape, BigInt conversion, zero-fill, KPI totals
- [ ] No new vitest config needed — existing vitest.config.ts covers `src/**/*.test.ts`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes (admin-only page) | `requireAdmin()` in admin layout — already enforced |
| V3 Session Management | inherited | Admin layout handles session |
| V4 Access Control | yes | Admin layout `requireAdmin()` protects all `/admin/*` routes |
| V5 Input Validation | yes (days param) | Validate `searchParams.days` against allowlist `[7, 30, 90]` — raw string coercion is safe, but explicit check prevents unexpected values |
| V6 Cryptography | no | Read-only analytics |

### Known Threat Patterns for {stack}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthenticated analytics access | Information Disclosure | `requireAdmin()` in layout — already present |
| SQL injection via searchParams | Tampering | `days` param only used as integer in JS date arithmetic, NOT interpolated into SQL — safe |
| $queryRaw injection | Tampering | Only static SQL with parameterized `${sinceDate}` — safe per Prisma docs |

## Sources

### Primary (HIGH confidence)

- [VERIFIED: v3.shadcn.com/docs/components/chart] — Chart component installation, ChartContainer API, "use client" requirement, recharts dependency
- [VERIFIED: Next.js local docs `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`] — async searchParams pattern, dynamic rendering opt-in
- [VERIFIED: codebase] — admin-order.service.ts `$queryRaw` pattern, StatCard API, adminNavItems structure, globals.css `--chart-*` variables
- [VERIFIED: npm registry] — `recharts@3.8.1`, first published 2015, github.com/recharts/recharts

### Secondary (MEDIUM confidence)

- [CITED: v3.shadcn.com/docs/components/chart] — ChartConfig + ChartContainer code example for BarChart (adapted to LineChart)
- [ASSUMED] — DATE() vs DATE_TRUNC() PostgreSQL grouping syntax (both valid in PG)

### Tertiary (LOW confidence)

- None

## Project Constraints (from CLAUDE.md)

CLAUDE.md references AGENTS.md which states:

> **This is NOT the Next.js you know.** This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Verified relevant constraint: `searchParams` is async (Promise) in this Next.js version — must `await searchParams` in RSC pages. This is confirmed by local docs and matches the pattern in all existing admin pages.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — recharts/shadcn chart confirmed via official docs and npm registry
- Architecture: HIGH — all patterns derived directly from existing codebase code
- Pitfalls: HIGH — BigInt, zero-fill, RSC boundary are documented real issues
- Prisma $queryRaw syntax: MEDIUM — pattern from existing codebase; exact Date return type is ASSUMED

**Research date:** 2026-05-20
**Valid until:** 2026-06-20 (30 days — stable stack)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Revenue includes ALL orders regardless of status — formula: `SUM(OrderItem.priceSnapshot × quantity)` per order, grouped by day
- **D-02:** Revenue format: `1 200 грн` — whole numbers, space as thousands separator, no kopecks
- **D-03:** KPI summary cards: total orders, total revenue, callback count — for selected period
- **D-04:** Period selector: 7 / 30 / 90 days. Default: 30 days
- **D-05:** Period selector on `/admin/analityka` only. Dashboard preview uses fixed 30 days, no selector
- **D-06:** Analytics page layout: KPI cards → period selector → 2 charts (orders trend, revenue trend). Callback count in KPI card only (no chart)
- **D-07:** Dashboard preview: 2 compact mini-charts (orders + revenue, last 30 days) + «Детальна аналітика» link
- **D-08:** Mini-charts height ~120px
- **D-09 (Claude's discretion):** Use shadcn chart (recharts-based) — `npx shadcn@latest add chart`. No other chart library

### Claude's Discretion

- Chart library implementation details (already resolved to D-09)

### Deferred Ideas (OUT OF SCOPE)

- CSV/Excel export
- Period comparison (YoY / поточний vs попередній)
- Callback trend chart (insufficient data)
- Mobile chart touch interactions
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AN-01 | Сторінка `/admin/analityka` з продажами, виручкою, заявками на дзвінок, графіками та зведеною статистикою | `getAnalyticsData()` service function + RSC page + `AnalyticsCharts` client component |
| AN-02 | На `/admin` перед «Останні замовлення» — прев'ю аналітики (макс. 2 графіки + короткі KPI) | `getDashboardAnalyticsPreview()` + `AnalyticsDashboardPreview` component inserted in existing dashboard page |
</phase_requirements>
