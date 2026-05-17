---
phase: 06-polish-launch
plan: 07
subsystem: infra
tags: [vercel, lighthouse, preview, gap-closure]

requires:
  - phase: 06-06
    provides: perf fixes deployed
provides:
  - Preview origin recorded
  - Lighthouse scores on Vercel production build
  - Promote blocked per D-06-07 (CWV fail)
affects: [06-08]

key-decisions:
  - "Promote blocked: LCP 3.05–3.68s, catalog CLS 0.171 on preview"

duration: 15min
completed: 2026-05-17
---

# Phase 6 Plan 07: Preview gate Summary

**Preview live at `https://project-r4qzr.vercel.app`. Smoke 4/4 green. Mobile Lighthouse fail — production promote blocked.**

## Preview

- **Origin:** `https://project-r4qzr.vercel.app`
- **Commit:** `498b492`
- **Smoke:** `PLAYWRIGHT_BASE_URL=https://project-r4qzr.vercel.app npx playwright test e2e/smoke-deploy.spec.ts` → **4/4 passed**

## Lighthouse (mobile, CLI)

| URL | LCP | CLS | Pass |
|-----|-----|-----|------|
| `/` | 3.68s | 0 | Fail |
| `/katalog` | 3.05s | 0.171 | Fail |
| `/tovar/bosch-kholodylnyky-8-available` | 3.17s | 0 | Fail |

## SEO / robots

- robots.txt, sitemap, JSON-LD markup — OK on preview
- Rich Results Test on Google — recommended before override

## Next

**Do not run 06-08** until CWV pass or explicit override. Options: additional perf work (catalog CLS, LCP), or accept documented deferral with stakeholder sign-off.
