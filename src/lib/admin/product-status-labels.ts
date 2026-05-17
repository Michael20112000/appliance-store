import type { ProductStatus } from "@/generated/prisma/client";

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  AVAILABLE: "В наявності",
  SOLD: "Продано",
  DRAFT: "Чернетка",
};
