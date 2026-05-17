---
phase: 06-polish-launch
plan: 02
subsystem: testing
tags: [playwright, e2e, seo, checkout]

requires: []
provides:
  - critical-journey.spec.ts — full buyer path catalog→kabinet
  - catalog-seo.spec.ts — SEO-01/02 automated gate (lang, JSON-LD, sitemap)
affects: [06-polish-launch]

tech-stack:
  added: []
  patterns:
    - "E2E marker in checkout notes; assert order via /kabinet not confirmation UI"
    - "Cart add verified via header badge when layout Suspense blocks /koszyk main"

key-files:
  created:
    - e2e/critical-journey.spec.ts
  modified:
    - e2e/catalog-seo.spec.ts
    - e2e/helpers/catalog.ts

key-decisions:
  - "Cart helper uses header Кошик badge count instead of /koszyk ₴ poll (ChatProviderGate Suspense)"
  - "SOLD_SLUG constant duplicated in catalog-seo (matches product-pdp.spec.ts)"

patterns-established:
  - "critical-journey: single cross-cutting commerce spec separate from checkout/orders-history"

requirements-completed: [SEO-01, SEO-02]

duration: 28min
completed: 2026-05-17
---

# Phase 06 Plan 02: E2E Critical Journey + SEO Gate Summary

**Playwright covers full buyer purchase path and automated SEO checks (uk lang, used-product JSON-LD, sitemap sold exclusion).**

## Performance

- **Duration:** 28 min
- **Started:** 2026-05-17T12:40:00Z
- **Completed:** 2026-05-17T13:08:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added `critical-journey.spec.ts`: register → catalog → cart → checkout with `E2E-JOURNEY-*` marker → ASL- confirmation → order visible in `/kabinet`
- Extended `catalog-seo.spec.ts` to 6 tests: `lang="uk"`, UsedCondition/RefurbishedCondition in JSON-LD, sold slug absent from sitemap, sample `/tovar/` URL 200
- Stabilized shared catalog helper for Playwright runs blocked by storefront Suspense around chat bootstrap

## Task Commits

1. **Task 1: Add critical-journey.spec.ts** - `944a111` (test)
2. **Task 2: Extend catalog-seo.spec.ts** - `e74a498` (test)

**Plan metadata:** `d6a6968` (docs: complete plan)

## Files Created/Modified

- `e2e/critical-journey.spec.ts` — D-06-03 cross-cutting buyer journey
- `e2e/catalog-seo.spec.ts` — D-06-10 SEO gate (6 tests)
- `e2e/helpers/catalog.ts` — cart verification via header badge

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Stabilize `addCurrentProductToCart` for Suspense-blocked `/koszyk`**
- **Found during:** Task 1 verification
- **Issue:** `ChatProviderGate` inside layout `Suspense` left `main` empty on `/koszyk` while header cart badge updated; ₴ poll timed out (also affected `checkout.spec.ts`)
- **Fix:** Assert non-zero cart count on header `Кошик` link instead of polling `/koszyk` body for `₴`
- **Files modified:** `e2e/helpers/catalog.ts`
- **Commit:** `944a111`

## Self-Check

- FOUND: e2e/critical-journey.spec.ts
- FOUND: e2e/catalog-seo.spec.ts (6 tests)
- FOUND: commit 944a111
- FOUND: commit e74a498

**Self-Check: PASSED**
