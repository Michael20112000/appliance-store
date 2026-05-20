---
status: resolved
phase: 35-callback-calls
source: [35-VERIFICATION.md]
started: 2026-05-20T23:30:00Z
updated: 2026-05-20T12:00:00Z
---

## Current Test

None — all items approved.

## Tests

### 1. Settings page has no callback section
expected: `/admin/nalashtuvannia` shows only store settings form; no «Заявки на дзвінок»
result: passed

### 2. Sidebar navigates to dzvinky
expected: «Дзвінки» in sidebar → `/admin/dzvinky`, H1 «Дзвінки», default «Активні» tab
result: passed

### 3. Status change persists
expected: Change to «Проконсультовано» → toast → refresh keeps value
result: passed

### 4. Archive gate in UI
expected: «В архів» disabled when PENDING; tooltip on hover; works after CONSULTED
result: passed

### 5. Note save
expected: «Зберегти» persists note; cleared note shows «—»
result: passed

### 6. Archive tab read-only
expected: No status select, no save, no archive button on archived rows
result: passed

### 7. Analytics KPI regression
expected: `/admin/analityka` callback KPI loads without error
result: passed

### 8. No console errors
expected: Clean devtools console during steps 2–7
result: passed

## Summary

total: 8
passed: 8
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
