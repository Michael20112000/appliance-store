---
status: partial
phase: 45-floating-ui-overhaul
source: [45-VERIFICATION.md]
started: 2026-05-24T00:00:00Z
updated: 2026-05-24T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. No premature validation error during typing
expected: Type "097" in the callback dialog phone field — no error message should appear while typing (error only shows after a failed submit attempt)
result: [pending]

### 2. FAB column layout
expected: Visit any storefront page — callback/cart/chat FABs stacked vertically in the bottom-right corner, nothing on the left
result: [pending]

### 3. Dialog backdrop covers FABs
expected: Open callback dialog — no FAB buttons visible through the overlay (z-[49] vs z-50 stacking correctly hides FABs behind dialog backdrop)
result: [pending]

### 4. Chat FAB disappears when panel opens
expected: Open chat panel — chat button is no longer visible in the FAB column
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
