import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { formatPriceKopiyky } from "@/lib/catalog/format";
import { auth } from "@/lib/auth";
import { getGuestOrderAccessCookie } from "@/lib/order/guest-order-access";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GuestOrderCleanup } from "@/components/order/guest-order-cleanup";
import {
  getOrderForGuest,
  getOrderForUser,
} from "@/server/services/order.service";

type PageProps = {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ access?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Замовлення ${orderNumber}` };
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: PageProps) {
  const { orderNumber } = await params;
  const { access: accessFromUrl } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  let order = null;
  let isGuestOrder = false;
  let guestAccessFromUrl: string | undefined;

  if (session?.user) {
    order = await getOrderForUser(session.user.id, orderNumber);
  }

  if (!order && accessFromUrl) {
    order = await getOrderForGuest(orderNumber, accessFromUrl);
    if (order) {
      isGuestOrder = true;
      guestAccessFromUrl = accessFromUrl;
    }
  }

  if (!order) {
    const guestToken = await getGuestOrderAccessCookie(orderNumber);
    if (guestToken) {
      order = await getOrderForGuest(orderNumber, guestToken);
      isGuestOrder = Boolean(order);
    }
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      {isGuestOrder ? (
        <GuestOrderCleanup
          orderNumber={order.orderNumber}
          guestAccessToken={guestAccessFromUrl}
        />
      ) : null}

      <h1 className="text-3xl font-semibold tracking-tight">
        Дякуємо за замовлення!
      </h1>
      <p className="mt-4 text-muted-foreground">
        Номер замовлення:{" "}
        <span className="font-medium text-foreground">{order.orderNumber}</span>
      </p>
      <p className="mt-2 text-muted-foreground">
        Ми передзвонимо на {order.customerPhone} для підтвердження.
      </p>
      {isGuestOrder ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Збережіть номер замовлення — він знадобиться, якщо зателефонуєте в
          магазин.
        </p>
      ) : null}
      <p className="mt-4 text-lg font-medium tabular-nums">
        Сума: {formatPriceKopiyky(order.totalKopiyky)}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Оплата при отриманні. Онлайн-оплата на сайті не потрібна.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {session?.user ? (
          <Link href="/kabinet" className={cn(buttonVariants(), "inline-flex")}>
            Мої замовлення
          </Link>
        ) : (
          <Link href="/uviity" className={cn(buttonVariants(), "inline-flex")}>
            Увійти в кабінет
          </Link>
        )}
        <Link
          href="/katalog"
          className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}
        >
          До каталогу
        </Link>
      </div>
    </div>
  );
}
