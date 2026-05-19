---
phase: 25
slug: homepage-empty-categories
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-19
---

# Phase 25 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- --run src/lib/catalog/categories.test.ts` |
| **Full suite command** | `npm test` |
| **Phase gate** | `npm run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite + `npm run build` must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 25-01-01 | 01 | 1 | HOME-03 | — | N/A | unit | `npm test -- --run src/lib/catalog/categories.test.ts` | ✅ | ⬜ pending |
| 25-01-02 | 01 | 1 | HOME-03 | — | N/A | unit | `npm test -- --run src/server/services/catalog.service.test.ts` | ✅ | ⬜ pending |
| 25-01-03 | 01 | 1 | HOME-03 | — | N/A | build | `npm run build` | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `categories.test.ts` — add case: filter preserves order when middle category has `productCount: 0`
- [ ] `catalog.service.test.ts` — optional: assert `listCategoriesWithProductCounts` maps image fields + counts

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Homepage hides «Категорії» when all empty | HOME-03 | RSC visual / seed-dependent | After purge/seed, load `/` — no `#kategorii` section |
| Parity with header nav | HOME-03 | Cross-surface compare | Header category links match homepage cards |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
