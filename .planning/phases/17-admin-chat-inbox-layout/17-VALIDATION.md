---
phase: 17
slug: admin-chat-inbox-layout
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-19
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (unit) + Playwright (e2e) |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run test:e2e -- e2e/admin-chat.spec.ts` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint` on touched TSX files
- **After every plan wave:** Manual scroll checklist (D-17-15/16); optional `npm run test:e2e -- e2e/admin-chat.spec.ts`
- **Before `/gsd-verify-work`:** Full manual scroll checklist on desktop + mobile viewports
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 17-01-01 | 01 | 1 | ADM-CHAT-02 | — | N/A | lint | `npm run lint` | ✅ | ⬜ pending |
| 17-02-01 | 02 | 1 | ADM-CHAT-02 | — | N/A | manual | `17-MANUAL-CHECKLIST.md` | ❌ W0 | ⬜ pending |
| 17-02-02 | 02 | 2 | ADM-CHAT-02 | — | N/A | e2e | `npm run test:e2e -- e2e/admin-chat.spec.ts` | ✅ partial | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `17-MANUAL-CHECKLIST.md` — copy regression steps from `17-UI-SPEC.md`
- [ ] Optional: extend `e2e/admin-chat.spec.ts` with scroll container assertions

*Scroll behavior is manual-first per CONTEXT D-17-15.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Zero document scroll desktop | ADM-CHAT-02 | Viewport scroll not assertable in Vitest | 10+ dialogs, long thread — page scroll not needed |
| List internal scroll | ADM-CHAT-02 | CSS layout | Left column scrolls, page height stable |
| Thread internal scroll + composer fixed | ADM-CHAT-02 | CSS layout | Messages scroll; composer at bottom |
| Mobile split internal scroll | ADM-CHAT-02 | Viewport + touch | List OR thread panel scrolls internally |
| Phase 14 context menu regression | ADM-CHAT-02 | Desktop ПКМ | ПКМ → archive still works |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
