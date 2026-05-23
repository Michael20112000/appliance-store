"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

const linkClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-sm font-medium hover:bg-muted";

export type StorefrontAuthSession = {
  user: { name: string; email: string };
} | null;

type StorefrontAuthLinksProps = {
  session: StorefrontAuthSession;
};

export function StorefrontAuthLinks({ session }: StorefrontAuthLinksProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  if (session?.user) {
    return (
      <div className="flex items-center gap-1">
        <Link href="/kabinet" className={linkClass}>
          Кабінет
        </Link>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11"
          disabled={isPending}
          onClick={async () => {
            setIsPending(true);
            await authClient.signOut();
            router.push("/");
            router.refresh();
          }}
        >
          {isPending ? "Виходимо..." : "Вийти"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <Link href="/uviity" className={linkClass}>
        Увійти
      </Link>
      <Link
        href="/reiestratsiia"
        className={`${linkClass} bg-primary text-primary-foreground hover:bg-primary/90`}
      >
        Реєстрація
      </Link>
    </div>
  );
}
