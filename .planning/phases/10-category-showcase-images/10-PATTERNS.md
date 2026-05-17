# Phase 10 — Pattern Map

**Phase:** 10 — Category Showcase Images  
**Generated:** 2026-05-17

## File → Analog Map

| New / Modified File | Role | Closest Analog | Excerpt / Pattern |
|---------------------|------|----------------|-------------------|
| `prisma/schema.prisma` (Category) | Schema | `ProductImage` fields on Product | Add nullable `imagePublicId`, `imageAlt` on `Category` |
| `src/server/validators/category.ts` | Validation | `admin-product.ts` image Zod | `z.string().min(1)` for public_id; `z.null()` to clear |
| `src/server/services/admin-catalog.service.ts` | Service | `saveProductImages` flow in `admin-product.service.ts` | `update` where id exists; throw `CATEGORY_NOT_FOUND` |
| `src/server/actions/admin/category.actions.ts` | Action + cache | `product.actions.ts` `saveProductImagesAction` | `requireAdmin` → parse → service → `revalidatePath("/")` |
| `src/components/admin/category-image-upload.tsx` | Client upload | `product-image-upload.tsx` | `CldUploadWidget`, `signatureEndpoint="/api/upload/sign"`, `maxFiles: 1` |
| `src/components/home/category-grid.tsx` | Storefront RSC | `product-card.tsx` image block | `aspect-[4/3]`, `OptimizedImage`, placeholder «Без фото» |
| `src/app/(admin)/admin/kategorii/[id]/page.tsx` | Page compose | `admin/tovary/[id]` with `ProductImageUpload` | Pass `imagePublicId`, `imageAlt` to uploader below form |

## Data Flow

```
Admin CldUploadWidget → POST /api/upload/sign → Cloudinary
  → onSuccess public_id → updateCategoryImageAction → Prisma Category.imagePublicId
  → revalidatePath("/") → CategoryGrid RSC reads field → OptimizedImage CDN URL
```

## Do Not Diverge

- Field name **`imagePublicId`** on Category (not `cloudinaryPublicId`) — locked D-10-01
- Do not delete Cloudinary asset on clear (match product behavior)
- Do not add merge/localStorage for category images

## PATTERN MAPPING COMPLETE
