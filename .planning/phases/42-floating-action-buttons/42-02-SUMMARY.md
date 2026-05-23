---
phase: 42-floating-action-buttons
plan: 02
subsystem: ui
tags: [react, nextjs, rsc, auth, server-side-data-fetching]

# Dependency graph
requires:
  - phase: 42-floating-action-buttons
    plan: 01
    provides: "StorefrontFabs client component with FAB-01 (cart) and FAB-02 (callback dialog)"
provides:
  - "Storefront layout RSC wired with StorefrontFabs — phones fetched server-side, cart count fetched conditionally"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Async storefront layout RSC fetching session + store contacts + cart count server-side before rendering"
    - "Guest users get cartCount=0; authenticated users get getCartItemCount(session.user.id)"

key-files:
  created: []
  modified:
    - src/app/(storefront)/layout.tsx

key-decisions:
  - "StorefrontFabs placed after Toaster at fragment root — sibling to StoreHeader/main/StoreFooter, not nested"
  - "cartCount guarded by session?.user check to avoid unnecessary DB query for guests"

patterns-established:
  - "Async layout RSC pattern: convert to async, await session + contacts + cartCount, pass as props to client component"

requirements-completed:
  - FAB-01
  - FAB-02

# Metrics
duration: 2min
completed: 2026-05-23
---

# Phase 42 Plan 02: StorefrontFabs Layout Wiring Summary

**StorefrontFabs injected into storefront layout RSC with server-side phone contacts and session-conditional cart count, completing FAB-01 and FAB-02 wiring**

## Performance

- **Duration:** 2 min
- **Started:** 2026-05-23T10:19:33Z
- **Completed:** 2026-05-23T10:21:00Z
- **Tasks:** 2 (1 auto + 1 human-verify checkpoint)
- **Files modified:** 1

## Accomplishments

- Converted `StorefrontLayout` to async RSC and fetched session, store contacts, and cart count server-side
- Rendered `StorefrontFabs` after `Toaster` at fragment root with `phones={contacts.phones}`, `initialCartCount={cartCount}`, `hasSession={Boolean(session?.user)}`
- TypeScript-clean — no errors in modified files; pre-existing test-file TS errors are out of scope

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire StorefrontFabs into storefront layout RSC** - `f5ea7cc` (feat)
2. **Task 2: Visual verification of both FABs on storefront** - approved by user (checkpoint)

**Plan metadata:** committed with SUMMARY.md

## Files Created/Modified

- `src/app/(storefront)/layout.tsx` - Converted to async RSC; added session/contacts/cartCount fetching; added StorefrontFabs render after Toaster

## Decisions Made

- `StorefrontFabs` placed at fragment root after `Toaster` — not inside `<main>` or any Suspense boundary — ensuring it renders independently of child page content
- Guest cart count defaults to 0 without querying DB (guarded with `session?.user ?` ternary)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Visual Verification Result

Task 2 checkpoint approved by user:
- Both FABs (cart + callback) visible bottom-left on storefront pages
- FABs absent on admin pages (route group isolation confirmed working)
- Cart FAB visible even with empty cart
- Callback dialog opens with store phone and callback form

## Next Phase Readiness

- Phase 42 complete — FAB-01 and FAB-02 delivered and verified
- Phase 43 (Slider Fix, Animations & Footer Bug) can begin

---
*Phase: 42-floating-action-buttons*
*Completed: 2026-05-23*
