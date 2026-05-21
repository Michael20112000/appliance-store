---
phase: 37
slug: dashboard-statcards
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-21
---

# Phase 37 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/server/services/admin-sidebar.service.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/server/services/admin-sidebar.service.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 37-01-01 | 01 | 1 | ADM-DASH-05, ADM-DASH-06 | — | Admin-only page (layout enforces requireAdmin) | unit + smoke | `npx vitest run src/server/services/admin-sidebar.service.test.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. The service-layer tests for `getAdminSidebarCounts()` already cover `unresolvedCallbacks` and `unreadChats` counts (7 tests in `admin-sidebar.service.test.ts`). No new Wave 0 tests needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| StatCard «Нові дзвінки» visible on /admin | ADM-DASH-05 | RSC page render — no component-level test | Load /admin, verify «Нові дзвінки» card with count and Phone icon |
| StatCard «Активні чати» visible on /admin | ADM-DASH-06 | RSC page render — no component-level test | Load /admin, verify «Активні чати» card with count and MessageSquare icon |
| 5-card grid layout correct | ADM-DASH-05/06 | CSS/visual | Verify grid shows 3+2 rows at lg breakpoint |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
