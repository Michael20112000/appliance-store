---
phase: 28-nav-homepage-catalog-labels
plan: 02
subsystem: ui
tags: [css, scroll, accessibility]
requires: []
provides:
  - Storefront-scoped smooth scroll via html:has(#main-content)
  - #kategorii scroll-margin-top for sticky header
affects: [homepage, storefront]
tech-stack:
  added: []
  patterns: [CSS-only hash navigation, prefers-reduced-motion]
key-files:
  created: []
  modified:
    - src/app/globals.css
key-decisions:
  - "No JS scroll hijack; admin routes excluded by :has(#main-content)"
requirements-completed: [HOME-04]
duration: 10min
completed: 2026-05-20
---

# Phase 28 Plan 02 Summary

**Storefront hash links scroll smoothly with header offset on `#kategorii`; reduced motion disables animation.**

## Accomplishments
- Added `html:has(#main-content) { scroll-behavior: smooth }` with reduced-motion override
- Added `#kategorii { scroll-margin-top: 4.5rem }` for sticky header clearance
- Confirmed admin layout has no `main-content` id

## Manual UAT (HOME-04)
- Hero CTA «Переглянути категорії» → `#kategorii` visible below header
- OS reduce motion → instant jump
- `/admin` — no global smooth scroll

## Self-Check: PASSED
