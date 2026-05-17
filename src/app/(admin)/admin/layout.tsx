import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AdminSidebarShell } from "@/components/admin/admin-sidebar-shell";
import { requireAdmin } from "@/lib/permissions";
import { countUnreadForAdmin } from "@/server/services/chat.service";

export const metadata: Metadata = {
  title: "Адмін-панель",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const unreadChatCount = await countUnreadForAdmin();

  return (
    <div className="min-h-dvh bg-muted">
      <AdminSidebarShell unreadChatCount={unreadChatCount}>
        {children}
      </AdminSidebarShell>
      <Toaster richColors position="top-center" />
    </div>
  );
}
