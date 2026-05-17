---
phase: 09
slug: wishlist
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-17
---

# Phase 09 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- src/lib/wishlist/guest-storage.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run affected test file(s)
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite green + `09-MANUAL-CHECKLIST.md`
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-* | 01 | 1 | WISH-01 | unit | `npm test -- src/lib/wishlist/guest-storage.test.ts` | ❌ W0 | ⬜ pending |
| 09-02-* | 02 | 2 | WISH-02, WISH-04 | unit | `npm test -- src/server/services/wishlist.service.test.ts` | ❌ W0 | ⬜ pending |
| 09-03-* | 03 | 3 | WISH-05 | manual + lint | overlay + toast checklist | partial | ⬜ pending |
| 09-04-* | 04 | 4 | WISH-01, WISH-04 | manual | header badge + `/obrane` | partial | ⬜ pending |
| 09-05-* | 05 | 5 | WISH-03, WISH-04 | manual | `09-MANUAL-CHECKLIST.md` D-09-24 | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/wishlist/guest-storage.test.ts` — WISH-01
- [ ] `src/server/services/wishlist.service.test.ts` — WISH-02, WISH-04
- [ ] `.planning/phases/09-wishlist/09-MANUAL-CHECKLIST.md` — WISH-03, WISH-05, D-09-24

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| No merge on login | WISH-03 | Cross-session UX | `09-MANUAL-CHECKLIST.md` § login |
| Heart overlay no PDP nav | WISH-05 | Click target | Catalog card click vs heart |
| Guest ↔ DB silent switch | D-09-06/07 | Auth state | Checklist logout path |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
