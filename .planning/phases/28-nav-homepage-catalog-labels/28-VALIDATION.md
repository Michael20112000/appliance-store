---
phase: 28
slug: nav-homepage-catalog-labels
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-20
---

# Phase 28 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 + @testing-library/react 16.3.2 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- --run src/lib/catalog/catalog-labels.test.ts` |
| **Full suite command** | `npm test` |
| **Build command** | `npm run build` |
| **Estimated runtime** | ~60–90 seconds (full suite) |

---

## Sampling Rate

- **After every task commit:** `npm test -- --run <touched-test-files>`
- **After every plan wave:** `npm test`
- **Before `/gsd-verify-work`:** `npm test` + `npm run build` green; manual checklist D-21
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 28-01-01 | 01 | 1 | NAV-01 | T-28-01 | Fixed auth paths only | unit | `npm test -- --run src/components/layout/store-mobile-nav.test.tsx` | ✅ extend | ⬜ pending |
| 28-01-02 | 01 | 1 | NAV-01 | T-28-01 | Session snapshot from header | unit | same | ❌ W0 | ⬜ pending |
| 28-02-01 | 02 | 2 | HOME-04 | — | N/A | manual | Hero CTA → `#kategorii` below sticky header | N/A | ⬜ pending |
| 28-02-02 | 02 | 2 | HOME-04 | — | reduced-motion instant scroll | manual | `prefers-reduced-motion` check | N/A | ⬜ pending |
| 28-03-01 | 03 | 3 | HOME-05 | — | Zero-count hidden | unit | `npm test -- --run src/lib/catalog/categories.test.ts` | ✅ | ⬜ pending |
| 28-03-02 | 03 | 3 | HOME-05 | — | Badge «1 товар» / digits | unit | `npm test -- --run src/lib/catalog/format.test.ts` | ❌ W0 | ⬜ pending |
| 28-04-01 | 04 | 4 | CAT-02 | T-28-02 | Static UA strings in map | unit | `npm test -- --run src/lib/catalog/catalog-labels.test.ts` | ✅ update | ⬜ pending |
| 28-04-02 | 04 | 4 | CAT-02 | — | Toolbar uses catalogSortLabel | manual | `/katalog` sort select labels | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Extend `src/components/layout/store-mobile-nav.test.tsx` — signed-in session + auth links
- [ ] Add `src/lib/catalog/format.test.ts` — `formatCategoryCountBadge` if extracted (D-20)
- [ ] Update `src/lib/catalog/catalog-labels.test.ts` — «Найновіші», «Дорожче», «Дешевше»
- [ ] CSS scroll rules in `globals.css` — manual HOME-04 verification only

*No new test framework — existing Vitest covers automated regression.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Smooth scroll + header offset | HOME-04 | CSS viewport behavior | Homepage hero CTA → categories block visible below sticky header |
| Reduced motion | HOME-04 | OS preference | Enable reduced motion; scroll should be instant |
| Drawer guest auth | NAV-01 | Sheet + viewport | Mobile width: open drawer → «Увійти» + «Реєстрація» below callback |
| Drawer signed-in auth | NAV-01 | Session | Signed-in: «Кабінет» + «Вийти» in drawer |
| Sort select labels | CAT-02 | Radix select UI | `/katalog` → open sort → three UA labels |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Wave 0 stubs created before Wave 1+ execution
- [ ] Manual-only rows documented with operator steps
- [ ] `npm test` + `npm run build` green at phase gate
