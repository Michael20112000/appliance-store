# Phase 40: Category Edit UX - Research

**Researched:** 2026-05-21
**Domain:** Admin UI / Client component patterns / Auto-save hook / AlertDialog delete
**Confidence:** HIGH

## Summary

Phase 40 is a narrow, well-constrained UX refactor of a single admin page (`/admin/kategorii/[id]`). All required patterns already exist in the codebase — the product edit page is the direct mirror. There are no new dependencies to install, no new architectural territory to explore. The work is structural mirroring: create `CategoryEditPageContent`, `CategoryEditDeleteButton`, `useCategoryAutoSave`, simplify `CategoryForm` in edit mode, and rewire the server page.

Key differentiator from the product auto-save pattern: `CategoryForm` only has two fields (`name`, `sortOrder`) vs. the multi-field product form. The auto-save hook for categories can be simpler because there is no need to expose `control` to the wrapper — the hook can either live inline in `CategoryEditPageContent` or be extracted to `src/hooks/admin/use-category-auto-save.ts`. Both approaches are valid; the planner should choose based on testability (a dedicated hook file is more testable and matches the project pattern).

The `deleteCategoryAction` in `category.actions.ts` **calls `redirect()` internally**, making it unsuitable for use in a client component. The correct action is `deleteCategoryFromListAction`, which returns `{ ok: true }` or `{ ok: false, error: string }` — exactly matching the pattern used by `ProductEditDeleteButton`. This is the critical integration point to get right.

**Primary recommendation:** Mirror `ProductEditPageContent` / `ProductEditHeader` / `ProductEditDeleteButton` / `useProductAutoSave` exactly, substituting category-specific types and actions. No external packages needed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Both `name` and `sortOrder` fields participate in auto-save with the same debounce. `upsertCategorySchema.safeParse` guards against invalid intermediate saves.
- **D-02:** Debounce = **500 ms** (matching product auto-save `DEBOUNCE_MS = 500`).
- **D-03:** Status line: `text-xs text-muted-foreground` with `aria-live="polite"`. Strings: «Збереження…» / «Збережено» (identical to `ProductEditHeader`).
- **D-04:** Toast **only on error** — no success toast.
- **D-05:** Field text is **not rolled back** after a failed save.
- **D-06:** Header layout mirrors `ProductEditHeader`:
  ```
  ← Назад  (link → /admin/kategorii)
  [h1: Редагувати категорію]         [🗑 icon-trash button]
  [Збереження… / Збережено status line]
  [Переглянути товари btn] [Додати товар btn]
  ```
- **D-07:** Trash button: `variant="ghost" size="icon"`, `aria-label="Видалити категорію"`, `Trash2` icon — identical to `ProductEditDeleteButton`.
- **D-08:** «Переглянути товари» and «Додати товар» buttons stay but move below the status line.
- **D-09:** Delete via **AlertDialog** (not `window.confirm`) — mirror `ProductEditDeleteButton`.
- **D-10:** After successful delete → `router.push("/admin/kategorii")`.
- **D-11:** Error map: `CATEGORY_HAS_PRODUCTS`, `CATEGORY_NOT_FOUND`, `UNKNOWN` — already in `category-form.tsx`, move to new component.
- **D-12:** Create **`CategoryEditPageContent`** client wrapper (mirror `ProductEditPageContent`). Server page renders this wrapper and passes data.
- **D-13:** **`CategoryForm`** simplified in edit-mode: no Save button, no Delete button. Auto-save wired through wrapper via `onSaveStatusChange` and `onAutoSaveFlushReady`.
- **D-14:** Create **`CategoryEditDeleteButton`** client component (mirror `ProductEditDeleteButton`).
- **D-15:** New hook **`useCategoryAutoSave`** (or inline in `CategoryEditPageContent` — planner's discretion); structure: snapshot string, generation ref, save chain, skip save if unchanged.

### Claude's Discretion

- Exact hook file name and location (`hooks/admin/use-category-auto-save.ts` or inline).
- Whether to extract a shared debounced-save primitive from the product hook, or copy the pattern.
- Order of action buttons in header (Переглянути/Додати: same row as h1+trash, or separate row below status).

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADM-CAT-09 | Category edit page auto-saves changes without a Save button — behaviour identical to `/admin/tovary/[id]` | `useProductAutoSave` pattern fully verified; `updateCategoryAction` returns `{ ok: true }` or `{ ok: false, error }` compatible with the pattern |
| ADM-CAT-10 | Delete button on category edit page replaced with icon-only trash button in top-right corner of the page | `ProductEditDeleteButton` + `ProductEditHeader` pattern fully verified; `deleteCategoryFromListAction` is the correct action (no internal redirect) |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Auto-save debounce + status | Client component (hook) | — | RHF `useWatch` + `createDebounce` run in the browser; server only receives validated save calls |
| Form rendering + field registration | Client component (CategoryForm) | — | RHF state lives client-side |
| Header layout + status display | Client component (CategoryEditHeader or inline in CategoryEditPageContent) | — | Reads `saveStatus` state from parent |
| Delete confirmation + navigation | Client component (CategoryEditDeleteButton) | — | Needs `useRouter`, `useTransition`, AlertDialog state |
| Data fetching (category + count) | Server page (`[id]/page.tsx`) | — | Already server component; passes props to client wrapper |
| Persist changes to DB | Server action (`updateCategoryAction`) | — | `"use server"` boundary; called from hook via RHF watch |
| Delete from DB | Server action (`deleteCategoryFromListAction`) | — | Must NOT use `deleteCategoryAction` — that one calls `redirect()` internally |

## Standard Stack

No new packages needed. All dependencies are already installed.

### Core (already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | installed | Form state + `useWatch` for auto-save trigger | Used by `CategoryForm` and `ProductForm` [VERIFIED: codebase] |
| @hookform/resolvers | installed | zod integration | Used by all admin forms [VERIFIED: codebase] |
| zod | installed | Schema validation in `upsertCategorySchema.safeParse` | Guards against invalid intermediate saves [VERIFIED: codebase] |
| lucide-react | installed | `Trash2` icon | Used by `ProductEditDeleteButton` [VERIFIED: codebase] |
| sonner | installed | Error toasts | Used by all admin delete/save flows [VERIFIED: codebase] |
| shadcn AlertDialog | installed | Delete confirmation | Used by `ProductEditDeleteButton`, `CategoryTableDeleteButton` [VERIFIED: codebase] |

### No installation step needed
All libraries above are already in `package.json`. This phase creates only TypeScript/React files.

## Package Legitimacy Audit

No packages are installed in this phase. All required dependencies already exist in the project.

## Architecture Patterns

### System Architecture Diagram

```
Server Page [id]/page.tsx
  │  getCategoryById(id)  → category data
  │  getCategoryCount()   → count (for sortOrder max)
  ↓
CategoryEditPageContent  [client, "use client"]
  │  useState(saveStatus)
  │  useRef(flushRef)
  │  useCategoryAutoSave({ control, categoryId, enabled, initialValues })
  │    └─ useWatch({ control })  →  debounce 500ms  →  updateCategoryAction
  │         └─ setStatus("saving" | "saved" | "idle")
  │
  ├─ CategoryEditHeader
  │    ├─ ← Назад link  (/admin/kategorii)
  │    ├─ h1 "Редагувати категорію"
  │    ├─ status line  (aria-live="polite")
  │    ├─ CategoryEditDeleteButton  [ghost icon, Trash2]
  │    │    └─ AlertDialog → deleteCategoryFromListAction → router.push("/admin/kategorii")
  │    └─ action buttons row: Переглянути товари | Додати товар
  │
  └─ CategoryForm  [mode="edit", simplified]
       ├─ name Input
       ├─ sortOrder Input (type=number)
       └─ no Save/Delete buttons in edit mode
       onSaveStatusChange → setSaveStatus (parent)
       onAutoSaveFlushReady → flushRef.current (parent)

CategoryImageUpload  [separate section, unchanged]
```

### Recommended Component/File Structure

```
src/
├── components/admin/
│   ├── category-edit-page-content.tsx   # NEW: client wrapper (mirror ProductEditPageContent)
│   ├── category-edit-header.tsx         # NEW: header (mirror ProductEditHeader)
│   ├── category-edit-delete-button.tsx  # NEW: icon trash + AlertDialog
│   └── category-form.tsx               # MODIFIED: remove Save/Delete buttons in edit mode
├── hooks/admin/
│   └── use-category-auto-save.ts       # NEW: snapshot + generation + save chain
└── app/(admin)/admin/kategorii/[id]/
    └── page.tsx                        # MODIFIED: render CategoryEditPageContent
```

### Pattern 1: useCategoryAutoSave Hook

**What:** Debounced auto-save for RHF form with snapshot deduplication, generation tracking, and save chain serialization.
**When to use:** Whenever RHF `control` is available and changes should be persisted without a submit button.

```typescript
// Source: mirrors src/hooks/admin/use-product-auto-save.ts [VERIFIED: codebase]
// Key differences from useProductAutoSave:
//   - uses upsertCategorySchema.safeParse (not editProductFormSchema)
//   - calls updateCategoryAction({ id: categoryId, ...parsed.data })
//   - SaveStatus type can be imported from this file (or re-export from use-product-auto-save)

export type SaveStatus = "idle" | "saving" | "saved";

const DEBOUNCE_MS = 500;          // D-02
const SAVED_DISPLAY_MS = 2000;    // same as product

type UseCategoryAutoSaveOptions = {
  control: Control<UpsertCategoryInput>;
  categoryId: string;
  enabled: boolean;
  initialValues: UpsertCategoryInput;
};
```

**Critical implementation note:** `upsertCategorySchema` has a `.transform()` that strips empty `slug`/`description` fields. The snapshot must serialize the **parsed output** (`parsed.data`), not the raw input, to avoid spurious "changed" detections. This is identical to how `useProductAutoSave` serializes `editProductFormSchema.safeParse(watchedRef.current).data`.

### Pattern 2: CategoryEditDeleteButton

**What:** Icon-only ghost button opening AlertDialog; on confirm calls `deleteCategoryFromListAction` and redirects.
**When to use:** Header of category edit page.

```typescript
// Source: mirrors src/components/admin/product-edit-delete-button.tsx [VERIFIED: codebase]
// Key differences:
//   - calls deleteCategoryFromListAction(categoryId)  ← NOT deleteCategoryAction
//   - router.push("/admin/kategorii")  (no categoryId filter needed)
//   - aria-label="Видалити категорію"
//   - AlertDialogTitle: "Видалити категорію?"
//   - errorMessages: CATEGORY_HAS_PRODUCTS / CATEGORY_NOT_FOUND / UNKNOWN

const errorMessages: Record<string, string> = {
  CATEGORY_HAS_PRODUCTS:
    "У категорії є товари. Спочатку перемістіть або видаліть їх.",
  CATEGORY_NOT_FOUND: "Категорію не знайдено.",
  UNKNOWN: "Не вдалося видалити категорію. Спробуйте ще раз.",
};
```

### Pattern 3: CategoryForm simplification in edit mode

**What:** Remove the submit button and delete button when `mode="edit"`. Add `onSaveStatusChange` and `onAutoSaveFlushReady` callback props (same as `ProductForm`). Keep the slug-generation note visible only in `mode="create"`.

```typescript
// Current CategoryForm has:
//   <Button type="submit">Зберегти</Button>   ← REMOVE in edit mode
//   <Button variant="destructive">Видалити</Button>  ← REMOVE entirely (delete moves to header)
//   window.confirm(...)  ← REMOVE entirely

// New props (mirror ProductForm):
  onSaveStatusChange?: (status: SaveStatus) => void;
  onAutoSaveFlushReady?: (flush: () => void) => void;
```

**Note:** `CategoryForm` in `mode="create"` is **not changed** — it keeps its submit button and redirect-on-create behaviour.

### Pattern 4: CategoryEditHeader

**What:** Header with back link, h1, status line, delete button slot, and action buttons row.
**When to use:** Top of the category edit page client wrapper.

```typescript
// Source: mirrors src/components/admin/product-edit-header.tsx [VERIFIED: codebase]
// Key differences:
//   - back href is always "/admin/kategorii" (no dynamic categoryId filter)
//   - h1 text: "Редагувати категорію"
//   - additional row below status: Переглянути товари + Додати товар buttons (moved from page.tsx)

// Status line (identical pattern):
<p
  className="min-h-5 text-sm text-muted-foreground transition-opacity duration-200"
  aria-live="polite"
>
  {saveStatus === "saving" ? "Збереження…" : null}
  {saveStatus === "saved" ? "Збережено" : null}
</p>
```

### Anti-Patterns to Avoid

- **Using `deleteCategoryAction` in the delete button:** This action calls `redirect()` internally (Next.js server redirect), which will throw `NEXT_REDIRECT` in client component context. Use `deleteCategoryFromListAction` instead — it returns `{ ok: true }` and does not redirect.
- **Serializing raw watch values for snapshot comparison:** `upsertCategorySchema` has a `.transform()`. Always serialize `schema.safeParse(values).data` (the transformed output), not the raw `values`, to avoid false "data changed" detections when the transform normalizes whitespace or optional fields.
- **Putting the flush ref call in the back link `onClick` before navigation:** This is an important UX guard from `ProductEditPageContent`. The `onNavigateBack` prop triggers `flushRef.current?.()` before the Next.js router navigates away, ensuring any pending debounced save is dispatched. Include this in `CategoryEditHeader`.
- **Modifying `CategoryForm` create-mode behaviour:** Only edit-mode changes. Create-mode flow (submit button + redirect on success) must remain unchanged.
- **Duplicating `SaveStatus` type:** `SaveStatus = "idle" | "saving" | "saved"` is currently defined in `use-product-auto-save.ts`. Either re-export from there or define locally in `use-category-auto-save.ts` — pick one consistently so `CategoryEditPageContent` can import it.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Debounce with flush/cancel | Custom setTimeout wrapper | `createDebounce` from `@/lib/debounce` | Already handles flush + cancel edge cases |
| Serialized async save chain | Promise queue | `saveChainRef` pattern from `useProductAutoSave` | Prevents out-of-order saves when user types fast |
| Delete confirmation dialog | Custom modal | shadcn `AlertDialog` | Already installed and used consistently |
| RHF watch-based trigger | `onChange` handlers on each input | `useWatch({ control })` | Single subscription, re-renders only on change |

**Key insight:** Every primitive needed for this phase already exists. The task is composition and mirroring, not invention.

## Common Pitfalls

### Pitfall 1: Wrong delete action
**What goes wrong:** `deleteCategoryAction` is called from `CategoryEditDeleteButton`, causing a `NEXT_REDIRECT` exception in the client component.
**Why it happens:** `deleteCategoryAction` calls `redirect("/admin/kategorii")` as part of its server-side logic — this was the original behaviour when the form's delete button triggered a full server roundtrip. `deleteCategoryFromListAction` was added in Phase 39 exactly for client-side use (table delete button).
**How to avoid:** Always use `deleteCategoryFromListAction` in client components. Let the component do its own `router.push` after `{ ok: true }`.
**Warning signs:** Delete action throws "NEXT_REDIRECT" or the component crashes instead of redirecting cleanly.

### Pitfall 2: Snapshot serializing raw form values vs. transformed output
**What goes wrong:** Auto-save triggers on every render even when nothing meaningful changed (e.g., empty description `""` vs. `undefined` after transform).
**Why it happens:** `upsertCategorySchema` transforms `""` description/slug to `undefined`. If snapshot is taken from raw `watchedValues` but compared to transformed data, they never match.
**How to avoid:** Initialize snapshot from `upsertCategorySchema.safeParse(initialValues).data` and compare against `upsertCategorySchema.safeParse(watchedValues).data`. This is exactly the `editProductFormSchema.safeParse(...)` pattern in `useProductAutoSave`.
**Warning signs:** Continuous "Збереження…" cycling on page load with no user input.

### Pitfall 3: Missing flush before back navigation
**What goes wrong:** User edits a field, clicks ← Назад within 500ms — the debounced save is cancelled and the change is lost.
**Why it happens:** The debounce timer is cleared on component unmount before it fires.
**How to avoid:** Pass `onNavigateBack` to `CategoryEditHeader` and call `flushRef.current?.()` in the back link's `onClick`. Mirror the `ProductEditHeader` pattern exactly.
**Warning signs:** Changes are lost when navigating away quickly after typing.

### Pitfall 4: sortOrder field type coercion
**What goes wrong:** `sortOrder` Input with `type="number"` returns a string from the DOM; RHF registers it with `valueAsNumber: true` but `useWatch` may surface the raw value before coercion.
**Why it happens:** `upsertCategorySchema` uses `z.coerce.number()` on `sortOrder`, so `safeParse` will coerce strings to numbers at schema boundary — but only if the value is valid. Intermediate values like `""` or `"-"` will fail validation, which is the intended behaviour (D-01: schema validation prevents incorrect intermediate saves).
**How to avoid:** Pass `{ valueAsNumber: true }` in `form.register("sortOrder", { valueAsNumber: true })` — already present in current `CategoryForm`. Ensure `useCategoryAutoSave` uses `safeParse` result (which handles coercion), not raw watched value.
**Warning signs:** `sortOrder` saves as `NaN` or 0 when user clears the field.

## Code Examples

### useCategoryAutoSave — complete structure
```typescript
// Source: mirrors src/hooks/admin/use-product-auto-save.ts [VERIFIED: codebase]
// File: src/hooks/admin/use-category-auto-save.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWatch, type Control } from "react-hook-form";
import { toast } from "sonner";
import { createDebounce } from "@/lib/debounce";
import { updateCategoryAction } from "@/server/actions/admin/category.actions";
import {
  upsertCategorySchema,
  type UpsertCategoryInput,
} from "@/server/validators/category";

export type SaveStatus = "idle" | "saving" | "saved";

const DEBOUNCE_MS = 500;
const SAVED_DISPLAY_MS = 2000;

const errorMessages: Record<string, string> = {
  CATEGORY_HAS_PRODUCTS: "У категорії є товари. Спочатку перемістіть або видаліть їх.",
  CATEGORY_NOT_FOUND: "Категорію не знайдено.",
  UNKNOWN: "Не вдалося зберегти категорію. Спробуйте ще раз.",
};

type UseCategoryAutoSaveOptions = {
  control: Control<UpsertCategoryInput>;
  categoryId: string;
  enabled: boolean;
  initialValues: UpsertCategoryInput;
};

export function useCategoryAutoSave({
  control,
  categoryId,
  enabled,
  initialValues,
}: UseCategoryAutoSaveOptions) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const snapshotRef = useRef("");
  const generationRef = useRef(0);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const debounceRef = useRef(createDebounce(DEBOUNCE_MS));
  const saveChainRef = useRef(Promise.resolve());
  const watchedValues = useWatch({ control });
  const watchedRef = useRef(watchedValues);
  watchedRef.current = watchedValues;

  useEffect(() => {
    const parsed = upsertCategorySchema.safeParse(initialValues);
    if (parsed.success) {
      snapshotRef.current = JSON.stringify(parsed.data);
    }
    const debounce = debounceRef.current;
    return () => {
      debounce.cancel();
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, [initialValues]);

  const runSave = useCallback(() => {
    if (!enabled) return;
    saveChainRef.current = saveChainRef.current
      .then(async () => {
        const parsed = upsertCategorySchema.safeParse(watchedRef.current);
        if (!parsed.success) return;
        const serialized = JSON.stringify(parsed.data);
        if (serialized === snapshotRef.current) return;
        const generation = ++generationRef.current;
        setStatus("saving");
        const result = await updateCategoryAction({ id: categoryId, ...parsed.data });
        if (generation !== generationRef.current) return;
        if (!result.ok) {
          toast.error(errorMessages[result.error] ?? errorMessages.UNKNOWN);
          setStatus("idle");
          return;
        }
        snapshotRef.current = serialized;
        setStatus("saved");
        if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
        savedTimeoutRef.current = setTimeout(() => setStatus("idle"), SAVED_DISPLAY_MS);
      })
      .catch(() => { setStatus("idle"); });
  }, [enabled, categoryId]);

  const serializedWatch = JSON.stringify(watchedValues);
  useEffect(() => {
    if (!enabled) return;
    debounceRef.current(() => { runSave(); });
  }, [enabled, serializedWatch, runSave]);

  const flush = useCallback(() => { debounceRef.current.flush(); }, []);
  return { status, flush };
}
```

### CategoryEditDeleteButton — key points
```typescript
// Source: mirrors src/components/admin/product-edit-delete-button.tsx [VERIFIED: codebase]
// Critical: use deleteCategoryFromListAction, NOT deleteCategoryAction
import { deleteCategoryFromListAction } from "@/server/actions/admin/category.actions";

function handleConfirm() {
  startTransition(async () => {
    const result = await deleteCategoryFromListAction(categoryId);
    if (!result.ok) {
      toast.error(errorMessages[result.error] ?? errorMessages.UNKNOWN);
      return;
    }
    toast.success("Категорію видалено");
    setOpen(false);
    router.push("/admin/kategorii");
  });
}
```

### Server page refactor
```typescript
// Source: current src/app/(admin)/admin/kategorii/[id]/page.tsx [VERIFIED: codebase]
// Replace CategoryForm render with CategoryEditPageContent wrapper:
import { CategoryEditPageContent } from "@/components/admin/category-edit-page-content";

// Pass: categoryId, defaultValues { name, sortOrder }, categoryCount
// CategoryImageUpload section remains unchanged below the wrapper
<CategoryEditPageContent
  categoryId={category.id}
  defaultValues={{ name: category.name, sortOrder: category.sortOrder }}
  categoryCount={await getCategoryCount()}
/>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `window.confirm` for delete | shadcn `AlertDialog` | Phase 39 (CategoryTableDeleteButton) | Phase 40 must match — no `window.confirm` |
| Footer delete button in form | Icon-only trash in page header | Phase 40 (this phase) | Cleaner separation of concerns |
| Manual Save button in form | Auto-save with debounce | Phase 40 (this phase) | Product edit UX parity |

**Deprecated/outdated in `category-form.tsx`:**
- `onDelete` function with `window.confirm` — remove entirely
- `<Button type="submit">Зберегти</Button>` in edit mode — remove
- `<Button variant="destructive">Видалити</Button>` in edit mode — remove

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `updateCategoryAction` returns `{ ok: true }` or `{ ok: false, error: string }` compatible with the auto-save hook pattern | Standard Stack | Low — verified directly in `category.actions.ts` |
| A2 | `deleteCategoryFromListAction` does not call `redirect()` internally | Common Pitfalls | High — but verified by reading `category.actions.ts` lines 108–122 |

**All claims in this research were verified by direct codebase inspection. No user confirmation needed.**

## Open Questions (RESOLVED)

1. **Shared `SaveStatus` type location**
   - What we know: `SaveStatus = "idle" | "saving" | "saved"` is currently exported from `use-product-auto-save.ts`; `use-callback-note-auto-save.ts` re-defines it locally.
   - What's unclear: Whether to import from `use-product-auto-save.ts`, re-define locally, or create a shared `@/types/admin.ts`.
   - Recommendation: Define locally in `use-category-auto-save.ts` (matching the callback hook pattern), and have `CategoryEditPageContent` import `SaveStatus` from the category hook. Avoids coupling to the product module.

2. **Header component: standalone vs. inline**
   - What we know: `ProductEditHeader` is a separate `product-edit-header.tsx` file.
   - What's unclear: Whether to create `category-edit-header.tsx` or inline the header JSX in `CategoryEditPageContent`.
   - Recommendation: Create `category-edit-header.tsx` (mirrors project convention, improves testability). The added action-button row (Переглянути/Додати) is modest enough for a single component file.

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — this phase creates TypeScript/React files only, using already-installed packages).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + @testing-library/react |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `vitest run --reporter=verbose src/hooks/admin/use-category-auto-save.test.ts` |
| Full suite command | `vitest run` |

### Phase Requirements → Test Map

| Req ID | Behaviour | Test Type | Automated Command | File Exists? |
|--------|-----------|-----------|-------------------|-------------|
| ADM-CAT-09 | Debounces save until 500ms quiet | unit | `vitest run src/hooks/admin/use-category-auto-save.test.ts` | ❌ Wave 0 |
| ADM-CAT-09 | Skips save when schema validation fails (e.g., empty name) | unit | `vitest run src/hooks/admin/use-category-auto-save.test.ts` | ❌ Wave 0 |
| ADM-CAT-09 | Skips save when snapshot unchanged after success | unit | `vitest run src/hooks/admin/use-category-auto-save.test.ts` | ❌ Wave 0 |
| ADM-CAT-09 | Shows error toast on failed save, does not roll back field text | unit | `vitest run src/hooks/admin/use-category-auto-save.test.ts` | ❌ Wave 0 |
| ADM-CAT-09 | Transitions saving → saved → idle (no success toast) | unit | `vitest run src/hooks/admin/use-category-auto-save.test.ts` | ❌ Wave 0 |
| ADM-CAT-10 | Opens AlertDialog on trash button click | unit | `vitest run src/components/admin/category-edit-delete-button.test.tsx` | ❌ Wave 0 |
| ADM-CAT-10 | Calls deleteCategoryFromListAction and redirects on confirm | unit | `vitest run src/components/admin/category-edit-delete-button.test.tsx` | ❌ Wave 0 |
| ADM-CAT-10 | Shows error toast on delete failure, does not redirect | unit | `vitest run src/components/admin/category-edit-delete-button.test.tsx` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `vitest run src/hooks/admin/use-category-auto-save.test.ts src/components/admin/category-edit-delete-button.test.tsx`
- **Per wave merge:** `vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/hooks/admin/use-category-auto-save.test.ts` — covers ADM-CAT-09 (5 test cases above)
- [ ] `src/components/admin/category-edit-delete-button.test.tsx` — covers ADM-CAT-10 (3 test cases above)

Test structure should mirror:
- `use-product-auto-save.test.ts` for the hook (fake timers, `renderHook`, `useForm` harness)
- `product-edit-delete-button.test.tsx` for the delete button (`vi.mock("next/navigation")`, `waitFor`, `toast` assertions)

## Security Domain

> `security_enforcement` not set to false in config — section required.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Admin route protection already handled by `requireAdmin()` in server actions |
| V3 Session Management | no | Handled at middleware level, not in this phase |
| V4 Access Control | yes | `requireAdmin()` is called in both `updateCategoryAction` and `deleteCategoryFromListAction` — already implemented |
| V5 Input Validation | yes | `upsertCategorySchema.safeParse` in hook; `updateCategorySchema.parse` in action |
| V6 Cryptography | no | Not applicable |

### Known Threat Patterns for admin form auto-save

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthenticated save via direct action call | Elevation of Privilege | `requireAdmin()` in `updateCategoryAction` [VERIFIED: codebase] |
| Mass assignment via unvalidated input object | Tampering | `updateCategorySchema.parse(input)` validates and strips unknown fields [VERIFIED: codebase] |
| Rapid-fire save flooding (no debounce) | DoS | 500ms debounce in `useCategoryAutoSave` + save chain serialization |

## Sources

### Primary (HIGH confidence)
- `src/components/admin/product-edit-page-content.tsx` — client wrapper pattern (direct codebase read)
- `src/components/admin/product-edit-header.tsx` — header layout + status line pattern (direct codebase read)
- `src/components/admin/product-edit-delete-button.tsx` — icon-trash + AlertDialog + router.push (direct codebase read)
- `src/hooks/admin/use-product-auto-save.ts` — full auto-save hook pattern (direct codebase read)
- `src/hooks/admin/use-callback-note-auto-save.ts` — simpler variant without RHF (direct codebase read)
- `src/server/actions/admin/category.actions.ts` — action return shapes, redirect vs no-redirect (direct codebase read)
- `src/server/validators/category.ts` — schema with transform (direct codebase read)
- `src/lib/debounce.ts` — createDebounce API (direct codebase read)
- `src/components/admin/category-form.tsx` — current state to be modified (direct codebase read)
- `src/app/(admin)/admin/kategorii/[id]/page.tsx` — server page to be refactored (direct codebase read)
- `src/components/admin/category-table-delete-button.tsx` — Phase 39 AlertDialog pattern for categories (direct codebase read)

### Secondary (MEDIUM confidence)
- `src/hooks/admin/use-product-auto-save.test.ts` — test structure reference for Wave 0 gap tests
- `src/components/admin/product-edit-delete-button.test.tsx` — test structure reference

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — all dependencies verified by codebase inspection
- Architecture: HIGH — direct mirror of verified existing patterns
- Pitfalls: HIGH — each pitfall grounded in specific codebase evidence (e.g., `deleteCategoryAction` redirect, schema transform)
- Test requirements: HIGH — existing test files for mirror components confirm testing approach

**Research date:** 2026-05-21
**Valid until:** 2026-07-01 (stable codebase; only changes if product edit page is significantly refactored)
