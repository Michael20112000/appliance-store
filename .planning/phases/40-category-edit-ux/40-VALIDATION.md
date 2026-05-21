---
phase: 40
slug: category-edit-ux
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-21
---

# Phase 40 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + @testing-library/react |
| **Config file** | `vitest.config.ts` (project root) |
| **Quick run command** | `vitest run --reporter=verbose src/hooks/admin/use-category-auto-save.test.ts src/components/admin/category-edit-delete-button.test.tsx` |
| **Full suite command** | `vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `vitest run --reporter=verbose src/hooks/admin/use-category-auto-save.test.ts src/components/admin/category-edit-delete-button.test.tsx`
- **After every plan wave:** Run `vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 40-W0-hook-stub | W0 | 0 | ADM-CAT-09 | — | N/A | unit stub | `vitest run src/hooks/admin/use-category-auto-save.test.ts` | ❌ W0 | ⬜ pending |
| 40-W0-delete-stub | W0 | 0 | ADM-CAT-10 | — | N/A | unit stub | `vitest run src/components/admin/category-edit-delete-button.test.tsx` | ❌ W0 | ⬜ pending |
| 40-hook-debounce | 01 | 1 | ADM-CAT-09 | — | N/A | unit | `vitest run src/hooks/admin/use-category-auto-save.test.ts` | ❌ W0 | ⬜ pending |
| 40-hook-schema-guard | 01 | 1 | ADM-CAT-09 | T-input-validation | Schema validation prevents invalid intermediate saves | unit | `vitest run src/hooks/admin/use-category-auto-save.test.ts` | ❌ W0 | ⬜ pending |
| 40-hook-snapshot | 01 | 1 | ADM-CAT-09 | — | N/A | unit | `vitest run src/hooks/admin/use-category-auto-save.test.ts` | ❌ W0 | ⬜ pending |
| 40-hook-error-toast | 01 | 1 | ADM-CAT-09 | — | N/A | unit | `vitest run src/hooks/admin/use-category-auto-save.test.ts` | ❌ W0 | ⬜ pending |
| 40-hook-status-cycle | 01 | 1 | ADM-CAT-09 | — | N/A | unit | `vitest run src/hooks/admin/use-category-auto-save.test.ts` | ❌ W0 | ⬜ pending |
| 40-delete-alert-open | 02 | 1 | ADM-CAT-10 | — | N/A | unit | `vitest run src/components/admin/category-edit-delete-button.test.tsx` | ❌ W0 | ⬜ pending |
| 40-delete-confirm | 02 | 1 | ADM-CAT-10 | T-access-control | requireAdmin() in deleteCategoryFromListAction | unit | `vitest run src/components/admin/category-edit-delete-button.test.tsx` | ❌ W0 | ⬜ pending |
| 40-delete-error | 02 | 1 | ADM-CAT-10 | — | N/A | unit | `vitest run src/components/admin/category-edit-delete-button.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/hooks/admin/use-category-auto-save.test.ts` — stubs for ADM-CAT-09 (5 test cases: debounce, schema guard, snapshot skip, error toast, status cycle)
- [ ] `src/components/admin/category-edit-delete-button.test.tsx` — stubs for ADM-CAT-10 (3 test cases: alert open, confirm+redirect, error toast)

Test structure must mirror:
- `src/hooks/admin/use-product-auto-save.test.ts` for the hook (fake timers, `renderHook`, `useForm` harness)
- `src/components/admin/product-edit-delete-button.test.tsx` for the delete button (`vi.mock("next/navigation")`, `waitFor`, toast assertions)

*Existing infrastructure (Vitest + @testing-library/react) covers all phase requirements — no framework installation needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Status line shows «Збереження…» then «Збережено» in UI | ADM-CAT-09 | Visual timing behavior hard to assert in unit tests | Edit name field → observe status line transitions in browser at /admin/kategorii/[id] |
| Flush-before-navigate saves pending change | ADM-CAT-09 | Requires browser navigation timing | Edit field, click ← Назад within 500ms → verify change persisted in DB |
| AlertDialog renders correctly and is accessible | ADM-CAT-10 | Visual layout verification | Click trash button → verify dialog opens with correct title and destructive confirm button |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
