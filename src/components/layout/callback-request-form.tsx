"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitCallbackRequestAction } from "@/server/actions/callback.actions";
import {
  callbackRequestSchema,
  type CallbackRequestInput,
} from "@/server/validators/callback";
import { cn } from "@/lib/utils";

type CallbackRequestFormProps = {
  idPrefix?: string;
  compact?: boolean;
  className?: string;
};

export function CallbackRequestForm({
  idPrefix = "footer",
  compact = false,
  className,
}: CallbackRequestFormProps) {
  const fieldId = `${idPrefix}-callback-phone`;
  const form = useForm<CallbackRequestInput>({
    resolver: zodResolver(callbackRequestSchema),
    defaultValues: { phone: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await submitCallbackRequestAction(values);
    if (result.ok) {
      toast.success("Дякуємо, передзвонимо");
      form.reset({ phone: "" });
      return;
    }
    form.setError("phone", {
      message:
        result.message ??
        "Не вдалося надіслати запит. Спробуйте ще раз.",
    });
  });

  const phoneError = form.formState.errors.phone?.message;

  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <h2
          className={cn(
            "font-semibold text-foreground",
            compact ? "text-sm" : "text-base",
          )}
        >
          Вкажіть свій номер — ми передзвонимо
        </h2>
        <Label htmlFor={fieldId} className="sr-only">
          Номер телефону
        </Label>
        <Input
          id={fieldId}
          type="tel"
          placeholder="0978734712"
          inputMode="numeric"
          maxLength={15}
          aria-invalid={Boolean(phoneError)}
          className={phoneError ? "border-destructive" : undefined}
          {...form.register("phone", {
            onChange: (event) => {
              const digits = event.target.value.replace(/\D/g, "");
              form.setValue("phone", digits);
            },
          })}
        />
        {phoneError ? (
          <p className="text-sm text-destructive" role="alert">
            {phoneError}
          </p>
        ) : null}
      </div>
      <Button type="submit" className="min-h-11 w-full sm:w-auto">
        Передзвоніть мені
      </Button>
    </form>
  );
}
