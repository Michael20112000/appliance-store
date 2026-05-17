import Link from "next/link";
import type { ProductChatContext } from "@/components/chat/chat-provider";

type ProductContextBannerProps = {
  context: ProductChatContext;
};

export function ProductContextBanner({ context }: ProductContextBannerProps) {
  if (!context.productTitle) return null;

  return (
    <div className="mx-3 mt-2 rounded-md border bg-card px-3 py-2 text-sm">
      <p className="line-clamp-2">Питання про: {context.productTitle}</p>
      {context.productSlug ? (
        <Link
          href={`/tovar/${context.productSlug}`}
          className="mt-1 inline-block text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Переглянути товар
        </Link>
      ) : null}
    </div>
  );
}
