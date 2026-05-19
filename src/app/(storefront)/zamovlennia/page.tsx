import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CheckoutOrderSummary } from "@/components/checkout/checkout-order-summary";
import { GuestCheckoutView } from "@/components/checkout/guest-checkout-view";
import { auth } from "@/lib/auth";
import { getCartForUser } from "@/server/services/cart.service";

export const metadata: Metadata = {
  title: "Оформлення замовлення",
};

export default async function CheckoutPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          Оформлення замовлення
        </h1>
        <p className="mt-2 text-muted-foreground">
          Вкажіть контакти та спосіб отримання у Львові
        </p>
        <GuestCheckoutView />
      </div>
    );
  }

  const cart = await getCartForUser(session.user.id);

  if (cart.items.length === 0) {
    redirect("/koszyk");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        Оформлення замовлення
      </h1>
      <p className="mt-2 text-muted-foreground">
        Вкажіть контакти та спосіб отримання у Львові
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <CheckoutForm defaultName={session.user.name ?? ""} />
        <CheckoutOrderSummary
          items={cart.items}
          subtotalKopiyky={cart.subtotalKopiyky}
        />
      </div>
    </div>
  );
}
