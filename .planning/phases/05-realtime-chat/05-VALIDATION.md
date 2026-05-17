---
phase: 05
slug: realtime-chat
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-17
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 + Playwright 1.60.0 |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run test:e2e` |
| **Estimated runtime** | ~25s unit, ~5min e2e |

---

## Sampling Rate

- **After every task commit:** `npm test -- src/server/services/chat.service.test.ts src/server/validators/chat.test.ts`
- **After every plan wave:** `npm test`
- **Before `/gsd-verify-work`:** Full unit + Phase 5 e2e green (Pusher live tests optional if secrets missing)
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-1 | 05-01 | 1 | CHAT-03 | T-05-01-SC | Schema migrates cleanly | migrate | `npx prisma validate && npx prisma migrate deploy` | ❌ W0 | ⬜ pending |
| 05-01-2 | 05-01 | 1 | CHAT-03 | T-05-01-01 | Conversation userId unique | unit | `npm test -- src/server/services/chat.service.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-3 | 05-01 | 1 | CHAT-02 | T-05-06 | Pusher env validated | unit | `npm test -- src/lib/env.test.ts` | ❌ W0 | ⬜ pending |
| 05-02-1 | 05-02 | 2 | CHAT-02 | T-05-06 | Channel auth rejects wrong buyer | unit | `npm test -- src/app/api/chat/pusher/auth/route.test.ts` | ❌ W0 | ⬜ pending |
| 05-02-2 | 05-02 | 2 | CHAT-02, CHAT-03 | T-05-04 | DB-first send then trigger | unit | `npm test -- src/server/services/chat.service.test.ts` | ❌ W0 | ⬜ pending |
| 05-02-3 | 05-02 | 2 | AUTH-03 | T-05-02 | Guest cannot POST message | e2e | `npx playwright test e2e/chat-auth.spec.ts` | ❌ W0 | ⬜ pending |
| 05-03-1 | 05-03 | 3 | CHAT-01 | — | FAB visible on storefront | e2e | `e2e/chat-auth.spec.ts` | ❌ W0 | ⬜ pending |
| 05-03-2 | 05-03 | 3 | CHAT-01 | — | PDP opens widget with context | e2e | `e2e/chat-widget.spec.ts` | ❌ W0 | ⬜ pending |
| 05-03-3 | 05-03 | 3 | CHAT-03 | — | Message persists after reload | e2e | `e2e/chat-persistence.spec.ts` | ❌ W0 | ⬜ pending |
| 05-04-1 | 05-04 | 4 | CHAT-04 | T-05-04 | Admin lists conversations | unit | `chat.service.test.ts` | ❌ W0 | ⬜ pending |
| 05-04-2 | 05-04 | 4 | CHAT-04 | T-05-04 | Buyer blocked from /admin/chaty | e2e | `e2e/admin-rbac.spec.ts` | ✅ pattern | ⬜ pending |
| 05-04-3 | 05-04 | 4 | CHAT-04 | — | Admin nav Чати enabled + badge | e2e | `e2e/admin-chat.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/server/validators/chat.ts` + `chat.test.ts`
- [ ] `src/server/services/chat.service.ts` + `chat.service.test.ts`
- [ ] `src/app/api/chat/messages/route.ts` + tests
- [ ] `src/app/api/chat/pusher/auth/route.ts` + tests
- [ ] `src/lib/pusher-server.ts`, `src/lib/pusher-client.ts`
- [ ] `e2e/chat-auth.spec.ts`, `e2e/chat-persistence.spec.ts`
- [ ] Extend `src/lib/env.ts` for Pusher vars
- [ ] Prisma migration Conversation/Message
- [ ] `npm install pusher@5.3.3 pusher-js@8.5.0`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live Pusher delivery | CHAT-02 | Needs Pusher dashboard + two browsers | Open buyer + admin; send message; verify instant appear without reload |
| Mobile sheet UX | CHAT-01 | Viewport | iPhone safe-area; panel full-width; FAB not covered by footer |

---

## Phase Gate Checklist

- [ ] All Wave 0 files exist
- [ ] `npm test` green
- [ ] `npx playwright test e2e/chat-auth.spec.ts e2e/chat-persistence.spec.ts` green
- [ ] `[BLOCKING] npx prisma migrate deploy` after schema change
- [ ] Pusher env documented in `.env.example`
