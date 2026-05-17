import type { OrderStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS_UA } from "@/lib/order/status-labels";

const STATUS_VARIANT: Record<
  OrderStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  READY_FOR_PICKUP: "outline",
  OUT_FOR_DELIVERY: "outline",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
};

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {ORDER_STATUS_LABELS_UA[status]}
    </Badge>
  );
}
