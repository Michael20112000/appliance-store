---
phase: 33
slug: admin-categories-dnd-links
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-20
---

# Phase 33 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- src/server/services/admin-catalog-reorder.service.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds (quick) / ~60 seconds (full) |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- src/server/services/admin-catalog-reorder.service.test.ts`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| Link styling | 01 | 1 | ADM-CAT-05 | — | N/A | manual | visual check in browser | N/A | ⬜ pending |
| reorderCategories service | 01 | 1 | ADM-CAT-06 | T-33-01 | `requireAdmin()` in action | unit | `npm test -- src/server/services/admin-catalog-reorder.service.test.ts` | ❌ W0 | ⬜ pending |
| reorderCategoriesAction | 01 | 1 | ADM-CAT-06 | T-33-01 | `requireAdmin()` before service call | unit | same | ❌ W0 | ⬜ pending |
| DnD table component | 01 | 2 | ADM-CAT-06 | — | N/A | manual | drag in browser + refresh | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/server/services/admin-catalog-reorder.service.test.ts` — unit tests for `reorderCategories`
  - Mock `prisma.$transaction` and `prisma.category.update`
  - Case 1: N items → `sortOrder` assigned 1..N correctly
  - Case 2: dropping B above A → B gets `sortOrder: 1`, A gets `sortOrder: 2`

*No framework install needed — Vitest already configured and running.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Link has `text-primary hover:underline` styling | ADM-CAT-05 | CSS visual check not automatable in jsdom | Navigate to `/admin/kategorii`, inspect «Переглянути (N)» link for color and underline on hover |
| Drag persists after page refresh | ADM-CAT-06 | Requires browser + database state | Drag a category row, refresh page, confirm new order matches dragged order |
| Revert on server error | ADM-CAT-06 | Requires simulated network failure | Mock server action to throw, confirm optimistic update reverts in UI |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
