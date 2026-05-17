---
phase: 08-admin-ux-chat-lifecycle
plan: 02
subsystem: api
tags: [zod, prisma, vitest, admin, pagination, postgresql]

requires:
  - phase: 08-admin-ux-chat-lifecycle
    provides: shadcn table/pagination primitives from plan 01
provides:
  - listOrdersAdminSchema Zod URL contract for orders list
  - listOrdersAdminPaginated and countOrdersAdmin services
  - adminOrdersUrl helper for plain searchParams navigation
affects: [08-03, 08-07]

tech-stack:
  added: []
  patterns:
    - "Plain URLSearchParams admin list URLs (not nuqs)"
    - "totalKopiyky sort via $queryRaw aggregate then findMany by id order"

key-files:
  created:
    - src/server/validators/admin-order.ts
    - src/server/validators/admin-order.test.ts
    - src/lib/admin/orders-url.ts
    - src/lib/admin/orders-url.test.ts
  modified:
    - src/server/services/admin-order.service.ts
    - src/server/services/admin-order.service.test.ts

key-decisions:
  - "pageSize restricted to 10|20|50 via Zod refine (invalid values fail parse)"
  - "totalKopiyky ordering uses raw SQL SUM(priceSnapshot * quantity) then preserves id order in findMany"

patterns-established:
  - "buildOrderWhere shared by listAllOrders and paginated list"
  - "adminOrdersUrl omits default query keys (page 1, pageSize 20, sort createdAt, dir desc, filter all)"

requirements-completed: []

duration: 3min
completed: 2026-05-17
---

# Phase 8 Plan 02: Paginated Admin Orders Backend Summary

**Zod URL contract, paginated `listOrdersAdminPaginated` with raw-SQL `totalKopiyky` sort, and `adminOrdersUrl` for plain searchParams links — ready for RSC Data Table in plan 08-03.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-05-17T19:54:00Z
- **Completed:** 2026-05-17T16:56:55Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- `listOrdersAdminSchema` validates filter, page, pageSize, sort, dir with safe defaults (D-08-09)
- `listOrdersAdminPaginated` + `countOrdersAdmin` mirror `listAdminProducts` pagination shape (D-08-08)
- `totalKopiyky` sort uses `$queryRaw` aggregate ordering per RESEARCH Pitfall 1 (D-08-11)
- `adminOrdersUrl()` builds `/admin/zamovlennia?...` omitting default keys (D-08-10 caller passes `page: 1` on filter change)
- Vitest coverage for schema, URL helper, pagination, and sort paths (D-08-26 partial)

## Task Commits

1. **Task 1: listOrdersAdminSchema + adminOrdersUrl** - `e467084` (feat)
2. **Task 2–3: listOrdersAdminPaginated + types** - `79babbb` (feat)

**Plan metadata:** pending (docs commit after this file)

## Files Created/Modified

- `src/server/validators/admin-order.ts` - `listOrdersAdminSchema`, filter/sort/dir enums, types
- `src/lib/admin/orders-url.ts` - `adminOrdersUrl` for Link navigation
- `src/server/services/admin-order.service.ts` - `countOrdersAdmin`, `listOrdersAdminPaginated`, `buildOrderWhere`, raw SQL total sort
- `*.test.ts` - Vitest for schema, URL, pagination, sort

## Decisions Made

- Invalid `pageSize` (e.g. 99) fails Zod parse rather than clamping — aligns with threat model T-08-02-01
- `listAllOrders` retained for dashboard; refactored to use `buildOrderWhere`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `npm run lint` reports pre-existing project-wide errors unrelated to this plan; changed files pass ESLint via IDE diagnostics.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 08-03 can wire `zamovlennia/page.tsx` to `listOrdersAdminSchema.parse` + `listOrdersAdminPaginated`
- Use `adminOrdersUrl` in `OrderListFilters` and sort/pagination links with `page: 1` on filter/pageSize change
- ADM-02 requirement completes when 08-03 UI lands (backend-only in this plan)

## Self-Check: PASSED

- FOUND: src/server/validators/admin-order.ts
- FOUND: src/lib/admin/orders-url.ts
- FOUND: src/server/services/admin-order.service.ts (paginated exports)
- FOUND: commit e467084
- FOUND: commit 79babbb

---
*Phase: 08-admin-ux-chat-lifecycle*
*Completed: 2026-05-17*
