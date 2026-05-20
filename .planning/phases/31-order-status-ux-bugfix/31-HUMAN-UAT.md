---
status: resolved
phase: 31-order-status-ux-bugfix
source: [31-VERIFICATION.md]
started: 2026-05-20T15:55:00Z
updated: 2026-05-20T16:00:00Z
approved: 2026-05-20T16:00:00Z
---

## Current Test

[complete — all items approved]

## Tests

### 1. Stock toast on list confirm (qty=0)
expected: Toast «Недостатньо товару на складі для підтвердження.» + hint «Збільште кількість…», не generic UNKNOWN «Не вдалося оновити статус…»
result: pass

### 2. Confirm after qty restore
expected: CONFIRMED проходить без stock-помилки; статус оновлюється
result: pass

### 3. Visual accents and label width
expected: Різні акценти тригера за статусом; «Підтверджено (поточний)» не обрізаний
result: pass

## Summary

total: 3
passed: 3
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
