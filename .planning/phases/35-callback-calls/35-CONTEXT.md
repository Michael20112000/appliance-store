# Phase 35: Callback calls (Дзвінки) - Context

**Gathered:** 2026-05-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Окремий адмін-робочий простір для заявок на зворотний дзвінок: перенести з `/admin/nalashtuvannia`, додати статус, нотатку оператора та архів. Storefront-форма callback лишається без змін.

**Requirements:** CALL-01, CALL-02, CALL-03, CALL-04

</domain>

<decisions>
## Implementation Decisions

### Список і архів (CALL-01, CALL-04)
- **D-01:** Нова сторінка `src/app/(admin)/admin/dzvinky/page.tsx` — основний список заявок.
- **D-02:** Таби-фільтри як у замовленнях (`OrderListFilters` патерн): **«Активні»** (default, `archivedAt IS NULL`) та **«Архів»** (`archivedAt IS NOT NULL`). URL: `?view=active` | `?view=archive`, default без query = active.
- **D-03:** Сортування: `createdAt desc` (як зараз). Без пагінації на v1 — обсяг заявок невеликий; `take` не обмежувати 50 на dedicated page (або cap 200 для safety).
- **D-04:** Архівувати можна лише коли статус **«Проконсультовано»** (CONSULTED). Кнопка «В архів» в рядку; unarchive не в scope — архів односторонній для v1.
- **D-05:** Блок «Заявки на дзвінок» повністю прибрати з `nalashtuvannia/page.tsx`; `listCallbackRequestsAdmin` винести з store-settings у callback admin service.

### Статуси (CALL-02)
- **D-06:** Prisma enum `CallbackRequestStatus`: `PENDING` | `CONSULTED`. Labels UA: «Очікує на дзвінок», «Проконсультовано».
- **D-07:** Default для нових і існуючих записів (migration): `PENDING`.
- **D-08:** Зміна статусу — compact `Select` у рядку таблиці (аналог `order-list-status-select`, без bulk). Server action + `requireAdmin`, optimistic UI optional (planner discretion).

### Нотатка (CALL-03)
- **D-09:** Колонка «Нотатка» — `Textarea` (2–3 рядки) прямо в таблиці + кнопка «Зберегти» поруч (explicit save, не blur-auto — менше випадкових перезаписів).
- **D-10:** `note` — optional `String?` у Prisma (`@db.Text`). Порожня нотатка = null або "" (planner picks one convention).

### Навігація
- **D-11:** Пункт sidebar **«Дзвінки»** → `/admin/dzvinky` (icon `Phone` з lucide) — додати в `admin-nav-items.ts` у цій фазі (без badge; badge — Phase 36 / ADM-NAV-01).
- **D-12:** Analytics KPI «Дзвінків» лишається count усіх заявок за період (не лише active) — без змін логіки в 35, якщо не конфліктує з product intent.

### Claude's Discretion
- Точна структура server actions (`updateCallbackStatusAction`, `updateCallbackNoteAction`, `archiveCallbackRequestAction`) vs один mutation — planner/executor.
- Чи рефакторити `CallbackRequestsTable` → `CallbackRequestsDataTable` з client subcomponents — за аналогією orders.
- Toast copy UA та disabled states для archive коли status !== CONSULTED.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — CALL-01 … CALL-04
- `.planning/ROADMAP.md` — Phase 35 success criteria
- `.planning/PROJECT.md` — operator UX, Ukrainian copy

### Schema & data
- `prisma/schema.prisma` — `CallbackRequest` (extend with status, note, archivedAt)
- `.planning/phases/34-admin-analytics/34-CONTEXT.md` — prior note: callbacks had no status before Phase 35

### Existing implementation to migrate/refactor
- `src/app/(admin)/admin/nalashtuvannia/page.tsx` — remove callback section (CALL-01)
- `src/components/admin/callback-requests-table.tsx` — extend or replace
- `src/server/services/store-settings.service.ts` — `listCallbackRequestsAdmin` moves out
- `src/server/services/callback-request.service.ts` — public `createCallbackRequest`; extend for admin
- `src/server/actions/callback.actions.ts` — storefront submit only
- `src/components/admin/order-list-status-select.tsx` — status-in-row UX reference
- `src/components/admin/order-list-filters.tsx` — tab filter URL pattern reference
- `src/components/admin/admin-nav-items.ts` — add Дзвінки entry

### Related future phase (do not implement in 35)
- `.planning/ROADMAP.md` Phase 36 — ADM-NAV-01 sidebar badges for unresolved callbacks

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CallbackRequestsTable` — table shell, phone formatting via `formatUaPhoneDisplay`
- `OrderListFilters` — Link-based `?view=` tab pattern for active/archive
- `order-list-status-select` — admin status change in list row
- `requireAdmin` via `src/app/(admin)/admin/layout.tsx`
- `callbackRequestSchema` / `createCallbackRequest` — storefront path unchanged

### Established Patterns
- Admin pages: `space-y-8`, `text-2xl font-semibold` H1, section `text-lg font-semibold`
- Server actions return `{ ok, error? }` with Zod parse
- Ukrainian operator-facing labels

### Integration Points
- Migration backfills existing rows → `PENDING`, `archivedAt: null`
- Remove parallel fetch of callbacks from settings page
- Nav item before or after «Налаштування» (planner: place after «Чати» or before «Налаштування»)

</code_context>

<specifics>
## Specific Ideas

Користувач: «все на твій вибір аби зручно було» — пріоритет: швидка обробка заявок оператором без зайвих кліків, консистентність з `/admin/zamovlennia`.

</specifics>

<deferred>
## Deferred Ideas

- Sidebar badge «невирішені дзвінки» — Phase 36 (ADM-NAV-01)
- Unarchive / restore from archive — post–v2.0
- Pagination, search by phone, export CSV — out of scope
- Email/SMS нотифікації оператору про нову заявку — out of scope
- Додаткові статуси (напр. «Не додзвонились») — out of scope unless product asks later

</deferred>

---

*Phase: 35-callback-calls*
*Context gathered: 2026-05-20*
