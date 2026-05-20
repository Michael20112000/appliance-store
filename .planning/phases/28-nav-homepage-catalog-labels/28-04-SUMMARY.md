---
phase: 28-nav-homepage-catalog-labels
plan: 04
subsystem: ui
tags: [catalog, i18n, sort]
requires: []
provides:
  - Updated CATALOG_SORT_LABELS (Найновіші, Дешевше, Дорожче)
  - Deduped catalog-toolbar SelectItem via catalogSortLabel
affects: [catalog-toolbar, katalog]
tech-stack:
  added: []
  patterns: [single source of truth for sort labels]
key-files:
  created: []
  modified:
    - src/lib/catalog/catalog-labels.ts
    - src/lib/catalog/catalog-labels.test.ts
    - src/components/catalog/catalog-toolbar.tsx
key-decisions:
  - "URL sort keys novi/cina-asc/cina-desc unchanged; labels only"
requirements-completed: [CAT-02]
duration: 10min
completed: 2026-05-20
---

# Phase 28 Plan 04 Summary

**Catalog sort dropdown uses one Ukrainian label map; toolbar duplication bug fixed.**

## Accomplishments
- `CATALOG_SORT_LABELS` → Найновіші, Дешевше, Дорожче
- SelectItem children rendered via `catalogSortLabel` iteration
- Full test suite and build green

## Manual UAT (CAT-02)
- `/katalog` sort select shows Найновіші, Дорожче, Дешевше
- URL still uses `?sort=novi` etc.

## Self-Check: PASSED
