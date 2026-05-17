"use server";

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { revalidatePath } from "next/cache";
import { requireBuyer } from "@/lib/permissions";
import { createOrderFromCart } from "@/server/services/order.service";
import { checkoutSchema } from "@/server/validators/order";

export async function submitCheckoutAction(input: unknown) {
  const session = await requireBuyer("/zamovlennia");
  const data = checkoutSchema.parse(input);

  try {
    const { orderNumber } = await createOrderFromCart(session.user.id, data);
    revalidatePath("/koszyk");
    revalidatePath("/kabinet");
    revalidatePath("/", "layout");
    redirect(`/zamovlennia/pidtverdzhennia/${orderNumber}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof Error) {
      if (error.message === "CART_EMPTY") {
        return { ok: false as const, error: "CART_EMPTY" };
      }
      if (error.message === "PRODUCT_UNAVAILABLE") {
        return { ok: false as const, error: "PRODUCT_UNAVAILABLE" };
      }
    }
    return { ok: false as const, error: "UNKNOWN" };
  }
}
