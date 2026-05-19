"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CheckoutOrderSummary } from "@/components/checkout/checkout-order-summary";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPendingProductIds } from "@/lib/cart/pending-storage";
import { CART_CHANGED_EVENT } from "@/lib/cart/cart-events";
import { resolveGuestCartAction } from "@/server/actions/cart.actions";
import type { CartViewDto } from "@/types/cart";

export function GuestCheckoutView() {
  const router = useRouter();
  const [cart, setCart] = useState<CartViewDto | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const productIds = getPendingProductIds();
    if (productIds.length === 0) {
      router.replace("/koszyk");
      return;
    }

    try {
      const result = await resolveGuestCartAction(productIds);
      if (result.cart.items.length === 0) {
        router.replace("/koszyk");
        return;
      }
      setCart(result.cart);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
    window.addEventListener(CART_CHANGED_EVENT, load);
    return () => window.removeEventListener(CART_CHANGED_EVENT, load);
  }, [load]);

  if (loading || !cart) {
    return <p className="mt-8 text-muted-foreground">Завантаження…</p>;
  }

  const productIds = cart.items.map((line) => line.productId);

  return (
    <>
      <Alert className="mt-6">
        <AlertDescription>
          Реєстрація не потрібна — вкажіть ім&apos;я та телефон, ми передзвонимо для
          підтвердження.{" "}
          <Link href="/uviity" className="font-medium underline">
            Увійти
          </Link>{" "}
          можна пізніше, щоб бачити історію замовлень у кабінеті.
        </AlertDescription>
      </Alert>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <CheckoutForm guestProductIds={productIds} />
        <CheckoutOrderSummary
          items={cart.items}
          subtotalKopiyky={cart.subtotalKopiyky}
        />
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/koszyk" className={cn(buttonVariants({ variant: "link" }), "h-auto p-0")}>
          ← Назад до кошика
        </Link>
      </p>
    </>
  );
}
