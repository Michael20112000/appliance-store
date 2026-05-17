"use client";

import { useCallback, useState, useTransition } from "react";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";
import { saveProductImagesAction } from "@/server/actions/admin/product.actions";
import type { ProductImageInput } from "@/server/validators/admin-product";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_IMAGES = 8;

type ExistingImage = {
  cloudinaryPublicId: string;
  alt: string | null;
  sortOrder: number;
  width: number | null;
  height: number | null;
};

type ProductImageUploadProps = {
  productId: string;
  initialImages: ExistingImage[];
};

function extractUploadInfo(result: CloudinaryUploadWidgetResults) {
  const info = result.info;
  if (!info || typeof info === "string") {
    return null;
  }
  return {
    cloudinaryPublicId: info.public_id,
    width: info.width,
    height: info.height,
  };
}

export function ProductImageUpload({
  productId,
  initialImages,
}: ProductImageUploadProps) {
  const [images, setImages] = useState<ProductImageInput[]>(
    initialImages.map((image) => ({
      cloudinaryPublicId: image.cloudinaryPublicId,
      alt: image.alt ?? "",
      sortOrder: image.sortOrder,
      width: image.width ?? undefined,
      height: image.height ?? undefined,
    })),
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const persistImages = useCallback(
    (nextImages: ProductImageInput[]) => {
      startTransition(async () => {
        setError(null);
        const result = await saveProductImagesAction({
          productId,
          images: nextImages.map((image, index) => ({
            ...image,
            sortOrder: index,
          })),
        });
        if (result && !result.ok) {
          setError("Не вдалося зберегти фото. Спробуйте ще раз.");
        }
      });
    },
    [productId],
  );

  const handleUploadSuccess = (result: CloudinaryUploadWidgetResults) => {
    const uploaded = extractUploadInfo(result);
    if (!uploaded) return;

    setImages((current) => {
      if (current.length >= MAX_IMAGES) {
        return current;
      }
      const next = [
        ...current,
        {
          cloudinaryPublicId: uploaded.cloudinaryPublicId,
          alt: "",
          sortOrder: current.length,
          width: uploaded.width,
          height: uploaded.height,
        },
      ];
      queueMicrotask(() => persistImages(next));
      return next;
    });
  };

  const removeImage = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    setImages(next);
    persistImages(next);
  };

  const updateAlt = (index: number, alt: string) => {
    const next = images.map((image, i) =>
      i === index ? { ...image, alt } : image,
    );
    setImages(next);
  };

  const saveAlts = () => {
    persistImages(images);
  };

  return (
    <div className="space-y-4">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <CldUploadWidget
          signatureEndpoint="/api/upload/sign"
          options={{
            multiple: true,
            maxFiles: MAX_IMAGES - images.length,
            sources: ["local"],
          }}
          onSuccess={handleUploadSuccess}
        >
          {({ open }) => (
            <Button
              type="button"
              variant="outline"
              disabled={isPending || images.length >= MAX_IMAGES}
              onClick={() => open()}
            >
              Додати фото
            </Button>
          )}
        </CldUploadWidget>
        <p className="text-xs text-muted-foreground">
          {images.length}/{MAX_IMAGES} фото
        </p>
      </div>

      {images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image, index) => (
            <li key={`${image.cloudinaryPublicId}-${index}`} className="space-y-2">
              <div className="relative size-[72px] overflow-hidden rounded-md border border-border">
                <CldImage
                  src={image.cloudinaryPublicId}
                  alt={image.alt?.trim() || "Фото товару"}
                  width={72}
                  height={72}
                  crop="fill"
                  className="size-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute right-0.5 top-0.5 h-6 min-w-6 px-1 text-[10px]"
                  disabled={isPending}
                  onClick={() => removeImage(index)}
                >
                  ×
                </Button>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Alt</Label>
                <Input
                  value={image.alt ?? ""}
                  onChange={(event) => updateAlt(index, event.target.value)}
                  onBlur={saveAlts}
                  placeholder="Опис зображення"
                  className="h-8 text-xs"
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Додайте до {MAX_IMAGES} фото через кнопку вище.
        </p>
      )}
    </div>
  );
}
