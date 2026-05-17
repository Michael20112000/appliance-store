---
phase: 03
slug: cart-checkout
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-17
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 + Playwright 1.60.0 |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` |
| **Quick run command** | `npm run test` |
| **Full suite command** | `npm run test && npm run test:e2e` |
| **Estimated runtime** | ~20s unit, ~4min e2e |

---

## Sampling Rate

- **After every task commit:** Run task `<automated>` verify from PLAN.md
- **After every plan wave:** `npm test` + targeted Playwright for that wave
- **Before `/gsd-verify-work`:** Full unit + Phase 3 e2e green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-1 | 03-01 | 1 | CART-02, CHK-* | T-03-01-SC | Schema migrates cleanly | migrate | `npx prisma validate && npx prisma migrate status` | ✅ schema | ⬜ pending |
| 03-01-2 | 03-01 | 1 | CART-02 | T-03-01-01 | AVAILABLE-only add | unit | `npm test -- src/server/services/cart.service.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-3 | 03-01 | 1 | CHK-01, CHK-02 | T-03-01-02 | checkoutSchema phone + address | unit | `npm test -- src/server/validators/order.test.ts` | ❌ W0 | ⬜ pending |
| 03-02-1 | 03-02 | 2 | AUTH-03 | T-03-02-02 | callbackUrl relative only | grep | `grep requireBuyer src/lib/permissions.ts` | ❌ W0 | ⬜ pending |
| 03-02-2 | 03-02 | 2 | CART-01 | T-03-02-01 | Actions require buyer | grep | `grep requireBuyer src/server/actions/cart.actions.ts` | ❌ W0 | ⬜ pending |
| 03-02-3 | 03-02 | 2 | CART-01, CART-03 | T-03-02-04 | Guest localStorage no DB write | e2e | `npx playwright test e2e/cart-merge.spec.ts` | ❌ W0 | ⬜ pending |
| 03-03-1 | 03-03 | 3 | AUTH-03 | T-03-03-01 | /koszyk redirects guest | e2e | `npx playwright test e2e/cart-auth.spec.ts` | ❌ W0 | ⬜ pending |
| 03-03-2 | 03-03 | 3 | CART-02 | — | Remove line + PriceDisplay | manual/e2e | `npx playwright test e2e/checkout.spec.ts` | ❌ W0 | ⬜ pending |
| 03-03-3 | 03-03 | 3 | CART-02 | — | CTA to /zamovlennia | grep | `grep zamovlennia src/components/cart/cart-summary.tsx` | ❌ W0 | ⬜ pending |
| 03-04-1 | 03-04 | 4 | CHK-03 | T-03-04-01 | Atomic SOLD in transaction | unit | `npm test -- src/server/services/order.service.test.ts` | ❌ W0 | ⬜ pending |
| 03-04-2 | 03-04 | 4 | CHK-01, CHK-02 | T-03-04-03 | Server-owned price snapshots | unit+e2e | `npm test -- src/server/validators/order.test.ts` | ❌ W0 | ⬜ pending |
| 03-04-3 | 03-04 | 4 | CHK-03 | T-03-04-02 | Confirmation IDOR 404 | e2e | `npx playwright test e2e/checkout.spec.ts` | ❌ W0 | ⬜ pending |
| 03-05-1 | 03-05 | 5 | CHK-04 | T-03-05-01 | Orders scoped by userId | e2e | `npx playwright test e2e/orders-history.spec.ts` | ❌ W0 | ⬜ pending |
| 03-05-2 | 03-05 | 5 | CART-02 | — | Header badge count | manual | Visual: badge after add | — | ⬜ pending |
| 03-05-3 | 03-05 | 5 | AUTH-03, CART-*, CHK-* | — | Full buyer journey | e2e | `npx playwright test e2e/cart-auth.spec.ts e2e/cart-merge.spec.ts e2e/checkout.spec.ts e2e/orders-history.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Requirement → Test Matrix (Nyquist)

| Req ID | Behavior | Test Type | Automated Command | File | Wave 0 |
|--------|----------|-----------|-------------------|------|--------|
| AUTH-03 | Guest redirected from /koszyk, /zamovlennia | e2e | `npx playwright test e2e/cart-auth.spec.ts` | e2e/cart-auth.spec.ts | ❌ 03-05 |
| CART-01 | Logged-in add from PDP | e2e | `npx playwright test e2e/checkout.spec.ts` | e2e/checkout.spec.ts | ❌ 03-05 |
| CART-02 | View/edit/remove cart | e2e | `npx playwright test e2e/checkout.spec.ts` | e2e/checkout.spec.ts | ❌ 03-05 |
| CART-03 | Pending merges after login | e2e | `npx playwright test e2e/cart-merge.spec.ts` | e2e/cart-merge.spec.ts | ❌ 03-05 |
| CHK-01 | Submit phone + name | e2e | `npx playwright test e2e/checkout.spec.ts` | e2e/checkout.spec.ts | ❌ 03-05 |
| CHK-02 | Pickup vs Lviv delivery | unit + e2e | `npm test -- src/server/validators/order.test.ts` | order.test.ts | ❌ 03-01 |
| CHK-03 | Confirmation without payment UI | e2e | `npx playwright test e2e/checkout.spec.ts` | e2e/checkout.spec.ts | ❌ 03-05 |
| CHK-04 | Order list in kabinet | e2e | `npx playwright test e2e/orders-history.spec.ts` | e2e/orders-history.spec.ts | ❌ 03-05 |
| — | Double-sale race | e2e (optional) | `e2e/checkout-race.spec.ts` | not planned | defer |
| — | createOrderFromCart rejects unavailable | unit | `npm test -- src/server/services/order.service.test.ts` | order.service.test.ts | ❌ 03-01 |

---

## Wave 0 Requirements

- [ ] `src/server/services/cart.service.test.ts` — AVAILABLE guard, merge cap
- [ ] `src/server/services/order.service.test.ts` — orderNumber, transaction unavailable
- [ ] `src/server/validators/order.test.ts` — phone + delivery address rules
- [ ] `src/lib/permissions.ts` — `requireBuyer()`
- [ ] `e2e/cart-auth.spec.ts`, `e2e/cart-merge.spec.ts`, `e2e/checkout.spec.ts`, `e2e/orders-history.spec.ts`
- [ ] Seed: at least one AVAILABLE product for e2e add-to-cart

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Header badge refresh after add | CART-02 | Layout revalidation timing | Add item; confirm badge updates without hard refresh |
| Concurrent two-browser checkout | — | Flaky in CI | Two sessions same product; only one confirmation |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter after Wave 0 complete

**Approval:** pending
