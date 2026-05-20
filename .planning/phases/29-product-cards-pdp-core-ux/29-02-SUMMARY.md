---
phase: 29-product-cards-pdp-core-ux
plan: 02
subsystem: ui
tags: [embla, carousel, pdp, lightbox, react]

requires: []
provides:
  - PDP lightbox Embla opts tuned for snap-after-drag (PDP-05)
affects:
  - 29-product-cards-pdp-core-ux

tech-stack:
  added: []
  patterns:
    - "Lightbox-only Embla opts; thumbnail strip unchanged"

key-files:
  created: []
  modified:
    - src/components/catalog/product-gallery.tsx

key-decisions:
  - "dialogApi.scrollTo skips when selectedScrollSnap already matches dialogIndex"
  - "scrollTo uses jump false for smooth alignment when index differs on open"

patterns-established:
  - "Dialog Carousel: loop + duration 25 + dragFree false + containScroll false"

requirements-completed: [PDP-05]

duration: 16min
completed: 2026-05-20
---

# Phase 29 Plan 02: Lightbox Embla Snap Summary

**PDP lightbox tuned for momentum drag with nearest-slide snap — no instant jump on reopen when already aligned**

## Performance

- **Duration:** 16 min
- **Started:** 2026-05-20T11:20:00Z
- **Completed:** 2026-05-20T11:36:22Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Dialog `Carousel` opts: `duration: 25`, `dragFree: false`, `skipSnaps: false`, `containScroll: false`, `loop: hasMultiple`, `startIndex: dialogIndex`
- `scrollTo` on open only when snap differs; uses `jump: false` for smooth alignment
- Thumbnail strip carousel unchanged (`align: start`, `containScroll: trimSnaps`)
- `npm run build` green

## Task Commits

1. **Task 1: Lightbox Carousel opts** - `f10e825` (feat)
2. **Task 2: Build gate + manual swipe note** - `0e2a0ac` (chore, empty — build verification)

**Plan metadata:** pending (docs commit after this file)

## Files Created/Modified

- `src/components/catalog/product-gallery.tsx` — lightbox Embla opts and open `scrollTo` behavior

## Decisions Made

- Skip `scrollTo` when `selectedScrollSnap() === dialogIndex` to avoid jerk on reopen (D-07)
- Keep thumbnail rail opts isolated per D-09

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Intermittent `npm run build` failures when dev server held `.next` locks; resolved with clean `.next` rebuild (not a code defect).

## Manual UAT (PDP-05)

Human verification on a real mobile viewport (or DevTools device mode with touch):

1. Open a PDP with **multiple** gallery images (`/tovar/[slug]`).
2. Tap main image to open lightbox.
3. Drag partially to the next/previous slide (~30–50% width) and release finger.
4. **Expect:** carousel snaps smoothly to the nearest slide without a post-release bounce/jerk.
5. Close lightbox, reopen from same thumbnail — **expect:** no visible jump if already on that slide.
6. Swipe through several slides with loop — **expect:** continuous loop without end-cap snap weirdness.
7. Thumbnail strip below main image — **expect:** unchanged scroll/selection behavior.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- PDP-05 implementation ready for human UAT above
- Plans 29-03+ (cart FAB, card hover) independent of this change

---
*Phase: 29-product-cards-pdp-core-ux*
*Completed: 2026-05-20*

## Self-Check: PASSED

- FOUND: src/components/catalog/product-gallery.tsx
- FOUND: commit f10e825
- FOUND: commit 0e2a0ac
