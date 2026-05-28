---
phase: 53
slug: admin-product-search
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-28
---

# Phase 53 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose src/components/admin` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose src/components/admin`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 53-01-01 | 01 | 0 | ADM-SRCH-01 | — | N/A | unit | `npx vitest run src/components/admin/product-search-input.test.tsx` | ❌ W0 | ⬜ pending |
| 53-01-02 | 01 | 0 | ADM-SRCH-01 | — | N/A | unit | `npx vitest run src/services/admin/admin-product.service.test.ts` | ✅ | ⬜ pending |
| 53-01-03 | 01 | 1 | ADM-SRCH-01 | — | N/A | integration | `npx vitest run src/components/admin` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/admin/product-search-input.test.tsx` — unit tests for ProductSearchInput (debounce, URL push, empty state)
- [ ] `src/services/admin/admin-product.service.test.ts` — add test case for `q` filter branch in `buildAdminProductWhere`

*Both files needed before Wave 1 implementation tasks.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real-time filtering in browser | ADM-SRCH-01 | UI interaction | Open /admin/tovary, type in search box, verify list filters in real time without page reload |
| Empty state display | ADM-SRCH-01 | UI interaction | Type a query with no matches, verify empty state message appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
