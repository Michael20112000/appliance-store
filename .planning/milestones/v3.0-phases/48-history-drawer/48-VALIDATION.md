---
phase: 48
slug: history-drawer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-26
---

# Phase 48 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/server/services/chat.service.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/server/services/chat.service.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green (baseline: 5 pre-existing failures unrelated to Phase 48)
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 48-01-01 | 01 | 1 | CHAT-07 | — | listConversationsForBuyer returns only caller's conversations | unit | `npx vitest run src/server/services/chat.service.test.ts` | ✅ (extend) | ⬜ pending |
| 48-01-02 | 01 | 1 | CHAT-07 | — | GET /api/chat/conversations returns 401 for unauthenticated | unit | `npx vitest run src/app/api/chat/conversations/route.test.ts` | ❌ W0 | ⬜ pending |
| 48-01-03 | 01 | 1 | CHAT-07 | — | GET /api/chat/conversations returns list for auth user | unit | `npx vitest run src/app/api/chat/conversations/route.test.ts` | ❌ W0 | ⬜ pending |
| 48-02-01 | 02 | 2 | CHAT-06 | — | Menu icon not rendered for guests | unit | `npx vitest run src/components/chat/chat-panel.test.tsx` | ❌ W0 | ⬜ pending |
| 48-02-02 | 02 | 2 | CHAT-06 | — | Menu icon rendered for authenticated users | unit | `npx vitest run src/components/chat/chat-panel.test.tsx` | ❌ W0 | ⬜ pending |
| 48-02-03 | 02 | 2 | CHAT-08 | — | "Новий чат" creates new conversation and switches to thread view | manual UAT | — | manual | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/app/api/chat/conversations/route.test.ts` — stubs for CHAT-07 API route (401 + list)
- [ ] `src/components/chat/chat-panel.test.tsx` — stubs for CHAT-06 menu icon visibility

*Existing infrastructure (chat.service.test.ts) covers CHAT-07 service-layer tests.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| "Новий чат" button creates new conversation and switches to thread view | CHAT-08 | Requires live Pusher subscription + real DB | Open widget as auth user → open history drawer → click "Новий чат" → verify new empty thread view |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
