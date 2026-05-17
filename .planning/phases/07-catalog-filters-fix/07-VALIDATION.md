---
phase: 7
slug: catalog-filters-fix
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-17
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (unit), Playwright (existing URL e2e) |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` |
| **Quick run command** | `npm test -- src/lib/catalog/search-params.test.ts src/server/services/catalog.service.test.ts` |
| **Full suite command** | `npm test` |
| **E2E regression** | `npm run test:e2e -- e2e/catalog-filters-url.spec.ts` |
| **Estimated runtime** | ~15s unit; ~30s e2e |

## Sampling Rate

- **After every task commit:** Run quick Vitest paths for touched files
- **After every plan wave:** `npm test`
- **Before `/gsd-verify-work`:** `npm test` + manual checklist `07-MANUAL-CHECKLIST.md`
- **Max feedback latency:** 30 seconds

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 07-01-01 | 01 | 1 | CAT-03 | unit | `npm test -- catalog.service` | ⬜ pending |
| 07-01-02 | 01 | 1 | CAT-01 prep | unit | `npm test` | ⬜ pending |
| 07-02-01 | 02 | 2 | CAT-01 | manual | See 07-MANUAL-CHECKLIST §1 | ⬜ pending |
| 07-02-02 | 02 | 2 | CAT-02 | manual | See 07-MANUAL-CHECKLIST §2 | ⬜ pending |
| 07-03-01 | 03 | 2 | CAT-03 | unit + manual | Vitest + checklist §3 | ⬜ pending |
| 07-04-01 | 04 | 3 | CAT-02 | unit | `npm test -- search-params` | ⬜ pending |
| 07-04-02 | 04 | 3 | regression | e2e | `npm run test:e2e -- catalog-filters-url` | ⬜ pending |

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Slider drag → grid | CAT-01 | No Playwright spec (D-07-15) | Open `/katalog`, drag slider, confirm URL + cheaper items hidden |
| `cina-vid=13000` | CAT-02 | Roadmap acceptance | Direct URL load; no product card below 13 000 ₴ |
| Category brands | CAT-03 | Visual select options | `/katalog/telephony` — no irrelevant appliance brands |

## Wave 0 Requirements

Existing Vitest + Playwright cover framework — **no Wave 0 install**.
