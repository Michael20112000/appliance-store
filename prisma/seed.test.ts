import "dotenv/config";
import { describe, expect, it } from "vitest";
import { prisma } from "../src/lib/db";

describe("seed data", () => {
  it("has 8 categories", async () => {
    const count = await prisma.category.count();
    expect(count).toBe(8);
  });
});
