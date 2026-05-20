---
phase: 28-nav-homepage-catalog-labels
plan: 01
subsystem: ui
tags: [nextjs, auth, mobile-nav, drawer]
requires: []
provides:
  - Shared StorefrontAuthLinks for header and mobile drawer
  - Session passed from StoreHeader into StoreMobileNav
affects: [storefront-nav]
tech-stack:
  added: []
  patterns: [shared client auth links component]
key-files:
  created:
    - src/components/layout/storefront-auth-links.tsx
  modified:
    - src/components/layout/store-header-auth.tsx
    - src/components/layout/store-mobile-nav.tsx
    - src/components/layout/store-header.tsx
    - src/components/layout/store-mobile-nav.test.tsx
key-decisions:
  - "Auth markup lives in StorefrontAuthLinks; StoreHeaderAuth is a thin wrapper"
patterns-established:
  - "Drawer auth block after callback form with second Separator"
requirements-completed: [NAV-01]
duration: 15min
completed: 2026-05-20
---

# Phase 28 Plan 01 Summary

**Mobile drawer now mirrors header auth: guests see Увійти/Реєстрація, signed-in users see Кабінет/Вийти below the callback form.**

## Accomplishments
- Extracted `StorefrontAuthLinks` with unchanged paths and Ukrainian copy
- Wired `session` from server `StoreHeader` into `StoreMobileNav`
- Extended Vitest for guest and signed-in drawer states

## Self-Check: PASSED
