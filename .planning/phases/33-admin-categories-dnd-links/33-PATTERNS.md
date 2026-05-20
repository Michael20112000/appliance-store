# Phase 33: Admin categories DnD & links - Pattern Map

**Mapped:** 2026-05-20
**Files analyzed:** 5 (4 modified + 1 new)
**Analogs found:** 5 / 5

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/admin/admin-categories-table.tsx` | component | event-driven (DnD) + request-response | `src/components/admin/order-list-status-select.tsx` | role-match (client component with useTransition + server action call + optimistic state) |
| `src/server/actions/admin/category.actions.ts` | server action | request-response | same file (add to existing) | exact (add alongside `deleteCategoryAction`) |
| `src/server/services/admin-catalog.service.ts` | service | CRUD / batch | same file (add to existing) | exact (add alongside `updateCategory`) |
| `src/server/services/admin-catalog-reorder.service.test.ts` | test | — | `src/server/services/admin-catalog.service.test.ts` | exact (same Prisma mock pattern, same service layer) |
| `src/lib/admin/category-sort-order.ts` | utility | transform | itself (read-only, no changes) | n/a — consumed unchanged |

---

## Pattern Assignments

### `src/components/admin/admin-categories-table.tsx` (component, event-driven + request-response)

**Analog:** `src/components/admin/order-list-status-select.tsx`

**Imports pattern to keep** (lines 1-11 of current file):
```typescript
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import {
  adminClickableRowClassName,
  getAdminClickableRowProps,
} from "@/lib/admin/clickable-table-row";
import { adminProductsUrl } from "@/lib/admin/products-url";
import { cn } from "@/lib/utils";
```

**New imports to add** (after existing imports):
```typescript
import { useState, useTransition } from "react";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderCategoriesAction } from "@/server/actions/admin/category.actions";
```

**useTransition + optimistic update pattern** (from `order-list-status-select.tsx` lines 46-103):
```typescript
// From order-list-status-select.tsx lines 46-47, 72-103
const [pending, startTransition] = useTransition();

// Optimistic state seeded from prop (DnD variant):
const [localCategories, setLocalCategories] = useState(categories);

async function applyStatus(nextStatus: OrderStatus) {
  try {
    const result = await updateOrderStatusAction({ orderId, status: nextStatus });
    if (!result.ok) {
      showOrderStatusErrorToast(result.error);
      return;
    }
    // ...
  } catch {
    showOrderStatusErrorToast("UNKNOWN");
  }
}

startTransition(() => applyStatus(nextStatus));
```

**Adapted handleDragEnd pattern** (DnD-specific, follows same optimistic + revert structure):
```typescript
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (!over || active.id === over.id) return;

  const oldIndex = localCategories.findIndex((c) => c.id === active.id);
  const newIndex = localCategories.findIndex((c) => c.id === over.id);
  const reordered = arrayMove(localCategories, oldIndex, newIndex);

  setLocalCategories(reordered); // optimistic

  startTransition(async () => {
    const result = await reorderCategoriesAction(reordered.map((c) => c.id));
    if (!result.ok) {
      setLocalCategories(localCategories); // revert
      toast.error("Помилка збереження порядку");
    }
  });
}
```

**stopRowNav pattern** (from `admin-categories-table.tsx` line 27, also in `order-list-status-select.tsx` line 55):
```typescript
const stopRowNav = (event: MouseEvent) => event.stopPropagation();
```

**ADM-CAT-05 link styling change** (modifying `admin-categories-table.tsx` lines 58-68):
```typescript
// Before (lines 58-68):
<Link
  href={adminProductsUrl({ categoryId: category.id })}
  onClick={stopRowNav}
  onPointerDown={stopRowNav}
>
  Переглянути
  <span className="text-muted-foreground"> ({category.productCount})</span>
</Link>

// After (ADM-CAT-05 — add className only):
<Link
  href={adminProductsUrl({ categoryId: category.id })}
  onClick={stopRowNav}
  onPointerDown={stopRowNav}
  className="font-medium text-primary hover:underline underline-offset-4"
>
  Переглянути
  <span className="text-muted-foreground"> ({category.productCount})</span>
</Link>
```

**ADM-CAT-05 "Порядок" column removal** (lines 36, 70 of current file):
```typescript
// Remove this <th> (line 36):
<th className="px-4 py-2 font-medium">Порядок</th>

// Remove this <td> (line 70):
<td className="px-4 py-2">{category.sortOrder}</td>
```

**SortableRow sub-component pattern** (new, placed above main component):
```typescript
function SortableRow({
  category,
  stopRowNav,
  onNavigate,
}: {
  category: AdminCategoryRow;
  stopRowNav: (event: MouseEvent) => void;
  onNavigate: (href: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const href = `/admin/kategorii/${category.id}`;
  const rowProps = getAdminClickableRowProps({
    href,
    onNavigate,
  });

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...rowProps}
      className={cn("border-b border-border last:border-0", adminClickableRowClassName)}
    >
      <td className="px-2 py-2 w-8 touch-none cursor-grab">
        <GripVertical
          className="size-4 text-muted-foreground"
          {...listeners}
        />
      </td>
      <td className="px-4 py-2">{category.name}</td>
      <td className="px-4 py-2">
        <Link
          href={adminProductsUrl({ categoryId: category.id })}
          onClick={stopRowNav}
          onPointerDown={stopRowNav}
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          Переглянути
          <span className="text-muted-foreground"> ({category.productCount})</span>
        </Link>
      </td>
    </tr>
  );
}
```

**DndContext + SortableContext table wrapper pattern**:
```typescript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 8 }, // prevents click → drag conflict
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);

// In JSX — DndContext wraps <table>, SortableContext wraps <tbody>:
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
        <th className="px-2 py-2 w-8">
          <span className="sr-only">Перетягнути</span>
        </th>
        <th className="px-4 py-2 font-medium">Назва</th>
        <th className="px-4 py-2 font-medium">Товари</th>
      </tr>
    </thead>
    <SortableContext
      items={localCategories.map((c) => c.id)}
      strategy={verticalListSortingStrategy}
    >
      <tbody>
        {localCategories.map((category) => (
          <SortableRow
            key={category.id}
            category={category}
            stopRowNav={stopRowNav}
            onNavigate={(target) => router.push(target)}
          />
        ))}
      </tbody>
    </SortableContext>
  </table>
</DndContext>
```

---

### `src/server/actions/admin/category.actions.ts` (server action, request-response)

**Analog:** Same file — add `reorderCategoriesAction` alongside `deleteCategoryAction` (lines 84-101).

**Pattern to copy from `deleteCategoryAction`** (lines 84-101):
```typescript
export async function deleteCategoryAction(id: string) {
  await requireAdmin();

  if (!id || typeof id !== "string") {
    return { ok: false as const, error: "UNKNOWN" as const };
  }

  try {
    await deleteCategory(id);
    revalidateCategoryPaths();
    redirect("/admin/kategorii");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return mapCategoryError(error);
  }
}
```

**New `reorderCategoriesAction`** (follows same requireAdmin + inline validation + try/catch structure):
```typescript
export async function reorderCategoriesAction(
  orderedIds: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();

  if (!Array.isArray(orderedIds) || orderedIds.some((id) => typeof id !== "string")) {
    return { ok: false as const, error: "INVALID_INPUT" as const };
  }

  try {
    await reorderCategories(orderedIds);
    revalidateCategoryPaths();
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "UNKNOWN" as const };
  }
}
```

**New import to add at top of file** (alongside existing service imports, line 13-14):
```typescript
import {
  // ...existing imports...,
  reorderCategories,
} from "@/server/services/admin-catalog.service";
```

**Note:** `revalidateCategoryPaths()` is already defined at lines 21-28 in this file and already covers `/`, `/admin/kategorii`, and `/katalog` — no changes needed.

---

### `src/server/services/admin-catalog.service.ts` (service, batch CRUD)

**Analog:** Same file — add `reorderCategories` alongside existing functions. The closest internal pattern is `updateCategory` (lines 139-178) which uses `prisma.$transaction` with a loop of `tx.category.update` calls.

**`prisma.$transaction` callback-form pattern** (lines 160-178):
```typescript
return prisma.$transaction(async (tx) => {
  for (const row of ranked) {
    await tx.category.update({
      where: { id: row.id },
      data: {
        sortOrder: row.sortOrder,
        // ...
      },
    });
  }
  return tx.category.findUniqueOrThrow({ where: { id: input.id } });
});
```

**New `reorderCategories`** (uses array-form `$transaction` — simpler for independent updates, no intermediate reads needed):
```typescript
export async function reorderCategories(orderedIds: string[]): Promise<void> {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.category.update({
        where: { id },
        data: { sortOrder: index + 1 },
      })
    )
  );
}
```

**Export placement:** Add after `deleteCategory` at the end of the file (after line 217).

---

### `src/server/services/admin-catalog-reorder.service.test.ts` (test, new file)

**Analog:** `src/server/services/admin-catalog.service.test.ts`

**File header + vi.mock pattern** (lines 1-19):
```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
import {
  appendSlugSuffix,
  // ...
} from "./admin-catalog.service";

vi.mock("@/lib/db", () => ({
  prisma: {
    category: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));
```

**New test file structure** (extend mock to include `$transaction`):
```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
import { reorderCategories } from "./admin-catalog.service";

vi.mock("@/lib/db", () => ({
  prisma: {
    category: {
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("reorderCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("assigns sortOrder 1..n based on orderedIds array position", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([]);
    await reorderCategories(["a", "b", "c"]);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    // The array passed to $transaction has 3 elements
    const calls = vi.mocked(prisma.$transaction).mock.calls[0][0];
    expect(Array.isArray(calls)).toBe(true);
    expect(calls).toHaveLength(3);
  });

  it("placing B before A assigns B sortOrder 1 and A sortOrder 2", async () => {
    vi.mocked(prisma.category.update)
      .mockResolvedValueOnce({ id: "b", sortOrder: 1 })
      .mockResolvedValueOnce({ id: "a", sortOrder: 2 });
    vi.mocked(prisma.$transaction).mockImplementation(async (ops) => {
      if (Array.isArray(ops)) return Promise.all(ops);
      return ops(prisma);
    });

    await reorderCategories(["b", "a"]);

    expect(prisma.category.update).toHaveBeenNthCalledWith(1,
      expect.objectContaining({ where: { id: "b" }, data: { sortOrder: 1 } })
    );
    expect(prisma.category.update).toHaveBeenNthCalledWith(2,
      expect.objectContaining({ where: { id: "a" }, data: { sortOrder: 2 } })
    );
  });
});
```

**Test discovery:** `vitest.config.ts` already picks up `src/**/*.test.ts` — no config change needed.

---

## Shared Patterns

### requireAdmin (Authentication Guard)
**Source:** `src/server/actions/admin/category.actions.ts` line 6 (import) + line 43 (usage)
**Apply to:** `reorderCategoriesAction` — first line before any logic
```typescript
import { requireAdmin } from "@/lib/permissions";

// First line of every server action:
await requireAdmin();
```

### revalidateCategoryPaths (Path Invalidation)
**Source:** `src/server/actions/admin/category.actions.ts` lines 21-28
```typescript
function revalidateCategoryPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/admin/kategorii");
  revalidatePath("/katalog");
  if (slug) {
    revalidatePath(`/katalog/${slug}`);
  }
}
```
**Apply to:** `reorderCategoriesAction` — call `revalidateCategoryPaths()` (no slug arg) after successful `reorderCategories`.

### sonner toast error pattern
**Source:** `src/components/admin/order-list-status-select.tsx` lines 3, 88-90
```typescript
import { toast } from "sonner";

// On error:
toast.error("Помилка збереження порядку");
```
**Apply to:** `handleDragEnd` in `AdminCategoriesTable` — call on `!result.ok`.

### useTransition + startTransition pattern
**Source:** `src/components/admin/order-list-status-select.tsx` lines 46, 103
```typescript
const [pending, startTransition] = useTransition();

// Wrap async server action call:
startTransition(() => applyStatus(nextStatus));
// React 19 allows async fn directly in startTransition
```
**Apply to:** `handleDragEnd` in `AdminCategoriesTable`.

### stopRowNav helper
**Source:** `src/components/admin/admin-categories-table.tsx` line 27
```typescript
const stopRowNav = (event: MouseEvent) => event.stopPropagation();
```
**Apply to:** `<Link>` in `SortableRow` — `onClick={stopRowNav} onPointerDown={stopRowNav}`.

### prisma.$transaction array form
**Source:** Derived from `admin-catalog.service.ts` callback form (lines 105-136, 160-178). Array form is simpler for independent parallel updates:
```typescript
await prisma.$transaction(
  ids.map((id, index) => prisma.model.update({ where: { id }, data: { field: index + 1 } }))
);
```
**Apply to:** `reorderCategories` service method.

---

## No Analog Found

All files have close analogs in the codebase. No external pattern fallback needed.

---

## Metadata

**Analog search scope:** `src/components/admin/`, `src/server/actions/admin/`, `src/server/services/`, `src/lib/admin/`
**Files scanned:** 7 (admin-categories-table.tsx, category.actions.ts, admin-catalog.service.ts, admin-catalog.service.test.ts, category-sort-order.ts, category-sort-order.test.ts, order-list-status-select.tsx)
**Pattern extraction date:** 2026-05-20
