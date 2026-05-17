# Phase 10: Category Showcase Images - Context

**Gathered:** 2026-05-17
**Status:** Ready for planning
**Source:** Roadmap + codebase assumptions (discuss-phase skipped; requirements from ROADMAP success criteria)

<domain>
## Phase Boundary

Головна (`CategoryGrid`) показує **зображення категорії** на кожній картці; якщо в БД немає — **fallback placeholder** (не порожня картка).

Адмін на **`/admin/kategorii/[id]`** завантажує/змінює/прибирає зображення через **існуючий signed Cloudinary flow** (`/api/upload/sign`, `CldUploadWidget`) — той самий патерн що `ProductImageUpload`.

**Не в цій фазі:** зображення на сторінці категорії `/katalog/[slug]` (banner), галерея кількох фото на категорію, crop UI в адмінці, окремий media library, зміна sortOrder через drag-drop, seed Pexels auto-fill у production.

</domain>

<decisions>
## Implementation Decisions

### Schema (HOME-01, HOME-02)
- **D-10-01:** Prisma `Category.imagePublicId String?` — один Cloudinary `public_id` на категорію (nullable).
- **D-10-02:** Опційно `imageAlt String?` для a11y; якщо порожньо — fallback `${category.name} — категорія, Львів`.
- **D-10-03:** Міграція **не ламає** існуючі рядки — поле nullable, без backfill у міграції (seed може заповнити окремо).

### Storefront homepage (HOME-01)
- **D-10-04:** `CategoryGrid` — картка з **image area** aspect **4:3** (як product card), назва поверх або під зображенням (planner: **під** зображенням, title в `CardHeader` — мінімальний diff від поточного layout).
- **D-10-05:** Якщо `imagePublicId` є — `OptimizedImage` / `CldImage` з `sizes="(max-width: 768px) 50vw, 25vw"` для grid 2/4 cols.
- **D-10-06:** Якщо немає — placeholder: `bg-muted` + іконка/текст **«Без фото»** (як product card без image).
- **D-10-07:** Grid, порядок, лінки — **без змін** (`sortOrder`, `/katalog/${slug}`).

### Admin upload (HOME-02)
- **D-10-08:** Новий client компонент **`CategoryImageUpload`** (аналог `product-image-upload.tsx`): **single** image, `maxFiles: 1`, `signatureEndpoint="/api/upload/sign"`.
- **D-10-09:** Server action **`updateCategoryImageAction`** (або розширити `updateCategoryAction`) — `requireAdmin`, Zod `{ categoryId, imagePublicId: string | null, imageAlt?: string }`, persist через `admin-catalog.service`.
- **D-10-10:** UI на edit page **під** `CategoryForm` або в окремій секції **«Зображення категорії»** з preview + «Завантажити» + «Прибрати фото».
- **D-10-11:** Після збереження image — `revalidatePath("/")`, `revalidatePath("/admin/kategorii")`, `revalidatePath(`/katalog/${slug}`)` (розширити `revalidateCategoryPaths`).

### Seed / dev data
- **D-10-12:** Опційно в `seed` / `ensureCategorySeedImage` — записати `imagePublicId` на Category з існуючого pool public_id **лише якщо** поле null (не перезаписувати admin upload).

### Verification
- **D-10-13:** Vitest: validator для image fields; service/action happy path + clear image.
- **D-10-14:** Manual checklist: upload → homepage card shows image → remove → placeholder; існуючі категорії без image — placeholder only.

### Claude's Discretion
- Чи об’єднати image upload у `CategoryForm` vs окремий блок — головне D-10-10.
- Точний placeholder (Lucide `ImageIcon` vs текст).
- Чи показувати thumbnail у `/admin/kategorii` list table (nice-to-have, не в success criteria).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & requirements
- `.planning/PROJECT.md` — Cloudinary, homepage categories
- `.planning/REQUIREMENTS.md` — HOME-01, HOME-02
- `.planning/ROADMAP.md` — Phase 10 goal, success criteria
- `.planning/STATE.md` — v1.1 milestone

### Code patterns (MUST read)
- `src/components/admin/product-image-upload.tsx` — CldUploadWidget + signed upload
- `src/components/home/category-grid.tsx` — homepage grid to extend
- `src/components/media/optimized-image.tsx` — CldImage delivery
- `src/server/actions/admin/category.actions.ts` — revalidate paths
- `src/server/actions/admin/product.actions.ts` — `saveProductImagesAction` pattern
- `src/app/api/upload/sign/route.ts` — signature endpoint
- `prisma/schema.prisma` — `Category` model
- `prisma/seed-cloudinary.ts` — category pool public_ids

### Prior UI contracts
- `.planning/phases/02-catalog-discovery/02-UI-SPEC.md` — product card 4:3, OptimizedImage
- `.planning/phases/09-wishlist/09-UI-SPEC.md` — storefront tokens (extends 02)

</canonical_refs>

<specifics>
## Specific Ideas

- ROADMAP згадує `Category.imagePublicId` — узгодити ім’я поля в Prisma і Zod.
- Success criteria #4: optimized images via CldImage + grid `sizes`.
- Phase 8 notes deferred category images to Phase 10.

</specifics>

<deferred>
## Deferred Ideas

- Category hero/banner on `/katalog/[slug]`
- Multiple images per category
- Admin list column with thumbnails

</deferred>

---

*Phase: 10-category-showcase-images*
*Context gathered: 2026-05-17 (roadmap-derived)*
