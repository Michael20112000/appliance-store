---
phase: 15
slug: storefront-catalog-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-18
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Playwright |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` |
| **Quick run command** | `npm run test -- src/server/services/catalog.service.test.ts` |
| **Full suite command** | `npm run test && npx playwright test e2e/catalog-pagination.spec.ts e2e/public-browse.spec.ts` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick Vitest command
- **After every plan wave:** Run full suite command
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 15-01-01 | 01 | 1 | CAT-04 | unit | `npm run test -- src/server/services/catalog.service.test.ts` | ⬜ pending |
| 15-02-01 | 02 | 2 | CAT-04 | e2e | `npx playwright test e2e/public-browse.spec.ts` | ⬜ pending |
| 15-02-02 | 02 | 2 | CAT-05 | build | `npm run build` | ⬜ pending |
| 15-03-01 | 03 | 3 | CAT-06 | unit | `npm run test -- src/lib/catalog/` | ⬜ pending |
| 15-03-02 | 03 | 3 | CAT-06 | e2e | `npx playwright test e2e/catalog-pagination.spec.ts` | ⬜ pending |

---

## Wave 0 Requirements

None — test infrastructure exists.

---

## Manual Checklist

See `15-MANUAL-CHECKLIST.md` (created during execute if missing).
