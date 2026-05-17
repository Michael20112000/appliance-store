"use client";

import { AppSidebar } from "@/components/admin/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

type AdminSidebarShellProps = {
  unreadChatCount: number;
  children: React.ReactNode;
};

export function AdminSidebarShell({
  unreadChatCount,
  children,
}: AdminSidebarShellProps) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar unreadChatCount={unreadChatCount} />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-4 md:hidden">
            <SidebarTrigger className="size-9" aria-label="Відкрити меню" />
            <span className="text-sm font-semibold">Адмін-панель</span>
          </header>
          <main className="flex flex-1 flex-col bg-muted p-4 md:p-6">
            <div className="min-h-[calc(100dvh-3rem)] flex-1 rounded-lg border border-border bg-background p-4 shadow-sm md:min-h-[calc(100dvh-3rem)] md:p-6">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
