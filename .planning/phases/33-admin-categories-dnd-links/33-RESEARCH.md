# Phase 33: Admin categories DnD & links - Research

**Researched:** 2026-05-20
**Domain:** React drag-and-drop sortable table rows + Next.js server actions + Prisma batch update
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Add `className="font-medium text-primary hover:underline underline-offset-4"` to the existing `<Link>` in `AdminCategoriesTable`. Matches shadcn link style used elsewhere.
- **D-02:** Count `({category.productCount})` stays inline — no content change, styling only.
- **D-03:** Use `@dnd-kit/core` + `@dnd-kit/sortable`. New dependencies to install.
- **D-04:** Save on drop immediately (no Save button). Optimistic update: reorder local state on drag end, call server action, revert on error.
- **D-05:** Replace "Порядок" column with a drag handle column using `GripVertical` from lucide-react. Raw `sortOrder` number not shown. Column header becomes empty `<th>` (or sr-only "Перетягнути").
- **D-06:** New server action `reorderCategoriesAction(orderedIds: string[])` — full ordered array of IDs after drop, maps to `{ id, sortOrder: index + 1 }`.
- **D-07:** `reorderCategories` service method: batch-updates `sortOrder` via `prisma.$transaction` with individual `update` calls. Uses existing `normalizeCategoryRanks` pattern.
- **D-08:** After successful reorder: call `revalidateCategoryPaths()` (existing helper, covers `/admin/kategorii` and `/`).
- **D-09:** Vitest unit test for `reorderCategories` service: mock Prisma, assert dropping B above A produces correct `sortOrder` values.

### Claude's Discretion
- Exact DnD sensor config (PointerSensor + touch sensors)
- Drag overlay appearance (duplicate row or minimal placeholder)
- Error toast on reorder failure (sonner, matching existing admin pattern)
- Whether drag handle is in leftmost or rightmost column

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADM-CAT-05 | «Переглянути (N)» link in `/admin/kategorii` table looks clickable (underline/hover/color), not plain text | D-01/D-02: CSS className change on existing `<Link>` component — no new code needed beyond styling |
| ADM-CAT-06 | Drag & drop on `/admin/kategorii` changes `sortOrder` and persists to DB on drop | D-03 through D-08: DnD library integration + server action + service method |
</phase_requirements>

---

## Summary

Phase 33 is a focused enhancement to the admin categories table: add link styling to the "Переглянути (N)" cell and implement row-level drag-and-drop reordering that persists `sortOrder` to the database on each drop.

ADM-CAT-05 is a one-line change — the existing `<Link>` in `AdminCategoriesTable` already renders the correct text and href; it just lacks the visual link classes. Adding `className="font-medium text-primary hover:underline underline-offset-4"` to that element completes the requirement.

ADM-CAT-06 is the substantive work: wrapping `AdminCategoriesTable` (already a `"use client"` component) with `DndContext` + `SortableContext` from `@dnd-kit`, converting each `<tr>` to a `useSortable`-driven component, and wiring a new `reorderCategoriesAction` server action that calls a new `reorderCategories` service method via `prisma.$transaction`. The existing `normalizeCategoryRanks`/`moveCategoryToRank` utilities and the `prisma.$transaction` pattern from `createCategory`/`updateCategory` provide proven building blocks for the server side. The client side uses the established `useTransition` + sonner toast pattern seen throughout the admin components.

**Primary recommendation:** Install `@dnd-kit/core@6.3.1` + `@dnd-kit/sortable@10.0.0`, wrap the table body in `SortableContext` with `verticalListSortingStrategy`, use `useSortable` per row, and on `onDragEnd` call `reorderCategoriesAction` with the full ordered ID array. The server side follows the exact pattern of `updateCategory` (read all ranks, compute new order, batch-update via `$transaction`).

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Link styling (ADM-CAT-05) | Browser / Client | — | Pure CSS className change on existing `<Link>` — no server involvement |
| DnD drag state management | Browser / Client | — | `useSortable` hooks + `useState` inside the existing `"use client"` component |
| Optimistic UI reorder | Browser / Client | — | `useState` local reorder on `dragEnd`, revert on server error |
| Persist reorder to DB | API / Backend | — | New server action + service method; client calls via `"use server"` action |
| Path revalidation | Frontend Server (SSR) | — | `revalidatePath` in server action causes Next.js to re-render affected pages |

---

## Standard Stack

### Core (new installs)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@dnd-kit/core` | 6.3.1 | DnD context, sensors, overlay | Foundation of the dnd-kit ecosystem; 16M+ weekly downloads [VERIFIED: npm registry] |
| `@dnd-kit/sortable` | 10.0.0 | `SortableContext`, `useSortable`, `arrayMove` | The sortable preset that builds on core; 13M+ weekly downloads [VERIFIED: npm registry] |

### Already Installed (no changes needed)

| Library | Purpose | Notes |
|---------|---------|-------|
| `lucide-react ^1.16.0` | `GripVertical` drag handle icon | Already in `dependencies` [VERIFIED: package.json] |
| `sonner ^2.0.7` | Error toast on reorder failure | Already used in admin components (order-list-status-select, product-list-delete-button) [VERIFIED: codebase] |
| `vitest ^4.1.6` | Unit testing | Existing test infra; `npm test` runs `vitest run` [VERIFIED: package.json] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@dnd-kit/sortable` | `react-beautiful-dnd` | rbd is unmaintained since 2022; dnd-kit is the current ecosystem standard [ASSUMED] |
| `@dnd-kit/sortable` | `dnd-kit` v6 React package (`@dnd-kit/react`) | v6 is a new class-based API (beta); `@dnd-kit/sortable` 10.x with `@dnd-kit/core` 6.x is the stable, production-proven combination matching npm latest [VERIFIED: npm registry] |
| Optimistic update via `useOptimistic` | `useState` + manual revert | `useState` is simpler, matches existing admin pattern (`order-list-status-select.tsx` uses `useState` + `useTransition`); `useOptimistic` would work but adds complexity [ASSUMED] |

**Installation:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

**Version verification:**
```
@dnd-kit/core  — 6.3.1 (published 2024-12-05) [VERIFIED: npm registry]
@dnd-kit/sortable — 10.0.0 (published 2024-12-04) [VERIFIED: npm registry]
```

---

## Package Legitimacy Audit

> slopcheck was not available at research time — all packages marked `[ASSUMED]` per protocol. The planner must gate each install behind a `checkpoint:human-verify` task.

| Package | Registry | Age | Downloads/wk | Source Repo | slopcheck | Disposition |
|---------|----------|-----|--------------|-------------|-----------|-------------|
| `@dnd-kit/core` | npm | ~4 yrs | 16.2M [VERIFIED: npm API] | github.com/clauderic/dnd-kit | N/A (unavailable) | [ASSUMED] — approved, well-known library |
| `@dnd-kit/sortable` | npm | ~4 yrs | 13.2M [VERIFIED: npm API] | github.com/clauderic/dnd-kit | N/A (unavailable) | [ASSUMED] — approved, well-known library |

**Packages removed due to slopcheck [SLOP] verdict:** none

**Packages flagged as suspicious [SUS]:** none

*slopcheck was unavailable at research time. Both packages are widely known, have 10M+ weekly downloads, and belong to the established `clauderic/dnd-kit` monorepo on GitHub. Despite the `[ASSUMED]` tag, risk is LOW. The planner should add a `checkpoint:human-verify` before `npm install` as a formality.*

---

## Architecture Patterns

### System Architecture Diagram

```
[Admin opens /admin/kategorii]
        |
        v
[AdminCategoriesPage (Server Component)]
  — listCategoriesAdmin() → Prisma → DB
  — passes categories[] prop to ↓

[AdminCategoriesTable (Client Component, "use client")]
  — useState: localCategories (seeded from prop)
  — DndContext (sensors: PointerSensor + KeyboardSensor)
      |
      ↓
  [SortableContext (items: localCategories ids, strategy: vertical)]
      |
      ↓ per row
  [SortableRow (<tr> wrapped with useSortable)]
      drag handle: GripVertical icon (listeners on handle only)
      row click: still navigates to /admin/kategorii/:id

[onDragEnd]
  1. arrayMove → new localCategories order (optimistic)
  2. startTransition → reorderCategoriesAction(orderedIds)
        |
        ↓ "use server"
  [reorderCategoriesAction]
    — requireAdmin()
    — reorderCategories(orderedIds)
        |
        ↓
    [reorderCategories service]
      — prisma.$transaction → n × update(sortOrder)
    — revalidateCategoryPaths()
    — return { ok: true }
        |
        ↓ error path
  [on error] → revert localCategories → toast.error("Помилка збереження порядку")
```

### Recommended Project Structure

No new directories needed. All changes are in existing files + one new test file:

```
src/
├── components/admin/
│   └── admin-categories-table.tsx      ← extend with DnD + link styling
├── server/
│   ├── actions/admin/
│   │   └── category.actions.ts         ← add reorderCategoriesAction
│   └── services/
│       ├── admin-catalog.service.ts    ← add reorderCategories
│       └── admin-catalog-reorder.service.test.ts  ← new Vitest file
└── lib/admin/
    └── category-sort-order.ts          ← no change (already has normalizeCategoryRanks)
```

### Pattern 1: useSortable Row

Each `<tr>` becomes a separate component (`SortableRow`) that calls `useSortable`:

```typescript
// Source: https://dndkit.com/presets/sortable (legacy API — matches @dnd-kit/sortable v10)
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableRow({ category }: { category: AdminCategoryRow }) {
  const {
    attributes,
    listeners,       // attach to drag handle, NOT the whole row
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

  return (
    <tr ref={setNodeRef} style={style} {...attributes}>
      <td className="px-2 py-2 w-8 cursor-grab touch-none">
        <GripVertical className="size-4 text-muted-foreground" {...listeners} />
      </td>
      {/* remaining cells */}
    </tr>
  );
}
```

**Key point:** `listeners` goes on the `GripVertical` icon element, not the `<tr>`. This prevents row-click navigation from conflicting with drag initiation. [VERIFIED: dndkit.com/presets/sortable]

### Pattern 2: DndContext + SortableContext in Table

```typescript
// Source: https://dndkit.com/presets/sortable
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

// DndContext wraps <table>, SortableContext wraps <tbody>
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={localCategories.map((c) => c.id)}
    strategy={verticalListSortingStrategy}
  >
    <tbody>
      {localCategories.map((category) => (
        <SortableRow key={category.id} category={category} />
      ))}
    </tbody>
  </SortableContext>
</DndContext>
```

### Pattern 3: onDragEnd with Optimistic Update + Server Action

This follows the project's established `useTransition` + revert pattern (from `order-list-status-select.tsx`):

```typescript
// Source: project codebase pattern + dndkit.com/presets/sortable
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { reorderCategoriesAction } from "@/server/actions/admin/category.actions";

const [localCategories, setLocalCategories] = useState(categories);
const [, startTransition] = useTransition();

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

### Pattern 4: reorderCategories Service Method

```typescript
// Source: existing admin-catalog.service.ts createCategory pattern
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

**Note:** `prisma.$transaction([...array of promises])` (interactive transaction array form) is the cleaner approach for this use case — it avoids the callback form's `tx` variable and maps directly from the ordered array. [VERIFIED: existing service file uses both patterns]

### Pattern 5: reorderCategoriesAction Server Action

```typescript
// Source: existing category.actions.ts pattern
"use server";

export async function reorderCategoriesAction(
  orderedIds: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();

  if (!Array.isArray(orderedIds) || orderedIds.some((id) => typeof id !== "string")) {
    return { ok: false, error: "INVALID_INPUT" };
  }

  try {
    await reorderCategories(orderedIds);
    revalidateCategoryPaths();
    return { ok: true };
  } catch {
    return { ok: false, error: "UNKNOWN" };
  }
}
```

**Note:** No Zod schema needed — the input is `string[]` which can be validated inline. This matches the simplicity of `deleteCategoryAction` which validates `id` inline.

### Pattern 6: Vitest Unit Test for reorderCategories Service

The existing `admin-catalog.service.test.ts` shows the Prisma mock pattern:

```typescript
// Source: src/server/services/admin-catalog.service.test.ts (existing)
vi.mock("@/lib/db", () => ({
  prisma: {
    category: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("reorderCategories", () => {
  it("assigns sortOrder 1..n based on orderedIds array position", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue(undefined);
    await reorderCategories(["b", "a", "c"]);
    expect(prisma.$transaction).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ /* update b → sortOrder 1 */ }),
      ])
    );
  });
});
```

**Preferred location:** `src/server/services/admin-catalog-reorder.service.test.ts` (co-located with service, separate file to keep `admin-catalog.service.test.ts` clean). The Vitest config already includes `src/**/*.test.ts` so it auto-discovers. [VERIFIED: vitest.config.ts]

### Anti-Patterns to Avoid

- **Attaching `listeners` to `<tr>` instead of the handle:** The `<tr>` already has click navigation (`getAdminClickableRowProps`). Attaching DnD listeners to the row itself causes click vs drag conflicts. Attach `listeners` to the `GripVertical` icon only.
- **Using `transform` without `CSS.Transform.toString()`:** Raw `transform` from `useSortable` is an object, not a CSS string. Must pass through `CSS.Transform.toString(transform)`.
- **Not using `touch-none` on the drag handle:** Without `touch-none` on the handle element, iOS touch events conflict with browser scroll. Add `className="touch-none"` to the handle `<td>` or icon wrapper.
- **Wrapping `<table>` with `SortableContext` instead of `<tbody>`:** The `SortableContext` `items` must align with the direct children of the droppable container. `SortableContext` wraps `<tbody>` — not `<table>`.
- **Keeping the "Порядок" column showing raw `sortOrder`:** D-05 locks that it is replaced with the drag handle column. Remove the old `<th>Порядок</th>` and `<td>{category.sortOrder}</td>`.
- **Calling `reorderCategoriesAction` outside `startTransition`:** Server actions that trigger `revalidatePath` must be wrapped in a transition to avoid React state update warnings and to get correct `isPending` state. [ASSUMED]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Array reorder after drop | Custom splice/index math | `arrayMove` from `@dnd-kit/sortable` | Correctly handles all edge cases (same position, boundary conditions) |
| Drag cursor containment / collision detection | Custom bounding box logic | `closestCenter` from `@dnd-kit/core` | Standard strategy for list reordering |
| Touch sensor for mobile | Custom pointer event handler | `PointerSensor` (handles mouse + touch) or add `TouchSensor` | DnD sensors handle browser quirks, preventDefault conflicts, etc. |

---

## Common Pitfalls

### Pitfall 1: Row Click Navigation Fires After Drag

**What goes wrong:** After a drag, `mouseup` fires on the `<tr>`, which triggers the row's click handler, navigating to `/admin/kategorii/:id` unexpectedly.

**Why it happens:** `AdminCategoriesTable` uses `getAdminClickableRowProps` which adds `onClick` to the row. The DnD `mouseup` propagates.

**How to avoid:** Attach `{...listeners}` only to the `GripVertical` icon element. The `PointerSensor` can also be configured with `activationConstraint: { distance: 8 }` so small movements (clicks) do not initiate a drag.

**Warning signs:** After dropping a row, the page navigates to a category detail page.

### Pitfall 2: CSS Transform Applied to `<tr>` Breaks Table Layout

**What goes wrong:** `transform: CSS.Transform.toString(transform)` on a `<tr>` may cause visual glitches in some browsers because `<tr>` elements don't always support `transform` reliably.

**Why it happens:** HTML table rows have constrained layout behaviour; `transform` can detach them from the table flow.

**How to avoid:** This is a known limitation of dnd-kit with native `<table>` elements. Two accepted mitigations: (1) use `position: relative` on the row when dragging and `transform: translateY(...)`, or (2) use the `DragOverlay` component which renders the dragged element in a portal outside the table. The simplest approach for a small admin table with few rows: accept slight visual imperfection during drag, rely on the `opacity: 0.5` on `isDragging` row to indicate the drag source, and use `DragOverlay` with a simplified row clone for the floating element. [ASSUMED — browser-specific behaviour]

**Warning signs:** Columns misalign or row "jumps" during drag in Chrome/Firefox.

### Pitfall 3: `@dnd-kit/sortable` v10 API Differences from v5

**What goes wrong:** Using v5/legacy examples (from pre-2024 blog posts) with the v10 npm package.

**Why it happens:** `@dnd-kit/sortable` 10.0.0 is a major version bump. Some exports or prop names may differ.

**How to avoid:** Reference the dndkit.com docs at the "Legacy / presets/sortable" path (which maps to the `@dnd-kit/sortable` package API, not the new class-based `@dnd-kit/react`). The `useSortable` API shape (`attributes`, `listeners`, `setNodeRef`, `transform`, `transition`, `isDragging`) is confirmed from the legacy docs. [VERIFIED: dndkit.com/presets/sortable]

**Warning signs:** TypeScript errors on import, missing exports from package.

### Pitfall 4: Prisma $transaction Array Form vs Callback Form

**What goes wrong:** Using the callback form `prisma.$transaction(async (tx) => { ... })` when the array form is simpler and sufficient.

**Why it happens:** The array form `prisma.$transaction([...])` is less familiar but is correct and simpler for this use case where all operations are independent updates.

**How to avoid:** For `reorderCategories`, use the array form: `prisma.$transaction(orderedIds.map(...))`. It is atomic and does not require the `tx` parameter. The existing service already uses the callback form for `createCategory`/`updateCategory` because those need intermediate reads — `reorderCategories` does not. [VERIFIED: existing admin-catalog.service.ts]

### Pitfall 5: `useTransition` + async server action in React 19

**What goes wrong:** Passing an async function directly to `startTransition` in React 19 may require calling it differently.

**Why it happens:** React 19 allows async functions in `startTransition` directly (unlike React 18 which required a sync wrapper).

**How to avoid:** The existing pattern in `order-list-status-select.tsx` already calls `startTransition(() => applyStatus(nextStatus))` where `applyStatus` is `async`. This works in the project's React 19.2.4 environment. Follow that pattern exactly. [VERIFIED: codebase, React 19.2.4 in package.json]

---

## Code Examples

### ADM-CAT-05: Link Styling (Complete Change)

```typescript
// src/components/admin/admin-categories-table.tsx
// Only the <Link> element changes — everything else stays the same
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

### Sensors Configuration

```typescript
// Source: dndkit.com/presets/sortable (legacy)
import { PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 8 }, // prevents click → drag conflict
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates, // accessibility
  })
);
```

### CSS.Transform import

```typescript
import { CSS } from "@dnd-kit/utilities";
// Usage:
style={{ transform: CSS.Transform.toString(transform), transition }}
```

Note: `@dnd-kit/utilities` is a peer dependency of `@dnd-kit/sortable` and is installed automatically. [VERIFIED: npm registry — version 3.2.2, published 2023-11-06]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `react-beautiful-dnd` (Atlassian) | `@dnd-kit/core` + `@dnd-kit/sortable` | ~2022 (rbd unmaintained) | dnd-kit is now the ecosystem standard for React drag and drop [ASSUMED] |
| Manual `sortOrder` column display | Drag handle replaces order number | This phase (D-05) | Cleaner admin UX |
| No reorder UI in admin categories | Full DnD + server persist | This phase | Meets ADM-CAT-06 |

**Deprecated/outdated:**
- The "Порядок" `<th>` column and `{category.sortOrder}` `<td>` cell: removed in this phase per D-05.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `@dnd-kit/sortable` v10 has same `useSortable` API shape as legacy docs (`attributes`, `listeners`, `setNodeRef`, `transform`, `transition`, `isDragging`) | Standard Stack / Code Examples | TypeScript errors at compile time — easy to fix by consulting actual package types |
| A2 | `react-beautiful-dnd` is unmaintained and dnd-kit is the current standard | State of the Art | Alternative choice — risk is LOW since D-03 is a locked decision |
| A3 | `useOptimistic` would work but adds complexity vs `useState` revert | Architecture Patterns | Correctness unaffected — both patterns work in React 19 |
| A4 | `<tr>` transform may cause visual glitches in some browsers | Common Pitfalls | Visual imperfection during drag — functional correctness unaffected |
| A5 | Passing async function to `startTransition` works in React 19.2.4 | Common Pitfalls | Already proven in existing codebase (`order-list-status-select.tsx`) — risk is NONE |

---

## Open Questions (RESOLVED)

1. **DragOverlay vs inline transform for `<tr>`**
   - What we know: `<tr>` elements have limited CSS transform support in some browsers; dnd-kit docs recommend `DragOverlay` for portalled rendering of the dragged item.
   - What's unclear: Whether the visual glitch is noticeable enough in this admin table (low row count, not a storefront UX) to warrant the extra complexity of `DragOverlay`.
   - RESOLVED: Proceed without `DragOverlay` (Claude's Discretion per CONTEXT.md). Simple `opacity: 0.5` on the dragging row is sufficient for a low-row admin table. If visual glitches appear during browser testing, `DragOverlay` can be added as a follow-up. Plans proceed without it.

2. **`@dnd-kit/utilities` install**
   - What we know: `CSS.Transform.toString()` comes from `@dnd-kit/utilities` 3.2.2. It is a peer dep of `@dnd-kit/sortable` and usually installed transitively.
   - What's unclear: Whether `npm install @dnd-kit/core @dnd-kit/sortable` installs utilities transitively or requires explicit install.
   - RESOLVED: Plan 33-01 Task 2 explicitly installs `@dnd-kit/utilities` alongside core and sortable (`npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`). Transitive install is not relied upon.

---

## Environment Availability

All external dependencies for this phase are already installed or in npm:

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm install | ✓ | system | — |
| `@dnd-kit/core` | ADM-CAT-06 | ✗ (not installed) | 6.3.1 on npm | — (must install) |
| `@dnd-kit/sortable` | ADM-CAT-06 | ✗ (not installed) | 10.0.0 on npm | — (must install) |
| `lucide-react` | GripVertical icon | ✓ | ^1.16.0 | — |
| `sonner` | Error toast | ✓ | ^2.0.7 | — |
| `prisma` | DB batch update | ✓ | ^7.8.0 | — |
| `vitest` | Unit tests | ✓ | ^4.1.6 | — |

**Missing dependencies with no fallback:**
- `@dnd-kit/core` + `@dnd-kit/sortable` — must install before DnD implementation tasks.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test -- src/server/services/admin-catalog-reorder.service.test.ts` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADM-CAT-05 | Link has hover/color/underline styling | manual-only | visual check in browser | N/A |
| ADM-CAT-06 | `reorderCategories` assigns correct `sortOrder` 1..n | unit | `npm test -- src/server/services/admin-catalog-reorder.service.test.ts` | ❌ Wave 0 |
| ADM-CAT-06 | Drop B above A → B gets sortOrder 1, A gets sortOrder 2 | unit | same | ❌ Wave 0 |
| ADM-CAT-06 | Drag persists after page refresh | manual-only | browser refresh after drag | N/A |

**ADM-CAT-05 is manual-only:** CSS visual checks cannot be automated meaningfully in the node environment vitest runs under.

### Sampling Rate

- **Per task commit:** `npm test -- src/server/services/admin-catalog-reorder.service.test.ts`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/server/services/admin-catalog-reorder.service.test.ts` — covers ADM-CAT-06 `reorderCategories` unit tests
  - Requires mocking `prisma.$transaction` and `prisma.category.update`
  - Two cases: (1) correct sortOrder assignment, (2) B-before-A scenario

*(No framework install needed — vitest already configured and running.)*

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `requireAdmin()` in `reorderCategoriesAction` — already used in all category actions |
| V3 Session Management | no | Session managed by `better-auth`, unchanged |
| V4 Access Control | yes | `requireAdmin()` — admin-only endpoint |
| V5 Input Validation | yes | Validate `orderedIds` is `string[]` before passing to service |
| V6 Cryptography | no | No crypto operations |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthenticated reorder call | Elevation of Privilege | `requireAdmin()` at top of server action |
| Injection via `orderedIds` containing arbitrary strings | Tampering | Prisma parameterized queries — `where: { id }` is safely parameterized |
| Reorder with IDs not owned by any category | Tampering | Prisma `update` throws `RecordNotFound` if ID doesn't exist — propagates as error, action returns `{ ok: false }` |

---

## Sources

### Primary (HIGH confidence)
- `src/components/admin/admin-categories-table.tsx` — current table code, confirmed exact `<Link>` element
- `src/server/services/admin-catalog.service.ts` — confirmed `$transaction`, `normalizeCategoryRanks` pattern
- `src/server/actions/admin/category.actions.ts` — confirmed `requireAdmin` + `revalidateCategoryPaths` pattern
- `src/lib/admin/category-sort-order.ts` — confirmed `normalizeCategoryRanks`, `CategoryRankRow`
- `src/lib/admin/category-sort-order.test.ts` — confirmed existing Vitest patterns
- `vitest.config.ts` — confirmed `npm test` runs `vitest run` over `src/**/*.test.ts`
- `package.json` — confirmed all dependency versions, React 19.2.4, next 16.2.6

### Secondary (MEDIUM confidence)
- [npm registry — @dnd-kit/core](https://www.npmjs.com/package/@dnd-kit/core) — version 6.3.1, 16M/wk downloads, github.com/clauderic/dnd-kit
- [npm registry — @dnd-kit/sortable](https://www.npmjs.com/package/@dnd-kit/sortable) — version 10.0.0, 13M/wk downloads
- [dndkit.com/presets/sortable](https://dndkit.com/presets/sortable) — legacy API docs confirming `useSortable` return shape
- [dndkit.com/react/hooks/use-sortable](https://dndkit.com/react/hooks/use-sortable/) — confirmed `ref`, `isDragging`, `isDropTarget` returns

### Tertiary (LOW confidence)
- WebSearch results for "@dnd-kit/sortable table rows" — community usage patterns, not independently verified

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — npm registry confirmed versions and download counts, GitHub repo confirmed
- Architecture: HIGH — patterns derived directly from existing codebase files
- Pitfalls: MEDIUM — `<tr>` transform limitation is widely reported but browser-specific behaviour

**Research date:** 2026-05-20
**Valid until:** 2026-06-20 (stable ecosystem — dnd-kit release cadence is slow)
