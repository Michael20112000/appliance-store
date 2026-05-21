---
phase: 38
slug: dashboard-data-completeness
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-05-21
---

# Phase 38 — Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 |
| **Quick run (38-01)** | `npx vitest run src/server/services/admin-analytics.service.test.ts` |
| **Quick run (38-02)** | `npx vitest run src/server/services/admin-order.service.test.ts` |
| **Full suite** | `npx vitest run` |

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 38-01-01 | 01 | 1 | ADM-DASH-07 | unit + tsc | `npx vitest run src/server/services/admin-analytics.service.test.ts` | ⬜ pending |
| 38-02-01 | 02 | 2 | ADM-DASH-08 | unit + tsc | `npx vitest run src/server/services/admin-order.service.test.ts` | ⬜ pending |

## Manual-Only Verifications

| Behavior | Requirement | Test Instructions |
|----------|-------------|-------------------|
| Charts match analityka | ADM-DASH-07 | `/admin` vs `/admin/analityka?days=30` — same chart height, grid, axes, tooltips |
| Orders table parity | ADM-DASH-08 | Compare `/admin` recent orders vs `/admin/zamovlennia` — 6 columns, status accent, row click, max 10 rows, no tabs/pagination |

## Validation Sign-Off

**Approval:** pending
