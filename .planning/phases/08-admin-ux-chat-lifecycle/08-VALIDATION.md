---
phase: 08
slug: admin-ux-chat-lifecycle
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-17
---

# Phase 08 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- src/server/services/chat.service.test.ts src/server/services/admin-order.service.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run affected service test file(s)
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite green + `08-MANUAL-CHECKLIST.md`
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-* | 01 | 1 | FIX-01, ADM-01 | grep/lint | per plan tasks | partial | ⬜ pending |
| 08-02-* | 02 | 2 | ADM-02 | unit | `npm test -- admin-order` | ❌ W0 | ⬜ pending |
| 08-03-* | 03 | 3 | ADM-02 | grep/lint | per plan tasks | partial | ⬜ pending |
| 08-04-* | 04 | 3 | ADM-03 | grep/lint | per plan tasks | N/A | ⬜ pending |
| 08-05-* | 05 | 4 | CHAT-05/06 | prisma/unit | migrate + `chat.service.test.ts` | ❌ W0 | ⬜ pending |
| 08-06-* | 06 | 5 | CHAT-05/06 | grep/lint | per plan tasks | partial | ⬜ pending |
| 08-07-* | 07 | 6 | CHAT-05/06 | unit + manual | full Vitest sweep + checklist | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/server/validators/admin-order.ts` + tests
- [ ] `src/server/services/admin-order.service.test.ts`
- [ ] Extend `src/server/services/chat.service.test.ts`
- [ ] `src/lib/admin/orders-url.test.ts`
- [ ] Install `@tanstack/react-table` + shadcn sidebar/table/pagination/tabs

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sidebar mobile/desktop | ADM-01 | Layout | See `08-UI-SPEC.md` breakpoints |
| Orders URL pagination/sort | ADM-02 | Browser | Filter change resets page=1 |
| Chat archive/delete | CHAT-05/06 | Confirm UX | `08-MANUAL-CHECKLIST.md` |
| Buyer archived read-only | CHAT-05 | Two sessions | Banner + disabled composer |
| E2E admin chat | D-08-27 | Optional | Run only if selectors break |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity maintained in plans
- [ ] Wave 0 completes during execution
- [x] No watch-mode flags
- [ ] Full suite green at phase gate
- [x] `nyquist_compliant: true` in frontmatter

**Approval:** pending execution
