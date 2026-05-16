import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/media/optimized-image";
import { HERO_PUBLIC_ID } from "@/lib/demo-assets";

export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 md:items-center">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Б/у побутова техніка у Львові
        </h1>
        <p className="text-lg text-muted-foreground">
          Перевірений асортимент з прозорими цінами. Обирайте категорію та
          оформлюйте замовлення без зайвих кроків.
        </p>
        <Link
          href="/#kategorii"
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Переглянути категорії
        </Link>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-muted">
        <OptimizedImage
          src={HERO_PUBLIC_ID}
          alt="Приклад б/у техніки у нашому магазині у Львові"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
    </section>
  );
}
