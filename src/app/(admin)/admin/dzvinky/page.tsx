import type { Metadata } from "next";
import { CallbackListFilters } from "@/components/admin/callback-list-filters";
import { CallbackRequestsTable } from "@/components/admin/callback-requests-table";
import {
  getCallbackViewCounts,
  listCallbackRequestsAdmin,
} from "@/server/services/callback-request.service";
import { listCallbacksAdminPageSchema } from "@/server/validators/admin-callback";

export const metadata: Metadata = {
  title: "Дзвінки",
};

type PageProps = {
  searchParams: Promise<{ view?: string }>;
};

export default async function AdminCallbacksPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const { view } = listCallbacksAdminPageSchema.parse(rawParams);

  const [requests, counts] = await Promise.all([
    listCallbackRequestsAdmin({ view, limit: 200 }),
    getCallbackViewCounts(),
  ]);

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Дзвінки</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Заявки на зворотний дзвінок з сайту
        </p>
      </div>
      <CallbackListFilters active={view} counts={counts} />
      <CallbackRequestsTable requests={requests} view={view} />
    </div>
  );
}
