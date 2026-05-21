---
phase: 40-category-edit-ux
reviewed: 2026-05-21T00:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - src/hooks/admin/use-category-auto-save.ts
  - src/hooks/admin/use-category-auto-save.test.ts
  - src/components/admin/category-edit-delete-button.tsx
  - src/components/admin/category-edit-delete-button.test.tsx
  - src/components/admin/category-edit-header.tsx
  - src/components/admin/category-edit-page-content.tsx
  - src/components/admin/category-form.tsx
  - src/app/(admin)/admin/kategorii/[id]/page.tsx
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Phase 40: Code Review Report

**Reviewed:** 2026-05-21
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

This phase delivers the category edit page with auto-save UX: a `useCategoryAutoSave` hook, a `CategoryEditDeleteButton` with confirmation dialog, a `CategoryEditHeader` that wires the flush-on-navigate callback, and the server page that composes them. The architecture is sound overall — sequential save chaining, generation-counter stale-result guard, and debounce cancel/flush lifecycle are all sensible. Three warnings and three info items are found; none are data-loss blockers, but two warnings directly degrade user-visible reliability.

## Warnings

### WR-01: Silent failure on thrown exceptions in auto-save

**File:** `src/hooks/admin/use-category-auto-save.ts:102`

**Issue:** The `.catch` at the end of `saveChainRef.current` sets `status` back to `"idle"` but shows no toast and gives no user feedback. This catch fires for every non-`result.ok` failure path: network fetch errors, auth session expiry (`requireAdmin()` throws), and any unexpected exception from the action. From the user's perspective the indicator silently resets, leaving them with no indication that their edits were not persisted.

```ts
// current
.catch(() => {
  setStatus("idle");
});
```

**Fix:** Log and toast on unknown/thrown errors the same way `result.ok === false` does:

```ts
.catch(() => {
  setStatus("idle");
  toast.error(errorMessages.UNKNOWN);
});
```

---

### WR-02: `initialValues` object recreated on every render causes unnecessary effect churn

**File:** `src/components/admin/category-form.tsx:57`

**Issue:** `initialValues` is constructed as a plain object literal on every render of `CategoryForm` (lines 57–60). Because `useCategoryAutoSave` declares `[initialValues]` as a dependency of its first `useEffect` (line 63 of the hook), React sees a new reference on every render and runs the effect cleanup: `debounce.cancel()` and `clearTimeout(savedTimeoutRef.current)`. The second effect immediately reschedules the debounce, so saves are not permanently lost, but `savedTimeoutRef.current` is cleared prematurely — the "Збережено" indicator disappears on the next re-render (e.g., when the user starts typing after a successful save) rather than persisting for the intended 2 000 ms.

**Fix:** Memoize `initialValues` in `CategoryForm` so its reference is stable across renders:

```ts
// src/components/admin/category-form.tsx
import { useMemo } from "react";

const initialValues = useMemo<UpsertCategoryInput>(
  () => ({
    name: defaultValues?.name ?? "",
    sortOrder: defaultValues?.sortOrder ?? maxRank,
  }),
  // defaultValues reference is stable (comes from server-rendered page props)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [defaultValues?.name, defaultValues?.sortOrder, maxRank],
);
```

---

### WR-03: `SLUG_ALREADY_EXISTS` error not mapped in `CategoryForm.errorMessages`

**File:** `src/components/admin/category-form.tsx:20`

**Issue:** `createCategoryAction` can return `{ ok: false, error: "SLUG_ALREADY_EXISTS" }` (see `category.actions.ts` → `mapCategoryError`). `CategoryForm.errorMessages` has no entry for that key, so it falls through to `errorMessages.UNKNOWN` ("Не вдалося зберегти категорію. Спробуйте ще раз."). The user cannot distinguish a transient failure from a slug conflict and does not know to change the category name.

```ts
// current — SLUG_ALREADY_EXISTS is absent
const errorMessages: Record<string, string> = {
  CATEGORY_HAS_PRODUCTS: "...",
  CATEGORY_NOT_FOUND: "...",
  UNKNOWN: "Не вдалося зберегти категорію. Спробуйте ще раз.",
};
```

**Fix:** Add the missing entry:

```ts
const errorMessages: Record<string, string> = {
  CATEGORY_HAS_PRODUCTS: "У категорії є товари. Спочатку перемістіть або видаліть їх.",
  CATEGORY_NOT_FOUND: "Категорію не знайдено.",
  SLUG_ALREADY_EXISTS: "Категорія з такою назвою вже існує. Змініть назву.",
  UNKNOWN: "Не вдалося зберегти категорію. Спробуйте ще раз.",
};
```

## Info

### IN-01: Toast mocks not reset between tests in `CategoryEditDeleteButton` test suite

**File:** `src/components/admin/category-edit-delete-button.test.tsx:23`

**Issue:** `toast.error` and `toast.success` mocks are established via `vi.mock("sonner", ...)` but never reset between individual tests (no `beforeEach` clears them). Tests 1 and 2 each trigger one toast call. If vitest runs them in order, stale calls accumulate on the mock. Test 3 does call `vi.mocked(deleteCategoryFromListAction).mockReset()` but leaves the toast mocks dirty. The current test assertions happen to be robust to this (they do not check call counts on toast in a way that would produce false positives), but a future assertion that checks `toast.error` has not been called would silently pass incorrectly.

**Fix:** Add `beforeEach` to reset all mocks:

```ts
beforeEach(() => {
  vi.mocked(deleteCategoryFromListAction).mockReset();
  vi.mocked(toast.error).mockReset();
  vi.mocked(toast.success).mockReset();
  push.mockReset();
});
```

---

### IN-02: Edit-mode form submit is a silent no-op

**File:** `src/components/admin/category-form.tsx:77`

**Issue:** In `mode === "edit"`, `onSubmit` does nothing except `setError(null)` (the `if (mode === "create")` branch returns early). No submit button is rendered, but pressing **Enter** inside any `<input>` still submits the form, calling `onSubmit`, which silently returns. There is no visual feedback for the user that the Enter-key press was received or ignored. This can be confusing — users may expect Enter to confirm the current value, particularly in the `sortOrder` numeric input.

**Fix:** Either add `onKeyDown` to suppress Enter-submits in edit mode, or change the form to not handle submit at all in edit mode:

```tsx
// Option A: prevent implicit submit in edit mode
<form
  onSubmit={onSubmit}
  onKeyDown={mode === "edit" ? (e) => {
    if (e.key === "Enter") e.preventDefault();
  } : undefined}
  className="max-w-lg space-y-6"
>
```

---

### IN-03: `categoryId` type allows empty-string fallback that would surface as a silent server error

**File:** `src/components/admin/category-form.tsx:64`

**Issue:** `CategoryForm` declares `categoryId?: string` (optional). When `mode === "edit"` and the caller omits `categoryId`, the hook receives `categoryId: ""`. Auto-save then calls `updateCategoryAction({ id: "", ... })`. Inside the action, `updateCategorySchema.parse(...)` runs **outside** the `try/catch` block (see `category.actions.ts:65`), so the resulting `ZodError` propagates as a thrown exception. The `.catch` in `saveChainRef` in the hook catches it and sets `status("idle")` without a toast (see WR-01), resulting in silent data loss.

The combination of `categoryId` being optional while `mode: "edit"` requires it is a type-level contract gap. The runtime consequence depends on WR-01 being fixed, but the type gap itself should be addressed.

**Fix:** Narrow the type so `categoryId` is required when `mode === "edit"`:

```ts
type CategoryFormProps =
  | {
      mode: "create";
      categoryId?: never;
      categoryCount?: number;
      defaultValues?: Partial<UpsertCategoryInput>;
      onSaveStatusChange?: (status: SaveStatus) => void;
      onAutoSaveFlushReady?: (flush: () => void) => void;
    }
  | {
      mode: "edit";
      categoryId: string;
      categoryCount?: number;
      defaultValues?: Partial<UpsertCategoryInput>;
      onSaveStatusChange?: (status: SaveStatus) => void;
      onAutoSaveFlushReady?: (flush: () => void) => void;
    };
```

---

_Reviewed: 2026-05-21_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
