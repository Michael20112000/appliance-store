---
phase: 33-admin-categories-dnd-links
plan: "04"
subsystem: admin-ui
tags: [component, dnd-kit, sortable, optimistic-update, link-styling, admin]
dependency_graph:
  requires: [33-03]
  provides: [AdminCategoriesTable-dnd, Переглянути-link-styled]
  affects: [src/components/admin/admin-categories-table.tsx]
tech_stack:
  added: []
  patterns: [DndContext, SortableContext, useSortable, arrayMove, useTransition-optimistic-revert, sonner-toast-error]
key_files:
  created: []
  modified:
    - src/components/admin/admin-categories-table.tsx
decisions:
  - "SortableRow sub-component extracted above AdminCategoriesTable for clean useSortable usage per row"
  - "listeners attached to GripVertical icon only (not tr) — prevents click-vs-drag conflict per RESEARCH.md Pitfall 1"
  - "PointerSensor activationConstraint distance:8 — secondary guard against click-vs-drag"
  - "No DragOverlay — opacity:0.5 on isDragging row is sufficient for low-row admin table (per RESEARCH.md resolved Q1)"
  - "startTransition wraps async reorderCategoriesAction — React 19 pattern, matches order-list-status-select.tsx"
  - "Revert uses captured localCategories closure value on error — simple and correct per plan spec"
metrics:
  duration: 2min
  completed: "2026-05-20T14:57:50Z"
  tasks_completed: 1
  files_changed: 1
---

# Phase 33 Plan 04: AdminCategoriesTable DnD + Link Styling Summary

**One-liner:** AdminCategoriesTable rewritten with DnD sortable rows (dnd-kit), GripVertical drag handle replacing Порядок column, optimistic reorder + error toast, and styled Переглянути link (text-primary, hover underline).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Rewrite AdminCategoriesTable with DnD + link styling | d6a597c | src/components/admin/admin-categories-table.tsx |

## Task 2 — Checkpoint (Awaiting Human Verification)

Task 2 is `type="checkpoint:human-verify"` — paused pending browser verification of DnD behavior and link styling at `/admin/kategorii`.

## Implementation Details

### Task 1: AdminCategoriesTable Rewrite

Rewrote `src/components/admin/admin-categories-table.tsx` with the following changes:

**New imports added:**
- `useState`, `useTransition` from react
- `GripVertical` from lucide-react
- `toast` from sonner
- `DndContext`, `PointerSensor`, `KeyboardSensor`, `useSensor`, `useSensors`, `closestCenter`, `DragEndEvent` from @dnd-kit/core
- `SortableContext`, `sortableKeyboardCoordinates`, `useSortable`, `verticalListSortingStrategy`, `arrayMove` from @dnd-kit/sortable
- `CSS` from @dnd-kit/utilities
- `reorderCategoriesAction` from @/server/actions/admin/category.actions

**New SortableRow sub-component:** Calls `useSortable({ id: category.id })`, applies `CSS.Transform.toString(transform)` style to tr, attaches `{...listeners}` on GripVertical icon only. Three cells: drag handle (touch-none, cursor-grab), name, and styled Переглянути link.

**AdminCategoriesTable changes:**
- `useState(categories)` seeded from prop as `localCategories`
- `useTransition()` for async server action wrapping
- `useSensors` with PointerSensor (distance:8) + KeyboardSensor (sortableKeyboardCoordinates)
- `handleDragEnd`: arrayMove → setLocalCategories (optimistic) → startTransition → reorderCategoriesAction → on error: revert + toast.error
- Table structure: DndContext wraps table, SortableContext wraps tbody, SortableRow per row
- Header: drag handle th (sr-only) | Назва | Товари (Порядок th removed)

## Verification Results

- `grep -c "DndContext\|SortableContext\|useSortable\|reorderCategoriesAction\|GripVertical\|text-primary"` → 13 (all six present)
- `grep -c "Порядок"` → 0 (column removed)
- `grep "sortOrder"` → only in type definition, not in JSX cell render
- `grep "touch-none"` → match found on drag handle td
- `grep "distance: 8"` → match found in PointerSensor config
- `grep "font-medium text-primary hover:underline underline-offset-4"` → match found on Link
- `npx tsc --noEmit` → 0 errors in admin-categories-table.tsx (pre-existing test file errors in other files unchanged)
- `npm test` → 279 passed (2 pre-existing seed failures in prisma/seed.test.ts — documented in STATE.md deferred items)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — component fully wired to reorderCategoriesAction from plan 03; no placeholder data.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes. The component calls `reorderCategoriesAction` (plan 03) which has `requireAdmin()` guard — threat T-33-07 mitigated as planned.

## Self-Check: PASSED

- [x] `src/components/admin/admin-categories-table.tsx` exists and is fully rewritten
- [x] Commit d6a597c exists: `feat(33-04): rewrite AdminCategoriesTable with DnD row reordering and link styling`
- [x] All six acceptance criteria grep checks pass
- [x] TypeScript — no errors in the modified file
- [x] 279 tests pass; 2 pre-existing seed failures unchanged
