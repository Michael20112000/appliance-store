import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { sanitizeCallbackUrl } from "@/lib/callback-url";

export const metadata: Metadata = {
  title: "Вхід",
};

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const redirectTo = sanitizeCallbackUrl(params.callbackUrl, "/kabinet");
  const registerHref = params.callbackUrl
    ? `/reiestratsiia?callbackUrl=${encodeURIComponent(redirectTo)}`
    : "/reiestratsiia";

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold">Вхід</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Немає облікового запису?{" "}
        <Link href={registerHref} className="text-primary underline">
          Зареєструватися
        </Link>
      </p>
      <div className="mt-8">
        <AuthForm mode="login" redirectTo={redirectTo} />
      </div>
    </div>
  );
}
