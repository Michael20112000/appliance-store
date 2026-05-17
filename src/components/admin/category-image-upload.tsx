"use client";

import { useCallback, useState, useTransition } from "react";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";
import { updateCategoryImageAction } from "@/server/actions/admin/category.actions";
import { categoryImageAlt } from "@/lib/catalog/category-image-alt";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

function isUploadWidgetConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  );
}

type CategoryImageUploadProps = {
  categoryId: string;
  categoryName: string;
  initialImagePublicId: string | null;
};

function extractUploadInfo(result: CloudinaryUploadWidgetResults) {
  const info = result.info;
  if (!info || typeof info === "string") {
    return null;
  }
  return {
    publicId: info.public_id,
  };
}

export function CategoryImageUpload({
  categoryId,
  categoryName,
  initialImagePublicId,
}: CategoryImageUploadProps) {
  const autoAlt = categoryImageAlt(categoryName);
  const [imagePublicId, setImagePublicId] = useState<string | null>(
    initialImagePublicId,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const persistImage = useCallback(
    (next: { imagePublicId: string | null }) => {
      const previousPublicId = imagePublicId;
      startTransition(async () => {
        setError(null);
        const result = await updateCategoryImageAction({
          categoryId,
          imagePublicId: next.imagePublicId,
          imageAlt: next.imagePublicId ? autoAlt : null,
        });
        if (result && !result.ok) {
          setError("Не вдалося зберегти зображення. Спробуйте ще раз.");
          setImagePublicId(previousPublicId);
          return;
        }
        setImagePublicId(next.imagePublicId);
      });
    },
    [categoryId, autoAlt, imagePublicId],
  );

  const handleUploadSuccess = (result: CloudinaryUploadWidgetResults) => {
    const uploaded = extractUploadInfo(result);
    if (!uploaded) return;

    setImagePublicId(uploaded.publicId);
    persistImage({ imagePublicId: uploaded.publicId });
  };

  const handleRemove = () => {
    if (!window.confirm("Прибрати зображення категорії з головної?")) {
      return;
    }
    setImagePublicId(null);
    persistImage({ imagePublicId: null });
  };

  if (!isUploadWidgetConfigured()) {
    return (
      <Alert>
        <AlertDescription>
          Завантаження фото недоступне: додайте NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME і
          NEXT_PUBLIC_CLOUDINARY_API_KEY (той самий ключ що CLOUDINARY_API_KEY) плюс
          CLOUDINARY_API_SECRET на сервері.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <section className="flex flex-col gap-4" aria-busy={isPending}>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {!imagePublicId ? (
        <p className="text-sm text-muted-foreground">
          Ще немає зображення для головної. Завантажте фото категорії.
        </p>
      ) : (
        <div className="relative aspect-[4/3] w-40 overflow-hidden rounded-md border border-border">
          <CldImage
            src={imagePublicId}
            alt={autoAlt}
            width={160}
            height={120}
            crop="fill"
            className="size-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <CldUploadWidget
          signatureEndpoint="/api/upload/sign"
          options={{
            multiple: false,
            maxFiles: 1,
            sources: ["local"],
          }}
          onSuccess={handleUploadSuccess}
        >
          {({ open }) => (
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => open()}
            >
              {isPending ? "Збереження…" : "Завантажити зображення"}
            </Button>
          )}
        </CldUploadWidget>
        {imagePublicId ? (
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={handleRemove}
          >
            {isPending ? "Збереження…" : "Прибрати фото"}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
