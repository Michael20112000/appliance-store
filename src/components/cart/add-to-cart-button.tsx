"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ShoppingCart } from "lucide-react";
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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            type="button"
            variant="secondary"
            className="min-h-11 w-full sm:w-auto"
            disabled
            aria-label={`${productTitle} уже в кошику`}
          >
            <Check className="mr-2 size-4" aria-hidden />
            У кошику
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full sm:w-auto"
            disabled={disabled || isPending}
            onClick={handleRemove}
            aria-label={`Прибрати ${productTitle} з кошика`}
          >
            {isPending ? "Прибираємо…" : "Прибрати з кошика"}
          </Button>
          <Link
            href="/koszyk"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "min-h-11 w-full justify-center sm:w-auto",
            )}
          >
            Перейти до кошика
          </Link>
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
