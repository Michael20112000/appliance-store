import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CATEGORY_HAS_PRODUCTS,
  CATEGORY_NOT_FOUND,
} from "@/server/services/admin-catalog.service";

vi.mock("@/lib/permissions", () => ({
  requireAdmin: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/server/services/admin-catalog.service", () => ({
  CATEGORY_HAS_PRODUCTS: "CATEGORY_HAS_PRODUCTS",
  CATEGORY_NOT_FOUND: "CATEGORY_NOT_FOUND",
  deleteCategory: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { deleteCategory } from "@/server/services/admin-catalog.service";
import { deleteCategoryFromListAction } from "./category.actions";

describe("deleteCategoryFromListAction", () => {
  beforeEach(() => {
    vi.mocked(deleteCategory).mockReset();
    vi.mocked(deleteCategory).mockResolvedValue(undefined);
  });

  it("returns ok true without redirect on success", async () => {
    const result = await deleteCategoryFromListAction("cat-valid-id");

    expect(result).toEqual({ ok: true });
    expect(deleteCategory).toHaveBeenCalledWith("cat-valid-id");
  });

  it("returns CATEGORY_HAS_PRODUCTS when service blocks delete", async () => {
    vi.mocked(deleteCategory).mockRejectedValue(
      new Error(CATEGORY_HAS_PRODUCTS),
    );

    const result = await deleteCategoryFromListAction("cat-with-products");

    expect(result).toEqual({ ok: false, error: "CATEGORY_HAS_PRODUCTS" });
  });

  it("returns CATEGORY_NOT_FOUND when category missing", async () => {
    vi.mocked(deleteCategory).mockRejectedValue(
      new Error(CATEGORY_NOT_FOUND),
    );

    const result = await deleteCategoryFromListAction("cat-missing");

    expect(result).toEqual({ ok: false, error: "CATEGORY_NOT_FOUND" });
  });

  it("returns UNKNOWN for invalid id", async () => {
    const result = await deleteCategoryFromListAction("");

    expect(result).toEqual({ ok: false, error: "UNKNOWN" });
    expect(deleteCategory).not.toHaveBeenCalled();
  });
});
