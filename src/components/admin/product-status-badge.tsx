import type { ProductStatus } from "@/generated/prisma/client";
import { PRODUCT_STATUS_LABELS } from "@/lib/admin/product-status-labels";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<
  ProductStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  AVAILABLE: "default",
  SOLD: "secondary",
  DRAFT: "outline",
};

type ProductStatusBadgeProps = {
  status: ProductStatus;
};

export function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {PRODUCT_STATUS_LABELS[status]}
    </Badge>
  );
}
