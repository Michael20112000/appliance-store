import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductEditPageContent } from "@/components/admin/product-edit-page-content";
import { ProductOrdersSection } from "@/components/admin/product-orders-section";
import { listCategoriesAdmin } from "@/server/services/admin-catalog.service";
import {
  getProductAdmin,
  listOrdersForProductAdmin,
} from "@/server/services/admin-product.service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductAdmin(id);
  return {
    title: product ? `Редагувати: ${product.title}` : "Товар",
  };
}

export default async function AdminEditProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, categories, orders] = await Promise.all([
    getProductAdmin(id),
    listCategoriesAdmin(),
    listOrdersForProductAdmin(id),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ProductEditPageContent
        productId={product.id}
        categoryId={product.categoryId}
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        defaultValues={{
          title: product.title,
          description: product.description ?? "",
          brand: product.brand,
          categoryId: product.categoryId,
          condition: product.condition,
          priceUah: Math.round(product.price / 100),
          quantity: product.quantity,
        }}
        images={product.images}
      />
      <ProductOrdersSection orders={orders} />
    </div>
  );
}
