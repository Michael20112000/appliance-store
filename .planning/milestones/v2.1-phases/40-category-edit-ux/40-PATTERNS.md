# Phase 40: Category Edit UX - Pattern Map

**Mapped:** 2026-05-21
**Files analyzed:** 7 (5 new, 2 modified)
**Analogs found:** 7 / 7

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/hooks/admin/use-category-auto-save.ts` | hook | event-driven | `src/hooks/admin/use-product-auto-save.ts` | exact |
| `src/components/admin/category-edit-page-content.tsx` | component | request-response | `src/components/admin/product-edit-page-content.tsx` | exact |
| `src/components/admin/category-edit-header.tsx` | component | request-response | `src/components/admin/product-edit-header.tsx` | exact |
| `src/components/admin/category-edit-delete-button.tsx` | component | request-response | `src/components/admin/product-edit-delete-button.tsx` | exact |
| `src/components/admin/category-form.tsx` | component | CRUD | `src/components/admin/category-form.tsx` (current) | self (modify) |
| `src/app/(admin)/admin/kategorii/[id]/page.tsx` | route | request-response | `src/app/(admin)/admin/kategorii/[id]/page.tsx` (current) | self (modify) |
| `src/hooks/admin/use-category-auto-save.test.ts` | test | — | `src/hooks/admin/use-product-auto-save.test.ts` | exact |
| `src/components/admin/category-edit-delete-button.test.tsx` | test | — | `src/components/admin/product-edit-delete-button.test.tsx` | exact |

---

## Pattern Assignments

### `src/hooks/admin/use-category-auto-save.ts` (hook, event-driven)

**Analog:** `src/hooks/admin/use-product-auto-save.ts`

**Imports pattern** (lines 1–12):
```typescript
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
```

**Type exports and constants** (lines 13–26):
```typescript
export type SaveStatus = "idle" | "saving" | "saved";

const SAVED_DISPLAY_MS = 2000;
const DEBOUNCE_MS = 500;  // D-02

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
```

**Refs setup** (lines 40–50 in analog):
```typescript
const [status, setStatus] = useState<SaveStatus>("idle");
const snapshotRef = useRef("");
const generationRef = useRef(0);
const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
const debounceRef = useRef(createDebounce(DEBOUNCE_MS));
const saveChainRef = useRef(Promise.resolve());
const watchedValues = useWatch({ control });
const watchedRef = useRef(watchedValues);
watchedRef.current = watchedValues;
```

**Init effect — snapshot from parsed output** (lines 52–65 in analog):
```typescript
useEffect(() => {
  // CRITICAL: serialize parsed.data not raw initialValues
  // upsertCategorySchema has .transform() that strips empty slug/description
  const parsed = upsertCategorySchema.safeParse(initialValues);
  if (parsed.success) {
    snapshotRef.current = JSON.stringify(parsed.data);
  }

  const debounce = debounceRef.current;
  return () => {
    debounce.cancel();
    if (savedTimeoutRef.current) {
      clearTimeout(savedTimeoutRef.current);
    }
  };
}, [initialValues]);
```

**runSave callback** (lines 67–107 in analog):
```typescript
const runSave = useCallback(() => {
  if (!enabled) return;

  saveChainRef.current = saveChainRef.current
    .then(async () => {
      const parsed = upsertCategorySchema.safeParse(watchedRef.current);
      if (!parsed.success) return;  // D-01: skip invalid intermediate values

      const serialized = JSON.stringify(parsed.data);
      if (serialized === snapshotRef.current) return;  // skip if unchanged

      const generation = ++generationRef.current;
      setStatus("saving");

      const result = await updateCategoryAction({ id: categoryId, ...parsed.data });

      if (generation !== generationRef.current) return;  // stale generation, discard

      if (!result.ok) {
        toast.error(errorMessages[result.error] ?? errorMessages.UNKNOWN);  // D-04
        setStatus("idle");
        return;
        // D-05: do NOT roll back field text
      }

      snapshotRef.current = serialized;
      setStatus("saved");
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
      savedTimeoutRef.current = setTimeout(() => setStatus("idle"), SAVED_DISPLAY_MS);
    })
    .catch(() => {
      setStatus("idle");
    });
}, [enabled, categoryId]);
```

**Watch effect + flush return** (lines 109–123 in analog):
```typescript
const serializedWatch = JSON.stringify(watchedValues);

useEffect(() => {
  if (!enabled) return;
  debounceRef.current(() => {
    runSave();
  });
}, [enabled, serializedWatch, runSave]);

const flush = useCallback(() => {
  debounceRef.current.flush();
}, []);

return { status, flush };
```

---

### `src/components/admin/category-edit-page-content.tsx` (component, request-response)

**Analog:** `src/components/admin/product-edit-page-content.tsx`

**Imports pattern** (lines 1–9):
```typescript
"use client";

import { useRef, useState } from "react";
import type { SaveStatus } from "@/hooks/admin/use-category-auto-save";
import type { UpsertCategoryInput } from "@/server/validators/category";
import { CategoryEditDeleteButton } from "@/components/admin/category-edit-delete-button";
import { CategoryEditHeader } from "@/components/admin/category-edit-header";
import { CategoryForm } from "@/components/admin/category-form";
```

**Props type** (lines 24–38 in analog):
```typescript
type CategoryEditPageContentProps = {
  categoryId: string;
  categoryCount: number;
  defaultValues: {
    name: string;
    sortOrder: number;
  };
};
```

**Core component body** (lines 40–86 in analog):
```typescript
export function CategoryEditPageContent({
  categoryId,
  categoryCount,
  defaultValues,
}: CategoryEditPageContentProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const flushRef = useRef<(() => void) | null>(null);

  const formDefaults: UpsertCategoryInput = {
    name: defaultValues.name,
    sortOrder: defaultValues.sortOrder,
  };

  return (
    <div className="space-y-8">
      <CategoryEditHeader
        saveStatus={saveStatus}
        categoryId={categoryId}
        onNavigateBack={() => flushRef.current?.()}  // Pitfall 3: flush before back nav
        deleteButton={
          <CategoryEditDeleteButton categoryId={categoryId} />
        }
      />
      <CategoryForm
        mode="edit"
        categoryId={categoryId}
        categoryCount={categoryCount}
        defaultValues={formDefaults}
        onSaveStatusChange={setSaveStatus}
        onAutoSaveFlushReady={(flush) => {
          flushRef.current = flush;
        }}
      />
    </div>
  );
}
```

---

### `src/components/admin/category-edit-header.tsx` (component, request-response)

**Analog:** `src/components/admin/product-edit-header.tsx`

**Imports pattern** (lines 1–4):
```typescript
import Link from "next/link";
import { ArrowLeft, Eye, Plus } from "lucide-react";
import type { SaveStatus } from "@/hooks/admin/use-category-auto-save";
import { Button } from "@/components/ui/button";
```

**Props type** (lines 6–11 in analog):
```typescript
type CategoryEditHeaderProps = {
  saveStatus: SaveStatus;
  categoryId: string;
  deleteButton: React.ReactNode;
  onNavigateBack?: () => void;
};
```

**Back link pattern** (lines 25–32 in analog):
```typescript
// back href is always static for categories — no dynamic filter needed
<Link
  href="/admin/kategorii"
  onClick={onNavigateBack}
  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
>
  <ArrowLeft className="size-4" aria-hidden />
  Назад
</Link>
```

**h1 + status + delete slot** (lines 34–48 in analog):
```typescript
<div className="flex items-start justify-between gap-4">
  <div className="space-y-1">
    <h1 className="text-2xl font-semibold">Редагувати категорію</h1>
    {/* D-03: status line identical to ProductEditHeader */}
    <p
      className="min-h-5 text-sm text-muted-foreground transition-opacity duration-200"
      aria-live="polite"
    >
      {saveStatus === "saving" ? "Збереження…" : null}
      {saveStatus === "saved" ? "Збережено" : null}
    </p>
  </div>
  {deleteButton}
</div>
```

**Action buttons row** (from current `[id]/page.tsx` lines 29–48 — move here under status):
```typescript
{/* D-08: action buttons below status line */}
<div className="flex flex-wrap gap-2">
  <Button
    size="sm"
    variant="outline"
    render={<Link href={`/admin/tovary?categoryId=${categoryId}`} />}
  >
    <Eye className="size-4" aria-hidden />
    Переглянути товари
  </Button>
  <Button
    size="sm"
    render={<Link href={`/admin/tovary/novyi?categoryId=${categoryId}`} />}
  >
    <Plus className="size-4" aria-hidden />
    Додати товар
  </Button>
</div>
```

---

### `src/components/admin/category-edit-delete-button.tsx` (component, request-response)

**Analog:** `src/components/admin/product-edit-delete-button.tsx`

**Imports pattern** (lines 1–19 in analog):
```typescript
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
// CRITICAL: use deleteCategoryFromListAction, NOT deleteCategoryAction
// deleteCategoryAction calls redirect() internally — throws NEXT_REDIRECT in client context
import { deleteCategoryFromListAction } from "@/server/actions/admin/category.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
```

**Error messages** (moved from `category-form.tsx` lines 20–25 per D-11):
```typescript
const errorMessages: Record<string, string> = {
  CATEGORY_HAS_PRODUCTS:
    "У категорії є товари. Спочатку перемістіть або видаліть їх.",
  CATEGORY_NOT_FOUND: "Категорію не знайдено.",
  UNKNOWN: "Не вдалося видалити категорію. Спробуйте ще раз.",
};
```

**Props and state** (lines 30–41 in analog):
```typescript
type CategoryEditDeleteButtonProps = {
  categoryId: string;
};

export function CategoryEditDeleteButton({ categoryId }: CategoryEditDeleteButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
```

**handleConfirm** (lines 43–56 in analog):
```typescript
function handleConfirm() {
  startTransition(async () => {
    const result = await deleteCategoryFromListAction(categoryId);
    if (!result.ok) {
      toast.error(errorMessages[result.error] ?? errorMessages.UNKNOWN);
      return;
    }
    toast.success("Категорію видалено");
    setOpen(false);
    router.push("/admin/kategorii");  // D-10
  });
}
```

**Trigger button** (lines 58–69 in analog — D-07):
```typescript
<Button
  type="button"
  variant="ghost"
  size="icon"
  aria-label="Видалити категорію"
  disabled={pending}
  onClick={() => setOpen(true)}
>
  <Trash2 className="size-4" />
</Button>
```

**AlertDialog** (lines 71–91 in analog):
```typescript
<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Видалити категорію?</AlertDialogTitle>
      <AlertDialogDescription>
        Дію не можна скасувати. Якщо в категорії є товари, видалення буде
        заблоковано.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel disabled={pending}>Скасувати</AlertDialogCancel>
      <AlertDialogAction
        variant="destructive"
        disabled={pending}
        onClick={handleConfirm}
      >
        Видалити
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

### `src/components/admin/category-form.tsx` (component, CRUD — MODIFY)

**Current state being replaced** (lines 75–90):
```typescript
// REMOVE: window.confirm delete pattern (lines 75–90)
const onDelete = async () => {
  if (!categoryId) return;
  if (!window.confirm("Видалити категорію?...")) { return; }
  const result = await deleteCategoryAction(categoryId);
  ...
};

// REMOVE: deleteCategoryAction import (line 8)
// REMOVE: "Видалити" button block (lines 142–151)
// REMOVE: "Зберегти" button in edit mode (lines 138–141)
// KEEP: entire form JSX, fields, create-mode submit path unchanged
```

**New props to add** (mirror product-form pattern):
```typescript
// Add to CategoryFormProps:
onSaveStatusChange?: (status: SaveStatus) => void;
onAutoSaveFlushReady?: (flush: () => void) => void;
```

**Auto-save hook wiring inside form** (mirror how ProductForm wires the hook):
```typescript
// Inside CategoryForm when mode="edit":
const { status, flush } = useCategoryAutoSave({
  control: form.control,
  categoryId: categoryId!,
  enabled: mode === "edit",
  initialValues: form.getValues(),
});

useEffect(() => { onSaveStatusChange?.(status); }, [status, onSaveStatusChange]);
useEffect(() => { onAutoSaveFlushReady?.(flush); }, [flush, onAutoSaveFlushReady]);
```

**Button block simplification** (lines 138–152 — conditional on mode):
```typescript
// Replace current always-visible button group with:
<div className="flex flex-wrap items-center gap-3">
  {mode === "create" ? (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? "Збереження…" : "Зберегти"}
    </Button>
  ) : null}
  {/* No Delete button — moved to CategoryEditDeleteButton in header */}
</div>
```

---

### `src/app/(admin)/admin/kategorii/[id]/page.tsx` (route — MODIFY)

**Current render to replace** (lines 50–58):
```typescript
// REPLACE:
<CategoryForm
  mode="edit"
  categoryId={category.id}
  categoryCount={await getCategoryCount()}
  defaultValues={{ name: category.name, sortOrder: category.sortOrder }}
/>
```

**New render pattern** (from RESEARCH.md server page refactor):
```typescript
// ADD import:
import { CategoryEditPageContent } from "@/components/admin/category-edit-page-content";

// REPLACE CategoryForm render with:
<CategoryEditPageContent
  categoryId={category.id}
  defaultValues={{ name: category.name, sortOrder: category.sortOrder }}
  categoryCount={await getCategoryCount()}
/>
```

**Remove from page.tsx** (lines 1–48):
```typescript
// Remove these imports no longer needed in page.tsx:
// - import Link from "next/link";
// - import { Eye, Plus } from "lucide-react";
// - import { CategoryForm } from "@/components/admin/category-form";
// - import { Button } from "@/components/ui/button";
// - The entire header div with h1 + action buttons (lines 26–49)
//   → moved into CategoryEditHeader
// Keep: getCategoryById, getCategoryCount, notFound, CategoryImageUpload
```

---

### `src/hooks/admin/use-category-auto-save.test.ts` (test)

**Analog:** `src/hooks/admin/use-product-auto-save.test.ts`

**Test file header** (lines 1–16 in analog):
```typescript
/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UpsertCategoryInput } from "@/server/validators/category";
import { useCategoryAutoSave } from "./use-category-auto-save";

vi.mock("@/server/actions/admin/category.actions", () => ({
  updateCategoryAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { updateCategoryAction } from "@/server/actions/admin/category.actions";
```

**Valid fixture values** (lines 18–26 in analog):
```typescript
const validValues: UpsertCategoryInput = {
  name: "Холодильники",
  sortOrder: 1,
};
```

**Harness pattern** (lines 28–46 in analog):
```typescript
function useAutoSaveHarness(
  overrides: Partial<{
    enabled: boolean;
    initialValues: UpsertCategoryInput;
  }> = {},
) {
  const form = useForm<UpsertCategoryInput>({
    defaultValues: overrides.initialValues ?? validValues,
  });

  const autoSave = useCategoryAutoSave({
    control: form.control,
    categoryId: "clcatxxxxxxxxxxxxxxxxxxxxxx",
    enabled: overrides.enabled ?? true,
    initialValues: overrides.initialValues ?? validValues,
  });

  return { form, autoSave };
}
```

**Test structure** (lines 48–57 in analog):
```typescript
describe("useCategoryAutoSave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(updateCategoryAction).mockReset();
    vi.mocked(updateCategoryAction).mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  // ...test cases for: debounce 500ms, schema guard, snapshot skip, error toast, status transitions
});
```

---

### `src/components/admin/category-edit-delete-button.test.tsx` (test)

**Analog:** `src/components/admin/product-edit-delete-button.test.tsx`

**Test file header** (lines 1–20 in analog):
```typescript
/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CategoryEditDeleteButton } from "./category-edit-delete-button";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/server/actions/admin/category.actions", () => ({
  deleteCategoryFromListAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { deleteCategoryFromListAction } from "@/server/actions/admin/category.actions";
import { toast } from "sonner";
```

**Test case pattern** (lines 23–52 in analog):
```typescript
describe("CategoryEditDeleteButton", () => {
  it("opens AlertDialog and redirects to /admin/kategorii on success", async () => {
    vi.mocked(deleteCategoryFromListAction).mockResolvedValue({ ok: true });
    push.mockReset();

    render(<CategoryEditDeleteButton categoryId="clcatxxxxxxxxxxxxxxxxxxxxxx" />);

    fireEvent.click(screen.getByRole("button", { name: "Видалити категорію" }));
    expect(screen.getByText("Видалити категорію?")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Видалити" }));

    await waitFor(() => {
      expect(deleteCategoryFromListAction).toHaveBeenCalledWith("clcatxxxxxxxxxxxxxxxxxxxxxx");
    });
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Категорію видалено");
      expect(push).toHaveBeenCalledWith("/admin/kategorii");
    });
  });
  // Additional: error toast case, no redirect on failure
});
```

---

## Shared Patterns

### Authentication / Authorization
**Source:** `src/server/actions/admin/category.actions.ts` lines 63–65
**Apply to:** All new files that call server actions (auth is in the action, not the component)
```typescript
// In server actions — already present, no changes needed:
export async function updateCategoryAction(input: unknown) {
  await requireAdmin();  // auth guard at action boundary
  ...
}
```

### Error Toast (errors only, no success toast on save)
**Source:** `src/hooks/admin/use-product-auto-save.ts` lines 88–91
**Apply to:** `use-category-auto-save.ts`
```typescript
// D-04: toast ONLY on error
if (!result.ok) {
  toast.error(errorMessages[result.error] ?? errorMessages.UNKNOWN);
  setStatus("idle");
  return;
}
// No toast.success() here — status line handles "Збережено" feedback
```

### Save Status Display
**Source:** `src/components/admin/product-edit-header.tsx` lines 38–43
**Apply to:** `category-edit-header.tsx`
```typescript
<p
  className="min-h-5 text-sm text-muted-foreground transition-opacity duration-200"
  aria-live="polite"
>
  {saveStatus === "saving" ? "Збереження…" : null}
  {saveStatus === "saved" ? "Збережено" : null}
</p>
```

### Flush Before Navigation (anti-data-loss guard)
**Source:** `src/components/admin/product-edit-page-content.tsx` line 65
**Apply to:** `category-edit-page-content.tsx` and `category-edit-header.tsx`
```typescript
// In CategoryEditPageContent: pass onNavigateBack to header
onNavigateBack={() => flushRef.current?.()}

// In CategoryEditHeader: wire onNavigateBack to back link onClick
<Link href="/admin/kategorii" onClick={onNavigateBack} ...>
```

### AlertDialog Delete Confirmation
**Source:** `src/components/admin/category-table-delete-button.tsx` lines 77–97
**Apply to:** `category-edit-delete-button.tsx`
```typescript
// Re-use established category error messages and AlertDialog structure from Phase 39
// category-table-delete-button already has the correct errorMessages Record
// category-edit-delete-button differs only by: ghost+icon button trigger, router.push on success
```

---

## No Analog Found

All files in Phase 40 have exact or near-exact analogs. No files lack a match.

---

## Critical Implementation Notes

### Anti-patterns to avoid (from RESEARCH.md)

1. **Wrong delete action:** Never call `deleteCategoryAction` from a client component.
   - `deleteCategoryAction` (line 89–106 of `category.actions.ts`) calls `redirect("/admin/kategorii")` — throws `NEXT_REDIRECT` in client context.
   - Use `deleteCategoryFromListAction` (lines 108–122) which returns `{ ok: true }` without redirecting.

2. **Snapshot from raw values:** `upsertCategorySchema` has `.transform()` that strips empty `slug`/`description` to `undefined`. Always use `upsertCategorySchema.safeParse(values).data` for snapshot comparison, never raw `values`.

3. **Missing flush before navigation:** Wire `onNavigateBack` → `flushRef.current?.()` before router navigates away to prevent losing debounced-but-not-fired saves.

4. **Modifying create mode:** `CategoryForm` create-mode path (`onSubmit` → `createCategoryAction` → redirect) must remain completely unchanged.

---

## Metadata

**Analog search scope:** `src/hooks/admin/`, `src/components/admin/`, `src/server/actions/admin/`, `src/server/validators/`, `src/app/(admin)/admin/kategorii/`
**Files scanned:** 11 source files + 2 test files
**Pattern extraction date:** 2026-05-21
