import { WishlistToggleButton } from "@/components/wishlist/wishlist-toggle-button";
import { OptimizedImage } from "@/components/media/optimized-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WishlistLineDto } from "@/types/wishlist";

type WishlistUnavailableCardProps = {
  line: WishlistLineDto;
  hasSession: boolean;
};

export function WishlistUnavailableCard({
  line,
  hasSession,
}: WishlistUnavailableCardProps) {
  const imageAlt = line.image?.alt ?? `${line.title} — ${line.brand}`;

  return (
    <Card className="h-full overflow-hidden opacity-55">
      <div className="relative aspect-[4/3] min-h-48 w-full bg-muted">
        {line.image ? (
          <OptimizedImage
            src={line.image.cloudinaryPublicId}
            alt={imageAlt}
            fill
            className="object-cover grayscale"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Без фото
          </div>
        )}
      </div>
      <CardHeader className="space-y-1 p-4">
        <CardTitle className="line-clamp-2 text-base font-medium leading-snug">
          {line.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{line.brand}</p>
        <p className="text-sm text-muted-foreground">Товар більше недоступний</p>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <WishlistToggleButton
          productId={line.productId}
          productTitle={line.title}
          hasSession={hasSession}
          initialInWishlist
          variant="inline"
        />
      </CardContent>
    </Card>
  );
}
