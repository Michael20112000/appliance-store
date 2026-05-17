import type { Metadata } from "next";
import { Toaster } from "sonner";
import { requireAdmin } from "@/lib/permissions";
import { AdminNav } from "@/components/admin/admin-nav";

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

  return (
    <div className="min-h-dvh bg-muted">
      <div className="grid min-h-dvh grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="border-b border-border bg-muted p-4 md:border-b-0 md:border-r">
          <p className="mb-4 px-3 text-sm font-semibold">Адмін-панель</p>
          <AdminNav />
        </aside>
        <main className="bg-muted p-4 md:p-6">
          <div className="min-h-[calc(100dvh-2rem)] rounded-lg border border-border bg-background p-4 shadow-sm md:min-h-[calc(100dvh-3rem)] md:p-6">
            {children}
          </div>
        </main>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}
