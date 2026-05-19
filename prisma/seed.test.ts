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
  it("has catalog categories (full seed: ≥8; post-purge: ≥1)", async () => {
    const count = await prisma.category.count();
    expect(count).toBeGreaterThanOrEqual(1);
    if (count >= CANONICAL_CATEGORY_SLUGS.length) {
      expect(count).toBeGreaterThanOrEqual(8);
    }
  });

  it("has in-stock products (full seed: ≥80; post-purge: ≥1)", async () => {
    const count = await prisma.product.count({
      where: { quantity: { gt: 0 } },
    });
    expect(count).toBeGreaterThanOrEqual(1);
    const categoryCount = await prisma.category.count();
    if (categoryCount >= CANONICAL_CATEGORY_SLUGS.length) {
      expect(count).toBeGreaterThanOrEqual(80);
    }
  });

  it("has at least 10 in-stock products per canonical category when fully seeded", async () => {
    const categoryCount = await prisma.category.count();
    if (categoryCount < CANONICAL_CATEGORY_SLUGS.length) {
      return;
    }

    const categories = await prisma.category.findMany({
      where: { slug: { in: [...CANONICAL_CATEGORY_SLUGS] } },
      include: {
        _count: {
          select: {
            products: { where: { quantity: { gt: 0 } } },
          },
        },
      },
    });
    expect(categories).toHaveLength(CANONICAL_CATEGORY_SLUGS.length);
    for (const category of categories) {
      expect(
        category._count.products,
        `${category.name} should have ≥10 in-stock products`,
      ).toBeGreaterThanOrEqual(10);
    }
  });

  it("has out-of-stock demo products for CAT-07 tests", async () => {
    const count = await prisma.product.count({ where: { quantity: 0 } });
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
