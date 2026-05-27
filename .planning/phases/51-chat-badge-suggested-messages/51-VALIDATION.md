---
phase: 51
slug: chat-badge-suggested-messages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-27
---

# Phase 51 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + @testing-library/react |
| **Config file** | `vitest.config.ts` (project root) |
| **Quick run command** | `npx vitest run src/components/chat/ src/server/services/chat.service.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/components/chat/ src/server/services/chat.service.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| countUnreadForBuyer service | badge | 1 | CHAT-10 | — | N/A | unit | `npx vitest run src/server/services/chat.service.test.ts` | ✅ (extend) | ⬜ pending |
| unreadCount context increment | badge | 1 | CHAT-10 | — | N/A | unit (jsdom) | `npx vitest run src/components/chat/chat-provider.test.tsx` | ❌ W0 | ⬜ pending |
| Badge renders in StorefrontFabs | badge | 1 | CHAT-10 | — | N/A | unit (jsdom) | `npx vitest run src/components/layout/storefront-fabs.test.tsx` | ✅ (extend) | ⬜ pending |
| Badge hidden at zero | badge | 1 | CHAT-10 | — | N/A | unit (jsdom) | `npx vitest run src/components/layout/storefront-fabs.test.tsx` | ✅ (extend) | ⬜ pending |
| SuggestedMessages product chip | suggestions | 2 | CHAT-11 | — | N/A | unit (jsdom) | `npx vitest run src/components/chat/suggested-messages.test.tsx` | ❌ W0 | ⬜ pending |
| SuggestedMessages general chips | suggestions | 2 | CHAT-11 | — | N/A | unit (jsdom) | `npx vitest run src/components/chat/suggested-messages.test.tsx` | ❌ W0 | ⬜ pending |
| Chips hidden after first message | suggestions | 2 | CHAT-11 | — | N/A | unit (jsdom) | `npx vitest run src/components/chat/chat-panel.test.tsx` | ✅ (extend) | ⬜ pending |
| Chip click prefills input | suggestions | 2 | CHAT-11 | — | N/A | unit (jsdom) | `npx vitest run src/components/chat/suggested-messages.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/chat/suggested-messages.test.tsx` — stubs for CHAT-11 chip render, visibility, and click handler
- [ ] `src/components/chat/chat-provider.test.tsx` — stubs for CHAT-10 unread count increment/reset (may defer to integration if mocking is complex)

*Existing files to extend:*
- `src/server/services/chat.service.test.ts` — add `countUnreadForBuyer` test cases
- `src/components/layout/storefront-fabs.test.tsx` — add numeric badge render cases
- `src/components/chat/chat-panel.test.tsx` — add suggested messages visibility cases

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Badge updates in real-time (Pusher) when admin sends message | CHAT-10 | Requires two sessions + live Pusher connection | Open chat as admin, send message; verify badge increments on user session without page reload |
| Badge clears on panel open | CHAT-10 | Requires visual verification + state reset | Click FAB; verify badge disappears and count resets to 0 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
