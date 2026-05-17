---
phase: 02-catalog-discovery
plan: 01
status: complete
---

# Plan 02-01 Summary

## Delivered

- Product, ProductImage, ProductCondition, ProductStatus in Prisma + migration `catalog_products`
- `catalog.service` with AVAILABLE-only public scope (CAT-07)
- `seed-products.ts` — 32 AVAILABLE + 2 SOLD + 1 DRAFT demo rows
- Unit tests for `buildPublicProductWhere`

## Notes

- Human-verify checkpoint: nuqs + schema-dts approved for later waves (02-04, 02-06)
- Price stored in kopiyky; images use `SEED_CLOUDINARY_PUBLIC_IDS` or `HERO_PUBLIC_ID` fallback
