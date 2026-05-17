---
phase: 06-polish-launch
plan: 01
subsystem: infra
tags: [github-actions, playwright, vitest, neon, ci]

requires: []
provides:
  - GitHub Actions CI workflow (lint + Vitest + Playwright on localhost)
  - CI secrets checklist for operators
  - README pointer to secrets setup
affects: [06-polish-launch]

tech-stack:
  added: []
  patterns:
    - "CI job env uses secrets.* only; localhost BETTER_AUTH_URL / NEXT_PUBLIC_APP_URL"
    - "prisma migrate deploy before lint/test/e2e in GHA"

key-files:
  created:
    - .github/workflows/ci.yml
    - .planning/phases/06-polish-launch/06-ENV-CHECKLIST.md
  modified:
    - README.md

key-decisions:
  - "Prisma migrate deploy runs after npm ci and before lint (plan step order)"
  - "No PLAYWRIGHT_BASE_URL in CI so webServer starts npm run dev (D-06-25)"

patterns-established:
  - "Operators configure four GitHub Secrets from 06-ENV-CHECKLIST; workflow stays secret-free in repo"

requirements-completed: [cross-cutting E2E]

duration: 12min
completed: 2026-05-17
---

# Phase 6 Plan 01: CI workflow + secrets docs Summary

**GitHub Actions gate on main: lint, Vitest, and full Playwright e2e/ on localhost with Neon CI-branch secrets documented for operators.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-05-17T15:40:00Z
- **Completed:** 2026-05-17T15:52:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added `.github/workflows/ci.yml` — `pull_request` + `push` to `main`, `CI: true`, migrate → lint → unit → Playwright (chromium)
- Documented required GitHub Secrets and production-URL prohibition in `06-ENV-CHECKLIST.md`
- README **Continuous Integration** section links checklist and lists four secret names

## Task Commits

1. **Task 1: Create GitHub Actions CI workflow** - `1319a25` (feat)
2. **Task 2: Document CI secrets and README pointer** - `05e5869` (docs)

**Plan metadata:** `ec2a181` (docs: complete plan)

## Self-Check: PASSED

- All created files present on disk
- Task commits `1319a25`, `05e5869` verified in `git log`

## Files Created/Modified

- `.github/workflows/ci.yml` — PR/push CI job with localhost env and secrets-backed DB/auth
- `.planning/phases/06-polish-launch/06-ENV-CHECKLIST.md` — GitHub Actions CI section + Production placeholder for plan 06-03
- `README.md` — CI overview and secret names

## Decisions Made

- Followed plan step order including `npx prisma migrate deploy` after `npm ci` (research example omitted migrate; plan is authoritative)
- Did not set `PLAYWRIGHT_BASE_URL` in workflow so existing `playwright.config.ts` webServer runs (D-06-25, D-06-26 unchanged)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `npm run lint` fails with **pre-existing** ESLint errors in unrelated files (`catalog-toolbar.tsx`, chat providers, `checkout-form.tsx`, `e2e/global-setup.js`). Not introduced by this plan; unit tests (`npm test`) pass (109 tests). CI will surface the same lint failures until a separate fix lands.

## User Setup Required

Configure GitHub repository secrets before first green CI run (Neon **CI branch**):

- `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

See [06-ENV-CHECKLIST.md](./06-ENV-CHECKLIST.md).

## Next Phase Readiness

- CI workflow and operator docs ready; merge blocked on GitHub Secrets + lint debt
- Plan 06-03 can fill **Production (Vercel)** section in checklist

---
*Phase: 06-polish-launch*
*Completed: 2026-05-17*
