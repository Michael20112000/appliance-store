---
phase: 42
slug: floating-action-buttons
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-23
---

# Phase 42 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test -- src/components/layout/storefront-fabs.test.tsx` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds (quick), ~42 seconds (full) |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- src/components/layout/storefront-fabs.test.tsx`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 42 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 42-01-01 | 01 | 1 | FAB-01, FAB-02 | — | No user input exposed in FAB render | unit (RED) | `npm test -- src/components/layout/storefront-fabs.test.tsx` | ❌ W0 | ⬜ pending |
| 42-01-02 | 01 | 1 | FAB-01, FAB-02 | — | Dialog input sanitized by existing CallbackRequestForm | unit (GREEN) | `npm test -- src/components/layout/storefront-fabs.test.tsx` | ✅ | ⬜ pending |
| 42-02-01 | 02 | 2 | FAB-01, FAB-02 | — | Server-side data fetch; no client secrets exposed | tsc | `npx tsc --noEmit 2>&1 \| head -20` | ✅ | ⬜ pending |
| 42-02-02 | 02 | 2 | FAB-01, FAB-02 | — | Visual checkpoint — admin pages lack FABs | manual | N/A (checkpoint) | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/layout/storefront-fabs.test.tsx` — stubs for FAB-01 (always-visible cart FAB) and FAB-02 (callback dialog)

*Wave 0 is fulfilled by Plan 01 Task 1 (RED phase of TDD). The test file does not exist yet and is created as the first task of execution.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| FABs absent on admin pages | FAB-01, FAB-02 | Route group isolation is structural; no automated test covers the admin layout | Navigate to `/admin` — confirm no FAB buttons visible in bottom-left |
| FABs present on all storefront pages | FAB-01, FAB-02 | Smoke-test across routes | Visit `/`, `/kataloh`, `/tovar/[slug]`, `/koszyk` — confirm both FABs visible bottom-left |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (storefront-fabs.test.tsx created in Task 42-01-01)
- [x] No watch-mode flags
- [x] Feedback latency < 42s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
