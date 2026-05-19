---
status: resolved
phase: 26-footer-mobile-contact
source: [26-VERIFICATION.md]
started: 2026-05-19T00:00:00Z
updated: 2026-05-19T21:00:00Z
---

## Current Test

All manual checks approved by operator (phase 27 UAT session).

## Tests

### 1. Admin settings → footer links (FOOT-01)
expected: На `/admin/nalashtuvannia` додати телефон і email; у футері з'являються `tel:` та `mailto:` посилання
result: passed

### 2. Desktop footer layout (FOOT-01)
expected: Дві колонки контактів; lazy map під основною адресою
result: passed

### 3. Mobile drawer badges and form (FOOT-03, FOOT-04)
expected: У drawer (375px) — badge `productCount` біля категорій; separator; форма callback під категоріями
result: passed

### 4. Callback submit and rate limit (FOOT-02)
expected: «Передзвоніть мені» — success toast; 6-й запит за годину — inline помилка rate limit (не 5xx)
result: passed

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
