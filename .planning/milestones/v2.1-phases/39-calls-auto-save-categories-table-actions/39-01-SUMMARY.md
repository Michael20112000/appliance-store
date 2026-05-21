---
phase: 39-calls-auto-save-categories-table-actions
plan: 01
subsystem: ui
tags: [react, debounce, admin, callback]

requires: []
provides:
  - Debounced callback note auto-save (400ms) on active /admin/dzvinky rows
affects: [admin-callbacks]

tech-stack:
  added: []
  patterns:
    - "useCallbackNoteAutoSave mirrors product save chain without router.refresh"

key-files:
  created:
    - src/hooks/admin/use-callback-note-auto-save.ts
    - src/hooks/admin/use-callback-note-auto-save.test.ts
  modified:
    - src/components/admin/callback-note-field.tsx

key-decisions:
  - "400ms debounce (D-19), not 500ms product default"
  - "Errors toast only; inline status for success (D-02, D-05)"

patterns-established:
  - "String-field auto-save hook with valueRef + save chain"

requirements-completed: [CALL-05]

duration: 15min
completed: 2026-05-21
---

# Phase 39 Plan 01 Summary

**Callback notes on active rows auto-save after 400ms with inline «Збереження…» / «Збережено» — no save button or success toast.**

## Accomplishments
- Added `useCallbackNoteAutoSave` with debounce, generation guard, and error toasts
- Refactored `CallbackNoteField` to controlled textarea + `aria-live` status
- Unit tests cover debounce timing, skip unchanged, errors, and saved state

## Self-Check: PASSED
- `npm test -- src/hooks/admin/use-callback-note-auto-save.test.ts` — 5/5
- No «Зберегти» or `router.refresh` in callback-note-field
