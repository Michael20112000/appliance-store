import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPriceKopiyky } from "@/lib/catalog/format";
import { requireBuyer } from "@/lib/permissions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getOrderForUser } from "@/server/services/order.service";

type PageProps = {
  params: Promise<{ orderNumber: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Замовлення ${orderNumber}` };
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderNumber } = await params;
  const session = await requireBuyer();
  const order = await getOrderForUser(session.user.id, orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
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
      <p className="mt-4 text-lg font-medium tabular-nums">
        Сума: {formatPriceKopiyky(order.totalKopiyky)}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Оплата при отриманні. Онлайн-оплата на сайті не потрібна.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/kabinet" className={cn(buttonVariants(), "inline-flex")}>
          Мої замовлення
        </Link>
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
