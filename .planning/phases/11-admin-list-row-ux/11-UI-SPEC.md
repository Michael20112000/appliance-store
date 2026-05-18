---
phase: 11
slug: admin-list-row-ux
status: draft
shadcn_initialized: true
preset: "base-nova · base: neutral · cssVariables · Tailwind v4 · geist (extends Phase 1–10)"
created: 2026-05-18
locale: uk
extends: 02-UI-SPEC.md
---

# Phase 11 — UI Design Contract (Admin List Row UX)

> Єдиний патерн адмін-списків: **клік по рядку** → деталі; **без** колонок «Відкрити» / «Редагувати»; **Plus** на create CTA; hover/focus/cursor як у `admin-products-table.tsx`. **Розширює** Phase 1–10 — токени, типографіка, 60/30/10 і spacing **без змін**. Джерела: `11-CONTEXT.md` (D-11-01–15), `ROADMAP.md` Phase 11, `10-UI-SPEC.md`, код: `admin-products-table.tsx`, `orders-data-table.tsx`, `kategorii/page.tsx`, `admin/page.tsx`, `product-list-status-select.tsx`.

**Out of scope (UI):** inline зміна статусу замовлення (Phase 12), сортування товарів (Phase 12), stock quantity (Phase 13), chat context menu (Phase 14), рефактор усіх admin tables на Data Table, нові action-колонки, Plus на dashboard «Додати товар» (не блокер — D-11-11).

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (ініціалізовано) |
| Preset | `base-nova`, base `neutral`, `cssVariables: true`, Tailwind v4, font **Geist** |
| Component library | Base UI (via shadcn `base-nova`) |
| Icon library | `lucide-react` — **`Plus`** на create CTA (D-11-09); sort icons на orders **без змін** |
| Font | Geist Sans — без змін |
| Styling | Tailwind v4 + `src/app/globals.css` |
| Theme modes | **Light only** (admin) |
| Document | `<html lang="uk">` |

**Phase 11 shadcn add:** **none** — reuse `button`, `table`, `badge`, `select` (products status only).

**Не змінювати** OKLCH токени в `:root` / `@theme`.

---

## Spacing Scale

**Успадковано з Phase 1** — див. `01-UI-SPEC.md` / `02-UI-SPEC.md` / `08-UI-SPEC.md`.

| Token | Value | Phase 11 usage |
|-------|-------|----------------|
| xs | 4px | Gap між `Plus` і текстом CTA (`gap-2` = 8px — див. нижче) |
| sm | 8px | `Button` icon gap `gap-2`, table cell vertical rhythm |
| md | 16px | List page header `gap-4`, section `space-y-4` / `space-y-6` |
| lg | 24px | Dashboard `space-y-8` між блоками |
| xl | 32px | — |
| 2xl | 48px | — |
| 3xl | 64px | — |

**Exceptions (Phase 11):**

| Exception | Value | Usage |
|-----------|-------|-------|
| Plus icon | `size-4` (16px) | `className="size-4"` на `Plus` (D-11-09) |
| Create CTA icon gap | `gap-2` (8px) | `Button` з `Plus` + label — flex inline |
| Products table cell | `px-3 py-2` | **Без змін** (canonical table) |
| Orders / dashboard table cell | `px-4 py-2` | **Без змін** (08-UI-SPEC) |
| Categories table cell | `px-4 py-2` | **Без змін** |

**Touch target:** рядок таблиці — повна висота рядка; nested `Select` / sort `Link` зберігають власні мінімальні зони (44px на control, не на весь `<tr>`).

---

## Typography

**Успадковано** — 4 розміри, 2 ваги (400, 600).

| Role | Size | Weight | Line height | Phase 11 usage |
|------|------|--------|-------------|----------------|
| Body | 16px | 400 | 1.5 | Page hints, empty states |
| Label | 14px | 600 | 1.4 | Table headers `font-medium`, order number emphasis |
| Heading | 20px / 24px | 600 | 1.2 | H1 list pages `text-2xl`; dashboard H2 `text-lg font-semibold` |
| Display | 28px | 600 | 1.15 | Dashboard H1 `md:text-3xl` only |

**Table body:** `text-sm` (14px) — **без змін** на всіх admin tables Phase 11.

**Sortable headers (orders):** `text-sm font-medium text-muted-foreground`; active sort — `text-foreground` + icon — **без змін** з Phase 8.

---

## Color

**Успадковано** з Phase 1–10.

| Role | Token | Phase 11 usage |
|------|-------|----------------|
| Dominant (60%) | `--background` | Table surface `bg-background` |
| Secondary (30%) | `--muted`, `--card` | Header row `bg-muted/50`, row hover/focus `bg-muted/40` |
| Accent (10%) | `--primary` | Create CTA **default** Button (list pages); sort header links `hover:text-foreground` — **не** primary fill на рядку |
| Destructive | `--destructive` | — (немає нових destructive UI у фазі) |

**Accent reserved for (Phase 11):**

1. Primary **«Додати категорію»** / **«Додати товар»** на list pages (існуючий hierarchy)
2. Focus ring на create CTA та keyboard-focused row (`focus-visible` через background, не окремий ring на `<tr>` — див. canonical)
3. Sort column `Link` у header — text emphasis only

**НЕ accent:** row hover (`bg-muted/40`), `cursor-pointer`, `OrderStatusBadge`, nested `Select`, видалені текстові лінки «Відкрити» / «Редагувати».

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA (categories list) | **«Додати категорію»** + `Plus` зліва |
| Primary CTA (products list) | **«Додати товар»** + `Plus` зліва |
| Primary CTA (dashboard, optional) | **«Додати товар»** — Plus **не обовʼязковий** (D-11-11) |
| Row navigation | **Без** окремого link-тексту в комірці — весь рядок = дія |
| Empty state (categories) | **«Немає категорій»** (без змін) |
| Empty state (products filtered) | **«Товарів не знайдено. Створіть перший товар або змініть фільтри.»** (без змін) |
| Empty state (dashboard orders) | **«Замовлень ще немає»** (без змін) |
| Error state | — (фаза не додає нових error UI) |
| Destructive confirmation | — (немає) |

**Прибрати з UI (success criteria):**

| Surface | Removed copy |
|---------|----------------|
| `/admin/zamovlennia` | **«Відкрити»** (колонка actions) |
| `/admin` recent orders | **«Відкрити»** |
| `/admin/kategorii` | **«Редагувати»** |

**Microcopy (unchanged labels):**

| UI | Copy |
|----|------|
| Orders table headers | Номер, Дата, Покупець, Доставка, Сума, Статус |
| Categories table headers | Назва, Товарів, Порядок — **без** четвертої колонки дій |
| Dashboard section | **«Останні замовлення»** |
| Status badge | Існуючі `OrderStatusBadge` / product status labels |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | — (reuse only) | not required |
| Third-party | **none** | — |

`registries: {}` — vetting third-party **не потрібен**.

---

## Business Rules (UI-facing)

| Rule | Spec |
|------|------|
| Canonical row | Один патерн для orders, categories, dashboard recent orders, products refactor (D-11-01) |
| Detail URLs | Orders → `/admin/zamovlennia/{orderNumber}`; Category → `/admin/kategorii/{id}`; Product → `/admin/tovary/{id}` |
| Action columns | **Заборонені** на list/dashboard після Phase 11 (окрім майбутніх inline controls Phase 12+) |
| Orders status cell | **Read-only** `OrderStatusBadge` — без inline edit у Phase 11 (D-11-13) |
| Products status cell | `ProductListStatusSelect` — **залишається**; `stopPropagation` обовʼязковий (D-11-12) |
| Sort headers (orders) | `Link` у `<TableHead>` — клік **не** має спрацьовувати як row navigation (header поза `<tbody>` row-click) |
| Client boundary | Мінімум client JS; categories/dashboard — server-first де можливо (D-11-03, D-11-04) |

---

## Routing & Surfaces

| Route / surface | Row-click target | Create CTA Plus |
|-----------------|------------------|-----------------|
| `/admin/zamovlennia` | `OrdersDataTable` rows | — |
| `/admin/kategorii` | Category rows | **Так** |
| `/admin/tovary` | `AdminProductsTable` (refactor only) | **Так** |
| `/admin` | Recent orders rows | Optional (dashboard) |

---

## Component Inventory (Phase 11)

### Reused (no new shadcn)

| Component | Usage |
|-----------|--------|
| `button` | Create CTAs з `Plus` |
| `table`, `TableRow`, `TableCell` | Orders Data Table |
| `OrderStatusBadge` | Orders + dashboard status column |
| `ProductListStatusSelect` | Products — nested control + `stopPropagation` |
| Plain `<table>` | Categories, products (products already), dashboard recent |

### New / delta (implementation discretion D-11-02)

| Artifact | Path (recommended) | Responsibility |
|----------|-------------------|----------------|
| `getAdminClickableRowProps` | `src/lib/admin/clickable-table-row.ts` | Повертає `role`, `tabIndex`, `className`, `onKeyDown` handler factory |
| **або** `AdminClickableTableRow` | `src/components/admin/admin-clickable-table-row.tsx` | Thin wrapper над `<tr>` / shadcn `TableRow` |

**Executor MUST:** products, orders, categories, dashboard — **однакові** row class strings і keyboard behavior.

---

## Component Specs

### Canonical clickable row (D-11-01, D-11-08)

**Reference implementation:** `src/components/admin/admin-products-table.tsx`

| Property | Spec |
|----------|------|
| Semantics | `role="link"` |
| Focus | `tabIndex={0}` |
| Pointer | `cursor-pointer` |
| Motion | `transition-colors` |
| Hover | `hover:bg-muted/40` |
| Focus visible | `focus-visible:bg-muted/40 focus-visible:outline-none` |
| Border | `border-b border-border last:border-0` (plain table) або узгодити з shadcn `TableRow` border utilities |
| Keyboard | **Enter** або **Space** → `preventDefault()` + navigate to detail URL |
| Click | Pointer click на `<tr>` / `TableRow` → same URL |
| Navigation | `useRouter().push(href)` **або** еквівалент з тією ж a11y (planner discretion D-11-03) |

**Exact `className` bundle (shared):**

```txt
cursor-pointer border-b border-border transition-colors last:border-0
hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none
```

Для shadcn `TableRow` додати той самий bundle через `cn()`; **не** використовувати `hover:bg-muted/50` з Phase 8 orders — замінити на **40** для консистентності.

---

### Nested interactive controls (D-11-12)

**Reference:** `product-list-status-select.tsx` — `onClick={(e) => e.stopPropagation()}` на `SelectTrigger`.

| Control type | Requirement |
|--------------|-------------|
| `Select`, `Button`, `Link`, future status picker | `stopPropagation` на **pointer** events (`onClick` мінімум; `onPointerDown` optional) |
| Phase 11 orders | Badge only — конфлікту з row-click **немає** |
| Phase 12 prep | Документувати правило в shared helper JSDoc |

---

### Plus on create CTA (D-11-09, D-11-10)

| Property | Spec |
|----------|------|
| Icon | `import { Plus } from "lucide-react"` |
| Size | `className="size-4"` |
| Position | **Зліва** від тексту |
| Button | **Той самий** `variant` / `size` що зараз — list pages **default** primary |
| Layout | `Button` children: `<Plus className="size-4" />` + label; implicit flex `gap-2` від Button |

**Приклад (prescriptive markup):**

```tsx
<Button render={<Link href="..." />}>
  <Plus className="size-4" aria-hidden />
  Додати категорію
</Button>
```

| Page | CTA copy | Plus required |
|------|----------|---------------|
| `/admin/kategorii` | Додати категорію | **Так** |
| `/admin/tovary` | Додати товар | **Так** |
| `/admin` dashboard | Додати товар (`size="sm" variant="outline"`) | **Ні** (optional symmetry) |

---

### `OrdersDataTable` — `/admin/zamovlennia` (D-11-05)

| Change | Spec |
|--------|------|
| Remove | Column `id: "actions"` і header «Дії» / link **«Відкрити»** |
| Add | Row props на кожен `TableRow`: canonical bundle + navigate to `/admin/zamovlennia/${orderNumber}` |
| Preserve | Sortable headers, pagination, `OrderStatusBadge` read-only, column set без actions |
| Client | Table вже client — row-click тут OK |

**Columns after Phase 11:** Номер, Дата, Покупець, Доставка, Сума, Статус — **6 data columns**, 0 action columns.

---

### Categories table — `/admin/kategorii` (D-11-04)

| Change | Spec |
|--------|------|
| Remove | Остання `<th>` без label + комірка **«Редагувати»** |
| Add | Row-click → `/admin/kategorii/${category.id}` |
| Headers | Назва, Товарів, Порядок — **3 columns** |
| Implementation | Пріоритет **мінімального client** — напр. client subcomponent лише для `<tbody>` або row wrapper; **не** client-ити всю page без потреби |
| Visual | Той самий bordered table shell: `overflow-x-auto rounded-lg border border-border bg-background` |

---

### Dashboard recent orders — `/admin` (D-11-06)

| Change | Spec |
|--------|------|
| Remove | Порожній `<th>` + **«Відкрити»** link column |
| Add | Row-click → `/admin/zamovlennia/${order.orderNumber}` |
| Columns | Номер, Дата, Статус, Сума — **4 columns** |
| Header row | `bg-muted/50` — **без змін** |
| Empty | **«Замовлень ще немає»** — без змін |

---

### `AdminProductsTable` — `/admin/tovary` (D-11-07)

| Change | Spec |
|--------|------|
| UX | **Без змін** для оператора — row-click як зараз |
| Refactor | Підключити shared `getAdminClickableRowProps` / wrapper; **не** змінювати колонки чи layout |
| Status column | `ProductListStatusSelect` + `stopPropagation` — **залишити** |

---

## States & Interactions

### Row states

| State | Visual / behavior |
|-------|-------------------|
| Default | `bg-background` (inherit), `cursor-pointer` |
| Hover | `bg-muted/40` |
| Focus (keyboard) | `bg-muted/40`, `outline-none` |
| Active click | Browser default — без окремого `active:` token |
| Disabled row | **Не застосовується** у Phase 11 |

### Create CTA states

| State | Spec |
|-------|------|
| Default | Primary Button + Plus |
| Hover/focus | shadcn Button defaults |
| Disabled | — (не додається у фазі) |

### Conflicts

| Scenario | Expected behavior |
|----------|-------------------|
| Click product status `Select` | Відкриває select; **не** navigates |
| Click orders sort header | Змінює sort URL; **не** row navigation |
| Tab to row + Enter | Navigates to detail |
| Tab to row + Space | Navigates to detail (`preventDefault` on Space) |

---

## Mobile-First Patterns

| Pattern | Implementation |
|---------|----------------|
| Horizontal scroll | `overflow-x-auto` на table wrapper — **без змін** |
| Row tap | Full row target — зручніше ніж маленький «Відкрити» |
| Create CTA | `flex-wrap` header — кнопка не стискає заголовок |
| Dashboard table | Ті самі `px-4 py-2` — читабельність на вузьких екранах |

---

## Responsive

| Surface | Breakpoint | Behavior |
|---------|------------|----------|
| List page header | all | `flex flex-wrap items-center justify-between gap-4` |
| Tables | all | Horizontal scroll при overflow; **не** ховати колонки actions (їх немає) |
| Dashboard H1 | `md` | `text-2xl md:text-3xl` — без змін |

---

## Accessibility

| Area | Requirement |
|------|-------------|
| Language | UA copy; `lang="uk"` |
| Row as link | `role="link"` + `tabIndex={0}` на navigable row |
| Keyboard | **Enter** і **Space** активують navigation (як products) |
| Focus visible | `focus-visible:bg-muted/40` — не покладатися лише на `cursor-pointer` |
| Removed links | Не залишати «приховані» action links — row замінює їх |
| Sort headers | Залишити `aria-sort` на sortable `TableHead` (orders) |
| Plus icon | `aria-hidden` на `Plus`; accessible name = Button text |
| Nested Select | Focusable control у комірці; `stopPropagation` не ламає Tab order |
| Screen reader | Row `role="link"` — SR оголошує як link; nested controls з власними ролями |

**Не додавати** `aria-label` на кожен рядок, якщо комірки вже містять унікальний текст (номер замовлення / назва категорії) — достатньо контенту в cells.

---

## Verification Checklist

### Manual (D-11-15)

- [ ] `/admin/zamovlennia` — клік по рядку відкриває detail; колонки «Відкрити» **немає**
- [ ] `/admin/kategorii` — клік по рядку → edit category; «Редагувати» **немає**; «Додати категорію» має **Plus** зліва
- [ ] `/admin/tovary` — row-click працює як раніше; «Додати товар» має **Plus**
- [ ] `/admin` — recent orders row-click → order detail; «Відкрити» **немає**
- [ ] Tab до рядка + **Enter** → detail на orders, categories, dashboard, products
- [ ] Tab до рядка + **Space** → detail (products pattern)
- [ ] Клік по `ProductListStatusSelect` на товарах **не** навігує
- [ ] Hover/focus рядка: `bg-muted/40`, `cursor-pointer` на всіх чотирьох surfaces

### Automated (D-11-14)

- [ ] Vitest smoke на shared row props/helper (якщо винесено) **або** component test на одну таблицю
- [ ] Перевірка що `className` bundle містить `cursor-pointer` і `hover:bg-muted/40`

### Visual regression (optional)

- [ ] Orders table без останньої вузької колонки link
- [ ] Categories table 3 колонки замість 4

---

## Traceability

| Requirement | UI-SPEC coverage |
|-------------|------------------|
| ADM-ORD-01 | Orders row-click; remove «Відкрити» |
| ADM-CAT-01 | Plus on «Додати категорію» |
| ADM-CAT-02 | Categories row-click; remove «Редагувати» |
| ADM-PRD-01 | Plus on «Додати товар»; products `cursor-pointer` preserved |
| UX-02 | Unified hover/focus/keyboard row pattern |
| ROADMAP #1–4 | All four success criteria mapped in Verification |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending

---

## UI-SPEC COMPLETE

**Phase:** 11 — Admin List Row UX  
**Design System:** shadcn `base-nova` / neutral / Geist (inherited)

### Contract Summary
- Spacing: 8-point inherited; Plus `size-4`; table padding unchanged per surface
- Typography: 4 sizes / 2 weights inherited; table body `text-sm`
- Color: 60/30/10 inherited; row hover `muted/40`; accent on create CTAs only
- Copywriting: Plus CTAs; removed «Відкрити»/«Редагувати»; empty states unchanged
- Registry: shadcn reuse only; **no** new components

### File Created
`.planning/phases/11-admin-list-row-ux/11-UI-SPEC.md`

### Pre-Populated From
| Source | Decisions Used |
|--------|----------------|
| `11-CONTEXT.md` | 15 (D-11-01–15) |
| `ROADMAP.md` | Phase 11 goal + 4 success criteria |
| `10-UI-SPEC.md` | Format, extends pattern, registry |
| `08-UI-SPEC.md` | Admin table padding, orders columns |
| `admin-products-table.tsx` | Canonical row-click classes + keyboard |
| `product-list-status-select.tsx` | stopPropagation pattern |
| `orders-data-table.tsx` | Actions column to remove |
| `kategorii/page.tsx` | Edit column + create CTA |
| `admin/page.tsx` | Dashboard recent orders + CTAs |
| `components.json` | base-nova, no new shadcn |
| User input | 0 |

### Ready for Verification
UI-SPEC complete. Checker can now validate against 6 dimensions.
