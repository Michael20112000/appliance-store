import type { OrderStatus } from "@/generated/prisma/client";

const STATUS_ACCENT_CLASSES: Record<OrderStatus, string> = {
  PENDING:
    "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
  CONFIRMED:
    "bg-sky-50 border-sky-200 dark:bg-sky-950/30 dark:border-sky-800",
  READY_FOR_PICKUP:
    "bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800",
  OUT_FOR_DELIVERY:
    "bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800",
  COMPLETED:
    "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
  CANCELLED:
    "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
};

export function getOrderStatusAccentClass(status: OrderStatus): string {
  return STATUS_ACCENT_CLASSES[status];
}
