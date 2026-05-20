---
phase: 35-callback-calls
plan: 02
subsystem: api
tags: [prisma, zod, server-actions, callback]

requires:
  - phase: 35-01
    provides: Contract tests for admin callback behavior
provides:
  - CallbackRequestStatus enum and migrated fields
  - listCallbackRequestsAdmin with active/archive views
  - Admin mutations and requireAdmin actions
affects: [35-03]

tech-stack:
  added: []
  patterns:
    - "Admin callback data layer in callback-request.service (D-05)"
    - "Empty note → null in service (D-10)"

key-files:
  created:
    - prisma/migrations/20260520202841_callback_admin_fields/migration.sql
    - src/lib/callback/status-labels.ts
    - src/server/validators/admin-callback.ts
    - src/server/actions/admin/callback.actions.ts
  modified:
    - prisma/schema.prisma
    - src/server/services/callback-request.service.ts
    - src/server/services/store-settings.service.ts

key-decisions:
  - "Three discrete server actions with revalidatePath /admin/dzvinky only"
  - "admin-analytics.service.ts untouched (D-12)"

requirements-completed: [CALL-02, CALL-03, CALL-04]

duration: 25min
completed: 2026-05-20
---

# Phase 35 Plan 02 Summary

**Prisma migration and admin callback service/actions implement archive gate, note null normalization, and active/archive listing.**

## Accomplishments
- Applied `callback_admin_fields` migration (status, note, archivedAt)
- Moved list API from store-settings to callback-request.service
- All Plan 01 tests green; validators + tsc clean for new modules

## Task Commits
1. **Task 1: Schema + migrate** - `e9d56d0` (feat(35-02))
2. **Tasks 2–3: Service, validators, actions** - `e9d56d0` (feat(35-02))

## Self-Check: PASSED
