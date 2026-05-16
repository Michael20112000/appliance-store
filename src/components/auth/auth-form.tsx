"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("Введіть коректний email"),
  password: z.string().min(1, "Введіть пароль"),
});

const registerSchema = loginSchema
  .extend({
    name: z.string().min(2, "Вкажіть імʼя"),
    password: z.string().min(8, "Пароль має містити щонайменше 8 символів"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Паролі не збігаються",
    path: ["confirmPassword"],
  });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const schema = mode === "login" ? loginSchema : registerSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "login"
        ? { email: "", password: "" }
        : { email: "", password: "", confirmPassword: "", name: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    if (mode === "login") {
      const loginValues = values as LoginValues;
      const result = await authClient.signIn.email({
        email: loginValues.email,
        password: loginValues.password,
      });
      if (result.error) {
        setError("Невірний email або пароль. Спробуйте ще раз.");
        return;
      }
    } else {
      const registerValues = values as RegisterValues;
      const result = await authClient.signUp.email({
        email: registerValues.email,
        password: registerValues.password,
        name: registerValues.name,
      });
      if (result.error) {
        setError("Не вдалося створити обліковий запис. Перевірте дані.");
        return;
      }
    }

    router.push("/kabinet");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {mode === "register" ? (
        <div className="space-y-2">
          <Label htmlFor="name">Імʼя</Label>
          <Input id="name" {...form.register("name")} autoComplete="name" />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...form.register("email")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          {...form.register("password")}
        />
        {mode === "register" ? (
          <p className="text-xs text-muted-foreground">Мінімум 8 символів</p>
        ) : null}
      </div>

      {mode === "register" ? (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Підтвердіть пароль</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...form.register("confirmPassword")}
          />
        </div>
      ) : null}

      <Button type="submit" className="min-h-11 w-full">
        {mode === "login" ? "Увійти" : "Створити обліковий запис"}
      </Button>
    </form>
  );
}
