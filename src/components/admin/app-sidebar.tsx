"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { adminNavItems } from "@/components/admin/admin-nav-items";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import type { AdminSidebarBadgeCounts } from "@/server/services/admin-sidebar.service";

type AppSidebarProps = {
  badgeCounts: AdminSidebarBadgeCounts;
};

export function AppSidebar({ badgeCounts }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  const badgeConfig: Record<string, { count: number; destructive: boolean } | undefined> = {
    "/admin/kategorii": { count: badgeCounts.categories, destructive: false },
    "/admin/tovary": { count: badgeCounts.products, destructive: false },
    "/admin/zamovlennia": { count: badgeCounts.pendingOrders, destructive: true },
    "/admin/chaty": { count: badgeCounts.unreadChats, destructive: true },
    "/admin/dzvinky": { count: badgeCounts.unresolvedCallbacks, destructive: true },
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="pointer-events-none min-h-11"
              tooltip="Адмін-панель"
            >
              <span className="font-semibold">Адмін-панель</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                const badge = badgeConfig[item.href];
                const showBadge = badge !== undefined && badge.count > 0;
                const badgeLabel = badge && badge.count > 99 ? "99+" : String(badge?.count ?? 0);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={item.label}
                      size="lg"
                      className="min-h-11"
                      aria-label={
                        showBadge && badge
                          ? (() => {
                              switch (item.href) {
                                case "/admin/kategorii":
                                  return `Категорії, ${badge.count} всього`;
                                case "/admin/tovary":
                                  return `Товари, ${badge.count} всього`;
                                case "/admin/zamovlennia":
                                  return `Замовлення, ${badge.count} висячих`;
                                case "/admin/chaty":
                                  return `Чати, ${badge.count} непрочитаних`;
                                case "/admin/dzvinky":
                                  return `Дзвінки, ${badge.count} невирішених`;
                                default:
                                  return item.label;
                              }
                            })()
                          : item.label
                      }
                    >
                      <Icon aria-hidden />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {showBadge && badge ? (
                      <SidebarMenuBadge
                        className={
                          badge.destructive
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {badgeLabel}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/" />}
              tooltip="На сайт"
              size="lg"
              className="min-h-11 text-muted-foreground"
            >
              <ExternalLink aria-hidden />
              <span>На сайт</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full justify-start px-2 font-normal text-muted-foreground"
              onClick={async () => {
                await authClient.signOut();
                router.push("/uviity");
                router.refresh();
              }}
            >
              Вийти
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
