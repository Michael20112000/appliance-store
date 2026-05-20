---
phase: 33-admin-categories-dnd-links
verified: 2026-05-20T18:40:00Z
status: human_needed
score: 3/3 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Visually confirm «Переглянути (N)» link styling in browser at /admin/kategorii"
    expected: "Link displays in primary color (blue); underline appears on hover; clicking navigates to /admin/tovary?categoryId=..."
    why_human: "CSS visual properties (text color, hover underline) cannot be verified programmatically in jsdom/grep — requires live browser render"
  - test: "Drag a category row and confirm order persists after hard refresh"
    expected: "Row moves visually during drag (opacity 0.5 on source); releases to new position; Cmd+Shift+R shows persisted order from DB"
    why_human: "DnD interaction, optimistic update, and DB persistence round-trip require live browser test — cannot be verified with grep or unit tests"
  - test: "Confirm row-click navigation still works after DnD integration"
    expected: "Clicking anywhere on a row (not the drag handle or Переглянути link) navigates to /admin/kategorii/:id"
    why_human: "Event propagation behavior (DnD listeners vs row-click handler) requires interactive browser testing"
---

# Phase 33: Admin Categories DnD & Links — Verification Report

**Phase Goal:** Admin can drag category rows to reorder them (ADM-CAT-06) and «Переглянути (N)» link is styled as a primary-color link (ADM-CAT-05).
**Verified:** 2026-05-20T18:40:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

Note: The 33-04-PLAN.md Task 2 human-verify checkpoint was approved by the operator during execution. The human_verification items below are recorded for audit completeness per GSD protocol — they correspond to the already-approved browser checks. The status is `human_needed` because Step 9 requires this when any human items exist, even when prior approval exists.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | «Переглянути (N)» cell displays as a styled clickable link with className `font-medium text-primary hover:underline underline-offset-4` | ✓ VERIFIED | `admin-categories-table.tsx` line 91: `className="font-medium text-primary hover:underline underline-offset-4"` confirmed by grep |
| 2 | Drag & drop reorders categories and persists to DB; page refresh shows persisted order | ✓ VERIFIED | Full wiring confirmed: DnD → optimistic state → `reorderCategoriesAction` → `reorderCategories` service → `prisma.$transaction`; human browser approval recorded in 33-04-SUMMARY |
| 3 | Vitest unit tests for reorderCategories pass (D-09) | ✓ VERIFIED | `npm test -- src/server/services/admin-catalog-reorder.service.test.ts` → 2 passed (exit 0), executed live during verification |

**Score:** 3/3 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `node_modules/@dnd-kit/core` | DnD context and sensor primitives | ✓ VERIFIED | File exists; package.json lists `@dnd-kit/core@^6.3.1` |
| `node_modules/@dnd-kit/sortable` | useSortable hook and SortableContext | ✓ VERIFIED | File exists; package.json lists `@dnd-kit/sortable@^10.0.0` |
| `node_modules/@dnd-kit/utilities` | CSS.Transform.toString helper | ✓ VERIFIED | File exists; package.json lists `@dnd-kit/utilities@^3.2.2` |
| `src/server/services/admin-catalog.service.ts` | `reorderCategories` exported function | ✓ VERIFIED | Line 259: `export async function reorderCategories(orderedIds: string[]): Promise<void>` |
| `src/server/services/admin-catalog-reorder.service.test.ts` | Vitest unit tests for reorderCategories | ✓ VERIFIED | File exists with `describe("reorderCategories"` and 2 `it(` blocks; both pass |
| `src/server/actions/admin/category.actions.ts` | `reorderCategoriesAction` exported async function | ✓ VERIFIED | Line 108: `export async function reorderCategoriesAction(` |
| `src/components/admin/admin-categories-table.tsx` | DnD-enabled sortable categories table with styled Переглянути link | ✓ VERIFIED | Contains DndContext, SortableContext, useSortable, GripVertical, reorderCategoriesAction, text-primary |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `admin-categories-table.tsx` | `@dnd-kit/core` | `import { DndContext, ... } from '@dnd-kit/core'` | ✓ WIRED | Lines 14-21: DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter imported and used |
| `admin-categories-table.tsx` | `@dnd-kit/sortable` | `import { SortableContext, useSortable, ... }` | ✓ WIRED | Lines 23-29: SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, arrayMove imported and used |
| `admin-categories-table.tsx` | `reorderCategoriesAction` | `import { reorderCategoriesAction } from '@/server/actions/admin/category.actions'` | ✓ WIRED | Line 31 import; line 125: `await reorderCategoriesAction(reordered.map((c) => c.id))` |
| `handleDragEnd` | `reorderCategoriesAction` | `startTransition(async () => { const result = await reorderCategoriesAction(...) })` | ✓ WIRED | Lines 124-130: startTransition wraps async action call with error revert + toast |
| `admin-catalog-reorder.service.test.ts` | `admin-catalog.service.ts` | `import { reorderCategories } from './admin-catalog.service'` | ✓ WIRED | Line 3 of test file |
| `admin-catalog.service.ts` | `@/lib/db` | `prisma.$transaction([...array])` | ✓ WIRED | Lines 260-266: array-form `$transaction` with `prisma.category.update` per element |
| `category.actions.ts` | `admin-catalog.service.ts` | `import { reorderCategories } from '@/server/services/admin-catalog.service'` | ✓ WIRED | Line 13 import; line 122: `await reorderCategories(orderedIds)` |
| `category.actions.ts` | `@/lib/permissions` | `await requireAdmin()` | ✓ WIRED | Line 6 import; line 111: `await requireAdmin()` as first statement |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `admin-categories-table.tsx` | `localCategories` | `useState(categories)` seeded from server prop | Props from `AdminCategoriesPage` RSC which calls `listCategoriesAdmin()` → `prisma.category.findMany` | ✓ FLOWING |
| `reorderCategoriesAction` | `orderedIds` | Client drag state (reordered `localCategories` IDs) | Passed to `reorderCategories` → `prisma.$transaction` with real `category.update` calls | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `reorderCategories` Vitest tests | `npm test -- src/server/services/admin-catalog-reorder.service.test.ts` | 2 passed, exit 0 | ✓ PASS |
| `reorderCategoriesAction` contains requireAdmin + validation | `grep -n "requireAdmin\|INVALID_INPUT\|reorderCategories\|revalidateCategoryPaths" category.actions.ts` | All 4 strings found | ✓ PASS |
| Component contains DnD patterns and no Порядок column | `grep -c "DndContext\|SortableContext\|useSortable\|reorderCategoriesAction\|GripVertical\|text-primary" admin-categories-table.tsx` → 13; `grep -c "Порядок"` → 0 | Confirmed | ✓ PASS |

### Probe Execution

Not applicable — no `scripts/*/tests/probe-*.sh` files defined for this phase.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| ADM-CAT-05 | 33-04-PLAN.md | «Переглянути (N)» link styled (underline/hover/color) | ✓ SATISFIED | `className="font-medium text-primary hover:underline underline-offset-4"` on Link at line 91 of `admin-categories-table.tsx`; human browser approval in 33-04-SUMMARY |
| ADM-CAT-06 | 33-01, 33-02, 33-03, 33-04 PLAN.md | Drag & drop changes sortOrder, persists to server | ✓ SATISFIED | Full stack wired: DnD component → server action (auth + validation) → service (`prisma.$transaction`) → DB; human browser refresh confirmed persistence |

**Note on REQUIREMENTS.md discrepancy:** ADM-CAT-05 checkbox remains `[ ]` (unchecked) and traceability row shows "Pending" even though the implementation is complete. This is a documentation artifact that was not updated after implementation. The code satisfies the requirement — this is a WARNING, not a blocker.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/server/services/admin-catalog.service.ts` | 30 | `TODO(race): resolveUniqueSlug runs outside the transaction` | ⚠️ Warning | No formal issue reference (no `#123` or `DEF-*`). However: (1) this TODO was intentionally introduced in phase 33 as part of code review fix WR-01 (commit `07a0ff4`); (2) a safe P2002 catch is already active so no silent data loss; (3) the TODO describes the deferred long-term refactor. Impact is limited to pre-existing functions `createCategory`/`updateCategory`, not the phase-33 feature (`reorderCategories`). Classified as Warning per debt-marker gate — `TODO` is warning tier, not blocker tier (`TBD`/`FIXME`/`XXX`). |

No placeholder/stub patterns found in any phase-modified file. No `return null`, `return {}`, or `return []` stub returns in the user-visible code paths.

### Human Verification Required

These items correspond to the browser-verified checkpoint in 33-04-PLAN.md Task 2 that was approved by the operator during execution. They are recorded here for audit completeness.

#### 1. «Переглянути (N)» Link Visual Styling (ADM-CAT-05)

**Test:** Navigate to `/admin/kategorii`, find the «Переглянути (N)» cell for any category row
**Expected:** Link displays in primary color (blue); underline appears on hover; clicking navigates to `/admin/tovary?categoryId=...`
**Why human:** CSS `text-primary` and `hover:underline` require live browser render — grep confirms className is present but cannot verify the actual visual rendering

#### 2. Drag & Drop Row Reordering with DB Persistence (ADM-CAT-06)

**Test:** Drag any category row to a new position at `/admin/kategorii`, then perform a hard refresh (Cmd+Shift+R)
**Expected:** Row moves with opacity:0.5 during drag; settles in new position on release (optimistic); hard refresh shows the new order persisted from DB
**Why human:** DnD interaction, optimistic state update, and DB persistence round-trip cannot be verified by static analysis or unit tests

#### 3. Row-Click Navigation Not Broken by DnD

**Test:** Click anywhere on a category row body (not the drag handle GripVertical, not the Переглянути link)
**Expected:** Navigates to `/admin/kategorii/:id`
**Why human:** Event propagation between DnD pointer listeners and the `getAdminClickableRowProps` row-click handler requires interactive browser testing

### Gaps Summary

No gaps found. All 3 roadmap success criteria are satisfied by codebase evidence:

1. «Переглянути (N)» link styling — `className="font-medium text-primary hover:underline underline-offset-4"` at line 91, VERIFIED.
2. DnD persists to DB — full stack wired across 3 layers + human approval on refresh, VERIFIED.
3. Vitest tests for reorder API — 2 tests pass live, VERIFIED.

Two documentation items to note (not blockers):
- REQUIREMENTS.md ADM-CAT-05 checkbox not updated to `[x]` — documentation only
- `TODO(race)` in `admin-catalog.service.ts` lacks formal issue reference — Warning tier debt marker from intentional WR-01 code review fix

---

_Verified: 2026-05-20T18:40:00Z_
_Verifier: Claude (gsd-verifier)_
