import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Особистий кабінет",
};

export default async function CabinetPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/uviity");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold">Особистий кабінет</h1>
      <p className="mt-4 text-lg">Вітаємо, {session.user.name}</p>
      <p className="mt-2 text-muted-foreground">
        Тут зʼявляться ваші замовлення та чат з магазином — у наступних фазах
        проєкту.
      </p>
      <Link
        href="/"
        className={cn(buttonVariants({ variant: "outline" }), "mt-8 inline-flex")}
      >
        На головну
      </Link>
    </div>
  );
}
