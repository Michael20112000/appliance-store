---
phase: 21
slug: bugfix-stabilization
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-05-19
---

# Phase 21 — Validation Strategy

> Verify-only close: automated CI + static grep + manual checklist for BUG-12…17.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1.6 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/server/services/product-inventory.test.ts src/server/services/admin-order.service.test.ts` |
| **Full suite command** | `npm test` |
| **Build command** | `npm run build` |
| **Estimated runtime** | ~30–90 seconds |

---

## Sampling Rate

- **After Task 1:** `npm run build && npm test`
- **After Task 2:** grep/static verify command from plan
- **After Task 3:** manual checklist sign-off (human)
- **Before phase close:** intake `status: completed` + STATE updated

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Verify behavior | Test Type | Automated Command | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|--------|
| 21-01-01 | 01 | 1 | BUGFIX-INTAKE | T1 | Build + unit suite green | automated | `npm run build && npm test` | ⬜ pending |
| 21-01-02 | 01 | 1 | BUGFIX-INTAKE | T3 | Source matches intake contracts | automated | grep ProductStatus / Переглянути товари / inventory transitions | ⬜ pending |
| 21-01-03 | 01 | 1 | BUGFIX-INTAKE | T2 | BUG-12…17 manual surfaces | manual | `21-MANUAL-CHECKLIST.md` | ⬜ pending |
| 21-01-04 | 01 | 1 | BUGFIX-INTAKE | T1 | Regression fix re-green | automated | `npm run build && npm test` (if run) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red*

---

## Wave 0 Requirements

- [x] `21-MANUAL-CHECKLIST.md` — consolidated BUG-12…17
- [x] Shipped code on `main` (waves 1–2 intake done)
- [x] `product-inventory.test.ts` — transition matrix

---

## Manual-Only Verifications

| Behavior | BUG IDs | Why Manual | Instructions |
|----------|---------|------------|--------------|
| Category rank swap | BUG-12 | UI + DB state | `/admin/kategorii` checklist section |
| Category → products link | BUG-13 | Navigation | Category edit page |
| Qty listing + order reserve | BUG-14,15,16,17 | Multi-step admin/storefront | Full checklist § BUG-14…17 |
| Guest order confirm | BUG-15 | D-21-10 | Guest checkout subsection |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or manual checkpoint
- [x] Wave 0 covers checklist artifact
- [ ] `nyquist_compliant: true` after execute-phase green
- [ ] Manual sign-off Pass in `21-MANUAL-CHECKLIST.md`

**Approval:** pending
