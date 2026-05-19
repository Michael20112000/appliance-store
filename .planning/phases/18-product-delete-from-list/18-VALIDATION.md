---
phase: 18
slug: product-delete-from-list
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-05-19
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + jsdom |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm run test -- product-list-delete` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~20s quick; ~60s full |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- product-list-delete` (when test file exists)
- **After every plan wave:** Run `npm run test`
- **Before `/gsd-verify-work`:** `npm run build && npm run test`
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 18-01-01 | 01 | 1 | ADM-PRD-04 | T-18-01-01 | Admin-only delete action | unit | `npm run test -- admin-product.service` (existing) | ✅ | ⬜ pending |
| 18-01-02 | 01 | 1 | ADM-PRD-04 | T-18-01-02 | stopPropagation on delete control | unit | `npm run test -- product-list-delete` | ❌ W0 | ⬜ pending |
| 18-02-01 | 02 | 2 | ADM-PRD-04 | — | Manual delete flow | manual | `18-MANUAL-CHECKLIST.md` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers phase requirements. Wave 0 creates:

- [ ] `src/components/admin/product-list-delete-button.test.tsx` — during plan 01 task 2
- [ ] `.planning/phases/18-product-delete-from-list/18-MANUAL-CHECKLIST.md` — during plan 02

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Delete removes row from list | ADM-PRD-04 | Needs admin auth + DB | Login admin → `/admin/tovary` → delete row → confirm → row gone after refresh |
| Cart guard toast | ADM-PRD-04 | Needs product in cart seed | Delete product in cart → expect error toast, row remains |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
