---
status: partial
phase: 31-order-status-ux-bugfix
source: [31-VERIFICATION.md]
started: 2026-05-20T15:55:00Z
updated: 2026-05-20T15:55:00Z
---

## Current Test

На `/admin/zamovlennia` знайти ASL-20260519-0013 (або PENDING pickup з товаром qty=0) і в списку обрати «Підтверджено»

## Tests

### 1. Stock toast on list confirm (qty=0)
expected: Toast «Недостатньо товару на складі для підтвердження.» + hint «Збільште кількість…», не generic UNKNOWN «Не вдалося оновити статус…»
result: [pending]

### 2. Confirm after qty restore
expected: CONFIRMED проходить без stock-помилки; статус оновлюється
result: [pending]

### 3. Visual accents and label width
expected: Різні акценти тригера за статусом; «Підтверджено (поточний)» не обрізаний
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
