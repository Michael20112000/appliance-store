---
phase: 06-polish-launch
plan: 03
subsystem: infra
tags: [nextjs, robots, seo, vercel, env, better-auth]

requires:
  - phase: 06-polish-launch
    plan: 01
    provides: CI workflow and 06-ENV-CHECKLIST CI section
provides:
  - App Router robots.txt with /admin and /api/ disallow
  - Production env documentation in .env.example and checklist
affects: [06-05, deploy, seo]

tech-stack:
  added: []
  patterns:
    - "robots.ts shares baseUrl normalization with sitemap.ts via getEnv()"

key-files:
  created:
    - src/app/robots.ts
  modified:
    - .env.example
    - .planning/phases/06-polish-launch/06-ENV-CHECKLIST.md

key-decisions:
  - "D-06-22: MetadataRoute robots.ts (no static public/robots.txt)"
  - "D-06-15: BETTER_AUTH_URL === NEXT_PUBLIC_APP_URL production origin"
  - "D-06-14: ADMIN_PASSWORD forbidden on Vercel Production"

patterns-established:
  - "Crawl rules: allow /, disallow /admin and /api/, sitemap from NEXT_PUBLIC_APP_URL"

requirements-completed: [SEO-02]

duration: 12min
completed: 2026-05-17
---

# Phase 6 Plan 03: Robots + Production Env Summary

**App Router `robots.txt` blocks `/admin` and `/api/` with sitemap link; Vercel production env checklist and `.env.example` Production section in Ukrainian.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-05-17T13:00:00Z
- **Completed:** 2026-05-17T13:12:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- `src/app/robots.ts` — `MetadataRoute.Robots` with `disallow: ["/admin", "/api/"]` and dynamic `sitemap.xml` URL from `getEnv().NEXT_PUBLIC_APP_URL`
- `.env.example` — **Production (Vercel)** section listing required vars, forbidden `ADMIN_PASSWORD`, and D-06-15 origin alignment
- `06-ENV-CHECKLIST.md` — full **Production (Vercel)** table, promote prerequisites, GSC post-launch note, CI cross-link

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement app/robots.ts** - `8d03605` (feat)
2. **Task 2: Production env docs** - `e4c3639` (docs)

**Plan metadata:** `docs(06-03): complete robots and production env plan`

## Files Created/Modified

- `src/app/robots.ts` — crawl rules + sitemap for search engines
- `.env.example` — Production section with UA comments (required/forbidden)
- `.planning/phases/06-polish-launch/06-ENV-CHECKLIST.md` — Production checklist for Vercel promote

## Decisions Made

- Followed D-06-14/15/18/22 from phase context — no library additions
- Reused sitemap.ts `baseUrl` pattern (`replace(/\/$/, "")`) for consistent origin

## Deviations from Plan

None - plan executed exactly as written.

Task 1 commit (`8d03605`) was already on `main` when executor started; file content matched plan spec — no duplicate commit needed.

## Issues Encountered

None

## User Setup Required

None — documentation only. Operators configure Vercel Production env per checklist before promote.

## Next Phase Readiness

- `/robots.txt` and `/sitemap.xml` available at build (verified `npm run build`)
- Production env checklist ready for plan 06-05 deploy/smoke
- Manual: preview SEO gate (D-06-11) and GSC post-launch (D-06-12)

## Self-Check: PASSED

- FOUND: src/app/robots.ts
- FOUND: .env.example (Production section)
- FOUND: .planning/phases/06-polish-launch/06-ENV-CHECKLIST.md
- FOUND: commit 8d03605
- FOUND: commit e4c3639

---
*Phase: 06-polish-launch*
*Completed: 2026-05-17*
