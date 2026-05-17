"use client";

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
} from "@/components/ui/sidebar";

type AppSidebarProps = {
  unreadChatCount: number;
};

export function AppSidebar({ unreadChatCount }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const chatBadgeLabel =
    unreadChatCount > 99 ? "99+" : String(unreadChatCount);

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
                const isChat = item.href === "/admin/chaty";
                const showChatBadge = isChat && unreadChatCount > 0;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={item.label}
                      size="lg"
                      className="min-h-11"
                      aria-label={
                        showChatBadge
                          ? `Чати, ${unreadChatCount} непрочитаних`
                          : item.label
                      }
                    >
                      <Icon aria-hidden />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {showChatBadge ? (
                      <SidebarMenuBadge className="bg-destructive text-destructive-foreground">
                        {chatBadgeLabel}
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
