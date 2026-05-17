"use client";

import { useCallback, useState, useTransition } from "react";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";
import { updateCategoryImageAction } from "@/server/actions/admin/category.actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function isUploadWidgetConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  );
}

type CategoryImageUploadProps = {
  categoryId: string;
  initialImagePublicId: string | null;
  initialImageAlt: string | null;
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
  initialImagePublicId,
  initialImageAlt,
}: CategoryImageUploadProps) {
  const [imagePublicId, setImagePublicId] = useState<string | null>(
    initialImagePublicId,
  );
  const [alt, setAlt] = useState(initialImageAlt ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const persistImage = useCallback(
    (next: { imagePublicId: string | null; imageAlt?: string | null }) => {
      startTransition(async () => {
        setError(null);
        const result = await updateCategoryImageAction({
          categoryId,
          imagePublicId: next.imagePublicId,
          imageAlt: next.imageAlt ?? (alt.trim() || null),
        });
        if (result && !result.ok) {
          setError("Не вдалося зберегти зображення. Спробуйте ще раз.");
          return;
        }
        setImagePublicId(next.imagePublicId);
        if (next.imageAlt !== undefined) {
          setAlt(next.imageAlt ?? "");
        }
      });
    },
    [categoryId, alt],
  );

  const handleUploadSuccess = (result: CloudinaryUploadWidgetResults) => {
    const uploaded = extractUploadInfo(result);
    if (!uploaded) return;

    setImagePublicId(uploaded.publicId);
    persistImage({
      imagePublicId: uploaded.publicId,
      imageAlt: alt.trim() || null,
    });
  };

  const handleRemove = () => {
    if (!window.confirm("Прибрати зображення категорії з головної?")) {
      return;
    }
    setImagePublicId(null);
    persistImage({ imagePublicId: null, imageAlt: null });
    setAlt("");
  };

  const saveAlt = () => {
    if (!imagePublicId) return;
    persistImage({
      imagePublicId,
      imageAlt: alt.trim() || null,
    });
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
    <section className="space-y-4" aria-busy={isPending}>
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
            alt={alt.trim() || "Зображення категорії"}
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

      <div className="max-w-md space-y-1">
        <Label htmlFor="category-image-alt">Опис для доступності (alt)</Label>
        <Input
          id="category-image-alt"
          value={alt}
          onChange={(event) => setAlt(event.target.value)}
          onBlur={saveAlt}
          placeholder="Наприклад: Холодильники — б/у техніка, Львів"
          maxLength={500}
          disabled={isPending || !imagePublicId}
        />
      </div>
    </section>
  );
}
