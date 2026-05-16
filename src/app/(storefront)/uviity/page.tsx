import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Вхід",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold">Вхід</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Немає облікового запису?{" "}
        <Link href="/reiestratsiia" className="text-primary underline">
          Зареєструватися
        </Link>
      </p>
      <div className="mt-8">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
