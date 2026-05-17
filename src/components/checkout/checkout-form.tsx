"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutInput } from "@/server/validators/order";
import { submitCheckoutAction } from "@/server/actions/order.actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CheckoutFormProps = {
  defaultName?: string;
};

export function CheckoutForm({ defaultName = "" }: CheckoutFormProps) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: defaultName,
      customerPhone: "",
      deliveryType: "PICKUP",
      deliveryAddress: "",
      notes: "",
    },
  });

  const deliveryType = form.watch("deliveryType");

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    const result = await submitCheckoutAction(values);
    if (result?.error === "CART_EMPTY") {
      setError("Кошик порожній. Додайте товари перед оформленням.");
    } else if (result?.error === "PRODUCT_UNAVAILABLE") {
      setError(
        "Деякі товари вже недоступні. Перевірте кошик і спробуйте знову.",
      );
    } else if (result?.error) {
      setError("Не вдалося оформити замовлення. Спробуйте ще раз.");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="customerName">Ім'я та прізвище</Label>
        <Input id="customerName" {...form.register("customerName")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerPhone">Телефон</Label>
        <Input
          id="customerPhone"
          type="tel"
          placeholder="+380501234567"
          {...form.register("customerPhone")}
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Спосіб отримання</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            value="PICKUP"
            {...form.register("deliveryType")}
          />
          Самовивіз (м. Львів)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            value="LVIV_DELIVERY"
            {...form.register("deliveryType")}
          />
          Доставка по Львову
        </label>
      </fieldset>

      {deliveryType === "LVIV_DELIVERY" ? (
        <div className="space-y-2">
          <Label htmlFor="deliveryAddress">Адреса доставки</Label>
          <textarea
            id="deliveryAddress"
            rows={3}
            className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...form.register("deliveryAddress")}
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="notes">Коментар (необов'язково)</Label>
        <textarea
          id="notes"
          rows={3}
          className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          {...form.register("notes")}
        />
      </div>

      <Button type="submit" className="min-h-11 w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Оформлюємо…" : "Підтвердити замовлення"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Оплата при отриманні. Онлайн-оплата на сайті не потрібна.
      </p>
    </form>
  );
}
