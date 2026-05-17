---
status: partial
phase: 04-admin-operations
source: [04-VERIFICATION.md]
started: 2026-05-17T13:40:00.000Z
updated: 2026-05-17T13:40:00.000Z
---

## Current Test

Ручний Cloudinary upload у браузері (admin product form).

## Tests

### 1. Admin завантажує фото через Cloudinary widget на /admin/tovary/{id}
expected: Upload без помилки; превʼю зʼявляються; після збереження фото видно після reload
result: [pending]

### 2. Playwright admin E2E suite (RBAC, categories, products, orders)
expected: 4 spec files green на dev + seed admin
result: [passed]

### 3. Cloudinary dashboard policy після deploy (signed-only)
expected: Unsigned public uploads вимкнені; policy відповідає signed preset
result: [pending]

## Summary

total: 3
passed: 1
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps

None — automated verification 14/14; pending items are operational/manual only.
