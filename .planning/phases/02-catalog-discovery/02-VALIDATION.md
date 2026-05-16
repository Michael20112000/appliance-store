---
phase: 02
slug: catalog-discovery
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-17
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 + Playwright 1.60.0 |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` |
| **Quick run command** | `npm run test` |
| **Full suite command** | `npm run test && npm run test:e2e` |
| **Estimated runtime** | ~15s unit, ~3min e2e |

---

## Sampling Rate

- **After every task commit:** Run `npm run test` (catalog modules touched)
- **After every plan wave:** Run `npm run test:e2e` (catalog specs)
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-* | 02-01 | 1 | CAT-07 | T-02-01 | Public queries only `AVAILABLE` | unit | `npm test -- src/server/services/catalog.service.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-* | 02-02 | 2 | CAT-01, CAT-03 | — | Grid shows price, brand, condition | e2e | `npx playwright test e2e/catalog-list.spec.ts` | ❌ W0 | ⬜ pending |
| 02-03-* | 02-03 | 2 | CAT-02 | — | PDP gallery + description | e2e | `npx playwright test e2e/product-pdp.spec.ts` | ❌ W0 | ⬜ pending |
| 02-04-* | 02-04 | 3 | CAT-05, CAT-06 | T-02-04 | Filters sync to URL | e2e | `npx playwright test e2e/catalog-filters-url.spec.ts` | ❌ W0 | ⬜ pending |
| 02-05-* | 02-05 | 3 | CAT-04 | T-02-05 | Search via parameterized Prisma | unit | `npm test -- catalog.service` | ❌ W0 | ⬜ pending |
| 02-06-* | 02-06 | 4 | SEO-01, SEO-02 | T-02-06 | JSON-LD escaped; meta unique | e2e | `npx playwright test e2e/catalog-seo.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Install `nuqs@2.8.9`, `schema-dts@2.0.0`; `NuqsAdapter` in storefront layout
- [ ] `src/server/services/catalog.service.ts` + `catalog.service.test.ts`
- [ ] `src/lib/catalog/search-params.ts` + parser unit tests
- [ ] `e2e/catalog-list.spec.ts`, `e2e/product-pdp.spec.ts`, `e2e/catalog-filters-url.spec.ts`, `e2e/catalog-seo.spec.ts`
- [ ] Seed fixtures: AVAILABLE + SOLD products for CAT-07 tests
- [ ] `app/sitemap.ts` for AVAILABLE products only

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Rich Results preview | SEO-02 | Google Search Console not automatable in CI | Paste PDP URL in Rich Results Test after deploy |

*Otherwise: automated coverage per research Validation Architecture.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
