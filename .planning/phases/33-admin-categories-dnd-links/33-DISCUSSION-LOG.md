# Phase 33: Admin categories DnD & links - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-20
**Phase:** 33-admin-categories-dnd-links
**Areas discussed:** DnD library & approach, Reorder save trigger & UX

---

## Gray Area Selection

| Area | Description | Selected |
|------|-------------|----------|
| DnD library & approach | @dnd-kit/sortable vs native HTML5 | Delegated |
| Reorder save trigger & UX | Immediate save vs Save button + "Порядок" column fate | Delegated |

**User's choice:** "Все на твій вибір, дивись щоб було зручно, красиво і добре зроблено" — full discretion delegated to Claude.

---

## Claude's Discretion

All design decisions delegated. Claude chose:

- **DnD library:** `@dnd-kit/core` + `@dnd-kit/sortable` — React-standard, lightweight, accessible, works with table rows
- **Save trigger:** Immediate on drop (optimistic update) — natural UX for a small operator list, no Save button
- **"Порядок" column:** Replaced with `GripVertical` drag handle — operators don't need to see raw sortOrder numbers
- **"Переглянути (N)" link:** `font-medium text-primary hover:underline underline-offset-4` — matches shadcn link style
- **Reorder action:** `reorderCategoriesAction(orderedIds: string[])` → service `reorderCategories` using `prisma.$transaction`
- **Testing:** Vitest unit test for reorder service/action (per ROADMAP criterion 3)

## Deferred Ideas

None — discussion stayed within phase scope.
