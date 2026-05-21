# Phase 40: Category Edit UX - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Два UX-покращення на сторінці редагування категорії `/admin/kategorii/[id]`:

1. **Автозбереження** — поля `name` і `sortOrder` зберігаються автоматично з debounce, без кнопки «Зберегти». Поведінка ідентична `/admin/tovary/[id]`.
2. **Icon-trash у header** — кнопка «Видалити» в footer форми замінюється на icon-only trash у правому верхньому куті сторінки (поруч з h1), з AlertDialog для підтвердження.

Таблиця категорій (`/admin/kategorii`) та інші сторінки — **не входять** до фази 40.

</domain>

<decisions>
## Implementation Decisions

### Автозбереження

- **D-01:** Обидва поля — `name` і `sortOrder` — беруть участь в авто-збереженні з однаковим debounce. Валідація `upsertCategorySchema.safeParse` запобігає некоректним проміжним збереженням (наприклад, під час набору числа).
- **D-02:** Debounce — **500 мс** (як у product auto-save, `DEBOUNCE_MS = 500`).
- **D-03:** Статус-рядок: `text-xs text-muted-foreground` з `aria-live="polite"`. Рядки: «Збереження…» / «Збережено» (ідентично `ProductEditHeader`).
- **D-04:** Toast **лише на помилку** — без toast на успішне збереження.
- **D-05:** Текст у полях **не відкочувати** після failed save.

### Layout header сторінки редагування

- **D-06:** Header структура (дзеркало `ProductEditHeader`):
  ```
  ← Назад  (link → /admin/kategorii)
  [h1: Редагувати категорію]         [🗑 icon-trash button]
  [Збереження… / Збережено status line]
  [Переглянути товари btn] [Додати товар btn]
  ```
- **D-07:** Trash кнопка: `variant="ghost" size="icon"`, `aria-label="Видалити категорію"`, `Trash2` іконка — ідентично `ProductEditDeleteButton`.
- **D-08:** Кнопки «Переглянути товари» і «Додати товар» залишаються, але переносяться нижче рядка статусу (або в окремий рядок під статусом).

### Видалення

- **D-09:** Видалення через **AlertDialog** (не `window.confirm`) — mirror `ProductEditDeleteButton` + узгоджено з `CategoryTableDeleteButton` з Phase 39.
- **D-10:** Після успішного delete — `router.push("/admin/kategorii")` (повернення до списку).
- **D-11:** Error map: `CATEGORY_HAS_PRODUCTS`, `CATEGORY_NOT_FOUND`, `UNKNOWN` — вже є у `category-form.tsx`, перенести в новий компонент.

### Архітектура компонентів

- **D-12:** Створити **`CategoryEditPageContent`** client-wrapper (дзеркало `ProductEditPageContent`). Серверна сторінка `[id]/page.tsx` рендерить цей wrapper і передає дані.
- **D-13:** **`CategoryForm`** спрощується в edit-mode: без кнопки «Зберегти», без кнопки «Видалити». Auto-save підключається через wrapper (аналог `onSaveStatusChange` і `onAutoSaveFlushReady`).
- **D-14:** Створити **`CategoryEditDeleteButton`** client-component (дзеркало `ProductEditDeleteButton`).
- **D-15:** Новий hook **`useCategoryAutoSave`** (або inline у `CategoryEditPageContent` — на розсуд plannerа); структура: snapshot string, generation ref, save chain, skip save if unchanged.

### Claude's Discretion
- Точне ім'я та розташування hook-файлу (`hooks/admin/use-category-auto-save.ts` або inline).
- Чи виносити спільний debounced-save primitive з product hook, чи копіювати патерн.
- Порядок action-кнопок у header (Переглянути/Додати: у тому ж рядку з h1+trash, чи окремий рядок нижче статусу).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — ADM-CAT-09, ADM-CAT-10 (acceptance text)
- `.planning/ROADMAP.md` — Phase 40 goal і success criteria
- `.planning/PROJECT.md` — v2.1 milestone context

### Category edit page (current → target)
- `src/app/(admin)/admin/kategorii/[id]/page.tsx` — серверна сторінка, рендерить `CategoryForm` → замінити на `CategoryEditPageContent`
- `src/components/admin/category-form.tsx` — поточна форма: ручний save + `window.confirm` delete → упростити
- `src/server/actions/admin/category.actions.ts` — `updateCategoryAction`, `deleteCategoryAction`
- `src/server/validators/category.ts` — `upsertCategorySchema`

### Product edit UX reference (pattern to mirror)
- `src/components/admin/product-edit-page-content.tsx` — client wrapper pattern
- `src/components/admin/product-edit-header.tsx` — header layout + status line
- `src/components/admin/product-edit-delete-button.tsx` — icon-trash + AlertDialog + router.push
- `src/hooks/admin/use-product-auto-save.ts` — snapshot + generation + save chain + SaveStatus
- `src/lib/debounce.ts` — `createDebounce(ms)`

### Phase 39 context (patterns already established)
- `.planning/phases/39-calls-auto-save-categories-table-actions/39-CONTEXT.md` — D-12..D-18 AlertDialog delete pattern

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useProductAutoSave` — повний патерн snapshot + generation + save chain + SaveStatus; дзеркалити для категорій
- `ProductEditDeleteButton` — icon-trash + AlertDialog + `router.push` після delete
- `ProductEditHeader` — header layout (back link, h1, status, delete slot)
- `createDebounce` — готовий debounce з flush/cancel
- `upsertCategorySchema` — zod schema з валідацією (запобігає некоректним проміжним saves)

### Established Patterns
- Admin client wrappers: server page передає дані → client component `*PageContent` orchestrates state
- Auto-save status: `min-h-5 text-sm text-muted-foreground aria-live="polite"`, idle=null, saving="Збереження…", saved="Збережено"
- Admin icon buttons: `variant="ghost" size="icon"` + `aria-label`
- Error toasts: `toast.error(errorMessages[code] ?? errorMessages.UNKNOWN)`

### Integration Points
- `CategoryForm` mode="edit" — стане тонким form-компонентом без submit/delete кнопок
- `[id]/page.tsx` (server) → `CategoryEditPageContent` (client wrapper) → `CategoryForm` + header + delete button
- `deleteCategoryAction` повертає `{ ok: true }` або `{ ok: false, error: string }` — повністю сумісне з `ProductEditDeleteButton` патерном

</code_context>

<specifics>
## Specific Ideas

- Користувач: «роби все на свій вибір, головне щоб було зручно і гарно» — повний Claude's discretion на всі три gray areas.
- Референс: поведінка і вигляд мають бути ідентичні `/admin/tovary/[id]` (product edit page).
- Window.confirm у `category-form.tsx` — застарілий патерн, замінити на AlertDialog як частину цієї фази.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 40-category-edit-ux*
*Context gathered: 2026-05-21*
