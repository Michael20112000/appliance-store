---
status: partial
phase: 35-callback-calls
source: [35-VERIFICATION.md]
started: 2026-05-20T23:30:00Z
updated: 2026-05-20T23:30:00Z
---

## Current Test

Plan 03 Task 4 — operator workflow on `/admin/dzvinky`

## Tests

### 1. Settings page has no callback section
expected: `/admin/nalashtuvannia` shows only store settings form; no «Заявки на дзвінок»
result: [pending]

### 2. Sidebar navigates to dzvinky
expected: «Дзвінки» in sidebar → `/admin/dzvinky`, H1 «Дзвінки», default «Активні» tab
result: [pending]

### 3. Status change persists
expected: Change to «Проконсультовано» → toast → refresh keeps value
result: [pending]

### 4. Archive gate in UI
expected: «В архів» disabled when PENDING; tooltip on hover; works after CONSULTED
result: [pending]

### 5. Note save
expected: «Зберегти» persists note; cleared note shows «—»
result: [pending]

### 6. Archive tab read-only
expected: No status select, no save, no archive button on archived rows
result: [pending]

### 7. Analytics KPI regression
expected: `/admin/analityka` callback KPI loads without error
result: [pending]

### 8. No console errors
expected: Clean devtools console during steps 2–7
result: [pending]

## Summary

total: 8
passed: 0
issues: 0
pending: 8
skipped: 0
blocked: 0

## Gaps
