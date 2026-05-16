---
phase: 01
slug: foundation-auth-design-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-16
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.x + Playwright 1.60.x (install in plan 01-01 Wave 0) |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` — created in 01-01 |
| **Quick run command** | `npm run test` → `vitest run` |
| **Full suite command** | `npm run test:e2e` → `playwright test` |
| **Estimated runtime** | ~30s unit, ~2min e2e |

---

## Sampling Rate

- **After every task commit:** Run `npm run test` (when tests exist)
- **After every plan wave:** Run `npm run test:e2e` on public + auth paths
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-* | 01-01 | 1 | UI-01 | — | `lang="uk"` in root layout | e2e | `playwright test e2e/locale.spec.ts` | ❌ W0 | ⬜ pending |
| 01-02-* | 01-02 | 2 | — | T-01-02 | Seed admin only via env | unit | `vitest run prisma/seed.test.ts` | ❌ W0 | ⬜ pending |
| 01-04-* | 01-04 | 3 | AUTH-01 | — | Guest opens `/` and `/katalog/*` | e2e | `playwright test e2e/public-browse.spec.ts` | ❌ W0 | ⬜ pending |
| 01-05-* | 01-05 | 4 | AUTH-02, AUTH-05 | T-01-05 | Session survives reload | e2e | `playwright test e2e/auth.spec.ts` + `session-persist.spec.ts` | ❌ W0 | ⬜ pending |
| 01-06-* | 01-06 | 5 | PERF-01 | T-01-06 | Buyer denied `/admin` server-side | e2e | `playwright test e2e/admin-rbac.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` + `package.json` scripts `test`, `test:e2e`
- [ ] `playwright.config.ts` + `e2e/public-browse.spec.ts`, `e2e/auth.spec.ts`, `e2e/session-persist.spec.ts`, `e2e/locale.spec.ts`, `e2e/home-layout.spec.ts`
- [ ] `src/lib/env.ts` + `env.test.ts` (Zod: `DATABASE_URL`, `BETTER_AUTH_SECRET`, Cloudinary)
- [ ] CI stub optional: `npm run lint && vitest run && playwright test`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cloudinary transforms | PERF-01 | Network + CDN | Open home, DevTools → hero `src` contains `res.cloudinary.com` with `f_auto` or `q_auto` |
| Vercel preview deploy | — | External platform | Open preview URL after 01-01; confirm 200 on `/` |
| Session cookie flags | AUTH-05 | Browser storage | Login → Application → cookie HttpOnly + Secure (prod) |

---

## Phase Gate Checklist

- [ ] All plan waves complete
- [ ] `vitest run` green
- [ ] `playwright test` green for auth + public + admin guard
- [ ] Manual: login → refresh `/kabinet` still authenticated
- [ ] Manual: non-admin user cannot access `/admin` (server layout, not only proxy)
