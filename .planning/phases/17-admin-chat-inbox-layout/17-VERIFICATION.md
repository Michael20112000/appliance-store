---
phase: 17-admin-chat-inbox-layout
verified: 2026-05-19T12:00:00Z
status: passed
score: 12/12
overrides_applied: 0
re_verification: false
---

# Phase 17: Admin Chat Inbox Layout Verification Report

**Phase Goal:** Адмін на `/admin/chaty` скролить список чатів і тред всередині панелі, а не всю сторінку.

**Requirement:** ADM-CHAT-02

**Verified:** 2026-05-19T12:00:00Z

**Status:** passed

**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Desktop inbox grid is viewport-bounded via `min-h-0` / `flex-1` chain (not document-growing `calc` floor) | ✓ VERIFIED | `admin/layout.tsx` `h-dvh max-h-dvh overflow-hidden`; shell + inbox `flex-1 min-h-0`; grid `grid min-h-0 flex-1 overflow-hidden` — no `min-h-[calc(100dvh-12rem)]` in admin chat |
| 2 | H1 **Чати** and tabs stay fixed; scroll only in grid panels | ✓ VERIFIED | `admin-chat-inbox.tsx`: `shrink-0` on h1 and tab wrapper; grid `flex-1 min-h-0` |
| 3 | `ConversationList` scrolls inside left column with native `overflow-y-auto` | ✓ VERIFIED | `conversation-list.tsx` listbox `flex-1 min-h-0 overflow-y-auto`; column shell `flex min-h-0 flex-1 flex-col overflow-hidden` |
| 4 | Thread messages scroll inside `MessageList`; composer stays at column bottom | ✓ VERIFIED | `chat-thread.tsx` `flex min-h-0 flex-1 flex-col overflow-hidden`; `MessageList` `min-h-0 flex-1` / native `flex-1 overflow-y-auto`; `AdminChatComposer` after list |
| 5 | Desktop thread uses ScrollArea; mobile admin uses native scroll | ✓ VERIFIED | `chat-thread.tsx` `useNativeScroll={isMobile}`; `message-list.tsx` branches ScrollArea vs native |
| 6 | `isPanelOpen` wired for auto-scroll on thread open | ✓ VERIFIED | `isPanelOpen={Boolean(selectedConversationId)}` in `chat-thread.tsx`; effects in `message-list.tsx` |
| 7 | Mobile split (list ↔ thread) preserves single active panel with internal scroll | ✓ VERIFIED | `showList` / `showThread` conditional columns; mobile `onBack`; pathname-split shell `overflow-hidden` on chat route |
| 8 | Zero document scroll on `/admin/chaty` (desktop) | ✓ VERIFIED | Chat route: `main` + inner card `overflow-hidden`; flex chain caps height. E2e assertion in `e2e/admin-chat.spec.ts` L88–94. Operator manual sign-off Pass |
| 9 | Admin shell propagates bounded height to chat without breaking other routes | ✓ VERIFIED | `admin-sidebar-shell.tsx` `isChatInbox` → chat: `overflow-hidden` + `flex flex-1 flex-col overflow-hidden`; other routes: `overflow-y-auto` on `main` |
| 10 | List empty/loading states fill panel height (Messenger-style) | ✓ VERIFIED | `ConversationListColumn` + empty `flex flex-1 min-h-0 … justify-center`; loading skeletons in full column |
| 11 | Post-fix: `/admin/tovary` and `/admin/zamovlennia` tables contained (`min-w-0`, non-chat shell) | ✓ VERIFIED | Pages `min-w-0 space-y-6`; tables `min-w-0 overflow-x-auto`; shell does not force `flex-1` on non-chat children |
| 12 | Verification artifacts: manual checklist + Playwright scroll gate | ✓ VERIFIED | `17-MANUAL-CHECKLIST.md` (≥10 items, sign-off Pass 2026-05-19); `admin chat inbox has no document scroll on desktop` test present |

**Score:** 12/12 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/admin/admin-sidebar-shell.tsx` | Viewport height chain; pathname split | ✓ VERIFIED | `min-h-0 min-w-0`, `isChatInbox` overflow split, substantive (~60 lines) |
| `src/components/chat/admin-chat-inbox.tsx` | Page flex layout; grid sizing | ✓ VERIFIED | `flex min-h-0 flex-1 flex-col gap-6`, grid `flex-1 min-h-0 overflow-hidden md:grid-cols-[320px_1fr]` |
| `src/components/chat/conversation-list.tsx` | Full-height column + listbox scroll | ✓ VERIFIED | `overflow-y-auto` on listbox; wired from inbox grid wrappers |
| `src/components/chat/chat-thread.tsx` | Thread flex + MessageList props | ✓ VERIFIED | `isPanelOpen`, `useNativeScroll`; lifecycle/context menu preserved |
| `src/app/(admin)/admin/layout.tsx` | Admin viewport root | ✓ VERIFIED | `h-dvh max-h-dvh overflow-hidden` |
| `e2e/admin-chat.spec.ts` | Scroll gate + chat regressions | ✓ VERIFIED | Document scroll test L77–106; wiring via `loginAsAdmin` + `/admin/chaty` |
| `17-MANUAL-CHECKLIST.md` | Operator regression script | ✓ VERIFIED | Sign-off Pass; operator approved per execution notes |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `admin/layout.tsx` | `AdminSidebarShell` | children | ✓ WIRED | `h-dvh` root wraps shell |
| `admin-sidebar-shell.tsx` | `AdminChatInbox` | inner card children | ✓ WIRED | Chat path `flex flex-1 flex-col overflow-hidden` |
| `admin-chat-inbox.tsx` | `ConversationList` / `ChatThread` | grid column wrappers | ✓ WIRED | `min-h-0 flex-col overflow-hidden` |
| `chat-thread.tsx` | `message-list.tsx` | `useNativeScroll`, `isPanelOpen` | ✓ WIRED | Props match `MessageListProps` |
| `e2e/admin-chat.spec.ts` | `/admin/chaty` | `page.goto` + `evaluate` scrollHeight | ✓ WIRED | Assertion `scrollHeight <= clientHeight + 2` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `admin/chaty/page.tsx` | `conversations` | `listConversationsForAdmin({ status })` | ✓ DB query | ✓ FLOWING |
| `AdminChatInbox` | `conversations`, selection | `AdminChatProvider` props | ✓ Server-passed list | ✓ FLOWING |
| `ConversationList` | `conversations` map | props from provider | ✓ Renders rows | ✓ FLOWING |
| `ChatThread` | `messages` | `useAdminChat()` | ✓ Fetched in provider | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Playwright admin-chat suite | `npm run test:e2e -- e2e/admin-chat.spec.ts` | Exit 1: Chromium executable missing (`npx playwright install` required) | ? SKIP (env) |
| No stale calc min-h on admin inbox | `rg 'calc\(100dvh' src/components/chat/admin-chat-inbox.tsx` | No matches | ✓ PASS |

### Probe Execution

Step 7c: No phase-declared probes under `scripts/*/tests/probe-*.sh`. **SKIPPED.**

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| ADM-CHAT-02 | 17-01, 17-02, 17-03 | Fixed viewport inbox; internal list/thread scroll; no document growth | ✓ SATISFIED | Layout chain + column scroll + manual sign-off + e2e test code |

No orphaned requirement IDs for Phase 17 beyond ADM-CHAT-02.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | None in phase touchpoints | — | — |

No `TBD`/`FIXME`/`XXX` in modified chat/admin layout files.

### Human Verification Required

**Completed (not pending).** Operator approved manual checklist on 2026-05-19 (`17-MANUAL-CHECKLIST.md` sign-off: Pass, Michael Ivashko). Items covered include 10+ dialogs, long thread, mobile list/thread, tab switch, Phase 14/8 ПКМ/lifecycle, shell regression on `/admin/zamovlennia` and list pages post-fix.

Automated grep cannot assert visual scroll feel or Pusher realtime; operator sign-off closes D-17-15 and D-17-16.

### Gaps Summary

No blocking gaps. Phase goal (ADM-CHAT-02) is achieved in codebase with operator-confirmed manual regression.

**Note:** Playwright browsers were not installed in the verification environment; re-run `npx playwright install` then `npm run test:e2e -- e2e/admin-chat.spec.ts` in CI/local to execute the scroll gate automatically.

---

_Verified: 2026-05-19T12:00:00Z_

_Verifier: Claude (gsd-verifier)_
