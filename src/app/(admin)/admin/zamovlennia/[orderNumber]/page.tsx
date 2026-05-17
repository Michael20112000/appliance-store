import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPriceKopiyky } from "@/lib/catalog/format";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import {
  getAllowedNextStatuses,
  getOrderAdmin,
} from "@/server/services/admin-order.service";

type PageProps = {
  params: Promise<{ orderNumber: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Замовлення ${orderNumber}` };
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { orderNumber } = await params;
  const order = await getOrderAdmin(orderNumber);

  if (!order) {
    notFound();
  }

  const allowedNextStatuses = getAllowedNextStatuses(order.status);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/zamovlennia"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← До списку замовлень
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">
            Замовлення {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="rounded-lg border border-border bg-background p-4">
            <h2 className="font-medium">Покупець</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Ім&apos;я</dt>
                <dd>{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Телефон</dt>
                <dd>
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="text-primary hover:underline"
                  >
                    {order.customerPhone}
                  </a>
                </dd>
              </div>
              {order.notes ? (
                <div>
                  <dt className="text-muted-foreground">Примітки</dt>
                  <dd>{order.notes}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="rounded-lg border border-border bg-background p-4">
            <h2 className="font-medium">Доставка</h2>
            <p className="mt-2 text-sm">
              {order.deliveryType === "PICKUP"
                ? "Самовивіз"
                : `Доставка по Львову: ${order.deliveryAddress ?? "—"}`}
            </p>
          </section>

          <section className="rounded-lg border border-border bg-background p-4">
            <h2 className="mb-3 font-medium">Товари</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Назва</th>
                    <th className="py-2 pr-4 font-medium">К-сть</th>
                    <th className="py-2 pr-4 font-medium">Ціна</th>
                    <th className="py-2 font-medium">Сума</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr
                      key={`${item.titleSnapshot}-${index}`}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-2 pr-4">{item.titleSnapshot}</td>
                      <td className="py-2 pr-4">{item.quantity}</td>
                      <td className="py-2 pr-4 tabular-nums">
                        {formatPriceKopiyky(item.priceSnapshot)}
                      </td>
                      <td className="py-2 tabular-nums">
                        {formatPriceKopiyky(
                          item.priceSnapshot * item.quantity,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-right text-lg font-semibold tabular-nums">
              Разом: {formatPriceKopiyky(order.totalKopiyky)}
            </p>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-border bg-background p-4">
            <h2 className="font-medium">Статус</h2>
            <div className="mt-3">
              <OrderStatusSelect
                order={order}
                allowedNextStatuses={allowedNextStatuses}
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
