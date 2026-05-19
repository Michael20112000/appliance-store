import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { OpenChatButton } from "@/components/chat/open-chat-button";
import { JsonLd } from "@/components/catalog/json-ld";
import { auth } from "@/lib/auth";
import { ConditionBadge } from "@/components/catalog/condition-badge";
import { PriceDisplay } from "@/components/catalog/price-display";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { buttonVariants } from "@/components/ui/button";
import { productMetadata } from "@/lib/catalog/metadata";
import { buildProductJsonLd } from "@/lib/catalog/product-json-ld";
import { getEnv } from "@/lib/env";
import { cn } from "@/lib/utils";
import { isProductInCart } from "@/server/services/cart.service";
import { isProductInWishlist } from "@/server/services/wishlist.service";
import { WishlistToggleButton } from "@/components/wishlist/wishlist-toggle-button";
import { getPublicProductBySlug } from "@/server/services/catalog.service";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) return { title: "Товар не знайдено" };
  return productMetadata(product);
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const baseUrl = getEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const canonicalUrl = `${baseUrl}/tovar/${product.slug}`;
  const inCart =
    session?.user?.id != null
      ? await isProductInCart(session.user.id, product.id)
      : false;
  const inWishlist =
    session?.user?.id != null
      ? await isProductInWishlist(session.user.id, product.id)
      : false;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <JsonLd data={buildProductJsonLd(product, canonicalUrl)} />
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/katalog" className="hover:text-foreground">
              Каталог
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href={`/katalog/${product.category.slug}`}
              className="hover:text-foreground"
            >
              {product.category.name}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground line-clamp-1">{product.title}</li>
        </ol>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery
          images={product.images}
          title={product.title}
          brand={product.brand}
        />
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {product.title}
            </h1>
            <p className="text-muted-foreground">{product.brand}</p>
            <PriceDisplay priceKopiyky={product.price} className="text-2xl" />
            <ConditionBadge condition={product.condition} />
          </div>

          <div className="flex flex-col gap-3">
            <AddToCartButton
              productId={product.id}
              productTitle={product.title}
              hasSession={Boolean(session?.user)}
              initialInCart={inCart}
            />
            <WishlistToggleButton
              productId={product.id}
              productTitle={product.title}
              hasSession={Boolean(session?.user)}
              initialInWishlist={inWishlist}
              variant="inline"
            />
            <OpenChatButton
              hasSession={Boolean(session?.user)}
              productId={product.id}
              productTitle={product.title}
              productSlug={product.slug}
              variant="outline"
              className="w-full sm:w-auto"
            />
          </div>

          <section>
            <h2 className="text-lg font-medium">Опис</h2>
            <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
              {product.description ?? "Опис товару уточнюється."}
            </p>
          </section>

          <Link href="/katalog" className={cn(buttonVariants(), "inline-flex")}>
            До каталогу
          </Link>
        </div>
      </div>
    </div>
  );
}
