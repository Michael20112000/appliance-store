---
phase: 31
slug: order-status-ux-bugfix
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-05-20
---

# Phase 31 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x + @testing-library/react |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- --run src/components/admin/order-list-status-select.test.tsx src/server/services/admin-order.service.test.ts` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 31-01-01 | 01 | 1 | BUG-24 | T1 / — | Stock errors surfaced as INSUFFICIENT_STOCK, not UNKNOWN | unit | `npm test -- --run src/lib/order/admin-status-errors.test.ts` | ❌ W0 | ⬜ pending |
| 31-01-02 | 01 | 1 | BUG-24 | — | List select shows stock UA on failed confirm | component | `npm test -- --run src/components/admin/order-list-status-select.test.tsx` | ✅ | ⬜ pending |
| 31-01-03 | 01 | 1 | BUG-24 | T1 | Service rejects confirm without reserve | unit | `npm test -- --run src/server/services/admin-order.service.test.ts` | ✅ | ⬜ pending |
| 31-01-04 | 01 | 1 | ORD-05 | — | Accent classes per status | unit | `npm test -- --run src/lib/order/status-styles.test.ts` | ❌ W0 | ⬜ pending |
| 31-01-05 | 01 | 1 | ORD-05 | — | Build passes | build | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. New test files created in-plan (not Wave 0).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| ASL-20260519-0013 stock message | BUG-24 | Real order + DB qty | Admin list: confirm → stock toast; restore qty → confirm succeeds |
| Long label visible | ORD-05 | Visual width | List row with CONFIRMED — full «Підтверджено (поточний)» visible |
| Status color glance | ORD-05 | Visual accent | Scan table — cancelled reddish, completed greenish |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
