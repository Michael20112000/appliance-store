---
phase: 27
slug: human-uat-closure
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-19
---

# Phase 27 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- --run src/lib/order/status-transitions.test.ts src/components/admin/order-list-status-select.test.ts src/server/services/admin-order.service.test.ts` |
| **Full suite command** | `npm test` |
| **Build command** | `npm run build` |
| **Estimated runtime** | ~60–90 seconds (full suite) |

---

## Sampling Rate

- **After every task commit (P1 code fix only):** `npm test -- --run <touched-area>`
- **After plan 27-02 automated gate:** `npm test` + `npm run build`
- **Before phase sign-off:** All checklist sections pass or documented P0/P1/P2; `27-UAT-REPORT.md` complete
- **Max feedback latency:** 120 seconds (full suite)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 27-01-01 | 01 | 1 | UAT-01 | — | N/A | doc | Manual review of checklist files | ❌ W0 | ⬜ pending |
| 27-01-02 | 01 | 1 | UAT-01 | — | N/A | doc | `test -f 19-MANUAL-CHECKLIST.md` | ❌ W0 | ⬜ pending |
| 27-02-01 | 02 | 2 | UAT-01 | T-27-01/T-27-02 | Gate + status regression | automated+manual | `npm test -- --run …status…` && `npm test` && `npm run build` | ✅ | ⬜ pending |
| 27-02-02 | 02 | 2 | UAT-01 | T-27-01 | Purge empty routes | manual | `19-MANUAL-CHECKLIST.md` | ❌ W0 | ⬜ pending |
| 27-02-03 | 02 | 2 | UAT-01 | T-27-02/T-27-03 | Smoke + v1.5 human | manual | `27-MANUAL-CHECKLIST.md` + 25/26 HUMAN-UAT | ✅ | ⬜ pending |
| 27-03-01 | 03 | 3 | UAT-01 | — | Closure traceability | doc | `27-UAT-REPORT.md` + REQUIREMENTS UAT-01 | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `27-MANUAL-CHECKLIST.md` — master operator script
- [ ] `19-MANUAL-CHECKLIST.md` — purge + empty-state only
- [ ] `26-HUMAN-UAT.md` — optional human rows for phase 26
- [ ] `27-UAT-REPORT.md` — closure template (may be stub until 27-03)

*No new test framework — existing Vitest covers automated regression.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Purge empty routes | UAT-01 | Browser + DB state | `19-MANUAL-CHECKLIST.md` |
| Guest checkout smoke | UAT-01 | localStorage cart + multi-page flow | `27-MANUAL-CHECKLIST.md` § smoke |
| Admin order status UI | UAT-01 | Role + deliveryType matrix | `27-MANUAL-CHECKLIST.md` § admin |
| Homepage HOME-03 | UAT-01 | Visual `#kategorii` | `25-HUMAN-UAT.md` |
| Footer + drawer FOOT | UAT-01 | Responsive + callback toast | `26-HUMAN-UAT.md` or master §26 |

*E2E Playwright (`test:e2e`) excluded — stale `e2e/cart-auth.spec.ts` vs guest checkout (P2 defer).*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: automated gate before human sign-off
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] `nyquist_compliant: true` set in frontmatter after 27-03

**Approval:** pending
