"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { addPendingProduct } from "@/lib/cart/pending-storage";
import { addToCartAction } from "@/server/actions/cart.actions";
import { Button } from "@/components/ui/button";

type AddToCartButtonProps = {
  productId: string;
  productTitle: string;
  hasSession: boolean;
  disabled?: boolean;
};

export function AddToCartButton({
  productId,
  productTitle,
  hasSession,
  disabled = false,
}: AddToCartButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);

    if (!hasSession) {
      addPendingProduct(productId);
      const callbackUrl = encodeURIComponent(pathname || `/tovar/${productId}`);
      router.push(`/uviity?callbackUrl=${callbackUrl}`);
      return;
    }

    startTransition(async () => {
      const result = await addToCartAction(productId);
      if (!result.ok) {
        setError("Цей товар уже недоступний для замовлення.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        className="min-h-11 w-full sm:w-auto"
        disabled={disabled || isPending}
        onClick={handleClick}
        aria-label={`Додати в кошик — ${productTitle}`}
      >
        <ShoppingCart className="mr-2 size-4" />
        {isPending ? "Додаємо…" : "Додати в кошик"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
