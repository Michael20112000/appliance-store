"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { OptimizedImage } from "@/components/media/optimized-image";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type GalleryImage = {
  cloudinaryPublicId: string;
  alt: string | null;
  sortOrder: number;
};

type ProductGalleryProps = {
  images: GalleryImage[];
  title: string;
  brand: string;
};

function resolveAlt(image: GalleryImage, title: string, brand: string): string {
  return (image.alt ?? `${title} — ${brand}, б/у, Львів`).slice(0, 120);
}

export function ProductGallery({ images, title, brand }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogApi, setDialogApi] = useState<CarouselApi>();
  const [dialogIndex, setDialogIndex] = useState(0);

  const total = sorted.length;
  const hasMultiple = total > 1;
  const safeIndex = total > 0 ? Math.min(selectedIndex, total - 1) : 0;
  const current = sorted[safeIndex];

  const openDialog = useCallback(() => {
    if (!current) return;
    setDialogIndex(safeIndex);
    setDialogOpen(true);
  }, [current, safeIndex]);

  useEffect(() => {
    if (!dialogOpen || !dialogApi) return;
    if (dialogApi.selectedScrollSnap() === dialogIndex) return;
    dialogApi.scrollTo(dialogIndex, false);
  }, [dialogOpen, dialogApi, dialogIndex]);

  useEffect(() => {
    if (!dialogApi) return;
    const onSelect = () => {
      setDialogIndex(dialogApi.selectedScrollSnap());
    };
    onSelect();
    dialogApi.on("select", onSelect);
    return () => {
      dialogApi.off("select", onSelect);
    };
  }, [dialogApi]);

  if (!current) {
    return <GalleryPlaceholder />;
  }

  const slideLabel = `${dialogIndex + 1}/${total}`;

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={openDialog}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={`Відкрити галерею: ${title}`}
      >
        <OptimizedImage
          src={current.cloudinaryPublicId}
          alt={resolveAlt(current, title, brand)}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </button>

      {hasMultiple ? (
        <Carousel
          opts={{ align: "start", containScroll: "trimSnaps" }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {sorted.map((image, index) => (
              <CarouselItem
                key={`${image.cloudinaryPublicId}-${index}`}
                className="basis-1/3 pl-2"
              >
                <button
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    "relative aspect-[4/3] w-full overflow-hidden rounded-md border-2",
                    safeIndex === index ? "border-primary" : "border-transparent",
                  )}
                  aria-label={`Фото ${index + 1} з ${total}`}
                  aria-current={safeIndex === index ? "true" : undefined}
                >
                  <OptimizedImage
                    src={image.cloudinaryPublicId}
                    alt={resolveAlt(image, title, brand)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 16vw"
                  />
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          {total > 3 ? (
            <>
              <CarouselPrevious className="left-0 translate-x-0" />
              <CarouselNext className="right-0 translate-x-0" />
            </>
          ) : null}
        </Carousel>
      ) : null}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedIndex(dialogIndex);
          }
        }}
      >
        <DialogContent
          className="max-w-3xl border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-4xl"
          showCloseButton
        >
          <DialogTitle className="sr-only">Галерея: {title}</DialogTitle>
          <div className="relative overflow-hidden rounded-xl bg-background p-2 ring-1 ring-border">
            <Carousel
              setApi={setDialogApi}
              opts={{
                loop: hasMultiple,
                startIndex: dialogIndex,
                duration: 25,
                dragFree: false,
                skipSnaps: false,
                containScroll: false,
              }}
              className="w-full"
            >
              <CarouselContent>
                {sorted.map((image, index) => (
                  <CarouselItem key={`dialog-${image.cloudinaryPublicId}-${index}`}>
                    <DialogSlideFrame>
                      <OptimizedImage
                        src={image.cloudinaryPublicId}
                        alt={resolveAlt(image, title, brand)}
                        fill
                        className="object-contain"
                        sizes="90vw"
                      />
                    </DialogSlideFrame>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {hasMultiple ? (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              ) : null}
            </Carousel>
            <p
              className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white"
              aria-live="polite"
            >
              {slideLabel}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GalleryPlaceholder() {
  return (
    <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-muted text-muted-foreground">
      Без фото
    </div>
  );
}

function DialogSlideFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative aspect-[4/3] w-full bg-muted">{children}</div>
  );
}
