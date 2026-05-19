"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { saveStoreSettingsAction } from "@/server/actions/admin/store-settings.actions";
import {
  adminStoreSettingsSchema,
  type AdminStoreSettingsInput,
} from "@/server/validators/admin-store-settings";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type StoreSettingsFormProps = {
  defaultValues: AdminStoreSettingsInput;
};

export function StoreSettingsForm({ defaultValues }: StoreSettingsFormProps) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<AdminStoreSettingsInput>({
    resolver: zodResolver(adminStoreSettingsSchema),
    defaultValues,
  });

  const phones = useFieldArray({ control: form.control, name: "phones" });
  const emails = useFieldArray({ control: form.control, name: "emails" });
  const addresses = useFieldArray({ control: form.control, name: "addresses" });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    const result = await saveStoreSettingsAction(values);
    if (result.ok) {
      toast.success("Налаштування збережено");
      return;
    }
    setError(result.message ?? "Не вдалося зберегти налаштування");
  });

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Телефони</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => phones.append({ digits: "", label: "" })}
          >
            <Plus className="size-4" aria-hidden />
            Додати телефон
          </Button>
        </div>
        {phones.fields.map((field, index) => (
          <div
            key={field.id}
            className="grid gap-3 rounded-md border border-border p-4 sm:grid-cols-[1fr_1fr_auto]"
          >
            <div className="space-y-2">
              <Label htmlFor={`phone-digits-${index}`}>Номер (цифри)</Label>
              <Input
                id={`phone-digits-${index}`}
                {...form.register(`phones.${index}.digits`)}
                placeholder="0978734712"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`phone-label-${index}`}>Підпис (необовʼязково)</Label>
              <Input
                id={`phone-label-${index}`}
                {...form.register(`phones.${index}.label`)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="self-end"
              aria-label="Видалити телефон"
              onClick={() => phones.remove(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Email</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => emails.append({ email: "", label: "" })}
          >
            <Plus className="size-4" aria-hidden />
            Додати email
          </Button>
        </div>
        {emails.fields.map((field, index) => (
          <div
            key={field.id}
            className="grid gap-3 rounded-md border border-border p-4 sm:grid-cols-[1fr_1fr_auto]"
          >
            <div className="space-y-2">
              <Label htmlFor={`email-${index}`}>Email</Label>
              <Input
                id={`email-${index}`}
                type="email"
                {...form.register(`emails.${index}.email`)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`email-label-${index}`}>Підпис</Label>
              <Input
                id={`email-label-${index}`}
                {...form.register(`emails.${index}.label`)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="self-end"
              aria-label="Видалити email"
              onClick={() => emails.remove(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Адреси</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              addresses.append({
                text: "",
                mapUrl: "",
                label: "",
              })
            }
          >
            <Plus className="size-4" aria-hidden />
            Додати адресу
          </Button>
        </div>
        {addresses.fields.map((field, index) => (
          <div
            key={field.id}
            className="space-y-3 rounded-md border border-border p-4"
          >
            <div className="space-y-2">
              <Label htmlFor={`address-text-${index}`}>Адреса</Label>
              <Input
                id={`address-text-${index}`}
                {...form.register(`addresses.${index}.text`)}
                placeholder="м. Львів, вул. …"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`address-map-${index}`}>
                Посилання на карту (embed URL, необовʼязково)
              </Label>
              <Input
                id={`address-map-${index}`}
                {...form.register(`addresses.${index}.mapUrl`)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`address-label-${index}`}>Підпис</Label>
              <Input
                id={`address-label-${index}`}
                {...form.register(`addresses.${index}.label`)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => addresses.remove(index)}
            >
              <Trash2 className="size-4" aria-hidden />
              Видалити адресу
            </Button>
          </div>
        ))}
      </section>

      <Button type="submit" className="min-h-11">
        Зберегти налаштування
      </Button>
    </form>
  );
}
