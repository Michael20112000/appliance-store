---
status: complete
phase: 11-admin-list-row-ux
source:
  - 11-01-SUMMARY.md
  - 11-02-SUMMARY.md
  - 11-03-SUMMARY.md
  - 11-04-SUMMARY.md
  - 11-05-SUMMARY.md
  - 11-MANUAL-CHECKLIST.md
started: 2026-05-18T14:30:00Z
updated: 2026-05-18T16:50:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Orders list row navigation
expected: Click order row opens detail; no «Відкрити»/«Дії» column on `/admin/zamovlennia`
result: pass
note: Row click OK. Status badge navigated row — fixed via OrderListStatusSelect (inline status + stopPropagation).

### 1b. Orders list status control
expected: Click status control opens Select to change status; does not navigate to detail
result: pass
note: Fixed in-session with `order-list-status-select.tsx` (Phase 12 behavior brought forward).

### 2. Categories list row navigation and Plus CTA
expected: On `/admin/kategorii` — row click opens `/admin/kategorii/[id]`; no «Редагувати» column; «Додати категорію» shows Plus icon (size-4) left of label
result: pass

### 3. Products list Plus CTA and row navigation
expected: On `/admin/tovary` — «Додати товар» has Plus left of label; product row click opens `/admin/tovary/[id]`
result: pass

### 4. Product status Select does not trigger row navigation
expected: On `/admin/tovary` — open status Select on a row and change value; page stays on list (row does not navigate away)
result: pass

### 5. Dashboard recent orders row navigation
expected: On `/admin` — click a recent order row → same detail URL as orders list; no «Відкрити» column in recent orders table
result: pass

### 6. Keyboard row navigation
expected: Tab to a clickable row on any admin list above, press Enter — opens the same detail page as clicking the row; hover/focus shows pointer cursor and muted highlight
result: pass

## Summary

total: 7
passed: 7
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
