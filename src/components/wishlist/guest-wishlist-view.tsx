"use client";

import { useEffect, useState } from "react";
import { resolveGuestWishlistProductsAction } from "@/server/actions/wishlist.actions";
import { WishlistPageContent } from "@/components/wishlist/wishlist-page-content";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getGuestWishlistProductIds } from "@/lib/wishlist/guest-storage";
import { WISHLIST_CHANGED_EVENT } from "@/lib/wishlist/wishlist-events";
import type { WishlistLineDto } from "@/types/wishlist";

export function GuestWishlistView() {
  const [lines, setLines] = useState<WishlistLineDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const productIds = getGuestWishlistProductIds();
      if (productIds.length === 0) {
        if (!cancelled) {
          setLines([]);
          setLoading(false);
        }
        return;
      }

      try {
        const result = await resolveGuestWishlistProductsAction(productIds);
        if (!cancelled) {
          setLines(result.lines);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Не вдалося завантажити обране. Спробуйте оновити сторінку.");
          setLoading(false);
        }
      }
    }

    void load();

    const onChanged = () => {
      void load();
    };
    window.addEventListener(WISHLIST_CHANGED_EVENT, onChanged);

    return () => {
      cancelled = true;
      window.removeEventListener(WISHLIST_CHANGED_EVENT, onChanged);
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Обране</h1>
        <p className="mt-8 text-muted-foreground">Завантаження…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Обране</h1>
        <Alert variant="destructive" className="mt-8">
          <AlertTitle>Помилка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <WishlistPageContent lines={lines} hasSession={false} />;
}
