---
phase: 10
slug: category-showcase-images
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-17
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- src/server/validators/category.test.ts src/server/services/admin-catalog.service.test.ts -x` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command above
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green + `10-MANUAL-CHECKLIST.md` complete
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | HOME-01/02 | T-10-01-SC | Nullable schema, no data loss | unit | `npx prisma validate` | ✅ | ⬜ pending |
| 10-01-02 | 01 | 1 | HOME-02 | T-10-02-03 | Zod rejects bad cuid / alt length | unit | `npm test -- src/server/validators/category.test.ts -x` | ❌ W0 | ⬜ pending |
| 10-02-01 | 02 | 2 | HOME-02 | T-10-02-01 | requireAdmin on action | unit | `npm test -- src/server/services/admin-catalog.service.test.ts -x` | ❌ W0 | ⬜ pending |
| 10-02-02 | 02 | 2 | HOME-01 | — | revalidatePath("/") called | unit | grep in category.actions.ts | ✅ | ⬜ pending |
| 10-03-01 | 03 | 3 | HOME-02 | T-10-02-01 | Widget uses /api/upload/sign only | manual | 10-MANUAL-CHECKLIST §2 | ❌ | ⬜ pending |
| 10-04-01 | 04 | 4 | HOME-01 | — | Grid shows image or placeholder | manual | 10-MANUAL-CHECKLIST §1 | ❌ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `updateCategoryImageSchema` + tests in `src/server/validators/category.test.ts`
- [ ] `updateCategoryImage` service tests in `src-catalog.service.test.ts`
- [ ] `.planning/phases/10-category-showcase-images/10-MANUAL-CHECKLIST.md`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Upload → homepage refresh | HOME-01, HOME-02 | Cloudinary widget + browser cache | 10-MANUAL-CHECKLIST §1–3 |
| Existing categories without image | HOME-01 | Visual placeholder | Check homepage before admin upload |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-17 (plan-phase)
