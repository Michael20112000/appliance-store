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
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4 sm:px-6">
          <p className="font-semibold">Адмін-панель</p>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:grid-cols-[12rem_1fr] sm:px-6">
        <aside className="rounded-lg border border-border bg-background p-3">
          <AdminNav />
        </aside>
        <main>{children}</main>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}
