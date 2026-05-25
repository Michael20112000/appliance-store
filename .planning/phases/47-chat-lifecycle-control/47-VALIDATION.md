---
phase: 47
slug: chat-lifecycle-control
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-25
---

# Phase 47 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 |
| **Config file** | `vitest.config.ts` (project root) |
| **Quick run command** | `npx vitest run src/server/services/chat.service.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~25 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/server/services/chat.service.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green (excluding 2 pre-existing `prisma/seed.test.ts` failures)
- **Max feedback latency:** 25 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 47-W0-01 | W0 | 0 | CHAT-04 | — | N/A | unit stub | `npx vitest run src/server/actions/admin/chat.actions.test.ts` | ❌ W0 | ⬜ pending |
| 47-W0-02 | W0 | 0 | CHAT-05 | — | N/A | unit stub | `npx vitest run src/server/services/chat.service.test.ts` | ❌ W0 | ⬜ pending |
| 47-W0-03 | W0 | 0 | CHAT-02 | — | N/A | unit stub | `npx vitest run src/server/services/chat.service.test.ts` | ❌ W0 | ⬜ pending |
| 47-W0-04 | W0 | 0 | CHAT-02 | T-47-claim-auth | 401 without session | unit stub | `npx vitest run src/app/api/chat/claim/route.test.ts` | ❌ W0 | ⬜ pending |
| 47-01-01 | 01 | 1 | CHAT-04 | T-47-archive-auth | `requireAdmin()` rejects non-admin | unit | `npx vitest run src/server/services/chat.service.test.ts` | ✅ extend | ⬜ pending |
| 47-01-02 | 01 | 1 | CHAT-04 | — | `archiveConversation` sets `isActive=false` alongside `status=ARCHIVED` | unit | `npx vitest run src/server/services/chat.service.test.ts` | ✅ extend | ⬜ pending |
| 47-01-03 | 01 | 1 | CHAT-04 | — | `archiveConversationAction` triggers Pusher `conversation:closed` event | unit | `npx vitest run src/server/actions/admin/chat.actions.test.ts` | ❌ W0 | ⬜ pending |
| 47-02-01 | 02 | 1 | CHAT-05 | — | `createNewConversation({ userId })` deactivates old + creates new in $transaction | unit | `npx vitest run src/server/services/chat.service.test.ts` | ❌ W0 | ⬜ pending |
| 47-02-02 | 02 | 1 | CHAT-05 | — | `createNewConversation({ guestToken })` works for guest | unit | `npx vitest run src/server/services/chat.service.test.ts` | ❌ W0 | ⬜ pending |
| 47-03-01 | 03 | 1 | CHAT-02 | T-47-claim-auth | `POST /api/chat/claim` returns 401 without session | unit | `npx vitest run src/app/api/chat/claim/route.test.ts` | ❌ W0 | ⬜ pending |
| 47-03-02 | 03 | 1 | CHAT-02 | T-47-claim-spoof | claim links guestToken to authenticated userId only | unit | `npx vitest run src/server/services/chat.service.test.ts` | ❌ W0 | ⬜ pending |
| 47-03-03 | 03 | 1 | CHAT-02 | — | `claimGuestConversation` idempotent — second call is no-op | unit | `npx vitest run src/server/services/chat.service.test.ts` | ❌ W0 | ⬜ pending |
| 47-03-04 | 03 | 1 | CHAT-02 | — | `claimGuestConversation` when user already has active conv: guest conv becomes inactive | unit | `npx vitest run src/server/services/chat.service.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/server/actions/admin/chat.actions.test.ts` — stubs for CHAT-04 Pusher trigger assertion (mock `getPusherServer`)
- [ ] `src/server/services/chat.service.test.ts` — add stubs for `claimGuestConversation` (3 cases) and `createNewConversation` (2 cases); extend existing `archiveConversation` test to assert `isActive=false`
- [ ] `src/app/api/chat/claim/route.test.ts` — stub for 401-without-session auth guard

*Existing infrastructure covers all other phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Buyer's open widget shows "Чат завершено" within ~1 second of admin closing chat | CHAT-04 | Requires real Pusher connection + two browser sessions | Open buyer widget in Tab A; admin closes chat in Tab B via admin panel; observe Tab A widget updates within 1s |
| "Почати новий чат" button appears in closed banner; clicking opens fresh conversation | CHAT-05 | Requires browser interaction flow | Close a chat (via admin), see banner in buyer widget, click button, verify new empty conversation opens |
| Guest messages preserved on login — conversation appears in account history | CHAT-02 | Requires guest → auth user login flow in browser | Open chat as guest, send messages, register/log in, verify messages appear under new account |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 25s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
