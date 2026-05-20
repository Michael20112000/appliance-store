---
status: resolved
phase: 28-nav-homepage-catalog-labels
source: [28-VERIFICATION.md]
started: 2026-05-20T14:15:00Z
updated: 2026-05-20T14:20:00Z
---

## Current Test

none — all items passed

## Tests

### 1. Guest drawer auth below callback
expected: Увійти and Реєстрація visible in mobile drawer after callback form
result: passed

### 2. Signed-in drawer auth
expected: Кабінет link and Вийти button in drawer; header auth unchanged
result: passed

### 3. Hero smooth scroll to categories
expected: Click «Переглянути категорії» scrolls to #kategorii with title below sticky header
result: passed

### 4. Reduced motion scroll
expected: With prefers-reduced-motion, hash jump is instant
result: passed

### 5. Homepage category count badges
expected: Singular «1 товар»; plural digits only; no zero-count cards
result: [pending]

### 6. Catalog sort labels
expected: /katalog sort shows Найновіші, Дорожче, Дешевше; URL sort keys unchanged
result: passed

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
