"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type MobileNavCategory = {
  id: string;
  slug: string;
  name: string;
};

export function StoreMobileNav({
  categories,
}: {
  categories: MobileNavCategory[];
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
        <ul className="mt-4 flex flex-col gap-2 pl-4">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/katalog/${category.slug}`}
                className="block min-h-11 py-2 text-sm"
                onClick={() => setOpen(false)}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
