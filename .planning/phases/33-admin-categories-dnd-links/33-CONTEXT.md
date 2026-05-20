# Phase 33: Admin categories DnD & links - Context

**Gathered:** 2026-05-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin categories table at `/admin/kategorii`: "Переглянути (N)" cell becomes a styled clickable link, and rows become draggable to reorder `sortOrder` — persisted to DB on drop.

**In scope (requirements):** ADM-CAT-05, ADM-CAT-06 — per `.planning/REQUIREMENTS.md` and ROADMAP Phase 33 success criteria.

**Out of scope:** Category CRUD (create/edit/delete), storefront category ordering effects beyond what `sortOrder` already drives, pagination, search/filter on categories.

</domain>

<decisions>
## Implementation Decisions

### ADM-CAT-05 — «Переглянути (N)» link styling
- **D-01:** Add `className="font-medium text-primary hover:underline underline-offset-4"` to the existing `<Link>` in `AdminCategoriesTable`. This matches the shadcn link style used elsewhere.
- **D-02:** The count `({category.productCount})` stays inline — no change to content, only styling.

### ADM-CAT-06 — Drag & drop reorder
- **D-03:** Use `@dnd-kit/core` + `@dnd-kit/sortable` — React-standard DnD, lightweight, works with table rows, accessible out of the box. New dependencies to install.
- **D-04:** Save on drop immediately (no Save button). Optimistic update: reorder local state on drag end, then call server action. On server error, revert local state.
- **D-05:** The existing "Порядок" column is replaced with a drag handle column using `GripVertical` from lucide-react. Column header becomes an empty `<th>` (or sr-only "Перетягнути"). Raw `sortOrder` number is not shown to the operator.
- **D-06:** New server action `reorderCategoriesAction(orderedIds: string[])` — takes the full ordered array of category IDs after drop, maps to `{ id, sortOrder: index + 1 }`, calls a new service method `reorderCategories`.
- **D-07:** `reorderCategories` service method: batch-updates `sortOrder` for each category using `prisma.$transaction` with individual `updateMany` or `update` calls. Uses existing `normalizeCategoryRanks` pattern.
- **D-08:** After successful reorder, call `revalidatePath("/admin/kategorii")` and `revalidatePath("/")` (homepage uses sortOrder for category display).

### Testing
- **D-09:** Vitest unit test for `reorderCategoriesAction` (or `reorderCategories` service): mock Prisma, assert that dropping category B above category A produces correct `sortOrder` values. Satisfies ROADMAP "Vitest або manual checklist для reorder API".

### Claude's Discretion
All design decisions delegated by user ("все на твій вибір"). Including:
- Exact DnD sensor config (PointerSensor + touch sensors)
- Drag overlay appearance (duplicate row or minimal placeholder)
- Error toast on reorder failure (sonner, matching existing admin pattern)
- Whether drag handle is in a leftmost or rightmost column

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — ADM-CAT-05, ADM-CAT-06
- `.planning/ROADMAP.md` — Phase 33 goal and success criteria

### Primary code touchpoints
- `src/components/admin/admin-categories-table.tsx` — current table component to extend with DnD and link styling
- `src/app/(admin)/admin/kategorii/page.tsx` — server component passing categories
- `src/server/actions/admin/category.actions.ts` — existing action pattern to follow for new reorderCategoriesAction
- `src/server/services/admin-catalog.service.ts` — service layer; add reorderCategories here
- `src/lib/admin/category-sort-order.ts` — existing rank utilities (normalizeCategoryRanks, clampCategoryRank)
- `src/lib/admin/category-sort-order.test.ts` — existing test file; can co-locate or add alongside

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `normalizeCategoryRanks` / `clampCategoryRank` in `src/lib/admin/category-sort-order.ts` — rank math already done
- `requireAdmin()` — use in new server action (same as existing category actions)
- `revalidatePath("/admin/kategorii")` + `revalidatePath("/")` — already in `revalidateCategoryPaths()`
- `sonner` toast pattern — used in existing admin forms for error feedback
- `GripVertical` from lucide-react — already installed, zero new icon deps

### Established Patterns
- Server actions in `src/server/actions/admin/category.actions.ts` — `requireAdmin` + `revalidatePath` + Zod parse
- `AdminCategoriesTable` is already `"use client"` — DnD hooks work without further changes
- Table structure: `<table>` → `<tbody>` → `<tr>` rows — `@dnd-kit/sortable` wraps each `<tr>` in a `SortableContext`

### Integration Points
- `AdminCategoriesPage` (server component) passes `categories` as a prop array — DnD adds a `useState` inside `AdminCategoriesTable` seeded from this prop
- Homepage category display already sorted by `sortOrder` — reorder immediately affects storefront after revalidation

</code_context>

<specifics>
## Specific Ideas

- User delegated all aesthetic decisions ("все на твій вибір, щоб було зручно, красиво і добре зроблено")
- Reference: existing `category.actions.ts` pattern is the exact model for the new reorderCategoriesAction

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 33-Admin categories DnD & links*
*Context gathered: 2026-05-20*
