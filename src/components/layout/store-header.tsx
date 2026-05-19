import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { categoriesWithAvailableProducts } from "@/lib/catalog/categories";
import { CartNavLink } from "@/components/cart/cart-nav-link";
import { GuestCartNavLink } from "@/components/cart/guest-cart-nav-link";
import { listCategoriesWithProductCounts } from "@/server/services/catalog.service";
import { WishlistNavLink } from "@/components/wishlist/wishlist-nav-link";
import { StoreHeaderAuth } from "@/components/layout/store-header-auth";
import { getWishlistItemCount } from "@/server/services/wishlist.service";
import { StoreMobileNav } from "@/components/layout/store-mobile-nav";

export async function StoreHeader() {
  const session = await auth.api.getSession({ headers: await headers() });
  const { categories: categoriesWithCounts } =
    await listCategoriesWithProductCounts();
  const availableCategories =
    categoriesWithAvailableProducts(categoriesWithCounts);
  const headerNavCategories = availableCategories.slice(0, 4);

  const navLinkClass =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-3 text-sm font-medium hover:bg-muted";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Техніка Львів
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/katalog" className={navLinkClass}>
            Каталог
          </Link>
          {headerNavCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/katalog/${category.slug}`}
              className={navLinkClass}
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <StoreMobileNav categories={availableCategories} />
          <WishlistNavLink
            hasSession={Boolean(session?.user)}
            initialCount={
              session?.user
                ? await getWishlistItemCount(session.user.id)
                : undefined
            }
          />
          {session?.user ? (
            <CartNavLink userId={session.user.id} />
          ) : (
            <GuestCartNavLink />
          )}
          <StoreHeaderAuth session={session} />
        </div>
      </div>
    </header>
  );
}
