import type { Metadata } from "next";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CartEmpty } from "@/components/cart/cart-empty";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { requireBuyer } from "@/lib/permissions";
import { getCartForUser } from "@/server/services/cart.service";

export const metadata: Metadata = {
  title: "Кошик",
};

export default async function CartPage() {
  const session = await requireBuyer("/koszyk");
  const cart = await getCartForUser(session.user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Кошик</h1>

      {cart.removedTitles.length > 0 ? (
        <Alert className="mt-6">
          <AlertDescription>
            Деякі товари більше недоступні і були прибрані з кошика:{" "}
            {cart.removedTitles.join(", ")}.
          </AlertDescription>
        </Alert>
      ) : null}

      {cart.items.length === 0 ? (
        <div className="mt-8">
          <CartEmpty />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
          <ul className="divide-y divide-border rounded-lg border border-border bg-card px-4">
            {cart.items.map((line) => (
              <CartLineItem key={line.productId} line={line} />
            ))}
          </ul>
          <CartSummary
            subtotalKopiyky={cart.subtotalKopiyky}
            itemCount={cart.items.length}
          />
        </div>
      )}
    </div>
  );
}
