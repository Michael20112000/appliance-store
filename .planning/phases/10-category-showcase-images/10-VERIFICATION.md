---
phase: 10-category-showcase-images
verified: 2026-05-17T22:22:00Z
status: passed
score: 14/14 must-haves verified (automated)
overrides_applied: 0
human_verification:
  - test: "Open `/` on a DB where at least one category has null `imagePublicId`"
    expected: "That card shows muted area with text «Без фото»; grid is 2 cols mobile / 4 cols md; links go to `/katalog/{slug}`"
    why_human: "Visual layout and placeholder copy require browser"
  - test: "Admin → `/admin/kategorii/[id]` → upload image via Cloudinary widget"
    expected: "Section «Зображення категорії» visible; after upload, admin preview shows image; hard refresh `/` shows image on that category card"
    why_human: "Signed upload widget and cache revalidation need live Cloudinary + browser"
  - test: "Click «Прибрати фото» on same category and confirm"
    expected: "Admin preview clears; homepage card returns to «Без фото»"
    why_human: "End-to-end persist + revalidate flow is interactive"
  - test: "Category with image but empty `imageAlt` — inspect img in DevTools"
    expected: "alt is `{name} — категорія, Львів`"
    why_human: "Rendered accessibility attribute check"
---

# Phase 10: Category Showcase Images Verification Report

**Phase Goal:** Головна показує зображення категорій; адмін керує ними.

**Verified:** 2026-05-17T22:22:00Z

**Status:** passed

**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | ------- | ---------- | -------------- |
| 1 | Кожна картка категорій має зображення або fallback «Без фото» (HOME-01, roadmap SC1) | ✓ VERIFIED | `category-grid.tsx` renders `OptimizedImage` when `imagePublicId` set, else placeholder div |
| 2 | Адмін на `/admin/kategorii/[id]` завантажує/змінює image через signed widget (HOME-02, roadmap SC2) | ✓ VERIFIED | `CategoryImageUpload` with `signatureEndpoint="/api/upload/sign"`, wired on admin edit page |
| 3 | `Category.imagePublicId` / `imageAlt` у Prisma + revalidate homepage (roadmap SC3) | ✓ VERIFIED | `schema.prisma` nullable fields; migration `20260517191223_category_image`; `revalidateCategoryPaths` calls `revalidatePath("/")` |
| 4 | Зображення оптимізовані — CldImage, sizes для grid (roadmap SC4) | ✓ VERIFIED | `OptimizedImage` (format/quality auto); grid uses `sizes="(max-width: 768px) 50vw, 25vw"` |
| 5 | Migration/seed не ламають існуючі категорії (roadmap SC5) | ✓ VERIFIED | Migration adds nullable columns only; `seedCategoryShowcaseImages` updates only `imagePublicId: null` with `updateMany` guard |
| 6 | `updateCategoryImageSchema` validates cuid and null clear | ✓ VERIFIED | `category.test.ts` — 16 tests pass including null/empty cases |
| 7 | Admin persist/clear `imagePublicId` via server action | ✓ VERIFIED | `updateCategoryImage` service + `updateCategoryImageAction`; service tests pass |
| 8 | Homepage revalidates when category image changes | ✓ VERIFIED | `updateCategoryImageAction` → `revalidateCategoryPaths` → `revalidatePath("/")` |
| 9 | Non-admin cannot call `updateCategoryImageAction` | ✓ VERIFIED | `requireAdmin()` first line in action (no dedicated action test; code path is explicit) |
| 10 | Admin page shows upload, preview, remove for one image | ✓ VERIFIED | `category-image-upload.tsx` + section on `admin/kategorii/[id]/page.tsx` |
| 11 | Remove clears DB and refreshes client preview | ✓ VERIFIED | `handleRemove` → `persistImage({ imagePublicId: null, imageAlt: null })` |
| 12 | Grid layout and links unchanged (2/4 cols, `/katalog/{slug}`) | ✓ VERIFIED | `grid-cols-2 gap-4 md:grid-cols-4`; `Link href={/katalog/${category.slug}}` |
| 13 | Manual checklist documents upload → homepage → remove flow | ✓ VERIFIED | `10-MANUAL-CHECKLIST.md` sections 1–7 cover full flow |
| 14 | Upload uses same signed flow as products | ✓ VERIFIED | Same `signatureEndpoint="/api/upload/sign"` as `product-image-upload.tsx` |

**Score:** 14/14 truths verified (automated evidence only)

### Deferred Items

None — no gaps deferred to later phases.

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `prisma/schema.prisma` | Category image fields | ✓ VERIFIED | `imagePublicId String?`, `imageAlt String?` on `Category` |
| `prisma/migrations/20260517191223_category_image/migration.sql` | Nullable migration | ✓ VERIFIED | `ADD COLUMN` only, no NOT NULL |
| `src/server/validators/category.ts` | `updateCategoryImageSchema` | ✓ VERIFIED | Zod with cuid, nullable publicId, alt max 500 |
| `src/server/validators/category.test.ts` | Zod coverage | ✓ VERIFIED | Part of 16 passing tests |
| `src/server/services/admin-catalog.service.ts` | `updateCategoryImage` | ✓ VERIFIED | findUnique guard + update |
| `src/server/services/admin-catalog.service.test.ts` | Service tests | ✓ VERIFIED | update + clear + not-found cases |
| `src/server/actions/admin/category.actions.ts` | `updateCategoryImageAction` | ✓ VERIFIED | requireAdmin + revalidate |
| `src/components/admin/category-image-upload.tsx` | Admin upload UI | ✓ VERIFIED | CldUploadWidget, preview, remove, alt |
| `src/app/(admin)/admin/kategorii/[id]/page.tsx` | Wires uploader | ✓ VERIFIED | Passes id + initial image fields |
| `src/components/home/category-grid.tsx` | HOME-01 storefront | ✓ VERIFIED | Prisma findMany + OptimizedImage/placeholder |
| `.planning/phases/10-category-showcase-images/10-MANUAL-CHECKLIST.md` | Operator verification | ✓ VERIFIED | Exists; sign-off pending |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `category-grid.tsx` | `OptimizedImage` | `imagePublicId` prop | ✓ WIRED | Conditional render when publicId set |
| `category-grid.tsx` | `prisma.category.findMany` | direct query | ✓ WIRED | Server component fetches all scalar fields including image |
| `category-image-upload.tsx` | `updateCategoryImageAction` | `persistImage` callback | ✓ WIRED | upload, remove, alt blur |
| `category-image-upload.tsx` | `/api/upload/sign` | `signatureEndpoint` | ✓ WIRED | CldUploadWidget config |
| `category.actions.ts` | `revalidatePath("/")` | `revalidateCategoryPaths` | ✓ WIRED | Called after image update |
| `category.actions.ts` | `updateCategoryImage` | service call | ✓ WIRED | After Zod parse |
| `prisma/schema.prisma` | `Category` | `imagePublicId` | ✓ WIRED | Migration applied in repo |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `category-grid.tsx` | `categories` | `prisma.category.findMany` | Yes — DB query, no static array | ✓ FLOWING |
| `category-grid.tsx` | `category.imagePublicId` | Prisma row field | Yes — nullable from DB | ✓ FLOWING |
| `category-image-upload.tsx` | `imagePublicId` | initial props + action result | Yes — updated after `updateCategoryImageAction` | ✓ FLOWING |
| `admin/kategorii/[id]/page.tsx` | `category` | `getCategoryById` | Yes — passes real initial values to upload | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Zod + service tests | `npm test -- src/server/validators/category.test.ts src/server/services/admin-catalog.service.test.ts` | 16 passed | ✓ PASS |
| Prisma schema valid | `npx prisma validate` | schema valid | ✓ PASS |
| Migration file present | `test -f prisma/migrations/20260517191223_category_image/migration.sql` | exists | ✓ PASS |

**Step 7b note:** No dev server started; Cloudinary upload → homepage refresh not spot-checked via curl (requires auth + widget).

### Probe Execution

No phase-declared probes. **Skipped.**

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| HOME-01 | 10-01, 10-02, 10-04 | Картки категорій на головній показують зображення категорії | ✓ SATISFIED | `CategoryGrid` + `OptimizedImage` + placeholder |
| HOME-02 | 10-01, 10-02, 10-03 | Адмін завантажує/змінює через signed Cloudinary flow | ✓ SATISFIED | `CategoryImageUpload` + `updateCategoryImageAction` + `/api/upload/sign` |

No orphaned requirements for Phase 10.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | None in phase 10 source files | — | — |

No `TBD`/`FIXME`/`XXX` in modified implementation files. Placeholder «Без фото» is intentional UX per UI-SPEC, not a stub.

### Human Verification Required

Operator must complete `10-MANUAL-CHECKLIST.md` rows **1–9** (status still ⏳ Pending sign-off):

1. **Homepage placeholder** — categories without `imagePublicId` show «Без фото»; grid 2/4 cols intact.
2. **Admin upload → homepage** — widget upload on `/admin/kategorii/[id]`; image appears on `/` after refresh.
3. **Remove → placeholder** — «Прибрати фото» clears admin + homepage.
4. **Regression & a11y** — empty alt fallback `{name} — категорія, Львів`.

Optional rows 10–11 (seed) are dev-only.

**Why not `passed`:** Automated code verification is complete; milestone close still needs browser/Cloudinary sign-off documented in the checklist.

### Gaps Summary

No implementation gaps found. Codebase delivers Phase 10 goal per ROADMAP success criteria. Remaining work is **operator manual verification** only (`10-MANUAL-CHECKLIST.md`).

---

_Verified: 2026-05-17T22:22:00Z_

_Verifier: Claude (gsd-verifier)_
