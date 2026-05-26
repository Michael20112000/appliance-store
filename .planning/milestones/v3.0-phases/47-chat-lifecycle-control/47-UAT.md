---
status: complete
phase: 47-chat-lifecycle-control
source:
  - 47-01-SUMMARY.md
  - 47-02-SUMMARY.md
  - 47-03-SUMMARY.md
  - 47-04-SUMMARY.md
  - 47-05-SUMMARY.md
started: 2026-05-25T00:00:00Z
updated: 2026-05-25T20:50:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Admin closes chat — buyer widget shows "Чат завершено"
expected: |
  Admin opens an active conversation in the admin panel and closes it.
  Within ~1 second, the buyer's open chat widget updates to show "Чат завершено"
  and the composer input becomes locked/disabled.
result: pass

### 2. "Почати новий чат" button opens a fresh active conversation
expected: |
  After a chat is closed, the buyer sees the ArchivedChatBanner with a
  "Почати новий чат" button. Clicking it creates a new conversation and
  opens it in the widget with an empty message history and an active input.
result: pass

### 3. Guest messages preserved after login
expected: |
  A guest sends messages in the chat widget (conversation stored via localStorage token).
  The guest then registers or logs in. After login, the previous conversation appears
  in their account history with all prior messages intact.
result: pass

## Summary

total: 3
passed: 3
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
