---
phase: 13
slug: product-stock-quantity
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-18
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 + Playwright 1.60.0 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run test:e2e` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test` (targeted file when possible)
- **After every plan wave:** `npm test` + relevant `npm run test:e2e -- <spec>`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | D-13-01–02 | — | quantity column migrated | manual | `npx prisma migrate dev` | ❌ W0 | ⬜ pending |
| 13-02-01 | 02 | 2 | D-13-04–05 | T-13-01 | atomic decrement + SOLD at 0 | unit | `npm test -- src/server/services/order.service.test.ts` | ❌ W0 | ⬜ pending |
| 13-02-02 | 02 | 2 | D-13-06 | T-13-01 | block cart when qty 0 | unit | `npm test -- src/server/services/cart.service.test.ts` | ❌ extend | ⬜ pending |
| 13-03-01 | 03 | 3 | D-13-08–10 | V5 | Zod create min 1 / edit min 0 | unit | `npm test -- src/server/validators/admin-product.test.ts` | ❌ extend | ⬜ pending |
| 13-04-01 | 04 | 4 | D-13-11–12 | — | admin form + table show quantity | e2e | `npm run test:e2e -- e2e/admin-products.spec.ts` | ✅ extend | ⬜ pending |
| 13-04-02 | 04 | 4 | ADM-PRD-03 | T-13-01 | checkout reduces stock | e2e | `npm run test:e2e -- e2e/checkout.spec.ts` | ✅ extend | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/server/services/order.service.test.ts` — decrement + conditional SOLD (D-13-04–05)
- [ ] Extend `cart.service.test.ts` — purchasable matrix (status + quantity)
- [ ] Extend `admin-product` validator tests — create min 1, edit min 0, max 999
- [ ] Extend `e2e/admin-products.spec.ts` — «Кількість» field + table column
- [ ] Optional E2E: product with `quantity: 2`, two checkouts

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Storefront hides quantity | D-13-13 | No PDP/catalog assertion in existing e2e | Spot-check PDP — no stock badge/text |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
