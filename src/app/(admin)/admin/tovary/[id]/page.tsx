import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { listCategoriesAdmin } from "@/server/services/admin-catalog.service";
import { getProductAdmin } from "@/server/services/admin-product.service";

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
  const [product, categories] = await Promise.all([
    getProductAdmin(id),
    listCategoriesAdmin(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Редагувати товар</h1>
      <ProductForm
        mode="edit"
        productId={product.id}
        storefrontSlug={product.slug}
        currentStatus={product.status}
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
          status: product.status === "AVAILABLE" ? "AVAILABLE" : "DRAFT",
          priceUah: Math.round(product.price / 100),
          quantity: product.quantity,
        }}
        images={product.images}
      />
    </div>
  );
}
