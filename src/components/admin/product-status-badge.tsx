import type { ProductStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<ProductStatus, string> = {
  AVAILABLE: "В наявності",
  SOLD: "Продано",
  DRAFT: "Чернетка",
};

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
    <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABELS[status]}</Badge>
  );
}
