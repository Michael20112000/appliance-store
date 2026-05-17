---
phase: 06-polish-launch
plan: 08
subsystem: deploy
tags: [vercel, smoke, production, gap-closure]

requires:
  - phase: 06-07
    provides: preview gates recorded
provides:
  - Production origin documented
  - PLAYWRIGHT_BASE_URL smoke 4/4 on live https
affects: []

key-files:
  created: []
  modified:
    - .planning/phases/06-polish-launch/06-ENV-CHECKLIST.md
    - .planning/phases/06-polish-launch/06-VERIFICATION.md

requirements-completed: [SEO-01, SEO-02]

duration: 20min
completed: 2026-05-17
---

# Phase 6 Plan 08: Production deploy smoke Summary

**Recorded live origin, env verification note, and green Playwright smoke against `https://project-r4qzr.vercel.app`.**

## Production origin

| Field | Value |
|-------|--------|
| URL | `https://project-r4qzr.vercel.app` |
| Promote / record | 2026-05-17T15:00:00Z |
| Operator | Michael Ivashko (agent-recorded) |

No separate custom domain yet — Vercel serves store at project production URL.

## Env (Task 1)

Checklist § Production: **Env verified** · 2026-05-17 · MI — public routes + auth redirect OK on live deploy (dashboard vars per `06-ENV-CHECKLIST.md`; no secrets in docs).

## Smoke (Task 3, D-06-17/19)

```bash
PLAYWRIGHT_BASE_URL=https://project-r4qzr.vercel.app npx playwright test e2e/smoke-deploy.spec.ts --reporter=line
```

**Result:** 4 passed (~14s) · 2026-05-17

| Test | Status |
|------|--------|
| home page loads | pass |
| catalog category shows product links | pass |
| robots.txt exposes sitemap and blocks admin | pass |
| sitemap.xml lists product URLs | pass |

## CWV note

Preview Lighthouse still **Fail** (LCP/CLS) per `06-VERIFICATION.md`. Smoke + functional deploy recorded; CWV remediation tracked separately.

## Self-Check: PASSED

- [x] `06-ENV-CHECKLIST.md` Production row filled
- [x] `06-VERIFICATION.md` production origin updated
- [x] SUMMARY records PLAYWRIGHT_BASE_URL and 4/4 pass
