import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { sanitizeCallbackUrl } from "@/lib/callback-url";

export const metadata: Metadata = {
  title: "Реєстрація",
};

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function RegisterPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const redirectTo = sanitizeCallbackUrl(params.callbackUrl, "/kabinet");
  const loginHref = params.callbackUrl
    ? `/uviity?callbackUrl=${encodeURIComponent(redirectTo)}`
    : "/uviity";

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold">Реєстрація</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Вже маєте обліковий запис?{" "}
        <Link href={loginHref} className="text-primary underline">
          Увійти
        </Link>
      </p>
      <div className="mt-8">
        <AuthForm mode="register" redirectTo={redirectTo} />
      </div>
    </div>
  );
}
