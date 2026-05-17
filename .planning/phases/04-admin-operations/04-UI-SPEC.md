---
phase: 4
slug: admin-operations
status: draft
shadcn_initialized: true
preset: "base-nova · base: neutral · cssVariables · Tailwind v4 · geist (extends Phase 1–3; product intent: new-york zinc light)"
created: 2026-05-17
locale: uk
extends: 03-UI-SPEC.md
admin_chrome: bg-muted
---

# Phase 4 — UI Design Contract

> Адмін-панель: CRUD категорій і товарів, Cloudinary-фото, керування замовленнями. **Розширює** Phase 1–3 — глобальні токени, типографіка (4 розміри / 2 ваги), 60/30/10 **без змін**. Візуальна відмінність: **щільніші** таблиці й форми, chrome на `bg-muted`, контент на `bg-background`. Джерела: `ROADMAP.md` Phase 4, `REQUIREMENTS.md` (AUTH-04, ADM-01–04), `03-RESEARCH.md` (OrderStatus), код: `src/app/(admin)/admin/layout.tsx`, `prisma/schema.prisma`.

**Out of scope (UI):** ADM-05 чат-інбокс (Phase 5) — лише disabled nav + badge «Незабаром». Storefront каталог/checkout — без змін.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (ініціалізовано) |
| Preset | `base-nova`, base `neutral`, `cssVariables: true`, Tailwind v4, font **Geist** |
| Component library | Base UI (via shadcn) |
| Icon library | `lucide-react` |
| Font | Geist Sans — без змін |
| Styling | Tailwind v4 + `src/app/globals.css` |
| Theme modes | **Light only** |
| Document | `<html lang="uk">` |
| Admin chrome | **`bg-muted`** на shell (sidebar + outer frame); робоча зона — `bg-background` картки/таблиці |
| Storefront contrast | Storefront залишається повітряним (`max-w-6xl`, більші відступи); admin — **компактний** data UI |

**Не змінювати** OKLCH токени в `:root` / `@theme`.

**Phase 4 shadcn add (executor):**

```bash
npx shadcn@latest add table dialog select textarea switch tabs sonner sidebar scroll-area dropdown-menu alert-dialog checkbox
```

Опційно (якщо multi-step product form): `progress` (official only).

**Registry:** лише shadcn official — third-party blocks **не** використовувати.

---

## Spacing Scale

**Успадковано з Phase 1** — див. `01-UI-SPEC.md`. Усі значення кратні 4.

| Token | Value | Phase 4 admin usage |
|-------|-------|---------------------|
| xs | 4px | Badge gap, table cell icon gap |
| sm | 8px | Table cell `py-2`, compact form row gap |
| md | 16px | Dialog padding, form field stack (`gap-4` → admin `gap-3` = 12px via `gap-3`) |
| lg | 24px | Page header → content, stats card grid gap |
| xl | 32px | Dashboard section breaks |
| 2xl | 48px | Empty state vertical padding |
| 3xl | 64px | — (рідко в admin) |

**Exceptions (admin-specific):**

| Exception | Value | Usage |
|-----------|-------|-------|
| Touch target min | 44×44px | Icon buttons (edit/delete), sidebar links mobile |
| Admin sidebar width | 240px (`w-60`) | Fixed desktop; mobile → Sheet |
| Admin content max | `max-w-7xl` (80rem) | Ширше за storefront — таблиці |
| Table row height | ~40–44px | `text-sm` + `py-2` — щільніше за storefront cards |
| Data table cell padding | `px-3 py-2` | Default admin table |
| Form field gap | `gap-3` (12px) | Admin forms (storefront forms `gap-4`) |
| Sticky table header | `top-0 z-10 bg-background` | Довгі списки товарів/замовлень |
| Image thumb (uploader) | 72×72px | Grid preview у `product-image-uploader` |

---

## Typography

**Успадковано** — 4 розміри, 2 ваги (400, 600). Admin **переважно Body + Label**; Display не використовувати.

| Role | Size | Weight | Line height | Phase 4 usage |
|------|------|--------|-------------|----------------|
| Body | 16px | 400 | 1.5 | Описи, helper text, dialog body |
| Label | 14px | 600 | 1.4 | Table headers, form labels, nav items, stat labels |
| Heading | 20px / 24px desktop | 600 | 1.2 | H1 сторінок («Товари», «Замовлення») |
| Display | 28px | 600 | 1.15 | Dashboard H1 «Панель керування» only |

**Admin table text:** `text-sm` (14px) для рядків таблиці — допустимо як **виняток** для щільності (не зменшувати form inputs нижче 16px).

**Money:** `tabular-nums` на ціні в таблицях і формах (`formatPriceKopiyky`).

---

## Color

**Успадковано** з Phase 1–3.

| Role | Token | Phase 4 admin usage |
|------|-------|---------------------|
| Dominant (60%) | `--background` | Картки таблиць, dialog, form surfaces у content area |
| Secondary (30%) | `--muted`, `--card`, `--border` | **Admin shell** (`min-h-dvh bg-muted`), sidebar, stats cards `bg-card` |
| Accent (10%) | `--primary` | Primary save/create CTAs, active nav item, focus rings |
| Destructive | `--destructive` | Delete category/product, cancel order confirm |

### Admin chrome split

| Zone | Background | Border |
|------|------------|--------|
| Outer shell / sidebar | `bg-muted` | Sidebar `border-r border-border` |
| Top bar (optional) | `bg-background` | `border-b` |
| Main content panel | `bg-background` `rounded-lg border shadow-sm` (inset card) | — |
| Table header row | `bg-muted/50` | `border-b` |

### Accent reserved for (Phase 4)

1. **«Зберегти»**, **«Створити»**, **«Додати категорію»**, **«Додати товар»** — `Button variant="default"`
2. Active sidebar link — `bg-sidebar-accent text-sidebar-accent-foreground` або `text-primary` + `font-semibold` (один стиль)
3. Focus ring на полях і select
4. **Не accent:** status badges (semantic variants нижче), secondary «Скасувати», table row actions ghost

### Status badge semantics (products)

| `ProductStatus` | Badge variant | Label UA |
|-----------------|---------------|----------|
| `AVAILABLE` | `default` (primary outline) | **В наявності** |
| `SOLD` | `secondary` | **Продано** |
| `DRAFT` | `outline` | **Чернетка** |

### Status badge semantics (orders)

| `OrderStatus` | Badge variant | Label UA (reuse buyer copy) |
|---------------|---------------|----------------------------|
| `PENDING` | `secondary` | **Нове** |
| `CONFIRMED` | `default` | **Підтверджено** |
| `READY_FOR_PICKUP` | `outline` | **Готово до самовивозу** |
| `OUT_FOR_DELIVERY` | `outline` | **Доставляється** |
| `COMPLETED` | `secondary` | **Виконано** |
| `CANCELLED` | `destructive` | **Скасовано** |

---

## Admin Shell Layout

**File:** `src/app/(admin)/admin/layout.tsx` — замінити placeholder header-only на sidebar shell.

```
┌──────────┬────────────────────────────────────────────┐
│ AdminNav │  [optional top: breadcrumb / page title]   │
│ (w-60)   ├────────────────────────────────────────────┤
│ bg-muted │  <main className="bg-background rounded-lg │
│          │   border p-4 md:p-6"> {children} </main>   │
└──────────┴────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Root | `min-h-dvh bg-muted` |
| Desktop | CSS grid `grid-cols-[240px_1fr]` або flex |
| Mobile | `AdminNav` → hamburger → `Sheet` (ліва сторона); content full width |
| `robots` | `{ index: false, follow: false }` — без змін |
| Auth | `requireAdmin()` server-side — без змін |

### `AdminNav` (`components/admin/admin-nav.tsx`)

| Item | `href` | Icon (lucide) | Notes |
|------|--------|---------------|-------|
| Панель | `/admin` | `LayoutDashboard` | Active on exact `/admin` |
| Категорії | `/admin/categories` | `FolderTree` | |
| Товари | `/admin/products` | `Package` | |
| Замовлення | `/admin/orders` | `ShoppingBag` | |
| Чати | `#` | `MessageSquare` | **Disabled** — ADM-05 Phase 5 |
| На сайт | `/` | `ExternalLink` | `target` same tab, footer zone |

**Чати (ADM-05 defer):**

- `aria-disabled="true"`, `pointer-events-none`, `opacity-60`
- Badge поруч: **`Незабаром`** (`Badge variant="secondary"`)
- Tooltip optional: «Чат з покупцями — у наступному оновленні»

**Footer nav:** «На сайт» + sign out через `DropdownMenu` у sidebar bottom (email truncated).

---

## Component Inventory (Phase 4)

### shadcn (див. add command вище)

| Component | Usage |
|-----------|--------|
| `table` | Categories, products, orders lists |
| `dialog` | Create/edit category (modal pattern) |
| `alert-dialog` | Delete confirmations |
| `select` | Category pick, product status, condition, order status |
| `textarea` | Product description, order notes (read-only on detail) |
| `switch` | Optional «опублікувати» = status AVAILABLE vs DRAFT |
| `tabs` | Product form sections (optional single-page alternative) |
| `sonner` | Toast success/error після server actions |
| `sidebar` | Optional — можна custom `AdminNav` без Sidebar primitive |
| `scroll-area` | Long tables in dialog |
| `checkbox` | Bulk select (optional v2 — **не** в MVP) |

### Custom components

| Component | Path | Responsibility |
|-----------|------|----------------|
| `AdminNav` | `components/admin/admin-nav.tsx` | Sidebar links + disabled Чати |
| `CategoryForm` | `components/admin/category-form.tsx` | name, slug (auto from name), description, sortOrder |
| `ProductForm` | `components/admin/product-form.tsx` | title, slug, description, brand, price (UAH input → kopiyky), condition, categoryId, status |
| `ProductImageUploader` | `components/admin/product-image-uploader.tsx` | Cloudinary signed upload, sortable thumbs, alt |
| `OrderStatusSelect` | `components/admin/order-status-select.tsx` | Controlled select + save on order detail |
| `AdminDataTable` | `components/admin/admin-data-table.tsx` | Thin wrapper: Table + empty + loading skeleton rows |
| `StatCard` | `components/admin/stat-card.tsx` | Dashboard metric |

**Reuse:** `formatPriceKopiyky`, `conditionLabelUa` from `@/lib/catalog/format`; order status labels align with `order-history-card.tsx`.

---

## Page Layouts

### `/admin` — Dashboard

**Purpose:** Огляд операцій магазину (не marketing).

| Zone | Content |
|------|---------|
| H1 | **Панель керування** (Heading 24px) |
| Stats grid | `grid gap-4 sm:grid-cols-2 lg:grid-cols-4` |
| Stat cards | 1) **Нові замовлення** (`PENDING` count) 2) **Товари в наявності** (`AVAILABLE`) 3) **Чернетки** (`DRAFT`) 4) **Замовлення сьогодні** (optional) |
| Quick links | Row of `Button variant="outline" size="sm"`: «Додати товар», «Переглянути замовлення» |
| Recent orders | Compact table (5 rows): номер, дата, статус badge, сума → link detail |

**Empty stats:** `0` as number, not em dash.

---

### `/admin/categories` — Categories table

| Zone | Content |
|------|---------|
| Header row | H1 **Категорії** + primary **«Додати категорію»** → opens Dialog |
| Table columns | Назва · Slug · Товарів (count) · Порядок (`sortOrder`) · Дії |
| Row actions | Icon **Редагувати** (dialog) · **Видалити** (alert-dialog) |
| Sort | Default `sortOrder` asc |

**Create/Edit:** `Dialog` + `CategoryForm` (not separate page for MVP).

| Field | Control | Validation copy |
|-------|---------|-----------------|
| Назва | Input | «Вкажіть назву категорії» |
| Slug | Input (auto-suggest from name, editable) | «Латиниця, дефіси» |
| Опис | Textarea optional | — |
| Порядок | Input type number | «Ціле число» |

**Delete rules:** Alert if category has products — «У категорії є товари. Спочатку перемістіть або видаліть їх.»

---

### `/admin/products` — Products table

| Zone | Content |
|------|---------|
| Header | H1 **Товари** + **«Додати товар»** → `/admin/products/new` |
| Filters row | `Select` status (Всі / В наявності / Продано / Чернетка) · `Select` category · Search input (title/brand) — query in URL optional |
| Table columns | Thumb 40px · Назва + slug muted · Категорія · Ціна · Стан · Статус badge · Дії |
| Row actions | **Редагувати** → `/admin/products/[id]/edit` · **Видалити** (alert-dialog; block if `SOLD` in open order — server message) |

**Table density:** `text-sm`, row `py-2`, thumb `size-10 rounded-md object-cover`.

---

### `/admin/products/new` — Create product

**Pattern:** **Single page form** (preferred MVP) — не обов’язковий wizard; якщо багато полів, `tabs`: «Основне» | «Фото» | «Публікація».

| Section | Fields |
|---------|--------|
| Основне | title, slug (auto), brand, `categoryId` select, condition select, price (грн, integer), description textarea |
| Фото | `ProductImageUploader` — min 1 image before AVAILABLE |
| Публікація | status select: DRAFT default · AVAILABLE |

| Actions | Sticky footer bar `border-t bg-background p-4 flex gap-3 justify-end` |
|---------|-----------------------------------------------------------------------|
| Primary | **«Зберегти»** |
| Secondary | **«Скасувати»** → `/admin/products` |

**Price input:** display UAH, store kopiyky; placeholder «Наприклад, 4500».

---

### `/admin/products/[id]/edit` — Edit product

Same layout as `/new`, prefilled. Title H1: **Редагувати товар** + truncated product title muted.

Extra: link **«На вітрині»** → `/tovar/[slug]` if status ≠ DRAFT (new tab).

---

### `ProductImageUploader` contract

| Behavior | Spec |
|----------|------|
| Upload | Signed Cloudinary upload (server route); drag-drop zone + **«Завантажити фото»** |
| Preview grid | `grid grid-cols-4 gap-3`, thumb 72px, `rounded-md border` |
| Reorder | Drag handle or up/down icons; persist `sortOrder` |
| Alt | Optional per image input `text-sm` |
| Delete | Icon button per thumb + confirm if last image and status AVAILABLE |
| Max | 8 images (soft limit, show helper) |
| Loading | Skeleton on thumb slot |

---

### `/admin/orders` — Orders table

| Zone | Content |
|------|---------|
| Header | H1 **Замовлення** |
| Filter | `Select` / tabs: **Усі** · **Нові** (`PENDING`) · **В роботі** (CONFIRMED, READY, OUT_FOR_DELIVERY) · **Завершені** (COMPLETED) · **Скасовані** |
| Table columns | Номер (`orderNumber`) · Дата · Покупець (name + phone) · Доставка · Сума · Статус badge · Дія **Відкрити** |
| Row click | Entire row or link → `/admin/orders/[orderNumber]` |

**No payment columns** — узгоджено з Phase 3 (no online payment).

---

### `/admin/orders/[orderNumber]` — Order detail

Two-column desktop `lg:grid-cols-3` — main `lg:col-span-2`.

| Block | Content |
|-------|---------|
| Header | **Замовлення {orderNumber}** · date · `OrderStatusSelect` + **«Оновити статус»** (or auto-save on select change + toast) |
| Customer | Ім’я, телефон (`tel:` link), notes |
| Fulfillment | PICKUP → **Самовивіз** · LVIV_DELIVERY → адреса |
| Line items | Table: назва snapshot, qty, price snapshot, line total |
| Summary | Subtotal / total `tabular-nums` |
| Side panel | Status history placeholder (text: «Історія змін — незабаром») optional stub |

**Cancel flow:** When status → `CANCELLED`, `AlertDialog`: **«Скасувати замовлення? Товари повернуться в наявність.»** — confirm **«Так, скасувати»**.

---

## UI States

### Loading

| Surface | Pattern |
|---------|---------|
| Tables | 5–8 `Skeleton` rows, same column layout |
| Forms | `Skeleton` fields + disabled submit |
| Dashboard stats | `Skeleton` h-24 in stat cards |
| Image upload | Progress on thumb + spinner overlay |

### Empty

| Page | Heading | Body | CTA |
|------|---------|------|-----|
| Categories | **Немає категорій** | Додайте першу категорію для товарів. | **Додати категорію** |
| Products | **Немає товарів** | Створіть товар або змініть фільтр. | **Додати товар** |
| Orders | **Замовлень ще немає** | Коли покупець оформить замовлення, воно з’явиться тут. | — |
| Order filter | **Нічого не знайдено** | Спробуйте інший статус або пошук. | **Скинути фільтр** |

### Error

| Context | Copy |
|---------|------|
| Generic action | **«Не вдалося зберегти. Спробуйте ще раз.»** |
| Network | **«З’єднання перервано. Перевірте інтернет.»** |
| Validation | Field-level UA (Zod) — під полем, `text-destructive text-sm` |
| Delete blocked | **«Неможливо видалити: {причина}»** |
| Upload fail | **«Не вдалося завантажити фото. Перевірте формат (JPG, PNG, WebP) і розмір.»** |
| Optimistic conflict | **«Дані застаріли. Оновіть сторінку.»** |

### Success (sonner toast)

| Action | Toast |
|--------|-------|
| Save category/product | **«Збережено»** |
| Delete | **«Видалено»** |
| Order status | **«Статус оновлено»** |
| Upload | **«Фото додано»** |

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA (create product) | **«Додати товар»** |
| Primary CTA (save) | **«Зберегти»** |
| Primary CTA (create category) | **«Додати категорію»** |
| Primary CTA (order status) | **«Оновити статус»** (if separate button) |
| Secondary cancel | **«Скасувати»** |
| Empty categories heading | **«Немає категорій»** |
| Empty products heading | **«Немає товарів»** |
| Empty orders heading | **«Замовлень ще немає»** |
| Error state (generic) | **«Не вдалося зберегти. Спробуйте ще раз.»** |
| Delete category confirm | **«Видалити категорію «{name}»? Цю дію не можна скасувати.»** |
| Delete product confirm | **«Видалити товар «{title}»?»** |
| Cancel order confirm | **«Скасувати замовлення? Товари повернуться в наявність.»** |
| Destructive confirm button | **«Видалити»** / **«Так, скасувати»** |
| Chat nav badge | **«Незабаром»** |
| Sign out | **«Вийти»** |

**Microcopy:** loading submit **«Збереження…»**; filter placeholder **«Пошук за назвою або брендом»**; slug helper **«Використовується в URL: /tovar/…»**

---

## Accessibility

| Area | Requirement |
|------|-------------|
| Language | `lang="uk"`; всі admin strings UA |
| Focus | Visible `:focus-visible` ring; logical tab: nav → main → actions |
| Touch | Min 44×44px icon buttons in tables on mobile |
| Tables | `<th scope="col">`; responsive: horizontal scroll `overflow-x-auto` wrapper, not crush columns |
| Dialogs | Focus trap; `aria-labelledby` on title; Esc closes (non-destructive) |
| Disabled Чати | `aria-disabled="true"` + не в tab order OR tab with `aria-label="Чати — незабаром"` |
| Forms | `<Label htmlFor>`; errors `aria-invalid` + `aria-describedby` |
| Status badges | Text label inside badge, not color-only |
| Toasts | `sonner` with `role="status"`; critical errors also `role="alert"` |
| Images admin | Alt field encouraged; fallback alt = product title |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | table, dialog, select, textarea, switch, tabs, sonner, alert-dialog, checkbox, scroll-area, dropdown-menu | not required |
| Third-party | **none** | — |

---

## Traceability

| Requirement | UI-SPEC coverage |
|-------------|------------------|
| AUTH-04 | `requireAdmin`, no buyer access to admin shell |
| ADM-01 | `/admin/categories` table + dialog form + delete |
| ADM-02 | `/admin/products` CRUD + new/edit pages + status badges |
| ADM-03 | `ProductImageUploader` Cloudinary multi-image |
| ADM-04 | `/admin/orders` list + detail + `OrderStatusSelect` |
| ADM-05 | Nav «Чати» disabled + «Незабаром» (implementation Phase 5) |
| UI-01 | Ukrainian copy throughout |
| UI-03 | Responsive sidebar Sheet, scrollable tables |

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

<!-- UI-SPEC COMPLETE — ready for gsd-ui-checker validation -->
