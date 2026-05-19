---
status: partial
phase: 19-database-purge-empty-states
source: [19-VERIFICATION.md]
started: 2026-05-19T13:52:00Z
updated: 2026-05-19T13:52:00Z
---

## Current Test

Admin post-purge smoke (§4 in 19-MANUAL-CHECKLIST.md)

## Tests

### 1. Admin routes after purge (authenticated)
expected: No 500 on /admin, /admin/tovary, /admin/kategorii, /admin/zamovlennia?filter=all, /admin/chaty, /admin/tovary/novyi; StatCards 0; existing UA empty copy; console clean
result: [pending]

### 2. User count unchanged after purge
expected: prisma user.count() same before/after purge; admin login works with existing credentials
result: [pending]

### 3. Optional /obrane when signed in
expected: WishlistEmptyState, no 500
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
