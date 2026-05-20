"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OptimizedImage } from "@/components/media/optimized-image";
import type { PublicProductCardImage } from "@/types/catalog";

const ROTATION_MS = 3000;

type ProductCardImageStackProps = {
  images: PublicProductCardImage[];
  alt: string;
  sizes?: string;
};

export function ProductCardImageStack({
  images,
  alt,
  sizes = "(max-width: 768px) 50vw, 25vw",
}: ProductCardImageStackProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [canRotate, setCanRotate] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const mdQuery = window.matchMedia("(min-width: 768px)");
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      setCanRotate(
        images.length > 1 &&
          mdQuery.matches &&
          hoverQuery.matches &&
          !motionQuery.matches,
      );
    };

    update();
    mdQuery.addEventListener("change", update);
    hoverQuery.addEventListener("change", update);
    motionQuery.addEventListener("change", update);
    return () => {
      mdQuery.removeEventListener("change", update);
      hoverQuery.removeEventListener("change", update);
      motionQuery.removeEventListener("change", update);
    };
  }, [images.length]);

  const clearRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!canRotate) return;
    setActiveIndex(0);
    clearRotation();
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, ROTATION_MS);
  }, [canRotate, clearRotation, images.length]);

  const handleMouseLeave = useCallback(() => {
    clearRotation();
    setActiveIndex(0);
  }, [clearRotation]);

  useEffect(() => () => clearRotation(), [clearRotation]);

  if (images.length === 1) {
    return (
      <OptimizedImage
        src={images[0].cloudinaryPublicId}
        alt={alt}
        fill
        className="object-cover"
        sizes={sizes}
      />
    );
  }

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={canRotate ? handleMouseEnter : undefined}
      onMouseLeave={canRotate ? handleMouseLeave : undefined}
    >
      {images.map((img, index) => (
        <OptimizedImage
          key={`${img.cloudinaryPublicId}-${index}`}
          src={img.cloudinaryPublicId}
          alt={alt}
          fill
          className={`object-cover transition-opacity duration-300 ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
          sizes={sizes}
        />
      ))}
    </div>
  );
}
