---
status: complete
phase: 08-admin-ux-chat-lifecycle
source: [08-VERIFICATION.md]
started: 2026-05-17T20:15:00Z
updated: 2026-05-17T22:00:00Z
---

## Current Test

All tests passed — approved by operator.

## Tests

### 1. Desktop sidebar collapse and navigation
expected: Sidebar stays visible; SidebarRail collapses to icons; nav links work
result: pass

### 2. Mobile SidebarTrigger and Sheet
expected: Header trigger visible on mobile; overlay menu opens/closes without trapping content
result: pass

### 3. Orders page — page size and pagination
expected: URL uses `page` and `pageSize`; row count matches; filter change resets page=1
result: pass

### 4. Orders page — column sort headers
expected: `sort` and `dir` update in URL; table order changes
result: pass

### 5. Chat archive / unarchive flow
expected: Archive removes thread from Активні; appears under Архів; unarchive restores; toasts shown
result: pass

### 6. Chat delete with AlertDialog confirm
expected: Confirm UA copy; toast «Діалог видалено»; thread removed from list
result: pass

### 7. Buyer archived read-only in storefront chat
expected: Banner «Діалог закрито магазином»; composer disabled; POST returns 403 CHAT_ARCHIVED
result: pass

## Summary

total: 7
passed: 7
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
