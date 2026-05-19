---
status: partial
phase: 26-footer-mobile-contact
source: [26-VERIFICATION.md]
started: 2026-05-19T00:00:00Z
updated: 2026-05-19T00:00:00Z
---

## Current Test

Footer contacts, mobile drawer, callback form

## Tests

### 1. Admin settings → footer links (FOOT-01)
expected: На `/admin/nalashtuvannia` додати телефон і email; у футері з’являються `tel:` та `mailto:` посилання
result: pending

### 2. Desktop footer layout (FOOT-01)
expected: Дві колонки контактів; lazy map під основною адресою
result: pending

### 3. Mobile drawer badges and form (FOOT-03, FOOT-04)
expected: У drawer (375px) — badge `productCount` біля категорій; separator; форма callback під категоріями
result: pending

### 4. Callback submit and rate limit (FOOT-02)
expected: «Передзвоніть мені» — success toast; 6-й запит за годину — inline помилка rate limit (не 5xx)
result: pending

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
