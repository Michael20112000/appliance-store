---
phase: 14
slug: admin-chat-context-menu
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-18
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 + Playwright 1.60.0 |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run test:e2e` |
| **Estimated runtime** | ~2–4 minutes |

---

## Sampling Rate

- **After every task commit:** `npm test` + `npx playwright test e2e/admin-chat.spec.ts`
- **After every plan wave:** `npm run test:e2e`
- **Before `/gsd-verify-work`:** Full suite green + manual D-14-16 checklist
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 14-01-01 | 01 | 1 | ADM-CHAT-01 | — | shadcn context-menu installed | manual | `test -f src/components/ui/context-menu.tsx` | ❌ W0 | ⬜ pending |
| 14-02-01 | 02 | 2 | ADM-CHAT-01 | T-14-01 | requireAdmin on actions | integration | `npx vitest run src/server/services/chat.service.test.ts` | ✅ | ⬜ pending |
| 14-02-02 | 02 | 2 | ADM-CHAT-01 | — | shared lifecycle hook | unit | `npx vitest run src/components/chat/conversation-lifecycle*.test.tsx` | ❌ W0 | ⬜ pending |
| 14-03-01 | 03 | 3 | ADM-CHAT-01 | — | desktop RCM archive | e2e | `npx playwright test e2e/admin-chat.spec.ts -g "right-click"` | ❌ W0 | ⬜ pending |
| 14-03-02 | 03 | 3 | ADM-CHAT-01 | — | mobile no list menu | e2e | mobile viewport in spec | ❌ W0 | ⬜ pending |
| 14-03-03 | 03 | 3 | ADM-CHAT-01 | T-14-02 | delete confirm | e2e/manual | Playwright dialog handler | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npx shadcn@latest add context-menu` → `src/components/ui/context-menu.tsx`
- [ ] Extend `e2e/admin-chat.spec.ts` — desktop right-click, menuitem visibility
- [ ] Optional `conversation-lifecycle-menu-items.test.tsx` — visibility matrix
- [ ] `14-MANUAL-CHECKLIST.md` — D-14-16 items

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| ПКМ не ламає лівий клік | D-14-11 | subtle UX | Desktop: RCM then left-click another row |
| Keyboard path via thread ⋮ | D-14-13 | a11y MVP | Tab to thread ⋮, run archive |

---

*Derived from 14-RESEARCH.md Validation Architecture*
