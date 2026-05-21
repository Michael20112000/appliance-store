import { prisma } from "@/lib/db";
import { countUnreadForAdmin } from "@/server/services/chat.service";

export type AdminSidebarBadgeCounts = {
  categories: number;
  products: number;
  pendingOrders: number;
  unreadChats: number;
  unresolvedCallbacks: number;
};

export async function getAdminSidebarCounts(): Promise<AdminSidebarBadgeCounts> {
  const [categories, products, pendingOrders, unreadChats, unresolvedCallbacks] =
    await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      countUnreadForAdmin(),
      prisma.callbackRequest.count({ where: { status: "PENDING", archivedAt: null } }),
    ]);

  return { categories, products, pendingOrders, unreadChats, unresolvedCallbacks };
}
