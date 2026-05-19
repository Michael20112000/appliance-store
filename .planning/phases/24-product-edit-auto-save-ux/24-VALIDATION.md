---
phase: 24
slug: product-edit-auto-save-ux
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-19
---

# Phase 24 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 + @testing-library/react 16.3.2 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/hooks/admin/use-product-auto-save.test.ts src/lib/debounce.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 24-01-01 | 01 | 0 | ADM-PRD-05 | — | N/A | unit | `npx vitest run src/lib/debounce.test.ts` | ❌ W0 | ⬜ pending |
| 24-01-02 | 01 | 0 | ADM-PRD-05 | T1 | Admin-only actions unchanged | unit | `npx vitest run src/hooks/admin/use-product-auto-save.test.ts` | ❌ W0 | ⬜ pending |
| 24-01-03 | 01 | 1 | ADM-PRD-05 | T2 | Delete uses AlertDialog + redirect | component | `npx vitest run src/components/admin/product-edit-delete-button.test.tsx` | ❌ W0 | ⬜ pending |
| 24-01-04 | 01 | 1 | ADM-PRD-05 | — | N/A | manual | Create page visual check | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/debounce.ts` + `src/lib/debounce.test.ts` — `createDebounce` flush/cancel
- [ ] `src/hooks/admin/use-product-auto-save.ts` + test — debounce, validation, snapshot, stale gen
- [ ] `src/components/admin/product-edit-delete-button.test.tsx` (optional) — AlertDialog

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Create page footer unchanged | ADM-PRD-05 / D-14 | Out of edit scope | Open `/admin/tovary/novyi` — confirm Зберегти + Скасувати |
| Inline save status UX | D-12 | Visual timing | Edit product, change field, observe Збереження… / Збережено |
