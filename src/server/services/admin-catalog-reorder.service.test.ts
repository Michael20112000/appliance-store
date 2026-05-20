import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
import { reorderCategories } from "./admin-catalog.service";

vi.mock("@/lib/db", () => ({
  prisma: {
    category: {
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("reorderCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("assigns sortOrder 1..n based on orderedIds array position", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([]);
    await reorderCategories(["a", "b", "c"]);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    const calls = vi.mocked(prisma.$transaction).mock.calls[0][0];
    expect(Array.isArray(calls)).toBe(true);
    expect(calls).toHaveLength(3);
  });

  it("placing B before A assigns B sortOrder 1 and A sortOrder 2", async () => {
    vi.mocked(prisma.category.update)
      .mockResolvedValueOnce({ id: "b", sortOrder: 1 } as never)
      .mockResolvedValueOnce({ id: "a", sortOrder: 2 } as never);
    vi.mocked(prisma.$transaction).mockImplementation(async (ops: unknown) => {
      if (Array.isArray(ops)) return Promise.all(ops);
      return (ops as (p: typeof prisma) => Promise<unknown>)(prisma);
    });
    await reorderCategories(["b", "a"]);
    expect(prisma.category.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ where: { id: "b" }, data: { sortOrder: 1 } })
    );
    expect(prisma.category.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ where: { id: "a" }, data: { sortOrder: 2 } })
    );
  });
});
