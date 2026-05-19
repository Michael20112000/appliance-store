---
phase: 27-human-uat-closure
date: 2026-05-19
db_baseline: purge + optional seed
uat01_status: passed
operator: Michael Ivashko
---

# 27-UAT-REPORT — UAT-01 closure (v1.5)

## Executive summary

**UAT-01: PASS.** Operator approved manual session 2026-05-19. Automated gate green except documented P2 `seed.test.ts`. No open P0. v1.5 intake BUG-18…23 verified. Legacy phases 04, 07, 18 remain deferred (D-03).

## DB baseline

| Item | Value |
|------|-------|
| Purge run | `CONFIRM_DB_PURGE=yes npm run db:purge` — pass |
| Seed run | `npx prisma db seed` (after purge, for catalog/smoke) — pass |
| DATABASE_URL host (redacted) | Dev Neon branch (operator confirmed) |
| Notes | Footer contacts may persist after purge per D-08 (StorePhone/Email/Address/CallbackRequest) |

## §19 purge (19-MANUAL-CHECKLIST)

| Route / step | Result |
|--------------|--------|
| Prerequisites (dev, admin login) | Pass |
| Purge command | Pass |
| `/` — no `#kategorii` | Pass |
| `/katalog` | Pass |
| `/katalog/[slug]` | Pass |
| `/admin/kategorii` — empty | Pass |
| `/admin/tovary` — empty | Pass |
| `/koszyk` guest — empty cart, no login redirect | Pass |
| `/admin` dashboard — no orders | Pass |

## §Automated gate

| Command | Exit | Notes |
|---------|------|-------|
| Targeted status Vitest | 0 | 42/42 passed (2026-05-19) |
| `npm test` | 1 | 256/257 passed; **P2** — `prisma/seed.test.ts` out-of-stock count (0 < 2) per D-06 |
| `npm run build` | 0 | Next.js 16.2.6 compile OK (2026-05-19) |

## §Smoke

### Guest checkout (D-16)

Pass — guest cart → `/koszyk` → `/zamovlennia` → confirmation with order number.

### Admin orders (D-17)

Pass — pickup: no «Доставляється»; Lviv delivery: no «Готово до самовивозу»; illegal transitions not persisted.

## §v1.5 phases 22–26

| Phase | Requirement | Result |
|-------|-------------|--------|
| 22 | ORD-03/04 delivery-aware status | Pass |
| 23 | ADM-CAT-03/04 category polish | Pass |
| 24 | ADM-PRD-05 product edit UX | Pass (24-HUMAN-UAT resolved) |
| 25 | HOME-03 empty categories | Pass (25-HUMAN-UAT resolved) |
| 26 | FOOT-01…04 footer/mobile | Pass (26-HUMAN-UAT resolved) |

## §Intake BUG-18…23

| BUG | Status | Notes |
|-----|--------|-------|
| BUG-18 | verified | Admin order status matrix |
| BUG-19 | verified | Category edit toolbar icons |
| BUG-20 | verified | Product edit UX (phase 24) |
| BUG-21 | verified | Categories «Товари» column |
| BUG-22 | verified | Homepage categories HOME-03 |
| BUG-23 | verified | Footer + mobile drawer FOOT |

## §P1 fixes applied

| File | Fix |
|------|-----|
| `src/lib/db.ts` | Recreate stale dev `PrismaClient` singleton when phase-26 delegates (`storePhone`, etc.) missing — fixed footer `findMany` crash after generate/HMR |

## §P2 deferred

- `prisma/seed.test.ts` out-of-stock count (if applicable)
- Cloudinary orphans after purge
- `e2e/cart-auth.spec.ts` stale guest-auth expectations
- **Legacy phases 04, 07, 18** — partial UAT deferred per D-03 (acknowledged in STATE.md)
- Optional follow-up: `/gsd-verify-work 27` (D-15)

## §Sign-off

| Field | Value |
|-------|-------|
| Date | 2026-05-19 |
| Operator | Michael Ivashko |
| UAT-01 recommendation | **Ship** |
| Open P0 | None |
