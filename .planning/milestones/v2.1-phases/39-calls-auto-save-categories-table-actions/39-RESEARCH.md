# Phase 39: Calls Auto-save & Categories Table Actions - Research

**Researched:** 2026-05-21
**Domain:** Admin UX — debounced server actions, shadcn tables, row navigation guards
**Confidence:** HIGH (codebase-verified patterns); MEDIUM (delete-from-list action gap — verified in source)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Без toast на успішне збереження — як у редагуванні товару (`ProductEditHeader`: «Збереження…» / «Збережено»).
- **D-02:** Під textarea — компактний `text-xs text-muted-foreground` з `aria-live="polite"`; ті самі українські рядки, що в product edit header.
- **D-03:** Toast **лише на помилку** — зберегти існуючі повідомлення (`ALREADY_ARCHIVED`, `NOT_FOUND`, generic).
- **D-04:** Кнопку «Зберегти» прибрати повністю.
- **D-05:** Текст у полі **не відкочувати** після failed save — оператор може виправити і продовжити (як product auto-save).
- **D-06:** Поле нотатки лишається тільки для **active** view (як зараз); archived — read-only truncate, без змін.
- **D-07:** При `ALREADY_ARCHIVED` / `NOT_FOUND` — toast error, поле не disabled проактивно (рідкі edge cases після архівації іншою вкладкою).
- **D-08:** № = **1-based індекс у `localCategories`** після DnD (`index + 1`), не значення `sortOrder` з БД.
- **D-09:** Колонка «№» — перша після drag-handle (або перед ним, якщо візуально логічніше: **№ → grip → Назва → Товари → Дії**).
- **D-10:** Номер оновлюється **оптимістично** разом із `setLocalCategories` після drag — без окремого refresh.
- **D-11:** **shadcn `AlertDialog`** — не `window.confirm` (консистентно з `ProductListDeleteButton` / `ProductEditDeleteButton`).
- **D-12:** Окремий client-компонент на кшталт `CategoryTableDeleteButton` — mirror `product-list-delete-button.tsx` (toast errors, `suppressAdminRowNavigation`, `stopPropagation` на кліках).
- **D-13:** Текст діалогу — з error map `category-form` / `deleteCategoryAction`: категорія з товарами не видаляється; «дію не можна скасувати» для порожньої.
- **D-14:** Після успішного delete — `router.refresh()` або оновити `localCategories` (planner обере; UX — рядок зникає без повного reload сторінки, якщо можливо).
- **D-15:** Дві **текстові** кнопки `size="sm"` у `flex flex-wrap gap-2` — не icon-only (текстові лейбли з requirements).
- **D-16:** «Додати товар» — `Button variant="outline" asChild` + `Link` на `/admin/tovary/novyi?categoryId={id}` (роут і `searchParams.categoryId` уже підтримані в `novyi/page.tsx`).
- **D-17:** «Видалити» — `variant="outline"` + destructive styling або окремий destructive outline; відкриває AlertDialog.
- **D-18:** Усі кліки в «Дії» — `stopPropagation` / `suppressAdminRowNavigation` (як «Переглянути» в `admin-categories-table.test.tsx`).
- **D-19:** Debounce **400 мс** через існуючий `createDebounce` з `@/lib/debounce` (не 500 мс як у товарів — CALL-05 явно 400).
- **D-20:** Новий hook `useCallbackNoteAutoSave` (або inline у `CallbackNoteField`) — структура як `useProductAutoSave`: snapshot string, generation ref, save chain, skip save якщо unchanged.
- **D-21:** Після save **не** викликати `router.refresh()` на кожен keystroke — лише оновити локальний snapshot; refresh опційно лише якщо server повертає інші поля (за замовчуванням — без refresh).

### Claude's Discretion
- Точне ім’я/розташування hook-файлу; чи виносити спільний debounced-save primitive з product hook.
- Порядок колонок у `<thead>` (№ перед/після grip) — за найкращим візуальним балансом у shadcn table.
- Чи реюзати один delete-dialog компонент між table і edit (Phase 40) — за DRY, без зміни scope 40.

### Deferred Ideas (OUT OF SCOPE)
- Автозбереження полів на `/admin/kategorii/[id]` — **Phase 40** (ADM-CAT-09)
- Icon-only trash у header edit категорії — **Phase 40** (ADM-CAT-10)
- Уніфікація `window.confirm` у `category-form` з AlertDialog — можна в 40, не блокує 39
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CALL-05 | Автозбережена нотатка без кнопки «Зберегти»; 400 мс після останнього введення | `useCallbackNoteAutoSave` + `createDebounce(400)`; прибрати `toast.success` і `router.refresh` з `CallbackNoteField`; status copy з `ProductEditHeader` |
| ADM-CAT-07 | Колонка порядкового номера, оновлюється після DnD | Рендер `index + 1` у `localCategories.map((category, index) => …)` — автоматично змінюється при `arrayMove` + `setLocalCategories` |
| ADM-CAT-08 | Колонка «Дії»: «Додати товар» → novyi з `categoryId`; «Видалити» з підтвердженням | `Link` на `/admin/tovary/novyi?categoryId=`; `CategoryTableDeleteButton` + **новий** `deleteCategoryFromListAction` (див. Architecture) |
</phase_requirements>

## Summary

Phase 39 — два ізольовані UX-патчі в адмінці без нових npm-залежностей. Обидва вже мають канонічні референси в репозиторії: автозбереження товару (`useProductAutoSave` + `ProductEditHeader`) і видалення з таблиці товарів (`ProductListDeleteButton` + `deleteProductFromListAction`).

Для **дзвінків** поточний `CallbackNoteField` — ручне збереження з `useTransition`, success toast і `router.refresh()` на кожен save. Це суперечить locked decisions D-01, D-04, D-21. План: витягнути debounced-save у `useCallbackNoteAutoSave` (400 мс, string snapshot, generation + save chain), показати status під textarea, toast лише на помилки, не чіпати archived view у `CallbackRequestsTable`.

Для **категорій** таблиця вже має DnD і `localCategories`. Додати колонки № і Дії — переважно UI-зміни в `admin-categories-table.tsx` + новий `category-table-delete-button.tsx`. **Критична знахідка:** `deleteCategoryAction` на успіх робить `redirect("/admin/kategorii")` — непридатний для рядка таблиці. Потрібен паралель до `deleteProductFromListAction`: `deleteCategoryFromListAction` без redirect, з `revalidateCategoryPaths()` і `{ ok: true }`.

**Primary recommendation:** Не вигадувати новий стек — клонувати product auto-save (з 400 мс) і product list delete (з list-scoped server action), а № рахувати з `map` index над `localCategories`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Debounced note persistence | API / Backend (`updateCallbackNoteAction` + Prisma service) | Browser (hook debounce, local snapshot) | Збереження й валідація — server; debounce і status — client |
| Note save feedback (Збереження…/Збережено) | Browser | — | Чисто UI; без toast на success |
| Category row index display | Browser (`localCategories` order) | API (`reorderCategoriesAction` persists order) | № — відображення поточного UI-порядку; `sortOrder` у БД — side effect DnD |
| Category delete from table | API (`deleteCategoryFromListAction`) | Browser (AlertDialog, optimistic row removal) | Бізнес-правила (`CATEGORY_HAS_PRODUCTS`) на сервері |
| Add product with preset category | Frontend Server (novyi `searchParams`) | Browser (Link href) | `novyi/page.tsx` вже валідує `categoryId` і передає в `ProductForm` |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `createDebounce` (`@/lib/debounce`) | in-repo | 400 ms quiet-period save | [VERIFIED: codebase] Уже використовується в `useProductAutoSave`; CALL-05 фіксує 400 мс |
| `useProductAutoSave` pattern | in-repo | snapshot + generation + save chain | [VERIFIED: codebase] Канон для admin autosave |
| shadcn `AlertDialog` | in-repo (`@/components/ui/alert-dialog`) | Підтвердження видалення категорії | [VERIFIED: codebase] D-11; `ProductListDeleteButton` |
| `@dnd-kit/*` | ^6.3 / ^10.0 | DnD категорій (без змін) | [VERIFIED: codebase] `AdminCategoriesTable` |
| `sonner` | in-repo | Error toasts only (note + delete) | [VERIFIED: codebase] Admin error UX |
| Vitest + Testing Library | ^4.1 / ^16.3 | Unit/component tests | [VERIFIED: codebase] `vitest.config.ts`, існуючі admin tests |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `suppressAdminRowNavigation` | in-repo | Блок ghost-click після AlertDialog | [VERIFIED: codebase] У `ProductListDeleteButton.handleOpenChange` |
| `getAdminClickableRowProps` | in-repo | Row → edit navigation | [VERIFIED: codebase] Обгортка `data-admin-row-interactive` для кнопок/лінків |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Новий `useCallbackNoteAutoSave` | Inline logic у `CallbackNoteField` | Inline OK для одного поля; hook краще для тестів (mirror product) |
| `router.refresh()` після delete | `setLocalCategories(prev => prev.filter(...))` | Filter — миттєвий UX без RSC round-trip; refresh — простіше, повільніше |
| `deleteCategoryAction` з таблиці | `deleteCategoryFromListAction` | Redirect у form action ламає table UX — **обов’язково** list variant |

**Installation:** Немає нових пакетів у цій фазі.

**Version verification:** Усі залежності — вже в `package.json`; додатковий `npm view` не потрібен.

## Package Legitimacy Audit

> Фаза **не встановлює** нових зовнішніх пакетів. Аудит: **N/A — no new packages**.

## Architecture Patterns

### System Architecture Diagram

```
[Operator types in CallbackNoteField textarea]
        │
        ▼ (onChange → local value)
[useCallbackNoteAutoSave: createDebounce 400ms]
        │ quiet period elapsed
        ▼
[value !== snapshot?] ──no──► (skip)
        │ yes
        ▼
[updateCallbackNoteAction] ──► [requireAdmin + Zod + updateCallbackRequestNote]
        │                              │
        │ ok                           └── revalidatePath /admin/dzvinky (server)
        ▼
[snapshot ← value; status: saved → idle @ 2s]
        │
        │ error (ALREADY_ARCHIVED / NOT_FOUND / UNKNOWN)
        ▼
[toast.error only; value unchanged in field]


[AdminCategoriesTable: localCategories from props]
        │
        ├── map(index) ──► [№ column: index + 1]  (updates on DnD via setLocalCategories)
        │
        ├── DnD end ──► [arrayMove + setLocalCategories] ──► [reorderCategoriesAction]
        │
        └── [Дії column]
                 ├── Link → /admin/tovary/novyi?categoryId={id}  (stopPropagation)
                 └── CategoryTableDeleteButton
                          ├── AlertDialog confirm
                          └── deleteCategoryFromListAction
                                   ├── ok → filter row from localCategories (recommended)
                                   └── error CATEGORY_HAS_PRODUCTS → toast (no redirect)
```

### Recommended Project Structure

```
src/
├── hooks/admin/
│   └── use-callback-note-auto-save.ts    # NEW — mirror use-product-auto-save (string, 400ms)
├── components/admin/
│   ├── callback-note-field.tsx           # MODIFY — hook + status, no Save button
│   ├── admin-categories-table.tsx        # MODIFY — № + Дії columns, pass index
│   └── category-table-delete-button.tsx  # NEW — mirror product-list-delete-button
└── server/actions/admin/
    └── category.actions.ts               # MODIFY — add deleteCategoryFromListAction
```

### Pattern 1: Callback note auto-save hook
**What:** Окремий hook з `SaveStatus`, `snapshotRef`, `generationRef`, `saveChainRef`, `createDebounce(400)`.
**When to use:** `CallbackNoteField` для active rows only (батько вже гейтить archived).
**Example:**
```typescript
// Pattern derived from src/hooks/admin/use-product-auto-save.ts + src/lib/debounce.ts
const DEBOUNCE_MS = 400;
const SAVED_DISPLAY_MS = 2000;

export function useCallbackNoteAutoSave(id: string, initialNote: string | null) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [value, setValue] = useState(initialNote ?? "");
  const snapshotRef = useRef(initialNote ?? "");
  // ... generationRef, saveChainRef, debounceRef = createDebounce(400)
  // on value change → debounce → if value !== snapshot → updateCallbackNoteAction
  // success: snapshotRef = value; setStatus saved; NO router.refresh
  // error: toast.error(...); setStatus idle; do NOT revert value
  return { value, setValue, status };
}
```

### Pattern 2: Status line under textarea
**What:** Той самий copy, що `ProductEditHeader`, але `text-xs` під полем.
**Example:**
```tsx
// From src/components/admin/product-edit-header.tsx (adapt placement)
<p className="text-xs text-muted-foreground" aria-live="polite">
  {status === "saving" ? "Збереження…" : null}
  {status === "saved" ? "Збережено" : null}
</p>
```

### Pattern 3: List-scoped category delete action
**What:** Копія `deleteProductFromListAction` — revalidate без `redirect`.
**When to use:** Видалення з таблиці; `deleteCategoryAction` лишається для edit form (Phase 40).
**Example:**
```typescript
// Mirror src/server/actions/admin/product.actions.ts deleteProductFromListAction
export async function deleteCategoryFromListAction(id: string) {
  await requireAdmin();
  try {
    await deleteCategory(id);
    revalidateCategoryPaths();
    return { ok: true as const };
  } catch (error) {
    return mapCategoryError(error);
  }
}
```

### Pattern 4: Category table row actions
**What:** `data-admin-row-interactive` wrapper + text `Button`s + `Link` + `stopPropagation`.
**Example:**
```tsx
<div data-admin-row-interactive className="flex flex-wrap gap-2">
  <Button variant="outline" size="sm" asChild>
    <Link
      href={`/admin/tovary/novyi?categoryId=${category.id}`}
      onClick={stopRowNav}
      onPointerDown={stopRowNav}
    >
      Додати товар
    </Link>
  </Button>
  <CategoryTableDeleteButton
    categoryId={category.id}
    onDeleted={() => onCategoryDeleted(category.id)}
  />
</div>
```

### Anti-Patterns to Avoid
- **`router.refresh()` після кожного autosave нотатки:** Зайвий RSC round-trip; server уже `revalidatePath` у action.
- **`deleteCategoryAction` з таблиці:** Redirect зламає UX рядка (повна навігація).
- **№ з `category.sortOrder`:** D-08 явно забороняє — плутанина після DnD.
- **`window.confirm` у новому компоненті:** D-11 — лише AlertDialog.
- **Success toast на autosave:** Суперечить D-01/D-03.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Debounce timer | `setTimeout` каскади в компоненті | `createDebounce(400)` | flush/cancel, один quiet-period контракт |
| Autosave race handling | Ad-hoc «last write wins» | generation ref + save chain | Вже в `useProductAutoSave` |
| Delete confirm modal | Custom modal / `confirm()` | shadcn `AlertDialog` | a11y, `suppressAdminRowNavigation` pattern |
| List delete without redirect | Виклик form `deleteCategoryAction` | `deleteCategoryFromListAction` | redirect у form action — [VERIFIED: `category.actions.ts` L99] |

**Key insight:** 90% фази — адаптація двох існуючих admin-патернів; єдиний «новий» backend шматок — list delete action без redirect.

## Common Pitfalls

### Pitfall 1: Revalidate storm on note typing
**What goes wrong:** Кожен save тригерить повний refresh таблиці дзвінків.
**Why it happens:** Залишити `router.refresh()` з поточного `CallbackNoteField`.
**How to avoid:** D-21 — лише оновити `snapshotRef` на клієнті; server `revalidatePath` достатній для інших вкладок.
**Warning signs:** Миготіння таблиці, втрата фокусу в textarea.

### Pitfall 2: Using form delete action in table
**What goes wrong:** Після видалення — redirect на `/admin/kategorii`, рядок не «зникає локально».
**Why it happens:** `deleteCategoryAction` завжди `redirect` на success.
**How to avoid:** Новий `deleteCategoryFromListAction`; table button викликає його.
**Warning signs:** План посилається на `deleteCategoryAction` для table.

### Pitfall 3: Row navigation steals button clicks
**What goes wrong:** Клік «Видалити» або «Додати товар» відкриває edit категорії.
**Why it happens:** `getAdminClickableRowProps` + відсутній `stopPropagation` / `data-admin-row-interactive`.
**How to avoid:** Той самий контракт, що `admin-categories-table.test.tsx` для «Переглянути»; тести на нові кнопки.
**Warning signs:** `push` на `/admin/kategorii/{id}` після кліку в Дії.

### Pitfall 4: Disabling textarea during save
**What goes wrong:** Оператор не може продовжити друкувати під час pending save.
**Why it happens:** Поточний `CallbackNoteField` ставить `disabled={pending}`.
**How to avoid:** Product autosave не блокує поля — прибрати disable на save (лише optional disable на рідкісні fatal cases не потрібні per D-07).
**Warning signs:** Textarea сіра під час «Збереження…».

### Pitfall 5: Requirement says «throttle» but code uses debounce
**What goes wrong:** Плутанина в плані (leading vs trailing edge).
**Why it happens:** REQUIREMENTS.md текст «throttle 400мс»; реалізація — trailing debounce.
**How to avoid:** План явно: **debounce 400ms after last keystroke** (`createDebounce`), як у товарів — узгоджено з CALL-05 і D-19.
**Warning signs:** Задача «implement throttle» з іншою семантикою.

## Code Examples

### Debounce utility (existing)
```typescript
// src/lib/debounce.ts — trailing debounce with flush/cancel
export function createDebounce(ms: number): DebouncedInvoke { /* ... */ }
```

### Product autosave status strings (reuse copy)
```typescript
// src/components/admin/product-edit-header.tsx
{saveStatus === "saving" ? "Збереження…" : null}
{saveStatus === "saved" ? "Збережено" : null}
```

### Category delete error messages (reuse)
```typescript
// src/components/admin/category-form.tsx
const errorMessages: Record<string, string> = {
  CATEGORY_HAS_PRODUCTS:
    "У категорії є товари. Спочатку перемістіть або видаліть їх.",
  CATEGORY_NOT_FOUND: "Категорію не знайдено.",
  UNKNOWN: "Не вдалося зберегти категорію. Спробуйте ще раз.",
};
```

### Novyi page category preselect (already works)
```typescript
// src/app/(admin)/admin/tovary/novyi/page.tsx
const defaultCategoryId =
  categoryId && categories.some((c) => c.id === categoryId)
    ? categoryId
    : categories[0]?.id;
```

### Row index after DnD (no extra state)
```tsx
// In AdminCategoriesTable tbody map
{localCategories.map((category, index) => (
  <SortableRow
    key={category.id}
    category={category}
    rowNumber={index + 1}
    /* ... */
  />
))}
// <td className="px-4 py-2 tabular-nums text-muted-foreground">{rowNumber}</td>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual «Зберегти» + success toast | Debounced autosave + inline status | Phase 39 (calls); products already done | Менше кліків, без toast spam |
| `window.confirm` (category form) | AlertDialog in new table button | Phase 39 table only; form → Phase 40 | Консистентний admin UX |
| `sortOrder` as display № | `index + 1` on `localCategories` | Phase 39 D-08 | Номер = те, що бачить оператор після DnD |

**Deprecated/outdated (for this phase):**
- `CallbackNoteField` success toast + `router.refresh()` on save — замінити повністю.
- Виклик `deleteCategoryAction` з таблиці — замінити на list action.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Після delete краще `filter(localCategories)` ніж `router.refresh()` для D-14 | Architecture | Якщо user хоче повний server sync — refresh теж OK, але повільніше |
| A2 | Textarea не disabled під час saving | Pitfall 4 | Якщо потрібен lock під час save — уточнити з product parity |
| A3 | `deleteCategoryFromListAction` — новий export у тій самій `category.actions.ts` | Pattern 3 | Альтернатива — параметр `fromList` у action; list variant чистіший |

**Verified (no assumption):** `deleteCategoryAction` redirects on success — `src/server/actions/admin/category.actions.ts` lines 96–99.

## Open Questions (RESOLVED)

1. **Спільний debounced-save primitive з product hook?** — **RESOLVED:** окремий `useCallbackNoteAutoSave` у фазі 39; без shared primitive (YAGNI до Phase 40).
   - What we know: Обидва — debounce + snapshot + chain; product додатково RHF + Zod parse.
   - Planner lock: Plan 39-01 Task 2 implements dedicated hook only.

2. **Delete success: `filter` vs `router.refresh()`?** — **RESOLVED:** `setLocalCategories(prev => prev.filter(c => c.id !== id))`; без `router.refresh()` на success.
   - What we know: D-14 залишає вибір planner; `localCategories` вже є.
   - Planner lock: Plan 39-02 Task 2 passes `onDeleted` → parent filter.

3. **Success toast на delete категорії з таблиці?** — **RESOLVED:** `toast.success("Категорію видалено")` як у `ProductListDeleteButton`.
   - What we know: `ProductListDeleteButton` робить `toast.success("Товар видалено")`.
   - Planner lock: Plan 39-02 Task 2 acceptance includes success toast.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vitest, Next | ✓ | v24.14.0 | — |
| npm | scripts | ✓ | 11.9.0 | — |
| Vitest | unit/component tests | ✓ | in package.json | — |
| PostgreSQL | server actions | ✓ (project) | — | Tests mock actions |
| slopcheck | package audit | ✗ | — | N/A — no new packages |

**Missing dependencies with no fallback:** none for this phase.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.x + @testing-library/react 16.x |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test -- src/hooks/admin/use-callback-note-auto-save.test.ts -x` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CALL-05 | Debounce 400ms before save | unit | `npm test -- src/hooks/admin/use-callback-note-auto-save.test.ts -x` | ❌ Wave 0 |
| CALL-05 | No save when unchanged | unit | same | ❌ Wave 0 |
| CALL-05 | Error toast codes, no value revert | unit | same (mock action errors) | ❌ Wave 0 |
| ADM-CAT-07 | № updates when order changes (DnD) | component | `npm test -- src/components/admin/admin-categories-table.test.tsx -x` | ❌ extend existing |
| ADM-CAT-08 | Add product link href + no row nav | component | `npm test -- src/components/admin/admin-categories-table.test.tsx -x` | ❌ extend existing |
| ADM-CAT-08 | Delete stopPropagation | component | `npm test -- src/components/admin/category-table-delete-button.test.tsx -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- <affected-test-path> -x`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/hooks/admin/use-callback-note-auto-save.ts` + `.test.ts` (fake timers, 400ms not 500ms)
- [ ] `src/components/admin/category-table-delete-button.tsx` + `.test.ts`
- [ ] `src/server/actions/admin/category.actions.ts` — `deleteCategoryFromListAction`
- [ ] Extend `admin-categories-table.test.tsx` — № column, novyi link, delete nav guard

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `requireAdmin()` on all actions |
| V4 Access Control | yes | Admin-only routes + server actions |
| V5 Input Validation | yes | Zod (`updateCallbackNoteSchema`, cuid on category id) |
| V6 Cryptography | no | N/A this phase |

### Known Threat Patterns for {stack}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthenticated note/delete | Spoofing | `requireAdmin()` in actions |
| Invalid id / oversized note | Tampering | Zod cuid + `note.max(4000)` |
| CSRF on server actions | Spoofing | Next.js Server Actions + session (Better Auth) |

## Project Constraints (from .cursor/rules/)

- **Stack:** Next.js App Router, TypeScript, Prisma, Tailwind, shadcn, Better Auth — без альтернатив.
- **Locale:** UI українською (status strings, dialogs, toasts).
- **Next.js:** Читати `node_modules/next/dist/docs/` при сумнівах — APIs можуть відрізнятися від training data (`AGENTS.md`).
- **GSD workflow:** Nyquist validation увімкнено — тести в плані обов’язкові.

## Sources

### Primary (HIGH confidence)
- `src/hooks/admin/use-product-auto-save.ts` — autosave pattern
- `src/components/admin/product-edit-header.tsx` — status copy
- `src/components/admin/product-list-delete-button.tsx` — AlertDialog + row nav
- `src/server/actions/admin/product.actions.ts` — `deleteProductFromListAction` pattern
- `src/server/actions/admin/category.actions.ts` — redirect behavior on delete
- `src/lib/debounce.ts` — debounce implementation
- `.planning/phases/39-calls-auto-save-categories-table-actions/39-CONTEXT.md` — locked decisions

### Secondary (MEDIUM confidence)
- `.planning/REQUIREMENTS.md` — CALL-05, ADM-CAT-07, ADM-CAT-08 acceptance text

### Tertiary (LOW confidence)
- none — no unverified external library claims

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all in-repo, no new deps
- Architecture: HIGH — verified redirect gap in category delete action
- Pitfalls: HIGH — derived from current `CallbackNoteField` and table tests

**Research date:** 2026-05-21
**Valid until:** 2026-06-21 (stable admin patterns)
