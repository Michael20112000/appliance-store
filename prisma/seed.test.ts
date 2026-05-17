import "dotenv/config";
import { describe, expect, it } from "vitest";
import { prisma } from "../src/lib/db";

const CANONICAL_CATEGORY_SLUGS = [
  "pralni-mashyny",
  "kholodylnyky",
  "morozylni-kamery",
  "televizory",
  "plyty",
  "dukhovi-shafy",
  "varylni-poverkhni",
  "susharky-dlya-odyahu",
] as const;

describe("seed data", () => {
  it("has at least 8 catalog categories", async () => {
    const count = await prisma.category.count();
    expect(count).toBeGreaterThanOrEqual(8);
  });

  it("has at least 80 AVAILABLE products", async () => {
    const count = await prisma.product.count({
      where: { status: "AVAILABLE" },
    });
    expect(count).toBeGreaterThanOrEqual(80);
  });

  it("has at least 10 AVAILABLE products per canonical category", async () => {
    const categories = await prisma.category.findMany({
      where: { slug: { in: [...CANONICAL_CATEGORY_SLUGS] } },
      include: {
        _count: {
          select: {
            products: { where: { status: "AVAILABLE" } },
          },
        },
      },
    });
    expect(categories).toHaveLength(CANONICAL_CATEGORY_SLUGS.length);
    for (const category of categories) {
      expect(
        category._count.products,
        `${category.name} should have ≥10 available products`,
      ).toBeGreaterThanOrEqual(10);
    }
  });

  it("has SOLD products for CAT-07 tests", async () => {
    const count = await prisma.product.count({ where: { status: "SOLD" } });
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
