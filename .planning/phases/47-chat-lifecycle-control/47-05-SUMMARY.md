---
plan: 47-05
phase: 47-chat-lifecycle-control
status: complete
started: 2026-05-25
completed: 2026-05-25
---

## Summary

Human UAT for Phase 47 completed. All three success criteria confirmed working in browser with live Pusher connections.

## Tasks Completed

| Task | Status | Notes |
|------|--------|-------|
| Task 1: Full test suite baseline | ✓ Complete | 376 pass, 2 pre-existing seed failures only |
| Task 2: Human UAT — three Phase 47 success criteria | ✓ Complete | All three confirmed by human tester |

## UAT Results

| Test | Requirement | Result |
|------|-------------|--------|
| Admin closes chat → buyer widget shows "Чат завершено" within ~1s | CHAT-04 | ✓ Pass |
| "Почати новий чат" button opens a fresh active conversation | CHAT-05 | ✓ Pass |
| Guest messages preserved after login | CHAT-02 | ✓ Pass |

## Issues Found and Resolved During UAT

**Bug 1 — Unique constraint on guestToken (first attempt):**  
`createNewConversation` guest path deactivated the old conversation with `isActive: true` filter only, leaving `guestToken` on already-archived rows. Fixed by removing the `isActive: true` filter — but this caused the second bug.

**Bug 2 — Conversation_owner_required check constraint:**  
Clearing `guestToken: null` from the archived row left it with neither `userId` nor `guestToken`, violating the DB-level check constraint. Fixed by leaving the archived row intact and generating a fresh UUID for the new conversation. The new token is returned in the API response and stored in `localStorage` via `updateGuestToken()` context helper.

## Key Files Verified

- `src/components/chat/archived-chat-banner.tsx` — "Чат завершено" + "Почати новий чат" ✓
- `src/components/chat/chat-provider.tsx` — `conversation:closed` binding + `claimAttemptedRef` ✓
- `src/server/services/chat.service.ts` — `claimGuestConversation` + `createNewConversation` ✓

## Self-Check: PASSED
