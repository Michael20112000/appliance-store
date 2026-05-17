import type { DeliveryType, OrderStatus } from "@/generated/prisma/client";

export type OrderSummaryDto = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  totalKopiyky: number;
  itemCount: number;
  createdAt: Date;
};

export type OrderDetailDto = OrderSummaryDto & {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string | null;
  notes: string | null;
  items: Array<{
    titleSnapshot: string;
    priceSnapshot: number;
    quantity: number;
  }>;
};
