---
phase: 8
slug: admin-ux-chat-lifecycle
status: draft
shadcn_initialized: true
preset: "base-nova · base: neutral · cssVariables · Tailwind v4 · geist (extends Phase 1–5)"
created: 2026-05-17
locale: uk
extends: 05-UI-SPEC.md
admin_chrome: bg-muted
---

# Phase 8 — UI Design Contract

> Адмінка: shadcn **Sidebar** (mobile Sheet, desktop icon collapse), **Data Table** замовлень з серверною пагінацією/сортуванням, таблиця категорій **без Slug**, життєвий цикл чатів (вкладки Активні/Архів, дії в треді, read-only для покупця). **Розширює** Phase 1–5 — глобальні токени, типографіка (4 розміри / 2 ваги), 60/30/10 **без змін**. Джерела: `08-CONTEXT.md` (D-08-01…D-08-27), `REQUIREMENTS.md` (FIX-01, ADM-01–03, CHAT-05–06), `ROADMAP.md` Phase 8, код: `admin/layout.tsx`, `admin-nav.tsx`, `orders-table.tsx`, `admin-chat-inbox.tsx`.

**Out of scope (UI):** wishlist (Phase 9), зображення категорій (Phase 10), Data Table для товарів/категорій, push/email, typing/read receipts, assign менеджера, окремий route `/admin/chaty/arkhiv`.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (ініціалізовано) |
| Preset | `base-nova`, preset code `b2fA`, base `neutral`, `cssVariables: true`, Tailwind v4, font **Geist** |
| Component library | Base UI (via shadcn) |
| Icon library | `lucide-react` |
| Font | Geist Sans — без змін |
| Styling | Tailwind v4 + `src/app/globals.css` |
| Theme modes | **Light only** |
| Document | `<html lang="uk">` |
| Admin chrome | **`bg-muted`** shell; content inset `bg-background rounded-lg border shadow-sm` |
| Breakpoint | `md` (768px) — sidebar Sheet vs persistent; chat split vs stack |

**Не змінювати** OKLCH токени в `:root` / `@theme` (включно з `--sidebar-*`).

**Phase 8 shadcn add (executor):**

```bash
npx shadcn@latest add sidebar table pagination tabs
```

**TanStack Table:** `@tanstack/react-table` — dependency для Data Table pattern (офіційний приклад shadcn).

**Вже в проєкті (reuse):** `button`, `badge`, `card`, `sheet`, `dropdown-menu`, `alert-dialog`, `select`, `separator`, `scroll-area`, `skeleton`, `sonner`.

**Registry:** лише shadcn official (`registries: {}` у `components.json`) — third-party blocks **не** використовувати.

---

## Spacing Scale

**Успадковано з Phase 1** — див. `01-UI-SPEC.md`. Усі значення кратні 4.

| Token | Value | Phase 8 usage |
|-------|-------|----------------|
| xs | 4px | Icon gap у sortable headers, badge padding |
| sm | 8px | Table cell `py-2`, tabs gap, toolbar row |
| md | 16px | Sidebar header padding, thread header `px-4 py-3` |
| lg | 24px | Page `space-y-6`, pagination bar gap |
| xl | 32px | — |
| 2xl | 48px | Empty state vertical padding |
| 3xl | 64px | — |

**Exceptions (Phase 8):**

| Exception | Value | Usage |
|-----------|-------|-------|
| Touch target min | 44×44px | `SidebarMenuButton`, `SidebarTrigger`, pagination controls, thread `DropdownMenu` trigger |
| Sidebar width (expanded) | **16rem** (`w-64`) | shadcn default; icon-only → `w-12` via `collapsible="icon"` |
| SidebarTrigger in header | `size-9` (36px) + padding | Mobile + optional desktop collapse toggle |
| Data table cell padding | `px-4 py-2` | Match existing `orders-table.tsx` |
| Chat inbox list width | **320px** (`md:grid-cols-[320px_1fr]`) | Без змін Phase 5 |
| Archived buyer banner | `px-4 py-3` | Full-width above composer |

---

## Typography

**Успадковано** — 4 розміри, 2 ваги (400, 600).

| Role | Size | Weight | Line height | Phase 8 usage |
|------|------|--------|-------------|----------------|
| Body | 16px | 400 | 1.5 | Banner body, pagination labels |
| Label | 14px | 600 | 1.4 | Table headers, nav items, tab triggers, thread actions |
| Heading | 20px (`text-2xl`) | 600 | 1.2 | Page H1: Замовлення, Чати, Категорії |
| Display | 28px (`text-3xl`) | 600 | 1.15 | Dashboard H1 only — без змін |

**Table rows:** `text-sm` (14px) — виняток щільності, як Phase 4.

**Sortable column header:** `text-sm font-medium text-muted-foreground`; active sort → `text-foreground` + `font-semibold` + lucide `ArrowUp` / `ArrowDown` / `ArrowUpDown` (`size-3.5`, `aria-hidden`).

**Money / order numbers:** `tabular-nums`.

---

## Color

**Успадковано** з Phase 1–5.

| Role | Token | Phase 8 usage |
|------|-------|----------------|
| Dominant (60%) | `--background` | Main content panel, data table surface, chat thread |
| Secondary (30%) | `--muted`, `--sidebar`, `--border` | Admin shell, sidebar (`bg-sidebar`), filter chips inactive, archived banner |
| Accent (10%) | `--primary` | Active filter chip, primary CTAs, sort link hover, buyer send (unchanged) |
| Destructive | `--destructive` | Delete chat confirm, unread nav badge, destructive menu item |

### Admin chrome (post-Sidebar migration)

| Zone | Classes |
|------|---------|
| Root | `min-h-dvh bg-muted` |
| `SidebarProvider` | Full viewport |
| `Sidebar` | `collapsible="icon"`, tokens `bg-sidebar text-sidebar-foreground border-sidebar-border` |
| `SidebarInset` | Main column; inner card `rounded-lg border border-border bg-background p-4 shadow-sm md:p-6` |
| Mobile overlay | Sheet from shadcn sidebar (built-in) — **не** custom duplicate Sheet |

### Accent reserved for (Phase 8)

1. **Primary buttons:** «Додати категорію», save actions (unchanged)
2. **Active order filter chip** — `border-primary bg-primary text-primary-foreground` (unchanged `order-list-filters.tsx`)
3. **Active chat tab** — `TabsTrigger` data-state active (shadcn default uses primary ring/underline per theme)
4. **Sortable header active state** — foreground emphasis only (не fill primary на всю колонку)
5. **Link «Відкрити»** у таблиці — `text-primary hover:underline`

**Не accent:** archive menu item (ghost/outline), pagination ghost buttons, sidebar inactive links (`text-muted-foreground`).

### Semantic surfaces

| State | Background | Text |
|-------|------------|------|
| Buyer archived banner | `bg-muted border-b border-border` | `text-sm text-muted-foreground`; title line `font-semibold text-foreground` |
| Chat empty (view) | centered | `text-muted-foreground` |
| Delete `AlertDialog` | `bg-background` | Destructive confirm button `variant="destructive"` |

---

## Copywriting Contract

Усі рядки UI — **українською**. Тон: коротко, операційно, без жаргону.

| Element | Copy |
|---------|------|
| Sidebar brand | **Адмін-панель** |
| Primary CTA (categories) | **Додати категорію** |
| Primary CTA (orders row) | **Відкрити** (link, не button) |
| Orders empty (filter=all, no rows ever) | Heading: — / Body: **Замовлень ще немає. Коли покупець оформить замовлення, воно з'явиться тут.** |
| Orders empty (filtered, no match) | **Нічого не знайдено** |
| Categories empty | **Немає категорій** |
| Chat list empty (active) | **Немає активних діалогів** |
| Chat list empty (archive) | **Архів порожній** |
| Chat thread unselected | Title: **Оберіть діалог** / Body: **Оберіть покупця зі списку, щоб відповісти.** |
| Error — orders load | **Не вдалося завантажити замовлення. Спробуйте оновити сторінку.** |
| Error — chat send (archived buyer) | **Діалог закрито. Напишіть нам іншим способом або зачекайте відповіді магазину.** |
| Buyer archived banner title | **Діалог закрито магазином** |
| Buyer archived banner body | **Ви можете переглядати історію, але нові повідомлення надіслати не можна.** |

### Nav labels (unchanged)

Панель · Категорії · Товари · Замовлення · Чати · На сайт · Вийти

### Order filters (unchanged)

Усі · Нові · В роботі · Завершені · Скасовані

### Chat view tabs

| Tab | Label | `searchParams` |
|-----|-------|----------------|
| Active | **Активні** | `view=active` (default) |
| Archive | **Архів** | `view=archive` |

### Thread actions (`DropdownMenu`)

| Action | Menu label | Visible when |
|--------|------------|--------------|
| Archive | **Архівувати** | `view=active`, conversation `OPEN` |
| Unarchive | **Повернути з архіву** | `view=archive`, conversation `ARCHIVED` |
| Delete | **Видалити назавжди** | Both views; `DropdownMenuItem` class `text-destructive focus:text-destructive` |

**Dropdown trigger:** icon button `MoreVertical`, `aria-label="Дії з діалогом"`, `size="icon"`, min 44×44 touch area.

### Destructive confirmation (`AlertDialog`)

| Field | Copy |
|-------|------|
| Title | **Видалити діалог назавжди?** |
| Description | **Усі повідомлення буде видалено без можливості відновлення. Покупець більше не побачить цей діалог.** |
| Cancel | **Скасувати** |
| Confirm | **Видалити** (`variant="destructive"`) |

**Post-delete:** toast **Діалог видалено** (`sonner` success); clear selection; `router.refresh()`.

**Post-archive:** toast **Діалог архівовано** / **Діалог повернуто в активні**; if archived while selected on active tab → clear selection or switch list.

### Pagination (UA)

| Control | Copy |
|---------|------|
| Page size label | **Рядків на сторінці:** |
| Page size options | 10 · 20 · 50 |
| Prev | **Назад** (icon `ChevronLeft`) |
| Next | **Далі** (icon `ChevronRight`) |
| Page indicator | **Сторінка {page} з {totalPages}** |
| Disabled prev/next | `aria-disabled`, no extra copy |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | `sidebar`, `table`, `pagination`, `tabs` (+ Data Table example code) | not required |
| Third-party | — | none declared |

---

## Component Inventory (Phase 8)

### New shadcn primitives

| Component | Path | Usage |
|-----------|------|-------|
| `sidebar` | `@/components/ui/sidebar` | Admin shell (`SidebarProvider`, `Sidebar`, `SidebarInset`, `SidebarTrigger`, `SidebarRail`) |
| `table` | `@/components/ui/table` | Orders Data Table, optional refactor wrapper |
| `pagination` | `@/components/ui/pagination` | Orders footer |
| `tabs` | `@/components/ui/tabs` | Chat Active/Archive |

### New / refactored custom

| Component | Path | Responsibility |
|-----------|------|----------------|
| `AppSidebar` | `components/admin/app-sidebar.tsx` | Nav items from `admin-nav.tsx`, unread badge, footer links |
| `AdminSidebarShell` | `components/admin/admin-sidebar-shell.tsx` (optional) | Client wrapper: `SidebarProvider` + trigger in header |
| `OrdersDataTable` | `components/admin/orders-data-table.tsx` | TanStack columns, sort UI, links to URL params |
| `OrdersTablePagination` | `components/admin/orders-table-pagination.tsx` | Page + pageSize controls |
| `AdminChatTabs` | `components/chat/admin-chat-tabs.tsx` | Tabs bound to `view` searchParam |
| `AdminChatThreadActions` | `components/chat/admin-chat-thread-actions.tsx` | Dropdown + archive/unarchive actions + delete dialog |
| `ArchivedChatBanner` | `components/chat/archived-chat-banner.tsx` | Buyer read-only state |

### Modified

| File | Change |
|------|--------|
| `admin/layout.tsx` | Replace `grid md:grid-cols-[240px_1fr]` with `SidebarProvider` pattern |
| `admin-nav.tsx` | Migrate to `SidebarMenu` / deprecate standalone `<nav>` |
| `orders-table.tsx` | Replace or wrap with `OrdersDataTable` |
| `order-list-filters.tsx` | Preserve chips; reset `page=1` on filter change (URL builder) |
| `admin-chat-inbox.tsx` | Tabs above split grid; thread header actions slot |
| `chat-thread.tsx` | Header right: `AdminChatThreadActions`; hide `AdminChatComposer` when archived |
| `chat-panel.tsx` / `chat-composer` | Archived banner + disabled composer for buyer |
| `admin/page.tsx` | `StatCard` «Чернетки» → `href="/admin/tovary?status=DRAFT"` |
| `kategorii/page.tsx` | Remove Slug column |

---

## Admin Sidebar (ADM-01)

**Decisions:** D-08-02…D-08-06.

### Structure

```
SidebarProvider
├── Sidebar (collapsible="icon")
│   ├── SidebarHeader — "Адмін-панель" (hide text when collapsed, show tooltip)
│   ├── SidebarContent
│   │   └── SidebarMenu — nav items (lucide + label)
│   └── SidebarFooter — "На сайт", "Вийти"
├── SidebarRail (desktop collapse affordance)
└── SidebarInset
    ├── header row: SidebarTrigger + optional page title slot
    └── main card {children}
```

### Responsive behavior

| Viewport | Sidebar | Trigger |
|----------|---------|---------|
| `< md` | Hidden; opens in **Sheet** (shadcn sidebar mobile) | `SidebarTrigger` in `SidebarInset` header — required on every admin page |
| `≥ md` | Visible; `collapsible="icon"` + `SidebarRail` | Trigger optional; rail click toggles icon mode |

**localStorage для collapsed state:** не обовʼязково на MVP (D-08-04).

### Nav item spec

Reuse `navItems` from `admin-nav.tsx`:

| Item | href | Icon | Active rule |
|------|------|------|-------------|
| Панель | `/admin` | `LayoutDashboard` | `pathname === '/admin'` |
| Категорії | `/admin/kategorii` | `FolderTree` | `pathname.startsWith('/admin/kategorii')` |
| Товари | `/admin/tovary` | `Package` | `pathname.startsWith('/admin/tovary')` |
| Замовлення | `/admin/zamovlennia` | `ShoppingBag` | `pathname.startsWith('/admin/zamovlennia')` |
| Чати | `/admin/chaty` | `MessageSquare` | `pathname.startsWith('/admin/chaty')` |

**Unread badge (Чати):** `Badge variant="destructive"` `ml-auto`, label `99+` cap; `aria-label` **Чати, {n} непрочитаних** — лише `OPEN` conversations (D-08-21).

**Active item:** `bg-sidebar-accent font-semibold text-sidebar-accent-foreground` (match current `admin-nav.tsx`).

**Icon-only collapsed:** show icon + `Tooltip` with label (`TooltipProvider` from shadcn if added; else `title` attribute minimum).

### Footer

| Control | Behavior |
|---------|----------|
| На сайт | `Link href="/"` + `ExternalLink` icon |
| Вийти | `Button variant="ghost"` full width — `authClient.signOut()` → `/uviity` |

**Server data:** `unreadChatCount` passed from `admin/layout.tsx` into client sidebar (prop).

---

## Orders Data Table (ADM-02)

**Decisions:** D-08-07…D-08-13. **Route:** `/admin/zamovlennia`.

### URL contract (`searchParams`)

| Param | Values | Default |
|-------|--------|---------|
| `filter` | `all` \| `new` \| `in_progress` \| `completed` \| `cancelled` | `all` |
| `page` | positive int | `1` |
| `pageSize` | `10` \| `20` \| `50` | `20` |
| `sort` | `createdAt` \| `totalKopiyky` \| `orderNumber` \| `status` | `createdAt` |
| `dir` | `asc` \| `desc` | `desc` |

**Reset rules:** зміна `filter` або `pageSize` → `page=1` (D-08-10).

### Page layout (top → bottom)

1. H1 **Замовлення**
2. `OrderListFilters` — unchanged visual; update href builder to preserve `pageSize`/`sort`/`dir` or reset page only
3. `OrdersDataTable`
4. Footer row: flex `justify-between items-center gap-4 flex-wrap`
   - Left: **Рядків на сторінці:** + `Select` (10/20/50)
   - Right: shadcn `Pagination` + **Сторінка X з Y**

### Columns

| Column | Header UA | Sortable | Notes |
|--------|-------------|----------|-------|
| orderNumber | **Номер** | Yes (`orderNumber`) | `font-medium` |
| createdAt | **Дата** | Yes (`createdAt`) | `uk-UA` medium + short time |
| customer | **Покупець** | No | Name + phone `text-muted-foreground` |
| deliveryType | **Доставка** | No | **Самовивіз** / **Доставка по Львову** |
| totalKopiyky | **Сума** | Yes (`totalKopiyky`) | `tabular-nums`, `formatPriceKopiyky` |
| status | **Статус** | Yes (`status`) | `OrderStatusBadge` |
| actions | (empty) | No | Link **Відкрити** |

### Sort interaction

- Click sortable `<TableHead>` → toggle `dir`; new column → set `sort` + default `dir` (`desc` for dates/amount, `asc` for orderNumber optional — **default `desc` for all** on first click per D-08-09)
- **Preferred implementation:** `<Link href={buildUrl({ sort, dir })}>` on header — RSC-friendly, minimal client JS (D-08-13)
- Visual: `ArrowUpDown` when inactive; `ArrowUp`/`ArrowDown` when active
- `aria-sort="ascending"|"descending"|"none"` on `<th>`

### Table chrome

| Property | Value |
|----------|-------|
| Wrapper | `overflow-x-auto rounded-lg border border-border bg-background` |
| Header row | `text-muted-foreground border-b` |
| Body row | `border-b last:border-0 hover:bg-muted/50` |

### Loading / empty

| State | UI |
|-------|-----|
| Loading (optional) | 5 `Skeleton` rows, `h-10` |
| Empty | Copy per Copywriting Contract |

---

## Categories Table (ADM-03)

**Route:** `/admin/kategorii`. **Decision:** D-08-14.

### Columns (after)

| Column | Header |
|--------|--------|
| name | **Назва** |
| product count | **Товарів** |
| sortOrder | **Порядок** |
| actions | (empty) → link **Редагувати** |

**Remove:** column **Slug** and cells — slug remains in edit form only.

**No other visual changes** — keep plain `<table className="w-full text-sm">` (Data Table out of scope).

---

## Chat Lifecycle — Admin (CHAT-05, CHAT-06)

**Decisions:** D-08-15…D-08-22. **Route:** `/admin/chaty?view=active|archive`.

### Page structure

```
space-y-6
├── h1 "Чати"
├── AdminChatTabs (Активні | Архів)
└── grid min-h-[calc(100dvh-12rem)] border rounded-lg
    ├── ConversationList (filtered by status)
    └── ChatThread (+ thread actions in header)
```

**Tabs implementation:** shadcn `Tabs` **or** link-styled tabs matching `order-list-filters` (planner choice). If `Tabs`: controlled by URL (`useSearchParams` + `router.replace`) — not uncontrolled local state only.

**Tab switch:** preserve `selectedConversationId` only if conversation exists in new list; else clear selection.

### Thread header (extended)

```
[← До списку] (mobile only)
[Buyer name + email]
[AdminChatThreadActions — MoreVertical]
```

**Archive view:** show **Повернути з архіву** instead of **Архівувати**; composer **remains enabled** for admin (admin can still reply in archive — **unless** product decision says read-only; CONTEXT says archive hides from active inbox but history preserved — **admin composer stays enabled** in archive for MVP unless CONTEXT restricts; D-08-17 says history preserved, D-08-19 doesn't disable admin composer → **admin can reply in archived threads**). 

Re-read D-08-23: only **buyer** is read-only when ARCHIVED. Admin composer stays.

### List item (optional visual cue)

Archived list: same row style; optional `Badge variant="outline"` **Архів** on row — **discretionary**; default no badge if tab already says Архів.

### Realtime

No Pusher requirement for list refresh after lifecycle — `router.refresh()` or provider refetch (D-08-22).

---

## Chat Lifecycle — Buyer (D-08-23…D-08-25)

**Surface:** `ChatPanel` / `ChatComposer` via `chat-provider`.

### Archived state UI

When `conversation.status === 'ARCHIVED'`:

1. Insert `ArchivedChatBanner` **above** composer (below `MessageList`, same slot as `ProductContextBanner`)
2. **Disable** `ChatComposer`: `disabled`, `aria-disabled`, placeholder **Діалог закрито**
3. Do not hide message history

### Banner spec

```tsx
<div role="status" className="border-b border-border bg-muted px-4 py-3">
  <p className="text-sm font-semibold">Діалог закрито магазином</p>
  <p className="mt-1 text-sm text-muted-foreground">…</p>
</div>
```

No dismiss button — persistent while archived.

---

## Dashboard Fix (FIX-01)

**File:** `src/app/(admin)/admin/page.tsx`

| StatCard | href |
|----------|------|
| Чернетки | `/admin/tovary?status=DRAFT` |

No visual change to card itself.

---

## Accessibility

| Area | Requirement |
|------|-------------|
| Sidebar mobile | `SidebarTrigger` `aria-label="Відкрити меню"`; Sheet focus trap (shadcn default) |
| Sortable headers | `aria-sort` + visible icon; don't rely on color alone |
| Pagination | `nav` `aria-label="Пагінація"`; current page `aria-current="page"` |
| Tabs | `role="tablist"`; each trigger `aria-selected` |
| Delete dialog | Focus trap; initial focus on **Скасувати**; Esc closes |
| Thread actions | `aria-label` on icon trigger; menu items plain language |
| Archived banner | `role="status"` (polite live region optional) |
| Composer disabled | `aria-disabled="true"` + explanatory `aria-describedby` linking to banner id |

---

## Interaction Flows (summary)

### Archive conversation (admin)

1. Admin opens **Активні** → selects thread → **Дії** → **Архівувати**
2. Server sets `ARCHIVED` → toast → refresh list → thread disappears from active tab
3. Visible under **Архів** tab

### Delete conversation (admin)

1. **Видалити назавжди** → `AlertDialog` → **Видалити**
2. Hard delete DB → toast → clear selection → refresh

### Buyer opens archived chat

1. History loads
2. Banner shows; composer disabled
3. Send attempt (if bypassed) → server error copy from contract

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

*Phase: 08-admin-ux-chat-lifecycle · UI contract: 2026-05-17*
