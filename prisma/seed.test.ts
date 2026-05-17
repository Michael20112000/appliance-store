import "dotenv/config";
import { describe, expect, it } from "vitest";
import { prisma } from "../src/lib/db";

describe("seed data", () => {
  it("has 8 categories", async () => {
    const count = await prisma.category.count();
    expect(count).toBe(8);
  });

  it("has at least 24 AVAILABLE products", async () => {
    const count = await prisma.product.count({
      where: { status: "AVAILABLE" },
    });
    expect(count).toBeGreaterThanOrEqual(24);
  });

  it("has SOLD products for CAT-07 tests", async () => {
    const count = await prisma.product.count({ where: { status: "SOLD" } });
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
