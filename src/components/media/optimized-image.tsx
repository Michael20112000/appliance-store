"use client";

import { CldImage, type CldImageProps } from "next-cloudinary";

type OptimizedImageProps = Omit<CldImageProps, "format" | "quality"> & {
  alt: string;
};

export function OptimizedImage({
  alt,
  sizes,
  ...props
}: OptimizedImageProps) {
  return (
    <CldImage
      alt={alt}
      format="auto"
      quality="auto"
      sizes={sizes ?? "(max-width: 1024px) 100vw, 50vw"}
      {...props}
    />
  );
}
