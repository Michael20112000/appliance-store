"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/admin/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { AdminSidebarBadgeCounts } from "@/server/services/admin-sidebar.service";

type AdminSidebarShellProps = {
  badgeCounts: AdminSidebarBadgeCounts;
  children: React.ReactNode;
};

export function AdminSidebarShell({
  badgeCounts,
  children,
}: AdminSidebarShellProps) {
  const pathname = usePathname();
  const isChatInbox =
    pathname === "/admin/chaty" || pathname.startsWith("/admin/chaty/");

  return (
    <TooltipProvider>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <SidebarProvider className="h-full min-h-0 min-w-0">
          <AppSidebar badgeCounts={badgeCounts} />
          <SidebarInset className="min-h-0 min-w-0 flex-1 overflow-hidden">
            <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-4 md:hidden">
              <SidebarTrigger className="size-9" aria-label="Відкрити меню" />
              <span className="text-sm font-semibold">Адмін-панель</span>
            </header>
            <main
              className={cn(
                "flex min-h-0 min-w-0 flex-1 flex-col bg-muted p-4 md:p-6",
                isChatInbox
                  ? "overflow-hidden"
                  : "overflow-x-hidden overflow-y-auto",
              )}
            >
              <div
                className={cn(
                  "min-h-0 min-w-0 rounded-lg border border-border bg-background p-4 shadow-sm md:p-6",
                  isChatInbox
                    ? "flex flex-1 flex-col overflow-hidden"
                    : "overflow-x-hidden",
                )}
              >
                {children}
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </TooltipProvider>
  );
}
