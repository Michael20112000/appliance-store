---
phase: 44-mobile-header-cleanup
plan: "01"
subsystem: storefront-layout
tags: [mobile, header, responsive, auth, HDR-01]
dependency_graph:
  requires: []
  provides: [HDR-01-layout]
  affects: [store-header.tsx]
tech_stack:
  added: []
  patterns: [hidden md:flex wrapper for responsive visibility]
key_files:
  modified:
    - src/components/layout/store-header.tsx
decisions:
  - "Wrap StoreHeaderAuth in hidden md:flex items-center div — matches existing SocialNavLinks wrapper pattern"
  - "Move StoreMobileNav to last child of items div — burger is rightmost element on mobile"
  - "No change to any other file — minimal-scope fix"
metrics:
  duration: "5 minutes"
  completed: "2026-05-23T18:43:33Z"
  tasks_completed: 1
  tasks_total: 1
  files_changed: 1
---

# Phase 44 Plan 01: Mobile Header Cleanup — Auth Hidden, Burger Rightmost Summary

## One-liner

Hide auth buttons on mobile with `hidden md:flex` wrapper; move StoreMobileNav to last position in items div so burger is rightmost element on all mobile viewports.

## What Was Built

Restructured the flex items div in `store-header.tsx` to satisfy HDR-01:

**Before:**
1. StoreMobileNav (burger) — first child, leftmost on mobile
2. SocialNavLinks (hidden md:flex)
3. WishlistNavLink
4. CartNavLink / GuestCartNavLink
5. StoreHeaderAuth — no responsive wrapper, always visible

**After:**
1. SocialNavLinks (hidden md:flex) — unchanged
2. WishlistNavLink — unchanged
3. CartNavLink / GuestCartNavLink — unchanged
4. StoreHeaderAuth wrapped in `hidden md:flex items-center` — hidden on mobile
5. StoreMobileNav (burger) — LAST, rightmost on mobile

**Mobile result:** Logo → Wishlist → Cart → Burger (no auth buttons in header bar)
**Desktop result:** Logo → nav links → Social → Wishlist → Cart → Auth (no burger)

Auth flows on mobile are handled by the drawer that StoreMobileNav already contains (confirmed: `StorefrontAuthLinks` in drawer).

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Reorder header items and hide auth on mobile | d9edca7 | src/components/layout/store-header.tsx |

## Verification

1. Source assertion — auth wrapper: `grep -A1 "StoreHeaderAuth"` shows element nested inside `hidden md:flex items-center` div — PASSED
2. Source assertion — burger last: `grep -n "StoreMobileNav\|StoreHeaderAuth"` shows StoreMobileNav on line 67 > StoreHeaderAuth on line 65 — PASSED
3. Build check: `npx tsc --noEmit` — no errors in `store-header.tsx` (pre-existing errors in unrelated test files only) — PASSED

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — this plan introduces no new network endpoints, auth paths, file access patterns, or schema changes. The session prop flow is unchanged (existing pattern).

## Self-Check: PASSED

- [x] `src/components/layout/store-header.tsx` exists and is modified
- [x] Commit `d9edca7` exists in git log
- [x] `hidden md:flex` appears twice in the file (SocialNavLinks wrapper + StoreHeaderAuth wrapper)
- [x] StoreMobileNav (line 67) appears after StoreHeaderAuth (line 65)
- [x] No deletions in commit
