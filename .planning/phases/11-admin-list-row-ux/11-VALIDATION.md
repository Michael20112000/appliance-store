---
phase: 11
slug: admin-list-row-ux
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-18
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/lib/admin/clickable-table-row.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command above
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Helper tests green + manual D-11-15 checklist
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | UX-02 / D-11-14 | T-11-01 | Pure helper, no open redirect | unit | `npx vitest run src/lib/admin/clickable-table-row.test.ts` | ❌ W0 | ⬜ pending |
| 11-01-02 | 01 | 1 | UX-02 / D-11-01 | — | `role="link"`, keyboard handlers | unit | same | ❌ W0 | ⬜ pending |
| 11-02-01 | 02 | 2 | ADM-PRD-01 | — | Products use shared props | unit | same + manual | ✅ analog | ⬜ pending |
| 11-02-02 | 02 | 2 | ADM-PRD-01 | T-11-02 | stopPropagation on status select | manual | D-11-15 | ✅ | ⬜ pending |
| 11-03-01 | 03 | 3 | ADM-ORD-01 | T-11-01 | Row navigates to order detail | manual | D-11-15 | ❌ | ⬜ pending |
| 11-03-02 | 03 | 3 | ADM-ORD-01 | — | No actions column | manual | grep orders-data-table | ✅ | ⬜ pending |
| 11-04-01 | 04 | 4 | ADM-CAT-02 | — | Row opens category edit | manual | D-11-15 | ❌ | ⬜ pending |
| 11-04-02 | 04 | 4 | ADM-CAT-01 | — | Plus on create CTA | manual | D-11-15 | ✅ | ⬜ pending |
| 11-05-01 | 05 | 5 | ADM-ORD-01 | — | Dashboard row-click | manual | D-11-15 | ❌ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/admin/clickable-table-row.ts` — helper + className export
- [ ] `src/lib/admin/clickable-table-row.test.ts` — keyboard + role smoke
- [ ] `src/lib/admin/use-admin-clickable-row.ts` — optional client hook
- [ ] `src/components/admin/admin-categories-table.tsx`
- [ ] `src/components/admin/admin-recent-orders-table.tsx`
- [ ] `11-MANUAL-CHECKLIST.md` (planner may add in final plan)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Order row opens detail | ADM-ORD-01 | Browser navigation | Click row on `/admin/zamovlennia`; no «Відкрити» column |
| Category row opens edit | ADM-CAT-02 | Browser navigation | Click row on `/admin/kategorii`; no «Редагувати» |
| Dashboard recent orders | ADM-ORD-01 | Browser | `/admin` recent block row-click |
| Plus on CTAs | ADM-CAT-01, ADM-PRD-01 | Visual | Plus `size-4` left of label |
| Status select no navigate | ADM-PRD-01 | Interaction | Click status on products — stays on list |
| Keyboard row activate | UX-02 | a11y | Tab to row, Enter opens detail |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 / manual dependencies
- [x] Sampling continuity: helper tests between UI waves
- [x] Wave 0 covers MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-18 (plan-phase)
