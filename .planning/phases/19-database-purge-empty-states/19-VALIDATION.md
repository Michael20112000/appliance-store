---
phase: 19
slug: database-purge-empty-states
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-19
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1.6 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run prisma/purge-business-data.test.ts` (if added) else `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15–30 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick command for touched test files
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite green + manual checklist signed
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 19-01-01 | 01 | 1 | DATA-01 | T-19-01 | Exit 1 without CONFIRM / --confirm | unit | `npx vitest run prisma/purge-business-data.test.ts -x` | ❌ W0 | ⬜ pending |
| 19-01-02 | 01 | 1 | DATA-01 | T-19-02 | Exit 1 on production without ALLOW_PRODUCTION_PURGE | unit | same | ❌ W0 | ⬜ pending |
| 19-01-03 | 01 | 1 | DATA-01 | — | deleteMany order in transaction | unit (mock tx) | same | ❌ W0 | ⬜ pending |
| 19-01-04 | 01 | 1 | DATA-01 | — | `npm run db:purge` invokes script | manual | operator dev DB | — | ⬜ pending |
| 19-02-01 | 02 | 2 | DATA-02 | — | Routes render without 500 at 0 rows | manual | `19-MANUAL-CHECKLIST.md` | ❌ W0 | ⬜ pending |
| 19-02-02 | 02 | 2 | DATA-02 | — | Dashboard StatCards show 0 | manual | checklist | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `prisma/purge-business-data.ts` — purge implementation
- [ ] `package.json` — `db:purge` script
- [ ] `README.md` — operator subsection
- [ ] `.planning/phases/19-database-purge-empty-states/19-MANUAL-CHECKLIST.md`
- [ ] Optional: `prisma/purge-business-data.test.ts` — guard + transaction order mocks

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Full purge on dev DB | DATA-01 | Destructive; needs real Postgres | Backup → `CONFIRM_DB_PURGE=yes npm run db:purge` → verify User count unchanged |
| Storefront/admin smoke at 0 rows | DATA-02 | Multi-route RSC + auth | Follow `19-MANUAL-CHECKLIST.md` after purge |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
