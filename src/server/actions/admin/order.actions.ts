"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import {
  INVALID_STATUS_TRANSITION,
  ORDER_NOT_FOUND,
  updateOrderStatus,
} from "@/server/services/admin-order.service";
import { updateOrderStatusSchema } from "@/server/validators/admin-order";

export async function updateOrderStatusAction(input: unknown) {
  await requireAdmin();
  const data = updateOrderStatusSchema.parse(input);

  try {
    const { orderNumber } = await updateOrderStatus(data.orderId, data.status);
    revalidatePath("/admin/zamovlennia");
    revalidatePath(`/admin/zamovlennia/${orderNumber}`);
    revalidatePath("/kabinet");
    return { ok: true as const, orderNumber };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === INVALID_STATUS_TRANSITION) {
        return {
          ok: false as const,
          error: "INVALID_STATUS_TRANSITION" as const,
        };
      }
      if (error.message === ORDER_NOT_FOUND) {
        return { ok: false as const, error: "ORDER_NOT_FOUND" as const };
      }
    }
    return { ok: false as const, error: "UNKNOWN" as const };
  }
}
