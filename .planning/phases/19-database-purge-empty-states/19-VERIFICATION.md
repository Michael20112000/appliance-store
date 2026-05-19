---
phase: 19-database-purge-empty-states
verified: 2026-05-19T13:52:00Z
status: human_needed
score: 9/12 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Sign in as admin, then open /admin, /admin/tovary, /admin/kategorii, /admin/zamovlennia?filter=all, /admin/chaty, /admin/tovary/novyi on a DB after CONFIRM_DB_PURGE=yes npm run db:purge"
    expected: "No 500; StatCards show 0; existing UA empty copy (Замовлень ще немає, Товарів не знайдено, Немає категорій, chat emptyTitle/emptyBody, category hint on novyi); devtools console clean"
    why_human: "Checklist §4 unchecked; sign-off claims Pass but admin routes were only 307-unauthenticated HTTP smoke"
  - test: "Before/after purge, compare prisma user.count() (or Prisma Studio User table row count)"
    expected: "User row count unchanged; admin login still works with existing credentials"
    why_human: "DATA-01 auth preservation not spot-checked in checklist §1"
  - test: "Optional — signed-in /obrane after purge"
    expected: "WishlistEmptyState, no 500"
    why_human: "Marked optional in 19-MANUAL-CHECKLIST.md; not executed"
gaps:
  - truth: "19-MANUAL-CHECKLIST.md signed with all D-19-18 routes checked"
    status: failed
    reason: "Sign-off table says Pass but §4 Admin (six routes) and §1 User count check remain unchecked; executor noted admin needs human sign-in"
    artifacts:
      - path: .planning/phases/19-database-purge-empty-states/19-MANUAL-CHECKLIST.md
        issue: "Premature Pass — admin smoke incomplete"
    missing:
      - "Complete checklist §4 and §1 after authenticated admin session on purged dev DB"
      - "Update sign-off row with operator name and any failing items (or confirm all Pass)"
---

# Phase 19: Database Purge & Empty States Verification Report

**Phase Goal:** Чиста БД для реального наповнення; застосунок не падає без даних.  
**Verified:** 2026-05-19T13:52:00Z  
**Status:** human_needed  
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Operator runs `npm run db:purge` with explicit confirm; all business rows deleted in one FK-safe `$transaction` | ✓ VERIFIED | `prisma/purge-business-data.ts`: `PURGE_STEPS` order Message→Category; `purgeBusinessData()` uses single `prisma.$transaction`; `package.json` `"db:purge": "tsx prisma/purge-business-data.ts"` |
| 2 | User, Session, Account, Verification never deleted; admin can sign in after purge | ✓ VERIFIED (code) / ? human | No `user`/`session`/`account`/`verification` `deleteMany` in purge script; README states auth untouched. Runtime user-count check not done in checklist |
| 3 | Re-run purge on empty business tables exits 0 with zero counts | ✓ VERIFIED | Checklist §1: idempotent re-run documented; script returns counts from `deleteMany` (0 when empty) |
| 4 | Production blocked unless `ALLOW_PRODUCTION_PURGE=yes`; stdout per-table counts + Cloudinary warning | ✓ VERIFIED | `isProductionPurgeAllowed`, `printReport`, header comment; 7 Vitest cases pass |
| 5 | README documents backup → purge → optional seed; purge does not auto-seed | ✓ VERIFIED | `README.md` §«Оператор: очистка БД»; `prisma.seed` separate from `db:purge` in `package.json` |
| 6 | After purge, `/` and `/katalog` render without 500; homepage hides CategoryGrid when no categories with products | ✓ VERIFIED | Checklist §2–3 Pass; `category-grid.tsx` `return null` when `categories.length === 0` |
| 7 | `/koszyk` shows CartEmpty; cart empty UX exists | ✓ VERIFIED | Checklist `/koszyk` Pass; `koszyk/page.tsx` imports `CartEmpty` |
| 8 | `/katalog/[slug]` for unknown slug → notFound (not 500) | ✓ VERIFIED | `[slug]/page.tsx` calls `notFound()` when `!category`; checklist: not-found UI «Категорію не знайдено» |
| 9 | Admin dashboard StatCards 0 and «Замовлень ще немає» at zero rows | ? UNCERTAIN | `admin/page.tsx` + `getAdminDashboardStats()` use `count`/`findMany` (safe at 0). No authenticated post-purge smoke |
| 10 | Admin list routes show existing UA empty copy at 0 rows | ? UNCERTAIN | Copy present in `tovary`, `kategorii`, `zamovlennia`, `tovary/novyi` pages; not runtime-verified after purge |
| 11 | `/admin/chaty` inbox emptyTitle/emptyBody at zero conversations | ? UNCERTAIN | `admin-chat-inbox.tsx` wires `emptyTitle`/`emptyBody` to `conversation-list.tsx`; not runtime-verified |
| 12 | `19-MANUAL-CHECKLIST.md` signed with all D-19-18 routes checked | ✗ FAILED | Sign-off «Pass» but §4 Admin (6 items) and §1 User count unchecked |

**Score:** 9/12 truths verified (3 uncertain, 1 failed)

### Roadmap Success Criteria

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | `db:purge` script + FK order + operator docs | ✓ | Script, README, file header |
| 2 | Admin user(s) preserved or documented | ✓ | Auth tables excluded; README step 5 |
| 3 | Listed routes without unhandled errors at 0 rows | ⚠️ partial | Storefront smoke Pass; admin routes not authenticated |
| 4 | Dashboard zeros / empty copy | ⚠️ code only | Same as truths 9–11 |
| 5 | Operator purge on dev + signed checklist | ⚠️ partial | Purge executed; checklist not fully signed |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `prisma/purge-business-data.ts` | CLI purge, guards, D-19-01 order | ✓ VERIFIED | 130 lines; exports `assertPurgeAllowed`, `purgeBusinessData`, helpers |
| `prisma/purge-business-data.test.ts` | Guard + order unit tests | ✓ VERIFIED | 7/7 Vitest pass; mocked `$transaction` |
| `package.json` | `db:purge` separate from seed | ✓ VERIFIED | `db:purge` → purge script; `prisma.seed` → `seed.ts` only |
| `README.md` | Operator subsection | ✓ VERIFIED | UA section with CONFIRM/ALLOW flags, no auto-seed |
| `19-MANUAL-CHECKLIST.md` | D-19-18 routes + sign-off | ⚠️ STUB (process) | Exists; admin section incomplete despite Pass row |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `package.json` | `prisma/purge-business-data.ts` | `"db:purge": "tsx prisma/purge-business-data.ts"` | ✓ WIRED | `node -e` check passed |
| `purge-business-data.ts` | `src/lib/db` | `import { prisma } from "../src/lib/db"` | ✓ WIRED | Same pattern as `seed.ts` |
| `purge-business-data.ts` | Prisma models | `tx.*.deleteMany` in `$transaction` | ✓ WIRED | 10 business models only |
| `19-MANUAL-CHECKLIST.md` | `db:purge` | prerequisite step | ✓ WIRED | References `CONFIRM_DB_PURGE=yes npm run db:purge` |
| Storefront/admin pages | empty DB | RSC queries + empty branches | ✓ WIRED (static) | No HTTP purge route under `src/app` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `purge-business-data.ts` | `counts` | `tx.*.deleteMany` in `$transaction` | Yes (DB `count` from Prisma) | ✓ FLOWING |
| `admin/page.tsx` | `stats` | `getAdminDashboardStats()` → `prisma.*.count` / `findMany` | Yes at runtime (not post-purge tested) | ✓ FLOWING |
| `category-grid.tsx` | `categories` | `listCategoriesWithProductCounts` + filter | Yes; empty → `null` render | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Purge unit tests | `npx vitest run prisma/purge-business-data.test.ts` | 7 passed | ✓ PASS |
| Admin stats zero handling | `npx vitest run src/server/services/admin-order.service.test.ts` | 29 passed | ✓ PASS |
| `db:purge` script wiring | `node -e` package.json check | OK | ✓ PASS |
| Live purge without confirm | — | SKIP | No destructive run in verifier |

### Probe Execution

Step 7c: SKIPPED — no phase-declared probes under `scripts/*/tests/probe-*.sh`.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DATA-01 | 19-01 | Full business-data purge via documented command; auth preserved | ✓ SATISFIED | `purge-business-data.ts`, `db:purge`, README, Vitest; auth models excluded |
| DATA-02 | 19-02 | Storefront + admin work at empty DB with empty states | ⚠️ PARTIAL | Storefront smoke + code audit; admin authenticated smoke incomplete |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | None in phase-modified source files | — | No TBD/FIXME/stub markers in `prisma/purge-business-data.ts` or tests |

### Human Verification Required

1. **Admin post-purge smoke (§4)** — Sign in, visit six admin routes on purged dev DB; confirm zeros and UA empty copy, no 500.
2. **User count unchanged (§1)** — Compare `User` count before/after purge; confirm login works.
3. **Optional `/obrane`** — WishlistEmptyState when signed in.

### Gaps Summary

**DATA-01 is implemented and verified in code and unit tests.** Purge script, guards, FK order, README, and `db:purge` wiring match plan 19-01.

**DATA-02 is partially verified.** Storefront routes were smoke-tested after purge (per checklist). Admin routes rely on existing empty branches (grep confirms copy and null-safe queries) but **were not exercised while signed in** — checklist §4 is entirely unchecked while sign-off claims Pass.

**Action:** Complete `19-MANUAL-CHECKLIST.md` §1 and §4 on a purged dev DB, then update sign-off. No code changes required unless smoke finds a 500.

---

_Verified: 2026-05-19T13:52:00Z_  
_Verifier: Claude (gsd-verifier)_
