---
phase: 41-social-links
plan: "01"
subsystem: storefront-layout
tags:
  - social-links
  - header
  - mobile-drawer
  - footer
  - icons
  - tdd
dependency_graph:
  requires: []
  provides:
    - social-links-constant
    - social-icon-components
    - social-nav-links-cluster
    - header-social-integration
    - mobile-drawer-social-integration
    - footer-social-integration
  affects:
    - src/components/layout/store-header.tsx
    - src/components/layout/store-mobile-nav.tsx
    - src/components/layout/store-footer.tsx
tech_stack:
  added: []
  patterns:
    - inline SVG icon components (no external icon library)
    - "as const" typed constants for URLs
    - TDD RED->GREEN for mobile drawer integration
key_files:
  created:
    - src/lib/social-links.ts
    - src/components/icons/social-icons.tsx
    - src/components/layout/social-nav-links.tsx
  modified:
    - src/components/layout/store-header.tsx
    - src/components/layout/store-mobile-nav.tsx
    - src/components/layout/store-footer.tsx
    - src/components/layout/store-mobile-nav.test.tsx
decisions:
  - Mock URLs used for v2.2 (real URLs TBD by operator)
  - Inline SVG icons with no external dependency (zero new packages)
  - Brand colors applied via inline style on SVG, not on anchor (allows hover states on anchor independent of icon color)
  - Footer social row takes border-t from copyright paragraph to avoid double border
  - Social icons hidden on mobile header via hidden md:flex (drawer used instead per D-04)
metrics:
  duration: "3m 12s"
  completed: "2026-05-22"
  tasks_completed: 2
  files_created: 3
  files_modified: 4
---

# Phase 41 Plan 01: Social Links Integration Summary

**One-liner:** Telegram, Viber, WhatsApp icon links added to desktop header, mobile drawer, and footer using inline SVG components and a shared SOCIAL_LINKS constant.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create social-links constant, SVG icon components, and SocialNavLinks cluster | 1d841e6 | src/lib/social-links.ts, src/components/icons/social-icons.tsx, src/components/layout/social-nav-links.tsx |
| 2 (RED) | Add failing tests for social nav links in mobile drawer | 958f030 | src/components/layout/store-mobile-nav.test.tsx |
| 2 (GREEN) | Integrate SocialNavLinks into header, drawer, and footer | fb85257 | src/components/layout/store-header.tsx, src/components/layout/store-mobile-nav.tsx, src/components/layout/store-footer.tsx |

## Verification Results

- npm test -- store-mobile-nav.test.tsx: 5/5 passed (3 original + 2 new)
- npm test (full suite): 2 failures (pre-existing prisma/seed.test.ts only, no new failures)
- npx tsc --noEmit: no errors in new or modified files (pre-existing errors in test files unrelated to this plan)

## Success Criteria Checklist

1. [x] SOC-01: Three social icon links visible in desktop header right-side cluster, hidden on mobile
2. [x] SOC-02: Three social icon links in mobile drawer after auth section
3. [x] SOC-03: Three social icon links in footer between contacts grid and copyright line
4. [x] All links open in new tab with rel="noopener noreferrer"
5. [x] Icons carry brand colors: Telegram #2AABEE, Viber #7360F2, WhatsApp #25D366
6. [x] Accessible: aria-label on each anchor, aria-hidden on each SVG
7. [x] No new npm dependencies installed
8. [x] Vitest full suite baseline preserved (2 pre-existing failures only)

## TDD Gate Compliance

- RED gate commit: 958f030 (test(41-01): add failing tests for social nav links in mobile drawer)
- GREEN gate commit: fb85257 (feat(41-01): integrate SocialNavLinks into header, drawer, and footer)
- Both gates present in git log in correct order.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

The SOCIAL_LINKS constant uses mock URLs (per plan specification for v2.2):
- `src/lib/social-links.ts` line 2: `telegram: "https://t.me/example"` — intentional mock, operator replaces with real URL
- `src/lib/social-links.ts` line 3: `viber: "https://invite.viber.com/example"` — intentional mock
- `src/lib/social-links.ts` line 4: `whatsapp: "https://wa.me/380000000000"` — intentional mock

These stubs are explicitly required by the plan ("Values are mock URLs for v2.2") and tracked for operator replacement before going live. The plan's goal (adding social links to all three surfaces) is fully achieved — the mock URLs do not block navigation or functionality.

## Threat Surface Scan

No new threat surface beyond what was declared in the plan's threat model:
- T-41-01/02: rel="noopener noreferrer" applied to all three anchors in SocialNavLinks — mitigated.
- T-41-03: Mock URLs are static code, accepted risk.
- T-41-SC: Zero new packages installed — no slopcheck needed.

No additional endpoints, auth paths, file access patterns, or schema changes introduced.

## Self-Check: PASSED
