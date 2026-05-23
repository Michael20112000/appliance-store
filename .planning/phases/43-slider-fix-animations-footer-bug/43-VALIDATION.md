---
phase: 43
slug: slider-fix-animations-footer-bug
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-23
---

# Phase 43 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/lib/catalog/store-map.test.ts src/components/catalog/catalog-filters.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~3 seconds (quick), ~30 seconds (full) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/lib/catalog/store-map.test.ts src/components/catalog/catalog-filters.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 3 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 43-01-01 | 01 | 0 | SLIDER-01 | — | N/A | unit | `npx vitest run src/components/catalog/catalog-filters.test.ts` | ❌ W0 | ⬜ pending |
| 43-01-02 | 01 | 0 | BUG-25 | — | N/A | unit | `npx vitest run src/lib/catalog/store-map.test.ts` | ❌ W0 | ⬜ pending |
| 43-02-01 | 02 | 1 | SLIDER-01 | — | N/A | unit | `npx vitest run src/components/catalog/catalog-filters.test.ts` | ❌ W0 | ⬜ pending |
| 43-02-02 | 02 | 1 | BUG-25 | — | N/A | unit | `npx vitest run src/lib/catalog/store-map.test.ts` | ❌ W0 | ⬜ pending |
| 43-03-01 | 03 | 1 | ANIM-01 | — | N/A | manual | — | manual-only | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/catalog/catalog-filters.test.ts` — unit tests for `normalizeSliderBounds` (SLIDER-01)
- [ ] `src/lib/catalog/store-map.test.ts` — unit tests for `addressExternalMapUrl` embed detection (BUG-25)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Animation respects prefers-reduced-motion | ANIM-01 | CSS media query — no DOM assertion available in Vitest | Open DevTools → Rendering tab → Enable "Emulate CSS media feature prefers-reduced-motion: reduce" → Navigate between storefront pages → Confirm no visible animation |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 3s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
