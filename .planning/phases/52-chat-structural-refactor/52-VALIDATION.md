---
phase: 52
slug: chat-structural-refactor
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-27
---

# Phase 52 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 + @testing-library/react 16.3.2 |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npm test -- --run src/components/chat/` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds (chat suite) / ~60 seconds (full) |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run src/components/chat/`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 52-01-01 | 01 | 0 | CHAT-12, CHAT-13, CHAT-14 | — | N/A — UI state only | unit (stub) | `npm test -- --run src/components/chat/chat-panel.test.tsx` | ✅ exists | ⬜ pending |
| 52-02-01 | 02 | 1 | CHAT-14 | — | isOpen is pure useState, not URL-derived | unit | `npm test -- --run src/components/chat/chat-panel.test.tsx` | ✅ exists | ⬜ pending |
| 52-03-01 | 03 | 1 | CHAT-12 | — | Mobile Drawer renders with SwipeArea; swipeDirection="down" | unit | `npm test -- --run src/components/chat/chat-panel.test.tsx` | ✅ exists | ⬜ pending |
| 52-04-01 | 04 | 2 | CHAT-13 | — | PanelBody always rendered; history overlay positioned absolute | unit | `npm test -- --run src/components/chat/chat-panel.test.tsx` | ✅ exists | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] New test cases in `src/components/chat/chat-panel.test.tsx` — add stubs for:
  - CHAT-12: mobile Drawer structure (DrawerRoot + DrawerSwipeArea present when isMobile + isOpen)
  - CHAT-13: history overlay always-rendered (PanelBody present when isOpen=true, panelView="history")
  - CHAT-14: isOpen is NOT derived from URL (no `query.chat` reference; `closePanel` does not call `setQuery`)
- [ ] Update `baseChatContext` mock if `ChatContextValue` type changes due to nuqs removal

*(Existing `chat-panel.test.tsx` exists — only new test cases needed, not a new file)*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Swipe-to-dismiss on real iOS/Android | CHAT-12 | jsdom cannot simulate touch velocity gestures | On mobile device, open chat → swipe down → verify drawer closes |
| Chat stays open after Link navigation | CHAT-14 | jsdom has no router navigation | Open chat → click catalog link → verify widget still visible |
| History panel width / conversation peek | CHAT-13 | Visual proportion check | Open chat → tap history → verify right edge of conversation thread is visible |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
