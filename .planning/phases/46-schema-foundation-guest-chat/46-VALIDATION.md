---
phase: 46
slug: schema-foundation-guest-chat
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-25
---

# Phase 46 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 |
| **Config file** | `vitest.config.ts` (project root) |
| **Quick run command** | `npx vitest run src/server/validators/chat.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~7 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/server/validators/chat.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green (excluding 2 pre-existing seed failures in `prisma/seed.test.ts`)
- **Max feedback latency:** ~7 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 46-01-01 | 01 | 1 | CHAT-01 | T-46-01 / Pitfall 1 | `DROP INDEX "Conversation_userId_key"` present in migration.sql | manual | `grep "DROP INDEX" prisma/migrations/*/migration.sql` | ❌ W0 | ⬜ pending |
| 46-01-02 | 01 | 1 | CHAT-01 | — | `sendMessageSchema` accepts `guestToken` UUID | unit | `npx vitest run src/server/validators/chat.test.ts` | ✅ extend | ⬜ pending |
| 46-02-01 | 02 | 1 | CHAT-01 | T-46-02 | `getOrCreateGuestConversation` creates on first message; returns existing on retry (P2002 guard) | unit | `npx vitest run src/server/services/chat.service.test.ts` | ❌ W0 | ⬜ pending |
| 46-02-02 | 02 | 1 | CHAT-01 | — | `GET /api/chat/guest` returns 404 for unknown token; 200+conversationId for known token | unit | `npx vitest run src/server/services/chat.service.test.ts` | ❌ W0 | ⬜ pending |
| 46-03-01 | 03 | 2 | CHAT-03 | — | `listConversationsForAdmin` returns `buyerName: "Гість"` when userId is null | unit | `npx vitest run src/server/services/chat.service.test.ts` | ❌ W0 | ⬜ pending |
| 46-04-01 | 04 | 2 | CHAT-01 | T-46-03 | Pusher auth: valid guestToken+conversationId → 200; wrong token → 403; no token+no session → 401 | unit | `npx vitest run src/server/services/chat.service.test.ts` | ❌ W0 | ⬜ pending |
| 46-05-01 | 05 | 3 | CHAT-01 | — | Guest opens widget → no redirect to /uviity; composer shown immediately | manual | browser: open widget while logged out | — | ⬜ pending |
| 46-05-02 | 05 | 3 | CHAT-01 | — | Guest sends first message → POST creates DB record; subsequent POST finds by guestToken | manual | browser: send message, check DB | — | ⬜ pending |
| 46-05-03 | 05 | 3 | CHAT-01 | — | Guest refreshes page → conversation restored from localStorage token | manual | browser: refresh after sending message | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/server/services/chat.service.test.ts` — stubs for CHAT-01 service logic: `getOrCreateGuestConversation`, `getGuestConversation`, `listConversationsForAdmin` null fallback, Pusher auth guest path
- [ ] Extend `src/server/validators/chat.test.ts` — add `guestToken` UUID validation test cases

*Existing vitest.config.ts covers the framework — no new install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Widget opens without redirect for unauthenticated user | CHAT-01 | Requires browser with no session cookie; not feasible in unit test | Open app in incognito → click chat button → verify widget appears, no /uviity redirect |
| Guest messages restored after page refresh | CHAT-01 | Requires real localStorage + DB round-trip | Send message as guest → refresh → verify messages still visible |
| "Гість" label appears in admin inbox | CHAT-03 | Requires admin UI + guest conversation in DB | Send guest message → open /admin/chaty → verify buyerName shows "Гість" |
| Pusher real-time delivery for guests | CHAT-01 | Requires live Pusher connection | Send guest message → verify admin sees it in real time without polling |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
