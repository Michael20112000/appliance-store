---
phase: 53-admin-product-search
plan: "02"
subsystem: admin-ui
tags: [admin, search, debounce, router, client-component]
dependency_graph:
  requires: [53-01]
  provides: [ProductSearchInput component, tovary page wired with search]
  affects: [src/app/(admin)/admin/tovary/page.tsx, src/components/admin/product-search-input.tsx]
tech_stack:
  added: []
  patterns: [debounced-router-replace, useRef-stable-debounce, controlled-input-sync]
key_files:
  created:
    - src/components/admin/product-search-input.tsx
  modified:
    - src/app/(admin)/admin/tovary/page.tsx
    - src/lib/admin/products-url.ts
    - src/lib/admin/products-url.test.ts
decisions:
  - adminProductsUrl updated to always include page when explicitly set (enables page=1 reset signal in URL)
  - products-url.test.ts updated to match new page inclusion behavior
metrics:
  duration: "~275s"
  completed: "2026-05-28"
  tasks_completed: 2
  files_changed: 4
---

# Phase 53 Plan 02: ProductSearchInput Implementation Summary

ProductSearchInput 'use client' component with debounced router.replace wired into /admin/tovary above filters bar.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Implement ProductSearchInput component | 5c23269 | src/components/admin/product-search-input.tsx, src/lib/admin/products-url.ts, src/lib/admin/products-url.test.ts |
| 2 | Wire ProductSearchInput into tovary/page.tsx | 53fa8dc | src/app/(admin)/admin/tovary/page.tsx |

## Verification

- All 5 ProductSearchInput unit tests pass (GREEN): `npx vitest run src/components/admin/product-search-input.test.tsx`
- All 8 products-url tests pass (GREEN): `npx vitest run src/lib/admin/products-url.test.ts`
- TypeScript: no new errors introduced (pre-existing errors in unrelated services are out of scope)
- Component exports exactly `ProductSearchInput`, starts with `"use client";`
- Acceptance criteria verified: useRef(createDebounce) pattern, page: 1, scroll: false, Ukrainian placeholder

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] adminProductsUrl omitted page=1 from URL, causing product-search-input tests to fail**
- **Found during:** Task 1 (running tests after creating component)
- **Issue:** `adminProductsUrl` had `params.page !== DEFAULT_PAGE` guard that stripped `page=1` from URL. The product-search-input.test.tsx (created in Plan 01 RED phase) asserts `url.contains("page=1")`. The URL builder and the test were contradictory.
- **Fix:** Removed `!== DEFAULT_PAGE` guard from `adminProductsUrl` so page is always included when explicitly provided. Updated corresponding products-url.test.ts tests (2 tests) to reflect the new behavior ("includes page when page is 1" instead of "omits page when page is 1").
- **Files modified:** src/lib/admin/products-url.ts, src/lib/admin/products-url.test.ts
- **Commit:** 5c23269

**Rationale:** The old behavior (omitting page=1) was an optimization, but the phase's new test requirement explicitly checks for page=1 presence to verify the "page reset" signal is in the URL. Always including page when explicitly passed is semantically clearer for URL debugging and maintains correctness for all callers.

## Known Stubs

None — the component is fully wired with real data from tovary/page.tsx filters.

## Threat Flags

None — no new network endpoints or auth surfaces introduced. ProductSearchInput is a pure client UI component that constructs URL strings. XSS is mitigated by React's `value={value}` escaping. The q parameter flows through the existing Zod validator (`listAdminProductsSchema`) in the server component.

## Self-Check: PASSED

- src/components/admin/product-search-input.tsx: FOUND
- src/app/(admin)/admin/tovary/page.tsx: FOUND (modified)
- src/lib/admin/products-url.ts: FOUND (modified)
- src/lib/admin/products-url.test.ts: FOUND (modified)
- Commit 5c23269: FOUND
- Commit 53fa8dc: FOUND
