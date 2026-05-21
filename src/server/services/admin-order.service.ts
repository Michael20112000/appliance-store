import { Prisma } from "@/generated/prisma/client";
import type { OrderStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  assertTransitionAllowed,
  assertTransitionAllowedForDelivery,
  getAllowedNextStatuses,
  getAllowedNextStatusesForDelivery,
  INVALID_STATUS_TRANSITION,
} from "@/lib/order/status-transitions";
import { ORDER_STATUS_LABELS_UA } from "@/lib/order/status-labels";
import type {
  AdminOrderListDir,
  AdminOrderListSort,
  ListOrdersAdminParams,
} from "@/server/validators/admin-order";
import type { OrderDetailDto, OrderSummaryDto } from "@/types/order";
import {
  INSUFFICIENT_STOCK,
  releaseProductUnitsForOrder,
  reserveProductUnitsForOrder,
  shouldReleaseInventoryOnTransition,
  shouldReserveInventoryOnTransition,
} from "@/server/services/product-inventory";

export type { AdminOrderListDir, AdminOrderListSort };

export { ORDER_STATUS_LABELS_UA };

export {
  assertTransitionAllowed,
  assertTransitionAllowedForDelivery,
  getAllowedNextStatuses,
  getAllowedNextStatusesForDelivery,
  INVALID_STATUS_TRANSITION,
};
export const ORDER_NOT_FOUND = "ORDER_NOT_FOUND";

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

export { INSUFFICIENT_STOCK };
export {
  shouldReleaseInventoryOnTransition,
  shouldReserveInventoryOnTransition,
} from "@/server/services/product-inventory";

export function buildOrderWhere(
  filter: AdminOrderListFilter,
): Prisma.OrderWhereInput {
  const statuses =
    filter === "all" ? undefined : [...FILTER_STATUS_MAP[filter]];
  return statuses ? { status: { in: statuses } } : {};
}

export function buildPrismaOrderBy(
  sort: AdminOrderListSort,
  dir: AdminOrderListDir,
): Prisma.OrderOrderByWithRelationInput {
  switch (sort) {
    case "orderNumber":
      return { orderNumber: dir };
    case "status":
      return { status: dir };
    case "createdAt":
    default:
      return { createdAt: dir };
  }
}

export function computeTotalPages(total: number, pageSize: number): number {
  if (total === 0) return 1;
  return Math.ceil(total / pageSize);
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
  const [pendingOrders, inStockProducts, outOfStockProducts, recentOrders] =
    await Promise.all([
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { quantity: { gte: 1 } } }),
      prisma.product.count({ where: { quantity: 0 } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
    ]);

  return {
    pendingOrders,
    inStockProducts,
    outOfStockProducts,
    recentOrders: recentOrders.map(mapOrderSummary),
  };
}

export async function countOrdersAdmin(
  filter: AdminOrderListFilter,
): Promise<number> {
  return prisma.order.count({ where: buildOrderWhere(filter) });
}

export type AdminOrderFilterCounts = Record<AdminOrderListFilter, number>;

const ORDER_FILTER_KEYS: readonly AdminOrderListFilter[] = [
  "all",
  "new",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export async function getOrderFilterCounts(): Promise<AdminOrderFilterCounts> {
  const counts = await Promise.all(
    ORDER_FILTER_KEYS.map((filter) => countOrdersAdmin(filter)),
  );

  return ORDER_FILTER_KEYS.reduce((acc, filter, index) => {
    acc[filter] = counts[index] ?? 0;
    return acc;
  }, {} as AdminOrderFilterCounts);
}

async function fetchOrderIdsByTotalKopiyky(
  filter: AdminOrderListFilter,
  dir: AdminOrderListDir,
  skip: number,
  take: number,
): Promise<string[]> {
  const statuses =
    filter === "all" ? undefined : [...FILTER_STATUS_MAP[filter]];
  const orderDirection = dir === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`;

  const rows =
    statuses == null
      ? await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT o.id
          FROM "Order" o
          LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
          GROUP BY o.id
          ORDER BY COALESCE(SUM(oi."priceSnapshot" * oi.quantity), 0) ${orderDirection}
          OFFSET ${skip}
          LIMIT ${take}
        `
      : await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT o.id
          FROM "Order" o
          LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
          WHERE o.status IN (${Prisma.join(statuses)})
          GROUP BY o.id
          ORDER BY COALESCE(SUM(oi."priceSnapshot" * oi.quantity), 0) ${orderDirection}
          OFFSET ${skip}
          LIMIT ${take}
        `;

  return rows.map((row) => row.id);
}

async function fetchOrdersPreservingIdOrder(
  ids: string[],
): Promise<AdminOrderSummaryDto[]> {
  if (ids.length === 0) return [];

  const orders = await prisma.order.findMany({
    where: { id: { in: ids } },
    include: { items: true },
  });

  const byId = new Map(orders.map((order) => [order.id, order]));
  return ids
    .map((id) => byId.get(id))
    .filter((order): order is NonNullable<typeof order> => order != null)
    .map(mapOrderSummary);
}

export async function listOrdersAdminPaginated(params: ListOrdersAdminParams) {
  const where = buildOrderWhere(params.filter);
  const skip = (params.page - 1) * params.pageSize;

  const total = await countOrdersAdmin(params.filter);
  const totalPages = computeTotalPages(total, params.pageSize);

  if (params.sort === "totalKopiyky") {
    const ids = await fetchOrderIdsByTotalKopiyky(
      params.filter,
      params.dir,
      skip,
      params.pageSize,
    );
    const items = await fetchOrdersPreservingIdOrder(ids);
    return {
      items,
      total,
      page: params.page,
      pageSize: params.pageSize,
      totalPages,
    };
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: buildPrismaOrderBy(params.sort, params.dir),
    skip,
    take: params.pageSize,
    include: { items: true },
  });

  return {
    items: orders.map(mapOrderSummary),
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages,
  };
}

export async function listAllOrders(
  filter: AdminOrderListFilter = "all",
): Promise<AdminOrderSummaryDto[]> {
  const orders = await prisma.order.findMany({
    where: buildOrderWhere(filter),
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

    assertTransitionAllowedForDelivery(
      order.status,
      newStatus,
      order.deliveryType,
    );

    if (shouldReserveInventoryOnTransition(order.status, newStatus)) {
      await reserveProductUnitsForOrder(tx, order.items);
    }

    if (shouldReleaseInventoryOnTransition(order.status, newStatus)) {
      await releaseProductUnitsForOrder(tx, order.items);
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    return { orderNumber: order.orderNumber };
  });
}
