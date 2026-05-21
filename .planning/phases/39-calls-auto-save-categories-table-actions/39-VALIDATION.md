---
phase: 39
slug: calls-auto-save-categories-table-actions
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-21
---

# Phase 39 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x + @testing-library/react 16.x |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test -- <affected-test-path> -x` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds (targeted), ~2 min (full) |

---

## Sampling Rate

- **After every task commit:** Run affected test path with `-x`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 39-01-01 | 01 | 0 | CALL-05 | unit | `npm test -- src/hooks/admin/use-callback-note-auto-save.test.ts -x` | ❌ W0 | ⬜ pending |
| 39-01-02 | 01 | 1 | CALL-05 | unit | same + callback-note-field | ❌ W0 | ⬜ pending |
| 39-02-01 | 02 | 0 | ADM-CAT-08 | unit | `npm test -- src/server/actions/admin/category.actions.test.ts -x` | ❌ W0 | ⬜ pending |
| 39-02-02 | 02 | 1 | ADM-CAT-07, ADM-CAT-08 | component | `npm test -- src/components/admin/admin-categories-table.test.tsx -x` | ✅ extend | ⬜ pending |
| 39-02-03 | 02 | 1 | ADM-CAT-08 | component | `npm test -- src/components/admin/category-table-delete-button.test.tsx -x` | ❌ W0 | ⬜ pending |

---

## Wave 0 Requirements

- [ ] `src/hooks/admin/use-callback-note-auto-save.ts` + `.test.ts` (fake timers, 400ms)
- [ ] `deleteCategoryFromListAction` in category.actions + tests
- [ ] `category-table-delete-button.tsx` + `.test.ts`
- [ ] Extend `admin-categories-table.test.tsx` for №, novyi link, delete nav

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Note autosave feel | CALL-05 | Debounce UX | Type in /admin/dzvinky note, pause 400ms, see «Збережено» without button |
| DnD renumber | ADM-CAT-07 | Drag UX | Reorder rows on /admin/kategorii, № column updates 1..n |
