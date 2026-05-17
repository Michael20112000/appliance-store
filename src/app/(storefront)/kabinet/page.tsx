import type { Metadata } from "next";
import Link from "next/link";
import { OrderHistoryList } from "@/components/account/order-history-list";
import { OpenChatButton } from "@/components/chat/open-chat-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WishlistCabinetPreview } from "@/components/wishlist/wishlist-cabinet-preview";
import { requireBuyer } from "@/lib/permissions";
import { listOrdersForUser } from "@/server/services/order.service";
import { listWishlistPreviewForUser } from "@/server/services/wishlist.service";

export const metadata: Metadata = {
  title: "Особистий кабінет",
};

export default async function CabinetPage() {
  const session = await requireBuyer("/kabinet");
  const [orders, wishlistPreview] = await Promise.all([
    listOrdersForUser(session.user.id),
    listWishlistPreviewForUser(session.user.id, 3),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold">Особистий кабінет</h1>
      <p className="mt-4 text-lg">Вітаємо, {session.user.name}</p>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Обране</h2>
        <div className="mt-4">
          <WishlistCabinetPreview lines={wishlistPreview} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Мої замовлення</h2>
        <div className="mt-4">
          <OrderHistoryList orders={orders} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Повідомлення</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Пишіть магазину з питаннями про товари та замовлення.
        </p>
        <div className="mt-4">
          <OpenChatButton
            hasSession
            label="Відкрити чат"
            variant="default"
          />
        </div>
      </section>

      <Link
        href="/"
        className={cn(buttonVariants({ variant: "outline" }), "mt-8 inline-flex")}
      >
        На головну
      </Link>
    </div>
  );
}
