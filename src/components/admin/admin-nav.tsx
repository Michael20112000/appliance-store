"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  MessageSquare,
  Package,
  ShoppingBag,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Панель", icon: LayoutDashboard, enabled: true },
  {
    href: "/admin/kategorii",
    label: "Категорії",
    icon: FolderTree,
    enabled: true,
  },
  { href: "/admin/tovary", label: "Товари", icon: Package, enabled: true },
  {
    href: "/admin/zamovlennia",
    label: "Замовлення",
    icon: ShoppingBag,
    enabled: true,
  },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="flex h-full flex-col gap-1 text-sm">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-md px-3 py-2 transition-colors",
              active
                ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}

      <span
        className="flex min-h-11 cursor-not-allowed items-center gap-2 rounded-md px-3 py-2 opacity-60"
        aria-disabled="true"
      >
        <MessageSquare className="size-4 shrink-0" aria-hidden />
        <span>Чати</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          Незабаром
        </Badge>
      </span>

      <div className="mt-auto space-y-1 border-t border-border pt-4">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:bg-background/60 hover:text-foreground"
        >
          <ExternalLink className="size-4 shrink-0" aria-hidden />
          На сайт
        </Link>
        <Button
          type="button"
          variant="ghost"
          className="h-11 w-full justify-start px-3 font-normal text-muted-foreground"
          onClick={async () => {
            await authClient.signOut();
            router.push("/uviity");
            router.refresh();
          }}
        >
          Вийти
        </Button>
      </div>
    </nav>
  );
}
