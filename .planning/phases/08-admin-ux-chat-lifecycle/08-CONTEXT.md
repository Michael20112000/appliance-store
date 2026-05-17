# Phase 8: Admin UX & Chat Lifecycle - Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Адмінка отримує **shadcn Sidebar** (mobile collapse через Sheet), **Data Table** для замовлень з серверною пагінацією та сортуванням, **прибраний Slug** у таблиці категорій, **життєвий цикл чатів** (архів + hard delete), і **фікс посилання «Чернетки»** на dashboard.

**Не в цій фазі:** wishlist (Phase 9), зображення категорій (Phase 10), push/email для чату, typing/read receipts, assign чату менеджеру, рефактор таблиць товарів/категорій на Data Table.

</domain>

<decisions>
## Implementation Decisions

### Dashboard fix (FIX-01)
- **D-08-01:** `StatCard` «Чернетки» на `/admin` → `href="/admin/tovary?status=DRAFT"` (сторінка вже парсить `status`; змінити лише посилання).

### Admin Sidebar (ADM-01)
- **D-08-02:** Встановити shadcn **`sidebar`**; обгорнути admin layout у **`SidebarProvider`** + блок `AppSidebar` (патерн з офіційного Sidebar block).
- **D-08-03:** **Mobile (`<md`):** sidebar прихований; **`SidebarTrigger`** у header контенту відкриває **Sheet** (вбудована поведінка shadcn sidebar).
- **D-08-04:** **Desktop (`md+`):** sidebar **завжди видимий**; дозволити **collapse до icon-only** через `collapsible="icon"` + `SidebarRail` (не обовʼязково зберігати стан у localStorage на MVP).
- **D-08-05:** Пункти nav **без змін:** Панель, Категорії, Товари, Замовлення, Чати + badge unread на «Чати» + «На сайт» / «Вийти» внизу (логіка з `admin-nav.tsx`, перенести в sidebar menu).
- **D-08-06:** `requireAdmin()` і `countUnreadForAdmin()` лишаються в **server** `admin/layout.tsx`; sidebar — client shell навколо children.

### Orders Data Table (ADM-02)
- **D-08-07:** Встановити shadcn **`table`**, **`pagination`**, патерн **Data Table** (`@tanstack/react-table` + приклад shadcn).
- **D-08-08:** **Серверна пагінація** (не client-only на весь список): `listOrdersAdminPaginated({ filter, page, pageSize, sort })` + `countOrdersAdmin(filter)`.
- **D-08-09:** URL `searchParams` на `/admin/zamovlennia`:
  - `filter` — як зараз (`all` | `new` | `in_progress` | `completed` | `cancelled`)
  - `page` — default `1`
  - `pageSize` — `10` | `20` | `50`, default **`20`**
  - `sort` — `createdAt` | `totalKopiyky` | `orderNumber` | `status`
  - `dir` — `asc` | `desc`, default **`desc`** для `createdAt`
- **D-08-10:** Зміна `filter` або `pageSize` → **`page=1`**.
- **D-08-11:** **Сортування** лише для колонок: дата створення, сума, номер, статус (клік по header → toggle `sort`/`dir` у URL).
- **D-08-12:** **`OrderListFilters`** (таби статусів) **залишаються** над таблицею; пагінація під таблицею (shadcn Pagination + селект page size).
- **D-08-13:** RSC page завантажує **одну сторінку** замовлень; інтерактивність сортування/пагінації — client `OrdersDataTable` або `Link` на ті самі query keys (planner: мінімум client JS).

### Categories table (ADM-03)
- **D-08-14:** На `/admin/kategorii` **прибрати колонку Slug** з таблиці (slug лишається в формі редагування).

### Chat lifecycle — data model (CHAT-05, CHAT-06)
- **D-08-15:** Prisma **`ConversationStatus`** enum: `OPEN` | `ARCHIVED`; поле `status` на `Conversation`, default **`OPEN`**; індекс `@@index([status, lastMessageAt])`.
- **D-08-16:** **Hard delete** після підтвердження адміна: `prisma.conversation.delete` (messages каскадом уже `onDelete: Cascade`). **Без** `deletedAt` soft-delete на MVP — success criteria «записів немає в БД».
- **D-08-17:** **Архів** = `status: ARCHIVED`; історія повідомлень **зберігається**; активний inbox показує лише `OPEN`.

### Chat lifecycle — admin UX (CHAT-05, CHAT-06)
- **D-08-18:** На `/admin/chaty` **вкладки** (або `Tabs`): **«Активні»** | **«Архів»** через `searchParams` `view=active|archive` (default `active`); **один URL**, без `/arkhiv` route.
- **D-08-19:** Дії в **шапці треду** (коли діалог обраний): **Архівувати** / **Повернути з архіву** / **Видалити назавжди** (`DropdownMenu` + `AlertDialog` для delete).
- **D-08-20:** Текст confirm видалення українською; після delete — зняти selection, оновити список (router.refresh / optimistic).
- **D-08-21:** **`countUnreadForAdmin`** і badge nav — лише **`OPEN`** діалоги з непрочитаними buyer-повідомленнями.
- **D-08-22:** Після архівації/видалення — **Pusher** не обовʼязковий для списку; достатньо `router.refresh()` або refetch conversations у `AdminChatProvider`.

### Chat lifecycle — buyer UX (Claude's discretion → locked)
- **D-08-23:** Покупець у **ARCHIVED** діалозі: **read-only** — історія видима, **composer вимкнений**, банер «Діалог закрито магазином».
- **D-08-24:** `sendMessage` / server action **відхиляє** нові повідомлення для `ARCHIVED` з зрозумілою помилкою (не створювати новий `Conversation`).
- **D-08-25:** `getOrCreateConversation` для buyer лишає **той самий** запис (не fork thread).

### Verification (Claude's discretion → locked)
- **D-08-26:** Vitest: `listConversationsForAdmin` фільтр по `status`; archive/delete actions; paginated orders helper.
- **D-08-27:** Оновити **`e2e/admin-chat.spec.ts`** лише якщо змінюється базовий flow відкриття чату; archive/delete — **manual checklist** у плані верифікації.

### Claude's Discretion
Користувач делегував усі сірі зони (2026-05-17). Рішення D-08-02…D-08-27 зафіксовані вище. Planner може обрати:
- `nuqs` vs plain `searchParams` для admin orders/chat view
- monolithic `OrdersDataTable` client vs header sort через `<Link>`
- exact Sidebar component file split (`app-sidebar.tsx`)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & requirements
- `.planning/PROJECT.md` — v1.1 admin UX, shadcn Sidebar/Data Table, chat lifecycle
- `.planning/REQUIREMENTS.md` — FIX-01, ADM-01–03, CHAT-05–06
- `.planning/ROADMAP.md` — Phase 8 goal, success criteria, Prisma notes
- `.planning/STATE.md` — milestone v1.1

### Prior phase context
- `.planning/phases/04-admin-operations/04-CONTEXT.md` — admin services, `requireAdmin`, UA routes
- `.planning/phases/04-admin-operations/04-PATTERNS.md` — admin actions, services split
- `.planning/phases/05-realtime-chat/05-CONTEXT.md` — D-05-01 one conversation per buyer, Pusher, inbox split
- `.planning/phases/05-realtime-chat/05-RESEARCH.md` — chat schema, channel auth
- `.planning/phases/05-realtime-chat/05-PATTERNS.md` — chat service, providers

### Research & pitfalls
- `.planning/research/PITFALLS.md` — admin auth, Pusher channel auth (#6)
- `.planning/research/ARCHITECTURE.md` — admin/chat routes

### shadcn (install during phase)
- `components.json` — `base-nova`, RSC, `@/components/ui`
- Official docs: Sidebar block, Data Table pattern (TanStack Table) — via `node_modules` / shadcn CLI

### Code (primary touchpoints)
- `src/app/(admin)/admin/layout.tsx` — replace grid with SidebarProvider
- `src/components/admin/admin-nav.tsx` — migrate to sidebar menu
- `src/app/(admin)/admin/page.tsx` — StatCard drafts href (D-08-01)
- `src/app/(admin)/admin/zamovlennia/page.tsx` — pagination/sort params
- `src/components/admin/orders-table.tsx` — → Data Table or replace
- `src/components/admin/order-list-filters.tsx` — keep, reset page on filter
- `src/server/services/admin-order.service.ts` — paginated list + count
- `src/app/(admin)/admin/kategorii/page.tsx` — drop Slug column
- `src/app/(admin)/admin/chaty/page.tsx` — view=active|archive
- `src/components/chat/admin-chat-inbox.tsx` — tabs + thread actions
- `src/components/chat/admin-chat-provider.tsx` — refetch after lifecycle
- `src/server/services/chat.service.ts` — status filter, archive, delete guards
- `src/server/actions/` — new admin chat lifecycle actions (pattern from existing admin actions)
- `src/components/chat/chat-provider.tsx` — archived read-only buyer UX
- `prisma/schema.prisma` — ConversationStatus + migration
- `e2e/admin-chat.spec.ts` — regression guard

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/admin/admin-nav.tsx` — nav items, unread badge, logout (migrate into sidebar)
- `src/components/admin/orders-table.tsx` — column set baseline for Data Table
- `src/components/admin/order-list-filters.tsx` — status filter tabs
- `src/components/ui/alert-dialog.tsx` — delete confirmation
- `src/components/ui/sheet.tsx` — already used storefront; sidebar uses Sheet on mobile
- `src/components/ui/dropdown-menu.tsx` — thread actions menu
- `src/app/(admin)/admin/tovary/page.tsx` — already supports `?status=DRAFT`
- `src/server/services/chat.service.ts` — `listConversationsForAdmin`, unread count
- `src/components/chat/admin-chat-inbox.tsx` — split list/thread layout

### Established Patterns
- RSC page + client islands; `requireAdmin()` on layout and actions
- Admin URL segments Ukrainian (`zamovlennia`, `chaty`, `kategorii`)
- Server services + Zod validators + server actions
- Chat: DB-first then Pusher trigger; private channels

### Integration Points
- Replace `grid md:grid-cols-[240px_1fr]` in admin layout with shadcn Sidebar
- Extend Prisma `Conversation` before service filters
- Orders page: break `listAllOrders` all-at-once into paginated API
- Buyer widget in `(storefront)/layout` must respect `ARCHIVED` status

</code_context>

<specifics>
## Specific Ideas

- Користувач: **«все на свій вибір»** — стандартні shadcn/admin патерни, без over-engineering.
- Пріоритет: відповідність ROADMAP success criteria (6 пунктів) і існуючим Phase 5 chat рішенням.

</specifics>

<deferred>
## Deferred Ideas

- Soft-delete (`deletedAt`) для чатів — не потрібен при hard-delete policy (D-08-16)
- Окремий route `/admin/chaty/arkhiv` — tabs достатньо (D-08-18)
- Data Table для товарів/категорій — поза scope Phase 8
- Push/email при новому повідомленні — v2

</deferred>

---

*Phase: 08-admin-ux-chat-lifecycle*
*Context gathered: 2026-05-17*
