# Phase 38: Dashboard Data Completeness — Pattern Map

**Mapped:** 2026-05-21  
**Files analyzed:** 6  
**Analogs found:** 2 primary (analytics page, orders table)

---

## File Classification

| New/Modified File | Role | Closest Analog | Match Quality |
|-------------------|------|----------------|---------------|
| `src/app/(admin)/admin/page.tsx` | page (RSC) | `src/app/(admin)/admin/analityka/page.tsx` (charts section) | high — same `AnalyticsCharts` wiring |
| `src/components/admin/admin-recent-orders-table.tsx` | client table | `src/components/admin/orders-data-table.tsx` | high — column/cell parity, no sort/pagination |
| `src/server/services/admin-order.service.ts` | service | self (`take: 5` → `take: 10`) | exact |

---

## Pattern: Full charts on dashboard (38-01)

**Analog:** `src/app/(admin)/admin/analityka/page.tsx` lines 40-46

```tsx
<section className="space-y-4">
  <h2 className="text-lg font-semibold">Графіки</h2>
  <AnalyticsCharts
    ordersByDay={data.ordersByDay}
    revenueByDay={data.revenueByDay}
  />
</section>
```

**Dashboard variant** — keep link from preview UX:

```tsx
<section className="space-y-4">
  <div className="flex items-center justify-between">
    <h2 className="text-lg font-semibold">Графіки</h2>
    <Link
      href="/admin/analityka"
      className="text-sm text-muted-foreground hover:text-foreground"
    >
      Детальна аналітика →
    </Link>
  </div>
  <AnalyticsCharts
    ordersByDay={analyticsPreview.ordersByDay}
    revenueByDay={analyticsPreview.revenueByDay}
  />
</section>
```

**Imports on `admin/page.tsx`:**

```typescript
// REMOVE:
import { AnalyticsDashboardPreview } from "@/components/admin/analytics-dashboard-preview";

// ADD:
import Link from "next/link"; // if not already present
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
```

**Delete:** `src/components/admin/analytics-dashboard-preview.tsx` (orphan after swap).

---

## Pattern: Orders table parity (38-02)

**Analog:** `orders-data-table.tsx` — copy cell markup, not TanStack/sort/pagination.

| Column | Header | Cell pattern |
|--------|--------|--------------|
| orderNumber | Номер (plain `TableHead`) | `<span className="font-medium">` |
| createdAt | Дата | `text-muted-foreground` + `formatDate` |
| customer | Покупець | name + muted phone |
| deliveryType | Доставка | `deliveryLabel()` — PICKUP → «Самовивіз» |
| totalKopiyky | Сума | `tabular-nums` + `formatPriceKopiyky` |
| status | Статус | `<OrderListStatusSelect orderId status deliveryType />` |

**Wrapper (match orders page):**

```tsx
<div className="min-w-0 overflow-x-auto rounded-lg border border-border bg-background">
  <Table>...</Table>
</div>
```

**Row navigation (unchanged):**

```tsx
const href = `/admin/zamovlennia/${order.orderNumber}`;
getAdminClickableRowProps({ href, onNavigate: (t) => router.push(t) });
className={cn("border-b border-border last:border-0", adminClickableRowClassName)}
```

**Props type:**

```typescript
type AdminRecentOrdersTableProps = {
  orders: AdminOrderSummaryDto[];
};
```

**Service change:**

```typescript
prisma.order.findMany({
  take: 10,  // was 5
  orderBy: { createdAt: "desc" },
  include: { items: true },
}),
```

---

## Shared Patterns

### Auth
`requireAdmin()` in `src/app/(admin)/admin/layout.tsx` — no per-page guard.

### Data fetch
Dashboard keeps existing `Promise.all` — no new queries for 38-01; 38-02 only changes `take` inside `getAdminDashboardStats`.

### Phase 34 constraint
Client chart components import `@/lib/admin/analytics` only — do not import `admin-analytics.service` in client files.

---

## Metadata

**Pattern extraction date:** 2026-05-21
