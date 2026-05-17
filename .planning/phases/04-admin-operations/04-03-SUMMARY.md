---
phase: 04-admin-operations
plan: 03
subsystem: api
tags: [admin, products, cloudinary, prisma, zod, react-hook-form, vitest, next-cloudinary]

requires:
  - phase: 04-admin-operations
    plan: 01
    provides: POST /api/upload/sign for CldUploadWidget
  - phase: 04-admin-operations
    plan: 02
    provides: admin category CRUD and listCategoriesAdmin
provides:
  - admin-product.service with list/create/update/delete and syncProductImages
  - product server actions with storefront revalidation
  - Admin UI at /admin/tovary (list, novyi, [id]) with signed multi-image upload
affects: [04-05]

tech-stack:
  added: []
  patterns:
    - "Admin product list without PUBLIC_STATUS filter (all statuses)"
    - "Price UAH in form, kopiyky in DB via priceUahToKopiyky"
    - "CldUploadWidget signatureEndpoint=/api/upload/sign"
    - "SOLD status read-only in admin form; set only via orders"

key-files:
  created:
    - src/server/services/admin-product.service.ts
    - src/server/services/admin-product.service.test.ts
    - src/server/validators/admin-product.ts
    - src/server/validators/admin-product.test.ts
    - src/server/actions/admin/product.actions.ts
    - src/components/admin/product-form.tsx
    - src/components/admin/product-image-upload.tsx
    - src/components/admin/product-status-badge.tsx
    - src/components/admin/product-list-filters.tsx
    - src/app/(admin)/admin/tovary/page.tsx
    - src/app/(admin)/admin/tovary/novyi/page.tsx
    - src/app/(admin)/admin/tovary/[id]/page.tsx
  modified:
    - src/components/admin/admin-nav.tsx

key-decisions:
  - "Slug stable on update unless admin edits slug field; auto from title on create only"
  - "Admin form status limited to DRAFT | AVAILABLE; SOLD preserved on update"
  - "syncProductImages replaces all rows with sortOrder 0..n-1, max 8 images"

patterns-established:
  - "Pattern: admin-product.service → product.actions → ProductForm + ProductImageUpload"
  - "Pattern: revalidateStorefrontProduct(slug, categorySlug) on publish/update"

requirements-completed: [ADM-02, ADM-03]

duration: 18min
completed: 2026-05-17
---

# Phase 4 Plan 03: Admin Product CRUD Summary

**Ukrainian admin product CRUD at `/admin/tovary` with signed Cloudinary multi-image upload, cart/order delete guards, and storefront cache revalidation**

## Performance

- **Duration:** 18 min
- **Started:** 2026-05-17T10:06:52Z
- **Completed:** 2026-05-17T10:24:52Z
- **Tasks:** 3
- **Files modified:** 14

## Accomplishments

- `admin-product.service` lists all statuses, converts UAH→kopiyky, guards delete (`PRODUCT_IN_CART`, `PRODUCT_IN_ACTIVE_ORDER`)
- Server actions with `requireAdmin` on every export and `revalidatePath` for `/admin/tovary`, `/tovar/[slug]`, `/katalog`, `/`
- Admin pages: product table with filters, create/edit forms, `ProductImageUpload` via `signatureEndpoint="/api/upload/sign"`

## Task Commits

1. **Task 1: admin-product.service + validators + unit tests** - `7432ffd` (test), `c09b806` (feat)
2. **Task 2: product.actions + image save action** - `7ae3255` (feat)
3. **Task 3: Product pages + form + image uploader** - `f2e147d` (feat)

## Files Created/Modified

- `src/server/services/admin-product.service.ts` - Product CRUD, where builder, image sync, delete guards
- `src/server/validators/admin-product.ts` - upsert/update/list/image schemas
- `src/server/actions/admin/product.actions.ts` - Mutations + revalidation + error mapping
- `src/components/admin/product-image-upload.tsx` - CldUploadWidget signed upload, 72px thumb grid
- `src/components/admin/product-form.tsx` - RHF form, sticky footer, embeds uploader on edit
- `src/app/(admin)/admin/tovary/*` - List, new, edit pages
- `src/components/admin/admin-nav.tsx` - Enabled Товари link

## Decisions Made

- `buildAdminProductWhere` never forces `AVAILABLE` — admin sees DRAFT/SOLD/AVAILABLE
- `updateProduct` keeps `SOLD` status unchanged even if form submits DRAFT/AVAILABLE
- Image upload persists via `saveProductImagesAction` after each widget success (microtask batch)

## Deviations from Plan

None - plan executed as written.

## Issues Encountered

- `npm run build` fails at prerender `/sitemap.xml` (pre-existing; unrelated to 04-03). TypeScript compile for new files succeeded.

## TDD Gate Compliance

Task 1: RED `7432ffd`, GREEN `c09b806` — compliant.

## User Setup Required

`CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in `.env` for signed uploads (from 04-01).

## Next Phase Readiness

Ready for **04-05** E2E admin product smoke. Order admin (04-04) already on main.

## Self-Check: PASSED

- FOUND: src/server/services/admin-product.service.ts
- FOUND: src/server/actions/admin/product.actions.ts
- FOUND: src/components/admin/product-image-upload.tsx
- FOUND: src/app/(admin)/admin/tovary/page.tsx
- FOUND: commits 7432ffd, c09b806, 7ae3255, f2e147d (via `git log --oneline -6`)

---
*Phase: 04-admin-operations*
*Completed: 2026-05-17*
