---
phase: 26
slug: footer-mobile-contact
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-19
---

# Phase 26 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- --run src/server/validators/phone.test.ts src/server/validators/callback.test.ts` |
| **Full suite command** | `npm test` |
| **Phase gate** | `npm run build` |
| **Estimated runtime** | ~25 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command for touched test files
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite + `npm run build` must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 26-01-01 | 01 | 0 | FOOT-02 | T-26-01 | `uaPhoneSchema` shared; rejects invalid digits | unit | `npm test -- --run src/server/validators/phone.test.ts` | ❌ W0 | ⬜ pending |
| 26-01-02 | 01 | 0 | FOOT-02 | T-26-01 | Callback schema mirrors checkout phone rules | unit | `npm test -- --run src/server/validators/callback.test.ts` | ❌ W0 | ⬜ pending |
| 26-01-03 | 01 | 1 | FOOT-01 | — | Public DTO omits empty contact sections | unit | `npm test -- --run src/server/services/store-settings.service.test.ts` | ❌ W0 | ⬜ pending |
| 26-01-04 | 01 | 1 | FOOT-02 | T-26-02 | Rate limit blocks after N/IP/hour | unit | `npm test -- --run src/server/services/callback-request.service.test.ts` | ❌ W0 | ⬜ pending |
| 26-01-05 | 01 | 2 | FOOT-03 | — | Shared form success toast + inline errors | component | `npm test -- --run src/components/store/callback-request-form.test.tsx` | ❌ W0 | ⬜ pending |
| 26-01-06 | 01 | 2 | FOOT-04 | — | Drawer badge per visible category | component | `npm test -- --run src/components/layout/store-mobile-nav.test.tsx` | ❌ W0 | ⬜ pending |
| 26-01-07 | 01 | 3 | D-23 | — | Production build green | build | `npm run build` | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/server/validators/phone.ts` + `phone.test.ts` — extract `uaPhoneSchema`; mirror `order.test.ts` cases
- [ ] `src/server/validators/callback.test.ts` — callback submit schema
- [ ] `src/server/services/store-settings.service.test.ts` — empty vs populated public DTO
- [ ] `src/server/services/callback-request.service.test.ts` — rate limit count mock
- [ ] `src/components/store/callback-request-form.test.tsx` — success toast + inline error (mock action)
- [ ] `src/components/layout/store-mobile-nav.test.tsx` — badge + separator + form slot

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Footer two-column layout + lazy map | FOOT-01 | Visual / iframe provider | Desktop: contacts left, form right; map iframe lazy below address |
| `tel:` / `mailto:` links work | FOOT-01 | Device / mail client | Tap phone and email from footer |
| Callback in drawer under categories | FOOT-03 | Mobile viewport | Open menu → categories → separator → form |
| Admin settings CRUD | FOOT-01 | Operator flow | `/admin/nalashtuvannia` add phone/email/address; footer updates |
| Rate limit UX | FOOT-02 | Repeated submits | Submit callback 6× from same IP; inline limit message |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
