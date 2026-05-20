---
status: partial
phase: 30-similar-products-footer-layout
source: [30-VERIFICATION.md]
started: 2026-05-20T15:25:00Z
updated: 2026-05-20T15:25:00Z
---

## Current Test

Footer desktop column layout (gap fix `0122d48`)

## Tests

### 1. Footer desktop column layout
expected: Left column shows only the tall map iframe; right column shows phones/emails/addresses stacked above the callback form — form is NOT under the map on the left
result: [pending]

### 2. PDP similar with stocked category
expected: «Схожі товари» section below the two-column PDP grid; up to 4 ProductCards; current SKU absent; 2-col grid on mobile, 4 across on md+
result: [pending]

### 3. PDP sparse category empty state
expected: No «Схожі товари» section or heading at all
result: [pending]

### 4. Footer mobile + Phase 26 regression
expected: Order contacts → callback → map; tel/mailto links work; callback validation/toast unchanged
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
