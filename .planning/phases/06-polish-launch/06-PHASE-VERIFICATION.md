---
phase: 06-polish-launch
verified: 2026-05-17T16:20:00Z
status: gaps_found
score: 9/12 must-haves verified
overrides_applied: 0
gaps:
  - truth: "Core Web Vitals on mobile meet LCP ≤2.5s and CLS ≤0.1 on key storefront URLs"
    status: failed
    reason: "06-VERIFICATION.md records mobile Lighthouse FAIL on /, /katalog, and PDP (LCP 8.1–8.7s, CLS 0.171 on catalog/PDP). Operator deferral to Vercel preview does not satisfy roadmap success criterion."
    artifacts:
      - path: .planning/phases/06-polish-launch/06-VERIFICATION.md
        issue: "All three URLs marked Fail; only dev localhost lab, no passing preview/production scores"
    missing:
      - "Re-run mobile Lighthouse on Vercel preview or production build and achieve LCP ≤2.5s, CLS ≤0.1 (or document accepted override with measured preview scores)"
  - truth: "Production smoke passes against live https origin after Vercel promote"
    status: failed
    reason: "06-05-SUMMARY and smoke runbook document localhost:3000 only; no evidence of PLAYWRIGHT_BASE_URL=https:// production smoke in repo or summaries."
    artifacts:
      - path: .planning/phases/06-polish-launch/06-05-SUMMARY.md
        issue: "Explicit stand-in localhost; re-run on production documented but not executed"
    missing:
      - "Promote to Vercel Production and run PLAYWRIGHT_BASE_URL=https://<origin> npx playwright test e2e/smoke-deploy.spec.ts with green result recorded"
  - truth: "Application deployed on Vercel with production env verified"
    status: partial
    reason: "vercel.json and 06-ENV-CHECKLIST.md exist; no deployment URL, promote timestamp, or production env confirmation in phase artifacts."
    artifacts:
      - path: vercel.json
        issue: "Framework config only — no proof of live production deployment"
    missing:
      - "Record production origin URL and confirm Vercel Production env vars per checklist before closing phase"
human_verification:
  - test: "Run mobile Lighthouse on Vercel preview URL (production build) for /, /katalog, and one AVAILABLE PDP"
    expected: "LCP ≤2.5s, CLS ≤0.1 per D-06-06/07 (or explicit deferral with measured scores)"
    why_human: "Prior lab used next dev on localhost; production bundle scores cannot be inferred from code review alone"
  - test: "Run Google Rich Results Test on public preview/production home and PDP URLs"
    expected: "LocalBusiness (Львів) and Product UsedCondition valid"
    why_human: "06-VERIFICATION defers Google tool to public URL; e2e JSON-LD checks are necessary but not sufficient"
  - test: "After Vercel Production promote, run smoke-deploy against https production origin"
    expected: "4/4 smoke-deploy tests pass"
    why_human: "No automated evidence of remote production smoke in codebase"
---

# Phase 6: Polish & Launch — Phase Verification Report

**Phase Goal:** Застосунок готовий до продакшену: швидкий, стабільний, перевірений end-to-end  
**Verified:** 2026-05-17T16:20:00Z  
**Status:** gaps_found  
**Re-verification:** No — initial phase-level verification (06-VERIFICATION.md is operator manual gate, not goal-backward verifier output)

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Key user flows (catalog → cart → checkout → admin → chat) pass E2E without regressions | ✓ VERIFIED | `critical-journey.spec.ts` (buyer path); `admin-rbac.spec.ts`, `admin-chat.spec.ts`, `chat-widget.spec.ts` substantive; verifier run 10/10 passed on key specs (2026-05-17) |
| 2 | Core Web Vitals and image loading meet mobile performance targets | ✗ FAILED | `06-VERIFICATION.md` LCP 8.1–8.7s, CLS 0.171; PERF-01 code patterns pass but lab targets not met |
| 3 | Local SEO (meta, JSON-LD, sitemap) verified for categories and products | ✓ VERIFIED | `catalog-seo.spec.ts` (6 tests); `robots.ts`; `page.tsx` LocalBusiness; PDP `JsonLd` + `productMetadata` |
| 4 | App deployed on Vercel with production env and smoke check | ✗ FAILED | Runbook + `smoke-deploy.spec.ts` exist; production smoke and deploy proof absent |
| 5 | CI runs lint, Vitest, full e2e on push/PR to main | ✓ VERIFIED | `.github/workflows/ci.yml`: migrate → lint → test → `npx playwright test` |
| 6 | CI uses Neon CI secrets, not production DATABASE_URL | ✓ VERIFIED | Workflow `env` uses `secrets.DATABASE_URL`; checklist forbids production strings in GHA |
| 7 | GET /robots.txt disallows /admin, /api/, links sitemap | ✓ VERIFIED | `src/app/robots.ts` wired to `getEnv().NEXT_PUBLIC_APP_URL` |
| 8 | Operators have production env checklist before promote | ✓ VERIFIED | `06-ENV-CHECKLIST.md` Production + Deploy runbook sections |
| 9 | `.env.example` documents Production constraints (UA) | ✓ VERIFIED | `# --- Production (Vercel) ---` section with required/forbidden vars |
| 10 | `critical-journey` proves catalog → checkout → cabinet | ✓ VERIFIED | 38-line spec; pidtverdzhennia/ASL- assertion; verifier PASS |
| 11 | `smoke-deploy` validates home, catalog, robots, sitemap remotely | ✓ VERIFIED | 4 tests; uses `playwright.config.ts` `baseURL` / `PLAYWRIGHT_BASE_URL` |
| 12 | Production smoke passes on live https origin | ✗ FAILED | Only `http://localhost:3000` documented in 06-05-SUMMARY |

**Score:** 9/12 must-haves verified

### User Flow Coverage (MVP mode — roadmap success criteria)

| Step | Expected | Evidence | Status |
|------|----------|----------|--------|
| Browse catalog → PDP | Product links, filters | `critical-journey`, `public-browse`, `product-pdp` specs | ✓ |
| Add to cart → checkout | Order ASL- confirmation | `critical-journey.spec.ts` lines 19–30 | ✓ |
| Admin operations | RBAC, admin panel | `admin-rbac.spec.ts`, admin CRUD specs | ✓ |
| Buyer ↔ store chat | Widget + admin inbox | `chat-widget.spec.ts`, `admin-chat.spec.ts` | ✓ |
| Fast mobile load | CWV targets | `06-VERIFICATION.md` lab FAIL | ✗ |
| Production live | Vercel + smoke | Runbook only; no prod URL | ✗ |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `.github/workflows/ci.yml` | PR/push CI gate | ✓ VERIFIED | 32 lines; lint + vitest + playwright |
| `e2e/critical-journey.spec.ts` | Cross-cutting buyer path | ✓ VERIFIED | 38 lines; wired to checkout + kabinet |
| `e2e/catalog-seo.spec.ts` | SEO-01/02 automation | ✓ VERIFIED | 54 lines; 6 tests |
| `e2e/smoke-deploy.spec.ts` | Post-deploy smoke | ✓ VERIFIED | 28 lines; 4 tests |
| `src/app/robots.ts` | Crawl rules + sitemap | ✓ VERIFIED | disallow admin/api; sitemap URL |
| `.env.example` | Production section | ✓ VERIFIED | Ukrainian Production comments |
| `06-ENV-CHECKLIST.md` | CI + prod + deploy runbook | ✓ VERIFIED | Contains `smoke-deploy`, GitHub Actions |
| `06-VERIFICATION.md` | Manual Lighthouse gate | ✓ VERIFIED | 106 lines; scores recorded (fail on dev) |
| `src/components/media/optimized-image.tsx` | format/quality auto | ✓ VERIFIED | `format="auto"`, `quality="auto"` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `ci.yml` | `playwright.config.ts` | `npx playwright test` | ✓ WIRED | Full e2e/ directory |
| `ci.yml` | `e2e/global-setup.js` | migrate deploy + seed | ✓ WIRED | `prisma migrate deploy` before tests |
| `robots.ts` | `getEnv().NEXT_PUBLIC_APP_URL` | baseUrl | ✓ WIRED | Line 5–6 |
| `robots.ts` | `/sitemap.xml` | sitemap field | ✓ WIRED | `${baseUrl}/sitemap.xml` |
| `critical-journey.spec.ts` | `/zamovlennia/pidtverdzhennia` | checkout submit | ✓ WIRED | URL regex `ASL-` |
| `catalog-seo.spec.ts` | `/sitemap.xml` | request.get | ✓ WIRED | sold slug exclusion |
| `product-gallery.tsx` | `OptimizedImage` | priority + sizes | ✓ WIRED | `priority`, sizes props |
| `smoke-deploy.spec.ts` | `PLAYWRIGHT_BASE_URL` | playwright config | ⚠️ PARTIAL | Env read in `playwright.config.ts`, not in spec file (plan pattern in spec) |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `catalog-seo` PDP test | JSON-LD content | Live PDP from seeded DB | Yes | ✓ FLOWING |
| `sitemap.ts` (via e2e) | product URLs | `prisma.product.findMany` AVAILABLE | Yes | ✓ FLOWING |
| `robots.ts` | sitemap URL | `getEnv().NEXT_PUBLIC_APP_URL` | Yes (env-driven) | ✓ FLOWING |
| `product-gallery` | hero image | Cloudinary via CldImage | Yes (when env set) | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Unit tests | `npm test` | 109 passed | ✓ PASS |
| Key phase E2E | `npx playwright test e2e/catalog-seo.spec.ts e2e/critical-journey.spec.ts e2e/admin-rbac.spec.ts e2e/admin-chat.spec.ts e2e/chat-widget.spec.ts` | 10 passed | ✓ PASS |
| Sitemap API (no browser) | request tests in catalog-seo | 3 passed in partial run | ✓ PASS |
| Full suite green | `npx playwright test` | Not re-run (40 tests); 06-05 reports 3 failures under parallel | ? SKIP |

### Probe Execution

Step 7c: SKIPPED — no phase-declared `scripts/*/tests/probe-*.sh` paths.

### Requirements Coverage

Phase 6 requirements in ROADMAP: cross-cutting improvements to prior phases. Mapped coverage:

| Requirement | Description | Status | Evidence |
|-------------|-------------|--------|----------|
| PERF-01 | Optimized images, mobile performance | ⚠️ PARTIAL | Code audit pass; CWV lab fail |
| SEO-01/02 | Ukrainian SEO, JSON-LD, sitemap | ✓ SATISFIED | `catalog-seo.spec.ts`, `robots.ts`, metadata helpers |
| Cross-cutting E2E | Full journey coverage | ✓ SATISFIED | CI + critical-journey + domain specs |
| Cross-cutting deploy | Vercel production + smoke | ✗ BLOCKED | Runbook only; no prod smoke proof |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | No TBD/FIXME/XXX in phase e2e or CI files | — | — |
| `06-VERIFICATION.md` | 21–23 | CWV Fail recorded | ℹ️ Info | Documented gap, not code debt |

### Human Verification Required

1. **Mobile Lighthouse on Vercel preview/production** — Re-run three URLs on production build; expect LCP ≤2.5s, CLS ≤0.1 per D-06-06/07.
2. **Google Rich Results on public URLs** — Validate LocalBusiness + Product before final promote.
3. **Production smoke** — `PLAYWRIGHT_BASE_URL=https://<origin> npx playwright test e2e/smoke-deploy.spec.ts` after promote.

### Gaps Summary

Phase 6 delivered strong **automation and launch documentation**: GitHub Actions CI, expanded E2E (`critical-journey`, `catalog-seo`, `smoke-deploy`), `robots.ts`, production env checklist, and PERF-01 code review pass. Verifier independently confirmed 10/10 on the key flow specs.

The **phase goal is not fully achieved** because two roadmap success criteria remain open:

1. **Performance (SC2):** Documented mobile Lighthouse runs fail CWV targets. PERF-01 implementation patterns are correct, but "швидкий" requires passing lab scores on a production-like deploy, not dev localhost with operator deferral alone.

2. **Production deploy (SC4):** Deploy hardening artifacts exist, but there is no evidence of Vercel Production promote or green smoke against a live `https://` origin—only localhost stand-in.

**Note:** `06-VERIFICATION.md` is the operator manual gate (filled with deferrals). This report (`06-PHASE-VERIFICATION.md`) is goal-backward verification against ROADMAP and PLAN `must_haves`.

---

_Verified: 2026-05-17T16:20:00Z_  
_Verifier: Claude (gsd-verifier)_
