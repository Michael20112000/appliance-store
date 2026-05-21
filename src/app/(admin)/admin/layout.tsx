import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AdminSidebarShell } from "@/components/admin/admin-sidebar-shell";
import { requireAdmin } from "@/lib/permissions";
import { getAdminSidebarCounts } from "@/server/services/admin-sidebar.service";

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
  const badgeCounts = await getAdminSidebarCounts();

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-muted">
      <AdminSidebarShell badgeCounts={badgeCounts}>
        {children}
      </AdminSidebarShell>
      <Toaster richColors position="top-center" />
    </div>
  );
}
