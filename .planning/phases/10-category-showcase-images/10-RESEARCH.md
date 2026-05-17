# Phase 10: Category Showcase Images - Research

**Researched:** 2026-05-17
**Domain:** Prisma schema extension, homepage RSC grid, signed Cloudinary admin upload (existing stack)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Schema (HOME-01, HOME-02)
- **D-10-01:** Prisma `Category.imagePublicId String?` — один Cloudinary `public_id` на категорію (nullable).
- **D-10-02:** Опційно `imageAlt String?` для a11y; якщо порожньо — fallback `${category.name} — категорія, Львів`.
- **D-10-03:** Міграція **не ламає** існуючі рядки — поле nullable, без backfill у міграції (seed може заповнити окремо).

#### Storefront homepage (HOME-01)
- **D-10-04:** `CategoryGrid` — картка з **image area** aspect **4:3** (як product card), назва **під** зображенням, title в `CardHeader` — мінімальний diff від поточного layout.
- **D-10-05:** Якщо `imagePublicId` є — `OptimizedImage` / `CldImage` з `sizes="(max-width: 768px) 50vw, 25vw"` для grid 2/4 cols.
- **D-10-06:** Якщо немає — placeholder: `bg-muted` + іконка/текст **«Без фото»** (як product card без image).
- **D-10-07:** Grid, порядок, лінки — **без змін** (`sortOrder`, `/katalog/${slug}`).

#### Admin upload (HOME-02)
- **D-10-08:** Новий client компонент **`CategoryImageUpload`** (аналог `product-image-upload.tsx`): **single** image, `maxFiles: 1`, `signatureEndpoint="/api/upload/sign"`.
- **D-10-09:** Server action **`updateCategoryImageAction`** (або розширити `updateCategoryAction`) — `requireAdmin`, Zod `{ categoryId, imagePublicId: string | null, imageAlt?: string }`, persist через `admin-catalog.service`.
- **D-10-10:** UI на edit page **під** `CategoryForm` або в окремій секції **«Зображення категорії»** з preview + «Завантажити» + «Прибрати фото».
- **D-10-11:** Після збереження image — `revalidatePath("/")`, `revalidatePath("/admin/kategorii")`, `revalidatePath(`/katalog/${slug}`)` (розширити `revalidateCategoryPaths`).

#### Seed / dev data
- **D-10-12:** Опційно в `seed` / `ensureCategorySeedImage` — записати `imagePublicId` на Category з існуючого pool public_id **лише якщо** поле null (не перезаписувати admin upload).

#### Verification
- **D-10-13:** Vitest: validator для image fields; service/action happy path + clear image.
- **D-10-14:** Manual checklist: upload → homepage card shows image → remove → placeholder; існуючі категорії без image — placeholder only.

### Claude's Discretion
- Чи об'єднати image upload у `CategoryForm` vs окремий блок — головне D-10-10.
- Точний placeholder (Lucide `ImageIcon` vs текст).
- Чи показувати thumbnail у `/admin/kategorii` list table (nice-to-have, не в success criteria).

### Deferred Ideas (OUT OF SCOPE)
- Category hero/banner on `/katalog/[slug]`
- Multiple images per category
- Admin list column with thumbnails
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HOME-01 | Картки категорій на головній показують зображення категорії | Extend `CategoryGrid` with 4:3 `OptimizedImage` + placeholder; Prisma `imagePublicId` on `findMany`; revalidate `/` on admin save |
| HOME-02 | Адмін завантажує/змінює зображення категорії через існуючий signed Cloudinary flow | Clone `ProductImageUpload` → `CategoryImageUpload`; reuse `POST /api/upload/sign`; new `updateCategoryImageAction` + service |
</phase_requirements>

## Summary

Phase 10 — це **вертикальний шар поверх уже зібраного Cloudinary-стеку** (фаза 04): нові nullable-поля на `Category`, візуальне розширення `CategoryGrid`, і одиночний admin uploader за зразком `ProductImageUpload`. **Жодних нових npm-пакетів не потрібно** — `next-cloudinary@6.17.5`, `cloudinary@2.10.0`, `/api/upload/sign`, `OptimizedImage` уже в продакшн-патерні проєкту.

Головний технічний ризик — не upload, а **cache/revalidation**: `revalidateCategoryPaths` сьогодні **не** викликає `revalidatePath("/")`, тож після зміни фото головна може лишитись stale до наступного deploy. Це явно закрито в D-10-11.

Другий нюанс — **іменування поля**: `ProductImage.cloudinaryPublicId` vs locked `Category.imagePublicId`. Це свідомий вибір CONTEXT; planner не повинен перейменовувати на `cloudinaryPublicId` без зміни locked decision.

Seed-інфраструктура (`ensureCategorySeedImage`, public_id `appliance-store/seed/{slug}/{index}`) вже завантажує картинки в Cloudinary для **товарів**; D-10-12 дозволяє опційно прописати **перший** pool id на `Category` лише коли `imagePublicId IS NULL`.

**Primary recommendation:** Prisma migration → `updateCategoryImage` service + action → `CategoryImageUpload` + homepage grid — копіювати product-image flow один-в-один, з `maxFiles: 1` і `revalidatePath("/")`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Category image persistence | API / Backend (Prisma + Server Action) | — | `public_id` — source of truth у Postgres; не localStorage |
| Signed upload authorization | API Route Handler (`/api/upload/sign`) | — | Secret лише на сервері; widget робить `fetch` |
| Upload UI + preview | Browser (client component) | Server Action (persist) | `CldUploadWidget` — client-only |
| Homepage category cards | Frontend Server (RSC `CategoryGrid`) | CDN (Cloudinary via `CldImage`) | `findMany` на сервері; delivery через `OptimizedImage` |
| Image transforms / CDN | CDN (Cloudinary) | — | `f_auto`, `q_auto` у `OptimizedImage` |
| Dev seed images | Build/script (`prisma/seed`) | Cloudinary API | Опційно; не в runtime path |

## Standard Stack

### Core (already installed — no new installs)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **next-cloudinary** | **6.17.5** [VERIFIED: npm registry] | `CldUploadWidget`, `CldImage` | Signed widget + delivery; вже на product admin |
| **cloudinary** | **2.10.0** [VERIFIED: npm registry] | `api_sign_request` | Sign route вже використовує |
| **Prisma** | **7.8.0** | `Category.imagePublicId`, migration | Єдиний ORM проєкту |
| **Zod** | **4.4.3** | `updateCategoryImageSchema` | Патерн як `saveProductImagesSchema` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **lucide-react** | ^1.16.0 | Placeholder icon (discretion) | Якщо не лише текст «Без фото» |
| **Vitest** | **4.1.6** | Validator + service tests | D-10-13 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `Category.imagePublicId` (scalar) | `CategoryImage` join table | Overkill — locked single image per category |
| Extend `updateCategoryAction` | Dedicated `updateCategoryImageAction` | Окремий action чистіший (upload не чіпає slug/name) — **рекомендовано** |
| Raw `<input type="file">` | `CldUploadWidget` | Втрата signed upload, progress, validation — **заборонено** (Don't Hand-Roll) |

**Installation:** None required for this phase.

## Package Legitimacy Audit

> No new packages. Existing stack re-verified 2026-05-17.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| next-cloudinary@6.17.5 | npm | mature | high | github.com/cloudinary-community/next-cloudinary | not run | Approved (pre-installed) |
| cloudinary@2.10.0 | npm | mature | high | github.com/cloudinary/cloudinary_npm | not run | Approved (pre-installed) |

**Packages removed due to slopcheck [SLOP] verdict:** none  
**Packages flagged as suspicious [SUS]:** none  

*slopcheck unavailable at research time — no new installs; existing packages treated as team-approved from Phase 04.*

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Admin browser (/admin/kategorii/[id])                                    │
│   CategoryImageUpload (client)                                           │
│     CldUploadWidget ──POST paramsToSign──► /api/upload/sign (admin JWT) │
│     onSuccess(public_id) ──► updateCategoryImageAction                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Server: requireAdmin → Zod → admin-catalog.updateCategoryImage           │
│   prisma.category.update({ imagePublicId, imageAlt })                    │
│   revalidatePath("/", "/admin/kategorii", "/katalog/{slug}")             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Storefront RSC: CategoryGrid (server)                                    │
│   prisma.category.findMany → map cards                                   │
│   imagePublicId? OptimizedImage(src) : placeholder «Без фото»            │
│   Link → /katalog/{slug} (unchanged)                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                         Cloudinary CDN (CldImage f_auto,q_auto)
```

### Recommended Project Structure

```
prisma/
  schema.prisma              # + imagePublicId, imageAlt on Category
  migrations/                # new migration
  seed.ts or seed-categories # optional D-10-12 backfill

src/
  components/
    admin/category-image-upload.tsx   # NEW (mirror product-image-upload)
    home/category-grid.tsx            # MODIFY image area + OptimizedImage
  server/
    validators/category.ts            # + updateCategoryImageSchema
    validators/category.test.ts       # + image field tests
    services/admin-catalog.service.ts # + updateCategoryImage()
    services/admin-catalog.service.test.ts  # NEW or extend
    actions/admin/category.actions.ts # + updateCategoryImageAction, fix revalidate
  app/(admin)/admin/kategorii/[id]/page.tsx  # wire CategoryImageUpload
```

### Pattern 1: Single-image signed upload (from ProductImageUpload)

**What:** `CldUploadWidget` with `signatureEndpoint="/api/upload/sign"`, `maxFiles: 1`, persist `public_id` via Server Action immediately on success.

**When to use:** HOME-02 admin category image.

**Example:**

```tsx
// Source: https://github.com/cloudinary-community/next-cloudinary/blob/main/docs/pages/clduploadwidget/signed-uploads.mdx
// Project reference: src/components/admin/product-image-upload.tsx

<CldUploadWidget
  signatureEndpoint="/api/upload/sign"
  options={{ multiple: false, maxFiles: 1, sources: ["local"] }}
  onSuccess={handleUploadSuccess}
>
  {({ open }) => (
    <Button type="button" onClick={() => open()}>Завантажити</Button>
  )}
</CldUploadWidget>
```

### Pattern 2: Storefront delivery (from ProductCard)

**What:** `aspect-[4/3]` container + `OptimizedImage` with `fill`, `object-cover`, responsive `sizes`.

**When to use:** HOME-01 CategoryGrid cards.

**Example:**

```tsx
// Source: src/components/catalog/product-card.tsx (project)
<div className="relative aspect-[4/3] min-h-48 w-full bg-muted">
  {category.imagePublicId ? (
    <OptimizedImage
      src={category.imagePublicId}
      alt={category.imageAlt ?? `${category.name} — категорія, Львів`}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 50vw, 25vw"
    />
  ) : (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Без фото
    </div>
  )}
</div>
```

### Pattern 3: Revalidation after image change

**What:** Extend `revalidateCategoryPaths` to include homepage.

```typescript
// Project: src/server/actions/admin/category.actions.ts — extend
function revalidateCategoryPaths(slug?: string) {
  revalidatePath("/"); // D-10-11 — currently MISSING
  revalidatePath("/admin/kategorii");
  revalidatePath("/katalog");
  if (slug) revalidatePath(`/katalog/${slug}`);
}
```

### Anti-Patterns to Avoid

- **Змішувати image у `updateCategorySchema`:** форма категорії і upload мають різний lifecycle; окремий action простіше тестувати.
- **Server Action як signature endpoint:** widget потребує HTTP Route Handler [CITED: next-cloudinary signed uploads].
- **Видаляти asset з Cloudinary при «Прибрати фото»:** product flow лише null у БД — той самий підхід для категорії.
- **Backfill у SQL migration:** D-10-03 — лише nullable columns; seed окремо.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Admin file upload to Cloudinary | Custom multipart → Cloudinary API | `CldUploadWidget` + `/api/upload/sign` | Signing, progress, MIME — вже зроблено Phase 04 |
| Upload signature | Client-side secret / unsigned preset | `signUploadParams` + `assertAdminApi` | Secret never in browser |
| Responsive CDN URLs | Manual `res.cloudinary.com/...` strings | `OptimizedImage` (`CldImage`) | `f_auto`, `q_auto`, `sizes` |
| Image field validation | Ad-hoc checks | Zod schema (mirror `productImageInputSchema`) | Consistent errors, Vitest |

**Key insight:** Phase 10 — data model + UI wiring, не новий media pipeline.

## Codebase Patterns

### Current state (verified in repo)

| File | State | Phase 10 change |
|------|-------|-----------------|
| `prisma/schema.prisma` `Category` | No image fields | Add `imagePublicId String?`, `imageAlt String?` |
| `src/components/home/category-grid.tsx` | Text-only `CardHeader` | Add 4:3 image block above header; select new fields |
| `src/components/admin/product-image-upload.tsx` | Multi (max 8), auto-persist | Template for `CategoryImageUpload` (max 1) |
| `src/app/api/upload/sign/route.ts` | Admin-only sign | **No change** |
| `src/components/media/optimized-image.tsx` | `CldImage` wrapper | **No change** |
| `src/server/actions/admin/category.actions.ts` | CRUD + `revalidateCategoryPaths` | Add image action; add `revalidatePath("/")` |
| `prisma/seed-cloudinary.ts` | `ensureCategorySeedImage(slug, index)` | Optional: write to `Category.imagePublicId` when null |

### Naming convention note

- **Product:** `ProductImage.cloudinaryPublicId` (relation table).
- **Category (locked):** `Category.imagePublicId` scalar.
- Widget `onSuccess` returns `info.public_id` — map to `imagePublicId` in action input.

### Validator sketch (for planner)

```typescript
// Mirror saveProductImagesSchema shape — single scalar
export const updateCategoryImageSchema = z.object({
  categoryId: z.string().cuid("Невірний ідентифікатор категорії"),
  imagePublicId: z
    .union([z.string().trim().min(1, "Невірний ідентифікатор зображення"), z.null()])
    .optional()
    .transform((v) => v ?? null),
  imageAlt: z.union([z.string().trim().max(200), z.literal("")]).optional(),
});
```

### Service sketch

```typescript
export async function updateCategoryImage(input: {
  categoryId: string;
  imagePublicId: string | null;
  imageAlt?: string;
}) {
  const existing = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!existing) throw new Error(CATEGORY_NOT_FOUND);
  return prisma.category.update({
    where: { id: input.categoryId },
    data: {
      imagePublicId: input.imagePublicId,
      imageAlt: input.imageAlt === "" ? null : input.imageAlt ?? undefined,
    },
  });
}
```

### Seed hook (D-10-12, optional)

After `seedCategories()` or in dedicated helper:

```typescript
const publicId = await ensureCategorySeedImage(category.slug, 0);
await prisma.category.updateMany({
  where: { slug: category.slug, imagePublicId: null },
  data: { imagePublicId: publicId },
});
```

Uses existing pool `appliance-store/seed/{slug}/0` — same assets already uploaded for product seeding.

### Project Constraints (from .cursor/rules/)

- **Stack:** Next.js App Router, Prisma, Cloudinary via `next-cloudinary`, signed admin uploads only.
- **Locale:** UI українською.
- **Security:** `CLOUDINARY_API_SECRET` server-only; `assertAdminApi` for sign route.
- **No hand-rolled upload:** Use `CldUploadWidget` + sign route.

## Common Pitfalls

### Pitfall 1: Stale homepage after admin upload
**What goes wrong:** Category image оновлено в БД, але головна показує старий RSC cache.  
**Why it happens:** `revalidateCategoryPaths` не включає `/`.  
**How to avoid:** D-10-11 — `revalidatePath("/")` у image action (і бажано у всіх category mutations для консистентності).  
**Warning signs:** Upload OK на admin, hard refresh homepage не допомагає без revalidate.

### Pitfall 2: Field name drift (`cloudinaryPublicId` vs `imagePublicId`)
**What goes wrong:** Prisma/Zod/UI використовують різні імена — runtime undefined src.  
**How to avoid:** Locked `imagePublicId` на Category; map widget `public_id` → `imagePublicId` в action.  
**Warning signs:** `OptimizedImage` з `src={undefined}`.

### Pitfall 3: Upload widget without public env keys
**What goes wrong:** Runtime throw на admin page.  
**How to avoid:** Copy `isUploadWidgetConfigured()` guard from `ProductImageUpload`.  
**Warning signs:** Blank admin section or client error (fixed in Phase 04-05 for products).

### Pitfall 4: Overwriting admin images in seed
**What goes wrong:** `pnpm prisma db seed` скидає custom category photos.  
**How to avoid:** `updateMany` / `upsert` з `where: { imagePublicId: null }` only (D-10-12).

### Pitfall 5: Breaking card layout / a11y
**What goes wrong:** Title-only link без опису зображення.  
**How to avoid:** Meaningful `alt` (D-10-02 fallback); keep outer `Link` wrapping card; `aria-label` on link if needed (mirror product card pattern).

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test -- src/server/validators/category.test.ts -x` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| HOME-01 | Grid renders with/without imagePublicId | unit (validator/select shape) | `npm test -- src/server/validators/category.test.ts -x` | ❌ Wave 0 — extend |
| HOME-02 | updateCategoryImage persists + clears null | unit (service) | `npm test -- src/server/services/admin-catalog.service.test.ts -x` | ❌ Wave 0 — add cases |
| HOME-02 | Zod rejects invalid categoryId / empty public id when string | unit | same validator file | ❌ Wave 0 |
| HOME-01/02 | E2E upload → homepage | manual | D-10-14 checklist | ❌ manual only |

### Sampling Rate

- **Per task commit:** `npm test -- src/server/validators/category.test.ts src/server/services/admin-catalog.service.test.ts -x`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green + D-10-14 manual checklist

### Wave 0 Gaps

- [ ] `updateCategoryImageSchema` + tests in `src/server/validators/category.test.ts`
- [ ] `updateCategoryImage` tests in `admin-catalog.service.test.ts` (create file if missing — pattern from `admin-product.service.test.ts`)
- [ ] `10-MANUAL-CHECKLIST.md` (optional but aligns with D-10-14; planner may add)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes | `requireAdmin` on Server Action |
| V4 Access Control | yes | `assertAdminApi` on `/api/upload/sign` (401 JSON, not redirect) |
| V5 Input Validation | yes | Zod `updateCategoryImageSchema` |
| V6 Cryptography | yes | HMAC sign via `cloudinary.utils.api_sign_request`; secret server-only |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unsigned public upload | Spoofing | Signed uploads only; admin-gated sign route |
| Secret in client bundle | Information disclosure | `CLOUDINARY_API_SECRET` never `NEXT_PUBLIC_*` |
| IDOR on category image update | Elevation | `requireAdmin` + validate `categoryId` exists |
| XSS via alt text | Tampering | Zod max length; React escapes text nodes |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build/test | ✓ | v24.14.0 | — |
| npm | scripts | ✓ | (with nvm) | — |
| PostgreSQL (Neon/local) | Prisma migration | ✓ (`.env` exists) | — | — |
| Cloudinary account | upload + delivery | ✓ (project uses since Phase 04) | — | Alert in UI if keys missing |
| `NEXT_PUBLIC_CLOUDINARY_*` + secrets | widget + sign | assumed from `.env` | — | `isUploadWidgetConfigured()` guard |

**Missing dependencies with no fallback:** none identified for implementation (runtime needs DB + Cloudinary for full manual UAT).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Category cards text-only | Image + placeholder | Phase 10 | HOME-01 |
| No category media in admin | `CategoryImageUpload` | Phase 10 | HOME-02 |
| Seed images only on products | Optional Category.imagePublicId from pool | Phase 10 optional | Dev UX |

**Deprecated/outdated:** None — reuse Phase 04 upload architecture as-is.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `revalidatePath("/")` достатньо для оновлення `CategoryGrid` на головній | Architecture | May need `revalidateTag` if homepage later uses `unstable_cache` with tags |
| A2 | Не видаляти Cloudinary asset при clear (як products) | Don't Hand-Roll | Orphan assets in Cloudinary dashboard |
| A3 | `ensureCategorySeedImage(slug, 0)` — правильний pool index для category showcase | Seed | Wrong image per category if index should differ |

## Open Questions

1. **Окремий action vs розширення `updateCategoryAction`**
   - What we know: CONTEXT allows either; product uses dedicated `saveProductImagesAction`.
   - Recommendation: **Dedicated `updateCategoryImageAction`** — cleaner tests, no form coupling.

2. **Placeholder: icon vs text only**
   - Discretion per CONTEXT; product uses text «Без фото» only.
   - Recommendation: **Text only** for consistency with `ProductCard`.

3. **Чи додавати `revalidatePath("/")` до існуючих `createCategoryAction` / `updateCategoryAction`**
   - Not in success criteria, but prevents stale grid when renaming categories.
   - Recommendation: **Yes** as small follow-up in same plan wave (one-line in `revalidateCategoryPaths`).

4. **UI-SPEC for Phase 10**
   - `workflow.ui_phase: true` in config; no `10-UI-SPEC.md` yet.
   - Recommendation: Planner runs `/gsd-ui-phase 10` or embeds 02-UI-SPEC 4:3 contract inline in PLAN.

## Sources

### Primary (HIGH confidence)
- Project: `10-CONTEXT.md`, `04-RESEARCH.md`, `src/components/admin/product-image-upload.tsx`, `src/app/api/upload/sign/route.ts`
- [next-cloudinary signed uploads](https://github.com/cloudinary-community/next-cloudinary/blob/main/docs/pages/clduploadwidget/signed-uploads.mdx) [CITED]
- `npm view next-cloudinary version` → 6.17.5; `cloudinary` → 2.10.0 [VERIFIED: npm registry]

### Secondary (MEDIUM confidence)
- `.planning/phases/04-admin-operations/04-RESEARCH.md` — architecture parity
- `.planning/phases/02-catalog-discovery/02-UI-SPEC.md` — 4:3 product card contract

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new deps; versions verified
- Architecture: HIGH — copy proven product/category admin patterns
- Pitfalls: HIGH — revalidate gap confirmed in `category.actions.ts` source

**Research date:** 2026-05-17  
**Valid until:** 2026-06-17 (stable stack)

---

## RESEARCH COMPLETE

**Phase:** 10 - Category Showcase Images  
**Confidence:** HIGH

### Key Findings

- **Zero new packages** — reuse `next-cloudinary`, existing sign route, `OptimizedImage`.
- **Schema gap:** `Category` has no image fields; add nullable `imagePublicId` + optional `imageAlt`.
- **Copy `ProductImageUpload`** → single-file `CategoryImageUpload` + `updateCategoryImageAction`.
- **Critical fix:** add `revalidatePath("/")` to category revalidation (currently missing).
- **Seed:** `ensureCategorySeedImage` can backfill Category when `imagePublicId` is null only.

### File Created

`.planning/phases/10-category-showcase-images/10-RESEARCH.md`

### Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | HIGH | Installed + verified versions |
| Architecture | HIGH | Phase 04 pattern in production code |
| Pitfalls | HIGH | Source-audited revalidate + naming |

### Ready for Planning

Research complete. Planner can create PLAN.md via `/gsd-plan-phase 10`.
