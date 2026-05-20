import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import { getAdminStoreSettings } from "@/server/services/store-settings.service";

export default async function AdminStoreSettingsPage() {
  const settings = await getAdminStoreSettings();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Налаштування магазину</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Контакти для футера та головної сторінки
        </p>
      </div>

      <StoreSettingsForm defaultValues={settings} />
    </div>
  );
}
