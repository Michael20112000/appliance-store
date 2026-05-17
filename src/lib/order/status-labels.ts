import type { OrderStatus } from "@/generated/prisma/client";

export const ORDER_STATUS_LABELS_UA: Record<OrderStatus, string> = {
  PENDING: "Нове",
  CONFIRMED: "Підтверджено",
  READY_FOR_PICKUP: "Готово до самовивозу",
  OUT_FOR_DELIVERY: "Доставляється",
  COMPLETED: "Виконано",
  CANCELLED: "Скасовано",
};
