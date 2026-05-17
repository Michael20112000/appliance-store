---
phase: 04-admin-operations
plan: 05
subsystem: ui
tags: [admin, dashboard, playwright, vitest, rbac, e2e]

requires:
  - phase: 04-admin-operations
    provides: admin catalog, products, orders CRUD from plans 02-04
provides:
  - Full admin shell (sidebar, muted chrome, inset panel)
  - Dashboard with live stats and recent orders
  - Disabled Чати nav (ADM-05 defer)
  - E2E smoke for AUTH-04 and ADM-01–04
affects: [verify-work, phase-5-chat]

tech-stack:
  added: []
  patterns:
    - "getAdminDashboardStats aggregates PENDING/AVAILABLE/DRAFT counts"
    - "e2e/helpers/admin.ts loginAsAdmin + Cloudinary env gate"
    - "ProductImageUpload skips CldUploadWidget when client API key missing"

key-files:
  created:
    - src/components/admin/stat-card.tsx
    - e2e/admin-categories.spec.ts
    - e2e/admin-products.spec.ts
    - e2e/admin-orders.spec.ts
    - e2e/helpers/admin.ts
  modified:
    - src/app/(admin)/admin/layout.tsx
    - src/app/(admin)/admin/page.tsx
    - src/components/admin/admin-nav.tsx
    - src/server/services/admin-order.service.ts
    - e2e/admin-rbac.spec.ts
    - src/components/admin/order-status-select.tsx
    - src/components/admin/product-image-upload.tsx
    - playwright.config.ts
    - src/server/services/admin-order.service.test.ts

key-decisions:
  - "Чати nav disabled with badge «Незабаром» only — no chat routes (D-04-06)"
  - "Playwright loads dotenv/config for ADMIN_EMAIL and Cloudinary secrets"
  - "Order status select calls router.refresh() after successful update"

patterns-established:
  - "Pattern: StatCard + dashboard server stats via getAdminDashboardStats"
  - "Pattern: admin E2E uses page.request for cookie-aware API RBAC checks"

requirements-completed: [AUTH-04, ADM-01, ADM-02, ADM-03, ADM-04]

duration: 28min
completed: 2026-05-17
---

# Phase 4 Plan 05: Admin Shell & E2E Summary

**Admin dashboard with live stats, full sidebar shell, disabled Чати nav, and green RBAC/CRUD e2e smoke.**

## Performance

- **Duration:** ~28 min
- **Tasks:** 3/3
- **Files modified:** 14

## Accomplishments

- Replaced placeholder admin header with `grid-cols-[240px_1fr]` shell per UI-SPEC (`bg-muted` + inset `bg-background` panel).
- Dashboard shows PENDING / AVAILABLE / DRAFT counts, quick links, and 5 recent orders with detail links.
- `AdminNav` includes lucide icons, disabled **Чати** with **Незабаром**, **На сайт**, and **Вийти**.
- E2E suite: buyer blocked from `/admin` and `/api/upload/sign`; admin sign when Cloudinary configured; category CRUD; product publish to storefront; order PENDING→CONFIRMED.

## Task Commits

1. **Task 1: Admin shell + dashboard stats** - `5739903` (feat)
2. **Task 2: Wave 0 unit test gap fill** - `55b8be4` (test)
3. **Task 3: E2E admin CRUD + RBAC extension** - `f1f49e5` (test)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Order status select showed raw enum and stale UI after update**
- **Found during:** Task 3
- **Issue:** Select trigger displayed `CONFIRMED` instead of Ukrainian label; status did not refresh after mutation.
- **Fix:** `SelectValue` renders `ORDER_STATUS_LABELS_UA[order.status]`; `router.refresh()` after success.
- **Files modified:** `src/components/admin/order-status-select.tsx`

**2. [Rule 2 - Critical] ProductImageUpload crashed without client Cloudinary API key**
- **Found during:** Task 3 (admin-products e2e)
- **Issue:** `CldUploadWidget` threw on edit page when `NEXT_PUBLIC_CLOUDINARY_API_KEY` unset.
- **Fix:** Guard widget behind `isUploadWidgetConfigured()` with UA alert fallback.
- **Files modified:** `src/components/admin/product-image-upload.tsx`

**3. [Rule 3 - Blocking] Playwright did not load `.env` for admin/Cloudinary credentials**
- **Found during:** Task 3
- **Fix:** `import "dotenv/config"` in `playwright.config.ts`; `hasCloudinarySecrets()` checks server env vars.
- **Files modified:** `playwright.config.ts`, `e2e/helpers/admin.ts`

## Verification

- Unit: `npm test -- src/server/services/admin-catalog.service.test.ts src/server/services/admin-product.service.test.ts src/server/services/admin-order.service.test.ts` — **32 passed**
- E2E: `npx playwright test e2e/admin-rbac.spec.ts e2e/admin-categories.spec.ts e2e/admin-products.spec.ts e2e/admin-orders.spec.ts` — **4 passed** (~30s)

## Self-Check: PASSED

- FOUND: src/components/admin/stat-card.tsx
- FOUND: e2e/admin-categories.spec.ts
- FOUND: e2e/admin-products.spec.ts
- FOUND: e2e/admin-orders.spec.ts
- FOUND: e2e/helpers/admin.ts
- FOUND: commit 5739903
- FOUND: commit 55b8be4
- FOUND: commit f1f49e5
