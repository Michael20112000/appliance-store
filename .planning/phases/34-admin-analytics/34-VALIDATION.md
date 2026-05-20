---
phase: 34
slug: admin-analytics
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-20
---

# Phase 34 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest ^4.1.6 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run src/server/services/admin-analytics.service.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/server/services/admin-analytics.service.test.ts`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 34-01-01 | 01 | 0 | AN-01 | — | N/A | unit | `npx vitest run src/server/services/admin-analytics.service.test.ts` | ❌ W0 | ⬜ pending |
| 34-02-01 | 02 | 1 | AN-01 | — | N/A | unit | `npx vitest run src/server/services/admin-analytics.service.test.ts` | ❌ W0 | ⬜ pending |
| 34-03-01 | 03 | 2 | AN-01 | T-34-01 | /admin/analityka protected by requireAdmin() | manual | admin login → navigate to /admin/analityka | — | ⬜ pending |
| 34-04-01 | 04 | 3 | AN-02 | — | N/A | manual | admin login → check /admin, verify preview before «Останні замовлення» | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/server/services/admin-analytics.service.test.ts` — stubs covering `getAnalyticsData` shape, BigInt conversion, zero-fill (`fillDays`), KPI totals
- [ ] No new vitest config needed — existing `vitest.config.ts` covers `src/**/*.test.ts`

*Existing vitest infrastructure covers all phase requirements. Only the test file needs to be created in Wave 0.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `/admin/analityka` renders charts + KPI cards + period selector | AN-01 | Chart rendering is DOM/browser — vitest can't verify visual output | Login as admin → navigate to /admin/analityka → verify KPI cards appear, period selector toggles 7/30/90 days, 2 line charts render |
| Dashboard preview appears before «Останні замовлення» | AN-02 | DOM order + visual layout | Login as admin → check /admin → verify 2 mini-charts and «Детальна аналітика» link appear before the orders section |
| Revenue format `1 200 грн` (space as thousands separator) | AN-01 (D-02) | Visual formatting | Check KPI revenue card and chart tooltip display |
| Period selector default is 30 days | AN-01 (D-04) | Default URL state | Navigate to /admin/analityka without ?days param → 30-day data shown |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
