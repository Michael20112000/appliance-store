"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MenuIcon } from "lucide-react";
import { CallbackRequestForm } from "@/components/layout/callback-request-form";
import {
  StorefrontAuthLinks,
  type StorefrontAuthSession,
} from "@/components/layout/storefront-auth-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SocialNavLinks } from "@/components/layout/social-nav-links";

type MobileNavCategory = {
  slug: string;
  name: string;
  productCount?: number;
};

export function StoreMobileNav({
  categories,
  session,
}: {
  categories: MobileNavCategory[];
  session: StorefrontAuthSession;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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
        <ul className="mt-4 flex flex-col gap-2 px-4">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/katalog/${category.slug}`}
                className="flex min-h-11 w-full items-center gap-3 py-2 text-sm"
                onClick={() => setOpen(false)}
              >
                <span>{category.name}</span>
                <Badge
                  variant="secondary"
                  className="shrink-0 tabular-nums text-muted-foreground"
                >
                  {category.productCount ?? 0}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
        <Separator className="my-6" />
        <div className="px-4">
          <CallbackRequestForm compact idPrefix="drawer" />
        </div>
        <Separator className="my-6" />
        <div className="px-4 pb-4">
          <StorefrontAuthLinks session={session} />
        </div>
        <Separator className="my-6" />
        <div className="px-4 pb-6">
          <p className="mb-3 text-xs text-muted-foreground">Ми в соцмережах</p>
          <SocialNavLinks />
        </div>
      </SheetContent>
    </Sheet>
  );
}
