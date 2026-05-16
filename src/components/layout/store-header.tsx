import Link from "next/link";
import { headers } from "next/headers";
import { MenuIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { StoreHeaderAuth } from "@/components/layout/store-header-auth";

export async function StoreHeader() {
  const session = await auth.api.getSession({ headers: await headers() });
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const navLinkClass =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-3 text-sm font-medium hover:bg-muted";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Техніка Львів
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category.id}
              href={`/katalog/${category.slug}`}
              className={navLinkClass}
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger
              className="md:hidden"
              render={<Button variant="outline" size="icon" aria-label="Меню" />}
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Категорії</SheetTitle>
              </SheetHeader>
              <ul className="mt-4 flex flex-col gap-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/katalog/${category.slug}`}
                      className="block min-h-11 py-2 text-sm"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </SheetContent>
          </Sheet>
          <StoreHeaderAuth session={session} />
        </div>
      </div>
    </header>
  );
}
