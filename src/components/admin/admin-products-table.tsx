"use client";

import { useRouter } from "next/navigation";
import { getCldImageUrl } from "next-cloudinary";
import type { ProductStatus } from "@/generated/prisma/client";
import { ProductListStatusSelect } from "@/components/admin/product-list-status-select";
import { formatPriceKopiyky } from "@/lib/catalog/format";
import { cn } from "@/lib/utils";

export type AdminProductListItem = {
  id: string;
  title: string;
  brand: string;
  price: number;
  status: ProductStatus;
  category: { name: string };
  images: {
    cloudinaryPublicId: string;
    alt: string | null;
  }[];
};

type AdminProductsTableProps = {
  items: AdminProductListItem[];
};

export function AdminProductsTable({ items }: AdminProductsTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-background">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
            <th className="px-3 py-2 font-medium">Фото</th>
            <th className="px-3 py-2 font-medium">Назва</th>
            <th className="px-3 py-2 font-medium">Категорія</th>
            <th className="px-3 py-2 font-medium">Ціна</th>
            <th className="px-3 py-2 font-medium">Статус</th>
          </tr>
        </thead>
        <tbody>
          {items.map((product) => {
            const thumb = product.images[0];
            const thumbUrl = thumb
              ? getCldImageUrl({
                  src: thumb.cloudinaryPublicId,
                  width: 72,
                  height: 72,
                  crop: "fill",
                })
              : null;

            return (
              <tr
                key={product.id}
                role="link"
                tabIndex={0}
                onClick={() => router.push(`/admin/tovary/${product.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`/admin/tovary/${product.id}`);
                  }
                }}
                className={cn(
                  "cursor-pointer border-b border-border transition-colors last:border-0",
                  "hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none",
                )}
              >
                <td className="px-3 py-2">
                  {thumbUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbUrl}
                      alt={thumb.alt ?? product.title}
                      width={72}
                      height={72}
                      className="size-[72px] rounded-md object-cover"
                    />
                  ) : (
                    <span className="inline-flex size-[72px] items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                      —
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <p className="font-medium">{product.title}</p>
                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                </td>
                <td className="px-3 py-2">{product.category.name}</td>
                <td className="px-3 py-2 tabular-nums">
                  {formatPriceKopiyky(product.price)}
                </td>
                <td className="px-3 py-2">
                  <ProductListStatusSelect
                    productId={product.id}
                    status={product.status}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
