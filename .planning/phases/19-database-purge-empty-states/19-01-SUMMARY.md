---
phase: 19-database-purge-empty-states
plan: 01
subsystem: database
tags: [prisma, postgres, cli, purge, better-auth]

requires: []
provides:
  - Guarded npm run db:purge CLI for FK-safe business data wipe
  - Operator README subsection (UA) for backup → purge → optional seed
  - Vitest mocks for confirm/production gates and delete order
affects: [19-02 empty-state smoke]

tech-stack:
  added: []
  patterns:
    - "CLI-only destructive ops with CONFIRM_DB_PURGE and production ALLOW gate"
    - "Single interactive $transaction with ordered deleteMany on tx"

key-files:
  created:
    - prisma/purge-business-data.ts
    - prisma/purge-business-data.test.ts
  modified:
    - package.json
    - README.md

key-decisions:
  - "isDirectRun guard so Vitest imports do not execute main() or $disconnect"
  - "Pure isPurgeConfirmed / isProductionPurgeAllowed helpers for unit tests"

patterns-established:
  - "Purge script mirrors seed.ts lifecycle but delete-only inside one transaction"

requirements-completed: [DATA-01]

duration: 25min
completed: 2026-05-19
---

# Phase 19 Plan 01 Summary

**Guarded `db:purge` wipes all business PostgreSQL rows in FK order while Better Auth tables stay intact.**

## Performance

- **Duration:** ~25 min
- **Completed:** 2026-05-19
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- `prisma/purge-business-data.ts` with D-19-01 delete order, confirm/production gates, per-table stdout, Cloudinary warning
- `npm run db:purge` script separate from `prisma db seed`
- Ukrainian operator docs in README (backup, purge, optional seed, test caveat)
- Seven Vitest cases for guards and transaction delete order (no real DB)

## Task Commits

1. **Task 1: purge script** - `1c3c2c1` (feat)
2. **Task 2: db:purge + README** - `b17854b` (feat)
3. **Task 3: Vitest** - `38b92b4` (test)

## Files Created/Modified

- `prisma/purge-business-data.ts` — CLI entry, guards, transactional purge
- `prisma/purge-business-data.test.ts` — mocked $transaction order tests
- `package.json` — `db:purge` script
- `README.md` — operator subsection

## Self-Check: PASSED

- [x] Automated grep verifies from plan
- [x] `npx vitest run prisma/purge-business-data.test.ts` — 7 passed
