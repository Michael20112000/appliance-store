# Phase 39: Calls Auto-save & Categories Table Actions - Pattern Map

**Mapped:** 2026-05-21
**Files analyzed:** 8 new/modified (+ 2 test extensions)
**Analogs found:** 8 / 8

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/hooks/admin/use-callback-note-auto-save.ts` | hook | request-response | `src/hooks/admin/use-product-auto-save.ts` | exact (simpler: string, 400ms) |
| `src/hooks/admin/use-callback-note-auto-save.test.ts` | test | batch | `src/hooks/admin/use-product-auto-save.test.ts` | exact (400ms not 500ms) |
| `src/components/admin/callback-note-field.tsx` | component | request-response | `src/components/admin/product-edit-header.tsx` + current field | role-match |
| `src/components/admin/admin-categories-table.tsx` | component | CRUD + event-driven | same file (extend DnD/table) | exact |
| `src/components/admin/category-table-delete-button.tsx` | component | request-response | `src/components/admin/product-list-delete-button.tsx` | exact |
| `src/components/admin/category-table-delete-button.test.tsx` | test | request-response | `src/components/admin/product-list-delete-button.test.tsx` | exact |
| `src/components/admin/admin-categories-table.test.tsx` | test | request-response | same file (extend row-nav test) | exact |
| `src/server/actions/admin/category.actions.ts` | route/action | CRUD | `src/server/actions/admin/product.actions.ts` (`deleteProductFromListAction`) | exact |

**Unchanged integration (reference only):**

| File | Role | Notes |
|------|------|-------|
| `src/server/actions/admin/callback.actions.ts` | route/action | `updateCallbackNoteAction` — no modify; hook calls as-is |
| `src/components/admin/callback-requests-table.tsx` | component | Active-only `CallbackNoteField`; archived truncate — keep |

## Pattern Assignments

### `src/hooks/admin/use-callback-note-auto-save.ts` (hook, request-response)

**Analog:** `src/hooks/admin/use-product-auto-save.ts`

**Imports & types** (lines 1-14, 24-25):

```typescript
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createDebounce } from "@/lib/debounce";
import { updateCallbackNoteAction } from "@/server/actions/admin/callback.actions";

export type SaveStatus = "idle" | "saving" | "saved";

const SAVED_DISPLAY_MS = 2000;
const DEBOUNCE_MS = 400; // Phase 39: 400 not product's 500
```

**Refs + debounce setup** (lines 40-47, 52-65):

```typescript
const [status, setStatus] = useState<SaveStatus>("idle");
const snapshotRef = useRef(initialNote ?? "");
const generationRef = useRef(0);
const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
const debounceRef = useRef(createDebounce(DEBOUNCE_MS));
const saveChainRef = useRef(Promise.resolve());

useEffect(() => {
  snapshotRef.current = initialNote ?? "";
  const debounce = debounceRef.current;
  return () => {
    debounce.cancel();
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
  };
}, [initialNote]);
```

**Core save chain** (lines 67-107 — adapt: compare string to `snapshotRef`, call `updateCallbackNoteAction({ id, note: value })`, no RHF/Zod on client):

```typescript
const runSave = useCallback(() => {
  saveChainRef.current = saveChainRef.current
    .then(async () => {
      if (value === snapshotRef.current) return;

      const generation = ++generationRef.current;
      setStatus("saving");

      const result = await updateCallbackNoteAction({ id, note: value });

      if (generation !== generationRef.current) return;

      if (!result.ok) {
        // Callback-specific errors (from callback-note-field.tsx today)
        if (result.error === "ALREADY_ARCHIVED") toast.error("Заявку вже в архіві");
        else if (result.error === "NOT_FOUND") toast.error("Заявку не знайдено");
        else toast.error("Не вдалося зберегти нотатку");
        setStatus("idle");
        return; // D-05: do NOT revert value
      }

      snapshotRef.current = value;
      setStatus("saved");
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setStatus("idle"), SAVED_DISPLAY_MS);
    })
    .catch(() => setStatus("idle"));
}, [id, value]);
```

**Debounce on value change** (lines 109-116 pattern):

```typescript
useEffect(() => {
  debounceRef.current(() => runSave());
}, [value, runSave]);
```

**Return shape:** `{ value, setValue, status }` — expose controlled textarea state (product hook returns `{ status, flush }` only because RHF owns values).

**Anti-patterns from current `callback-note-field.tsx`:** no `router.refresh()`, no success toast, no `useTransition`/`pending` disable.

---

### `src/hooks/admin/use-callback-note-auto-save.test.ts` (test, batch)

**Analog:** `src/hooks/admin/use-product-auto-save.test.ts`

**Harness setup** (lines 1-16, 48-57):

```typescript
/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/actions/admin/callback.actions", () => ({
  updateCallbackNoteAction: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(updateCallbackNoteAction).mockResolvedValue({ ok: true });
});
afterEach(() => vi.useRealTimers());
```

**Debounce assertion — use 400ms** (adapt lines 59-77):

```typescript
it("debounces save until 400ms quiet", async () => {
  const { result } = renderHook(() =>
    useCallbackNoteAutoSave("id-1", "initial"),
  );
  act(() => result.current.setValue("updated"));
  await act(async () => { vi.advanceTimersByTime(399); });
  expect(updateCallbackNoteAction).not.toHaveBeenCalled();
  await act(async () => {
    vi.advanceTimersByTime(1);
    await Promise.resolve();
  });
  expect(updateCallbackNoteAction).toHaveBeenCalledTimes(1);
});
```

**Also mirror:** skip when unchanged (lines 91-112), error toast without revert, optional save-chain test (lines 114+).

---

### `src/components/admin/callback-note-field.tsx` (component, request-response)

**Analog (remove):** current manual save (lines 15-51) — **replace entirely**

**Analog (status UI):** `src/components/admin/product-edit-header.tsx` (lines 37-43)

**Hook wiring:**

```tsx
const { value, setValue, status } = useCallbackNoteAutoSave(id, note);

return (
  <div className="flex min-w-[16rem] max-w-md flex-col gap-2">
    <Textarea
      rows={3}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Нотатка для оператора"
    />
    <p className="text-xs text-muted-foreground" aria-live="polite">
      {status === "saving" ? "Збереження…" : null}
      {status === "saved" ? "Збережено" : null}
    </p>
  </div>
);
```

**Remove:** `Button` «Зберегти», `useRouter`, `useTransition`, `disabled={pending}`, `toast.success`, `router.refresh()`.

---

### `src/components/admin/admin-categories-table.tsx` (component, CRUD + event-driven)

**Analog:** same file — extend existing DnD + `localCategories` patterns.

**Optimistic reorder (keep)** (lines 113-131):

```typescript
const reordered = arrayMove(localCategories, oldIndex, newIndex);
const snapshot = localCategories;
setLocalCategories(reordered);
startTransition(async () => {
  const result = await reorderCategoriesAction(reordered.map((c) => c.id));
  if (!result.ok) {
    setLocalCategories(snapshot);
    toast.error("Помилка збереження порядку");
  }
});
```

**№ column — map index** (new; D-08/D-10):

```tsx
{localCategories.map((category, index) => (
  <SortableRow
    key={category.id}
    category={category}
    rowNumber={index + 1}
    onCategoryDeleted={(id) =>
      setLocalCategories((prev) => prev.filter((c) => c.id !== id))
    }
    /* ... */
  />
))}
// In SortableRow: <td className="px-4 py-2 tabular-nums text-muted-foreground">{rowNumber}</td>
```

**Column order (D-09):** `№ → grip → Назва → Товари → Дії` — update `<thead>` accordingly (lines 141-148).

**Дії column** (mirror «Переглянути» link pattern, lines 87-95):

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

**Row nav contract:** `getAdminClickableRowProps` + `stopRowNav` (lines 68-69, 111) — same as existing products link test.

---

### `src/components/admin/category-table-delete-button.tsx` (component, request-response)

**Analog:** `src/components/admin/product-list-delete-button.tsx`

**Imports** (lines 1-19):

```typescript
"use client";

import { useState, useTransition, type MouseEvent } from "react";
import { toast } from "sonner";
import { suppressAdminRowNavigation } from "@/lib/admin/clickable-table-row";
import { deleteCategoryFromListAction } from "@/server/actions/admin/category.actions";
import { AlertDialog, /* ... */ } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
```

**Error map** (from `category-form.tsx` lines 20-25):

```typescript
const errorMessages: Record<string, string> = {
  CATEGORY_HAS_PRODUCTS:
    "У категорії є товари. Спочатку перемістіть або видаліть їх.",
  CATEGORY_NOT_FOUND: "Категорію не знайдено.",
  UNKNOWN: "Не вдалося зберегти категорію. Спробуйте ще раз.",
};
```

**Row nav + dialog** (lines 41-60 — prefer `onDeleted` callback over `router.refresh()` per D-14/research):

```typescript
const stopRowNav = (event: MouseEvent) => event.stopPropagation();

function handleOpenChange(nextOpen: boolean) {
  setOpen(nextOpen);
  if (!nextOpen) suppressAdminRowNavigation();
}

function handleConfirm() {
  suppressAdminRowNavigation();
  startTransition(async () => {
    const result = await deleteCategoryFromListAction(categoryId);
    if (!result.ok) {
      toast.error(errorMessages[result.error] ?? errorMessages.UNKNOWN);
      return;
    }
    toast.success("Категорію видалено"); // mirror product list success toast
    setOpen(false);
    onDeleted?.();
  });
}
```

**UI difference from product:** text `Button` «Видалити» `variant="outline"` + destructive classes (D-15/D-17), not icon-only `Trash2`.

**Wrapper** (line 63):

```tsx
<div data-admin-row-interactive className="inline-flex">
```

---

### `src/components/admin/category-table-delete-button.test.tsx` (test)

**Analog:** `src/components/admin/product-list-delete-button.test.tsx` (lines 18-36)

```typescript
it("stopPropagation on delete button click and pointerdown", () => {
  const parentClick = vi.fn();
  render(
    <div onClick={parentClick} onPointerDown={vi.fn()}>
      <CategoryTableDeleteButton categoryId="cat-1" onDeleted={vi.fn()} />
    </div>,
  );
  const button = screen.getByRole("button", { name: /видалити/i });
  fireEvent.click(button);
  fireEvent.pointerDown(button);
  expect(parentClick).not.toHaveBeenCalled();
});
```

---

### `src/components/admin/admin-categories-table.test.tsx` (test, extend)

**Analog:** existing test (lines 13-40) — copy pattern for new controls.

**Add tests:**

1. № column shows `1`, `2` for two rows; after simulated reorder, numbers update (may need `@dnd-kit` mock or test `rowNumber` via exported helper — prefer testing rendered `tabular-nums` cell text).
2. «Додати товар» link: `href="/admin/tovary/novyi?categoryId=cat-1"`, click does not `push` edit URL.
3. «Видалити» / delete button: same `push` guard as «Переглянути».

**Existing pattern** (lines 29-39):

```typescript
const link = row!.querySelector('a[href="/admin/tovary?categoryId=cat-1"]');
fireEvent.click(link!);
expect(push).not.toHaveBeenCalledWith("/admin/kategorii/cat-1");
```

---

### `src/server/actions/admin/category.actions.ts` (route/action, CRUD)

**Analog:** `src/server/actions/admin/product.actions.ts` `deleteProductFromListAction` (lines 116-132)

**New export (no redirect):**

```typescript
export async function deleteCategoryFromListAction(id: string) {
  await requireAdmin();

  if (!id || typeof id !== "string") {
    return { ok: false as const, error: "UNKNOWN" as const };
  }

  try {
    await deleteCategory(id);
    revalidateCategoryPaths();
    return { ok: true as const };
  } catch (error) {
    return mapCategoryError(error);
  }
}
```

**Do NOT use for table:** `deleteCategoryAction` (lines 89-105) — always `redirect("/admin/kategorii")` on success.

---

## Shared Patterns

### Debounce utility
**Source:** `src/lib/debounce.ts`
**Apply to:** `use-callback-note-auto-save.ts`

```typescript
export function createDebounce(ms: number): DebouncedInvoke {
  // trailing quiet period; flush/cancel on unmount
}
```

### Admin autosave status (no success toast)
**Source:** `src/components/admin/product-edit-header.tsx` (lines 37-43)
**Apply to:** `callback-note-field.tsx` (smaller `text-xs` under field per D-02)

```tsx
<p aria-live="polite">
  {saveStatus === "saving" ? "Збереження…" : null}
  {saveStatus === "saved" ? "Збережено" : null}
</p>
```

### SaveStatus type
**Source:** `src/hooks/admin/use-product-auto-save.ts` (line 13)
**Apply to:** callback hook — export same union or re-export

```typescript
export type SaveStatus = "idle" | "saving" | "saved";
```

### Admin row interaction guard
**Source:** `src/lib/admin/clickable-table-row.ts` (lines 4-14, 18-21, 33-49)
**Apply to:** categories table actions column, delete button

- Wrapper: `data-admin-row-interactive`
- Events: `onClick` + `onPointerDown` → `event.stopPropagation()`
- After AlertDialog close: `suppressAdminRowNavigation()`

### List delete server action (no redirect)
**Source:** `src/server/actions/admin/product.actions.ts` (lines 116-132)
**Apply to:** `deleteCategoryFromListAction`

- `requireAdmin()` → service delete → `revalidate*Paths()` → `{ ok: true }`
- Errors via existing `mapCategoryError`

### Admin table chrome
**Source:** `src/components/admin/admin-categories-table.tsx` (lines 134-148)

```tsx
<div className="overflow-x-auto rounded-lg border border-border bg-background">
  <thead>
    <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
```

### Error toasts only (autosave)
**Source:** `use-product-auto-save.ts` (lines 88-91)
**Apply to:** callback hook — never `toast.success` on note save

### Vitest admin component tests
**Source:** `admin-categories-table.test.tsx`, `product-list-delete-button.test.tsx`

```typescript
/** @vitest-environment jsdom */
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
```

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| — | — | — | All phase files have in-repo analogs |

**Note:** Shared debounced-save primitive across product + callback hooks is explicitly deferred (YAGNI per RESEARCH.md). Phase 39 should duplicate the chain pattern in a slimmer string-only hook.

## Metadata

**Analog search scope:** `src/hooks/admin/`, `src/components/admin/`, `src/server/actions/admin/`, `src/lib/debounce.ts`, `src/lib/admin/clickable-table-row.ts`
**Files scanned:** 14
**Pattern extraction date:** 2026-05-21
