---
status: partial
phase: 07-catalog-filters-fix
source: [07-VERIFICATION.md]
started: 2026-05-17T19:31:00Z
updated: 2026-05-17T19:31:00Z
---

## Current Test

awaiting human testing

## Tests

### 1. Minimum price filter in grid
expected: On `/katalog?cina-vid=13000` every card shows price ≥ 13 000 ₴
result: [pending]

### 2. Slider updates URL and resets page
expected: Drag slider → `cina-vid`/`cina-do` in URL within ~200ms; `сторінка` resets to 1
result: [pending]

### 3. Category brand list scoped
expected: On `/katalog/telephony` brand select has only Samsung, Apple, Xiaomi (no Bosch/Whirlpool)
result: [pending]

### 4. Slider updates product grid
expected: After drag, grid count/cards change without full reload
result: [pending]

### 5. E2E regression
expected: `npm run test:e2e -- e2e/catalog-filters-url.spec.ts` passes (after `npx playwright install`)
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
