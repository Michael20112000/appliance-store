---
phase: 16
slug: shadcn-select-audit-verify
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-05-19
---

# Phase 16 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Playwright |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` |
| **Quick run command** | `npm run test -- --run` |
| **Full suite command** | `npm run test && npm run build` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** `npm run build` (UI-only tasks) or targeted Vitest
- **After every plan wave:** `npm run test && npm run build`
- **Before `/gsd-verify-work`:** Full suite + manual checklist signed
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 16-01-01 | 01 | 1 | UX-01 | grep | `! grep -r '<select' src/components/catalog` | ⬜ pending |
| 16-01-02 | 01 | 1 | UX-01 | build | `npm run build` | ⬜ pending |
| 16-02-01 | 02 | 1 | UX-01 | grep | `! grep -r '<select' src/components/admin/product-form.tsx` | ⬜ pending |
| 16-02-02 | 02 | 1 | UX-01 | build | `npm run build` | ⬜ pending |
| 16-03-01 | 03 | 2 | POL-02 | source | product-form + category-form slug UI | ⬜ pending |
| 16-03-02 | 03 | 2 | POL-01 | manual | `16-MANUAL-CHECKLIST.md` | ⬜ pending |
| 16-03-03 | 03 | 2 | UX-01, POL-* | grep+test | `! grep -r '<select' src/components && npm run test && npm run build` | ⬜ pending |

---

## Wave 0 Requirements

Existing Vitest + Playwright infrastructure covers phase requirements. No Wave 0 stubs.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PDP gallery dialog | POL-01 | No Playwright in phase (D-16-16) | `16-MANUAL-CHECKLIST.md` rows 1–5 |

---

## Validation Sign-Off

- [ ] All tasks have verify or manual checklist
- [ ] `nyquist_compliant: true` after execution

**Approval:** pending
