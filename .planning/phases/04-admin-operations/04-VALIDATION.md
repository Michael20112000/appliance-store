---
phase: 04
slug: admin-operations
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-17
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 + Playwright 1.60.0 |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` |
| **Quick run command** | `npm run test` |
| **Full suite command** | `npm run test && npm run test:e2e` |
| **Estimated runtime** | ~25s unit, ~5min e2e (admin CRUD) |

---

## Sampling Rate

- **After every task commit:** Run task `<automated>` verify from PLAN.md
- **After every plan wave:** `npm test` + targeted Playwright for that wave
- **Before `/gsd-verify-work`:** Full unit + Phase 4 admin e2e green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-gate | 04-01 | 1 | ADM-03 | T-04-01-SC | cloudinary package verified | manual | Human npmjs verify | — | ⬜ pending |
| 04-01-1 | 04-01 | 1 | ADM-03 | T-04-01-03 | Secrets server-only | grep | `! grep -r 'NEXT_PUBLIC_CLOUDINARY_API_SECRET' src/` | ✅ | ⬜ pending |
| 04-01-2 | 04-01 | 1 | ADM-03 | T-04-01-01 | Sign route rejects non-admin | unit | `npm test -- src/app/api/upload/sign/route.test.ts` | ❌ W0 | ⬜ pending |
| 04-02-1 | 04-02 | 2 | ADM-01 | T-04-02-03 | Category delete guard | unit | `npm test -- src/server/services/admin-catalog.service.test.ts` | ❌ W0 | ⬜ pending |
| 04-02-2 | 04-02 | 2 | AUTH-04 | T-04-02-01 | requireAdmin in actions | grep | `grep requireAdmin src/server/actions/admin/category.actions.ts` | ❌ W0 | ⬜ pending |
| 04-02-3 | 04-02 | 2 | ADM-01 | — | kategorii pages exist | file | `test -f src/app/(admin)/admin/kategorii/page.tsx` | ❌ W0 | ⬜ pending |
| 04-03-1 | 04-03 | 3 | ADM-02 | T-04-03-02 | Admin list not PUBLIC only | unit | `npm test -- src/server/services/admin-product.service.test.ts` | ❌ W0 | ⬜ pending |
| 04-03-2 | 04-03 | 3 | ADM-02 | — | revalidate storefront paths | grep | `grep revalidatePath src/server/actions/admin/product.actions.ts` | ❌ W0 | ⬜ pending |
| 04-03-3 | 04-03 | 3 | ADM-03 | T-04-03-03 | Widget uses sign endpoint | grep | `grep signatureEndpoint src/components/admin/product-image-upload.tsx` | ❌ W0 | ⬜ pending |
| 04-04-1 | 04-04 | 4 | ADM-04 | T-04-04-03 | Cancel SOLD→AVAILABLE | unit | `npm test -- src/server/services/admin-order.service.test.ts` | ❌ W0 | ⬜ pending |
| 04-04-2 | 04-04 | 4 | ADM-04 | T-04-04-01 | Illegal transition rejected | unit | `npm test -- src/server/services/admin-order.service.test.ts` | ❌ W0 | ⬜ pending |
| 04-04-3 | 04-04 | 4 | ADM-04 | — | zamovlennia pages | file | `test -f src/app/(admin)/admin/zamovlennia/page.tsx` | ❌ W0 | ⬜ pending |
| 04-05-1 | 04-05 | 5 | ADM-05 defer | T-04-05-02 | Чати disabled only | grep | `grep Незабаром src/components/admin/admin-nav.tsx` | ❌ W0 | ⬜ pending |
| 04-05-2 | 04-05 | 5 | ADM-01–04 | — | Service tests complete | unit | `npm test -- src/server/services/admin-*.test.ts` | ❌ W0 | ⬜ pending |
| 04-05-3 | 04-05 | 5 | AUTH-04, ADM-* | T-04-05-01 | E2E RBAC + CRUD | e2e | `npx playwright test e2e/admin-rbac.spec.ts e2e/admin-categories.spec.ts e2e/admin-products.spec.ts e2e/admin-orders.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Requirement → Test Matrix (Nyquist)

| Req ID | Behavior | Test Type | Automated Command | File | Wave 0 |
|--------|----------|-----------|-------------------|------|--------|
| AUTH-04 | Non-admin cannot access `/admin` | e2e | `npx playwright test e2e/admin-rbac.spec.ts` | e2e/admin-rbac.spec.ts | ✅ exists |
| AUTH-04 | Buyer cannot POST `/api/upload/sign` | e2e | `npx playwright test e2e/admin-rbac.spec.ts` | e2e/admin-rbac.spec.ts | ❌ 04-05 |
| ADM-01 | Category CRUD | e2e + unit | `npm test -- admin-catalog` + `e2e/admin-categories.spec.ts` | admin-catalog.service.test.ts | ❌ 04-02/05 |
| ADM-02 | Product CRUD + status | e2e + unit | `admin-product.service.test.ts` + `e2e/admin-products.spec.ts` | admin-product.service.test.ts | ❌ 04-03/05 |
| ADM-03 | Multi-image signed upload | unit + e2e | `route.test.ts` + products e2e (or skip if no env) | upload/sign/route.test.ts | ❌ 04-01/05 |
| ADM-04 | Order status + cancel revert | unit + e2e | `admin-order.service.test.ts` + `e2e/admin-orders.spec.ts` | admin-order.service.test.ts | ❌ 04-04/05 |
| ADM-05 | Chat admin | — | **Out of scope** — disabled nav only in 04-05 | admin-nav.tsx | N/A |
| — | CATEGORY_HAS_PRODUCTS guard | unit | `npm test -- admin-catalog.service.test.ts` | admin-catalog.service.test.ts | ❌ 04-02 |
| — | PRODUCT_IN_CART delete guard | unit | `npm test -- admin-product.service.test.ts` | admin-product.service.test.ts | ❌ 04-03 |
| — | INVALID_STATUS_TRANSITION | unit | `npm test -- admin-order.service.test.ts` | admin-order.service.test.ts | ❌ 04-04 |

---

## Wave 0 Requirements

- [ ] `src/app/api/upload/sign/route.test.ts` — non-admin 401
- [ ] `src/server/services/admin-catalog.service.test.ts` — slug + delete guard
- [ ] `src/server/services/admin-product.service.test.ts` — admin where + cart guard
- [ ] `src/server/services/admin-order.service.test.ts` — transitions + cancel revert
- [ ] `src/server/validators/category.test.ts`, `admin-product.test.ts`, `admin-order.test.ts`
- [ ] `e2e/admin-categories.spec.ts`, `e2e/admin-products.spec.ts`, `e2e/admin-orders.spec.ts`
- [ ] Extend `e2e/admin-rbac.spec.ts` — buyer POST sign route
- [ ] `cloudinary@2.10.0` in package.json after human gate

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cloudinary dashboard preset/folder | ADM-03 | Human Cloudinary console | After first deploy verify signed upload preset allows admin folder |
| Real multi-file upload in dev | ADM-03 | CI may lack API secrets | Admin edit product → «Додати фото» → confirm asset in Cloudinary console + ProductImage row |
| Dashboard stats accuracy | — | Seed-dependent counts | Compare dashboard numbers with DB after seed |

---

## Multi-Source Coverage Audit

| Source | Item | Plan | Status |
|--------|------|------|--------|
| GOAL | Non-admin blocked from /admin | 04-02, 04-05 | COVERED |
| GOAL | Category CRUD | 04-02 | COVERED |
| GOAL | Product CRUD + multi-photo | 04-03 | COVERED |
| GOAL | Orders + status + SOLD revert | 04-04 | COVERED |
| AUTH-04 | Admin RBAC | 04-02, 04-05 | COVERED |
| ADM-01 | Categories | 04-02 | COVERED |
| ADM-02 | Products | 04-03 | COVERED |
| ADM-03 | Cloudinary upload | 04-01, 04-03 | COVERED |
| ADM-04 | Orders | 04-04 | COVERED |
| ADM-05 | Chat admin | — | EXCLUDED (Phase 5); nav stub 04-05 only |
| D-04-01 | Three admin services | 04-02, 04-03, 04-04 | COVERED |
| D-04-02 | Sign route + SDK | 04-01 | COVERED |
| D-04-03 | Ukrainian URLs | 04-02, 04-03, 04-04 | COVERED |
| D-04-04 | Cancel revert | 04-04 | COVERED |
| D-04-05 | requireAdmin everywhere | all plans | COVERED |
| D-04-06 | Disabled Чати nav | 04-05 | COVERED |
| RESEARCH | Package cloudinary@2.10.0 | 04-01 | COVERED |
| RESEARCH | Two-phase DRAFT upload | 04-03 | COVERED |
| RESEARCH | Delete guards | 04-02, 04-03 | COVERED |
| RESEARCH | Linear status transitions | 04-04 | COVERED |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter after Wave 0 complete

**Approval:** pending
