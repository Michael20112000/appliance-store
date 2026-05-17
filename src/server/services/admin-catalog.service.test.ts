import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
import {
  appendSlugSuffix,
  assertCategoryDeletable,
  CATEGORY_HAS_PRODUCTS,
  CATEGORY_NOT_FOUND,
  slugFromName,
  updateCategoryImage,
} from "./admin-catalog.service";

vi.mock("@/lib/db", () => ({
  prisma: {
    category: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("slugFromName", () => {
  it("transliterates Ukrainian name to latin slug", () => {
    expect(slugFromName("Холодильники")).toBe("kholodylnyky");
  });
});

describe("appendSlugSuffix", () => {
  it("returns base slug for suffix 1", () => {
    expect(appendSlugSuffix("kholodylnyky", 1)).toBe("kholodylnyky");
  });

  it("appends numeric suffix for collisions", () => {
    expect(appendSlugSuffix("kholodylnyky", 2)).toBe("kholodylnyky-2");
  });
});

describe("assertCategoryDeletable", () => {
  it("throws CATEGORY_HAS_PRODUCTS when product count > 0", () => {
    expect(() => assertCategoryDeletable(1)).toThrow(CATEGORY_HAS_PRODUCTS);
  });

  it("allows delete when no products", () => {
    expect(() => assertCategoryDeletable(0)).not.toThrow();
  });
});

describe("updateCategoryImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates imagePublicId when category exists", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValueOnce({ id: "cat-1" });
    vi.mocked(prisma.category.update).mockResolvedValueOnce({
      id: "cat-1",
      slug: "kholodylnyky",
    });

    const result = await updateCategoryImage({
      categoryId: "cat-1",
      imagePublicId: "categories/kholodylnyky",
      imageAlt: "Холодильники",
    });

    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: "cat-1" },
      data: {
        imagePublicId: "categories/kholodylnyky",
        imageAlt: "Холодильники",
      },
      select: { id: true, slug: true },
    });
    expect(result).toEqual({ id: "cat-1", slug: "kholodylnyky" });
  });

  it("sets null on clear", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValueOnce({ id: "cat-1" });
    vi.mocked(prisma.category.update).mockResolvedValueOnce({
      id: "cat-1",
      slug: "kholodylnyky",
    });

    await updateCategoryImage({
      categoryId: "cat-1",
      imagePublicId: null,
      imageAlt: null,
    });

    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: "cat-1" },
      data: { imagePublicId: null, imageAlt: null },
      select: { id: true, slug: true },
    });
  });

  it("throws CATEGORY_NOT_FOUND for unknown id", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValueOnce(null);

    await expect(
      updateCategoryImage({
        categoryId: "missing",
        imagePublicId: "categories/x",
      }),
    ).rejects.toThrow(CATEGORY_NOT_FOUND);

    expect(prisma.category.update).not.toHaveBeenCalled();
  });
});
