---
phase: 26-footer-mobile-contact
plan: 01
subsystem: ui
tags: [prisma, footer, callback, admin-settings, vitest]

requires:
  - phase: 25-homepage-empty-categories
    provides: categoriesWithAvailableProducts pipeline for drawer badges
provides:
  - DB-backed store contacts (phones, emails, addresses)
  - Guest callback requests with IP rate limiting
  - Admin /admin/nalashtuvannia settings + callback list
  - Shared CallbackRequestForm in footer and mobile drawer
  - Async getStoreNap from same DB source as footer

tech-stack:
  added: []
  patterns:
    - "Normalized Prisma contact tables with sortOrder"
    - "Shared uaPhoneSchema in validators/phone.ts"
    - "DB count rate limit mirroring chat.service"

key-files:
  created:
    - prisma/migrations/20260519170231_store_settings_and_callback/migration.sql
    - src/server/services/store-settings.service.ts
    - src/server/services/callback-request.service.ts
    - src/server/actions/callback.actions.ts
    - src/server/actions/admin/store-settings.actions.ts
    - src/components/layout/callback-request-form.tsx
    - src/components/admin/store-settings-form.tsx
    - src/app/(admin)/admin/nalashtuvannia/page.tsx
    - src/lib/phone/format-ua.ts
    - src/lib/catalog/store-map.ts
  modified:
    - prisma/schema.prisma
    - src/components/layout/store-footer.tsx
    - src/components/layout/store-mobile-nav.tsx
    - src/lib/catalog/store-nap.ts
    - src/app/(storefront)/page.tsx

key-decisions:
  - "Normalized StorePhone/StoreEmail/StoreAddress tables (not JSON singleton)"
  - "5 callback requests per hour per IP in DB"
  - "Admin route /admin/nalashtuvannia with Settings nav item"

patterns-established:
  - "Callback success toast only; errors inline on phone field"
  - "Footer async RSC loads getPublicStoreContacts; omits empty contact types"

requirements-completed: [FOOT-01, FOOT-02, FOOT-03, FOOT-04]

duration: 45min
completed: 2026-05-19
---

# Phase 26 Plan 01 Summary

**Store contacts and callback requests live in PostgreSQL; footer, mobile drawer, homepage JsonLd, and admin settings all read the same source.**

## Performance

- **Duration:** ~45 min
- **Tasks:** 4/4
- **Files modified:** 30+

## Accomplishments

- Prisma models + migration for contacts and `CallbackRequest` with IP rate limiting (5/hour).
- Shared `uaPhoneSchema`, `CallbackRequestForm`, and Ukrainian copy in footer + drawer.
- Admin «Налаштування» page for contact CRUD and «Заявки на дзвінок» list.
- `getStoreNap()` async from DB; `npm run build` green; phase Vitest files pass.

## Self-Check

- [x] Migration applied (`store_settings_and_callback`)
- [x] `npm run build` passed
- [x] Phase-scoped Vitest (validators, services, callback form, mobile nav) passed
- [ ] Full `npm test` — `prisma/seed.test.ts` out-of-stock count fails on current DB (pre-existing data gap, unrelated to phase 26)

## Files Created/Modified

- `src/components/layout/store-footer.tsx` — async two-column footer with contacts, lazy map, callback form
- `src/components/layout/store-mobile-nav.tsx` — badges + separator + shared callback form
- `src/server/services/store-settings.service.ts` — public contacts + admin save/list callbacks
- `src/app/(admin)/admin/nalashtuvannia/page.tsx` — admin settings UI

## Deviations

None — implemented per plan and locked CONTEXT decisions.
