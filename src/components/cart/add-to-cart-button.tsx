"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ShoppingCart, Trash2 } from "lucide-react";
import {
  addPendingProduct,
  hasPendingProduct,
  removePendingProduct,
} from "@/lib/cart/pending-storage";
import {
  addToCartAction,
  removeFromCartAction,
} from "@/server/actions/cart.actions";
import { Button } from "@/components/ui/button";

type AddToCartButtonProps = {
  productId: string;
  productTitle: string;
  hasSession: boolean;
  initialInCart?: boolean;
  disabled?: boolean;
};

export function AddToCartButton({
  productId,
  productTitle,
  hasSession,
  initialInCart = false,
  disabled = false,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [inCart, setInCart] = useState(initialInCart);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInCart(initialInCart);
  }, [initialInCart]);

  useEffect(() => {
    if (!hasSession) {
      setInCart(hasPendingProduct(productId));
    }
  }, [hasSession, productId]);

  const handleAdd = () => {
    setError(null);

    if (!hasSession) {
      addPendingProduct(productId);
      setInCart(true);
      return;
    }

    startTransition(async () => {
      const result = await addToCartAction(productId);
      if (!result.ok) {
        setError("Цей товар уже недоступний для замовлення.");
        return;
      }
      setInCart(true);
      router.refresh();
    });
  };

  const handleRemove = () => {
    setError(null);

    if (!hasSession) {
      removePendingProduct(productId);
      setInCart(false);
      return;
    }

    startTransition(async () => {
      await removeFromCartAction(productId);
      setInCart(false);
      router.refresh();
    });
  };

  if (inCart) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            className="min-h-11 flex-1 sm:flex-none sm:w-auto"
            disabled
            aria-label={`${productTitle} вже в кошику`}
          >
            <Check className="mr-2 size-4" aria-hidden />
            Вже в кошику
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 shrink-0"
            disabled={disabled || isPending}
            onClick={handleRemove}
            aria-label={`Прибрати ${productTitle} з кошика`}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        className="min-h-11 w-full sm:w-auto"
        disabled={disabled || isPending}
        onClick={handleAdd}
        aria-label={`Додати в кошик — ${productTitle}`}
      >
        <ShoppingCart className="mr-2 size-4" />
        {isPending ? "Додаємо…" : "Додати в кошик"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
