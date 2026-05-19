import { CallbackRequestsTable } from "@/components/admin/callback-requests-table";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import {
  getAdminStoreSettings,
  listCallbackRequestsAdmin,
} from "@/server/services/store-settings.service";

export default async function AdminStoreSettingsPage() {
  const [settings, callbackRequests] = await Promise.all([
    getAdminStoreSettings(),
    listCallbackRequestsAdmin(50),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Налаштування магазину</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Контакти для футера та головної сторінки
        </p>
      </div>

      <StoreSettingsForm defaultValues={settings} />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Заявки на дзвінок</h2>
        <CallbackRequestsTable requests={callbackRequests} />
      </section>
    </div>
  );
}
