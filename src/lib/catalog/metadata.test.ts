import { describe, expect, it, vi } from "vitest";
import {
  catalogListingMetadata,
  hasActiveCatalogFilters,
  productMetadata,
} from "./metadata";

vi.mock("@/lib/env", () => ({
  getEnv: () => ({ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "demo" }),
}));

describe("hasActiveCatalogFilters", () => {
  it("returns true when brand filter is set", () => {
    expect(
      hasActiveCatalogFilters({
        q: "",
        brend: "Samsung",
        cinaVid: null,
        cinaDo: null,
        stan: [],
      }),
    ).toBe(true);
  });

  it("returns true when q is non-empty", () => {
    expect(
      hasActiveCatalogFilters({
        q: "пральна",
        brend: null,
        cinaVid: null,
        cinaDo: null,
        stan: [],
      }),
    ).toBe(true);
  });

  it("returns false when no filters", () => {
    expect(
      hasActiveCatalogFilters({
        q: "",
        brend: null,
        cinaVid: null,
        cinaDo: null,
        stan: [],
      }),
    ).toBe(false);
  });
});

describe("catalogListingMetadata", () => {
  it("sets noindex when filters active", () => {
    const meta = catalogListingMetadata({ hasActiveFilters: true });
    expect(meta.robots).toEqual({ index: false, follow: true });
  });
});

describe("productMetadata", () => {
  const baseProduct = {
    id: "1",
    title: "Пральна машина Samsung",
    slug: "pralna-samsung",
    brand: "Samsung",
    price: 1250000,
    condition: "GOOD" as const,
    category: {
      id: "cat-pralni",
      name: "Пральні машини",
      slug: "pralni-mashyny",
    },
    previewImages: [],
    image: null,
    description: "A".repeat(200),
    images: [
      {
        cloudinaryPublicId: "sample",
        alt: "Фото",
        sortOrder: 0,
      },
    ],
  };

  it("truncates description to 155 chars", () => {
    const meta = productMetadata(baseProduct);
    expect(meta.description).toHaveLength(155);
  });

  it("includes openGraph image from first product image", () => {
    const meta = productMetadata(baseProduct);
    expect(meta.openGraph?.images?.[0]).toMatchObject({
      url: "https://res.cloudinary.com/demo/image/upload/sample",
    });
  });
});
