-- DropProductStatus: availability is quantity-only (BUG-14/15 wave 2)

DROP INDEX IF EXISTS "Product_status_categoryId_idx";
DROP INDEX IF EXISTS "Product_status_brand_idx";
DROP INDEX IF EXISTS "Product_status_price_idx";
DROP INDEX IF EXISTS "Product_status_condition_idx";
DROP INDEX IF EXISTS "Product_status_createdAt_idx";

ALTER TABLE "Product" DROP COLUMN "status";

DROP TYPE "ProductStatus";

CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_brand_idx" ON "Product"("brand");
CREATE INDEX "Product_price_idx" ON "Product"("price");
CREATE INDEX "Product_condition_idx" ON "Product"("condition");
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");
CREATE INDEX "Product_quantity_idx" ON "Product"("quantity");
