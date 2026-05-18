# Phase 11: Admin List Row UX — Research

**Researched:** 2026-05-18  
**Domain:** Admin table row navigation, RSC/client boundaries, TanStack Table, Vitest  
**Confidence:** HIGH (patterns verified in codebase + WAI-ARIA APG + TanStack docs)

## Summary

Phase 11 unifies admin list UX: **row click opens detail**, **remove «Відкрити» / «Редагувати» columns**, **Plus icon on create CTAs**, and **shared visual/keyboard behavior** matching `admin-products-table.tsx`. The codebase already implements the canonical pattern on products (`role="link"`, `tabIndex={0}`, Enter/Space → `router.push`, `cursor-pointer`, muted hover/focus). Orders use TanStack + shadcn `TableRow` with a dedicated actions column to remove. Categories and dashboard recent orders are **plain `<table>` in RSC pages** with per-row `Link` action cells — they need row-click without promoting entire pages to client.

**Primary recommendation:** Extract a **pure, testable helper** `getAdminClickableRowProps({ href, onNavigate })` plus exported `adminClickableRowClassName` in `src/lib/admin/clickable-table-row.ts`. Add a thin **`useAdminClickableRow(href)`** client hook (optional) that wires `useRouter().push`. Do **not** ship `AdminClickableTableRow` as the primary abstraction — TanStack/shadcn need props spread onto `<TableRow>`, and a wrapper fights polymorphism. For categories/dashboard, add **small client table components** (`AdminCategoriesTable`, `AdminRecentOrdersTable`) fed by RSC props — smallest client boundary that preserves full-row keyboard parity (D-11-01, D-11-03). Reject full-row **stretched `<Link>`** as the canonical pattern: valid HTML cannot place one link over an entire `<tr>` without hacks, and keyboard semantics diverge from the products reference.

**Packages:** No new npm dependencies (Plus from existing `lucide-react`).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Unified row-click pattern (ADM-ORD-01, ADM-CAT-02, UX-02)
- **D-11-01:** **Один канонічний патерн** для всіх admin row-click таблиць цієї фази — не три різні підходи. Еталон поведінки: `src/components/admin/admin-products-table.tsx` (`role="link"`, `tabIndex={0}`, Enter/Space → navigate, `cursor-pointer`, hover/focus класи).
- **D-11-02:** Винести спільну логіку в **один shared модуль** (planner вибирає форму): напр. `lib/admin/clickable-table-row.ts` з `getAdminClickableRowProps(href)` **або** thin wrapper `AdminClickableTableRow` — мета: orders/categories/dashboard/products **не дублюють** розбіжні handler-и.
- **D-11-03:** **Мінімум client JS по всьому проєкту** (глобальний принцип оператора). Де page вже RSC — не робити всю сторінку client; найменша межа client (лише таблиця/рядок) або **server-friendly** навігація без `useRouter`, якщо еквівалентна за a11y.
- **D-11-04:** **Категорії** (`/admin/kategorii`): row → `/admin/kategorii/[id]`; прибрати колонку/лінк «Редагувати». Planner: пріоритет **мінімального client** (напр. client лише для `<tbody>` або stretched-link патерн) — не client-ити всю page без потреби.
- **D-11-05:** **Замовлення** (`orders-data-table.tsx`): прибрати колонку `actions` / «Відкрити»; row → `/admin/zamovlennia/[orderNumber]`. Таблиця вже client — row-click тут ок.
- **D-11-06:** **Dashboard** (`/admin` recent orders): теж **без «Відкрити»**, row-click на той самий detail URL — консистентність з основною таблицею замовлень.
- **D-11-07:** **Товари** — існуючий row-click **зберегти**; підключити до shared патерну (refactor props/classes, не змінювати UX).
- **D-11-08:** Візуальні стани рядка — **ті самі класи** що в `admin-products-table.tsx`: `hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none` (+ `cursor-pointer`, `transition-colors`).

#### Plus on create CTAs (ADM-CAT-01, ADM-PRD-01)
- **D-11-09:** `lucide-react` **`Plus`**, **`className="size-4"`**, **зліва від тексту** на:
  - `/admin/kategorii` — «Додати категорію»
  - `/admin/tovary` — «Додати товар»
- **D-11-10:** **Той самий `Button` variant/size** що зараз (default primary на list pages) — лише додати іконку, не міняти hierarchy.
- **D-11-11:** Dashboard outline «Додати товар» — **Plus не обовʼязковий** у success criteria; planner **may** додати для симетрії, але не блокер фази.

#### Interactive cells inside rows
- **D-11-12:** **Будь-який інтерактивний control у комірці рядка** (`Select`, `Button`, `Link`, майбутній status picker) — **`stopPropagation` на pointer events** (як `ProductListStatusSelect`). Зафіксувати як **обовʼязкове правило** для цієї фази і Phase 12.
- **D-11-13:** На orders у Phase 11 статус лишається **read-only badge** (inline edit — Phase 12); row-click не конфліктує.

#### Verification
- **D-11-14:** Vitest за наявністю — smoke на shared row props/helper (якщо винесено); інакше component test на один table.
- **D-11-15:** Manual: orders/categories/dashboard row відкриває detail; Plus видно на create CTA; Tab+Enter на рядку працює; клік по status Select на товарах **не** навігує.

### Claude's Discretion
- Точна форма shared модуля (helper vs component).
- Реалізація categories/dashboard з найменшим client boundary.
- Чи додати Plus на dashboard «Додати товар» (D-11-11).

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADM-ORD-01 | Row click opens order on `/admin/zamovlennia`; remove «Відкрити» | Remove `actions` column in `orders-data-table.tsx`; spread `getAdminClickableRowProps` on `TableRow` with `/admin/zamovlennia/${orderNumber}` |
| ADM-CAT-01 | «Додати категорію» has Plus icon | `Plus` + `size-4` in `kategorii/page.tsx` Button (existing `lucide-react`) |
| ADM-CAT-02 | Row click opens category edit; remove «Редагувати» | Client `AdminCategoriesTable` + shared row props; drop action column |
| ADM-PRD-01 | «Додати товар» has Plus icon | Same pattern on `tovary/page.tsx` |
| UX-02 | Clickable rows: `cursor-pointer` + keyboard access | Shared `adminClickableRowClassName` + `role="link"` / Enter+Space via helper |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Row click navigation (products/orders) | Frontend client (table components) | — | `router.push` + keyboard handlers require client; pages stay RSC |
| Row click navigation (categories/dashboard) | Frontend client (thin table only) | Frontend Server (RSC page fetch) | Page fetches data; smallest client island renders clickable `<tr>` |
| Shared row a11y/class contract | `src/lib/admin/` (pure TS) | Client hook wrapper | Testable constants + props factory; no UI framework in pure module |
| Plus on create CTAs | Frontend Server (RSC pages) | — | Static markup in server components |
| `stopPropagation` on nested controls | Frontend client (cell widgets) | — | `ProductListStatusSelect` already; document for Phase 12 |
| Order list URL/filter state | Frontend Server + URL | — | Unchanged `adminOrdersUrl`; sort headers stay `Link` in header row |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **next** | 16.2.6 (project) | App Router, `Link`, RSC | Already used; list pages are RSC + client islands |
| **react** | 19.2.4 | Client tables | Required for `useRouter` row navigation |
| **@tanstack/react-table** | 8.21.3 | Orders data table | Already integrated; row handlers attach to `<TableRow>` |
| **lucide-react** | ^1.16.0 | `Plus` icon on CTAs | Locked in D-11-09; already in project |
| **vitest** | 4.1.6 | Unit tests for helper | Existing `src/lib/admin/*.test.ts` pattern |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **shadcn Table** (`src/components/ui/table.tsx`) | project | Orders table primitives | `TableRow` / `TableCell` in `orders-data-table.tsx` |
| **sonner** | 2.0.7 | Toasts | Unchanged; status select on products only |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `getAdminClickableRowProps` helper | `AdminClickableTableRow` component | Wrapper awkward for TanStack `TableRow` and native `<tr>`; spreading props is simpler |
| Client table island | Stretched `<Link>` in RSC | No valid full-row link in HTML table without divergent a11y; doesn't match D-11-01 |
| `useRouter` in every table | `<Link href>` per row in each cell | Duplicate focus targets, poor UX, violates single row-click pattern |

**Installation:** None — no new packages.

## Package Legitimacy Audit

> Phase installs **zero** new packages. Existing `lucide-react` is already a project dependency.

| Package | Registry | slopcheck | Disposition |
|---------|----------|-----------|-------------|
| *(none new)* | — | — | N/A |

**Packages removed due to slopcheck [SLOP] verdict:** none  
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ RSC Admin Page (kategorii | tovary | admin dashboard | zamovlennia) │
│  • requireAdmin / fetch services                                   │
│  • Plus CTA on server (categories, products)                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │ serializable props (items, orders, categories)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Client table island (products | orders | categories | recent)    │
│  useAdminClickableRow(href) ──► getAdminClickableRowProps()       │
│  • role="link" tabIndex=0 Enter/Space ──► router.push(href)      │
│  • adminClickableRowClassName on <tr> or <TableRow>                │
│  • nested Select: stopPropagation on trigger (products only)       │
└───────────────────────────┬─────────────────────────────────────┘
                            │ user gesture
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Next.js client navigation → detail route                           │
│  /admin/tovary/[id] | /admin/kategorii/[id]                      │
│  /admin/zamovlennia/[orderNumber]                                │
└─────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure

```
src/lib/admin/
  clickable-table-row.ts          # adminClickableRowClassName, getAdminClickableRowProps
  clickable-table-row.test.ts     # Vitest smoke (D-11-14)
  use-admin-clickable-row.ts      # "use client" — useAdminClickableRow(href)

src/components/admin/
  admin-products-table.tsx        # refactor to shared helper
  orders-data-table.tsx           # remove actions col; row props on TableRow
  admin-categories-table.tsx        # NEW thin client — categories rows
  admin-recent-orders-table.tsx     # NEW thin client — dashboard block

src/app/(admin)/admin/
  kategorii/page.tsx              # RSC: fetch + Plus CTA + <AdminCategoriesTable />
  tovary/page.tsx                 # RSC: Plus on Button; still <AdminProductsTable />
  page.tsx                        # RSC: <AdminRecentOrdersTable orders={...} />
```

### Pattern 1: Shared helper (RECOMMENDED over component)

**What:** Pure module exports class string + props factory; client hook optional.

**Why helper wins (D-11-02 discretion):**

| Criterion | `getAdminClickableRowProps` | `AdminClickableTableRow` |
|-----------|----------------------------|---------------------------|
| TanStack `TableRow` | Spread `{...props}` + `className={cn(...)}` | Must forward refs/polymorphic `as` |
| Native `<tr>` in products | Direct spread | Extra wrapper element |
| Vitest | Test factory without DOM | Needs RTL / jsdom |
| Duplication | One implementation | Risk second path for classNames |

**Canonical source today** (`admin-products-table.tsx`):

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

**Target shared module** (planner implements):

```typescript
// src/lib/admin/clickable-table-row.ts
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

```typescript
// src/lib/admin/use-admin-clickable-row.ts
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

**Products refactor** (behavior unchanged):

```typescript
const rowNav = useAdminClickableRow(`/admin/tovary/${product.id}`);
return (
  <tr
    key={product.id}
    {...rowNav}
    className={cn(
      "border-b border-border last:border-0",
      adminClickableRowClassName,
    )}
  >
```

**When to use:** All four tables in phase scope.

### Pattern 2: Categories — minimal client boundary (RSC preserved)

**What:** Keep `AdminCategoriesPage` as async RSC; extract **only** the data table to `AdminCategoriesTable` client component.

**Rejected for canonical pattern:** Stretched `<Link className="absolute inset-0">` inside first `<td>` — link positions relative to cell, not full row; multiple cells break “row click”; keyboard focus differs from `role="link"` on `<tr>` (D-11-01).

**Recommended:**

```typescript
// admin-categories-table.tsx
"use client";

export function AdminCategoriesTable({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  return (
    <table className="w-full text-sm">
      <thead>...</thead>
      <tbody>
        {categories.map((category) => {
          const href = `/admin/kategorii/${category.id}`;
          const rowProps = getAdminClickableRowProps({
            href,
            onNavigate: (h) => router.push(h),
          });
          return (
            <tr
              key={category.id}
              {...rowProps}
              className={cn(
                "border-b border-border last:border-0",
                adminClickableRowClassName,
              )}
            >
              <td className="px-4 py-2">{category.name}</td>
              ...
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
```

**Page stays RSC:**

```typescript
// kategorii/page.tsx — remove action column header/cell; add Plus to Button
<Button render={<Link href="/admin/kategorii/novyi" />}>
  <Plus className="size-4" aria-hidden />
  Додати категорію
</Button>
<AdminCategoriesTable categories={categories} />
```

**Client JS footprint:** One small table component vs entire page — satisfies D-11-03/D-11-04.

### Pattern 3: TanStack Table row navigation (orders)

**What:** Delete `actions` column (L214–225); attach shared props to each body `TableRow`.

**Implementation:**

```typescript
const router = useRouter();

// inside columns: remove { id: "actions", ... } entirely

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
      className={cn(
        "border-b border-border last:border-0",
        adminClickableRowClassName,
      )}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className="px-4 py-2">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
})}
```

**TanStack note:** Official row `onClick` examples target selection (`row.getToggleSelectedHandler()`), not navigation [CITED: TanStack Table row selection guide]. Navigation is **app-level** — attach handlers on `TableRow` as above [VERIFIED: project `orders-data-table.tsx` + TanStack flexRender pattern].

**Pitfall — shadcn `TableRow` default hover:** `table.tsx` applies `hover:bg-muted/50`. Override with shared classes (D-11-08) via `cn()` so visual parity with products.

**Pitfall — header sort links:** Sort controls live in **header** `TableRow`, not body — no bubble conflict with body row `onClick`. No change needed for Phase 11.

**Phase 12 prep:** When status becomes interactive, wrap badge control with `onClick={(e) => e.stopPropagation()}` like `ProductListStatusSelect`.

### Pattern 4: Dashboard recent orders

**What:** Extract `AdminRecentOrdersTable` client component; same href as orders list: `/admin/zamovlennia/${order.orderNumber}`.

**RSC page** passes `stats.recentOrders` (already fetched in `getAdminDashboardStats()`).

Remove empty header `<th />` and action `<td>` with «Відкрити» (L74–75, L93–100 in `admin/page.tsx`).

**Plus on dashboard CTA (D-11-11 discretion):** Optional symmetry — not a phase blocker.

### Pattern 5: Plus on create CTAs

```typescript
import { Plus } from "lucide-react";

<Button render={<Link href="/admin/tovary/novyi" />}>
  <Plus className="size-4" aria-hidden />
  Додати товар
</Button>
```

Use flex gap via Button children (project default Button layout). Keep variant/size unchanged (D-11-10).

### Pattern 6: stopPropagation on nested controls (D-11-12)

**Existing reference:**

```40:44:src/components/admin/product-list-status-select.tsx
        <SelectTrigger
          size="sm"
          className="w-[10.5rem]"
          onClick={(event) => event.stopPropagation()}
        >
```

**Rule:** Any future inline control in a clickable row MUST stop pointer propagation on the interactive element (Phase 12 order status).

### Anti-Patterns to Avoid

- **Three different row-click implementations** — violates D-11-01/D-11-02.
- **Clientifying entire RSC pages** for categories/dashboard when only `<tbody>` needs interactivity.
- **`<Link>` action column + row click** — duplicate navigation affordances (explicitly removed this phase).
- **Forgetting `event.preventDefault()` on Space** — page scroll instead of navigate (products already preventDefault).
- **Omitting `stopPropagation` on embedded Selects** — row navigates while changing status (products regression).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Keyboard-accessible “fake link” row | Custom focus ring / keymap from scratch | WAI-ARIA `role="link"` + `tabIndex={0}` + Enter | APG documents required keys [CITED: W3C APG Link pattern] |
| Row className drift | Copy-paste hover classes per table | `adminClickableRowClassName` | D-11-08 single source |
| Full-table client for RSC pages | `"use client"` on `page.tsx` | Thin `Admin*Table` client child | D-11-03 |
| TanStack row selection API for navigation | `getToggleSelectedHandler()` | `getAdminClickableRowProps` + `router.push` | Selection API is wrong semantic (TanStack docs) |
| New icon library | Custom SVG component | `lucide-react` `Plus` | D-11-09, already installed |

**Key insight:** The “hard part” is consistent a11y + nested control isolation, not navigation itself — centralize once, test once.

## Common Pitfalls

### Pitfall 1: Sort link vs row click (orders)

**What goes wrong:** N/A for Phase 11 body rows (sort links only in header).  
**Why it happens:** Future inline links in cells could bubble to row `onClick`.  
**How to avoid:** `stopPropagation` on any cell-level `Link`/`Button` (D-11-12).  
**Warning signs:** Clicking control navigates to detail unexpectedly.

### Pitfall 2: shadcn TableRow hover overrides products tokens

**What goes wrong:** Rows show `hover:bg-muted/50` instead of `muted/40`.  
**Why it happens:** Default `TableRow` classes in `ui/table.tsx` L60.  
**How to avoid:** Pass `adminClickableRowClassName` via `cn()` on orders rows.  
**Warning signs:** Visual mismatch between products and orders tables.

### Pitfall 3: Vitest environment vs keyboard handlers

**What goes wrong:** Tests fail if expecting RTL without config.  
**Why it happens:** `vitest.config.ts` uses `environment: "node"`, includes only `*.test.ts`.  
**How to avoid:** Unit-test `getAdminClickableRowProps` with synthetic `KeyboardEvent` and mock `onNavigate` — no DOM.  
**Warning signs:** Planner adds `*.test.tsx` without updating vitest `include` / `environment`.

### Pitfall 4: Stretched link “server-first” trap

**What goes wrong:** Planner chooses RSC stretched link for categories to avoid client; full-row click/a11y diverges.  
**Why it happens:** Misread D-11-04 as “zero client” rather than “minimal client”.  
**How to avoid:** Thin client table component (~30–50 lines).  
**Warning signs:** No `role="link"` on row; Tab focuses only first cell overlay.

### Pitfall 5: Regression on product status select

**What goes wrong:** Refactor removes `stopPropagation`; row navigates on status change.  
**How to avoid:** Manual check D-11-15; keep `ProductListStatusSelect` untouched except re-export rule comment.  
**Warning signs:** E2E/manual: opening select also navigates.

## Code Examples

### getAdminClickableRowProps usage on native `<tr>`

```typescript
// Source: derived from admin-products-table.tsx + W3C APG role=link
const props = getAdminClickableRowProps({
  href: `/admin/kategorii/${id}`,
  onNavigate: router.push,
});
<tr {...props} className={cn("border-b border-border last:border-0", adminClickableRowClassName)} />
```

### Orders: remove actions column

```typescript
// Source: orders-data-table.tsx — DELETE this column def:
{
  id: "actions",
  header: () => <span className="sr-only">Дії</span>,
  cell: ({ row }) => (
    <Link href={`/admin/zamovlennia/${row.original.orderNumber}`}>Відкрити</Link>
  ),
},
```

### Plus CTA

```typescript
// Source: D-11-09 + existing Button/Link pattern on list pages
<Button render={<Link href="/admin/kategorii/novyi" />}>
  <Plus className="size-4" aria-hidden />
  Додати категорію
</Button>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Per-table «Відкрити» / «Редагувати» links | Row click + shared helper | Phase 11 | Fewer columns, faster admin workflow |
| Inline row handlers copy-pasted | `lib/admin/clickable-table-row.ts` | Phase 11 | One a11y contract |
| Optional Plus on dashboard CTA | Still optional | D-11-11 | No blocker |

**Deprecated/outdated:**
- Separate action columns on admin lists (this phase removes them; Phase 12 adds inline controls instead).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `useMemo` in `useAdminClickableRow` is acceptable | Pattern 1 | Low — could inline hook without memo |
| A2 | `aria-hidden` on decorative Plus is correct | Pattern 5 | Low — button text already labels control |
| A3 | Header sort `Link`s never appear in body rows | Pitfall 1 | Low — verified in `orders-data-table.tsx` structure |

**If empty of unverified claims:** A1–A3 are low-risk implementation details; no user confirmation required.

## Open Questions

1. **Single file vs hook file for client wrapper**  
   - What we know: Pure helper must stay testable without `"use client"`.  
   - What's unclear: Whether team prefers `use-admin-clickable-row.ts` separate or colocated.  
   - Recommendation: Separate file — keeps `clickable-table-row.test.ts` importing pure module only.

2. **Dashboard Plus icon (D-11-11)**  
   - Recommendation: Skip in MVP tasks; add in polish task if time.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vitest, Next | ✓ | v24.14.0 | — |
| npm | scripts | ✓ | 11.9.0 | — |
| vitest | D-11-14 | ✓ | 4.1.6 | — |
| next dev | Manual D-11-15 | ✓ (user terminal) | 16.2.6 | — |

**Missing dependencies with no fallback:** none

**Note:** `npm test` currently reports 2 failed files (pre-existing, unrelated to Phase 11). New tests should pass in isolation: `npx vitest run src/lib/admin/clickable-table-row.test.ts`.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/lib/admin/clickable-table-row.test.ts` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UX-02 / D-11-14 | Helper exposes `role="link"`, `tabIndex=0` | unit | `npx vitest run src/lib/admin/clickable-table-row.test.ts` | ❌ Wave 0 |
| UX-02 / D-11-14 | Enter/Space calls `onNavigate(href)` | unit | same | ❌ Wave 0 |
| UX-02 / D-11-14 | Space calls `preventDefault` | unit | same | ❌ Wave 0 |
| ADM-ORD-01 | Row opens order detail | manual | D-11-15 checklist | — |
| ADM-CAT-02 | Row opens category edit | manual | D-11-15 checklist | — |
| ADM-CAT-01 / ADM-PRD-01 | Plus visible on CTAs | manual | D-11-15 checklist | — |
| ADM-PRD-01 (regression) | Status select doesn't navigate | manual | D-11-15 checklist | — |

### Sampling Rate

- **Per task commit:** `npx vitest run src/lib/admin/clickable-table-row.test.ts`
- **Per wave merge:** `npm test` (fix or exclude unrelated failures if blocking)
- **Phase gate:** Manual D-11-15 + helper tests green

### Wave 0 Gaps

- [ ] `src/lib/admin/clickable-table-row.ts` — pure helper + `adminClickableRowClassName`
- [ ] `src/lib/admin/clickable-table-row.test.ts` — keyboard + role smoke tests
- [ ] `src/lib/admin/use-admin-clickable-row.ts` — optional client hook
- [ ] `src/components/admin/admin-categories-table.tsx` — client categories table
- [ ] `src/components/admin/admin-recent-orders-table.tsx` — client dashboard table

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | no (layout unchanged) | `requireAdmin()` on admin layout |
| V3 Session Management | no | Better Auth session |
| V4 Access Control | no new surfaces | Detail routes already admin-gated |
| V5 Input Validation | no | No new user input |
| V6 Cryptography | no | — |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Open redirect via `href` | Spoofing | Only construct hrefs from server-known ids/orderNumbers — never from query params in row helper |
| XSS in row labels | Tampering | React text escaping (unchanged) |
| Clickjacking nested controls | Elevation | `stopPropagation` on nested interactive elements (D-11-12) |

## Project Constraints (from .cursor/rules/)

- **Stack:** Next.js 16 App Router, TypeScript, Prisma, Tailwind, shadcn/ui — no new frameworks.
- **Locale:** UI Ukrainian only.
- **Testing:** Vitest for unit; Playwright for e2e — prefer `src/lib/admin/*.test.ts` pattern for pure helpers.
- **Next.js:** Read `node_modules/next/dist/docs/` before API changes (AGENTS.md).
- **Admin auth:** `requireAdmin()` on layout; do not skip on new components.

## Sources

### Primary (HIGH confidence)

- `src/components/admin/admin-products-table.tsx` — canonical row-click
- `src/components/admin/product-list-status-select.tsx` — stopPropagation
- `src/components/admin/orders-data-table.tsx` — TanStack + actions column to remove
- `src/app/(admin)/admin/kategorii/page.tsx`, `page.tsx`, `tovary/page.tsx` — integration targets
- [W3C WAI-ARIA APG Link pattern](https://www.w3.org/WAI/ARIA/apg/patterns/link/) — `role="link"`, `tabIndex`, Enter activation
- [TanStack Table row selection / row onClick](https://github.com/tanstack/table/blob/main/docs/guide/row-selection.md) — attach handlers on `<tr>` / `TableRow`

### Secondary (MEDIUM confidence)

- `.planning/phases/08-admin-ux-chat-lifecycle/08-PATTERNS.md` — RSC + client table split
- `src/lib/admin/products-url.test.ts` — Vitest style for admin lib modules
- `vitest.config.ts` — node environment, `*.test.ts` only

### Tertiary (LOW confidence)

- None material

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — no new deps; verified in `package.json`
- Architecture: **HIGH** — codebase inspection + locked CONTEXT
- Pitfalls: **HIGH** — concrete file/line references

**Research date:** 2026-05-18  
**Valid until:** 2026-06-18 (stable UI patterns)
