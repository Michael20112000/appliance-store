---
phase: 12
slug: admin-tables-status-sort
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-18
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/lib/admin/products-url.test.ts src/server/validators/admin-product.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command (extend as files appear)
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Tests green + `12-MANUAL-CHECKLIST.md`
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 12-01-01 | 01 | 1 | ADM-ORD-02 | manual | Orders status Select + row-click | ⬜ pending |
| 12-01-02 | 01 | 1 | ADM-ORD-02 | unit | `npx vitest run src/components/admin/order-list-status-select.test.tsx` | ⬜ pending |
| 12-02-01 | 02 | 2 | ADM-PRD-02 | unit | `npx vitest run src/server/validators/admin-product.test.ts` | ⬜ pending |
| 12-02-02 | 02 | 2 | ADM-PRD-02 | unit | `npx vitest run src/lib/admin/products-url.test.ts` | ⬜ pending |
| 12-02-03 | 02 | 2 | ADM-PRD-02 | unit | service orderBy (if test added) or schema only | ⬜ pending |
| 12-03-01 | 03 | 3 | ADM-PRD-02 | manual | Sort headers change URL + list order | ⬜ pending |
| 12-03-02 | 03 | 3 | ADM-PRD-02 | manual | Filters/pagination preserve sort | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `adminProductListSortSchema` / `adminProductListDirSchema` in `admin-product.ts`
- [ ] `buildPrismaProductOrderBy` in `admin-product.service.ts`
- [ ] `adminProductsUrl` sort/dir support
- [ ] `order-list-status-select.test.tsx` (optional but recommended)

---

## Manual Checklist Reference

See `12-MANUAL-CHECKLIST.md` (created in plan 12-03).
