---
phase: 23-admin-category-polish
status: passed
verified: 2026-05-19
---

# Phase 23 Verification

## Must-haves

| ID | Truth | Status |
|----|-------|--------|
| D-01 | Edit toolbar icon + visible Ukrainian label; icons aria-hidden | PASS |
| D-02 | «Переглянути товари» Eye; «Додати товар» Plus | PASS |
| D-03 | Product links unchanged (categoryId query) | PASS |
| D-04 | List header «Товари» with «Переглянути» link | PASS |
| D-05 | Count muted (N) after link | PASS |
| D-06 | Zero products shows (0); link not hidden | PASS |
| D-07 | Link stopPropagation click + pointerDown | PASS |
| D-08 | No separate edit button; row click only | PASS |

## Requirements

- ADM-CAT-03: PASS — edit page icons
- ADM-CAT-04: PASS — list column + Vitest

## Automated

- `vitest run src/components/admin/admin-categories-table.test.tsx` — PASS

## Human verification

None required.
