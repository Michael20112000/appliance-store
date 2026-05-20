---
phase: 35
slug: callback-calls
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-20
---

# Phase 35 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- --run src/server/services/callback-request.service.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15–30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run src/server/services/callback-request.service.test.ts`
- **After every plan wave:** Run `npm test` && `npx tsc --noEmit`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 35-01-01 | 01 | 0 | CALL-02 | T-35-02 | Status/archive/list unit stubs | unit | `npm test -- --run src/server/services/callback-request.service.test.ts` | ✅ extend | ⬜ pending |
| 35-01-02 | 01 | 0 | CALL-03 | T-35-03 | Validator schemas | unit | `npm test -- --run src/server/validators/admin-callback.test.ts` | ❌ W0 | ⬜ pending |
| 35-02-01 | 02 | 1 | CALL-02 | T-35-01 | Migration defaults PENDING | integration | `npx prisma migrate dev --name callback_admin_fields` | ❌ W0 | ⬜ pending |
| 35-02-02 | 02 | 1 | CALL-02/04 | T-35-02 | requireAdmin + archive gate | unit | `npm test -- --run src/server/services/callback-request.service.test.ts` | ✅ extend | ⬜ pending |
| 35-03-01 | 03 | 2 | CALL-01 | — | Settings page no callback block | manual/grep | `rg "Заявки на дзвінок" src/app/(admin)/admin/nalashtuvannia` → 0 | — | ⬜ pending |
| 35-03-04 | 03 | 2 | CALL-01–04 | — | /admin/dzvinky UI flows | manual UAT | Plan 03 Task 4 checkpoint | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Extend `src/server/services/callback-request.service.test.ts` — status update, archive gate, list filters
- [ ] Add `src/server/validators/admin-callback.test.ts` — view enum, note validation
- [ ] `[BLOCKING]` `npx prisma migrate dev --name callback_admin_fields` after schema change

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dedicated page + nav | CALL-01 | RSC + sidebar integration | Open `/admin/dzvinky`; sidebar «Дзвінки»; no block on `/admin/nalashtuvannia` |
| Status + note + archive UX | CALL-02–04 | Client components + toasts | Active tab: change status, save note, archive when CONSULTED; Archive tab read-only |
| Analytics KPI unchanged | D-12 | Cross-page regression | `/admin/analityka` callback count includes archived-in-period |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
