---
phase: 41
slug: social-links
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-22
---

# Phase 41 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- --reporter=verbose src/components/layout/store-mobile-nav.test.tsx` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- src/components/layout/store-mobile-nav.test.tsx`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| social-icons-component | 01 | 1 | SOC-01,02,03 | — | N/A | build | `npx tsc --noEmit` | ✅ | ✅ green |
| social-links-constants | 01 | 1 | SOC-01,02,03 | — | No sensitive URLs exposed | build | `npx tsc --noEmit` | ✅ | ✅ green |
| header-integration | 01 | 1 | SOC-01 | — | rel="noopener noreferrer" on all external links | manual visual | n/a — RSC | ✅ | ✅ green |
| drawer-integration | 01 | 1 | SOC-02 | — | rel="noopener noreferrer" on all external links | unit | `npm test -- src/components/layout/store-mobile-nav.test.tsx` | ✅ exists | ✅ green |
| footer-integration | 01 | 1 | SOC-03 | — | rel="noopener noreferrer" on all external links | manual visual | n/a — RSC | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/components/icons/social-icons.tsx` — created
- [x] `src/lib/social-links.ts` — created
- [x] `src/components/layout/store-mobile-nav.test.tsx` — extended with 2 test cases for SOC-02

*Existing Vitest infrastructure covers the test environment — no new packages or config changes needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Social icons visible in desktop header | SOC-01 | `StoreHeader` is async RSC — not renderable in jsdom | Open site on desktop; verify 3 icons appear in the right-side icon cluster before the wishlist icon |
| Header icons hidden on mobile | SOC-01 | Tailwind `hidden md:flex` requires real browser | Open site on mobile viewport (< 768px); verify icons are not visible in header |
| Social icons visible in footer | SOC-03 | `StoreFooter` is async RSC with DB calls | Scroll to footer; verify 3 icons appear between the contacts grid and the copyright line |
| Brand colors rendered correctly | D-02 | jsdom does not compute CSS; color requires real browser | Verify Telegram is blue (#2AABEE), Viber is purple (#7360F2), WhatsApp is green (#25D366) |
| All icons open correct mock URLs in new tab | SOC-01,02,03 | External navigation requires browser | Click each icon; verify new tab opens with the configured mock URL |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** 2026-05-22
