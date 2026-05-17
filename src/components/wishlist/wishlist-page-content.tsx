import Link from "next/link";
import { ClearWishlistButton } from "@/components/wishlist/clear-wishlist-button";
import { WishlistGrid } from "@/components/wishlist/wishlist-grid";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WishlistLineDto } from "@/types/wishlist";

type WishlistPageContentProps = {
  lines: WishlistLineDto[];
  hasSession: boolean;
};

export function WishlistPageContent({
  lines,
  hasSession,
}: WishlistPageContentProps) {
  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Обране</h1>
        <WishlistEmptyState />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Обране</h1>
          <p className="mt-2 text-muted-foreground">
            {lines.length} {lines.length === 1 ? "товар" : "товарів"} у списку
          </p>
        </div>
        <ClearWishlistButton hasSession={hasSession} />
      </div>
      <div className="mt-8">
        <WishlistGrid lines={lines} hasSession={hasSession} />
      </div>
    </div>
  );
}

function WishlistEmptyState() {
  return (
    <div className="mt-10 rounded-lg border border-dashed p-10 text-center">
      <h2 className="text-lg font-medium">Обране порожнє</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Додайте товари з каталогу, натиснувши сердечко на картці.
      </p>
      <Link
        href="/katalog"
        className={cn(buttonVariants({ variant: "default" }), "mt-6 inline-flex")}
      >
        Перейти до каталогу
      </Link>
    </div>
  );
}
