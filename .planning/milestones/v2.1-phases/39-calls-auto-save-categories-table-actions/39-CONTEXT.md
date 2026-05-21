# Phase 39: Calls Auto-save & Categories Table Actions - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Два незалежні UX-покращення в адмінці v2.1:

1. **Дзвінки** — нотатка в таблиці `/admin/dzvinky` автозберігається без кнопки «Зберегти» (debounce 400 мс після останнього введення).
2. **Категорії** — таблиця `/admin/kategorii` отримує колонку порядкового номера (жива після DnD) і колонку «Дії» (додати товар з передвибраною категорією, видалити з підтвердженням).

Автозбереження форми редагування категорії та icon-trash у хедері edit-сторінки — **Phase 40**, не входить сюди.

</domain>

<decisions>
## Implementation Decisions

### Фідбек автозбереження нотатки (Area 1)
- **D-01:** Без toast на успішне збереження — як у редагуванні товару (`ProductEditHeader`: «Збереження…» / «Збережено»).
- **D-02:** Під textarea — компактний `text-xs text-muted-foreground` з `aria-live="polite"`; ті самі українські рядки, що в product edit header.
- **D-03:** Toast **лише на помилку** — зберегти існуючі повідомлення (`ALREADY_ARCHIVED`, `NOT_FOUND`, generic).
- **D-04:** Кнопку «Зберегти» прибрати повністю.

### Помилки й архів (Area 2)
- **D-05:** Текст у полі **не відкочувати** після failed save — оператор може виправити і продовжити (як product auto-save).
- **D-06:** Поле нотатки лишається тільки для **active** view (як зараз); archived — read-only truncate, без змін.
- **D-07:** При `ALREADY_ARCHIVED` / `NOT_FOUND` — toast error, поле не disabled проактивно (рідкі edge cases після архівації іншою вкладкою).

### Колонка порядкового номера (Area 3)
- **D-08:** № = **1-based індекс у `localCategories`** після DnD (`index + 1`), не значення `sortOrder` з БД.
- **D-09:** Колонка «№» — перша після drag-handle (або перед ним, якщо візуально логічніше: **№ → grip → Назва → Товари → Дії**).
- **D-10:** Номер оновлюється **оптимістично** разом із `setLocalCategories` після drag — без окремого refresh.

### Підтвердження видалення категорії (Area 4)
- **D-11:** **shadcn `AlertDialog`** — не `window.confirm` (консистентно з `ProductListDeleteButton` / `ProductEditDeleteButton`).
- **D-12:** Окремий client-компонент на кшталт `CategoryTableDeleteButton` — mirror `product-list-delete-button.tsx` (toast errors, `suppressAdminRowNavigation`, `stopPropagation` на кліках).
- **D-13:** Текст діалогу — з error map `category-form` / `deleteCategoryAction`: категорія з товарами не видаляється; «дію не можна скасувати» для порожньої.
- **D-14:** Після успішного delete — `router.refresh()` або оновити `localCategories` (planner обере; UX — рядок зникає без повного reload сторінки, якщо можливо).

### Верстка колонки «Дії» (Area 5)
- **D-15:** Дві **текстові** кнопки `size="sm"` у `flex flex-wrap gap-2` — не icon-only (текстові лейбли з requirements).
- **D-16:** «Додати товар» — `Button variant="outline" asChild` + `Link` на `/admin/tovary/novyi?categoryId={id}` (роут і `searchParams.categoryId` уже підтримані в `novyi/page.tsx`).
- **D-17:** «Видалити» — `variant="outline"` + destructive styling або окремий destructive outline; відкриває AlertDialog.
- **D-18:** Усі кліки в «Дії» — `stopPropagation` / `suppressAdminRowNavigation` (як «Переглянути» в `admin-categories-table.test.tsx`).

### Технічний підхід (з locked requirements)
- **D-19:** Debounce **400 мс** через існуючий `createDebounce` з `@/lib/debounce` (не 500 мс як у товарів — CALL-05 явно 400).
- **D-20:** Новий hook `useCallbackNoteAutoSave` (або inline у `CallbackNoteField`) — структура як `useProductAutoSave`: snapshot string, generation ref, save chain, skip save якщо unchanged.
- **D-21:** Після save **не** викликати `router.refresh()` на кожен keystroke — лише оновити локальний snapshot; refresh опційно лише якщо server повертає інші поля (за замовчуванням — без refresh).

### Claude's Discretion
- Точне ім’я/розташування hook-файлу; чи виносити спільний debounced-save primitive з product hook.
- Порядок колонок у `<thead>` (№ перед/після grip) — за найкращим візуальним балансом у shadcn table.
- Чи реюзати один delete-dialog компонент між table і edit (Phase 40) — за DRY, без зміни scope 40.

</decisions>

<specifics>
## Specific Ideas

- Користувач: «головне зручно і красиво», «якщо в проекті вже є схоже — дотримуйся».
- Референс UX: product edit auto-save status + product list AlertDialog delete.
- «Додати товар» — той самий URL-патерн, що `adminProductsUrl({ categoryId })` для фільтра списку, але target **`/admin/tovary/novyi?categoryId=`**.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — CALL-05, ADM-CAT-07, ADM-CAT-08 (acceptance text)
- `.planning/ROADMAP.md` — Phase 39 goal and success criteria
- `.planning/PROJECT.md` — v2.1 milestone context (ADM-CALL-05, ADM-CAT-07)

### Call note (current → target)
- `src/components/admin/callback-note-field.tsx` — replace manual save with auto-save
- `src/components/admin/callback-requests-table.tsx` — active vs archive note rendering
- `src/server/actions/admin/callback.actions.ts` — `updateCallbackNoteAction`
- `src/hooks/admin/use-product-auto-save.ts` — pattern for debounced save + status
- `src/lib/debounce.ts` — `createDebounce(ms)`

### Categories table
- `src/components/admin/admin-categories-table.tsx` — DnD, add № + Дії columns
- `src/components/admin/admin-categories-table.test.tsx` — row nav vs link stopPropagation
- `src/components/admin/product-list-delete-button.tsx` — AlertDialog + suppress row nav pattern
- `src/server/actions/admin/category.actions.ts` — `deleteCategoryAction`, `reorderCategoriesAction`
- `src/app/(admin)/admin/tovary/novyi/page.tsx` — `categoryId` searchParam preselect

### Product edit UX reference (status strings only)
- `src/components/admin/product-edit-header.tsx` — «Збереження…» / «Збережено» copy

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `createDebounce` — готовий debounce з flush/cancel
- `useProductAutoSave` — повний патерн snapshot + generation + save chain + SaveStatus
- `ProductListDeleteButton` — table-row delete з AlertDialog і anti-row-nav
- `adminProductsUrl` / novyi page — передвибір категорії для нового товару
- `AdminCategoriesTable` — DnD, `localCategories`, optimistic reorder вже є

### Established Patterns
- Admin tables: `rounded-lg border`, `bg-muted/50` header, clickable rows → edit
- Помилки admin: `toast.error` + mapped error codes
- Успіх autosave в forms: тихий status, не success toast

### Integration Points
- `CallbackNoteField` в `CallbackRequestsTable` (active rows only)
- `AdminCategoriesTable` на `/admin/kategorii` page (server passes categories)
- Delete redirect: після delete category — назад до списку категорій (як category-form redirect у action)

</code_context>

<deferred>
## Deferred Ideas

- Автозбереження полів на `/admin/kategorii/[id]` — **Phase 40** (ADM-CAT-09)
- Icon-only trash у header edit категорії — **Phase 40** (ADM-CAT-10)
- Уніфікація `window.confirm` у `category-form` з AlertDialog — можна в 40, не блокує 39

</deferred>

---

*Phase: 39-calls-auto-save-categories-table-actions*
*Context gathered: 2026-05-21*
