---
status: resolved
phase: 10-category-showcase-images
source: [10-VERIFICATION.md]
started: 2026-05-17T22:25:00Z
updated: 2026-05-17T23:00:00Z
---

## Current Test

none — operator approved 2026-05-17

## Tests

### 1. Homepage placeholder
expected: Category without imagePublicId shows «Без фото»; grid 2 cols mobile / 4 cols md; links to /katalog/{slug}
result: pass

### 2. Admin upload → homepage
expected: Section «Зображення категорії» on /admin/kategorii/[id]; after Cloudinary upload, homepage card shows image after refresh
result: pass

### 3. Remove → placeholder
expected: «Прибрати фото» clears admin preview and homepage returns to «Без фото»
result: pass

### 4. Alt fallback
expected: Empty imageAlt renders alt `{name} — б/у техніка, Львів` in DevTools
result: pass

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
