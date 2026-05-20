---
phase: 35-callback-calls
status: human_needed
verified: 2026-05-20
---

# Phase 35 Verification

## Must-Haves

| Truth | Status | Evidence |
|-------|--------|----------|
| Dedicated `/admin/dzvinky` page | ✅ | `src/app/(admin)/admin/dzvinky/page.tsx` |
| Active/archive tabs via `?view=` | ✅ | `callbacks-url.ts`, `callback-list-filters.tsx` |
| Archive only when CONSULTED (server) | ✅ | `archiveCallbackRequest` + unit tests |
| Empty note → null | ✅ | `updateCallbackRequestNote` + tests |
| Settings page stripped | ✅ | grep: 0 «Заявки на дзвінок» |
| Sidebar «Дзвінки» + Phone icon | ✅ | `admin-nav-items.ts` |
| Analytics KPI unchanged | ✅ | `admin-analytics.service.ts` line 33 unchanged |

## Automated Checks

- `npm test -- --run src/server/services/callback-request.service.test.ts` — PASS (19)
- `npm test -- --run src/server/validators/admin-callback.test.ts` — PASS
- Prisma migration `20260520202841_callback_admin_fields` — applied
- `listCallbackRequestsAdmin` removed from `store-settings.service.ts` — confirmed

## Human Verification Required

See `35-HUMAN-UAT.md`. Plan 03 Task 4 checkpoint blocking phase sign-off.

## Requirement Traceability

| ID | Status |
|----|--------|
| CALL-01 | ✅ code complete — human UAT pending |
| CALL-02 | ✅ |
| CALL-03 | ✅ |
| CALL-04 | ✅ |
