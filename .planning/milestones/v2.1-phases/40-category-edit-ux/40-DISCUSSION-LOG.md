# Phase 40: Category Edit UX - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 40-category-edit-ux
**Areas discussed:** sortOrder auto-save, Status indicator placement, Component architecture

---

## Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| sortOrder auto-save | Does the number field participate in auto-save? | ✓ |
| Status indicator placement | Where on the page does "Збереження…"/"Збережено" appear? | ✓ |
| Component architecture | CategoryEditPageContent wrapper vs inline in CategoryForm | ✓ |

**User's choice:** "роби все на свій вибір, головне щоб було зручно і гарно" — full Claude's discretion for all three areas.

---

## sortOrder auto-save

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-save both fields | Same debounce for `name` and `sortOrder`; schema validation prevents invalid intermediate saves | ✓ |
| Auto-save `name` only | `sortOrder` excluded or manual (on blur) to avoid intermediate DB state | |
| Auto-save on blur for sortOrder | `name` debounced, `sortOrder` only on blur event | |

**User's choice:** Claude's discretion  
**Notes:** Chose auto-save both fields with 500ms debounce. `upsertCategorySchema.safeParse` prevents invalid saves. Consistent with product pattern (priceUah same situation).

---

## Status Indicator Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Below h1 (product pattern) | Status line below "Редагувати категорію", action buttons further down | ✓ |
| Alongside action buttons | Status appears in the same flex row as Переглянути/Додати buttons | |
| Near form fields | Status indicator lives below the form inputs | |

**User's choice:** Claude's discretion  
**Notes:** Chose product pattern mirror: ← Назад → h1 + trash icon → status line → action buttons.

---

## Component Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| CategoryEditPageContent wrapper | New client wrapper (mirror of ProductEditPageContent); server page passes data; form simplified | ✓ |
| Upgrade CategoryForm directly | Add auto-save hooks inside CategoryForm with conditional edit-mode logic | |

**User's choice:** Claude's discretion  
**Notes:** Chose Option A (client wrapper) — cleaner separation, exact mirror of product pattern, avoids complicating the shared form with conditional auto-save hooks.

---

## Claude's Discretion

- All three gray areas deferred to Claude — user requested "зручно і гарно"
- Hook file name/location (`use-category-auto-save.ts` or inline)
- Whether to extract shared debounced-save primitive from product hook
- Action buttons row: same row as h1+trash, or separate row below status line

## Deferred Ideas

None — discussion stayed within phase scope.
