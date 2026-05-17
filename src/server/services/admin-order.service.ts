import type { OrderStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { ORDER_STATUS_LABELS_UA } from "@/lib/order/status-labels";
import type { OrderDetailDto, OrderSummaryDto } from "@/types/order";

export { ORDER_STATUS_LABELS_UA };

export const INVALID_STATUS_TRANSITION = "INVALID_STATUS_TRANSITION";
export const ORDER_NOT_FOUND = "ORDER_NOT_FOUND";

const ALLOWED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "CANCELLED"],
  READY_FOR_PICKUP: ["COMPLETED", "CANCELLED"],
  OUT_FOR_DELIVERY: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export type AdminOrderListFilter =
  | "all"
  | "new"
  | "in_progress"
  | "completed"
  | "cancelled";

const FILTER_STATUS_MAP: Record<
  Exclude<AdminOrderListFilter, "all">,
  readonly OrderStatus[]
> = {
  new: ["PENDING"],
  in_progress: ["CONFIRMED", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY"],
  completed: ["COMPLETED"],
  cancelled: ["CANCELLED"],
};

export type AdminOrderSummaryDto = OrderSummaryDto & {
  customerName: string;
  customerPhone: string;
};

export type AdminOrderDetailDto = OrderDetailDto & {
  id: string;
};

export function assertTransitionAllowed(
  from: OrderStatus,
  to: OrderStatus,
): void {
  if (from === to) return;
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new Error(INVALID_STATUS_TRANSITION);
  }
}

export function getAllowedNextStatuses(from: OrderStatus): OrderStatus[] {
  return [...ALLOWED_TRANSITIONS[from]];
}

export function getProductIdsForCancelRevert(
  items: Array<{ productId: string | null }>,
): string[] {
  return items
    .map((item) => item.productId)
    .filter((id): id is string => id != null);
}

function mapOrderSummary(
  order: Prisma.OrderGetPayload<{ include: { items: true } }>,
): AdminOrderSummaryDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    deliveryType: order.deliveryType,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    totalKopiyky: order.items.reduce(
      (sum, item) => sum + item.priceSnapshot * item.quantity,
      0,
    ),
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: order.createdAt,
  };
}

function mapOrderDetail(
  order: Prisma.OrderGetPayload<{ include: { items: true } }>,
): AdminOrderDetailDto {
  const summary = mapOrderSummary(order);
  return {
    ...summary,
    deliveryAddress: order.deliveryAddress,
    notes: order.notes,
    items: order.items.map((item) => ({
      titleSnapshot: item.titleSnapshot,
      priceSnapshot: item.priceSnapshot,
      quantity: item.quantity,
    })),
  };
}

export async function getAdminDashboardStats() {
  const [pendingOrders, availableProducts, draftProducts, recentOrders] =
    await Promise.all([
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { status: "AVAILABLE" } }),
      prisma.product.count({ where: { status: "DRAFT" } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
    ]);

  return {
    pendingOrders,
    availableProducts,
    draftProducts,
    recentOrders: recentOrders.map(mapOrderSummary),
  };
}

export async function listAllOrders(
  filter: AdminOrderListFilter = "all",
): Promise<AdminOrderSummaryDto[]> {
  const statuses =
    filter === "all" ? undefined : [...FILTER_STATUS_MAP[filter]];

  const orders = await prisma.order.findMany({
    where: statuses ? { status: { in: statuses } } : undefined,
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return orders.map(mapOrderSummary);
}

export async function getOrderAdmin(
  orderNumber: string,
): Promise<AdminOrderDetailDto | null> {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) return null;
  return mapOrderDetail(order);
}

export async function revertSoldProductsOnCancel(
  tx: Prisma.TransactionClient,
  items: Array<{ productId: string | null }>,
): Promise<void> {
  for (const productId of getProductIdsForCancelRevert(items)) {
    await tx.product.updateMany({
      where: { id: productId, status: "SOLD" },
      data: { status: "AVAILABLE" },
    });
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
): Promise<{ orderNumber: string }> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error(ORDER_NOT_FOUND);
    }

    assertTransitionAllowed(order.status, newStatus);

    if (newStatus === "CANCELLED") {
      await revertSoldProductsOnCancel(tx, order.items);
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    return { orderNumber: order.orderNumber };
  });
}
