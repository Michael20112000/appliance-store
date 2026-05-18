# Phase 11: Admin List Row UX - Pattern Map

**Mapped:** 2026-05-18
**Files analyzed:** 10 (create/modify for Phase 11)
**Analogs found:** 9 / 10

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/admin/clickable-table-row.ts` | utility | transform | `admin-products-table.tsx` (inline handlers → extract) | exact |
| `src/lib/admin/clickable-table-row.test.ts` | test | unit | `src/lib/admin/products-url.test.ts` | exact |
| `src/lib/admin/use-admin-clickable-row.ts` | hook | request-response | `admin-products-table.tsx` (`useRouter`) | role-match |
| `src/components/admin/admin-products-table.tsx` | component | request-response | same file (refactor only) | exact |
| `src/components/admin/orders-data-table.tsx` | component | transform | same file + `admin-products-table.tsx` row props | exact |
| `src/components/admin/admin-categories-table.tsx` | component | request-response | `kategorii/page.tsx` table + `admin-products-table.tsx` row | role-match |
| `src/components/admin/admin-recent-orders-table.tsx` | component | request-response | `admin/page.tsx` table + `admin-products-table.tsx` row | role-match |
| `src/app/(admin)/admin/kategorii/page.tsx` | route | CRUD read | `tovary/page.tsx` (RSC + client table child) | exact |
| `src/app/(admin)/admin/tovary/page.tsx` | route | CRUD read | same file (Plus on CTA only) | exact |
| `src/app/(admin)/admin/page.tsx` | route | CRUD read | same file (extract table, drop actions) | exact |

---

## Pattern Assignments

### `src/lib/admin/clickable-table-row.ts` (utility, transform)

**Analog:** `src/components/admin/admin-products-table.tsx` (canonical behavior to extract)

**Target exports** (from RESEARCH Pattern 1 — implement as pure module, no `"use client"`):

```typescript
import type { KeyboardEvent } from "react";

export const adminClickableRowClassName =
  "cursor-pointer transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none";

export function getAdminClickableRowProps({
  href,
  onNavigate,
}: {
  href: string;
  onNavigate: (href: string) => void;
}) {
  return {
    role: "link" as const,
    tabIndex: 0,
    onClick: () => onNavigate(href),
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onNavigate(href);
      }
    },
  };
}
```

**Source to extract** (lines 55-69 in `admin-products-table.tsx`):

```55:69:src/components/admin/admin-products-table.tsx
              <tr
                key={product.id}
                role="link"
                tabIndex={0}
                onClick={() => router.push(`/admin/tovary/${product.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`/admin/tovary/${product.id}`);
                  }
                }}
                className={cn(
                  "cursor-pointer border-b border-border transition-colors last:border-0",
                  "hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none",
                )}
              >
```

**Planner:** Keep `border-b border-border last:border-0` on each `<tr>` / `<TableRow>` at call site; shared module owns interaction + hover/focus tokens only (D-11-08).

---

### `src/lib/admin/clickable-table-row.test.ts` (test, unit)

**Analog:** `src/lib/admin/products-url.test.ts`

**Imports + describe structure** (lines 1-8):

```1:8:src/lib/admin/products-url.test.ts
import { describe, expect, it } from "vitest";
import { adminProductsUrl } from "./products-url";

describe("adminProductsUrl", () => {
  it("returns base path when all params are defaults", () => {
    expect(adminProductsUrl()).toBe("/admin/tovary");
    expect(adminProductsUrl({})).toBe("/admin/tovary");
  });
```

**Vitest constraints** (`vitest.config.ts` lines 10-12):

```10:12:vitest.config.ts
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "prisma/**/*.test.ts"],
```

**Test cases to implement (no DOM — mock `onNavigate`):**

| Case | Assert |
|------|--------|
| Default props | `role === "link"`, `tabIndex === 0` |
| `onClick` | `onNavigate` called with `href` |
| `onKeyDown` Enter | `onNavigate(href)` |
| `onKeyDown` Space | `preventDefault` called + `onNavigate(href)` |
| Other keys | `onNavigate` not called |

**Synthetic keyboard event** (no RTL):

```typescript
const onNavigate = vi.fn();
const props = getAdminClickableRowProps({ href: "/admin/tovary/abc", onNavigate });
props.onKeyDown({ key: " ", preventDefault: vi.fn() } as unknown as React.KeyboardEvent);
```

**Run:** `npx vitest run src/lib/admin/clickable-table-row.test.ts`

---

### `src/lib/admin/use-admin-clickable-row.ts` (hook, request-response)

**Analog:** `src/components/admin/admin-products-table.tsx` — `useRouter` wiring (lines 1-3, 27-28)

```1:3:src/components/admin/admin-products-table.tsx
"use client";

import { useRouter } from "next/navigation";
```

```27:28:src/components/admin/admin-products-table.tsx
export function AdminProductsTable({ items }: AdminProductsTableProps) {
  const router = useRouter();
```

**Target hook** (separate file so tests import pure module only):

```typescript
"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { getAdminClickableRowProps } from "./clickable-table-row";

export function useAdminClickableRow(href: string) {
  const router = useRouter();
  return useMemo(
    () =>
      getAdminClickableRowProps({
        href,
        onNavigate: (target) => router.push(target),
      }),
    [href, router],
  );
}
```

**Usage at call site:**

```typescript
const rowNav = useAdminClickableRow(`/admin/tovary/${product.id}`);
<tr {...rowNav} className={cn("border-b border-border last:border-0", adminClickableRowClassName)} />
```

---

### `src/components/admin/admin-products-table.tsx` (component, request-response)

**Analog:** same file — refactor to shared helper; **do not change UX** (D-11-07)

**Client boundary** (lines 1-8):

```1:8:src/components/admin/admin-products-table.tsx
"use client";

import { useRouter } from "next/navigation";
import { getCldImageUrl } from "next-cloudinary";
import type { ProductStatus } from "@/generated/prisma/client";
import { ProductListStatusSelect } from "@/components/admin/product-list-status-select";
import { formatPriceKopiyky } from "@/lib/catalog/format";
import { cn } from "@/lib/utils";
```

**Refactor target row** — replace inline handlers with:

```typescript
import {
  adminClickableRowClassName,
} from "@/lib/admin/clickable-table-row";
import { useAdminClickableRow } from "@/lib/admin/use-admin-clickable-row";

// inside map:
const rowNav = useAdminClickableRow(`/admin/tovary/${product.id}`);
<tr
  key={product.id}
  {...rowNav}
  className={cn("border-b border-border last:border-0", adminClickableRowClassName)}
>
```

**Nested control** — leave `ProductListStatusSelect` unchanged (D-11-12 regression guard).

---

### `src/components/admin/orders-data-table.tsx` (component, transform)

**Analog:** same file (TanStack + shadcn shell) + `admin-products-table.tsx` (row navigation)

**Client + imports** (lines 1-27):

```1:27:src/components/admin/orders-data-table.tsx
"use client";

import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
// ...
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPriceKopiyky } from "@/lib/catalog/format";
import { adminOrdersUrl } from "@/lib/admin/orders-url";
import { cn } from "@/lib/utils";
```

**Remove actions column** (lines 214-225 — delete entirely):

```214:225:src/components/admin/orders-data-table.tsx
    {
      id: "actions",
      header: () => <span className="sr-only">Дії</span>,
      cell: ({ row }) => (
        <Link
          href={`/admin/zamovlennia/${row.original.orderNumber}`}
          className="text-primary hover:underline"
        >
          Відкрити
        </Link>
      ),
    },
```

**Body row — attach shared props** (replace lines 285-292):

```285:292:src/components/admin/orders-data-table.tsx
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="border-b border-border last:border-0">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
```

**Target pattern:**

```typescript
import { useRouter } from "next/navigation";
import {
  adminClickableRowClassName,
  getAdminClickableRowProps,
} from "@/lib/admin/clickable-table-row";

// in component:
const router = useRouter();

{table.getRowModel().rows.map((row) => {
  const href = `/admin/zamovlennia/${row.original.orderNumber}`;
  const rowProps = getAdminClickableRowProps({
    href,
    onNavigate: (h) => router.push(h),
  });
  return (
    <TableRow
      key={row.id}
      {...rowProps}
      className={cn("border-b border-border last:border-0", adminClickableRowClassName)}
    >
      {/* cells unchanged */}
    </TableRow>
  );
})}
```

**Header row** — keep `hover:bg-transparent` (lines 254-257); sort links stay in header only (no row-click conflict).

**shadcn `TableRow` default hover** — override via `adminClickableRowClassName` (`ui/table.tsx` L59-61 applies `hover:bg-muted/50`; products use `muted/40`):

```55:64:src/components/ui/table.tsx
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}
```

**Phase 12 prep:** when status cell becomes interactive, add `onClick={(e) => e.stopPropagation()}` on that control (mirror `ProductListStatusSelect`).

---

### `src/components/admin/admin-categories-table.tsx` (component, request-response) — NEW

**Analog:** `src/app/(admin)/admin/kategorii/page.tsx` (markup) + `admin-products-table.tsx` (row-click)

**Table shell from page** (lines 20-51):

```20:51:src/app/(admin)/admin/kategorii/page.tsx
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-2 font-medium">Назва</th>
                <th className="px-4 py-2 font-medium">Товарів</th>
                <th className="px-4 py-2 font-medium">Порядок</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-2">{category.name}</td>
                  <td className="px-4 py-2">{category._count.products}</td>
                  <td className="px-4 py-2">{category.sortOrder}</td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/admin/kategorii/${category.id}`}
                      className="text-primary hover:underline"
                    >
                      Редагувати
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
```

**Planner fixes:** Remove empty action `<th />` and «Редагувати» `<td>`. Add `"use client"`, `useRouter`, shared row props. Href: `/admin/kategorii/${category.id}`.

**Serializable props type** (infer from `listCategoriesAdmin()`):

```typescript
export type AdminCategoryListItem = {
  id: string;
  name: string;
  sortOrder: number;
  _count: { products: number };
};

type AdminCategoriesTableProps = {
  categories: AdminCategoryListItem[];
};
```

**Row pattern** — same as products native `<tr>`:

```typescript
"use client";

import { useRouter } from "next/navigation";
import {
  adminClickableRowClassName,
  getAdminClickableRowProps,
} from "@/lib/admin/clickable-table-row";
import { cn } from "@/lib/utils";
```

---

### `src/components/admin/admin-recent-orders-table.tsx` (component, request-response) — NEW

**Analog:** `src/app/(admin)/admin/page.tsx` (recent orders block) + `admin-products-table.tsx` (row-click)

**Table + action column to remove** (lines 58-101):

```58:101:src/app/(admin)/admin/page.tsx
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
                  <th className="px-4 py-2 font-medium" scope="col">
                    Номер
                  </th>
                  ...
                  <th className="px-4 py-2 font-medium" scope="col" />
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-0"
                  >
                    ...
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={`/admin/zamovlennia/${order.orderNumber}`}
                        className="text-primary hover:underline"
                      >
                        Відкрити
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
```

**Target:** Client component; props `orders: AdminOrderSummaryDto[]` (or pick fields: `id`, `orderNumber`, `createdAt`, `status`, `totalKopiyky`). Reuse `formatDate` from page or duplicate small helper. Keep `OrderStatusBadge` import. Row href: `/admin/zamovlennia/${order.orderNumber}` (D-11-06).

**Date formatting from page** (lines 8-13):

```8:13:src/app/(admin)/admin/page.tsx
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
```

---

### `src/app/(admin)/admin/kategorii/page.tsx` (route, CRUD read)

**Analog:** `src/app/(admin)/admin/tovary/page.tsx` (RSC fetch + header CTA + client table child)

**RSC fetch** (lines 1-7):

```1:7:src/app/(admin)/admin/kategorii/page.tsx
import Link from "next/link";
import { listCategoriesAdmin } from "@/server/services/admin-catalog.service";
import { Button } from "@/components/ui/button";

export default async function AdminCategoriesPage() {
  const categories = await listCategoriesAdmin();
```

**Tovary pattern — RSC page + client table** (lines 50-93 in `tovary/page.tsx`):

```66:93:src/app/(admin)/admin/tovary/page.tsx
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Товари</h1>
        <Button render={<Link href="/admin/tovary/novyi" />}>
          Додати товар
        </Button>
      </div>
      ...
          <AdminProductsTable items={result.items} />
```

**Page changes:**

1. Plus on CTA (D-11-09) — see Plus pattern below.
2. Replace inline `<table>` with `<AdminCategoriesTable categories={categories} />`.
3. Page stays **async RSC** — no `"use client"` on page (D-11-03/04).

---

### `src/app/(admin)/admin/tovary/page.tsx` (route, CRUD read)

**Analog:** same file — CTA only; table already uses `AdminProductsTable`

**Plus on create CTA** (lines 68-72):

```68:72:src/app/(admin)/admin/tovary/page.tsx
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Товари</h1>
        <Button render={<Link href="/admin/tovary/novyi" />}>
          Додати товар
        </Button>
      </div>
```

**Add:**

```typescript
import { Plus } from "lucide-react";

<Button render={<Link href="/admin/tovary/novyi" />}>
  <Plus className="size-4" aria-hidden />
  Додати товар
</Button>
```

Button already has `gap-1.5` and default svg sizing in `buttonVariants` (`src/components/ui/button.tsx` L7, L24) — explicit `size-4` satisfies D-11-09.

---

### `src/app/(admin)/admin/page.tsx` (route, CRUD read)

**Analog:** same file — extract recent orders; optional Plus on outline CTA (D-11-11 discretion)

**RSC + stats fetch** (lines 15-16):

```15:16:src/app/(admin)/admin/page.tsx
export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();
```

**Replace inline table** with:

```typescript
import { AdminRecentOrdersTable } from "@/components/admin/admin-recent-orders-table";

<AdminRecentOrdersTable orders={stats.recentOrders} />
```

**Optional Plus** on outline create button (lines 40-43) — not a phase blocker:

```40:43:src/app/(admin)/admin/page.tsx
        <Button render={<Link href="/admin/tovary/novyi" />} size="sm" variant="outline">
          Додати товар
        </Button>
```

---

## Shared Patterns

### Canonical row-click (all four tables)

**Source:** `src/components/admin/admin-products-table.tsx` L55-69 → `getAdminClickableRowProps` + `adminClickableRowClassName`

**Apply to:** `admin-products-table.tsx`, `orders-data-table.tsx`, `admin-categories-table.tsx`, `admin-recent-orders-table.tsx`

**Contract:**

| Concern | Value |
|---------|--------|
| `role` | `"link"` |
| `tabIndex` | `0` |
| Enter / Space | `onNavigate(href)`; Space calls `preventDefault()` |
| Visual | `adminClickableRowClassName` (D-11-08) |
| Structure classes | `border-b border-border last:border-0` at call site |

---

### stopPropagation on nested controls (D-11-12)

**Source:** `src/components/admin/product-list-status-select.tsx`

```40:44:src/components/admin/product-list-status-select.tsx
        <SelectTrigger
          size="sm"
          className="w-[10.5rem]"
          onClick={(event) => event.stopPropagation()}
        >
```

```73:77:src/components/admin/product-list-status-select.tsx
      <SelectTrigger
        size="sm"
        className="w-[10.5rem]"
        onClick={(event) => event.stopPropagation()}
      >
```

**Apply to:** Any `Select`, `Button`, `Link` inside a clickable row. Phase 11: products only; Phase 12: order status control.

---

### RSC list page + client table island (D-11-03)

**Source:** `src/app/(admin)/admin/tovary/page.tsx` + `src/app/(admin)/admin/zamovlennia/page.tsx`

```50:58:src/app/(admin)/admin/zamovlennia/page.tsx
        <OrdersDataTable
          data={result.items}
          filter={params.filter}
          page={result.page}
          pageSize={params.pageSize}
          totalPages={result.totalPages}
          sort={params.sort}
          dir={params.dir}
        />
```

**Apply to:** `kategorii/page.tsx`, `admin/page.tsx` — fetch on server; pass serializable arrays to new `Admin*Table` client components.

---

### Plus icon on primary create CTAs (D-11-09)

**Decorative icon precedent:** `src/components/chat/chat-thread.tsx` L144

```144:145:src/components/chat/chat-thread.tsx
            <ArrowLeft className="mr-1 size-4" aria-hidden />
            До списку
```

**Admin CTA + Link via Button** (existing on list pages):

```12:14:src/app/(admin)/admin/kategorii/page.tsx
        <Button render={<Link href="/admin/kategorii/novyi" />}>
          Додати категорію
        </Button>
```

**Target (both kategorii + tovary):**

```typescript
import { Plus } from "lucide-react";

<Button render={<Link href="..." />}>
  <Plus className="size-4" aria-hidden />
  Додати категорію
</Button>
```

**Note:** No `Plus` usage exists in repo yet — first introduction via `lucide-react` (already in `package.json`).

---

### Admin table visual shell

**Source:** `admin-products-table.tsx` L31-32, `kategorii/page.tsx` L20

```31:32:src/components/admin/admin-products-table.tsx
    <div className="overflow-x-auto rounded-lg border border-border bg-background">
      <table className="w-full text-sm">
```

**Apply to:** New category/recent tables — keep outer wrapper consistent with existing admin lists.

---

### href construction (security)

**Source:** `orders-data-table.tsx` action link pattern (server-known ids only)

```218:219:src/components/admin/orders-data-table.tsx
        <Link
          href={`/admin/zamovlennia/${row.original.orderNumber}`}
```

**Rule:** Build row `href` only from `id` / `orderNumber` in row data — never from URL search params inside the helper.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| — | — | — | All Phase 11 files have codebase analogs |

**Note:** `use-admin-clickable-row.ts` is new but follows established `useRouter` + `"use client"` patterns; no separate hook file exists today.

---

## Metadata

**Analog search scope:** `src/lib/admin/`, `src/components/admin/`, `src/app/(admin)/admin/`, `src/components/ui/table.tsx`, `.planning/phases/08-admin-ux-chat-lifecycle/08-PATTERNS.md`
**Files scanned:** ~18
**Pattern extraction date:** 2026-05-18
