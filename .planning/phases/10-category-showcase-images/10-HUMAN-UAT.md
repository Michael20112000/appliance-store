---
status: partial
phase: 10-category-showcase-images
source: [10-VERIFICATION.md]
started: 2026-05-17T22:25:00Z
updated: 2026-05-17T22:25:00Z
---

## Current Test

awaiting human testing

## Tests

### 1. Homepage placeholder
expected: Category without imagePublicId shows «Без фото»; grid 2 cols mobile / 4 cols md; links to /katalog/{slug}
result: [pending]

### 2. Admin upload → homepage
expected: Section «Зображення категорії» on /admin/kategorii/[id]; after Cloudinary upload, homepage card shows image after refresh
result: [pending]

### 3. Remove → placeholder
expected: «Прибрати фото» clears admin preview and homepage returns to «Без фото»
result: [pending]

### 4. Alt fallback
expected: Empty imageAlt renders alt `{name} — категорія, Львів` in DevTools
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
