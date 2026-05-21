---
phase: 40-category-edit-ux
plan: "02"
subsystem: admin-components-pages
tags: [auto-save, category, admin, edit-page, header, client-wrapper]
dependency_graph:
  requires:
    - Plan 01: useCategoryAutoSave hook + CategoryEditDeleteButton (both consumed here)
  provides:
    - CategoryEditHeader component
    - CategoryEditPageContent client wrapper
    - Simplified CategoryForm (edit mode: no manual save/delete buttons)
    - Rewired /admin/kategorii/[id] server page
  affects:
    - /admin/kategorii/[id]: fully functional auto-save + icon-trash UX
tech_stack:
  added: []
  patterns:
    - ProductEditPageContent/Header mirror pattern for category edit page
    - Client wrapper orchestrates saveStatus state + flushRef for flush-before-navigate
    - CategoryForm simplified to thin form in edit mode (auto-save hook wired internally)
key_files:
  created:
    - src/components/admin/category-edit-header.tsx
    - src/components/admin/category-edit-page-content.tsx
  modified:
    - src/components/admin/category-form.tsx
    - src/app/(admin)/admin/kategorii/[id]/page.tsx
decisions:
  - "CategoryEditHeader has 'use client' directive — receives onNavigateBack function prop from client parent (passing function props to server components violates Next.js serialization)"
  - "CategoryForm wires useCategoryAutoSave unconditionally but passes enabled=false in create mode — hook is noop when disabled"
  - "Submit button in CategoryForm is now mode-conditional: only renders in create mode"
  - "Create mode onSubmit path unchanged: zodResolver(upsertCategorySchema) + createCategoryAction (T-40-08 mitigation verified)"
metrics:
  duration: "~10 minutes"
  completed: "2026-05-21"
  tasks_completed: 2
  files_created: 2
  files_modified: 2
---

# Phase 40 Plan 02: Category Edit UX — Header + PageContent + Form Refactor Summary

**One-liner:** Assembled the category edit page from Plan 01 primitives — CategoryEditHeader, CategoryEditPageContent wrapper, simplified CategoryForm, and rewired server page — delivering identical auto-save and icon-trash UX to /admin/tovary/[id].

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | CategoryEditHeader + CategoryEditPageContent — new client components | 658b0c1 | category-edit-header.tsx, category-edit-page-content.tsx |
| 2 | Refactor CategoryForm + rewire server page | 6a360e5 | category-form.tsx, kategorii/[id]/page.tsx |

## Verification

```
# TypeScript: no errors in modified files
npx tsc --noEmit 2>&1 | grep -E "category-edit-header|category-edit-page-content|category-form" → clean

# Unit tests: all 8 pass (unchanged from Plan 01)
npx vitest run src/hooks/admin/use-category-auto-save.test.ts src/components/admin/category-edit-delete-button.test.tsx
→ Test Files 2 passed | Tests 8 passed
```

## Acceptance Criteria Check

- [x] `src/components/admin/category-edit-header.tsx` exists and exports `CategoryEditHeader`
- [x] `src/components/admin/category-edit-page-content.tsx` exists and exports `CategoryEditPageContent`
- [x] `category-edit-header.tsx` has `"use client"` directive at top of file
- [x] `category-edit-header.tsx` contains `aria-live="polite"` in status p element
- [x] `category-edit-header.tsx` contains `"Збереження…"` and `"Збережено"` as conditional strings (per D-03)
- [x] `category-edit-header.tsx` contains `href="/admin/kategorii"` for back link
- [x] `category-edit-header.tsx` contains `href` including `/admin/tovary?categoryId=` and `/admin/tovary/novyi?categoryId=` (per D-08)
- [x] `category-edit-page-content.tsx` contains `flushRef` and `onNavigateBack={() => flushRef.current?.()`
- [x] `category-edit-page-content.tsx` contains `CategoryEditDeleteButton` import
- [x] `category-form.tsx` does NOT contain `window.confirm` (0 occurrences)
- [x] `category-form.tsx` does NOT contain `deleteCategoryAction` import (0 occurrences)
- [x] `category-form.tsx` contains `onSaveStatusChange` prop definition
- [x] `category-form.tsx` contains `onAutoSaveFlushReady` prop definition
- [x] `category-form.tsx` contains `useCategoryAutoSave` call
- [x] `category-form.tsx` button group: `type="submit"` wrapped in `mode === "create"` condition
- [x] `src/app/(admin)/admin/kategorii/[id]/page.tsx` contains `CategoryEditPageContent` import
- [x] `src/app/(admin)/admin/kategorii/[id]/page.tsx` does NOT contain `CategoryForm` import
- [x] `src/app/(admin)/admin/kategorii/[id]/page.tsx` does NOT contain `window.confirm`
- [x] `src/app/(admin)/admin/kategorii/[id]/page.tsx` still contains `CategoryImageUpload`
- [x] TypeScript: `tsc --noEmit` produces no errors in modified files
- [x] `npx vitest run` — 329 tests pass; 3 pre-existing seed DB failures unrelated to this plan

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All components are fully wired:
- `CategoryEditHeader` receives real `saveStatus`, `categoryId`, `onNavigateBack`, `deleteButton` props
- `CategoryEditPageContent` wires `CategoryEditDeleteButton` (real deleteCategoryFromListAction), `CategoryForm` (real auto-save via useCategoryAutoSave), and flushRef for back navigation flush
- Server page passes real category data (name, sortOrder, id) from `getCategoryById` DB fetch

## Threat Flags

None. No new network endpoints, auth paths, or schema changes introduced.

- T-40-05: requireAdmin() in updateCategoryAction pre-existing — no new auth surface
- T-40-06: upsertCategorySchema.safeParse in hook guards field values before calling action
- T-40-07: only non-sensitive fields (name, sortOrder, id) passed as props
- T-40-08 (Tampering — create mode validation): verified — zodResolver(upsertCategorySchema) + createCategoryAction path unchanged in create mode

## Self-Check: PASSED

- [x] `src/components/admin/category-edit-header.tsx` exists
- [x] `src/components/admin/category-edit-page-content.tsx` exists
- [x] `src/components/admin/category-form.tsx` modified (no window.confirm, no deleteCategoryAction, has useCategoryAutoSave)
- [x] `src/app/(admin)/admin/kategorii/[id]/page.tsx` modified (has CategoryEditPageContent, no CategoryForm, has CategoryImageUpload)
- [x] Task 1 commit 658b0c1 exists: `git log --oneline | grep 658b0c1` → present
- [x] Task 2 commit 6a360e5 exists: `git log --oneline | grep 6a360e5` → present
