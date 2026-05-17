import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CategoryNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <h1 className="text-2xl font-semibold">Категорію не знайдено</h1>
      <p className="mt-2 text-muted-foreground">
        Можливо, посилання застаріло. Поверніться на головну.
      </p>
      <Link href="/" className={cn(buttonVariants(), "mt-6 inline-flex")}>
        На головну
      </Link>
    </div>
  );
}
