"use server";

import { headers, cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { setGuestOrderAccessCookie } from "@/lib/order/guest-order-access";
import {
  createOrderFromCart,
  createOrderFromGuestCart,
} from "@/server/services/order.service";
import { checkoutSchema, guestCheckoutSchema } from "@/server/validators/order";

function guestConfirmationPath(orderNumber: string, guestAccessToken: string) {
  const params = new URLSearchParams({ access: guestAccessToken });
  return `/zamovlennia/pidtverdzhennia/${orderNumber}?${params.toString()}`;
}

export async function persistGuestOrderAccessAction(
  orderNumber: string,
  guestAccessToken: string,
) {
  const cookieStore = await cookies();
  await setGuestOrderAccessCookie(orderNumber, guestAccessToken, cookieStore);
}

export async function submitCheckoutAction(input: unknown) {
  const cookieStore = await cookies();

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user) {
      const data = checkoutSchema.parse(input);
      const { orderNumber } = await createOrderFromCart(session.user.id, data);
      revalidatePath("/koszyk");
      revalidatePath("/kabinet");
      revalidatePath("/", "layout");
      redirect(`/zamovlennia/pidtverdzhennia/${orderNumber}`);
    }

    const data = guestCheckoutSchema.parse(input);
    const { orderNumber, guestAccessToken } =
      await createOrderFromGuestCart(data);

    try {
      await setGuestOrderAccessCookie(
        orderNumber,
        guestAccessToken,
        cookieStore,
      );
    } catch (cookieError) {
      if (process.env.NODE_ENV === "development") {
        console.error("[submitCheckoutAction] guest cookie", cookieError);
      }
    }

    revalidatePath("/koszyk");
    revalidatePath("/", "layout");
    redirect(guestConfirmationPath(orderNumber, guestAccessToken));
  } catch (error) {
    unstable_rethrow(error);

    if (error instanceof ZodError) {
      return { ok: false as const, error: "VALIDATION" as const };
    }

    if (error instanceof Error) {
      if (error.message === "CART_EMPTY") {
        return { ok: false as const, error: "CART_EMPTY" as const };
      }
      if (error.message === "PRODUCT_UNAVAILABLE") {
        return { ok: false as const, error: "PRODUCT_UNAVAILABLE" as const };
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.error("[submitCheckoutAction]", error);
    }

    return { ok: false as const, error: "UNKNOWN" as const };
  }
}
