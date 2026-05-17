import { z } from "zod";

export const adminOrderListFilterSchema = z.enum([
  "all",
  "new",
  "in_progress",
  "completed",
  "cancelled",
]);

export const adminOrderListSortSchema = z.enum([
  "createdAt",
  "totalKopiyky",
  "orderNumber",
  "status",
]);

export const adminOrderListDirSchema = z.enum(["asc", "desc"]);

const adminOrderPageSizeSchema = z.coerce
  .number()
  .int()
  .refine((value): value is 10 | 20 | 50 => value === 10 || value === 20 || value === 50);

export const listOrdersAdminSchema = z.object({
  filter: adminOrderListFilterSchema.default("all"),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  pageSize: adminOrderPageSizeSchema.default(20),
  sort: adminOrderListSortSchema.default("createdAt"),
  dir: adminOrderListDirSchema.default("desc"),
});

const orderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
]);

export const updateOrderStatusSchema = z.object({
  orderId: z.string().cuid("Невірний ідентифікатор замовлення"),
  status: orderStatusSchema,
});

export type UpdateOrderStatusInput = z.input<typeof updateOrderStatusSchema>;
export type UpdateOrderStatusValues = z.output<typeof updateOrderStatusSchema>;
export type ListOrdersAdminParams = z.output<typeof listOrdersAdminSchema>;
export type AdminOrderListSort = z.output<typeof adminOrderListSortSchema>;
export type AdminOrderListDir = z.output<typeof adminOrderListDirSchema>;
