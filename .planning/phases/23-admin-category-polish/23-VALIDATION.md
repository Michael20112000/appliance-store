---
phase: 23
slug: admin-category-polish
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-19
---

# Phase 23 — Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Testing Library |
| **Quick run command** | `npx vitest run src/components/admin/admin-categories-table.test.tsx` |
| **Full suite command** | `npx vitest run src/components/admin src/lib/admin` |
| **E2E** | `npx playwright test e2e/admin-categories.spec.ts` |

## Sampling Rate

- **After every task commit:** Quick run command
- **After plan wave:** Full admin vitest slice
- **Before verify-work:** Quick + optional e2e

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 23-01-01 | 01 | 1 | ADM-CAT-03 | manual/visual | — | ⬜ pending |
| 23-01-02 | 01 | 1 | ADM-CAT-04 | unit | `npx vitest run src/components/admin/admin-categories-table.test.tsx` | ⬜ pending |
| 23-01-03 | 01 | 1 | ADM-CAT-03,04 | e2e | `npx playwright test e2e/admin-categories.spec.ts` | ⬜ pending |

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Instructions |
|----------|-------------|------------|--------------|
| Edit toolbar icons visible | ADM-CAT-03 | Visual | Open `/admin/kategorii/{id}`, confirm Eye/Plus beside labels |
| Row click still edits | ROADMAP #3 | Interaction | Click row body (not link) → edit page |
