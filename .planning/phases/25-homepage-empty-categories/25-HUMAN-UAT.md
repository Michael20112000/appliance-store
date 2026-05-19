---
status: resolved
phase: 25-homepage-empty-categories
source: [25-VERIFICATION.md]
started: 2026-05-19T19:22:00Z
updated: 2026-05-19T21:00:00Z
---

## Current Test

All manual checks approved by operator (phase 27 UAT session).

## Tests

### 1. Homepage hides section when all categories empty
expected: No `#kategorii` section or orphan h2 on `/` after purge/seed with no in-stock products per category
result: passed

### 2. Parity with header nav
expected: Category slugs visible in header match homepage category cards
result: passed

### 3. Sparse grid (1–3 categories)
expected: Grid stays `grid-cols-2 md:grid-cols-4` without layout hacks
result: passed

## Summary

total: 3
passed: 3
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
