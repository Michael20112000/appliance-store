"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Панель", enabled: true },
  { href: "/admin/kategorii", label: "Категорії", enabled: true },
  { href: "#", label: "Товари", enabled: false },
  { href: "/admin/zamovlennia", label: "Замовлення", enabled: true },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 text-sm">
      {navItems.map((item) => {
        const active =
          item.enabled &&
          (item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href));

        if (!item.enabled) {
          return (
            <span
              key={item.label}
              className="cursor-not-allowed rounded-md px-3 py-2 text-muted-foreground/60"
              aria-disabled="true"
            >
              {item.label}
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 transition-colors",
              active
                ? "bg-background font-medium text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
      <div className="my-3 border-t border-border" />
      <Link
        href="/"
        className="rounded-md px-3 py-2 text-muted-foreground hover:bg-background/60 hover:text-foreground"
      >
        На сайт
      </Link>
    </nav>
  );
}
