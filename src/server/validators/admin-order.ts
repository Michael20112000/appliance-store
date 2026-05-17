import { z } from "zod";

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
