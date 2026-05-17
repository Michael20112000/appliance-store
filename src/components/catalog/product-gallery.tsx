"use client";

import { useState } from "react";
import { OptimizedImage } from "@/components/media/optimized-image";
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

export function ProductGallery({ images, title, brand }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const [selected, setSelected] = useState(0);
  const current = sorted[selected] ?? sorted[0];

  if (!current) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-muted text-muted-foreground">
        Без фото
      </div>
    );
  }

  const defaultAlt = `${title} — ${brand}, б/у, Львів`.slice(0, 120);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
        <OptimizedImage
          src={current.cloudinaryPublicId}
          alt={current.alt ?? defaultAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {sorted.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((image, index) => (
            <button
              key={`${image.cloudinaryPublicId}-${index}`}
              type="button"
              onClick={() => setSelected(index)}
              className={cn(
                "relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2",
                selected === index ? "border-primary" : "border-transparent",
              )}
              aria-label={`Фото ${index + 1} з ${sorted.length}`}
            >
              <OptimizedImage
                src={image.cloudinaryPublicId}
                alt={image.alt ?? defaultAlt}
                fill
                className="object-cover"
                sizes="56px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
