---
phase: 6
slug: polish-launch
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-17
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 + Playwright 1.60.0 |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run test:e2e` |
| **Estimated runtime** | ~3–8 minutes (local); CI similar with Neon seed |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm run lint && npm run test:e2e`
- **Before `/gsd-verify-work`:** Full suite must be green + manual VERIFICATION checklist
- **Max feedback latency:** 480 seconds (E2E webServer + seed)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | D-06-23 | T-06-01 | CI uses GitHub Secrets, not prod creds in logs | ci | GHA workflow green | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 2 | D-06-03 | — | Authenticated checkout completes | e2e | `npx playwright test e2e/critical-journey.spec.ts` | ❌ W0 | ⬜ pending |
| 06-02-02 | 02 | 2 | D-06-10 | — | lang=uk, JSON-LD, sitemap excludes sold | e2e | `npx playwright test e2e/catalog-seo.spec.ts` | ✅ extend | ⬜ pending |
| 06-03-01 | 03 | 3 | D-06-22 | T-06-02 | `/admin` disallowed in robots | e2e | `npx playwright test e2e/catalog-seo.spec.ts` | ❌ W0 | ⬜ pending |
| 06-04-01 | 04 | 4 | D-06-06–07 | — | LCP/CLS/INP targets on 3 URLs | manual | Lighthouse lab mobile | — | ⬜ pending |
| 06-05-01 | 05 | 5 | D-06-17 | T-06-03 | Prod smoke on deployed origin | e2e | `PLAYWRIGHT_BASE_URL=… npx playwright test e2e/smoke-deploy.spec.ts` | ✅ extend | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `.github/workflows/ci.yml` — CI workflow + secrets documentation
- [ ] `src/app/robots.ts` — D-06-22
- [ ] `e2e/critical-journey.spec.ts` — D-06-03
- [ ] Extend `e2e/catalog-seo.spec.ts` — D-06-10
- [ ] Extend `e2e/smoke-deploy.spec.ts` — D-06-17
- [ ] `.env.example` Production section — D-06-18
- [ ] `06-ENV-CHECKLIST.md` / `06-VERIFICATION.md` — deploy + manual gates

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mobile CWV lab scores | D-06-06–07, PERF-01 | No Lighthouse CI on v1 | Lighthouse mobile on `/`, `/katalog`, seed PDP; record in `06-VERIFICATION.md` |
| Rich Results JSON-LD | D-06-11, SEO-02 | External Google tool | Rich Results Test on home + PDP before prod promote |
| Production deploy | D-06-16 | Vercel dashboard/CLI | Preview green → manual gates → production → smoke |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 480s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
