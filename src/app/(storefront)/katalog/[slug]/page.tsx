import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryStubPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });

  if (!category) {
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Badge variant="secondary">Незабаром</Badge>
      <h1 className="mt-4 text-3xl font-semibold">{category.name}</h1>
      <p className="mt-4 text-muted-foreground">
        Каталог товарів у цій категорії зʼявиться незабаром. Поки що перегляньте
        інші категорії на головній.
      </p>
      <Link
        href="/#kategorii"
        className={cn(buttonVariants(), "mt-8 inline-flex")}
      >
        Усі категорії
      </Link>
    </div>
  );
}
