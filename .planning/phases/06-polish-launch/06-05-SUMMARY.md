---
phase: 06-polish-launch
plan: 05
subsystem: infra
tags: [deploy, smoke, vercel, playwright]

requires:
  - phase: 06-03
    provides: robots.txt
  - phase: 06-04
    provides: 06-VERIFICATION.md gate
provides:
  - Extended smoke-deploy.spec.ts for remote BASE_URL
  - Deploy runbook in 06-ENV-CHECKLIST.md
affects: []

tech-stack:
  added: []
  patterns:
    - "PLAYWRIGHT_BASE_URL disables webServer; smoke hits public routes only"

key-files:
  created: []
  modified:
    - e2e/smoke-deploy.spec.ts
    - .planning/phases/06-polish-launch/06-ENV-CHECKLIST.md

key-decisions:
  - "Smoke executed against http://localhost:3000 (preview stand-in); re-run on production origin after Vercel promote"

patterns-established:
  - "Deploy runbook: CI → VERIFICATION → prod env → promote → smoke-deploy"

requirements-completed: [SEO-01, SEO-02, cross-cutting production deploy]

duration: 18min
completed: 2026-05-17
---

# Phase 6 Plan 05: Deploy smoke + runbook Summary

**Remote-ready smoke spec (4 tests) and ordered deploy runbook; smoke green on localhost; production re-run documented.**

## Performance

- **Completed:** 2026-05-17
- **Tasks:** 2/2

## Accomplishments

- `e2e/smoke-deploy.spec.ts` — home, `/katalog/kholodylnyky` product link, `robots.txt`, `sitemap.xml`
- `06-ENV-CHECKLIST.md` § Deploy runbook (D-06-16/17/19)
- Smoke: `PLAYWRIGHT_BASE_URL=http://localhost:3000` — **4 passed**
- Phase gate: `npm test` — 109 passed; `npm run test:e2e` — 37 passed, 3 failed (chat-realtime needs Pusher secrets; checkout/orders-history flake under parallel load — pass in isolation)

## Smoke URL

`http://localhost:3000` (dev stand-in). **Re-run after prod promote:**

```bash
PLAYWRIGHT_BASE_URL=https://<production-origin> npx playwright test e2e/smoke-deploy.spec.ts
```

## Self-Check: PASSED

- smoke-deploy ≥4 tests green against documented BASE_URL
- Runbook contains `smoke-deploy` command
