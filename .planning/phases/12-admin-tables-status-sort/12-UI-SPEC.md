---
phase: 12
slug: admin-tables-status-sort
status: draft
shadcn_initialized: true
preset: "base-nova · base: neutral · cssVariables · Tailwind v4 · geist (extends Phase 11)"
created: 2026-05-18
locale: uk
extends: 11-UI-SPEC.md
---

# Phase 12 — UI Design Contract (Admin Tables — Status & Sort)

> Inline зміна статусу замовлення в таблиці `/admin/zamovlennia` та **серверне** сортування таблиці `/admin/tovary` через URL (`sort` / `dir`), візуально як orders `SortableHeader`. **Розширює** Phase 11 — токени, spacing, typography, 60/30/10 **без змін**. Джерела: `ROADMAP.md` Phase 12, `REQUIREMENTS.md` ADM-ORD-02 / ADM-PRD-02, `11-UI-SPEC.md`, код: `order-list-status-select.tsx`, `orders-data-table.tsx`, `admin-products-table.tsx`, `orders-url.ts`, `products-url.ts`.

**Codebase reality (verified):** `OrderListStatusSelect` вже підключений у `orders-data-table.tsx` (forward з Phase 11 UAT). Основна UI-робота фази — **sort headers + URL wiring** для `AdminProductsTable`; orders — **верифікація** існуючої поведінки + тести.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (ініціалізовано) |
| Preset | `base-nova`, base `neutral`, `cssVariables: true`, Tailwind v4, font **Geist** |
| Component library | Base UI (via shadcn `base-nova`) |
| Icon library | `lucide-react` — `ArrowUpIcon`, `ArrowDownIcon`, `ArrowUpDownIcon` на sort headers (як orders) |
| Font | Geist Sans — без змін |
| Styling | Tailwind v4 + `src/app/globals.css` |
| Theme modes | **Light only** (admin) |
| Document | `<html lang="uk">` |

**Phase 12 shadcn add:** **none** — reuse `select`, `alert-dialog`, `table` (orders only).

**Не змінювати** OKLCH токени в `:root` / `@theme`.

---

## Spacing Scale

**Успадковано з Phase 11** — див. `11-UI-SPEC.md`.

| Token | Value | Phase 12 usage |
|-------|-------|----------------|
| xs | 4px | Gap між label і sort icon у header (`gap-1` = 4px) |
| sm | 8px | Sort header `inline-flex items-center gap-1` |
| md | 16px | Table wrapper `space-y-4` (orders pattern) |
| lg | 24px | — |
| xl | 32px | — |

**Exceptions (Phase 12):**

| Exception | Value | Usage |
|-----------|-------|-------|
| Order status Select | `size="sm"`, `w-[11rem]` | `OrderListStatusSelect` — **без змін** |
| Product status Select | `size="sm"`, `w-[10.5rem]` | `ProductListStatusSelect` — **без змін** |
| Sort icon | `size-3.5` (14px) | Lucide icons у header link |
| Products table cell | `px-3 py-2` | Plain `<table>` — **без змін** |
| Orders table cell | `px-4 py-2` | shadcn `Table` — **без змін** |

**Touch target:** `SelectTrigger` `size="sm"` — мінімум ~36px висота; row-click не перекриває control завдяки `stopPropagation`.

---

## Typography

**Успадковано** — 4 розміри, 2 ваги (400, 600).

| Role | Size | Weight | Line height | Phase 12 usage |
|------|------|--------|-------------|----------------|
| Body | 16px | 400 | 1.5 | Toast copy |
| Label | 14px | 600 | 1.4 | Table headers `font-medium`; product title у cell `font-medium` |
| Heading | 20px / 24px | 600 | 1.2 | Page H1 `text-2xl` — без змін |
| Display | 28px | 600 | 1.15 | — |

**Sortable headers:** `text-sm font-medium text-muted-foreground` на `<th>` / `TableHead`; **active** column — link text `text-foreground` (через `hover:text-foreground` + active icon, як orders).

**Table body:** `text-sm` (14px) — без змін.

---

## Color

**Успадковано** з Phase 11.

| Role | Token | Phase 12 usage |
|------|-------|----------------|
| Dominant (60%) | `--background` | Table `bg-background` |
| Secondary (30%) | `--muted`, `--card` | Header row `bg-muted/50`, row hover `bg-muted/40` |
| Accent (10%) | `--primary` | **Не** на sort links; лише destructive confirm «Так, скасувати» |
| Destructive | `--destructive` | `AlertDialogAction variant="destructive"` для скасування замовлення |

**Accent reserved for (Phase 12):**

1. Destructive confirm button при скасуванні замовлення
2. (Успадковано) Create CTA на `/admin/tovary` — поза scope змін

**НЕ accent:** sort header `Link` (text emphasis only), `SelectTrigger`, inactive sort icon `opacity-50`.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | — (фаза не додає CTA) |
| Order status success toast | **«Статус оновлено»** |
| Order status errors | **«Недопустима зміна статусу для цього замовлення.»** / **«Замовлення не знайдено.»** / **«Не вдалося оновити статус. Спробуйте ще раз.»** |
| Cancel order dialog title | **«Скасувати замовлення?»** |
| Cancel order dialog body | **«Товари повернуться в наявність.»** |
| Cancel confirm | **«Так, скасувати»** |
| Cancel dismiss | **«Ні»** |
| Select current option suffix | **«(поточний)»** на поточному статусі в dropdown |
| Products empty state | **«Товарів не знайдено. Створіть перший товар або змініть фільтри.»** (без змін) |
| Product status errors | **«Статус «Продано» змінюється лише через замовлення.»** / **«Товар не знайдено.»** / **«Не вдалося оновити статус. Спробуйте ще раз.»** (products select — без змін) |

**Table headers (UA):**

| Surface | Headers |
|---------|---------|
| Orders | Номер, Дата, Покупець, Доставка, Сума, Статус — sort на Номер, Дата, Сума, Статус |
| Products | Фото (не sort), **Назва**, **Категорія**, **Ціна**, **Статус** — sort на останні чотири |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | — (reuse `select`, `alert-dialog`) | not required |
| Third-party | **none** | — |

`registries: {}` — vetting third-party **не потрібен**.

---

## Business Rules (UI-facing)

| Rule | Spec |
|------|------|
| ADM-ORD-02 | Статус замовлення змінюється через shadcn `Select` у комірці; лише дозволені переходи (`getAllowedNextStatuses`) |
| Order terminal states | `COMPLETED`, `CANCELLED` — Select **disabled**, без dropdown опцій |
| Order cancel | Вибір `CANCELLED` → `AlertDialog` перед збереженням |
| Row navigation | Клік / keyboard на рядок orders → detail; **Select** не тригерить navigation (`stopPropagation` на `onClick` + `onPointerDown`) |
| ADM-PRD-02 | Сортування products **server-side** через query `sort` + `dir`; UI pattern = orders |
| Sort toggle | Клік активної колонки → flip `asc` ↔ `desc`; клік іншої → `sort=column`, `dir=desc` (як `nextSortDir` у orders) |
| Sort resets page | При зміні sort — `page=1` у URL (як orders `SortableHeader`) |
| Preserve filters | `status`, `categoryId`, `q`, `pageSize` зберігаються в `adminProductsUrl` при sort |
| Default product sort | Без query params: **`updatedAt` desc** (поточна поведінка backend) — **не** показувати колонку «Оновлено» |
| Photo column | **Не sortable** — лише превʼю |
| Brand subline | Під назвою в комірці «Назва» — сортування по **`title`**, не окрема колонка brand |
| Products status cell | `ProductListStatusSelect` + `stopPropagation` — **без змін** (Phase 11) |
| Orders status column | Одночасно **sortable header** + **inline Select** — header у `<thead>`, select у `<tbody>`; конфлікту немає |

---

## Routing & URL Contract

### Orders (`adminOrdersUrl`) — без змін API

| Param | Values | Default |
|-------|--------|---------|
| `sort` | `orderNumber`, `createdAt`, `totalKopiyky`, `status` | `createdAt` |
| `dir` | `asc`, `desc` | `desc` |

Reference: `src/lib/admin/orders-url.ts`, `src/server/validators/admin-order.ts`.

### Products (`adminProductsUrl`) — **розширити**

| Param | Values | Default (omit from URL) |
|-------|--------|-------------------------|
| `sort` | `title`, `category`, `price`, `status` | `updatedAt` *(backend only — не в enum URL)* |
| `dir` | `asc`, `desc` | `desc` |

**Prisma `orderBy` mapping (executor):**

| `sort` | `orderBy` |
|--------|-----------|
| `title` | `{ title: dir }` |
| `category` | `{ category: { name: dir } }` |
| `price` | `{ price: dir }` |
| `status` | `{ status: dir }` |
| *(default)* | `{ updatedAt: "desc" }` |

**Validator:** `adminProductListSortSchema` + `adminProductListDirSchema` у `admin-product.ts`; `listAdminProductsSchema` — додати `sort` / `dir`.

**Propagation:** оновити `adminProductsUrl`, `ProductsListPagination`, `ProductListFilters`, `tovary/page.tsx` `searchParams`, `listAdminProducts` service.

---

## Component Inventory (Phase 12)

### Reused (no new shadcn)

| Component | Usage |
|-----------|--------|
| `OrderListStatusSelect` | Orders status cell — **існує**, verify only |
| `ProductListStatusSelect` | Products status — без змін |
| `Select`, `AlertDialog` | Order status + cancel confirm |
| `orders-data-table.tsx` | Canonical `SortableHeader` + `getAriaSort` |
| `admin-products-table.tsx` | Target for sort headers |

### New / delta (recommended)

| Artifact | Path | Responsibility |
|----------|------|----------------|
| `AdminSortableTableHeader` *(optional extract)* | `src/components/admin/admin-sortable-table-header.tsx` | Shared `Link` + icons + `nextSortDir` для orders і products |
| `products-url.test.ts` | extend | Smoke `sort` / `dir` query building |
| `admin-product.ts` tests | extend | Schema accepts sort keys |

**Executor discretion:** дублювати `SortableHeader` inline в `admin-products-table.tsx` **або** винести shared — візуал **має збігатися** з orders.

---

## Component Specs

### `OrderListStatusSelect` (ADM-ORD-02) — verify existing

**Path:** `src/components/admin/order-list-status-select.tsx`  
**Wired in:** `orders-data-table.tsx` status column cell.

| Property | Spec |
|----------|------|
| Control | shadcn `Select`, `SelectTrigger size="sm"`, `className="w-[11rem]"` |
| Row isolation | `onClick` + `onPointerDown` → `event.stopPropagation()` |
| Options | Поточний + `getAllowedNextStatuses(status)` без дубліката поточного в actionable list |
| Disabled | `options.length === 0` (terminal status) — disabled Select, label поточного статусу |
| Pending | `disabled={pending}` на Select під час `useTransition` |
| Cancel flow | `CANCELLED` → `AlertDialog` → confirm → `updateOrderStatusAction` |
| Success | `toast.success("Статус оновлено")` + `router.refresh()` |
| Labels | `ORDER_STATUS_LABELS_UA` |

**Prescriptive markup (trigger):**

```tsx
<SelectTrigger
  size="sm"
  className="w-[11rem]"
  onClick={stopRowNav}
  onPointerDown={stopRowNav}
>
```

**Не повертати** read-only `OrderStatusBadge` у list — Select **є** control.

---

### Sortable table header — visual spec (orders = canonical)

**Reference:** `SortableHeader` in `orders-data-table.tsx` lines 92–125.

| Property | Spec |
|----------|------|
| Element | `next/link` `Link` |
| Layout | `inline-flex items-center gap-1` |
| Text | Header label UA |
| Idle icon | `ArrowUpDownIcon` `className="size-3.5 opacity-50"` `aria-hidden` |
| Active asc | `ArrowUpIcon` `size-3.5` |
| Active desc | `ArrowDownIcon` `size-3.5` |
| Hover | `hover:text-foreground` на link |
| Parent header | `font-medium`; orders: `TableHead className="px-4 py-2"`; products: `<th className="px-3 py-2 font-medium">` |
| Header row | `bg-muted/50 text-muted-foreground` (products plain table) |
| `aria-sort` | `ascending` \| `descending` \| `none` на **`<th>`** / `TableHead` — **не** на inner `Link` |

**`getAriaSort` logic (copy from orders):**

```ts
if (sort !== column) return "none";
return dir === "asc" ? "ascending" : "descending";
```

**`nextSortDir` (copy from orders):**

- Same column → toggle asc/desc
- New column → `desc`

---

### `AdminProductsTable` — sort headers (ADM-PRD-02) — **main delta**

| Column | Sortable | `sort` param | Header label |
|--------|----------|--------------|--------------|
| Фото | **Ні** | — | Фото |
| Назва | **Так** | `title` | Назва |
| Категорія | **Так** | `category` | Категорія |
| Ціна | **Так** | `price` | Ціна |
| Статус | **Так** | `status` | Статус |

**Props to add:**

```ts
type AdminProductsTableProps = {
  items: AdminProductListItem[];
  sort: AdminProductListSort;
  dir: AdminProductListDir;
  pageSize: AdminPageSize;
  status?: ProductStatus;
  categoryId?: string;
  q?: string;
};
```

**Header implementation (plain `<table>`):**

```tsx
<th className="px-3 py-2 font-medium" aria-sort={getAriaSort("title", sort, dir)}>
  <AdminSortableTableHeader
    column="title"
    label="Назва"
    sort={sort}
    dir={dir}
    href={adminProductsUrl({ sort: "title", dir: nextSortDir(...), page: 1, pageSize, status, categoryId, q })}
  />
</th>
```

**Cell content:** без змін (thumb, title+brand, category name, price, `ProductListStatusSelect`).

**Wrapper:** додати `space-y-4` лише якщо pagination переїжджає в client bundle — зараз pagination зовні на page; table wrapper лишається `overflow-x-auto rounded-lg border border-border bg-background`.

---

### `OrdersDataTable` — Phase 12 delta

| Area | Spec |
|------|------|
| Status column | `OrderListStatusSelect` — **вже є** |
| Sort on status | `SortableHeader column="status"` — **вже є** |
| Row-click | Canonical props — **без змін** |
| Verification | Manual + optional component test на `stopPropagation` |

**Немає** нових колонок чи layout змін.

---

## States & Interactions

### Order status Select

| State | Visual / behavior |
|-------|-------------------|
| Default | `SelectTrigger` shows UA status label |
| Open | Dropdown з дозволеними переходами |
| Pending | Select disabled, transition in flight |
| Terminal | Disabled trigger, no menu |
| Error | `toast.error` з map `errorMessages` |
| Cancel dialog open | Select value unchanged until confirm |

### Product sort header

| State | Visual / behavior |
|-------|-------------------|
| Inactive column | Muted label + `ArrowUpDownIcon` opacity 50% |
| Active asc | Foreground emphasis + `ArrowUpIcon` |
| Active desc | Foreground emphasis + `ArrowDownIcon` |
| Click | Navigate via `Link` href (full page RSC refresh) |

### Conflicts

| Scenario | Expected behavior |
|----------|-------------------|
| Click order status Select | Opens menu; **no** row navigation |
| Click product status Select | Same (Phase 11) |
| Click sort header (products) | URL update; **no** row navigation (header outside row) |
| Click sort header (orders) | URL update — **існуюча** поведінка |
| Sort orders status column | Sorts rows; independent from inline status edit |

---

## Mobile-First Patterns

| Pattern | Implementation |
|---------|----------------|
| Horizontal scroll | `overflow-x-auto` на table wrapper |
| Sort targets | Full header link — tap-friendly |
| Select width | Fixed `w-[11rem]` / `w-[10.5rem]` — не ламати layout на вузьких екранах |
| Table | Не ховати sortable columns на mobile |

---

## Responsive

| Surface | Behavior |
|---------|----------|
| `/admin/tovary` | Header `flex-wrap` — без змін |
| Tables | Horizontal scroll при overflow |

---

## Accessibility

| Area | Requirement |
|------|-------------|
| Language | UA copy; `lang="uk"` |
| `aria-sort` | На кожному **sortable** `<th>` / `TableHead` (products: 4 headers; orders: 4 sortable) |
| Sort icons | `aria-hidden` на lucide icons |
| Select | Native shadcn roles; focusable окремо від row `role="link"` |
| `stopPropagation` | Обовʼязковий на order/product status triggers — Tab order не змінювати |
| Cancel dialog | Focus trap via `AlertDialog`; destructive action named **«Так, скасувати»** |
| Screen reader | Sort state оголошується через `aria-sort` на column header |

**Не додавати** окремий `aria-label` на Select, якщо `SelectValue` містить статус текстом.

---

## Out of Scope (UI)

| Item | Phase |
|------|-------|
| Product stock quantity column | 13 |
| Chat context menu | 14 |
| Refactor products table to TanStack Data Table | — |
| Client-only sort без URL | — |
| Sort по brand, photo, createdAt column in UI | — |
| Inline edit order status на dashboard recent orders | — |
| Нові фільтри / колонки | — |
| Заміна всіх admin `<select>` на storefront | 16 (UX-01) |

---

## Verification Checklist

### Manual

- [ ] `/admin/zamovlennia` — клік по status Select відкриває список; зміна зберігається; недозволений перехід → toast error
- [ ] Клік по Select **не** відкриває order detail
- [ ] `CANCELLED` → dialog → confirm / dismiss
- [ ] Terminal order statuses — disabled Select
- [ ] `/admin/tovary` — клік «Назва» / «Категорія» / «Ціна» / «Статус» змінює URL `sort` & `dir`; список відповідає порядку
- [ ] Sort зберігає `status`, `categoryId`, `q`, `pageSize` у URL
- [ ] Pagination links зберігають активний `sort` / `dir`
- [ ] Filter chips зберігають активний `sort` / `dir`
- [ ] «Фото» header без sort icon і без `aria-sort`
- [ ] Product status Select — row-click не спрацьовує (regression)
- [ ] Active sort column показує ↑ або ↓; inactive — ⇅ muted

### Automated (ROADMAP #4)

- [ ] `products-url.test.ts` — cases для `sort` + `dir` (mirror `orders-url.test.ts`)
- [ ] `listAdminProductsSchema` test — valid/invalid sort keys
- [ ] Optional: component test `OrderListStatusSelect` — `stopPropagation` on trigger click
- [ ] Optional: e2e smoke — products page header link updates query string

---

## Traceability

| Requirement | UI-SPEC coverage |
|-------------|------------------|
| ADM-ORD-02 | `OrderListStatusSelect` spec, stopPropagation, transitions, cancel dialog |
| ADM-PRD-02 | Products sortable headers, URL contract, 4 columns, backend mapping |
| ROADMAP #1 | shadcn Select + transition validation |
| ROADMAP #2 | stopPropagation |
| ROADMAP #3 | Products URL sort pattern |
| ROADMAP #4 | Verification automated section |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
